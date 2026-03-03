# NP-Kompass: Self-Hosting Anleitung

Vollstaendige Anleitung fuer das Self-Hosting von NP-Kompass, Supabase und Nextcloud auf einem eigenen Server. Geschrieben fuer Leute, die nicht taeglich mit Servern arbeiten.

---

## Ueberblick: Was passiert wo?

```
Nutzer (Browser/App)
    |
    v
DNS (neckarpiraten.de)
    |
    +-- kompass.neckarpiraten.de    --> NP-Kompass App
    +-- cloud.neckarpiraten.de     --> Nextcloud
    +-- api.neckarpiraten.de       --> Supabase API
    +-- studio.neckarpiraten.de    --> Supabase Studio (nur Admin)
    |
    v
IONOS VPS L (Ubuntu 24.04, 4 vCPU, 8 GB RAM, 240 GB NVMe SSD)
    |
    +-- Caddy (HTTPS + Reverse Proxy, automatische Zertifikate)
    |
    +-- Docker: Supabase (Datenbank, Auth, Realtime, API)
    +-- Docker: Nextcloud (Dateien, Kalender, Chat)
    +-- PM2:    Node.js (NP-Kompass App)
```

Alles laeuft auf EINEM Server. Keine Cloud-Abhaengigkeiten, volle DSGVO-Kontrolle, Serverstandort Deutschland.

**Kosten:** ca. 8 EUR/Monat (IONOS VPS L).

---

## Voraussetzungen

- IONOS VPS L bestellt (oder vergleichbar: 4 vCPU, 8 GB RAM, 240 GB SSD)
- Ubuntu 24.04 LTS als Betriebssystem
- Zugang per SSH (Terminal-Verbindung zum Server)
- Domain `neckarpiraten.de` mit Zugriff auf DNS-Einstellungen
- Ca. 60-90 Minuten Zeit fuer die Ersteinrichtung

---

## Teil A: Server-Grundeinrichtung

### Schritt 1: Mit dem Server verbinden

Nach der IONOS-Bestellung bekommt ihr eine IP-Adresse und Root-Passwort per E-Mail.

```bash
ssh root@EURE-SERVER-IP
```

Beim ersten Login werdet ihr ggf. nach dem Passwort gefragt.

---

### Schritt 2: System aktualisieren + Benutzer anlegen

Arbeitet NICHT dauerhaft als root. Erstellt einen eigenen Benutzer:

```bash
# System aktualisieren
apt update && apt upgrade -y

# Benutzer anlegen
adduser npuser
usermod -aG sudo npuser

# Zum neuen Benutzer wechseln (fuer den Rest der Anleitung)
su - npuser
```

Ab jetzt arbeitet ihr als `npuser` und nutzt `sudo` fuer Admin-Befehle.

---

### Schritt 3: SSH-Key einrichten (empfohlen)

Sicherer als Passwort-Login. Auf EUREM Computer (nicht dem Server):

```bash
# SSH-Key erstellen (falls noch keiner existiert)
ssh-keygen -t ed25519 -C "neckarpiraten-server"

# Key auf den Server kopieren
ssh-copy-id npuser@EURE-SERVER-IP
```

Dann auf dem Server Passwort-Login deaktivieren:

```bash
sudo nano /etc/ssh/sshd_config
```

Folgende Zeilen setzen:
```
PasswordAuthentication no
PermitRootLogin no
```

SSH neustarten:
```bash
sudo systemctl restart sshd
```

**Wichtig:** Testet vorher in einem ZWEITEN Terminal, ob der Key-Login funktioniert, bevor ihr Passwort-Login deaktiviert!

---

### Schritt 4: Firewall + fail2ban

```bash
# Firewall einrichten
sudo ufw allow 22      # SSH
sudo ufw allow 80      # HTTP (fuer Let's Encrypt Zertifikate)
sudo ufw allow 443     # HTTPS
sudo ufw enable

# fail2ban installieren (sperrt IPs nach zu vielen Login-Versuchen)
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

### Schritt 5: Automatische Sicherheitsupdates

```bash
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

Waehlt "Ja" wenn gefragt wird. Der Server installiert ab jetzt Sicherheitsupdates automatisch.

---

## Teil B: Docker installieren

Docker wird fuer Supabase und Nextcloud gebraucht.

```bash
# Abhaengigkeiten installieren
sudo apt install -y ca-certificates curl gnupg

# Docker GPG-Schluessel hinzufuegen
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Docker-Repository hinzufuegen
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Docker installieren
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Benutzer zur Docker-Gruppe hinzufuegen (kein sudo noetig fuer Docker)
sudo usermod -aG docker npuser

# Abmelden und wieder anmelden damit die Gruppe greift
exit
su - npuser

# Testen
docker run hello-world
```

---

## Teil C: Supabase Self-Hosted aufsetzen

### Schritt 6: Supabase herunterladen

```bash
# Verzeichnis erstellen
sudo mkdir -p /opt/supabase
sudo chown npuser:npuser /opt/supabase

# Supabase Docker-Setup klonen
cd /opt/supabase
git clone --depth 1 https://github.com/supabase/supabase.git .

# In den Docker-Ordner wechseln
cd docker
```

---

### Schritt 7: Supabase konfigurieren

Zuerst die Beispiel-Konfiguration kopieren:

```bash
cp .env.example .env
```

Dann sichere Schluessel generieren. Ihr braucht:
- Ein JWT-Secret (mind. 32 Zeichen)
- Einen Anon-Key (JWT-Token)
- Einen Service-Role-Key (JWT-Token)

**JWT-Secret generieren:**

```bash
# Zufaelliges Secret generieren
openssl rand -base64 32
```

Notiert euch das Ergebnis, z.B. `aB3dE5fG7hI9jK1lM3nO5pQ7rS9tU1vW3xY5zA7=`

**JWT-Tokens generieren:**

Oeffnet https://supabase.com/docs/guides/self-hosting/docker#generate-api-keys und nutzt den JWT-Generator mit eurem Secret, um `anon` und `service_role` Keys zu erstellen.

Alternativ auf dem Server:

```bash
# Node.js wird spaeter sowieso installiert, aber falls schon verfuegbar:
# Anon-Key generieren (role: anon)
node -e "
const crypto = require('crypto');
const header = Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url');
const payload = Buffer.from(JSON.stringify({role:'anon',iss:'supabase',iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+60*60*24*365*10})).toString('base64url');
const sig = crypto.createHmac('sha256','EUER_JWT_SECRET_HIER').update(header+'.'+payload).digest('base64url');
console.log(header+'.'+payload+'.'+sig);
"
```

(Das gleiche nochmal mit `role:'service_role'` fuer den Service-Role-Key.)

**`.env` bearbeiten:**

```bash
nano /opt/supabase/docker/.env
```

Die wichtigsten Werte anpassen:

```bash
# Euer generiertes JWT-Secret
JWT_SECRET=euer-generiertes-jwt-secret-hier

# Generierte Keys (siehe oben)
ANON_KEY=euer-generierter-anon-key
SERVICE_ROLE_KEY=euer-generierter-service-role-key

# Datenbank-Passwort (sicher waehlen!)
POSTGRES_PASSWORD=ein-sicheres-datenbank-passwort

# Domain-Einstellungen
SITE_URL=https://kompass.neckarpiraten.de
API_EXTERNAL_URL=https://api.neckarpiraten.de

# Dashboard/Studio
DASHBOARD_USERNAME=admin
DASHBOARD_PASSWORD=ein-sicheres-dashboard-passwort

# SMTP fuer Auth-E-Mails (Passwort-Reset, Bestaetigung)
# Ihr koennt z.B. einen IONOS-Mailaccount oder Gmail-App-Passwort nutzen
SMTP_ADMIN_EMAIL=admin@neckarpiraten.de
SMTP_HOST=smtp.euer-provider.de
SMTP_PORT=587
SMTP_USER=admin@neckarpiraten.de
SMTP_PASS=euer-smtp-passwort
SMTP_SENDER_NAME=NP-Kompass

# Ports (Standardwerte beibehalten)
KONG_HTTP_PORT=8000
STUDIO_PORT=3001
```

**Wichtig:** Alle Passwoerter und Keys sicher aufbewahren! Am besten in einem Passwort-Manager.

---

### Schritt 8: Supabase starten

```bash
cd /opt/supabase/docker

# Alle Container starten (erster Start dauert einige Minuten wegen Image-Downloads)
docker compose up -d

# Pruefen ob alles laeuft
docker compose ps
```

Alle Container sollten den Status `running` oder `healthy` haben. Falls ein Container `restarting` zeigt, Logs pruefen:

```bash
docker compose logs <container-name>
```

**Testen:**
```bash
# API erreichbar?
curl http://localhost:8000/rest/v1/ -H "apikey: EUER_ANON_KEY"

# Studio erreichbar?
curl -s -o /dev/null -w "%{http_code}" http://localhost:3001
# Sollte 200 zurueckgeben
```

---

### Schritt 9: Datenbank-Migrationen einspielen

Die 15 NP-Kompass Migrationen muessen auf die self-hosted Datenbank angewendet werden:

```bash
# PostgreSQL-Verbindung testen
docker exec -it supabase-db psql -U postgres

# Falls das klappt, mit \q wieder raus

# Migrationen einspielen (aus dem np-kompass Repository)
# Dazu muss das Repository erst geklont werden (passiert in Teil D)
# Hier schon mal die Verbindungsdaten:
# Host: localhost
# Port: 5432 (Docker-interner Port, ggf. gemappt auf 54322)
# User: postgres
# Password: <euer POSTGRES_PASSWORD aus .env>
# Database: postgres
```

Die Migrationen werden spaeter in Teil D eingespielt, sobald das NP-Kompass Repository auf dem Server liegt.

---

## Teil D: NP-Kompass (Next.js App) deployen

### Schritt 10: Node.js installieren

```bash
# Node.js 22 installieren
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Pruefen
node --version    # Sollte v22.x.x zeigen
npm --version     # Sollte 10.x.x zeigen
```

---

### Schritt 11: Git installieren + Repository klonen

```bash
sudo apt install -y git

# Ordner erstellen
sudo mkdir -p /var/www/np-kompass
sudo chown npuser:npuser /var/www/np-kompass

# Repository klonen
cd /var/www/np-kompass
git clone https://github.com/Maxi3ll/np_kompass.git .
```

---

### Schritt 12: Datenbank-Migrationen einspielen

Jetzt wo das Repository auf dem Server liegt, koennen wir die Migrationen einspielen:

```bash
cd /var/www/np-kompass

# Supabase CLI installieren
sudo npm install -g supabase

# Supabase-Verbindung konfigurieren
# Die Migrationen direkt per psql einspielen:
for f in supabase/migrations/*.sql; do
  echo "Applying $f ..."
  docker exec -i supabase-db psql -U postgres -d postgres < "$f"
done

echo "Alle 15 Migrationen eingespielt!"
```

Alternativ, falls die Supabase CLI genutzt werden soll:
```bash
npx supabase db push --db-url "postgresql://postgres:EUER_PASSWORT@localhost:54322/postgres"
```

---

### Schritt 13: Environment-Variablen einrichten

```bash
nano /var/www/np-kompass/.env.local
```

Inhalt (**beachte: URLs zeigen jetzt auf euren eigenen Server!**):

```bash
# Supabase Self-Hosted (NICHT mehr supabase.co!)
NEXT_PUBLIC_SUPABASE_URL=https://api.neckarpiraten.de
NEXT_PUBLIC_SUPABASE_ANON_KEY=euer-selbst-generierter-anon-key
SUPABASE_SERVICE_ROLE_KEY=euer-selbst-generierter-service-role-key

# Email-Allowlist (erste = Admin)
ALLOWED_EMAILS=admin@neckarpiraten.de,eltern2@example.com,eltern3@example.com

# Optional: Telegram-Benachrichtigungen
TELEGRAM_BOT_TOKEN=euer-bot-token
TELEGRAM_CHAT_ID=eure-chat-id
```

Speichern: `Ctrl+O`, `Enter`, `Ctrl+X`.

---

### Schritt 14: App bauen und starten

```bash
cd /var/www/np-kompass

# Abhaengigkeiten installieren
npm install

# App fuer Produktion bauen
npm run build

# PM2 installieren und App starten
sudo npm install -g pm2
pm2 start npm --name "np-kompass" -- start

# Auto-Start nach Reboot einrichten
pm2 save
pm2 startup
# Den ausgegebenen sudo-Befehl kopieren und ausfuehren!
```

---

## Teil E: Nextcloud aufsetzen

### Schritt 15: Nextcloud Docker-Setup

```bash
# Verzeichnis erstellen
sudo mkdir -p /opt/nextcloud
sudo chown npuser:npuser /opt/nextcloud

# Docker Compose Datei erstellen
nano /opt/nextcloud/docker-compose.yml
```

Inhalt:

```yaml
services:
  nextcloud-db:
    image: mariadb:11
    container_name: nextcloud-db
    restart: unless-stopped
    volumes:
      - nextcloud-db-data:/var/lib/mysql
    environment:
      MYSQL_ROOT_PASSWORD: ein-sicheres-mysql-root-passwort
      MYSQL_DATABASE: nextcloud
      MYSQL_USER: nextcloud
      MYSQL_PASSWORD: ein-sicheres-mysql-passwort

  nextcloud-redis:
    image: redis:7-alpine
    container_name: nextcloud-redis
    restart: unless-stopped

  nextcloud-app:
    image: nextcloud:stable
    container_name: nextcloud-app
    restart: unless-stopped
    ports:
      - "8080:80"
    volumes:
      - nextcloud-data:/var/www/html
    environment:
      MYSQL_HOST: nextcloud-db
      MYSQL_DATABASE: nextcloud
      MYSQL_USER: nextcloud
      MYSQL_PASSWORD: ein-sicheres-mysql-passwort
      NEXTCLOUD_ADMIN_USER: admin
      NEXTCLOUD_ADMIN_PASSWORD: ein-sicheres-admin-passwort
      NEXTCLOUD_TRUSTED_DOMAINS: cloud.neckarpiraten.de
      REDIS_HOST: nextcloud-redis
      OVERWRITEPROTOCOL: https
      OVERWRITECLIURL: https://cloud.neckarpiraten.de
    depends_on:
      - nextcloud-db
      - nextcloud-redis

volumes:
  nextcloud-db-data:
  nextcloud-data:
```

**Wichtig:** Die Passwoerter in der Datei durch sichere Passwoerter ersetzen!

---

### Schritt 16: Nextcloud starten

```bash
cd /opt/nextcloud
docker compose up -d

# Pruefen
docker compose ps
# Alle Container sollten "running" sein

# Erster Start dauert 1-2 Minuten (Datenbank-Initialisierung)
```

---

### Schritt 17: Nextcloud konfigurieren

Nach dem ersten Start (ca. 2 Minuten warten) koennt ihr Nextcloud ueber den Browser aufrufen (erst nachdem Caddy in Teil F eingerichtet ist).

Dann in Nextcloud als Admin:
1. **Apps installieren:** Einstellungen > Apps
   - **Talk** (Chat + Videoanrufe)
   - **Calendar** (gemeinsamer Kalender)
   - **Contacts** (Kontakte)
   - **Forms** (Formulare/Umfragen)
   - **Deck** (Kanban-Board)
   - **Polls** (Abstimmungen)
2. **Sprache:** Einstellungen > Persoenlich > Deutsch
3. **Benutzer anlegen:** Fuer jede Familie einen Account erstellen

---

## Teil F: Caddy Reverse Proxy

### Schritt 18: Caddy installieren

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

---

### Schritt 19: Caddy konfigurieren

```bash
sudo nano /etc/caddy/Caddyfile
```

Gesamten Inhalt ersetzen durch:

```
# NP-Kompass App
kompass.neckarpiraten.de {
    reverse_proxy localhost:3000
}

# Nextcloud
cloud.neckarpiraten.de {
    reverse_proxy localhost:8080

    # Nextcloud braucht groessere Uploads
    request_body {
        max_size 10G
    }
}

# Supabase API (PostgREST, GoTrue, Realtime via Kong)
api.neckarpiraten.de {
    reverse_proxy localhost:8000
}

# Supabase Studio (Admin-Dashboard, nur mit Passwort!)
studio.neckarpiraten.de {
    basicauth {
        # Passwort-Hash generieren: caddy hash-password
        admin HIER_DEN_HASH_EINFUEGEN
    }
    reverse_proxy localhost:3001
}
```

**Passwort-Hash fuer Studio generieren:**

```bash
caddy hash-password
# Passwort eingeben, Hash kopieren und oben einsetzen
```

**Caddy neustarten:**

```bash
sudo systemctl restart caddy
```

Caddy holt sich automatisch HTTPS-Zertifikate fuer alle vier Subdomains.

---

### Schritt 20: DNS-Records einrichten

Beim Domain-Provider (wo `neckarpiraten.de` registriert ist) vier A-Records erstellen:

| Typ | Name | Wert | TTL |
|-----|------|------|-----|
| A | kompass | EURE-SERVER-IP | 3600 |
| A | cloud | EURE-SERVER-IP | 3600 |
| A | api | EURE-SERVER-IP | 3600 |
| A | studio | EURE-SERVER-IP | 3600 |

DNS-Aenderungen koennen bis zu 24 Stunden dauern (meistens 5-30 Minuten).

---

## Teil G: Datenmigration von Supabase Cloud

Falls ihr bestehende Daten aus der Supabase Cloud uebernehmen wollt:

### Schritt 21: Daten exportieren (auf eurem lokalen Computer)

```bash
# Supabase CLI (falls nicht installiert)
npm install -g supabase

# Verbindung zur Cloud-Datenbank
# Die Connection-URL findet ihr im Supabase Dashboard > Settings > Database
pg_dump "postgresql://postgres.EUER_PROJEKT:EUER_PASSWORT@aws-0-eu-central-1.pooler.supabase.com:6543/postgres" \
  --data-only \
  --no-owner \
  --no-acl \
  --exclude-table-data='auth.*' \
  --exclude-table-data='storage.*' \
  --exclude-table-data='supabase_*.*' \
  > np-kompass-data-export.sql
```

### Schritt 22: Auth-User exportieren

```bash
# Auth-User separat exportieren (wichtig: Passwort-Hashes bleiben erhalten!)
pg_dump "postgresql://postgres.EUER_PROJEKT:EUER_PASSWORT@aws-0-eu-central-1.pooler.supabase.com:6543/postgres" \
  --data-only \
  --no-owner \
  --no-acl \
  --table='auth.users' \
  --table='auth.identities' \
  > np-kompass-auth-export.sql
```

### Schritt 23: Daten importieren (auf dem Server)

```bash
# Datei auf den Server kopieren (von eurem lokalen Computer)
scp np-kompass-data-export.sql npuser@EURE-SERVER-IP:/tmp/
scp np-kompass-auth-export.sql npuser@EURE-SERVER-IP:/tmp/

# Auf dem Server: Daten importieren
docker exec -i supabase-db psql -U postgres -d postgres < /tmp/np-kompass-auth-export.sql
docker exec -i supabase-db psql -U postgres -d postgres < /tmp/np-kompass-data-export.sql

# Aufraeumen
rm /tmp/np-kompass-*-export.sql
```

Die Nutzer koennen sich danach mit ihren bisherigen Passwoertern einloggen.

---

## Teil H: Backups

### Schritt 24: Automatische Backups einrichten

```bash
# Backup-Verzeichnis erstellen
sudo mkdir -p /opt/backups
sudo chown npuser:npuser /opt/backups

# Backup-Script erstellen
nano /opt/backups/backup.sh
```

Inhalt:

```bash
#!/bin/bash
set -e

DATUM=$(date +%Y-%m-%d_%H-%M)
BACKUP_DIR="/opt/backups"

echo "=== Backup $DATUM ==="

# 1. PostgreSQL (Supabase) sichern
echo "PostgreSQL-Backup..."
docker exec supabase-db pg_dumpall -U postgres | gzip > "$BACKUP_DIR/postgres_$DATUM.sql.gz"

# 2. Nextcloud-Datenbank sichern
echo "Nextcloud-DB-Backup..."
docker exec nextcloud-db mariadb-dump -u root -pein-sicheres-mysql-root-passwort --all-databases | gzip > "$BACKUP_DIR/nextcloud-db_$DATUM.sql.gz"

# 3. Nextcloud-Dateien sichern (nur Config, nicht alle User-Dateien)
echo "Nextcloud-Config-Backup..."
docker cp nextcloud-app:/var/www/html/config/config.php "$BACKUP_DIR/nextcloud-config_$DATUM.php"

# 4. Environment-Dateien sichern
echo "Config-Backup..."
cp /var/www/np-kompass/.env.local "$BACKUP_DIR/env-np-kompass_$DATUM"
cp /opt/supabase/docker/.env "$BACKUP_DIR/env-supabase_$DATUM"

# 5. Alte Backups loeschen (aelter als 30 Tage)
find "$BACKUP_DIR" -name "*.gz" -mtime +30 -delete
find "$BACKUP_DIR" -name "*.php" -mtime +30 -delete
find "$BACKUP_DIR" -name "env-*" -mtime +30 -delete

echo "=== Backup fertig: $BACKUP_DIR ==="
ls -lh "$BACKUP_DIR"/*$DATUM* 2>/dev/null
```

Ausfuehrbar machen und Cronjob einrichten:

```bash
chmod +x /opt/backups/backup.sh

# Taeglich um 3:00 Uhr ausfuehren
crontab -e
```

Folgende Zeile hinzufuegen:
```
0 3 * * * /opt/backups/backup.sh >> /opt/backups/backup.log 2>&1
```

---

## Teil I: Testen

### Schritt 25: Alles pruefen

Oeffnet im Browser und testet:

**NP-Kompass:**
- [ ] `https://kompass.neckarpiraten.de` zeigt die Login-Seite
- [ ] Login mit E-Mail + Passwort funktioniert
- [ ] Kreise, Rollen, Spannungen, Projekte laden korrekt
- [ ] Live-Meeting starten und Realtime funktioniert
- [ ] Benachrichtigungen (Glocke) funktionieren
- [ ] Admin-Funktionen (Kreise/Rollen CRUD, E-Mail-Allowlist)

**Nextcloud:**
- [ ] `https://cloud.neckarpiraten.de` zeigt Nextcloud-Login
- [ ] Datei-Upload funktioniert
- [ ] Kalender anlegbar und syncbar
- [ ] Talk (Chat) funktioniert

**Supabase:**
- [ ] `https://api.neckarpiraten.de` antwortet (API-Endpunkt)
- [ ] `https://studio.neckarpiraten.de` zeigt Dashboard (mit Passwort-Abfrage)

**Sicherheit:**
- [ ] SSL-Zertifikate gueltig (Schloss-Symbol im Browser)
- [ ] SSH nur mit Key moeglich (falls eingerichtet)
- [ ] `sudo ufw status` zeigt nur Ports 22, 80, 443

---

## Updates und Wartung

### NP-Kompass updaten

```bash
cd /var/www/np-kompass
git pull
npm install
npm run build
pm2 restart np-kompass
```

Oder mit dem Update-Script:

```bash
nano /var/www/np-kompass/deploy.sh
```

```bash
#!/bin/bash
set -e

echo "=== NP-Kompass Update ==="
cd /var/www/np-kompass

echo "1/4 Code aktualisieren..."
git pull

echo "2/4 Abhaengigkeiten installieren..."
npm install

echo "3/4 App bauen..."
npm run build

echo "4/4 App neustarten..."
pm2 restart np-kompass

echo "=== Fertig! ==="
pm2 status
```

```bash
chmod +x /var/www/np-kompass/deploy.sh

# Ab jetzt reicht:
/var/www/np-kompass/deploy.sh
```

### Supabase updaten

```bash
cd /opt/supabase/docker
git pull
docker compose pull
docker compose up -d
```

### Nextcloud updaten

```bash
cd /opt/nextcloud
docker compose pull
docker compose up -d
```

### Neue Datenbank-Migrationen einspielen

Wenn neue Migrationen zum Repository hinzugefuegt werden:

```bash
# Einzelne Migration einspielen
docker exec -i supabase-db psql -U postgres -d postgres < /var/www/np-kompass/supabase/migrations/NEUE_MIGRATION.sql
```

---

## Haeufige Probleme

### "502 Bad Gateway" bei kompass.neckarpiraten.de
Die Next.js App laeuft nicht:
```bash
pm2 status                # Ist np-kompass "online"?
pm2 logs np-kompass       # Fehlermeldungen anschauen
```

### "502 Bad Gateway" bei cloud.neckarpiraten.de
Nextcloud-Container pruefen:
```bash
cd /opt/nextcloud
docker compose ps         # Laufen alle Container?
docker compose logs       # Fehlermeldungen
```

### "502 Bad Gateway" bei api.neckarpiraten.de
Supabase-Container pruefen:
```bash
cd /opt/supabase/docker
docker compose ps         # Laufen alle Container?
docker compose logs kong  # Kong API Gateway Logs
```

### Login funktioniert nicht (NP-Kompass)
```bash
# .env.local pruefen
cat /var/www/np-kompass/.env.local

# Supabase Auth-Logs pruefen
cd /opt/supabase/docker
docker compose logs auth
```

### Nextcloud meldet "Zugriff ueber nicht-vertrauenswuerdige Domain"
In der Nextcloud-Config die Domain nachtragen:
```bash
docker exec -it nextcloud-app php occ config:system:set trusted_domains 1 --value=cloud.neckarpiraten.de
```

### DNS funktioniert nicht
```bash
# DNS pruefen (auf eurem lokalen Computer)
nslookup kompass.neckarpiraten.de
nslookup cloud.neckarpiraten.de
nslookup api.neckarpiraten.de
```

### Speicherplatz pruefen
```bash
df -h                          # Festplattennutzung
du -sh /opt/supabase/          # Supabase-Groesse
du -sh /opt/nextcloud/         # Nextcloud-Groesse
du -sh /opt/backups/           # Backup-Groesse
```

### Server neu starten
Nach einem Reboot starten alle Dienste automatisch:
- Docker-Container (restart: unless-stopped)
- PM2 (pm2 startup wurde eingerichtet)
- Caddy (systemd service)

Falls nicht, manuell starten:
```bash
cd /opt/supabase/docker && docker compose up -d
cd /opt/nextcloud && docker compose up -d
pm2 start np-kompass
sudo systemctl start caddy
```

---

## Zusammenfassung: Wichtige Pfade und Befehle

### Pfade

| Was | Wo |
|-----|----|
| NP-Kompass Code | `/var/www/np-kompass/` |
| NP-Kompass Env | `/var/www/np-kompass/.env.local` |
| NP-Kompass Update-Script | `/var/www/np-kompass/deploy.sh` |
| Supabase Docker | `/opt/supabase/docker/` |
| Supabase Env | `/opt/supabase/docker/.env` |
| Nextcloud Docker | `/opt/nextcloud/` |
| Caddy Config | `/etc/caddy/Caddyfile` |
| Backups | `/opt/backups/` |
| Backup-Logs | `/opt/backups/backup.log` |

### Befehle auf einen Blick

```bash
# --- NP-Kompass ---
pm2 status                               # App-Status
pm2 logs np-kompass                      # App-Logs
pm2 restart np-kompass                   # App neustarten
/var/www/np-kompass/deploy.sh            # Update einspielen

# --- Supabase ---
cd /opt/supabase/docker
docker compose ps                        # Container-Status
docker compose logs -f                   # Live-Logs (Ctrl+C beendet)
docker compose restart                   # Alle Container neustarten
docker compose down && docker compose up -d  # Komplett neustarten

# --- Nextcloud ---
cd /opt/nextcloud
docker compose ps                        # Container-Status
docker compose logs -f nextcloud-app     # Nextcloud-Logs
docker compose restart                   # Neustarten

# --- Caddy ---
sudo systemctl status caddy              # Status
sudo systemctl restart caddy             # Neustarten
sudo journalctl -u caddy --no-pager -n 50  # Logs

# --- System ---
sudo ufw status                          # Firewall-Status
df -h                                    # Speicherplatz
htop                                     # CPU/RAM-Auslastung (mit q beenden)
sudo reboot                              # Server neustarten
```

### URLs

| Dienst | URL |
|--------|-----|
| NP-Kompass | https://kompass.neckarpiraten.de |
| Nextcloud | https://cloud.neckarpiraten.de |
| Supabase API | https://api.neckarpiraten.de |
| Supabase Studio | https://studio.neckarpiraten.de |

---

## RAM-Budget (geschaetzt)

| Dienst | RAM |
|--------|-----|
| Ubuntu 24.04 + System | ~400 MB |
| PostgreSQL (Supabase) | ~500 MB - 1 GB |
| Supabase Services (GoTrue, PostgREST, Realtime, Kong) | ~1.5 - 2 GB |
| Supabase Studio | ~300 MB |
| Nextcloud + MariaDB + Redis | ~800 MB - 1 GB |
| Next.js (NP-Kompass) | ~400 - 600 MB |
| Caddy | ~50 MB |
| **Gesamt** | **~4 - 5.5 GB** |
| **Frei / Puffer** | **~2.5 - 4 GB** |
