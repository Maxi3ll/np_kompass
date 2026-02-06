-- =====================================================
-- NECKARPIRATEN KOMPASS - Echte Kreise & Rollen
-- Basierend auf: Neckarpiraten Kita - Rollen- und Kreisübersicht V2 (19.01.2026)
-- =====================================================

-- Aufräumen: Alle bestehenden Daten entfernen (Reihenfolge wegen Foreign Keys)
TRUNCATE notifications CASCADE;
TRUNCATE meeting_agenda_items CASCADE;
TRUNCATE meeting_attendees CASCADE;
TRUNCATE meetings CASCADE;
TRUNCATE checklist_completions CASCADE;
TRUNCATE checklist_items CASCADE;
TRUNCATE tensions CASCADE;
TRUNCATE role_assignments CASCADE;
TRUNCATE roles CASCADE;
TRUNCATE circles CASCADE;

-- =====================================================
-- KREISE (10 Kreise)
-- =====================================================

-- Neckarpiraten e.V. (Anker-Kreis / Top-Level)
INSERT INTO circles (id, name, purpose, parent_circle_id, color, icon) VALUES
  ('10000000-0000-0000-0000-000000000001',
   'Neckarpiraten e.V.',
   'Stellt sicher, dass der Verein als Träger der Kita rechtlich handlungsfähig bleibt, die Satzung und Vereinsziele erfüllt und die Governance-Struktur für alle untergeordneten Kreise bereitstellt.',
   NULL, '#E8927C', '⚓');

-- Kita (Haupt-Operationskreis)
INSERT INTO circles (id, name, purpose, parent_circle_id, color, icon) VALUES
  ('10000000-0000-0000-0000-000000000002',
   'Kita',
   'Sichert die strategische und operative Steuerung der Kita, stellt die pädagogische Qualität sicher und koordiniert alle untergeordneten Kreise.',
   '10000000-0000-0000-0000-000000000001', '#4A90D9', '🏠');

-- Sub-Kreise der Kita
INSERT INTO circles (id, name, purpose, parent_circle_id, color, icon) VALUES
  ('10000000-0000-0000-0000-000000000003',
   'Finanzen',
   'Stellt die finanzielle Stabilität und Transparenz sicher und sorgt für korrekte Abrechnung gegenüber Mitgliedern und Förderstellen.',
   '10000000-0000-0000-0000-000000000002', '#A78BFA', '💰'),

  ('10000000-0000-0000-0000-000000000004',
   'Haus & Hof',
   'Sorgt für die Pflege, Sicherheit und Weiterentwicklung der Kita-Immobilie und des Außengeländes.',
   '10000000-0000-0000-0000-000000000002', '#6EC9A8', '🔧'),

  ('10000000-0000-0000-0000-000000000005',
   'Küche & Ernährung',
   'Sorgt für eine gesunde, nachhaltige und gut organisierte Ernährung für Kinder und Team.',
   '10000000-0000-0000-0000-000000000002', '#F59E0B', '🍽️'),

  ('10000000-0000-0000-0000-000000000006',
   'Familien-Management & Kultur',
   'Fördert Gemeinschaft, organisiert Elternarbeit und integriert neue Familien.',
   '10000000-0000-0000-0000-000000000002', '#F5C842', '👪'),

  ('10000000-0000-0000-0000-000000000007',
   'Sicherheit & Compliance',
   'Stellt sicher, dass alle gesetzlichen und internen Anforderungen zu Hygiene, Arbeitsschutz und Sicherheit erfüllt sind.',
   '10000000-0000-0000-0000-000000000002', '#EF4444', '🛡️'),

  ('10000000-0000-0000-0000-000000000008',
   'Personal',
   'Stellt sicher, dass alle Personalprozesse rechtskonform, transparent und effizient ablaufen und Mitarbeitende gut begleitet werden.',
   '10000000-0000-0000-0000-000000000002', '#EC4899', '👥'),

  ('10000000-0000-0000-0000-000000000009',
   'Kommunikation',
   'Stellt sicher, dass interne und externe Kommunikation professionell und konsistent erfolgt.',
   '10000000-0000-0000-0000-000000000002', '#8B5CF6', '📢'),

  ('10000000-0000-0000-0000-000000000010',
   'Technologie & Systeme',
   'Sorgt für eine stabile, sichere und effiziente digitale Infrastruktur und Datenverwaltung.',
   '10000000-0000-0000-0000-000000000002', '#06B6D4', '💻');


-- =====================================================
-- ROLLEN - Kreis: Neckarpiraten e.V. (7 Rollen)
-- =====================================================

INSERT INTO roles (name, purpose, domains, accountabilities, circle_id) VALUES
  (
    'Neckarpirat*in',
    'Stärkt die Identität und Gemeinschaft der Neckarpiraten, indem jedes Mitglied aktiv dazu beiträgt, dass Kita und Verein als positives, vertrauensvolles und wertschätzendes Umfeld wahrgenommen werden.',
    ARRAY[]::text[],
    ARRAY[
      'Handelt im Sinne der Neckarpiraten zum Wohl der Kinder, des Teams und des Vereins',
      'Kommuniziert respektvoll und offen über die vorgesehenen Kanäle',
      'Trägt zur positiven Außenwirkung bei',
      'Fördert Gemeinschaft und Zusammenarbeit',
      'Verantwortet eigenes Verhalten und geht achtsam mit Ressourcen um'
    ],
    '10000000-0000-0000-0000-000000000001'
  ),
  (
    'Vereinsmitglied',
    'Trägt aktiv und verantwortungsvoll zum Gelingen des Kita-Betriebs und zur Gemeinschaft der Neckarpiraten bei.',
    ARRAY[]::text[],
    ARRAY[
      'Bringt sich aktiv und konstruktiv ein, arbeitet lösungsorientiert',
      'Wahrt Vertraulichkeit vereinsinterner Informationen',
      'Übernimmt mindestens eine Arbeitsrolle eigenverantwortlich',
      'Sichert Zahlungsfähigkeit für Gebühren und Beiträge',
      'Nimmt an Elternversammlungen teil',
      'Leistet Arbeitseinsätze (2x) und Putzdienst (1x) pro Jahr',
      'Organisiert Elterndienste eigenverantwortlich'
    ],
    '10000000-0000-0000-0000-000000000001'
  ),
  (
    'Mitgliederversammlungskoordinator',
    'Sorgt für eine fristgerechte, gut vorbereitete und formal korrekte Durchführung der Mitgliederversammlung.',
    ARRAY['Mitgliederversammlungs-Dokumentation', 'Wahlunterlagen'],
    ARRAY[
      'Bereitet Einladungen und Tagesordnung vor',
      'Holt Vollmachten und Berichte ein',
      'Stellt Wahlunterlagen bereit',
      'Organisiert Unterschriften während der Versammlung',
      'Koordiniert Notartermin und Unterlagen'
    ],
    '10000000-0000-0000-0000-000000000001'
  ),
  (
    'Vereinsvorstand',
    'Sorgt für eine rechtssichere, strategisch ausgerichtete und effiziente Führung des Vereins.',
    ARRAY['Satzung', 'Strategisches Zielbild'],
    ARRAY[
      'Führt den Verein gemäß Satzung und verantwortet deren Weiterentwicklung',
      'Erarbeitet abgestimmtes Zielbild und treibt Umsetzung voran',
      'Betreibt Abweichungsmanagement bei Satzungsverstößen',
      'Formt und koordiniert Vereinsführungsteam (mind. 5 Vorstände)',
      'Erfüllt Informationspflichten gegenüber Mitgliedern und Behörden'
    ],
    '10000000-0000-0000-0000-000000000001'
  ),
  (
    'Finanzvorstand',
    'Sorgt für transparente, rechtssichere und strategisch ausgerichtete Finanzverwaltung des Vereins.',
    ARRAY['Finanzdokumentation und Budgetplanung', 'Spendenbescheinigungen'],
    ARRAY[
      'Klärt Finanzfragen und kommuniziert transparent',
      'Plant und steuert Investitionen',
      'Erstellt und überwacht das Jahresbudget',
      'Koordiniert Steuererklärung und fristgerechte Einreichung',
      'Überprüft Buchhaltung regelmäßig',
      'Bearbeitet Spendenbescheinigungen'
    ],
    '10000000-0000-0000-0000-000000000001'
  ),
  (
    'Personalvorstand Kita',
    'Sichert die rechtskonforme, strategische und operative Steuerung aller personalbezogenen Themen in der Kita.',
    ARRAY['Personalplanung', 'Mitarbeitergespräche und -dokumentation', 'Arbeitszeugnisse', 'Bewerbungs- und Einstellungsunterlagen'],
    ARRAY[
      'Stellt rechtskonforme Personalführung sicher',
      'Delegiert operative Betriebsführung an pädagogische Leitung',
      'Führt Recruiting und Einstellungsprozess',
      'Behält kurz-/mittel-/langfristige Personalplanung im Blick',
      'Bereitet jährliche Mitarbeitergespräche vor und führt diese durch',
      'Verfasst Jahresbericht zur Mitarbeitersituation'
    ],
    '10000000-0000-0000-0000-000000000001'
  ),
  (
    'Revisor',
    'Stellt sicher, dass die finanziellen und organisatorischen Prozesse des Vereins transparent, regelkonform und effizient ablaufen.',
    ARRAY['Prüfberichte und Revisionsdokumentation', 'Revisionskalender'],
    ARRAY[
      'Prüft regelmäßig die Finanzunterlagen auf Ordnungsmäßigkeit',
      'Überwacht Einhaltung von Richtlinien und Prozessen',
      'Erstellt Prüfberichte und Empfehlungen',
      'Begleitet die Jahresabschlussprüfung',
      'Meldet Auffälligkeiten und Risiken an den Vorstand'
    ],
    '10000000-0000-0000-0000-000000000001'
  );


-- =====================================================
-- ROLLEN - Kreis: Kita (6 Rollen)
-- =====================================================

INSERT INTO roles (name, purpose, domains, accountabilities, circle_id) VALUES
  (
    'Organisationskoordination',
    'Sorgt für eine rechtssichere, gut organisierte und kontinuierlich weiterentwickelte Kita-Struktur.',
    ARRAY['Geschäftsordnung Kita', 'Strategisches Zielbild Kita', 'Versicherungsschutz'],
    ARRAY[
      'Erarbeitet abgestimmtes Zielbild für die Kita',
      'Führt die Kita gemäß Geschäftsordnung',
      'Stimmt sich regelmäßig mit dem Hort ab',
      'Wirkt an Weiterentwicklung von Satzung und Geschäftsordnung mit',
      'Koordiniert den Versicherungsschutz des Vereins',
      'Erstellt den Vorstandsbericht für die Mitgliederversammlung'
    ],
    '10000000-0000-0000-0000-000000000002'
  ),
  (
    'Neckarpirat Mama/Papa',
    'Stellt sicher, dass die Zusammenarbeit zwischen Eltern und pädagogischem Team reibungslos funktioniert.',
    ARRAY[]::text[],
    ARRAY[
      'Kommuniziert zuverlässig mit dem pädagogischen Team',
      'Respektiert pädagogische Entscheidungen',
      'Hält vereinbarte Bring- und Abholzeiten ein',
      'Informiert bei Krankheit gemäß Hygienevorgaben',
      'Unterstützt die Kita im Alltag bei Bedarf',
      'Nutzt die vorgesehenen Kommunikationskanäle'
    ],
    '10000000-0000-0000-0000-000000000002'
  ),
  (
    'Vorstandsassistenz',
    'Unterstützt den Vorstand und den Verein organisatorisch und administrativ.',
    ARRAY['Zentrale Vereinskommunikation', 'Führungszeugnis-Dokumentation', 'BGW-Meldungen'],
    ARRAY[
      'Bearbeitet allgemeine Vereinskommunikation (E-Mail, AB)',
      'Verteilt Informationen des Dachverbands',
      'Nimmt an Dachverbands-Sitzungen teil',
      'Koordiniert Führungszeugnisse',
      'Bearbeitet jährliche BGW-Abfragen',
      'Klärt Versicherungsanfragen'
    ],
    '10000000-0000-0000-0000-000000000002'
  ),
  (
    'Pädagogik & Kinderschutz',
    'Stellt sicher, dass das pädagogische Konzept und die Kinderschutzrichtlinien aktuell, wirksam und transparent sind.',
    ARRAY['Pädagogisches Konzept', 'Kinderschutzkonzept'],
    ARRAY[
      'Koordiniert pädagogische Abstimmung mit Leitung und Team',
      'Pflegt und aktualisiert das pädagogische Konzept',
      'Erstellt und aktualisiert das Kinderschutzkonzept',
      'Nimmt an Fortbildungen zum Kinderschutz teil',
      'Ist Ansprechperson für Eltern und Team in Kinderschutzfragen',
      'Wahrt absolute Vertraulichkeit'
    ],
    '10000000-0000-0000-0000-000000000002'
  ),
  (
    'Pädagogische Qualitätssicherung',
    'Stellt sicher, dass die pädagogische Arbeit kontinuierlich evaluiert und verbessert wird.',
    ARRAY['Qualitätsberichte und Feedbackdokumentation'],
    ARRAY[
      'Organisiert Feedbackprozesse (Elternbefragungen, Team-Feedback)',
      'Analysiert Ergebnisse und leitet Maßnahmen ab',
      'Koordiniert externe Evaluationen',
      'Dokumentiert Qualitätsstandards',
      'Fördert Fortbildungskultur und identifiziert Schulungsbedarfe'
    ],
    '10000000-0000-0000-0000-000000000002'
  ),
  (
    'Holacracy-Trainer*in',
    'Stellt sicher, dass alle Mitglieder die Prinzipien und Praktiken von Holacracy verstehen und anwenden können.',
    ARRAY['Holacracy-Schulungsmaterialien'],
    ARRAY[
      'Schult neue Mitglieder in Holacracy',
      'Unterstützt bei der Anwendung der Regeln',
      'Erstellt und pflegt Schulungsmaterialien',
      'Moderiert Governance- und Tactical-Meetings bei Bedarf',
      'Fördert kontinuierliche Verbesserung und sammelt Feedback'
    ],
    '10000000-0000-0000-0000-000000000002'
  );


-- =====================================================
-- ROLLEN - Kreis: Finanzen (4 Rollen)
-- =====================================================

INSERT INTO roles (name, purpose, domains, accountabilities, circle_id) VALUES
  (
    'Sponsoring / Fundraising',
    'Sichert zusätzliche finanzielle und materielle Ressourcen durch Fördermittel, Spenden und externe Kooperationen.',
    ARRAY['eBay-Kleinanzeigen-Konto', 'Raumnutzungsplanung für private Zwecke'],
    ARRAY[
      'Stellt regelmäßig Förderanträge bei Stiftungen und Unternehmen',
      'Akquiriert Sachspenden bei lokalen Partnern',
      'Koordiniert Raumanfragen für private Nutzung',
      'Betreut das eBay-Kleinanzeigen-Konto'
    ],
    '10000000-0000-0000-0000-000000000003'
  ),
  (
    'Buchhaltung & Controlling',
    'Stellt sicher, dass die finanzielle Verwaltung korrekt, transparent und fristgerecht erfolgt.',
    ARRAY['Kontenführung und Buchungsdaten', 'Mitgliedsbeitragsverwaltung'],
    ARRAY[
      'Zieht Mitgliedsbeiträge fristgerecht ein',
      'Prüft Konten und führt Korrekturbuchungen durch',
      'Schließt das Geschäftsjahr buchhalterisch ab'
    ],
    '10000000-0000-0000-0000-000000000003'
  ),
  (
    'Kasse',
    'Stellt sicher, dass alle finanziellen Transaktionen korrekt, fristgerecht und transparent abgewickelt werden.',
    ARRAY['Kontozugang und Zahlungsfreigabe', 'Kassenberichte'],
    ARRAY[
      'Erfasst und verbucht Eingangsrechnungen',
      'Überweist Auslagen fristgerecht',
      'Führt Gehaltsüberweisungen pünktlich durch',
      'Erstellt regelmäßige Kassenberichte',
      'Hebt Bargeld für Personalbedarf und Veranstaltungen ab'
    ],
    '10000000-0000-0000-0000-000000000003'
  ),
  (
    'Zentral-Einkauf',
    'Sorgt für bedarfsgerechte, kosteneffiziente Beschaffung aller Non-Food-Artikel.',
    ARRAY['Non-Food-Inventar', 'Inventarliste und Bestandsführung', 'Bestellprozesse für Non-Food-Artikel'],
    ARRAY[
      'Ist Ansprechperson für alle Non-Food-Anschaffungen',
      'Bestellt Artikel vorausschauend bei bevorzugten Lieferanten',
      'Überprüft und verwaltet Putz- und Hygienemittelvorräte',
      'Führt und aktualisiert die Inventarliste (Inventur min. quartalsweise)',
      'Recherchiert günstigste Preise und Förderungen',
      'Beobachtet Heizöl-Marktpreise und koordiniert Bestellungen'
    ],
    '10000000-0000-0000-0000-000000000003'
  );


-- =====================================================
-- ROLLEN - Kreis: Haus & Hof (6 Rollen)
-- =====================================================

INSERT INTO roles (name, purpose, domains, accountabilities, circle_id) VALUES
  (
    'Aquarium',
    'Sorgt für ein sauberes, funktionsfähiges und gesundes Aquarium mit optimalen Lebensbedingungen.',
    ARRAY['Aquarium und Zubehör', 'Futter und Pflegemittel'],
    ARRAY[
      'Reinigt und wartet Technik monatlich',
      'Pflegt das Aquarium-Ökosystem',
      'Wechselt wöchentlich ca. 25 Liter Wasser',
      'Organisiert die tägliche Fütterung',
      'Überwacht Wasserqualität regelmäßig'
    ],
    '10000000-0000-0000-0000-000000000004'
  ),
  (
    'Hausmeister',
    'Sorgt für die funktionale, sichere und gepflegte Infrastruktur der Kita.',
    ARRAY['Hausgeräte und technische Ausstattung', 'Instandhaltungsmaßnahmen'],
    ARRAY[
      'Führt Reparaturen und Schönheitsarbeiten durch',
      'Definiert Aufgaben für Arbeits- und Putzeinsätze',
      'Wartet alle Hausgeräte regelmäßig',
      'Führt Schädlingsprophylaxe durch',
      'Prüft jährlich Hitzeschutz-Geräte (Mai)',
      'Wartet den Kinderbus'
    ],
    '10000000-0000-0000-0000-000000000004'
  ),
  (
    'Nachhaltigkeit & Umwelt',
    'Fördert ökologische Verantwortung und nachhaltige Praktiken in der Kita.',
    ARRAY['Nachhaltigkeitsrichtlinien'],
    ARRAY[
      'Entwickelt Nachhaltigkeitsrichtlinien (Mülltrennung, Energie, Beschaffung)',
      'Überwacht die Umsetzung und initiiert Verbesserungen',
      'Koordiniert nachhaltige Beschaffung mit Einkauf und Küche',
      'Sensibilisiert Eltern und Team',
      'Dokumentiert Fortschritte'
    ],
    '10000000-0000-0000-0000-000000000004'
  ),
  (
    'Haus & Hof Entwicklung',
    'Sorgt für die langfristige Instandhaltung und Weiterentwicklung der Kita-Immobilie und des Außengeländes.',
    ARRAY['Zielbild Haus & Hof', 'Projektplanung für Immobilie'],
    ARRAY[
      'Erstellt ein Gesamtzielbild für Haus und Hof',
      'Setzt das Zielbild strukturiert um',
      'Orchestriert Projekte zur Instandhaltung und Weiterentwicklung',
      'Recherchiert Förderprogramme und Fristen',
      'Dokumentiert und kommuniziert Projektstatus'
    ],
    '10000000-0000-0000-0000-000000000004'
  ),
  (
    'Garten & Hof',
    'Sorgt für einen sicheren, gepflegten und funktionalen Außenbereich der Kita.',
    ARRAY['Garten- und Hofpflegegeräte', 'Spielgeräte-Inspektionsprotokoll'],
    ARRAY[
      'Bereitet Gartenpumpe saisonal vor und nach',
      'Inspiziert Spielgeräte mindestens jährlich',
      'Kontrolliert Garten auf gefährliche Pflanzen',
      'Führt saisonale Pflegearbeiten durch',
      'Räumt Zugangswege bei Schnee',
      'Verwaltet Gartenmaterial und Geräte'
    ],
    '10000000-0000-0000-0000-000000000004'
  ),
  (
    'Haus & Hof Betrieb',
    'Stellt sicher, dass Kita-Immobilie und Außengelände im täglichen Betrieb funktionsfähig und gepflegt bleiben.',
    ARRAY['To-Do-Übersicht Haus & Hof', 'Kommunikation mit Reinigungsfirma'],
    ARRAY[
      'Dokumentiert und priorisiert alle To-Dos rund um Haus und Hof',
      'Liest regelmäßig Zählerstände ab und meldet sie',
      'Überwacht Heizölstand und koordiniert Bestellung',
      'Hält Kontakt zur Reinigungsfirma',
      'Pflegt Solaranlage (quartalsweise Reinigung)',
      'Koordiniert kleinere Instandhaltungsmaßnahmen'
    ],
    '10000000-0000-0000-0000-000000000004'
  );


-- =====================================================
-- ROLLEN - Kreis: Küche & Ernährung (1 Rolle)
-- =====================================================

INSERT INTO roles (name, purpose, domains, accountabilities, circle_id) VALUES
  (
    'Speiseplan & Lebensmitteleinkauf',
    'Sorgt für ausgewogene, abwechslungsreiche und nachhaltige Ernährung durch vorausschauende Speiseplanung und Beschaffung.',
    ARRAY['Speisepläne und Rezeptdokumentation', 'Lebensmittelbestellungen', 'Vorrats- und Lagerhaltung'],
    ARRAY[
      'Plant und erstellt monatlich saisonale Kochpläne',
      'Entwickelt vegetarische Rezepte in Absprache mit dem Küchenteam',
      'Ermittelt und bestellt Lebensmittel bei bevorzugten Lieferanten',
      'Überprüft und organisiert Vorrats- und Lagerhaltung',
      'Berücksichtigt Urlaubs-/Schließzeiten und erstellt Sonderpläne',
      'Achtet auf Bio-Qualität gemäß EU-Bio-Siegel'
    ],
    '10000000-0000-0000-0000-000000000005'
  );


-- =====================================================
-- ROLLEN - Kreis: Familien-Management & Kultur (4 Rollen)
-- =====================================================

INSERT INTO roles (name, purpose, domains, accountabilities, circle_id) VALUES
  (
    'Elternarbeit-Koordination',
    'Stellt sicher, dass alle Formen der Elternarbeit effizient organisiert, transparent dokumentiert und fair verteilt werden.',
    ARRAY['Dienstkalender und Dienstlisten', 'Schlüsselverwaltung'],
    ARRAY[
      'Koordiniert alle Elternarbeitsbereiche (Kehrwoche, Einsätze, Elterndienste)',
      'Pflegt und verwaltet Dienstkalender und Listen',
      'Erstellt und aktualisiert den Kehrwochenplan',
      'Dokumentiert geleistete Dienste und meldet Kennzahlen',
      'Organisiert Arbeits- und Putzeinsätze',
      'Koordiniert Küchendienste bei Ausfällen',
      'Verwaltet Schlüsselvergabe gegen Pfand'
    ],
    '10000000-0000-0000-0000-000000000006'
  ),
  (
    'Feste & Veranstaltungen',
    'Stellt sicher, dass alle Kita-Veranstaltungen gut geplant und durchgeführt werden.',
    ARRAY['Eventkalender und Eventplanung', 'Material für Veranstaltungen'],
    ARRAY[
      'Plant und organisiert interne und externe Kita-Veranstaltungen',
      'Stellt reibungslose Abläufe sicher (Einkauf, Aufbau, Durchführung, Abbau)',
      'Erstellt Eventpläne und Zeitpläne',
      'Koordiniert Helfer und Ressourcen',
      'Kommuniziert Termine und Anforderungen',
      'Dokumentiert Budget und Ausgaben'
    ],
    '10000000-0000-0000-0000-000000000006'
  ),
  (
    'Familienonboarding und -offboarding',
    'Sorgt für einen transparenten, freundlichen Prozess vom ersten Kontakt bis zum Austritt.',
    ARRAY['Onboarding-/Offboarding-Dokumentation', 'Auswahlsystem für neue Familien', 'Warteliste'],
    ARRAY[
      'Plant freie Plätze (3+ Jahre voraus) und pflegt Warteliste',
      'Bearbeitet Platzanfragen und kommuniziert mit Familien',
      'Organisiert Kennenlerntermine und koordiniert Hospitation',
      'Koordiniert Offboarding-Prozess inkl. Stammdatenmeldungen',
      'Bereitet Betreuungsverträge vor und verwaltet Unterlagen',
      'Entwickelt faires Auswahlsystem für neue Familien'
    ],
    '10000000-0000-0000-0000-000000000006'
  ),
  (
    'Neckarpirat-Paten',
    'Stellt sicher, dass neue Familien sich schnell und gut in Kita und Verein integrieren.',
    ARRAY['Onboarding neuer Familien (persönliche Begleitung)'],
    ARRAY[
      'Begrüßt und begleitet neue Familien aktiv (mind. 6 Monate)',
      'Erklärt relevante Regeln und Abläufe',
      'Unterstützt bei Rollenübernahme',
      'Fördert Integration und kulturelle Offenheit',
      'Kommuniziert vertrauensvoll und respektvoll'
    ],
    '10000000-0000-0000-0000-000000000006'
  );


-- =====================================================
-- ROLLEN - Kreis: Sicherheit & Compliance (5 Rollen)
-- =====================================================

INSERT INTO roles (name, purpose, domains, accountabilities, circle_id) VALUES
  (
    'Betriebssicherheit',
    'Stellt sicher, dass alle sicherheitsrelevanten Prozesse rechtskonform, präventiv und nachvollziehbar umgesetzt werden.',
    ARRAY['Gefährdungsbeurteilung', 'Betriebsanweisungen', 'Sicherheitsdokumentation'],
    ARRAY[
      'Organisiert jährliche Sicherheitsbegehung mit der Unfallkasse',
      'Prüft und aktualisiert Gefährdungsbeurteilung (mind. jährlich)',
      'Erstellt und pflegt rote und blaue Betriebsanweisungen',
      'Führt jährlich Teamunterweisungen zur Betriebssicherheit durch',
      'Führt monatliche Legionellen-Prävention durch'
    ],
    '10000000-0000-0000-0000-000000000007'
  ),
  (
    'Brandschutz',
    'Stellt sicher, dass alle Brandschutzmaßnahmen rechtskonform und zuverlässig umgesetzt werden.',
    ARRAY['Brandschutzdokumentation', 'Brandschutzausrüstung'],
    ARRAY[
      'Organisiert Prüfung von Rauchmeldern und Feuerlöschern',
      'Organisiert Kaminfegerkehrung',
      'Pflegt Brandschutzunterweisungs-Dokument und führt jährlich Unterweisung durch',
      'Stellt sicher, dass 2 ausgebildete Brandschutzhelfer im Team sind',
      'Begeht jährlich Fluchtwege mit dem Team',
      'Protokolliert alle Prüfungen und Maßnahmen'
    ],
    '10000000-0000-0000-0000-000000000007'
  ),
  (
    'Hygiene',
    'Sichert die Einhaltung aller gesetzlichen und internen Hygienestandards.',
    ARRAY['Hygieneplan und Dokumentation', 'Infektionsschutzunterlagen'],
    ARRAY[
      'Stellt Infektionsschutzbelehrung bereit und organisiert Auffrischung (alle 2 Jahre)',
      'Koordiniert und dokumentiert jährliche Hygienebegehungen',
      'Pflegt und aktualisiert den Hygieneplan',
      'Ist Ansprechperson bei externen Hygieneprüfungen (LMÜ, Gesundheitsamt)'
    ],
    '10000000-0000-0000-0000-000000000007'
  ),
  (
    'Arbeitsschutz',
    'Stellt sicher, dass alle Arbeitsschutzanforderungen eingehalten werden.',
    ARRAY['Arbeitsschutzdokumentation', 'Verbandbuch und Feuerschutzkontrolle'],
    ARRAY[
      'Unterweist Team und Eltern regelmäßig zum Arbeitsschutz',
      'Pflegt und aktualisiert das Arbeitsschutzdokument',
      'Organisiert und begleitet Arbeitsschutzbegehungen',
      'Koordiniert den Hitzeschutzplan im Sommer',
      'Kontrolliert Verbandbuch und Feuerschutztüren',
      'Hält eigenes Wissen durch Schulungen aktuell'
    ],
    '10000000-0000-0000-0000-000000000007'
  ),
  (
    'Krisenmanagement',
    'Stellt sicher, dass die Kita in Notfällen handlungsfähig bleibt und Risiken minimiert werden.',
    ARRAY['Notfallpläne und Krisendokumentation'],
    ARRAY[
      'Erstellt und pflegt Notfallpläne (Stromausfall, Pandemie, Evakuierung)',
      'Koordiniert Krisenkommunikation',
      'Organisiert mindestens jährlich eine Notfallübung',
      'Hält Kontakt zu Behörden (Gesundheitsamt, Feuerwehr, Polizei)',
      'Dokumentiert alle Maßnahmen zentral'
    ],
    '10000000-0000-0000-0000-000000000007'
  );


-- =====================================================
-- ROLLEN - Kreis: Personal (4 Rollen)
-- =====================================================

INSERT INTO roles (name, purpose, domains, accountabilities, circle_id) VALUES
  (
    'Personalvorstands-Organisation',
    'Unterstützt den Personalvorstand bei Organisation, Kommunikation und Dokumentation aller personalbezogenen Prozesse.',
    ARRAY['Team-Stammdaten', 'Bewerbungsunterlagen', 'Kässle'],
    ARRAY[
      'Pflegt Geburtstagsübersicht und Adressliste des Teams',
      'Stellt Planungsdateien für Personaleinsatz und Urlaubsplanung bereit',
      'Bereitet Arbeitszeugnisse vor',
      'Meldet Personaländerungen per UvPM an den KVJS',
      'Bearbeitet Bewerbungen und organisiert Vorstellungsgespräche',
      'Vertritt den Personalvorstand bei Abwesenheit',
      'Organisiert Geburtstagsgeschenke für Teammitglieder'
    ],
    '10000000-0000-0000-0000-000000000008'
  ),
  (
    'Personalverwaltung',
    'Sichert die vollständige, strukturierte und datenschutzkonforme Verwaltung aller personalbezogenen Unterlagen.',
    ARRAY['Digitale und physische Personalakten', 'Stundenzettel und Zeitdokumentation', 'Vertragsunterlagen', 'Bescheinigungen und Formulare', 'Fortbildungsdokumentation'],
    ARRAY[
      'Führt und pflegt digitale und physische Personalakten',
      'Erstellt und aktualisiert Arbeitsverträge',
      'Dokumentiert Kranktage, Urlaub und Stundensoll',
      'Kommuniziert mit Krankenkassen und erstellt Bescheinigungen',
      'Meldet monatlich Änderungen an Dachverband zur Gehaltsabrechnung',
      'Bearbeitet Fortbildungsanträge und erstellt Kita-Jahresstatistik',
      'Unterstützt beim Onboarding neuer Mitarbeitender'
    ],
    '10000000-0000-0000-0000-000000000008'
  ),
  (
    'Bufdi-Koordination',
    'Stellt sicher, dass die Bufdis während ihrer gesamten Zeit gut begleitet, integriert und unterstützt werden.',
    ARRAY['Bufdi-Prozess und Bewerbungsunterlagen', 'Kommunikation mit Bufdis'],
    ARRAY[
      'Organisiert den gesamten Bufdi-Prozess (Ausschreibung bis Verabschiedung)',
      'Begleitet Bufdis im Alltag als Ansprechperson',
      'Startet rechtzeitig die Ausschreibung',
      'Koordiniert Einarbeitung und Übergabe',
      'Organisiert regelmäßige Feedbackgespräche',
      'Dokumentiert den Prozess'
    ],
    '10000000-0000-0000-0000-000000000008'
  ),
  (
    'Personalentwicklung',
    'Stellt sicher, dass das pädagogische Team sich kontinuierlich weiterentwickelt und die Kita als attraktiver Arbeitsplatz wahrgenommen wird.',
    ARRAY['Fortbildungsstrategie und Dokumentation'],
    ARRAY[
      'Erarbeitet jährliche Fortbildungsstrategie',
      'Koordiniert interne Workshops und Fachtage',
      'Unterstützt Karriereentwicklung und berät Mitarbeitende',
      'Dokumentiert Fortbildungsaktivitäten',
      'Fördert Teamkultur und Zusammenhalt'
    ],
    '10000000-0000-0000-0000-000000000008'
  );


-- =====================================================
-- ROLLEN - Kreis: Kommunikation (3 Rollen)
-- =====================================================

INSERT INTO roles (name, purpose, domains, accountabilities, circle_id) VALUES
  (
    'Visuelle Identität & Design',
    'Definiert und gestaltet die visuelle Identität der Neckarpiraten für konsistente Kommunikation.',
    ARRAY['Corporate Design', 'Design-Vorlagen und Drucksachen', 'Web-Assets'],
    ARRAY[
      'Entwickelt und pflegt die visuelle Identität (Corporate Design)',
      'Erstellt Infomaterialien für on- und offline (Flyer, Social Media, Plakate)',
      'Gestaltet Design-Vorlagen für Dokumente',
      'Erstellt Fotos und Grafiken für die Webseite',
      'Gestaltet und bestellt Drucksachen und T-Shirts',
      'Überprüft regelmäßig Garderobenschilder und Fotowände'
    ],
    '10000000-0000-0000-0000-000000000009'
  ),
  (
    'Externe Kommunikation & Content',
    'Prägt die Tonalität der internen und externen Kommunikation für eine konsistente, professionelle Darstellung.',
    ARRAY['Kommunikationsrichtlinien', 'Social Media Kanäle', 'Google-Konto und Anzeigenkampagnen'],
    ARRAY[
      'Entwickelt Kommunikationsrichtlinien (Sprache, Tonalität, Stil)',
      'Erstellt Texte für Flyer, Plakate, Social Media, Newsletter und Webseite',
      'Betreut und bespielt Social Media Kanäle regelmäßig',
      'Pflegt Inhalte auf der Webseite',
      'Begleitet Kita-Events dokumentarisch (Foto, Video)',
      'Betreut Google-Konto und Anzeigenkampagnen'
    ],
    '10000000-0000-0000-0000-000000000009'
  ),
  (
    'Elternkommunikation',
    'Stellt sicher, dass alle Eltern zeitnah, korrekt und verständlich informiert sind.',
    ARRAY['Eltern-Info-Kanäle (Newsletter, Aushänge, Chat, Intranet)', 'Tone of Voice für Elternkommunikation'],
    ARRAY[
      'Übersetzt Beschlüsse und Ergebnisse in geeignete Nachrichtenformate',
      'Pflegt Eltern-Infoseiten/Wiki aktuell und vollständig',
      'Strukturiert Inhalte nach Zielgruppe (FAQ, Termine, Zuständigkeiten)',
      'Wählt passende Kanäle und achtet auf Barrierefreiheit',
      'Bündelt Rückfragen und behebt Missverständnisse proaktiv',
      'Führt kleine Usability-Tests durch'
    ],
    '10000000-0000-0000-0000-000000000009'
  );


-- =====================================================
-- ROLLEN - Kreis: Technologie & Systeme (3 Rollen)
-- =====================================================

INSERT INTO roles (name, purpose, domains, accountabilities, circle_id) VALUES
  (
    'Datenmanagement & Datensicherheit',
    'Stellt sicher, dass alle personenbezogenen Daten strukturiert, aktuell und datenschutzkonform verwaltet werden.',
    ARRAY['Digitale und physische Stammdaten', 'Cloud-Ordnerstruktur und Archivierung', 'Datenschutzrichtlinien'],
    ARRAY[
      'Gewährleistet Einhaltung der DSGVO',
      'Fungiert als Datenschutzbeauftragte*r',
      'Führt Änderungen in Stammdaten durch',
      'Stimmt Mitgliederlisten für Mitgliederversammlung ab',
      'Verwaltet und aktualisiert halbjährlich alle Stammdaten und Listen',
      'Legt Dokumente in nachvollziehbarer Ordnerstruktur ab'
    ],
    '10000000-0000-0000-0000-000000000010'
  ),
  (
    'IT',
    'Stellt sicher, dass die technische Infrastruktur der Neckarpiraten zuverlässig funktioniert.',
    ARRAY['IT-Infrastruktur', 'Digitale Kommunikationssysteme', 'Webseite und CMS', 'Cloud-System'],
    ARRAY[
      'Leistet technischen Support für Geräte und Kita-Internet',
      'Koordiniert technische Geräte für Veranstaltungen',
      'Erstellt und verwaltet E-Mail-Accounts und Verteiler',
      'Setzt jährlich Passwörter zurück (nach Ämterwahl)',
      'Erstellt und pflegt Signal-Gruppen',
      'Wartet und pflegt die Homepage (CMS)',
      'Verwaltet die Neckarpiraten-Cloud'
    ],
    '10000000-0000-0000-0000-000000000010'
  ),
  (
    'IT-Sicherheit',
    'Stellt sicher, dass alle digitalen Systeme und Daten vor Verlust, Missbrauch und Angriffen geschützt sind.',
    ARRAY['IT-Sicherheitsrichtlinien', 'Backup-Systeme'],
    ARRAY[
      'Überwacht IT-Sicherheitsstandards und setzt Updates um',
      'Erstellt und pflegt Sicherheitsrichtlinien (Passwort, Zugriff, Backup)',
      'Organisiert regelmäßige Backups und testet Wiederherstellung',
      'Schult Rolleninhaber in IT-Sicherheit',
      'Reagiert auf Sicherheitsvorfälle und dokumentiert diese'
    ],
    '10000000-0000-0000-0000-000000000010'
  );
