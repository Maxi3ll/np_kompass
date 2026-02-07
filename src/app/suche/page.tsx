import { Header } from "@/components/navigation/header";
import { AppShell } from "@/components/layout/app-shell";
import { SearchClient } from "./search-client";

export default function SuchePage() {
  return (
    <AppShell>
      <Header title="Suche" showBack backHref="/" />

      <main className="flex-1 pb-24 lg:pb-8 page-enter">
        <div className="px-5 py-4 max-w-2xl mx-auto lg:max-w-4xl">
          <SearchClient />
        </div>
      </main>
    </AppShell>
  );
}
