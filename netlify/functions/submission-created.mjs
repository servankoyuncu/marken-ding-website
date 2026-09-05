const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const SERVICE_LABELS = {
  'social-media': 'Social Media Management',
  content: 'Content Creation & Reels',
  strategie: 'Strategie & Beratung',
  branding: 'Grafik Design & Branding',
  komplett: 'Komplettpaket',
  sonstiges: 'Sonstiges',
};

export default async (req) => {
  let payload;
  try {
    ({ payload } = await req.json());
  } catch {
    return new Response('invalid event', { status: 200 });
  }

  const data = payload?.data ?? payload ?? {};
  const asString = (field) => (typeof data[field] === 'string' ? data[field].trim() : '');
  const email = asString('email');
  if (!email) return new Response('no email', { status: 200 });

  const name = asString('name');
  const message = asString('message');
  const serviceKey = asString('service');
  const service = SERVICE_LABELS[serviceKey] || serviceKey;
  const greeting = name ? `Hallo ${escapeHtml(name)},` : 'Hallo,';

  const messageBlock = message
    ? `<div style="border-left:3px solid #b08d57;padding:4px 0 4px 16px;margin:24px 0;color:#555555;">${escapeHtml(message).replace(/\n/g, '<br>')}</div>`
    : '';
  const serviceLine = service ? `<p style="color:#555555;">Angefragt: <strong>${escapeHtml(service)}</strong></p>` : '';

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'MarkenDing <kontakt@marken-ding.com>',
      to: [email],
      subject: 'Vielen Dank für deine Nachricht — MarkenDing',
      html: `
        <div style="margin:0;padding:32px 16px;background:#0a0a0a;font-family:Arial,Helvetica,sans-serif;">
          <div style="max-width:560px;margin:0 auto;background:#141414;border:1px solid #2a2a2a;color:#f5f5f5;padding:40px;">
            <p style="margin:0 0 24px;font-size:22px;font-weight:800;letter-spacing:-0.5px;text-transform:uppercase;">Marken<span style="color:#b08d57;">Ding</span></p>
            <p style="font-size:16px;line-height:1.6;">${greeting}</p>
            <p style="font-size:16px;line-height:1.6;">vielen Dank für deine Nachricht auf <a href="https://marken-ding.com" style="color:#b08d57;">marken-ding.com</a>. Wir haben deine Anfrage erhalten und melden uns <strong>innert 24 Stunden</strong> bei dir.</p>
            ${serviceLine}
            ${messageBlock}
            <p style="font-size:16px;line-height:1.6;">Liebe Grüsse<br><strong>Dein MarkenDing-Team</strong></p>
            <hr style="border:none;border-top:1px solid #2a2a2a;margin:32px 0;">
            <p style="font-size:12px;color:#888888;">MarkenDing — Social Media Agentur Zürich<br>
            <a href="mailto:contact@marken-ding.com" style="color:#888888;">contact@marken-ding.com</a> · <a href="https://marken-ding.com" style="color:#888888;">marken-ding.com</a></p>
          </div>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    console.error('Resend error:', res.status, await res.text());
  }

  return new Response('ok', { status: 200 });
};
