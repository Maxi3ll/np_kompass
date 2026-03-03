# NP-Kompass: Self-Hosting Anleitung

Diese Anleitung erklaert Schritt fuer Schritt, wie ihr NP-Kompass auf eurem eigenen Server betreibt, statt auf Vercel. Geschrieben fuer Leute, die nicht taeglich mit Servern arbeiten.

---

## Ueberblick: Was passiert wo?

```
Nutzer (Browser)
    |
    v
Eure Domain (z.B. kompass.neckarpiraten.de)
    |
    v
Euer Server (Kita-Server)
    |-- Caddy (HTTPS + Reverse Proxy)
    |-- Node.js (NP-Kompass App)
    |
    v
Supabase Cloud (Datenbank, Auth)
    (bleibt wie bisher, keine Aenderung noetig)
```

Die App laeuft auf eurem Server. Die Datenbank bleibt bei Supabase in der Cloud. Der Server braucht nur eine Internetverbindung.

---

## Voraussetzungen

- Ein Linux-Server (Ubuntu 22.04 oder neuer empfohlen)
- Zugang per SSH (Terminal-Verbindung zum Server)
- Eine Domain, die auf den Server zeigt
- Ca. 1 GB RAM, 1 CPU-Kern (reicht fuer ~40 Familien locker)

---

## Schritt 1: Mit dem Server verbinden

Oeffne ein Terminal auf deinem Computer und verbinde dich per SSH:

```bash
ssh benutzername@server-ip-adresse
```

Ersetze `benutzername` mit deinem Login und `server-ip-adresse` mit der IP eures Servers. Du wirst nach dem Passwort gefragt.

Ab jetzt fuehrst du alle Befehle auf dem Server aus.

---

## Schritt 2: Node.js installieren

NP-Kompass braucht Node.js (Version 20 oder neuer). Wir installieren es ueber den offiziellen NodeSource-Installer:

```bash
# System aktualisieren
sudo apt update && sudo apt upgrade -y

# Node.js 20 installieren
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Pruefen ob es geklappt hat
node --version    # Sollte v20.x.x oder hoeher zeigen
npm --version     # Sollte 10.x.x oder hoeher zeigen
```

---

## Schritt 3: Git installieren (falls nicht vorhanden)

```bash
sudo apt install -y git

# Pruefen
git --version
```

---

## Schritt 4: Repository klonen

Erstelle einen Ordner fuer die App und klone das Repository:

```bash
# Ordner erstellen
sudo mkdir -p /var/www/np-kompass
sudo chown $USER:$USER /var/www/np-kompass

# Repository klonen
cd /var/www/np-kompass
git clone https://github.com/Maxi3ll/np_kompass.git .
```

Der Punkt am Ende ist wichtig - er bedeutet "in den aktuellen Ordner klonen".

---

## Schritt 5: Environment-Variablen einrichten

Die App braucht Zugangsdaten fuer Supabase und andere Einstellungen. Diese stehen in einer `.env.local` Datei, die NIE ins Git-Repository kommt.

```bash
# Datei erstellen und bearbeiten
nano /var/www/np-kompass/.env.local
```

Folgenden Inhalt einfuegen (Werte durch eure echten Daten ersetzen):

```
NEXT_PUBLIC_SUPABASE_URL=https://euer-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=euer-anon-key-hier
SUPABASE_SERVICE_ROLE_KEY=euer-service-role-key-hier
ALLOWED_EMAILS=admin@example.com,nutzer2@example.com,nutzer3@example.com
TELEGRAM_BOT_TOKEN=euer-bot-token          # optional
TELEGRAM_CHAT_ID=eure-chat-id              # optional
```

**Wo findet ihr diese Werte?**
- Supabase URL + Keys: [Supabase Dashboard](https://supabase.com/dashboard) > Euer Projekt > Settings > API
- ALLOWED_EMAILS: Komma-getrennte Liste aller erlaubten E-Mail-Adressen. Die erste Adresse ist automatisch Admin.

Speichern mit `Ctrl+O`, dann `Enter`, dann `Ctrl+X` zum Schliessen.

---

## Schritt 6: App bauen

```bash
cd /var/www/np-kompass

# Abhaengigkeiten installieren
npm install

# App fuer Produktion bauen
npm run build
```

Das dauert ca. 30-60 Sekunden. Am Ende sollte "Compiled successfully" stehen.

---

## Schritt 7: PM2 installieren (Process Manager)

PM2 sorgt dafuer, dass die App:
- automatisch neustartet wenn sie abstuerzt
- nach einem Server-Neustart wieder laeuft
- im Hintergrund laeuft (nicht an deine SSH-Session gebunden)

```bash
# PM2 global installieren
sudo npm install -g pm2

# App mit PM2 starten
cd /var/www/np-kompass
pm2 start npm --name "np-kompass" -- start

# Pruefen ob sie laeuft
pm2 status
```

Du solltest eine Tabelle sehen mit `np-kompass` und Status `online`.

```bash
# PM2 so einrichten, dass es nach Server-Neustart automatisch startet
pm2 save
pm2 startup
```

Der letzte Befehl gibt dir einen Befehl aus, den du kopieren und ausfuehren musst (er beginnt mit `sudo env PATH=...`). Einfach kopieren, einfuegen, Enter.

**Nuetzliche PM2-Befehle:**
```bash
pm2 status              # Status aller Apps anzeigen
pm2 logs np-kompass     # Live-Logs anschauen (Ctrl+C zum Beenden)
pm2 restart np-kompass  # App neustarten
pm2 stop np-kompass     # App stoppen
```

---

## Schritt 8: Caddy installieren (Webserver + HTTPS)

Caddy ist ein Webserver, der automatisch HTTPS-Zertifikate holt (kostenlos via Let's Encrypt). Er leitet Anfragen von eurer Domain an die App weiter.

```bash
# Caddy installieren
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

---

## Schritt 9: Caddy konfigurieren

Oeffne die Caddy-Konfiguration:

```bash
sudo nano /etc/caddy/Caddyfile
```

Loesche den gesamten Inhalt und ersetze ihn durch:

```
kompass.neckarpiraten.de {
    reverse_proxy localhost:3000
}
```

Ersetze `kompass.neckarpiraten.de` durch eure tatsaechliche Domain.

Speichern (`Ctrl+O`, `Enter`, `Ctrl+X`) und Caddy neustarten:

```bash
sudo systemctl restart caddy
```

Caddy holt sich jetzt automatisch ein HTTPS-Zertifikat. Das kann beim ersten Mal 10-30 Sekunden dauern.

---

## Schritt 10: Domain auf den Server zeigen lassen

Beim Domain-Anbieter (z.B. bei eurem Hoster oder DNS-Provider):

1. Loggt euch in die Domain-Verwaltung ein
2. Erstellt einen **A-Record**:
   - Name/Host: `kompass` (oder `@` wenn die Hauptdomain genutzt wird)
   - Typ: `A`
   - Wert/Ziel: Die IP-Adresse eures Servers
   - TTL: 3600 (oder "Auto")
3. Speichern

**Hinweis:** DNS-Aenderungen koennen bis zu 24 Stunden dauern, meistens geht es aber in 5-30 Minuten.

---

## Schritt 11: Firewall pruefen

Der Server muss folgende Ports offen haben:

```bash
# Falls ufw (Ubuntu Firewall) aktiv ist:
sudo ufw allow 80      # HTTP (fuer Zertifikat-Erneuerung)
sudo ufw allow 443     # HTTPS (normaler Zugriff)
sudo ufw allow 22      # SSH (damit du dich weiter verbinden kannst!)
sudo ufw status
```

---

## Schritt 12: Testen

Oeffne im Browser:

```
https://kompass.neckarpiraten.de
```

Du solltest die Login-Seite sehen. Fertig!

---

## Updates einspielen

Wenn es eine neue Version gibt (z.B. nach einem Git-Push), fuehrt ihr auf dem Server aus:

```bash
cd /var/www/np-kompass
git pull
npm install
npm run build
pm2 restart np-kompass
```

### Update-Script (empfohlen)

Damit ihr euch die einzelnen Befehle nicht merken muesst, erstellt ein Script:

```bash
nano /var/www/np-kompass/deploy.sh
```

Inhalt:

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

Ausfuehrbar machen:

```bash
chmod +x /var/www/np-kompass/deploy.sh
```

Ab jetzt reicht fuer ein Update:

```bash
/var/www/np-kompass/deploy.sh
```

---

## Supabase: Bleibt in der Cloud

Die Datenbank und Authentifizierung laufen weiterhin bei Supabase. Daran aendert sich nichts. Falls ihr spaeter auch Supabase self-hosten wollt, ist das ein eigenes (groesseres) Projekt.

**Wichtig:** Die `NEXT_PUBLIC_SUPABASE_URL` in eurer `.env.local` zeigt weiterhin auf `https://euer-projekt.supabase.co`. Das ist korrekt so.

Falls neue Datenbank-Migrationen noetig sind, werden die weiterhin ueber Supabase CLI eingespielt:

```bash
npx supabase db push
```

---

## Haeufige Probleme

### "502 Bad Gateway" im Browser
Die App laeuft nicht. Pruefen:
```bash
pm2 status          # Ist np-kompass "online"?
pm2 logs np-kompass # Fehlermeldungen anschauen
```

### App startet nicht / Build schlaegt fehl
Meistens fehlende Environment-Variablen:
```bash
cat /var/www/np-kompass/.env.local   # Sind alle Werte da?
```

### "DNS_PROBE_FINISHED_NXDOMAIN" im Browser
Die Domain zeigt noch nicht auf den Server. DNS-Eintrag pruefen, ggf. warten.

### HTTPS-Zertifikat funktioniert nicht
Caddy braucht Port 80 offen fuer die Zertifikats-Erneuerung:
```bash
sudo ufw allow 80
sudo systemctl restart caddy
```

### Seite laedt, aber Login geht nicht
Supabase-URL in `.env.local` pruefen. Der Server braucht Internetzugang zu `*.supabase.co`.

### Nach Update: alte Version wird angezeigt
Browser-Cache leeren (`Ctrl+Shift+R`) oder:
```bash
pm2 restart np-kompass
```

---

## Zusammenfassung der wichtigen Pfade

| Was | Wo |
|-----|----|
| App-Code | `/var/www/np-kompass/` |
| Environment-Variablen | `/var/www/np-kompass/.env.local` |
| Update-Script | `/var/www/np-kompass/deploy.sh` |
| Caddy-Config | `/etc/caddy/Caddyfile` |
| PM2-Logs | `pm2 logs np-kompass` |

## Wichtige Befehle auf einen Blick

```bash
# App-Status
pm2 status

# App-Logs anschauen
pm2 logs np-kompass

# App neustarten
pm2 restart np-kompass

# Update einspielen
/var/www/np-kompass/deploy.sh

# Caddy (Webserver) neustarten
sudo systemctl restart caddy

# Caddy-Logs anschauen
sudo journalctl -u caddy --no-pager -n 50
```
