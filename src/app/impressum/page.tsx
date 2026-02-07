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
              <p className="text-sm text-foreground">Neckarpiraten e.V.</p>
              <p className="text-sm text-muted-foreground">
                [Stra&szlig;e und Hausnummer]<br />
                [PLZ] Stuttgart
              </p>
            </section>

            <section className="space-y-1">
              <h2 className="text-base font-semibold text-foreground">Vertreten durch</h2>
              <p className="text-sm text-muted-foreground">
                [Name des/der Vorstandsvorsitzenden]<br />
                [ggf. weitere Vorstandsmitglieder]
              </p>
            </section>

            <section className="space-y-1">
              <h2 className="text-base font-semibold text-foreground">Kontakt</h2>
              <p className="text-sm text-muted-foreground">
                E-Mail: [vorstand@neckarpiraten.de]<br />
                Telefon: [Telefonnummer]
              </p>
            </section>

            <section className="space-y-1">
              <h2 className="text-base font-semibold text-foreground">Registereintrag</h2>
              <p className="text-sm text-muted-foreground">
                Eingetragen im Vereinsregister.<br />
                Registergericht: Amtsgericht Stuttgart<br />
                Registernummer: [VR XXXXX]
              </p>
            </section>

            <section className="space-y-1">
              <h2 className="text-base font-semibold text-foreground">Verantwortlich f&uuml;r den Inhalt gem. &sect; 55 Abs. 2 RStV</h2>
              <p className="text-sm text-muted-foreground">
                [Name]<br />
                [Adresse]
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
