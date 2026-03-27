const nodemailer = require("nodemailer");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const params = new URLSearchParams(event.body);
  const name = params.get("name") || "";
  const email = params.get("email") || "";
  const telefon = params.get("telefon") || "";
  const unternehmen = params.get("unternehmen") || "";
  const nachricht = params.get("nachricht") || params.get("message") || "";
  const service = params.get("service") || params.get("ziel") || "";
  const umsatz = params.get("umsatz") || "";
  const budget = params.get("budget") || "";
  const source = params.get("_source") || "Website";

  const transporter = nodemailer.createTransport({
    host: "smtp.ionos.de",
    port: 587,
    secure: false,
    auth: {
      user: "shero@marken-ding.com",
      pass: process.env.SMTP_PASS,
    },
  });

  const budgetLabels = {
    "unter-2500": "Unter CHF 2'500",
    "2500-4000": "CHF 2'500 – 4'000",
    "4000-7000": "CHF 4'000 – 7'000",
    "ueber-7000": "Über CHF 7'000",
  };

  const umsatzLabels = {
    "unter-5k": "Unter CHF 5'000",
    "5k-15k": "CHF 5'000 – 15'000",
    "15k-50k": "CHF 15'000 – 50'000",
    "ueber-50k": "Über CHF 50'000",
  };

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fafafa; padding: 2rem; border-radius: 12px;">
      <h2 style="color: #B08D3E; margin-bottom: 1.5rem;">Neue Anfrage über ${source}</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 0.6rem 0; color: #888; width: 140px;">Name</td><td style="padding: 0.6rem 0;">${name}</td></tr>
        <tr><td style="padding: 0.6rem 0; color: #888;">E-Mail</td><td style="padding: 0.6rem 0;"><a href="mailto:${email}" style="color: #B08D3E;">${email}</a></td></tr>
        <tr><td style="padding: 0.6rem 0; color: #888;">Telefon</td><td style="padding: 0.6rem 0;"><a href="tel:${telefon}" style="color: #B08D3E;">${telefon}</a></td></tr>
        ${unternehmen ? `<tr><td style="padding: 0.6rem 0; color: #888;">Unternehmen</td><td style="padding: 0.6rem 0;">${unternehmen}</td></tr>` : ""}
        ${umsatz ? `<tr><td style="padding: 0.6rem 0; color: #888;">Monatsumsatz</td><td style="padding: 0.6rem 0;">${umsatzLabels[umsatz] || umsatz}</td></tr>` : ""}
        ${budget ? `<tr><td style="padding: 0.6rem 0; color: #888;">Marketingbudget</td><td style="padding: 0.6rem 0;">${budgetLabels[budget] || budget}</td></tr>` : ""}
        ${service ? `<tr><td style="padding: 0.6rem 0; color: #888;">Interesse</td><td style="padding: 0.6rem 0;">${service}</td></tr>` : ""}
        ${nachricht ? `<tr><td style="padding: 0.6rem 0; color: #888; vertical-align: top;">Nachricht</td><td style="padding: 0.6rem 0;">${nachricht}</td></tr>` : ""}
      </table>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: '"MarkenDing Website" <shero@marken-ding.com>',
      to: "shero@marken-ding.com",
      subject: `Neue Anfrage von ${name} (${source})`,
      html,
      replyTo: email,
    });

    const redirectUrl = source === "Landingpage"
      ? "https://www.marken-ding.com/pages/danke.html"
      : "https://www.marken-ding.com/pages/danke.html";

    return {
      statusCode: 302,
      headers: { Location: redirectUrl },
      body: "",
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "Fehler beim Senden." };
  }
};
