/** Tarjouslaatikko ja bulletit drip-sähköposteihin. */

export function savingsEur(payload) {
  const price = payload?.priceEur;
  const list = payload?.listPriceEur;
  if (typeof price !== "number" || typeof list !== "number" || list <= price) return null;
  return list - price;
}

export function offerBoxHtml(payload, checkoutUrl) {
  const price = payload?.priceEur;
  const list = payload?.listPriceEur;
  const savings = savingsEur(payload);
  const title = payload?.personalTitle || "Henkilökohtainen pakettisi";
  const field = payload?.recommendedField || payload?.preferredField;

  if (!price) return "";

  return `
    <div style="margin:0 0 20px;padding:16px;border:2px solid #D4AF37;border-radius:12px;background:#FFFBEB">
      <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#92400e">Vain sinulle</p>
      <p style="margin:0 0 8px;font-weight:700;color:#0A2540">${title}</p>
      ${field ? `<p style="margin:0 0 12px;font-size:13px;color:#64748b">${field}</p>` : ""}
      <p style="margin:0;font-size:32px;font-weight:800;color:#0A2540">${price} €
        ${list && list > price ? `<span style="font-size:15px;font-weight:600;color:#94a3b8;text-decoration:line-through;margin-left:8px">${list} €</span>` : ""}
      </p>
      ${savings ? `<p style="margin:8px 0 0;font-size:14px;font-weight:700;color:#059669">Säästät ${savings} € verrattuna listahintaan</p>` : ""}
    </div>`;
}

export function bulletsHtml(items) {
  if (!items?.length) return "";
  const lis = items.map((b) => `<li style="margin:0 0 8px">${b}</li>`).join("");
  return `<ul style="margin:0 0 20px;padding-left:20px;line-height:1.55;color:#475569;font-size:14px">${lis}</ul>`;
}

export function urgencyHtml(text) {
  if (!text) return "";
  return `<p style="margin:0 0 16px;padding:12px 14px;border-radius:8px;background:#FEF2F2;font-size:13px;line-height:1.5;color:#991B1B">${text}</p>`;
}
