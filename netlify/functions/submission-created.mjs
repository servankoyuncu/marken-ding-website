const TEAM_EMAIL = 'contact@marken-ding.com';

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

const layout = (body) => `
  <div style="margin:0;padding:32px 16px;background:#0a0a0a;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#141414;border:1px solid #2a2a2a;color:#f5f5f5;padding:40px;">
      <p style="margin:0 0 24px;font-size:22px;font-weight:800;letter-spacing:-0.5px;text-transform:uppercase;">Marken<span style="color:#b08d57;">Ding</span></p>
      ${body}
      <hr style="border:none;border-top:1px solid #2a2a2a;margin:32px 0;">
      <p style="font-size:12px;color:#888888;">MarkenDing — Social Media Agentur Zürich<br>
      <a href="mailto:contact@marken-ding.com" style="color:#888888;">contact@marken-ding.com</a> · <a href="https://marken-ding.com" style="color:#888888;">marken-ding.com</a></p>
    </div>
  </div>
`;

const p = (html) => `<p style="font-size:16px;line-height:1.6;">${html}</p>`;

const sendEmail = async ({ to, subject, html, replyTo }) => {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'MarkenDing <kontakt@marken-ding.com>',
      to: [to],
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });

  if (!res.ok) {
    console.error('Resend error:', res.status, await res.text());
  }
};

const confirmationEmail = ({ email, name, message, service }) => {
  const greeting = name ? `Hallo ${escapeHtml(name)},` : 'Hallo,';
  const messageBlock = message
    ? `<div style="border-left:3px solid #b08d57;padding:4px 0 4px 16px;margin:24px 0;color:#555555;">${escapeHtml(message).replace(/\n/g, '<br>')}</div>`
    : '';
  const serviceLine = service ? `<p style="color:#555555;">Angefragt: <strong>${escapeHtml(service)}</strong></p>` : '';

  return sendEmail({
    to: email,
    subject: 'Vielen Dank für deine Nachricht — MarkenDing',
    html: layout(`
      ${p(greeting)}
      ${p('vielen Dank für deine Nachricht auf <a href="https://marken-ding.com" style="color:#b08d57;">marken-ding.com</a>. Wir haben deine Anfrage erhalten und melden uns <strong>innert 24 Stunden</strong> bei dir.')}
      ${serviceLine}
      ${messageBlock}
      ${p('Liebe Grüsse<br><strong>Dein MarkenDing-Team</strong>')}
    `),
  });
};

const detailsTable = (rows) => `
  <table style="width:100%;border-collapse:collapse;margin:24px 0;font-size:15px;">
    ${rows
      .filter(([, value]) => value)
      .map(([label, value]) => `<tr><td style="padding:8px 12px 8px 0;color:#888888;vertical-align:top;white-space:nowrap;">${label}</td><td style="padding:8px 0;color:#f5f5f5;">${escapeHtml(value).replace(/\n/g, '<br>')}</td></tr>`)
      .join('')}
  </table>
`;

const handleReferralLead = async (field) => {
  const email = field('email');
  const name = field('name');
  const referrer = field('referrer') || field('ref');

  await confirmationEmail({ email, name, message: field('message') });
  await sendEmail({
    to: TEAM_EMAIL,
    replyTo: email,
    subject: `Neue Empfehlung${referrer ? ` von ${referrer}` : ''}: ${field('company') || name}`,
    html: layout(`
      ${p('<strong>Neue Anfrage über den Empfehlungslink.</strong>')}
      ${detailsTable([
        ['Empfohlen von', referrer],
        ['Empfehler-Code', field('ref')],
        ['Name', name],
        ['Unternehmen', field('company')],
        ['Telefon', field('phone')],
        ['E-Mail', email],
        ['Nachricht', field('message')],
      ])}
      ${p('<span style="color:#888888;">Provision: 10% der ersten Monatszahlung, falls ein Vertrag zustande kommt.</span>')}
    `),
  });
};

const handlePartnerSignup = async (field) => {
  const email = field('email');
  const firstname = field('firstname');
  const fullName = `${firstname} ${field('lastname')}`.trim();
  const link = field('link');

  await sendEmail({
    to: email,
    subject: 'Dein persönlicher Empfehlungslink — MarkenDing',
    html: layout(`
      ${p(firstname ? `Hallo ${escapeHtml(firstname)},` : 'Hallo,')}
      ${p('schön, dass du MarkenDing weiterempfiehlst! Hier ist dein persönlicher Link:')}
      <p style="margin:24px 0;padding:16px;border:1px solid #b08d57;background:#1c1a17;font-size:15px;word-break:break-all;"><a href="${escapeHtml(link)}" style="color:#b08d57;">${escapeHtml(link)}</a></p>
      ${p('Leite ihn an Unternehmer weiter, die auf Social Media mehr erreichen wollen. Wird daraus ein Kunde, erhältst du <strong>10% seiner ersten Monatszahlung</strong>, sobald diese bei uns eingegangen ist.')}
      ${p('Liebe Grüsse<br><strong>Dein MarkenDing-Team</strong>')}
    `),
  });
  await sendEmail({
    to: TEAM_EMAIL,
    replyTo: email,
    subject: `Neuer Empfehlungspartner: ${fullName}`,
    html: layout(`
      ${p('<strong>Neue Anmeldung im Empfehlungsprogramm.</strong>')}
      ${detailsTable([
        ['Name', fullName],
        ['E-Mail', email],
        ['Telefon', field('phone')],
        ['Code', field('code')],
        ['Link', link],
      ])}
    `),
  });
};

export default async (req) => {
  let payload;
  try {
    ({ payload } = await req.json());
  } catch {
    return new Response('invalid event', { status: 200 });
  }

  const data = payload?.data ?? payload ?? {};
  const field = (key) => (typeof data[key] === 'string' ? data[key].trim() : '');
  if (!field('email')) return new Response('no email', { status: 200 });

  const formName = payload?.form_name || field('form-name');

  if (formName === 'empfehlung') {
    await handleReferralLead(field);
  } else if (formName === 'partner') {
    await handlePartnerSignup(field);
  } else {
    const serviceKey = field('service');
    await confirmationEmail({
      email: field('email'),
      name: field('name'),
      message: field('message'),
      service: SERVICE_LABELS[serviceKey] || serviceKey,
    });
  }

  return new Response('ok', { status: 200 });
};
