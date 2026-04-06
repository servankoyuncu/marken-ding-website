const nodemailer = require("nodemailer");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const params = new URLSearchParams(event.body);

  // Blocked IPs
  const blockedIPs = [
    "80.94.95.202",
  ];
  const requestIP = event.headers["x-forwarded-for"]?.split(",")[0].trim() || event.headers["client-ip"] || "";
  if (blockedIPs.includes(requestIP)) {
    return { statusCode: 200, body: "OK" };
  }

  // Cloudflare Turnstile verification
  const turnstileToken = params.get("cf-turnstile-response") || "";
  if (!turnstileToken) {
    return { statusCode: 200, body: "OK" };
  }
  try {
    const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET,
        response: turnstileToken,
        remoteip: requestIP,
      }),
    });
    const verifyData = await verifyRes.json();
    if (!verifyData.success) {
      return { statusCode: 200, body: "OK" };
    }
  } catch (_) {
    return { statusCode: 200, body: "OK" };
  }

  // Honeypot: bots fill hidden fields, humans don't see them
  const honeypot = params.get("website") || "";
  if (honeypot) {
    return { statusCode: 200, body: "OK" };
  }

  // Timing check: reject if _t is missing (direct POST), too fast (bot), or too old (replay)
  const timestamp = parseInt(params.get("_t") || "0", 10);
  const age = Date.now() - timestamp;
  if (!timestamp || age < 3000 || age > 7200000) {
    return { statusCode: 200, body: "OK" };
  }

  const name = params.get("name") || "";
  const email = params.get("email") || "";
  const telefon = params.get("telefon") || "";
  const unternehmen = params.get("unternehmen") || "";
  const nachricht = params.get("nachricht") || params.get("message") || "";
  const service = params.get("service") || params.get("ziel") || "";
  const umsatz = params.get("umsatz") || "";
  const budget = params.get("budget") || "";
  const source = params.get("_source") || "Website";
  const ip = event.headers["x-forwarded-for"]?.split(",")[0].trim() || event.headers["client-ip"] || "unbekannt";
  const userAgent = event.headers["user-agent"] || "";
  const referrer = event.headers["referer"] || event.headers["referrer"] || "Direkt";

  // Simple browser & OS detection
  const browser =
    /Edg\//.test(userAgent) ? "Edge" :
    /OPR\/|Opera/.test(userAgent) ? "Opera" :
    /Chrome\//.test(userAgent) ? "Chrome" :
    /Firefox\//.test(userAgent) ? "Firefox" :
    /Safari\//.test(userAgent) ? "Safari" : "Unbekannt";

  const os =
    /iPhone/.test(userAgent) ? "iPhone (iOS)" :
    /iPad/.test(userAgent) ? "iPad (iOS)" :
    /Android/.test(userAgent) ? "Android" :
    /Windows/.test(userAgent) ? "Windows" :
    /Mac OS X/.test(userAgent) ? "macOS" :
    /Linux/.test(userAgent) ? "Linux" : "Unbekannt";

  // Date & time (Swiss format)
  const now = new Date();
  const datetime = now.toLocaleString("de-CH", { timeZone: "Europe/Zurich", dateStyle: "full", timeStyle: "short" });

  // IP Geolocation
  let geoInfo = "–";
  try {
    const geoRes = await fetch(`https://ipapi.co/${ip}/json/`);
    const geo = await geoRes.json();
    if (geo.city) geoInfo = `${geo.city}, ${geo.region}, ${geo.country_name}`;
  } catch (_) { /* ignore */ }

  const transporter = nodemailer.createTransport({
    host: "smtp.ionos.de",
    port: 465,
    secure: true,
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
      <hr style="border: none; border-top: 1px solid #222; margin: 1.5rem 0;">
      <p style="color: #555; font-size: 0.75rem; margin: 0 0 0.5rem;">Technische Details</p>
      <table style="width: 100%; border-collapse: collapse; font-size: 0.8rem; color: #555;">
        <tr><td style="padding: 0.4rem 0; width: 140px;">Datum & Uhrzeit</td><td style="padding: 0.4rem 0;">${datetime}</td></tr>
        <tr><td style="padding: 0.4rem 0;">Standort</td><td style="padding: 0.4rem 0;">${geoInfo}</td></tr>
        <tr><td style="padding: 0.4rem 0;">IP-Adresse</td><td style="padding: 0.4rem 0;">${ip}</td></tr>
        <tr><td style="padding: 0.4rem 0;">Browser</td><td style="padding: 0.4rem 0;">${browser}</td></tr>
        <tr><td style="padding: 0.4rem 0;">Gerät / OS</td><td style="padding: 0.4rem 0;">${os}</td></tr>
        <tr><td style="padding: 0.4rem 0;">Referrer</td><td style="padding: 0.4rem 0;">${referrer}</td></tr>
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
    return { statusCode: 500, body: `Fehler: ${err.message}` };
  }
};
