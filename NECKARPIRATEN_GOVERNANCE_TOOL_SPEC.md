# Neckarpiraten Governance Tool – Technische Spezifikation

> **Projektname:** NP-Governance / "Kompass"  
> **Version:** 0.1 (MVP-Spezifikation)  
> **Stand:** Februar 2026  
> **Zielgruppe:** Eltern der Neckarpiraten e.V. Kita

---

## 1. Projektübersicht

### 1.1 Hintergrund

Die **Neckarpiraten e.V.** sind eine Eltern-Kind-Initiative in Stuttgart mit ca. 40 Familien. Der Verein implementiert ein "Holacracy-light" Governance-Modell, um:

- Klare Verantwortlichkeiten zu schaffen
- Transparenz über Rollen und Aufgaben herzustellen
- Spannungen strukturiert zu bearbeiten
- Wissen bei Familienwechseln zu erhalten

### 1.2 Problemstellung

| Problem | Auswirkung |
|---------|------------|
| Ämter sind nicht klar dokumentiert | Neue Familien wissen nicht, was zu tun ist |
| Spannungen werden nicht systematisch erfasst | Probleme brodeln, statt gelöst zu werden |
| Wissen geht bei Familienwechsel verloren | Jedes Jahr "Neustart" |
| Keine zentrale Übersicht | Niemand weiß, wer wofür zuständig ist |

### 1.3 Lösung

Eine einfache Web-App mit drei Kernmodulen:

1. **Rollen-Wiki** – Dokumentation aller Rollen und Kreise
2. **Spannungs-Log** – Erfassung und Tracking von Anliegen
3. **Meeting-Board** – Unterstützung für taktische Meetings

---

## 2. Zielgruppe & Nutzeranforderungen

### 2.1 Primäre Nutzer

- **Eltern** (ca. 40 Familien, 60-80 aktive Personen)
- **Vorstand** (3-4 Personen)
- **Kreis-Sprecher** (4 Personen)

### 2.2 Nutzungskontext

- Zugriff primär über **Smartphone** (80%)
- Gelegentlich Desktop bei Meetings
- Technische Affinität: **gemischt** (von "nutzt nur WhatsApp" bis IT-Profis)
- Verfügbare Zeit: **minimal** (Eltern mit Vollzeitjobs)

### 2.3 Nicht-funktionale Anforderungen

| Anforderung | Spezifikation |
|-------------|---------------|
| **Einfachheit** | Maximal 3 Klicks bis zur Kernfunktion |
| **Mobile-First** | Responsive Design, Touch-optimiert |
| **Performance** | Ladezeit < 2 Sekunden |
| **Verfügbarkeit** | 99% (kein Mission-Critical-System) |
| **Datenschutz** | DSGVO-konform, Daten in DE/EU |
| **Kosten** | Möglichst kostenlos oder < 10€/Monat |

---

## 3. Fachliches Domänenmodell

### 3.1 Kernentitäten

```
┌─────────────┐       ┌─────────────┐
│   PERSON    │       │   KREIS     │
├─────────────┤       ├─────────────┤
│ id          │       │ id          │
│ name        │       │ name        │
│ email       │       │ purpose     │
│ phone       │       │ parentCircle│
│ familyId    │       │ createdAt   │
│ isActive    │       └──────┬──────┘
└──────┬──────┘              │
       │                     │
       │    ┌────────────────┘
       │    │
       ▼    ▼
┌─────────────────┐
│      ROLLE      │
├─────────────────┤
│ id              │
│ name            │
│ purpose         │
│ domains[]       │
│ accountabilities│
│ circleId        │
│ holderId        │◄── Person die Rolle innehat
│ validFrom       │
│ validUntil      │
└────────┬────────┘
         │
         │
         ▼
┌─────────────────┐       ┌─────────────────┐
│    SPANNUNG     │       │    MEETING      │
├─────────────────┤       ├─────────────────┤
│ id              │       │ id              │
│ title           │       │ type            │◄── tactical/governance
│ description     │       │ circleId        │
│ raisedBy        │       │ date            │
│ circleId        │       │ attendees[]     │
│ status          │       │ facilitator     │
│ priority        │       │ notes           │
│ createdAt       │       └─────────────────┘
│ resolvedAt      │
│ nextAction      │
│ assignedTo      │
└─────────────────┘
```

### 3.2 Kreisstruktur (Neckarpiraten-spezifisch)

```
ANKER-KREIS (Vorstand)
├── KREIS: Betrieb
│   ├── Rolle: Elterndienst-Koordination
│   ├── Rolle: Küchen-Organisation
│   └── Rolle: Hygiene-Beauftragte
│
├── KREIS: Gebäude & Garten
│   ├── Rolle: Arbeitsschutz
│   ├── Rolle: Arbeitseinsatz-Koordination
│   ├── Rolle: Garten
│   └── Rolle: Brandschutz
│
├── KREIS: Gemeinschaft
│   ├── Rolle: Feste & Events
│   ├── Rolle: Öffentlichkeitsarbeit
│   └── Rolle: Onboarding neue Familien
│
└── KREIS: Finanzen & Ressourcen
    ├── Rolle: Spenden & Fundraising
    ├── Rolle: Einkauf
    └── Rolle: IT
```

### 3.3 Status-Workflows

**Spannung:**
```
[NEU] → [IN_BEARBEITUNG] → [ERLEDIGT]
                │
                └──────→ [ESKALIERT] → (nächsthöherer Kreis)
```

**Rolle-Besetzung:**
```
[VAKANT] → [BESETZT] → [ÜBERGABE] → [VAKANT]
```

---

## 4. Funktionale Anforderungen

### 4.1 Modul: Rollen-Wiki

#### Features (MVP)

| ID | Feature | Priorität |
|----|---------|-----------|
| R1 | Alle Kreise als Übersicht anzeigen | Must |
| R2 | Rollen eines Kreises anzeigen | Must |
| R3 | Rollendetails anzeigen (Purpose, Domains, Accountabilities) | Must |
| R4 | Aktuellen Rolleninhaber anzeigen mit Kontakt | Must |
| R5 | Rolle bearbeiten (nur Rolleninhaber oder Admin) | Must |
| R6 | Rollenhistorie anzeigen (wer hatte die Rolle wann) | Should |
| R7 | Suche über alle Rollen | Should |
| R8 | Export als PDF | Could |

#### User Stories

```gherkin
Feature: Rollen-Wiki

  Scenario: Elternteil sucht Ansprechpartner für Sicherheitsfrage
    Given ich bin auf der Startseite
    When ich auf "Kreise" klicke
    And ich "Gebäude & Garten" auswähle
    And ich "Arbeitsschutz" auswähle
    Then sehe ich Name, E-Mail und Telefon des Rolleninhabers
    And ich kann direkt anrufen oder E-Mail schreiben

  Scenario: Neuer Rolleninhaber übernimmt Amt
    Given ich bin eingeloggt als "Max Mustermann"
    And ich habe die Rolle "Arbeitsschutz" übernommen
    When ich auf "Meine Rollen" klicke
    And ich "Arbeitsschutz" auswähle
    Then kann ich Purpose, Domains und Accountabilities sehen
    And ich kann die Beschreibung bearbeiten
```

#### Datenmodell: Rolle

```typescript
interface Role {
  id: string;
  name: string;
  purpose: string;           // Wozu existiert diese Rolle?
  domains: string[];         // Worüber darf die Rolle entscheiden?
  accountabilities: string[]; // Was muss die Rolle tun?
  circleId: string;
  
  // Besetzung
  currentHolder?: {
    personId: string;
    since: Date;
    until?: Date;
  };
  
  // Metadaten
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}
```

---

### 4.2 Modul: Spannungs-Log

#### Features (MVP)

| ID | Feature | Priorität |
|----|---------|-----------|
| S1 | Neue Spannung erfassen | Must |
| S2 | Spannungen nach Kreis filtern | Must |
| S3 | Spannungen nach Status filtern | Must |
| S4 | Spannung einem nächsten Schritt zuweisen | Must |
| S5 | Spannung als erledigt markieren | Must |
| S6 | Spannungen für Meeting-Agenda exportieren | Should |
| S7 | Benachrichtigung bei neuer Spannung im eigenen Kreis | Should |
| S8 | Kommentare zu Spannungen | Could |

#### User Stories

```gherkin
Feature: Spannungs-Log

  Scenario: Elternteil erfasst neue Spannung
    Given ich bin eingeloggt
    When ich auf "Neue Spannung" klicke
    Then sehe ich ein Formular mit:
      | Feld          | Typ          | Pflicht |
      | Titel         | Text         | Ja      |
      | Beschreibung  | Textarea     | Nein    |
      | Kreis         | Dropdown     | Ja      |
      | Priorität     | Radio        | Nein    |
    When ich das Formular ausfülle und absende
    Then erscheint die Spannung im Log des gewählten Kreises
    And der Status ist "NEU"

  Scenario: Kreis-Sprecher bereitet Meeting vor
    Given ich bin Sprecher des Kreises "Gebäude & Garten"
    When ich auf "Meeting vorbereiten" klicke
    Then sehe ich alle offenen Spannungen meines Kreises
    And ich kann die Reihenfolge per Drag & Drop ändern
    And ich kann die Agenda als Liste exportieren
```

#### Datenmodell: Spannung

```typescript
interface Tension {
  id: string;
  title: string;
  description?: string;
  
  // Zuordnung
  circleId: string;
  raisedBy: string;          // Person die Spannung einbrachte
  
  // Status
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'ESCALATED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  
  // Bearbeitung
  nextAction?: string;
  assignedTo?: string;
  resolvedAt?: Date;
  resolution?: string;
  
  // Eskalation
  escalatedTo?: string;      // Kreis-ID bei Eskalation
  escalatedAt?: Date;
  
  // Metadaten
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 4.3 Modul: Meeting-Board

#### Features (MVP)

| ID | Feature | Priorität |
|----|---------|-----------|
| M1 | Meeting erstellen (Typ, Datum, Kreis) | Must |
| M2 | Teilnehmer erfassen | Must |
| M3 | Agenda aus offenen Spannungen generieren | Must |
| M4 | Checkliste für Meeting-Phasen | Should |
| M5 | Protokoll-Notizen erfassen | Should |
| M6 | Timer für Meeting-Phasen | Could |

#### Meeting-Ablauf (Taktisches Meeting)

```
┌────────────────────────────────────────────────────────┐
│  TAKTISCHES MEETING – Kreis: Gebäude & Garten         │
│  Datum: 15.02.2026, 19:00 Uhr                         │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ☑ CHECK-IN (5 Min.)                                  │
│    "Ein Wort, wie komme ich an?"                      │
│                                                        │
│  ☑ CHECKLISTE (5 Min.)                                │
│    ☐ Gefährdungsbeurteilung aktuell?                  │
│    ☐ Feuerlöscher geprüft?                            │
│    ☐ Arbeitseinsatz-Termine kommuniziert?             │
│                                                        │
│  ☑ KENNZAHLEN (5 Min.)                                │
│    • Offene Mängel: 3                                 │
│    • Nächster Arbeitseinsatz: 12.03.2026             │
│                                                        │
│  ☐ SPANNUNGEN (25 Min.)                               │
│    1. [NEU] Fenstergriff im Bad locker                │
│    2. [NEU] Gartentor schließt nicht richtig          │
│    3. [IN_PROGRESS] Rauchmelder DG fehlt              │
│                                                        │
│  ☐ CHECK-OUT (5 Min.)                                 │
│    "Was nehme ich mit?"                               │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 5. Technische Architektur

### 5.1 Empfohlener Tech-Stack

Für eine **einfache, wartbare und kostengünstige** Lösung:

#### Option A: Serverless / JAMstack (Empfohlen für MVP)

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND                           │
│  Next.js 14+ (App Router)                              │
│  - React Server Components                              │
│  - Tailwind CSS                                         │
│  - shadcn/ui (Komponenten)                             │
│  - Vercel Hosting (kostenlos bis 100GB)                │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                     BACKEND                             │
│  Supabase (PostgreSQL + Auth + Realtime)               │
│  - Kostenloser Tier: 500MB DB, 50k Auth-User           │
│  - Row Level Security für Datenzugriff                 │
│  - Realtime-Subscriptions für Live-Updates             │
└─────────────────────────────────────────────────────────┘
```

**Vorteile:**
- Keine Server-Wartung
- Kostenlos im Rahmen der Free-Tiers
- Schnelle Entwicklung
- Automatische Skalierung

#### Option B: Self-Hosted (Falls Datenkontrolle wichtig)

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND                           │
│  SvelteKit oder Next.js                                │
│  - Hosting: eigener Server / Hetzner Cloud             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                     BACKEND                             │
│  Node.js + Express oder Hono                           │
│  - SQLite (einfach) oder PostgreSQL                    │
│  - Drizzle ORM                                          │
│  - Lucia Auth (Self-hosted Auth)                       │
└─────────────────────────────────────────────────────────┘
```

### 5.2 Datenbankschema (PostgreSQL)

```sql
-- Personen (Eltern)
CREATE TABLE persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  family_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Familien
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  joined_at DATE NOT NULL,
  left_at DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Kreise
CREATE TABLE circles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  purpose TEXT,
  parent_circle_id UUID REFERENCES circles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Rollen
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  purpose TEXT,
  domains TEXT[],
  accountabilities TEXT[],
  circle_id UUID REFERENCES circles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Rollen-Besetzung (Historie)
CREATE TABLE role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID REFERENCES roles(id) NOT NULL,
  person_id UUID REFERENCES persons(id) NOT NULL,
  valid_from DATE NOT NULL,
  valid_until DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Aktuelle Rollen-View
CREATE VIEW current_role_holders AS
SELECT 
  r.*,
  ra.person_id as holder_id,
  p.name as holder_name,
  p.email as holder_email,
  p.phone as holder_phone
FROM roles r
LEFT JOIN role_assignments ra ON r.id = ra.role_id 
  AND ra.valid_until IS NULL
LEFT JOIN persons p ON ra.person_id = p.id;

-- Spannungen
CREATE TABLE tensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  circle_id UUID REFERENCES circles(id) NOT NULL,
  raised_by UUID REFERENCES persons(id) NOT NULL,
  status TEXT DEFAULT 'NEW' CHECK (status IN ('NEW', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED')),
  priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
  next_action TEXT,
  assigned_to UUID REFERENCES persons(id),
  resolved_at TIMESTAMPTZ,
  resolution TEXT,
  escalated_to UUID REFERENCES circles(id),
  escalated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Meetings
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('TACTICAL', 'GOVERNANCE')),
  circle_id UUID REFERENCES circles(id) NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  facilitator_id UUID REFERENCES persons(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Meeting-Teilnehmer
CREATE TABLE meeting_attendees (
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  person_id UUID REFERENCES persons(id),
  PRIMARY KEY (meeting_id, person_id)
);

-- Meeting-Agenda (Spannungen für Meeting)
CREATE TABLE meeting_agenda_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  tension_id UUID REFERENCES tensions(id),
  position INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Checklisten-Items pro Kreis
CREATE TABLE checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id UUID REFERENCES circles(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  frequency TEXT DEFAULT 'MEETING' CHECK (frequency IN ('MEETING', 'WEEKLY', 'MONTHLY', 'YEARLY')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Checklisten-Erledigungen
CREATE TABLE checklist_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_item_id UUID REFERENCES checklist_items(id) NOT NULL,
  meeting_id UUID REFERENCES meetings(id),
  completed_by UUID REFERENCES persons(id) NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT
);

-- Row Level Security
ALTER TABLE tensions ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
-- etc.
```

### 5.3 API-Struktur (REST)

```
/api
├── /auth
│   ├── POST   /login
│   ├── POST   /logout
│   └── GET    /me
│
├── /circles
│   ├── GET    /                    # Alle Kreise
│   ├── GET    /:id                 # Einzelner Kreis
│   ├── GET    /:id/roles           # Rollen eines Kreises
│   └── GET    /:id/tensions        # Spannungen eines Kreises
│
├── /roles
│   ├── GET    /                    # Alle Rollen (mit Filter)
│   ├── GET    /:id                 # Einzelne Rolle
│   ├── PUT    /:id                 # Rolle bearbeiten
│   ├── GET    /:id/history         # Rollenhistorie
│   └── POST   /:id/assign          # Rolle zuweisen
│
├── /tensions
│   ├── GET    /                    # Alle Spannungen (mit Filter)
│   ├── POST   /                    # Neue Spannung
│   ├── GET    /:id                 # Einzelne Spannung
│   ├── PUT    /:id                 # Spannung bearbeiten
│   ├── POST   /:id/resolve         # Spannung lösen
│   └── POST   /:id/escalate        # Spannung eskalieren
│
├── /meetings
│   ├── GET    /                    # Alle Meetings (mit Filter)
│   ├── POST   /                    # Neues Meeting
│   ├── GET    /:id                 # Meeting-Details
│   ├── PUT    /:id                 # Meeting bearbeiten
│   ├── POST   /:id/agenda          # Agenda-Item hinzufügen
│   └── GET    /:id/export          # Meeting-Protokoll exportieren
│
└── /persons
    ├── GET    /                    # Alle Personen
    ├── GET    /:id                 # Person-Details
    └── GET    /:id/roles           # Rollen einer Person
```

---

## 6. UI/UX Design

### 6.1 Design-System (Neckarpiraten-Branding)

```css
:root {
  /* Primärfarben */
  --np-blue: #4A90D9;
  --np-blue-dark: #3A7BC8;
  --np-blue-light: #E8F4FC;
  
  --np-yellow: #F5C842;
  --np-yellow-dark: #E5B832;
  --np-yellow-light: #FEF9E7;
  
  /* Semantische Farben */
  --success: #7DD3B8;      /* Mint */
  --warning: #F5C842;      /* Gelb */
  --error: #F5A08C;        /* Korall */
  --info: #4A90D9;         /* Blau */
  
  /* Status-Farben */
  --status-new: #4A90D9;
  --status-in-progress: #F5C842;
  --status-resolved: #7DD3B8;
  --status-escalated: #F5A08C;
  
  /* Grautöne */
  --gray-50: #F9FAFB;
  --gray-100: #F3F4F6;
  --gray-200: #E5E7EB;
  --gray-500: #6B7280;
  --gray-900: #111827;
  
  /* Typografie */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-display: 'Inter', system-ui, sans-serif;
  
  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  
  /* Border Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-full: 9999px;
}
```

### 6.2 Komponenten-Bibliothek

Empfehlung: **shadcn/ui** mit Anpassungen an Neckarpiraten-Farben.

```tsx
// Beispiel: Status-Badge Komponente
const statusConfig = {
  NEW: { label: 'Neu', color: 'bg-np-blue text-white' },
  IN_PROGRESS: { label: 'In Bearbeitung', color: 'bg-np-yellow text-gray-900' },
  RESOLVED: { label: 'Erledigt', color: 'bg-success text-white' },
  ESCALATED: { label: 'Eskaliert', color: 'bg-error text-white' },
};

function StatusBadge({ status }: { status: TensionStatus }) {
  const config = statusConfig[status];
  return (
    <span className={`px-2 py-1 rounded-full text-sm font-medium ${config.color}`}>
      {config.label}
    </span>
  );
}
```

### 6.3 Wireframes (Kern-Screens)

#### Startseite / Dashboard

```
┌────────────────────────────────────────────────────────┐
│  ☰  Neckarpiraten Kompass              Max M.  [👤]   │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Ahoi, Max! 👋                                        │
│                                                        │
│  ┌──────────────────┐  ┌──────────────────┐           │
│  │  Meine Rollen    │  │  Offene          │           │
│  │       2          │  │  Spannungen      │           │
│  │  Arbeitsschutz   │  │       5          │           │
│  │  Brandschutz     │  │  in meinen       │           │
│  │                  │  │  Kreisen         │           │
│  └──────────────────┘  └──────────────────┘           │
│                                                        │
│  ┌─────────────────────────────────────────┐          │
│  │  Nächstes Meeting                       │          │
│  │  Kreis: Gebäude & Garten               │          │
│  │  📅 15.02.2026, 19:00 Uhr              │          │
│  │  📍 Kita Argonnenstr.                  │          │
│  │                          [Vorbereiten]  │          │
│  └─────────────────────────────────────────┘          │
│                                                        │
│  Schnellaktionen                                      │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐         │
│  │ + Neue │ │ Kreise │ │ Rollen │ │ Suche  │         │
│  │Spannung│ │        │ │        │ │        │         │
│  └────────┘ └────────┘ └────────┘ └────────┘         │
│                                                        │
├────────────────────────────────────────────────────────┤
│  [🏠]      [📋]       [➕]       [👥]       [⚙️]     │
│  Home    Spannungen   Neu      Kreise    Profil      │
└────────────────────────────────────────────────────────┘
```

#### Kreis-Übersicht

```
┌────────────────────────────────────────────────────────┐
│  ←  Kreise                                            │
├────────────────────────────────────────────────────────┤
│                                                        │
│  ┌─────────────────────────────────────────┐          │
│  │  🏠 Betrieb                              │          │
│  │  Reibungsloser Kita-Alltag              │          │
│  │  3 Rollen · 2 offene Spannungen         │          │
│  └─────────────────────────────────────────┘          │
│                                                        │
│  ┌─────────────────────────────────────────┐          │
│  │  🔧 Gebäude & Garten                    │          │
│  │  Sichere, gepflegte Räume               │          │
│  │  4 Rollen · 5 offene Spannungen    ●    │          │
│  └─────────────────────────────────────────┘          │
│                                                        │
│  ┌─────────────────────────────────────────┐          │
│  │  🎉 Gemeinschaft                        │          │
│  │  Zusammenhalt & Kommunikation           │          │
│  │  3 Rollen · 1 offene Spannung           │          │
│  └─────────────────────────────────────────┘          │
│                                                        │
│  ┌─────────────────────────────────────────┐          │
│  │  💰 Finanzen & Ressourcen               │          │
│  │  Nachhaltige Wirtschaftlichkeit         │          │
│  │  3 Rollen · 0 offene Spannungen         │          │
│  └─────────────────────────────────────────┘          │
│                                                        │
└────────────────────────────────────────────────────────┘
```

#### Rollen-Detail

```
┌────────────────────────────────────────────────────────┐
│  ←  Gebäude & Garten                        [✏️]     │
├────────────────────────────────────────────────────────┤
│                                                        │
│  🛡️ Arbeitsschutz                                     │
│                                                        │
│  ┌─────────────────────────────────────────┐          │
│  │  👤 Max Mustermann                      │          │
│  │     seit 01.08.2024                     │          │
│  │                                         │          │
│  │  📧 max@example.com                     │          │
│  │  📞 0170 1234567                        │          │
│  │                                         │          │
│  │  [E-Mail]  [Anrufen]  [WhatsApp]        │          │
│  └─────────────────────────────────────────┘          │
│                                                        │
│  Zweck                                                │
│  ───────────────────────────────────                  │
│  Alle Kinder und Erwachsenen arbeiten und spielen    │
│  in einer sicheren Umgebung.                         │
│                                                        │
│  Domains (Entscheidungsbereiche)                     │
│  ───────────────────────────────────                  │
│  • Gefährdungsbeurteilungen                          │
│  • Sicherheitsunterweisungen                         │
│  • Kontakt zu BGW und Betriebsarzt                   │
│                                                        │
│  Aufgaben                                            │
│  ───────────────────────────────────                  │
│  • Jährliche Begehung durchführen                    │
│  • Mängel dokumentieren und kommunizieren            │
│  • Gefahrstoffverzeichnis pflegen                    │
│  • Neue Eltern einweisen                             │
│                                                        │
│  ┌─────────────────────────────────────────┐          │
│  │  📜 Rollenhistorie anzeigen             │          │
│  └─────────────────────────────────────────┘          │
│                                                        │
└────────────────────────────────────────────────────────┘
```

#### Neue Spannung erfassen

```
┌────────────────────────────────────────────────────────┐
│  ←  Neue Spannung                                     │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Was ist das Problem?                                 │
│  ┌─────────────────────────────────────────┐          │
│  │ Fenstergriff im Bad ist locker          │          │
│  └─────────────────────────────────────────┘          │
│                                                        │
│  Beschreibung (optional)                             │
│  ┌─────────────────────────────────────────┐          │
│  │ Der Griff am Fenster im Kinder-Bad      │          │
│  │ wackelt und lässt sich kaum noch        │          │
│  │ drehen. Sollte vor dem Winter repariert │          │
│  │ werden.                                 │          │
│  │                                         │          │
│  └─────────────────────────────────────────┘          │
│                                                        │
│  Welcher Kreis ist zuständig?                        │
│  ┌─────────────────────────────────────────┐          │
│  │ ▼ Gebäude & Garten                      │          │
│  └─────────────────────────────────────────┘          │
│                                                        │
│  Priorität                                           │
│  ○ Niedrig   ● Mittel   ○ Hoch                       │
│                                                        │
│                                                        │
│  ┌─────────────────────────────────────────┐          │
│  │         Spannung einreichen             │          │
│  └─────────────────────────────────────────┘          │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## 7. Authentifizierung & Autorisierung

### 7.1 Auth-Strategie

**Empfehlung:** Magic Link (passwortlos) via E-Mail

**Vorteile:**
- Kein Passwort merken (Eltern haben genug zu tun)
- Sicherer als schwache Passwörter
- E-Mail-Adressen sind bekannt (aus Vereinsliste)

**Ablauf:**
```
1. Nutzer gibt E-Mail ein
2. System prüft: E-Mail in Vereinsliste?
3. Wenn ja: Magic Link per E-Mail
4. Nutzer klickt Link → eingeloggt für 30 Tage
```

### 7.2 Rollen-basierte Zugriffskontrolle (RBAC)

```typescript
enum Permission {
  // Rollen
  ROLE_VIEW = 'role:view',
  ROLE_EDIT = 'role:edit',
  ROLE_ASSIGN = 'role:assign',
  
  // Spannungen
  TENSION_CREATE = 'tension:create',
  TENSION_VIEW_ALL = 'tension:view:all',
  TENSION_VIEW_CIRCLE = 'tension:view:circle',
  TENSION_EDIT = 'tension:edit',
  TENSION_RESOLVE = 'tension:resolve',
  
  // Meetings
  MEETING_CREATE = 'meeting:create',
  MEETING_EDIT = 'meeting:edit',
  
  // Admin
  ADMIN_ALL = 'admin:all',
}

const rolePermissions = {
  member: [
    Permission.ROLE_VIEW,
    Permission.TENSION_CREATE,
    Permission.TENSION_VIEW_CIRCLE,
  ],
  
  circleLeader: [
    ...rolePermissions.member,
    Permission.TENSION_VIEW_ALL,
    Permission.TENSION_EDIT,
    Permission.TENSION_RESOLVE,
    Permission.MEETING_CREATE,
    Permission.MEETING_EDIT,
  ],
  
  vorstand: [
    ...rolePermissions.circleLeader,
    Permission.ROLE_EDIT,
    Permission.ROLE_ASSIGN,
  ],
  
  admin: [
    Permission.ADMIN_ALL,
  ],
};
```

---

## 8. Deployment & Infrastruktur

### 8.1 Empfohlene Hosting-Variante (Kostenlos)

```
┌─────────────────────────────────────────────────────────┐
│                    VERCEL (Frontend)                    │
│  - Next.js App                                          │
│  - Automatisches Deployment via GitHub                  │
│  - Kostenlos bis 100GB Bandbreite/Monat                │
│  - SSL inklusive                                        │
└──────────────────────────┬──────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   SUPABASE (Backend)                    │
│  - PostgreSQL Datenbank                                 │
│  - Auth (Magic Links)                                   │
│  - Row Level Security                                   │
│  - Kostenlos: 500MB DB, 50k Auth-Users                 │
└─────────────────────────────────────────────────────────┘
```

### 8.2 Domain & DNS

- **Empfehlung:** `kompass.neckarpiraten.de`
- DNS-Eintrag bei bestehendem Hoster auf Vercel zeigen

### 8.3 Environment Variables

```bash
# .env.local (Next.js)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# E-Mail (für Magic Links)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@neckarpiraten.de
SMTP_PASSWORD=xxx
```

---

## 9. Entwicklungs-Roadmap

### Phase 1: MVP (4-6 Wochen)

| Woche | Fokus | Deliverables |
|-------|-------|--------------|
| 1 | Setup & Grundstruktur | Projekt-Setup, DB-Schema, Auth |
| 2 | Rollen-Wiki | Kreise anzeigen, Rollen anzeigen |
| 3 | Spannungs-Log | Spannung erstellen, Liste, Filter |
| 4 | Integration | Verknüpfung Spannungen ↔ Kreise, UI-Polish |
| 5 | Testing & Deploy | Bugfixes, Deployment, erste Nutzer |
| 6 | Buffer | Feedback einarbeiten |

### Phase 2: Erweiterungen (4 Wochen)

- Meeting-Board mit Agenda-Generator
- Push-Benachrichtigungen
- Rollenhistorie
- PDF-Export für Protokolle

### Phase 3: Nice-to-Have (optional)

- Checklisten für Kreise
- Kennzahlen-Dashboard
- Integration mit Kalender
- Onboarding-Wizard für neue Familien

---

## 10. Seed-Daten (Initialer Datenbestand)

### 10.1 Kreise

```json
[
  {
    "name": "Anker-Kreis",
    "purpose": "Strategische Führung und rechtliche Verantwortung des Vereins",
    "parentCircle": null
  },
  {
    "name": "Betrieb",
    "purpose": "Reibungsloser Kita-Alltag",
    "parentCircle": "Anker-Kreis"
  },
  {
    "name": "Gebäude & Garten",
    "purpose": "Sichere, gepflegte Räume und Außenanlagen",
    "parentCircle": "Anker-Kreis"
  },
  {
    "name": "Gemeinschaft",
    "purpose": "Zusammenhalt und Kommunikation fördern",
    "parentCircle": "Anker-Kreis"
  },
  {
    "name": "Finanzen & Ressourcen",
    "purpose": "Nachhaltige Wirtschaftlichkeit des Vereins",
    "parentCircle": "Anker-Kreis"
  }
]
```

### 10.2 Rollen (Beispiele)

```json
[
  {
    "name": "Arbeitsschutz",
    "circle": "Gebäude & Garten",
    "purpose": "Alle Kinder und Erwachsenen arbeiten und spielen in einer sicheren Umgebung",
    "domains": [
      "Gefährdungsbeurteilungen",
      "Sicherheitsunterweisungen",
      "Kontakt zu BGW und Betriebsarzt"
    ],
    "accountabilities": [
      "Jährliche Begehung aller Bereiche durchführen",
      "Gefährdungsbeurteilungen aktuell halten",
      "Mängel dokumentieren und Verantwortliche informieren",
      "Gefahrstoffverzeichnis pflegen",
      "Neue Eltern in Sicherheitsthemen einweisen"
    ]
  },
  {
    "name": "Arbeitseinsatz-Koordination",
    "circle": "Gebäude & Garten",
    "purpose": "Gebäude und Garten werden regelmäßig instandgehalten",
    "domains": [
      "Planung der Arbeitseinsätze",
      "Aufgabenverteilung bei Einsätzen"
    ],
    "accountabilities": [
      "Termine für 4 Arbeitseinsätze + 2 Putztage pro Jahr festlegen",
      "Aufgabenlisten für jeden Einsatz erstellen",
      "Teilnahme dokumentieren",
      "Bei Bedarf Eltern an Pflicht erinnern"
    ]
  },
  {
    "name": "Fundraising & Spenden",
    "circle": "Finanzen & Ressourcen",
    "purpose": "Zusätzliche Mittel für besondere Projekte und Anschaffungen",
    "domains": [
      "Spendenaktionen",
      "Förderanträge",
      "Sponsoring-Partnerschaften"
    ],
    "accountabilities": [
      "Potentielle Fördertöpfe recherchieren",
      "Förderanträge stellen und nachverfolgen",
      "Spendenaktionen konzipieren und durchführen",
      "Spender angemessen danken"
    ]
  }
]
```

---

## 11. Testkonzept

### 11.1 Unit Tests (Vitest)

```typescript
// Beispiel: Spannung erstellen
describe('createTension', () => {
  it('should create a tension with status NEW', async () => {
    const tension = await createTension({
      title: 'Fenstergriff locker',
      circleId: 'circle-123',
      raisedBy: 'user-456',
    });
    
    expect(tension.status).toBe('NEW');
    expect(tension.createdAt).toBeDefined();
  });
  
  it('should reject tension without title', async () => {
    await expect(createTension({
      title: '',
      circleId: 'circle-123',
      raisedBy: 'user-456',
    })).rejects.toThrow('Title is required');
  });
});
```

### 11.2 E2E Tests (Playwright)

```typescript
// Beispiel: Spannung erfassen Flow
test('Elternteil kann Spannung erfassen', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@neckarpiraten.de');
  await page.click('button[type="submit"]');
  
  // Magic Link simulieren
  await page.goto('/auth/callback?token=test-token');
  
  // Neue Spannung
  await page.click('text=Neue Spannung');
  await page.fill('[name="title"]', 'Testspannung');
  await page.selectOption('[name="circleId"]', 'Gebäude & Garten');
  await page.click('button[type="submit"]');
  
  // Prüfen
  await expect(page.locator('text=Testspannung')).toBeVisible();
  await expect(page.locator('[data-status="NEW"]')).toBeVisible();
});
```

---

## 12. Offene Fragen & Entscheidungen

| # | Frage | Optionen | Entscheidung |
|---|-------|----------|--------------|
| 1 | Soll es eine native App geben? | PWA vs. Native | PWA empfohlen (günstiger) |
| 2 | Wie wird Onboarding neuer Familien gehandhabt? | Admin lädt ein vs. Self-Service | Noch offen |
| 3 | Soll die App auch für den Schülerladen genutzt werden? | Gemeinsam vs. Getrennt | Noch offen |
| 4 | Wer pflegt die initialen Daten? | Vorstand vs. Community | Noch offen |
| 5 | Backup-Strategie? | Supabase-Backups vs. Zusätzlich | Supabase reicht |

---

## 13. Glossar

| Begriff | Erklärung |
|---------|-----------|
| **Kreis** | Eine Gruppe von Rollen mit gemeinsamem Zweck |
| **Rolle** | Eine definierte Verantwortlichkeit mit Purpose, Domains und Accountabilities |
| **Spannung** | Ein Unterschied zwischen Ist und Soll, der bearbeitet werden soll |
| **Domain** | Bereich, über den eine Rolle eigenständig entscheiden darf |
| **Accountability** | Eine wiederkehrende Aufgabe, für die eine Rolle verantwortlich ist |
| **Taktisches Meeting** | Operatives Meeting zum Bearbeiten von Spannungen |
| **Governance Meeting** | Strukturelles Meeting zum Ändern von Rollen und Policies |
| **Konsent** | Entscheidungsprinzip: Vorschlag wird angenommen, wenn niemand schwerwiegenden Einwand hat |

---

## 14. Ressourcen & Links

- [Holacracy-Verfassung (deutsch)](https://www.holacracy.org/constitution)
- [Next.js Dokumentation](https://nextjs.org/docs)
- [Supabase Dokumentation](https://supabase.com/docs)
- [shadcn/ui Komponenten](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

*Dieses Dokument dient als Basis für die Entwicklung in Claude Code. Es kann und soll im Laufe der Entwicklung erweitert und angepasst werden.*
