# MarkenDing Website — Deployment Anleitung

## Projektstruktur

```
marken-ding/
├── index.html              ← Homepage
├── css/
│   └── styles.css          ← Alle Styles (global)
├── assets/
│   └── images/
│       └── logo.png        ← Euer Logo
├── pages/
│   ├── about.html          ← Über uns
│   ├── angebot.html        ← Angebot (Platzhalter)
│   ├── blog.html           ← Blog (Platzhalter)
│   ├── kontakt.html        ← Kontakt mit Formular
│   ├── impressum.html      ← Impressum (Platzhalter)
│   └── datenschutz.html    ← Datenschutz (Platzhalter)
├── netlify.toml            ← Netlify Konfiguration
├── robots.txt              ← SEO
└── sitemap.xml             ← SEO Sitemap
```

---

## Schritt 1: GitHub Repository erstellen

1. Gehe auf **github.com** und erstelle ein neues Repository:
   - Name: `marken-ding-website`
   - Visibility: **Private** (oder Public, wie du willst)
   - Kein README, kein .gitignore — wir pushen direkt

2. Öffne **VS Code** (oder Terminal) und navigiere zum entpackten Ordner:

```bash
cd marken-ding
git init
git add .
git commit -m "Initial commit: MarkenDing Website Redesign"
git branch -M main
git remote add origin https://github.com/DEIN-USERNAME/marken-ding-website.git
git push -u origin main
```

---

## Schritt 2: Netlify verbinden

1. Gehe auf **app.netlify.com** und logge dich ein (du hast ja bereits einen Account)
2. Klicke **"Add new site"** → **"Import an existing project"**
3. Wähle **GitHub** und autorisiere den Zugriff
4. Wähle das Repository **marken-ding-website**
5. Build-Einstellungen:
   - **Build command:** (leer lassen — kein Build nötig)
   - **Publish directory:** `.` (Punkt — das Root-Verzeichnis)
6. Klicke **"Deploy site"**

Netlify gibt dir sofort eine URL wie `random-name-123.netlify.app` — die Seite ist jetzt live!

---

## Schritt 3: Custom Domain einrichten

1. In Netlify: **Site settings** → **Domain management** → **Add custom domain**
2. Gib ein: `marken-ding.com` (oder `www.marken-ding.com`)
3. Netlify zeigt dir DNS-Einstellungen an. Du hast zwei Optionen:

### Option A: Netlify DNS (empfohlen)
- Wechsle die Nameserver bei deinem Domain-Registrar zu den Netlify Nameservern
- Netlify übernimmt dann alles inkl. SSL

### Option B: Externer DNS
- Erstelle einen **CNAME Record** bei deinem DNS-Provider:
  - Name: `www`
  - Value: `dein-site-name.netlify.app`
- Für die Root-Domain (`marken-ding.com`): einen **A Record** auf Netlifys Load Balancer IP

4. SSL wird automatisch von Netlify bereitgestellt (Let's Encrypt) — dauert ein paar Minuten

---

## Schritt 4: Kontaktformular aktivieren

Das Formular in `pages/kontakt.html` ist bereits an **Netlify Forms** gebunden (`data-netlify="true"`). Es fehlen nur noch die E-Mail-Einstellungen:

### 4a: Benachrichtigung an euch (bei jeder Einsendung)

1. Netlify: **Site settings → Forms → Form notifications**
2. **Add notification → Email notification** → Empfänger: `contact@marken-ding.com`

### 4b: Bestätigungs-Mail an Absender:innen (Auto-Reply)

Die Bestätigungs-Mail verschickt eine Netlify Function (`netlify/functions/submission-created.mjs`) über [Resend](https://resend.com) (kostenlos bis 100 Mails/Tag).

1. Account auf **resend.com** erstellen (kostenlos)
2. **Domain hinzufügen:** `marken-ding.com` → Resend zeigt DNS-Einträge (DKIM/SPF) an, die du beim DNS-Provider (Netlify DNS oder dein Registrar) einträgst
3. **API Key erstellen** (API Keys → Create)
4. In Netlify: **Site settings → Environment variables** → Variable `RESEND_API_KEY` mit dem Key anlegen
5. Neu deployen (git push) — fertig

Hinweis: Ohne verifizierte Domain kann Resend nur Test-Mails an die Account-Inhaber:innen-Adresse schicken. Die Absender-Adresse der Bestätigungs-Mail (`kontakt@marken-ding.com`) steht in der Function und kann dort bei Bedarf angepasst werden.

---

## Schritt 5: Kundenlogos lokal speichern (optional aber empfohlen)

Aktuell laden die Kundenlogos von Webflows CDN. Falls du von Webflow komplett weg willst:

1. Lade die Logo-Dateien herunter
2. Speichere sie in `assets/images/clients/`
3. Ändere die `src`-Pfade in `index.html`

---

## Schritt 6: OG Image erstellen

Für Social Media Shares brauchst du ein OG-Image (1200×630px):

1. Erstelle ein Bild mit eurem Logo, dem Text "MarkenDing — Social Media Agentur Zürich" auf schwarzem Hintergrund mit Gold-Akzenten
2. Speichere als `assets/images/og-image.png`
3. Die Meta-Tags in `index.html` verweisen bereits darauf

---

## Änderungen machen

Ab jetzt gilt für jede Änderung:

```bash
# Datei bearbeiten in VS Code
# Dann:
git add .
git commit -m "Beschreibung der Änderung"
git push
```

Netlify deployed automatisch nach jedem Push — innert Sekunden ist die Änderung live.

---

## Noch offen / Nächste Schritte

- [ ] Platzhalter-Seiten (Angebot, Blog, Impressum, Datenschutz) mit Inhalt füllen
- [x] Kontaktformular-Service einrichten (Netlify Forms + Resend Auto-Reply, siehe Schritt 4)
- [ ] OG-Image erstellen
- [ ] Kundenlogos lokal speichern
- [ ] Google Analytics oder Plausible einbinden (optional)
- [ ] Cookie-Banner für DSGVO/DSG (falls Analytics genutzt wird)
