import { Header } from "@/components/navigation/header";
import { AppShell } from "@/components/layout/app-shell";
import Link from "next/link";

export default function ImpressumPage() {
  return (
    <AppShell>
      <Header title="Impressum" showBack backHref="/" />

      <main className="flex-1 pb-24 lg:pb-8 page-enter">
        <div className="px-5 py-6 max-w-2xl mx-auto lg:max-w-4xl">
          <div className="bg-card rounded-2xl shadow-card border border-border/50 p-6 space-y-6">
            <div>
              <h1 className="text-xl font-bold text-foreground mb-1">Impressum</h1>
              <p className="text-sm text-muted-foreground">Angaben gem. &sect; 5 TMG</p>
            </div>

            <section className="space-y-1">
              <h2 className="text-base font-semibold text-foreground">Betreiber</h2>
              <p className="text-sm text-foreground">neckarpiraten e.V.</p>
              <p className="text-sm text-muted-foreground">
                Eltern-Kind-Gruppe<br />
                Argonnenstra&szlig;e 14<br />
                70374 Stuttgart
              </p>
            </section>

            <section className="space-y-1">
              <h2 className="text-base font-semibold text-foreground">Vertretungsberechtigte</h2>
              <p className="text-sm text-muted-foreground">
                Julius Breitling (1. Vorsitzende)<br />
                Juliane Herrgott (2. Vorsitzende)
              </p>
            </section>

            <section className="space-y-1">
              <h2 className="text-base font-semibold text-foreground">Kontakt</h2>
              <p className="text-sm text-muted-foreground">
                E-Mail: mail@neckarpiraten.de<br />
                Telefon: 0711 505 117 26<br />
                <span className="text-xs">(nicht f&uuml;r Platzanfragen)</span>
              </p>
            </section>

            <section className="space-y-1">
              <h2 className="text-base font-semibold text-foreground">Registereintrag</h2>
              <p className="text-sm text-muted-foreground">
                Eingetragen im Vereinsregister.<br />
                Registergericht: Amtsgericht Stuttgart<br />
                Registernummer: VR 7163
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Urheberrecht</h2>
              <p className="text-sm text-muted-foreground">
                Copyright &copy; neckarpiraten e.V. Alle Inhalte einschlie&szlig;lich Texte, Bilder, Grafiken und Videos
                sind urheberrechtlich gesch&uuml;tzt und d&uuml;rfen nicht f&uuml;r kommerzielle Zwecke genutzt oder
                Dritten zug&auml;nglich gemacht werden.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-semibold text-foreground">Haftungshinweis</h2>
              <p className="text-sm text-muted-foreground">
                Trotz sorgf&auml;ltiger inhaltlicher Kontrolle &uuml;bernehmen wir keine Haftung f&uuml;r die Inhalte externer Links.
                F&uuml;r den Inhalt der verlinkten Seiten sind ausschlie&szlig;lich deren Betreiber verantwortlich.
              </p>
            </section>

            <div className="pt-4 border-t border-border">
              <Link
                href="/datenschutz"
                className="text-sm text-primary hover:underline"
              >
                Zur Datenschutzerkl&auml;rung
              </Link>
            </div>
          </div>
        </div>
      </main>
    </AppShell>
  );
}
