# NP-Kompass: Migration von Vercel auf eigenen Server

## Übersicht

Das Projekt nutzt **keine** Vercel-spezifischen Abhängigkeiten (`@vercel/*` Packages).
Verwendete Next.js-Features (ISR, `revalidatePath`, Middleware) funktionieren alle im Self-Hosting-Modus.

**Was sich ändert:**
- Hosting: Vercel → eigener Server (Docker + Reverse Proxy)
- Build/Deploy: Vercel CLI → Docker Build + Neustart
- Domain/SSL: Vercel → Caddy oder Nginx + Let's Encrypt

**Was gleich bleibt:**
- Supabase (bleibt Cloud-hosted)
- Codebase (keine Code-Änderungen nötig, außer `next.config.ts`)
- Telegram-Integration

---

## Schritt 1: Next.js für Standalone-Output konfigurieren

Die wichtigste Änderung: Next.js muss im `standalone`-Modus bauen, damit alle Dependencies in einem einzigen Ordner landen.

**`next.config.ts` anpassen:**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
```

---

## Schritt 2: Dockerfile erstellen

Erstelle eine `Dockerfile` im Projekt-Root:

```dockerfile
FROM node:22-alpine AS base

# --- Dependencies installieren ---
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# --- Build ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-Zeit Env-Variablen (NEXT_PUBLIC_* werden beim Build eingebettet)
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

RUN npm run build

# --- Production ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Standalone Output kopieren
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
```

---

## Schritt 3: Docker Compose einrichten

Erstelle eine `docker-compose.yml` im Projekt-Root:

```yaml
services:
  np-kompass:
    build:
      context: .
      args:
        NEXT_PUBLIC_SUPABASE_URL: ${NEXT_PUBLIC_SUPABASE_URL}
        NEXT_PUBLIC_SUPABASE_ANON_KEY: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}
    restart: unless-stopped
    ports:
      - "3000:3000"
    env_file:
      - .env.production
    environment:
      - HOSTNAME=0.0.0.0
```

---

## Schritt 4: Environment-Variablen

Erstelle `.env.production` auf dem Server (wird **nicht** ins Git committed):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://dein-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=dein-anon-key
SUPABASE_SERVICE_ROLE_KEY=dein-service-role-key

# App
ALLOWED_EMAILS=admin@example.com,user2@example.com

# Telegram (optional)
TELEGRAM_BOT_TOKEN=dein-bot-token
TELEGRAM_CHAT_ID=dein-chat-id
```

**Wichtig:** `NEXT_PUBLIC_*` Variablen werden beim `docker build` eingebettet (als Build-Args). Die anderen werden zur Laufzeit aus `.env.production` gelesen.

---

## Schritt 5: Reverse Proxy mit SSL

### Option A: Caddy (empfohlen, einfachste Variante)

Caddy holt sich automatisch Let's-Encrypt-Zertifikate.

**`Caddyfile`:**

```
np-kompass.deine-domain.de {
    reverse_proxy localhost:3000
}
```

**Caddy installieren und starten:**

```bash
# Debian/Ubuntu
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy

# Caddyfile kopieren und starten
sudo cp Caddyfile /etc/caddy/Caddyfile
sudo systemctl restart caddy
```

### Option B: Nginx + Certbot

```nginx
server {
    server_name np-kompass.deine-domain.de;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/np-kompass.deine-domain.de/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/np-kompass.deine-domain.de/privkey.pem;
}

server {
    listen 80;
    server_name np-kompass.deine-domain.de;
    return 301 https://$host$request_uri;
}
```

```bash
# Zertifikat holen
sudo certbot --nginx -d np-kompass.deine-domain.de
```

---

## Schritt 6: DNS konfigurieren

Bei deinem Domain-Provider einen **A-Record** setzen:

| Typ | Name | Wert |
|-----|------|------|
| A | np-kompass (oder @) | IP-Adresse deines Servers |

---

## Schritt 7: Supabase Auth URL anpassen

In der Supabase-Konsole unter **Authentication → URL Configuration**:

1. **Site URL** ändern: `https://np-kompass.deine-domain.de`
2. **Redirect URLs** anpassen: `https://np-kompass.deine-domain.de/auth/callback`

Sonst funktioniert Login / Passwort-Reset nicht mehr!

---

## Schritt 8: Bauen und Starten

```bash
# Auf dem Server
cd /opt/np-kompass  # oder wo auch immer das Repo liegt

# Repo klonen (einmalig)
git clone https://github.com/dein-user/np-kompass.git .

# .env.production anlegen (siehe Schritt 4)

# Bauen und starten
docker compose up -d --build

# Logs prüfen
docker compose logs -f
```

---

## Schritt 9: Deployment-Workflow

### Manuelles Update

```bash
cd /opt/np-kompass
git pull
docker compose up -d --build
```

### Automatisch per Git Hook (optional)

Auf dem Server einen einfachen Webhook einrichten, z.B. mit einem kleinen Script:

```bash
#!/bin/bash
# /opt/np-kompass/deploy.sh
cd /opt/np-kompass
git pull origin main
docker compose up -d --build
docker image prune -f
```

Dieses Script kann über einen GitHub Webhook (z.B. via `webhook` Tool) oder einen Cronjob getriggert werden.

---

## Schritt 10: Vercel aufräumen

Erst wenn alles auf dem eigenen Server läuft und getestet ist:

1. **Domain bei Vercel entfernen** (Settings → Domains)
2. **Projekt bei Vercel löschen** (Settings → General → Delete Project)
3. **`VERCEL_OIDC_TOKEN`** aus `.env.local` entfernen
4. `.vercel/` Ordner löschen (falls vorhanden)

---

## Checkliste

- [ ] `next.config.ts` mit `output: "standalone"` anpassen
- [ ] `Dockerfile` erstellen
- [ ] `docker-compose.yml` erstellen
- [ ] Server vorbereiten (Docker, Git, Caddy/Nginx installieren)
- [ ] DNS A-Record setzen
- [ ] `.env.production` auf dem Server anlegen
- [ ] Supabase Auth URLs anpassen (Site URL + Redirect URLs)
- [ ] `docker compose up -d --build`
- [ ] App testen (Login, Daten laden, Spannungen erstellen, etc.)
- [ ] SSL prüfen (https:// muss funktionieren)
- [ ] Vercel-Projekt aufräumen

---

## Server-Voraussetzungen

| Anforderung | Minimum |
|---|---|
| OS | Linux (Debian/Ubuntu empfohlen) |
| RAM | 1 GB (Next.js Standalone ist schlank) |
| Docker | Docker Engine 24+ mit Compose Plugin |
| Ports | 80 + 443 offen (für Caddy/Nginx) |
| Domain | mit DNS-Zugriff |

---

## Troubleshooting

**Build schlägt fehl?**
→ Prüfe ob `NEXT_PUBLIC_*` Build-Args in `docker-compose.yml` gesetzt sind.

**App startet aber zeigt Fehler?**
→ `docker compose logs -f` prüfen. Meistens fehlt eine ENV-Variable.

**Login funktioniert nicht?**
→ Supabase Auth URLs prüfen (Schritt 7). Die Redirect-URL muss exakt stimmen.

**Bilder / Static Files laden nicht?**
→ Sicherstellen, dass `/public` und `.next/static` korrekt kopiert werden (Dockerfile Zeilen prüfen).

**ISR / Revalidation funktioniert nicht?**
→ Im Standalone-Modus funktioniert ISR out-of-the-box. Falls Probleme: prüfe ob `.next/cache` beschreibbar ist. Ggf. Volume in Docker mounten:
```yaml
volumes:
  - nextcache:/app/.next/cache
```
