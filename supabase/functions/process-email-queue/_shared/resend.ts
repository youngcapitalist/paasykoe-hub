export interface SendEmailParams {
  to: string
  from: string
  subject: string
  html: string
  text?: string
  idempotencyKey?: string
  unsubscribeUrl?: string
}

export class EmailAPIError extends Error {
  status: number
  retryAfterSeconds: number | null
  constructor(message: string, status: number, retryAfterSeconds: number | null) {
    super(message)
    this.name = 'EmailAPIError'
    this.status = status
    this.retryAfterSeconds = retryAfterSeconds
  }
}

const RESEND_ENDPOINT = 'https://api.resend.com/emails'

export async function sendEmail(
  params: SendEmailParams,
  apiKey: string,
): Promise<{ id: string }> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  }
  if (params.idempotencyKey) headers['Idempotency-Key'] = params.idempotencyKey

  const body: Record<string, unknown> = {
    from: params.from,
    to: [params.to],
    subject: params.subject,
    html: params.html,
  }
  if (params.text) body.text = params.text
  if (params.unsubscribeUrl) {
    body.headers = {
      'List-Unsubscribe': `<${params.unsubscribeUrl}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    }
  }

  const resp = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  if (!resp.ok) {
    let message = `Resend API error: ${resp.status}`
    try {
      const errBody = await resp.json()
      if (errBody?.message) message = errBody.message
    } catch {}
    const retryAfterHeader = resp.headers.get('retry-after')
    const retryAfterSeconds = retryAfterHeader ? parseInt(retryAfterHeader, 10) : null
    throw new EmailAPIError(message, resp.status, retryAfterSeconds)
  }

  const data = await resp.json()
  return { id: data?.id }
}
