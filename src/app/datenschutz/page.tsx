import { Header } from "@/components/navigation/header";
import { AppShell } from "@/components/layout/app-shell";
import Link from "next/link";

export default function DatenschutzPage() {
  return (
    <AppShell>
      <Header title="Datenschutz" showBack backHref="/" />

      <main className="flex-1 pb-24 lg:pb-8 page-enter">
        <div className="px-5 py-6 max-w-2xl mx-auto lg:max-w-4xl">
          <div className="bg-card rounded-2xl shadow-card border border-border/50 p-6 space-y-8 text-sm text-muted-foreground">
            <div>
              <h1 className="text-xl font-bold text-foreground mb-1">Datenschutzerkl&auml;rung</h1>
              <p>Stand: Februar 2026</p>
            </div>

            {/* 1. Verantwortlicher */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">1. Verantwortlicher</h2>
              <p>
                Neckarpiraten e.V.<br />
                [Stra&szlig;e und Hausnummer]<br />
                [PLZ] Stuttgart<br />
                E-Mail: [vorstand@neckarpiraten.de]
              </p>
            </section>

            {/* 2. Überblick */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">2. &Uuml;berblick der Datenverarbeitung</h2>
              <p>
                Diese Anwendung (&bdquo;NP Kompass&ldquo;) dient der internen Verwaltung und Governance des Vereins
                Neckarpiraten e.V. Sie wird ausschlie&szlig;lich von Vereinsmitgliedern genutzt.
                Wir verarbeiten personenbezogene Daten nur, soweit dies zur Bereitstellung der Funktionen
                erforderlich ist.
              </p>
            </section>

            {/* 3. Erhobene Daten */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">3. Welche Daten wir erheben</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong className="text-foreground">Kontodaten:</strong> E-Mail-Adresse, Passwort (verschl&uuml;sselt gespeichert), Name</li>
                <li><strong className="text-foreground">Profildaten:</strong> Telefonnummer (optional), Avatar-Farbe, Familienzugeh&ouml;rigkeit</li>
                <li><strong className="text-foreground">Nutzungsdaten:</strong> Rollenzuweisungen, erstellte Spannungen, Termin-Teilnahmen, Benachrichtigungen</li>
                <li><strong className="text-foreground">Technische Daten:</strong> IP-Adresse, Browser-Typ (Server-Logs des Hosting-Anbieters)</li>
              </ul>
            </section>

            {/* 4. Rechtsgrundlage */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">4. Rechtsgrundlage</h2>
              <p>Die Verarbeitung erfolgt auf folgenden Rechtsgrundlagen:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong className="text-foreground">Art. 6 Abs. 1 lit. b DSGVO</strong> &ndash; Erf&uuml;llung des Mitgliedschaftsverh&auml;ltnisses (Vereinssatzung)</li>
                <li><strong className="text-foreground">Art. 6 Abs. 1 lit. f DSGVO</strong> &ndash; Berechtigtes Interesse an der Organisation der Vereinsarbeit</li>
                <li><strong className="text-foreground">Art. 6 Abs. 1 lit. a DSGVO</strong> &ndash; Einwilligung (z.B. f&uuml;r Telegram-Benachrichtigungen)</li>
              </ul>
            </section>

            {/* 5. Zweck */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">5. Zweck der Verarbeitung</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Verwaltung der Vereinsorganisation (Kreise, Rollen, Zust&auml;ndigkeiten)</li>
                <li>Erfassung und Nachverfolgung von Spannungen und Verbesserungsvorschl&auml;gen</li>
                <li>Planung und Dokumentation von Terminen</li>
                <li>Benachrichtigung &uuml;ber relevante &Auml;nderungen (In-App und optional per Telegram)</li>
                <li>Authentifizierung und Zugangssteuerung</li>
              </ul>
            </section>

            {/* 6. Empfänger / Auftragsverarbeiter */}
            <section className="space-y-3">
              <h2 className="text-base font-semibold text-foreground">6. Empf&auml;nger und Auftragsverarbeiter</h2>

              <div>
                <h3 className="font-semibold text-foreground">Supabase Inc.</h3>
                <p>
                  Datenbank und Authentifizierung. Daten werden auf EU-Servern gespeichert.
                  Es besteht ein Auftragsverarbeitungsvertrag (AVV/DPA) gem. Art. 28 DSGVO.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground">Vercel Inc.</h3>
                <p>
                  Hosting der Webanwendung. Server-Standort: EU (Frankfurt).
                  Es besteht ein Auftragsverarbeitungsvertrag (AVV/DPA).
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground">Telegram (optional)</h3>
                <p>
                  Bei aktivierter Telegram-Benachrichtigung werden Name und Aktivit&auml;tsinformationen
                  (z.B. &bdquo;Max hat eine Spannung erstellt&ldquo;) an die Telegram-Gruppe des Vereins gesendet.
                  Telegram-Server k&ouml;nnen sich au&szlig;erhalb der EU befinden.
                  Diese Funktion ist optional und kann im Profil deaktiviert werden.
                </p>
              </div>
            </section>

            {/* 7. Speicherdauer */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">7. Speicherdauer</h2>
              <p>
                Personenbezogene Daten werden gespeichert, solange die Mitgliedschaft im Verein besteht.
                Nach Beendigung der Mitgliedschaft oder auf Anfrage werden die Daten gel&ouml;scht,
                sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
              </p>
              <p>
                Rollenzuweisungen und Termin-Protokolle k&ouml;nnen nach Anonymisierung f&uuml;r
                die Vereinshistorie aufbewahrt werden.
              </p>
            </section>

            {/* 8. Cookies */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">8. Cookies</h2>
              <p>
                Diese Anwendung verwendet ausschlie&szlig;lich technisch notwendige Cookies
                f&uuml;r die Authentifizierung und Sitzungsverwaltung. Es werden keine
                Tracking-, Analyse- oder Marketing-Cookies eingesetzt.
              </p>
              <p>
                F&uuml;r technisch notwendige Cookies ist keine Einwilligung erforderlich
                (Art. 5 Abs. 3 ePrivacy-Richtlinie, &sect; 25 Abs. 2 TTDSG).
              </p>
            </section>

            {/* 9. Betroffenenrechte */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">9. Deine Rechte</h2>
              <p>Du hast folgende Rechte bez&uuml;glich deiner personenbezogenen Daten:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong className="text-foreground">Auskunft</strong> (Art. 15 DSGVO) &ndash; Welche Daten wir &uuml;ber dich speichern</li>
                <li><strong className="text-foreground">Berichtigung</strong> (Art. 16 DSGVO) &ndash; &Uuml;ber die Profil-Seite oder auf Anfrage</li>
                <li><strong className="text-foreground">L&ouml;schung</strong> (Art. 17 DSGVO) &ndash; &Uuml;ber &bdquo;Konto l&ouml;schen&ldquo; im Profil oder auf Anfrage</li>
                <li><strong className="text-foreground">Daten&uuml;bertragbarkeit</strong> (Art. 20 DSGVO) &ndash; &Uuml;ber &bdquo;Meine Daten exportieren&ldquo; im Profil</li>
                <li><strong className="text-foreground">Einschr&auml;nkung der Verarbeitung</strong> (Art. 18 DSGVO)</li>
                <li><strong className="text-foreground">Widerspruch</strong> (Art. 21 DSGVO)</li>
                <li><strong className="text-foreground">Widerruf der Einwilligung</strong> (Art. 7 Abs. 3 DSGVO) &ndash; z.B. Telegram-Benachrichtigungen im Profil deaktivieren</li>
              </ul>
              <p>
                Zur Aus&uuml;bung deiner Rechte wende dich an: [vorstand@neckarpiraten.de]
              </p>
            </section>

            {/* 10. Beschwerderecht */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">10. Beschwerderecht</h2>
              <p>
                Du hast das Recht, dich bei einer Datenschutz-Aufsichtsbeh&ouml;rde zu beschweren:
              </p>
              <p>
                Der Landesbeauftragte f&uuml;r den Datenschutz und die Informationsfreiheit Baden-W&uuml;rttemberg<br />
                Lautenschlagerstra&szlig;e 20<br />
                70173 Stuttgart<br />
                poststelle@lfdi.bwl.de
              </p>
            </section>

            {/* 11. Datensicherheit */}
            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">11. Datensicherheit</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Verschl&uuml;sselte &Uuml;bertragung (HTTPS/TLS)</li>
                <li>Passw&ouml;rter werden gehasht gespeichert (bcrypt)</li>
                <li>Zugriffskontrolle &uuml;ber Row Level Security (RLS) auf Datenbankebene</li>
                <li>Zugang nur f&uuml;r freigeschaltete E-Mail-Adressen (Allowlist)</li>
              </ul>
            </section>

            <div className="pt-4 border-t border-border">
              <Link
                href="/impressum"
                className="text-sm text-primary hover:underline"
              >
                Zum Impressum
              </Link>
            </div>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
