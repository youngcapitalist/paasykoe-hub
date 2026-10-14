import { createClient } from 'npm:@supabase/supabase-js@2'
import { sendEmail } from './_shared/resend.ts'
import { normalizeFromAddress } from './_shared/normalize-from.ts'

const MAX_RETRIES = 5
const DEFAULT_BATCH_SIZE = 10
const DEFAULT_SEND_DELAY_MS = 200
const DEFAULT_AUTH_TTL_MINUTES = 15
const DEFAULT_TRANSACTIONAL_TTL_MINUTES = 60
const MAX_BATCHES_PER_INVOKE = 30
const SEND_TZ = 'Europe/Helsinki'
const SEND_HOUR_START = 8
const SEND_HOUR_END = 20

function isWithinSendWindow(d = new Date()): boolean {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: SEND_TZ,
    hour: '2-digit',
    hour12: false,
  }).formatToParts(d)
  let hour = Number(parts.find((p) => p.type === 'hour')?.value ?? '0')
  if (hour === 24) hour = 0
  return hour >= SEND_HOUR_START && hour < SEND_HOUR_END
}

function isRateLimited(error: unknown): boolean {
  if (error && typeof error === 'object' && 'status' in error) {
    return (error as { status: number }).status === 429
  }
  return error instanceof Error && error.message.includes('429')
}

function isForbidden(error: unknown): boolean {
  if (error && typeof error === 'object' && 'status' in error) {
    return (error as { status: number }).status === 403
  }
  return error instanceof Error && error.message.includes('403')
}

function isIdempotencyConflict(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error)
  return msg.toLowerCase().includes('idempotency key')
}

function getRetryAfterSeconds(error: unknown): number {
  if (error && typeof error === 'object' && 'retryAfterSeconds' in error) {
    return (error as { retryAfterSeconds: number | null }).retryAfterSeconds ?? 60
  }
  return 60
}

function parseJwtClaims(token: string): Record<string, unknown> | null {
  const parts = token.split('.')
  if (parts.length < 2) return null
  try {
    const payload = parts[1].replaceAll('-', '+').replaceAll('_', '/').padEnd(Math.ceil(parts[1].length / 4) * 4, '=')
    return JSON.parse(atob(payload)) as Record<string, unknown>
  } catch {
    return null
  }
}

function isAuthorizedService(token: string, serviceKey: string): boolean {
  if (!token) return false
  if (serviceKey && token === serviceKey) return true
  const claims = parseJwtClaims(token)
  return claims?.role === 'service_role'
}

function resolveIdempotencyKey(payload: Record<string, unknown>, msgId: number, attempt = 0): string {
  const messageId = typeof payload.message_id === 'string' ? payload.message_id : ''
  const base = messageId || `msg-${msgId}`
  return attempt > 0 ? `${base}-r${attempt}` : base
}

async function moveToDlq(
  supabase: any,
  queue: string,
  msg: { msg_id: number; message: Record<string, unknown> },
  reason: string,
): Promise<void> {
  const payload = msg.message
  await supabase.from('email_send_log').insert({
    message_id: payload.message_id,
    template_name: (payload.label || queue) as string,
    recipient_email: payload.to,
    status: 'dlq',
    error_message: reason,
  })
  const { error } = await supabase.rpc('move_to_dlq', {
    source_queue: queue,
    dlq_name: `${queue}_dlq`,
    message_id: msg.msg_id,
    payload,
  })
  if (error) console.error('Failed to move message to DLQ', { queue, msg_id: msg.msg_id, reason, error })
}

Deno.serve(async (req) => {
  const apiKey = Deno.env.get('RESEND_API_KEY')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!apiKey || !supabaseUrl || !supabaseServiceKey) {
    console.error('Missing required environment variables')
    return new Response(JSON.stringify({ error: 'Server configuration error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const token = authHeader.slice('Bearer '.length).trim()
  if (!isAuthorizedService(token, supabaseServiceKey)) {
    console.error('Forbidden: service role auth failed', {
      token_len: token.length,
      key_len: supabaseServiceKey.length,
      direct_match: token === supabaseServiceKey,
      jwt_role: parseJwtClaims(token)?.role ?? null,
    })
    return new Response(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const supabase: any = createClient(supabaseUrl, supabaseServiceKey)

  const { data: state } = await supabase
    .from('email_send_state')
    .select('retry_after_until, batch_size, send_delay_ms, auth_email_ttl_minutes, transactional_email_ttl_minutes')
    .maybeSingle()

  if (state?.retry_after_until && new Date(state.retry_after_until) > new Date()) {
    return new Response(JSON.stringify({ skipped: true, reason: 'rate_limited' }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const batchSize = state?.batch_size ?? DEFAULT_BATCH_SIZE
  const sendDelayMs = state?.send_delay_ms ?? DEFAULT_SEND_DELAY_MS
  const ttlMinutes: Record<string, number> = {
    auth_emails: state?.auth_email_ttl_minutes ?? DEFAULT_AUTH_TTL_MINUTES,
    transactional_emails: state?.transactional_email_ttl_minutes ?? DEFAULT_TRANSACTIONAL_TTL_MINUTES,
  }

  let totalProcessed = 0
  let totalExpired = 0
  let stopped: string | null = null
  const allowTransactional = isWithinSendWindow()
  if (!allowTransactional) {
    console.log('Outside Helsinki send window 08-20: processing auth_emails only')
  }

  for (let batch = 0; batch < MAX_BATCHES_PER_INVOKE && !stopped; batch++) {
    let batchHadWork = false

    for (const queue of ['auth_emails', 'transactional_emails']) {
      if (queue === 'transactional_emails' && !allowTransactional) continue

      const { data: messages, error: readError } = await supabase.rpc('read_email_batch', {
        queue_name: queue,
        batch_size: batchSize,
        vt: 30,
      })

      if (readError) {
        console.error('Failed to read email batch', { queue, error: readError })
        continue
      }
      if (!messages?.length) continue
      batchHadWork = true

      const messageIds = Array.from(
        new Set(
          messages
            .map((msg: any) =>
              msg?.message?.message_id && typeof msg.message.message_id === 'string'
                ? msg.message.message_id
                : null,
            )
            .filter((id: string | null): id is string => Boolean(id)),
        ),
      )
      const failedAttemptsByMessageId = new Map<string, number>()
      if (messageIds.length > 0) {
        const { data: failedRows, error: failedRowsError } = await supabase
          .from('email_send_log')
          .select('message_id')
          .in('message_id', messageIds)
          .eq('status', 'failed')

        if (failedRowsError) {
          console.error('Failed to load failed-attempt counters', { queue, error: failedRowsError })
        } else {
          for (const row of failedRows ?? []) {
            const messageId = row?.message_id
            if (typeof messageId !== 'string' || !messageId) continue
            failedAttemptsByMessageId.set(messageId, (failedAttemptsByMessageId.get(messageId) ?? 0) + 1)
          }
        }
      }

      for (let i = 0; i < messages.length; i++) {
        const msg = messages[i]
        const payload = msg.message
        const failedAttempts =
          payload?.message_id && typeof payload.message_id === 'string'
            ? (failedAttemptsByMessageId.get(payload.message_id) ?? 0)
            : 0

        if (payload.queued_at) {
          const ageMs = Date.now() - new Date(payload.queued_at).getTime()
          const maxAgeMs = ttlMinutes[queue] * 60 * 1000
          if (ageMs > maxAgeMs) {
            // Do not TTL-kill transactional mail overnight; wait for send window.
            if (queue === 'transactional_emails' && !allowTransactional) continue
            console.warn('Email expired (TTL exceeded)', {
              queue,
              msg_id: msg.msg_id,
              queued_at: payload.queued_at,
              ttl_minutes: ttlMinutes[queue],
            })
            await moveToDlq(supabase, queue, msg, `TTL exceeded (${ttlMinutes[queue]} minutes)`)
            totalExpired++
            continue
          }
        }

        if (failedAttempts >= MAX_RETRIES) {
          await moveToDlq(
            supabase,
            queue,
            msg,
            `Max retries (${MAX_RETRIES}) exceeded (attempted ${failedAttempts} times)`,
          )
          continue
        }

        if (payload.message_id) {
          const { data: alreadySent } = await supabase
            .from('email_send_log')
            .select('id')
            .eq('message_id', payload.message_id)
            .eq('status', 'sent')
            .maybeSingle()

          if (alreadySent) {
            const { error: dupDelError } = await supabase.rpc('delete_email', {
              queue_name: queue,
              message_id: msg.msg_id,
            })
            if (dupDelError) {
              console.error('Failed to delete duplicate message from queue', {
                queue,
                msg_id: msg.msg_id,
                error: dupDelError,
              })
            }
            continue
          }
        }

        try {
          const unsubscribeUrl = payload.unsubscribe_token
            ? `${supabaseUrl}/functions/v1/handle-email-unsubscribe?token=${payload.unsubscribe_token}`
            : undefined

          const idempotencyKey = resolveIdempotencyKey(payload, msg.msg_id, failedAttempts)
          const from = normalizeFromAddress(payload.from)

          try {
            await sendEmail(
              {
                to: payload.to,
                from,
                subject: payload.subject,
                html: payload.html,
                text: payload.text,
                idempotencyKey,
                unsubscribeUrl,
              },
              apiKey,
            )
          } catch (firstErr) {
            if (!isIdempotencyConflict(firstErr)) throw firstErr
            const retryKey = `${resolveIdempotencyKey(payload, msg.msg_id, 0)}-fix-${msg.msg_id}-${Date.now()}`
            await sendEmail(
              {
                to: payload.to,
                from,
                subject: payload.subject,
                html: payload.html,
                text: payload.text,
                idempotencyKey: retryKey,
                unsubscribeUrl,
              },
              apiKey,
            )
          }

          await supabase.from('email_send_log').insert({
            message_id: payload.message_id,
            template_name: payload.label || queue,
            recipient_email: payload.to,
            status: 'sent',
          })

          const { error: delError } = await supabase.rpc('delete_email', {
            queue_name: queue,
            message_id: msg.msg_id,
          })
          if (delError) {
            console.error('Failed to delete sent message from queue', {
              queue,
              msg_id: msg.msg_id,
              error: delError,
            })
          }
          totalProcessed++
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : String(error)
          console.error('Email send failed', {
            queue,
            msg_id: msg.msg_id,
            read_ct: msg.read_ct,
            failed_attempts: failedAttempts,
            error: errorMsg,
          })

          if (isRateLimited(error)) {
            await supabase.from('email_send_log').insert({
              message_id: payload.message_id,
              template_name: payload.label || queue,
              recipient_email: payload.to,
              status: 'rate_limited',
              error_message: errorMsg.slice(0, 1000),
            })

            const retryAfterSecs = getRetryAfterSeconds(error)
            await supabase
              .from('email_send_state')
              .update({
                retry_after_until: new Date(Date.now() + retryAfterSecs * 1000).toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq('id', 1)

            stopped = 'rate_limited'
            break
          }

          if (isForbidden(error)) {
            await moveToDlq(supabase, queue, msg, 'Emails disabled for this project')
            stopped = 'emails_disabled'
            break
          }

          await supabase.from('email_send_log').insert({
            message_id: payload.message_id,
            template_name: payload.label || queue,
            recipient_email: payload.to,
            status: 'failed',
            error_message: errorMsg.slice(0, 1000),
          })
          if (payload?.message_id && typeof payload.message_id === 'string') {
            failedAttemptsByMessageId.set(payload.message_id, failedAttempts + 1)
          }
        }

        if (i < messages.length - 1) {
          await new Promise((r) => setTimeout(r, sendDelayMs))
        }
      }

      if (stopped) break
    }

    if (!batchHadWork) break
  }

  return new Response(
    JSON.stringify({
      processed: totalProcessed,
      expired: totalExpired,
      stopped,
      transactional_paused: !allowTransactional,
    }),
    { headers: { 'Content-Type': 'application/json' } },
  )
})
