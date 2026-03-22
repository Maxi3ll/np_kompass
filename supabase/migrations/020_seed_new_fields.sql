-- =====================================================
-- Migration 020: Seed new fields for roles and circles
-- Source: Neckarpiraten_Rollenübersicht_V2_geklärt.md
-- Fields: roles.not_accountable_for, roles.interfaces, roles.guidelines, roles.artifacts
--         circles.accountabilities, circles.domains
-- =====================================================


-- =====================================================
-- CIRCLES - accountabilities & domains
-- =====================================================

-- Neckarpiraten e.V.
UPDATE circles SET
  accountabilities = ARRAY[
    'Gewährleistet die Einhaltung aller gesetzlichen Anforderungen für den eingetragenen Verein (z. B. Satzung, Vereinsregister, Steuerrecht)',
    'Definiert und pflegt die übergeordnete Organisationsstruktur, stellt sicher, dass alle Kreise im Sinne der Satzung arbeiten',
    'Formuliert und überprüft regelmäßig die langfristigen Ziele des Vereins und deren Umsetzung in den untergeordneten Kreisen',
    'Stellt sicher, dass die Mitgliederversammlung fristgerecht, formal korrekt und transparent durchgeführt wird',
    'Hält Kontakt zu externen Stellen (z. B. Vereinsregister, Dachverband) und sorgt für rechtzeitige Meldungen und Dokumentationen'
  ]::TEXT[],
  domains = ARRAY[
    'Satzung und Vereinsregister (exklusiv): Kontrolle über Änderungen und Pflege der Satzung sowie Eintragungen im Vereinsregister',
    'Organisations-Dokumentation (exklusiv): Verwaltung aller offiziellen Vereinsdokumentationen und Protokolle',
    'Mitgliederversammlung-Dokumentation (exklusiv): Kontrolle über Einladungen, Protokolle und Vollmachten'
  ]::TEXT[]
WHERE name = 'Neckarpiraten e.V.';

-- Kita
UPDATE circles SET
  accountabilities = ARRAY[
    'Definiert die strategische Ausrichtung und Prioritäten für alle Kreise',
    'Stellt sicher, dass Governance-Prozesse eingehalten werden',
    'Koordiniert die Organisationskoordination und sorgt für reibungslose Abläufe',
    'Fördert Transparenz und Kommunikation zwischen allen Kreisen'
  ]::TEXT[]
WHERE name = 'Kita';

-- Pädagogisches Team (accountabilities = tbd, skip)

-- Vorstandsitzung
UPDATE circles SET
  accountabilities = ARRAY[
    'Trifft sich regelmäßig vor Ort und digital um notwendige aktuelle Themen zu besprechen',
    'Wahrt Vertraulichkeit über besprochene Themen'
  ]::TEXT[]
WHERE name = 'Vorstandsitzung';

-- Finanzen
UPDATE circles SET
  accountabilities = ARRAY[
    'Erstellt und überwacht das Jahresbudget',
    'Koordiniert Steuererklärung und fristgerechte Einreichung',
    'Prüft Ausgaben und erstellt Verwendungsnachweise',
    'Bearbeitet Spendenbescheinigungen und Förderanträge'
  ]::TEXT[]
WHERE name = 'Finanzen';

-- Haus & Hof
UPDATE circles SET
  accountabilities = ARRAY[
    'Plant und koordiniert Instandhaltungsmaßnahmen und Projekte',
    'Überwacht den laufenden Betrieb und Wartung der technischen Anlagen',
    'Pflegt Außenbereich und Garten',
    'Fördert nachhaltige Lösungen für Gebäude und Gelände'
  ]::TEXT[]
WHERE name = 'Haus & Hof';

-- Küche & Ernährung
UPDATE circles SET
  accountabilities = ARRAY[
    'Erstellt Speisepläne',
    'Organisiert Lebensmitteleinkauf',
    'Lebensmittelvorräte Inventar',
    'Ernährungskonzept'
  ]::TEXT[]
WHERE name = 'Küche & Ernährung';

-- Familien-Management & Kultur
UPDATE circles SET
  accountabilities = ARRAY[
    'Koordiniert alle Elternarbeitsbereiche und Dienstpläne',
    'Organisiert Feste und Veranstaltungen',
    'Begleitet neue Familien beim Onboarding'
  ]::TEXT[]
WHERE name = 'Familien-Management & Kultur';

-- Sicherheit & Compliance
UPDATE circles SET
  accountabilities = ARRAY[
    'Organisiert Unterweisungen und Schulungen',
    'Erstellt, pflegt und aktualisiert Sicherheits- und Compliancerelevante Dokumente',
    'Koordiniert Sicherheitsbegehungen und Notfallpläne'
  ]::TEXT[]
WHERE name = 'Sicherheit & Compliance';

-- Personal
UPDATE circles SET
  accountabilities = ARRAY[
    'Koordiniert Recruiting und Onboarding',
    'Pflegt Personalakten und Vertragsunterlagen',
    'Organisiert Fortbildungen und Teamentwicklung'
  ]::TEXT[]
WHERE name = 'Personal';

-- Kommunikation
UPDATE circles SET
  accountabilities = ARRAY[
    'Pflegt Elterninformationen und Newsletter',
    'Erstellt Inhalte für Social Media und Website',
    'Gestaltet visuelle Materialien im Corporate Design'
  ]::TEXT[]
WHERE name = 'Kommunikation';

-- Technologie & Systeme
UPDATE circles SET
  accountabilities = ARRAY[
    'Wartet IT-Systeme, Infrastruktur und Geräte',
    'Stellt IT-Sicherheit und Backups sicher',
    'Pflegt Cloud-Struktur und Zugriffsrechte'
  ]::TEXT[]
WHERE name = 'Technologie & Systeme';


-- =====================================================
-- ROLLEN - Kreis: Neckarpiraten e.V.
-- =====================================================

-- Neckarpirat*in
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Keine Verantwortung für spezifische operative Aufgaben (diese liegen in den jeweiligen Arbeitsrollen)',
    'Keine Entscheidungsbefugnis über Budget, Personal oder strategische Ausrichtung (liegt bei den entsprechenden Rollen und Gremien)'
  ]::TEXT[],
  interfaces = ARRAY[
    'Alle Rollen im Verein: Zusammenarbeit auf Augenhöhe, respektvolle Kommunikation und gegenseitige Unterstützung',
    'Kommunikation: Nutzung der definierten Kanäle für interne und externe Kommunikation'
  ]::TEXT[],
  guidelines = ARRAY[
    'Konflikte werden offen und respektvoll angesprochen, ggf. unter Einbeziehung einer vermittelnden Rolle',
    'Außenkommunikation erfolgt im Einklang mit den Werten und Leitlinien der Neckarpiraten'
  ]::TEXT[],
  artifacts = '{}'::TEXT[]
WHERE name = 'Neckarpirat*in';

-- Vereinsmitglied
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Keine Verantwortung für die strategische Ausrichtung des Vereins (liegt beim Vorstand)',
    'Keine Verantwortung für die operative Leitung der Kita (liegt beim pädagogischen Team)'
  ]::TEXT[],
  interfaces = ARRAY[
    'Vorstand: Meldet Abwesenheiten und besondere Umstände',
    'Elternarbeit-Koordination: Zusammenarbeit bei der Organisation von Arbeitseinsätzen und Elterndiensten',
    'Kommunikation: Nutzung der vorgegebenen Kanäle für alle relevanten Informationen'
  ]::TEXT[],
  guidelines = ARRAY[
    'Elterndienste werden mindestens vier Wochen im Voraus geplant',
    'Abmeldungen für Elternversammlungen erfolgen spätestens 48 Stunden vorher'
  ]::TEXT[],
  artifacts = '{}'::TEXT[]
WHERE name = 'Vereinsmitglied';

-- Mitgliederversammlungskoordinator
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Moderation der Mitgliederversammlung (liegt bei der Versammlungsleitung)',
    'Rechtliche Prüfung der Satzung (liegt beim Vorstand oder externem Berater)'
  ]::TEXT[],
  interfaces = ARRAY[
    'Vom Vorstand: Bereitstellung der Berichte und Abstimmung der Tagesordnung',
    'An den Notar: Vollständige und korrekte Unterlagen für die Eintragung des Vorstands',
    'An Interne Kommunikation: Hinweis auf Termin und ggf. vorbereitende Informationen für die Eltern'
  ]::TEXT[],
  guidelines = ARRAY[
    'Fristenregel: Einladungen mindestens X Wochen vor der Versammlung versenden',
    'Dokumentationsstandard: Einheitliche Ablage und Benennung aller Versammlungsunterlagen',
    'Vollmachtsprüfung: Spätestens X Tage vor der Versammlung abgeschlossen'
  ]::TEXT[],
  artifacts = ARRAY[
    'Einladungsschreiben zur Mitgliederversammlung',
    'Vollmachten der Mitglieder',
    'Tagesordnung / Agenda',
    'Wahlzettel für Kita und Hort',
    'Protokoll der Mitgliederversammlung',
    'Unterlagen für den Notar'
  ]::TEXT[]
WHERE name = 'Mitgliederversammlungskoordinator';

-- Vereinsvorstand (exists in multiple circles, same content)
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Operative Leitung des Kita-Alltags (liegt bei Pädagogischer Leitung)',
    'Erstellung pädagogischer Konzepte im Detail (liegt bei Pädagogischer Leitung und Pädagogik & Kinderschutz)'
  ]::TEXT[],
  interfaces = ARRAY[
    'An Interne Kommunikation: Bereitstellung von Informationen für interne Kommunikation',
    'Vom Mitgliederversammlungskoordinator: Unterstützung bei formalen Prozessen und Notarterminen'
  ]::TEXT[],
  guidelines = ARRAY[
    'Regelmäßige Überprüfung der Satzung (z. B. jährlich)',
    'Transparenzpflicht: Alle relevanten Änderungen werden zeitnah an Mitglieder kommuniziert'
  ]::TEXT[],
  artifacts = ARRAY[
    'Satzung',
    'Strategisches Zielbild (Verein)',
    'Protokolle und Beschlüsse des Vorstands'
  ]::TEXT[]
WHERE name = 'Vereinsvorstand';

-- Finanzvorstand (exists in multiple circles, same content)
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Keine Verantwortung für die operative Durchführung von Investitionsprojekten (liegt bei Haus & Hof Entwicklung oder Zentraleinkauf)',
    'Keine Verantwortung für die tägliche Buchung einzelner Belege (liegt bei Kassieramt oder Buchhaltung)'
  ]::TEXT[],
  interfaces = ARRAY[
    'Vorstand: Abstimmung zu strategischen Finanzentscheidungen und Investitionen',
    'Haus & Hof Entwicklung: Zusammenarbeit bei Investitionsplanung und Förderanträgen',
    'Zentraleinkauf: Abstimmung bei größeren Anschaffungen',
    'Kassieramt: Enge Zusammenarbeit bei Buchhaltung und finaler Abstimmung',
    'Kommunikation: Unterstützung bei der transparenten Information der Eltern'
  ]::TEXT[],
  guidelines = ARRAY[
    'Budgetplanung erfolgt jährlich bis spätestens Ende Januar',
    'Spendenbescheinigungen werden innerhalb von vier Wochen nach Anfrage ausgestellt'
  ]::TEXT[],
  artifacts = ARRAY[
    'Jahresbudget und Haushaltsplan',
    'Verwendungsnachweise und Förderabrechnungen',
    'Übersicht über Investitionen',
    'Spendenbescheinigungen',
    'Buchhaltungsprüfprotokolle'
  ]::TEXT[]
WHERE name = 'Finanzvorstand';

-- Personalvorstand Kita (exists in multiple circles, same content)
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Operative Dienstplanung und Urlaubskoordination (liegt bei Pädagogischer Leitung)',
    'Organisation von Geburtstagsgeschenken und Teamaktionen (liegt bei Personalvorstands-Assistenz)',
    'Finanzielle Entscheidungen und Budgetplanung (liegt beim Finanzvorstand)'
  ]::TEXT[],
  interfaces = ARRAY[
    'An Pädagogische Leitung: Klare Vorgaben zur Personalplanung und strategischen Ausrichtung',
    'An Personalvorstands-Assistenz: Unterstützung bei Organisation, Dokumentation und Kommunikation',
    'An Vorstand: Regelmäßige Updates zur Personalsituation und Einhaltung rechtlicher Standards'
  ]::TEXT[],
  guidelines = ARRAY[
    'Mitarbeitergespräche jährlich im Q3 durchführen',
    'Bewerbungsunterlagen DSGVO-konform löschen oder Speichern nach Abschluss des Prozesses',
    'Jahresbericht spätestens 1 Woche vor Mitgliederversammlung fertigstellen',
    'Vertretung der Pädagogischen Leitung, wenn beide Leitungen ausfallen'
  ]::TEXT[],
  artifacts = ARRAY[
    'Personalplanungsdokumente',
    'Mitarbeitergesprächsprotokolle',
    'Arbeitszeugnisse',
    'Bewerbungs- und Einstellungsunterlagen',
    'Jahresbericht zur Mitarbeitersituation'
  ]::TEXT[]
WHERE name = 'Personalvorstand Kita';

-- Revisor
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Keine Verantwortung für die operative Durchführung von Buchungen oder Zahlungen (liegt bei Kasse und Buchhaltung & Controlling)'
  ]::TEXT[],
  interfaces = ARRAY[
    'Finanzvorstand: Zusammenarbeit bei der Jahresabschlussprüfung und Abstimmung bei Auffälligkeiten',
    'Kasse & Buchhaltung: Bereitstellung aller relevanten Unterlagen für die Prüfung'
  ]::TEXT[],
  guidelines = ARRAY[
    'Revision erfolgt mindestens einmal jährlich vor der Mitgliederversammlung'
  ]::TEXT[],
  artifacts = ARRAY[
    'Revisionsberichte',
    'Prüfprotokolle'
  ]::TEXT[]
WHERE name = 'Revisor';


-- =====================================================
-- ROLLEN - Kreis: Kita
-- =====================================================

-- Neckarpirat Mama/Papa
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Keine Verantwortung für die pädagogische Gestaltung des Tagesablaufs (liegt beim Team)',
    'Keine Verantwortung für die Organisation von Elternarbeit oder Vereinsaufgaben (liegt bei entsprechenden Rollen)'
  ]::TEXT[],
  interfaces = ARRAY[
    'Pädagogisches Team: Zusammenarbeit bei Bring-/Abholzeiten und Krankheitsmeldungen',
    'Hygiene-Rolle: Information bei relevanten Krankheitsfällen',
    'Kommunikation: Nutzung der vorgegebenen Kanäle für alle Mitteilungen'
  ]::TEXT[],
  guidelines = ARRAY[
    'Spätere Ankunft wird mindestens einen Tag vorher angekündigt',
    'Krankmeldungen erfolgen vor Kitabeginn'
  ]::TEXT[],
  artifacts = '{}'::TEXT[]
WHERE name = 'Neckarpirat Mama/Papa';

-- Holacracy-Trainer*in
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Keine Verantwortung für die strategische Ausrichtung des Vereins',
    'Keine Entscheidungsbefugnis über Rollen oder Prioritäten (nur Prozessbegleitung)'
  ]::TEXT[],
  interfaces = ARRAY[
    'Kreis-Koordinatoren: Zusammenarbeit bei der Einführung neuer Mitglieder und der Moderation von Meetings',
    'Kommunikation: Unterstützung bei der Bereitstellung von Schulungsmaterialien'
  ]::TEXT[],
  guidelines = ARRAY[
    'Einführungsschulungen erfolgen vor dem Eintritt neuer Familien',
    'Kreistreffen werden bei Bedarf durch den Trainer moderiert'
  ]::TEXT[],
  artifacts = ARRAY[
    'Schulungsunterlagen und Leitfäden',
    'Feedback-Dokumentation zur Holacracy-Anwendung'
  ]::TEXT[]
WHERE name = 'Holacracy-Trainer*in';

-- Projekt-Koordination
UPDATE roles SET
  not_accountable_for = '{}'::TEXT[],
  interfaces = ARRAY[
    'EV: Inhaltlich regelmäßig abholen',
    'Vorstandsitzung: Aktiv einbinden und nutzen',
    'Pädagogisches Team: Inhaltlich regelmäßig abholen',
    'Sonstige relevante Rollen: Aktiv ins Projektteam einbeziehen oder als relevante Person bei Bedarf nutzen',
    'Finanzvorstand und Controlling: Information über Kosten und Ausgabenverlauf'
  ]::TEXT[],
  guidelines = '{}'::TEXT[],
  artifacts = ARRAY[
    'Projektplan',
    'Lieferantenliste und -kontakte',
    'Kostenvoranschläge wenn nötig'
  ]::TEXT[]
WHERE name = 'Projekt-Koordination';


-- =====================================================
-- ROLLEN - Kreis: Pädagogisches Team
-- =====================================================

-- Pädagogik & Kinderschutz
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Keine Verantwortung für die operative Umsetzung von pädagogischen Maßnahmen im Alltag (liegt bei Leitung und Team)',
    'Keine Verantwortung für die rechtliche Vertretung bei Kinderschutzfällen (liegt beim Vorstand)'
  ]::TEXT[],
  interfaces = ARRAY[
    'Leitung & Team: Zusammenarbeit bei der Abstimmung und Umsetzung des pädagogischen Konzepts',
    'Vorstand: Abstimmung bei rechtlichen Fragen und strategischen Entscheidungen',
    'Kommunikation: Unterstützung bei der Bereitstellung von Konzepten für Eltern'
  ]::TEXT[],
  guidelines = ARRAY[
    'Pädagogisches Konzept wird mindestens einmal jährlich überprüft und bei Bedarf angepasst',
    'Kinderschutzkonzept wird mindestens alle zwei Jahre aktualisiert',
    'Teilnahme an mindestens einer Kinderschutz-Fortbildung pro Jahr'
  ]::TEXT[],
  artifacts = ARRAY[
    'Pädagogisches Konzept (aktuelle Version)',
    'Kinderschutzkonzept (aktuelle Version)',
    'Dokumentation von Fortbildungen'
  ]::TEXT[]
WHERE name = 'Pädagogik & Kinderschutz';

-- Pädagogische Qualitätssicherung
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Keine Verantwortung für die operative Umsetzung im Alltag (liegt bei Pädagogischer Leitung)',
    'Keine Verantwortung für Budgetfreigaben (liegt bei Finanzvorstand)'
  ]::TEXT[],
  interfaces = ARRAY[
    'Pädagogische Leitung: Abstimmung bei Konzeptanpassungen',
    'Personalvorstand: Zusammenarbeit bei Fortbildungsplanung',
    'Kommunikation: Unterstützung bei Elternbefragungen'
  ]::TEXT[],
  guidelines = '{}'::TEXT[],
  artifacts = ARRAY[
    'Qualitätsberichte und Feedbackdokumentation'
  ]::TEXT[]
WHERE name = 'Pädagogische Qualitätssicherung';


-- =====================================================
-- ROLLEN - Kreis: Vorstandsitzung
-- =====================================================

-- Organisationskoordination
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Pädagogische Leitung des Kita-Alltags (liegt bei Pädagogischer Leitung)',
    'Finanzbuchhaltung und Budgetplanung (liegt beim Vorstand/Kassenwart)',
    'Kommunikation mit Eltern (liegt bei Interne Kommunikation)'
  ]::TEXT[],
  interfaces = ARRAY[
    'Vom Vorstand: Strategische Vorgaben und rechtliche Rahmenbedingungen',
    'An Pädagogische Leitung: Weitergabe von Änderungen in Satzung oder Geschäftsordnung, die den Betrieb betreffen',
    'An Mitgliederversammlungskoordinator: Bereitstellung des Vorstandsberichts für die Versammlung'
  ]::TEXT[],
  guidelines = ARRAY[
    'Regelmäßige Überprüfung des Versicherungsschutzes (z. B. jährlich)',
    'Berichtsvorlage für die Mitgliederversammlung spätestens X Wochen vor Termin fertigstellen',
    'Änderungen der Geschäftsordnung bedürfen der Abstimmung in der Elternschaft'
  ]::TEXT[],
  artifacts = ARRAY[
    'Versicherungsverträge und Policen',
    'Vorstandsbericht für Mitgliederversammlung',
    'Arbeitsdokumente zur Organisationsentwicklung'
  ]::TEXT[]
WHERE name = 'Organisationskoordination';

-- Vorstandsassistenz
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Keine Verantwortung für die strategische Ausrichtung des Vereins (liegt beim Vorstand)',
    'Keine Verantwortung für die operative Umsetzung von Versicherungsverträgen (liegt bei Finanzvorstand oder Kassieramt)'
  ]::TEXT[],
  interfaces = ARRAY[
    'Vorstand: Abstimmung bei Dachverbandsinformationen und Versicherungsfragen',
    'Hort-Rolle: Zusammenarbeit bei der BGW-Abfrage',
    'Finanzvorstand: Abstimmung bei Versicherungsanfragen und Kosten',
    'Kommunikation: Unterstützung bei der Weitergabe von Informationen an Eltern'
  ]::TEXT[],
  guidelines = ARRAY[
    'E-Mails werden innerhalb von 48 Stunden beantwortet oder weitergeleitet',
    'Führungszeugnisse werden spätestens vier Wochen vor Fristende angefordert',
    'BGW-Meldungen erfolgen fristgerecht gemäß Vorgaben'
  ]::TEXT[],
  artifacts = ARRAY[
    'Übersicht über Führungszeugnisse',
    'BGW-Meldeliste',
    'Protokolle von Dachverbands- und Mitgliedersitzungen',
    'Versicherungsdokumentation'
  ]::TEXT[]
WHERE name = 'Vorstandsassistenz';


-- =====================================================
-- ROLLEN - Kreis: Finanzen
-- =====================================================

-- Fundraising
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Keine Verantwortung für die strategische Finanzplanung (liegt beim Finanzvorstand)',
    'Keine Verantwortung für die operative Durchführung von Veranstaltungen oder Projekten (liegt bei den jeweiligen Rollen)'
  ]::TEXT[],
  interfaces = ARRAY[
    'Finanzvorstand: Abstimmung und Bestätigung bei Förderanträgen und Abrechnungen und Geldeingang',
    'Kommunikation: Unterstützung bei der Bewerbung von Spendenaktionen'
  ]::TEXT[],
  guidelines = ARRAY[
    'Förderanträge werden mindestens einmal pro Quartal geprüft und bei Bedarf gestellt',
    'Raumnutzungen werden nur nach schriftlicher Bestätigung und Pfandregelung vergeben'
  ]::TEXT[],
  artifacts = ARRAY[
    'Übersicht über Förderanträge und deren Status',
    'Liste der Sachspenden und Spender',
    'Dokumentation der Raumnutzungen und Abrechnungen',
    'Zugangsdaten und Inserate für eBay-Kleinanzeigen'
  ]::TEXT[]
WHERE name = 'Fundraising';

-- Buchhaltung
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Keine Verantwortung für die strategische Finanzplanung (liegt beim Finanzvorstand)',
    'Keine Verantwortung für die Erstellung der Steuererklärung (liegt beim Finanzvorstand, in Abstimmung mit dieser Rolle)'
  ]::TEXT[],
  interfaces = ARRAY[
    'Finanzvorstand: Abstimmung bei Jahresabschluss und strategischen Finanzentscheidungen',
    'Kassieramt: Zusammenarbeit bei der Überprüfung von Rechnungen',
    'Kommunikation: Unterstützung bei der Information der Eltern zu Beiträgen und Zahlungsfristen',
    'Personalverwaltung: Erfragen der Steuer- und Sozialabgaben für die Hilfskräfte'
  ]::TEXT[],
  guidelines = ARRAY[
    'Kontenprüfung erfolgt mindestens quartalsweise',
    'Jahresabschluss wird bis spätestens Ende Februar des Folgejahres abgeschlossen'
  ]::TEXT[],
  artifacts = ARRAY[
    'Buchungsübersicht und Kontenprotokolle',
    'Liste der Mitgliedsbeiträge und Zahlungsstatus',
    'Jahresabschlussunterlagen'
  ]::TEXT[]
WHERE name = 'Buchhaltung';

-- Controlling
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Keine Verantwortung für die operative Durchführung von Zahlungen (liegt bei Kasse)',
    'Keine Verantwortung für die Verbuchung oder Kontenpflege (liegt bei Buchhaltung)',
    'Keine Entscheidungskompetenz über Budgetfreigaben oder strategische Finanzplanung (liegt beim Finanzvorstand bzw. Vorstand)'
  ]::TEXT[],
  interfaces = ARRAY[
    'Finanzvorstand: Liefert Planannahmen für das Budget und trifft strategische Finanzentscheidungen auf Basis der Analysen',
    'Kasse: Stellt aktuelle Informationen zu Kontoständen und Zahlungsflüssen bereit',
    'Buchhaltung: Stellt aktuelle Auswertungen und Abschlusszahlen als Datengrundlage zur Verfügung'
  ]::TEXT[],
  guidelines = ARRAY[
    'Budgetabgleich erfolgt mindestens quartalsweise',
    'Liquiditätsvorschau wird mindestens quartalsweise aktualisiert',
    'Wesentliche Abweichungen werden zeitnah an den Finanzvorstand kommuniziert'
  ]::TEXT[],
  artifacts = ARRAY[
    'Jahresbudget (Plan-Ist-Übersicht)',
    'Finanzübersicht (kompakte Zusammenfassung)',
    'Liquiditätsvorschau (rollierend)',
    'Übersicht wesentlicher finanzieller Risiken'
  ]::TEXT[]
WHERE name = 'Controlling';

-- Kasse
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Keine Verantwortung für die strategische Finanzplanung oder Budgeterstellung (liegt beim Finanzvorstand)',
    'Keine Verantwortung für die finale Abstimmung des Jahresabschlusses (liegt bei Finanzvorstand und Buchhaltung)'
  ]::TEXT[],
  interfaces = ARRAY[
    'Finanzvorstand: Abstimmung bei größeren Zahlungen',
    'Buchhaltung & Controlling: Zusammenarbeit bei der korrekten Verbuchung und Jahresabschluss',
    'Kommunikation: Unterstützung bei der Information von Eltern zu Auslagen und Zahlungsprozessen',
    'Personalverwaltung bzgl. Mitarbeitenden-Gehälter und Zahlliste vom Dachverband'
  ]::TEXT[],
  guidelines = ARRAY[
    'Gehaltsüberweisungen erfolgen bis spätestens am letzten Werktag des Monats'
  ]::TEXT[],
  artifacts = ARRAY[
    'Zahlungsübersicht',
    'Bargeldprotokoll für Veranstaltungen und Personalbedarf'
  ]::TEXT[]
WHERE name = 'Kasse';

-- Zentraleinkauf
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Einkauf von Lebensmitteln (liegt bei Köchin)',
    'Pädagogische Entscheidungen zu Materialien (liegen bei Pädagogischer Leitung)',
    'Finanzbuchhaltung und Zahlungsfreigaben (liegen beim Finanzvorstand)'
  ]::TEXT[],
  interfaces = ARRAY[
    'An Finanzvorstand: Abstimmung bei Budget und größeren Anschaffungen',
    'An Pädagogische Leitung: Klärung von Bedarfen für den Kita-Bereich',
    'An Hausmeisteramt: Koordination bei Heizölbestellung und Stromanbieterwechsel',
    'Von Drittmittel-Rolle: Unterstützung bei Förderanfragen'
  ]::TEXT[],
  guidelines = ARRAY[
    'Inventur mindestens einmal pro Quartal durchführen',
    'Heizölbestellung nur nach Marktpreisprüfung und Freigabe durch Finanzvorstand',
    'Kostenoptimierung: Bei größeren Anschaffungen mindestens zwei Angebote einholen'
  ]::TEXT[],
  artifacts = ARRAY[
    'Inventarliste',
    'Jahresabschlussbericht für Non-Food-Bereich',
    'Bestell- und Lieferdokumente'
  ]::TEXT[]
WHERE name = 'Zentraleinkauf';


-- =====================================================
-- ROLLEN - Kreis: Haus & Hof
-- =====================================================

-- Schlüsselverwaltung
UPDATE roles SET
  not_accountable_for = '{}'::TEXT[],
  interfaces = ARRAY[
    'Vorstand: Zusammenarbeit bei Schlüsselverlusten',
    'Zentraleinkauf: Abstimmung bei der Bestellung von Ersatzschlüsseln'
  ]::TEXT[],
  guidelines = ARRAY[
    'Schlüsselpfand wird nur gegen Rückgabe des Schlüssels erstattet'
  ]::TEXT[],
  artifacts = ARRAY[
    'Schlüsselverwaltungsliste'
  ]::TEXT[]
WHERE name = 'Schlüsselverwaltung';

-- Aquarium
UPDATE roles SET
  not_accountable_for = '{}'::TEXT[],
  interfaces = ARRAY[
    'Finanzen: Klärt Budget für Pflegeprodukte und Ersatzteile',
    'Neckarpirat Mama/Papa: Stimmt sich ab, um Fütterung an Schließtagen sicherzustellen',
    'Zentraleinkauf: Meldet Bedarf an Futter oder Pflegemitteln rechtzeitig'
  ]::TEXT[],
  guidelines = ARRAY[
    'Wasserwechsel erfolgt spätestens alle 7 Tage',
    'Vertretung für Fütterung muss mindestens 48 Stunden vor Schließtagen organisiert sein'
  ]::TEXT[],
  artifacts = ARRAY[
    'Pflegeplan für Aquarium (inkl. Wasserwechsel, Reinigung, Fütterung)',
    'Dokumentation der Wasserwerte'
  ]::TEXT[]
WHERE name = 'Aquarium';

-- Hausmeister*in
UPDATE roles SET
  not_accountable_for = '{}'::TEXT[],
  interfaces = ARRAY[
    'An Elternarbeits-Koordination: Weitergabe von Aufgaben für Arbeits- und Putzeinsätze',
    'An Finanzvorstand: Abstimmung bei größeren Reparaturen oder Anschaffungen',
    'An Pädagogische Leitung: Information über Einschränkungen im Betrieb bei Wartungsarbeiten'
  ]::TEXT[],
  guidelines = ARRAY[
    'Wartung aller Hausgeräte mindestens einmal jährlich durchführen',
    'Schädlingsprophylaxe regelmäßig und dokumentiert umsetzen',
    'Überprüfung aller hitzeschutzrelevanten Geräte und Anbauten gemäß Hitzeschutzplan jährlich Anfang Mai'
  ]::TEXT[],
  artifacts = ARRAY[
    'Wartungs- und Reparaturprotokolle',
    'Liste der Hausgeräte und deren Wartungsintervalle',
    'Schädlingsprophylaxe-Dokumentation'
  ]::TEXT[]
WHERE name = 'Hausmeister*in';

-- Haus & Hof Entwicklung
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Keine Verantwortung für die tägliche Reinigung oder kurzfristige Reparaturen (liegt bei Hausmeister oder Reinigung)',
    'Keine Verantwortung für die Finanzierung oder Budgetfreigabe (liegt bei Finanzen)'
  ]::TEXT[],
  interfaces = ARRAY[
    'Finanzen: Abstimmung zu Budget und Förderanträgen',
    'Hausdienst / Technik: Zusammenarbeit bei der Umsetzung von Projekten',
    'Vorstand: Einbindung bei rechtlichen Fragen und größeren Investitionen',
    'Pädagogische Leitung: Sicherstellen, dass bauliche Maßnahmen das pädagogische Konzept unterstützen'
  ]::TEXT[],
  guidelines = ARRAY[
    'Zielbild wird mindestens einmal halbjährlich überprüft und bei Bedarf angepasst',
    'Fördermöglichkeiten werden quartalsweise geprüft'
  ]::TEXT[],
  artifacts = ARRAY[
    'Gesamtzielbild Haus & Hof',
    'Projektübersicht inkl. Priorisierung und Status',
    'Übersicht über Förderprogramme und Fristen'
  ]::TEXT[]
WHERE name = 'Haus & Hof Entwicklung';

-- Garten & Hof
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Keine Verantwortung für die Finanzierung von größeren Anschaffungen (liegt bei Finanzen)',
    'Keine Verantwortung für die Gestaltung des pädagogischen Konzepts im Außenbereich (liegt bei Pädagogik)'
  ]::TEXT[],
  interfaces = ARRAY[
    'Zentraleinkauf: Zusammenarbeit bei der Beschaffung von Gartenmaterialien',
    'Hausmeister: Abstimmung bei größeren Reparaturen oder baulichen Maßnahmen',
    'Finanzen: Klärung von Budget für Geräte oder Materialien',
    'Elternarbeit-Koordination: Planung von To Dos bei der Kehrwoche'
  ]::TEXT[],
  guidelines = ARRAY[
    'Spielgeräte-Inspektion erfolgt spätestens einmal jährlich und wird dokumentiert',
    'Schneeräumung erfolgt vor Öffnung der Kita bei jeder relevanten Wetterlage'
  ]::TEXT[],
  artifacts = ARRAY[
    'Inspektionsprotokoll für Spielgeräte',
    'Inventarliste Gartenmaterial und Geräte'
  ]::TEXT[]
WHERE name = 'Garten & Hof';

-- Haus & Hof Betrieb
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Keine Verantwortung für die langfristige Weiterentwicklung der Immobilie (liegt bei Haus & Hof Entwicklung)',
    'Keine Verantwortung für Budgetfreigaben (liegt bei Finanzen)'
  ]::TEXT[],
  interfaces = ARRAY[
    'Zentraleinkauf: Zusammenarbeit bei Heizölbestellung und ggf. Materialbeschaffung',
    'Finanzen: Abstimmung zu Kosten für kleinere Reparaturen',
    'Haus & Hof Entwicklung: Austausch bei Überschneidungen zwischen kurzfristigen und langfristigen Maßnahmen'
  ]::TEXT[],
  guidelines = ARRAY[
    'Zählerstände werden monatlich erfasst und gemeldet',
    'Solarpaneele werden mindestens einmal pro Quartal gereinigt'
  ]::TEXT[],
  artifacts = ARRAY[
    'To-Do-Liste Haus & Hof inkl. Priorisierung',
    'Zählerstandsprotokoll',
    'Reinigungsplan und Dokumentation der Kontrolle',
    'Wartungsprotokoll Solaranlage'
  ]::TEXT[]
WHERE name = 'Haus & Hof Betrieb';


-- =====================================================
-- ROLLEN - Kreis: Küche & Ernährung
-- =====================================================

-- Speiseplan
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Einkauf von Lebensmitteln und Non-Food-Artikeln',
    'Entscheidungen zum Ernährungskonzept (liegen bei Ernährungskonzept)'
  ]::TEXT[],
  interfaces = ARRAY[
    'An Köchin: Abstimmung zu Kochplänen und Sonderregelungen, Feedback dazu, wie Essen ankommt und Mengen',
    'An Lebensmitteleinkauf: Mengen und Produkte'
  ]::TEXT[],
  guidelines = ARRAY[
    'Speisepläne mindestens 5 Tage vor Monatsbeginn veröffentlichen'
  ]::TEXT[],
  artifacts = ARRAY[
    'Monatliche Speisepläne',
    'Rezeptsammlung'
  ]::TEXT[]
WHERE name = 'Speiseplan';

-- Lebensmitteleinkauf (frisch)
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Einkauf von Non-Food-Artikeln (liegt bei Rolle Zentraleinkauf)',
    'Marktforschung zu Rabatten und Einsparungen',
    'Einkauf von haltbaren Lebensmitteln'
  ]::TEXT[],
  interfaces = ARRAY[
    'An Speiseplan: Abstimmung zu Speiseplänen und Sonderregelungen (z. B. Hitzekochplan)',
    'Köch*in: Zuruf wenn spontane Einkäufe notwendig sind',
    'Buchhaltung: Weiterleiten der Rechnungen bei Bankeinzug',
    'Kasse: Einreichen der Rechnungen Backwaren'
  ]::TEXT[],
  guidelines = ARRAY[
    'Bio-Qualität für alle frischen Lebensmittel sicherstellen'
  ]::TEXT[],
  artifacts = ARRAY[
    'Einkaufplanung',
    'Lieferantenliste',
    'Bestell- und Lieferdokumente'
  ]::TEXT[]
WHERE name = 'Lebensmitteleinkauf (frisch)';

-- Lebensmitteleinkauf (trocken)
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Einkauf von Non-Food-Artikeln (liegt bei Rolle Zentraleinkauf)',
    'Marktforschung zu Rabatten und Einsparungen',
    'Einkauf von Obst, Gemüse, Milchprodukten und Backwaren'
  ]::TEXT[],
  interfaces = ARRAY[
    'An Speiseplan: Abstimmung zu Speiseplänen und Sonderregelungen (z. B. Hitzekochplan)',
    'Köch*in: Zuruf wenn spontane Einkäufe notwendig sind',
    'Buchhaltung: Weiterleiten der Rechnungen bei Bankeinzug',
    'Kasse: Einreichen der Rechnungen'
  ]::TEXT[],
  guidelines = ARRAY[
    'Vorratsprüfung regelmäßig durchführen',
    'Vorräte regelmäßig auf Schädlingsbefall prüfen',
    'Bio-Qualität für alle Lebensmittel sicherstellen'
  ]::TEXT[],
  artifacts = ARRAY[
    'Vorratsliste',
    'Einkaufplanung Trockenlebensmittel',
    'Bestell- und Lieferdokumente'
  ]::TEXT[]
WHERE name = 'Lebensmitteleinkauf (trocken)';

-- AdHoc Einkauf Lebensmittel
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Einkauf von Non-Food-Artikeln (liegt bei Rolle Zentraleinkauf)',
    'Marktforschung zu Rabatten und Einsparungen'
  ]::TEXT[],
  interfaces = ARRAY[
    'Köch*in, Lebensmitteleinkauf (frisch), Lebensmitteleinkauf (trocken): Zuruf wenn spontane Einkäufe notwendig sind',
    'Kasse: Einreichen der Rechnungen'
  ]::TEXT[],
  guidelines = ARRAY[
    'Bio-Qualität für alle Lebensmittel sicherstellen'
  ]::TEXT[],
  artifacts = '{}'::TEXT[]
WHERE name = 'AdHoc Einkauf Lebensmittel';

-- Ernährungskonzept
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Entscheidet nicht über das konkrete Tagesmenü oder einzelne Gerichte (liegt bei Speiseplan und Lebensmitteleinkauf bzw. der Küche)',
    'Führt keine Lebensmittelkontrollen oder Einkaufsentscheidungen selbst durch'
  ]::TEXT[],
  interfaces = ARRAY[
    'Speiseplan und Lebensmitteleinkauf: Bereitstellen von verbindlichen Qualitätskriterien und Grundsätzen',
    'Köch*in / Bufdi: Setzt das Ernährungskonzept im täglichen Kitabetrieb um und informiert über Grenzen, Möglichkeiten oder notwendige Anpassungen',
    'Pädagogische Leitung / Gruppenpädagog*innen: Integriert das Ernährungskonzept in den Alltag; gibt praktische Rückmeldungen',
    'Rolle Hygiene: Austausch zu Allergien, Infektionsschutz, Hygienevorgaben und Gesundheitsprävention'
  ]::TEXT[],
  guidelines = ARRAY[
    'Neue Lebensmittelqualitätsstandards oder Ausnahmen dürfen erst nach Abstimmung mit der Rolle Ernährungskonzept im Speiseplan umgesetzt werden',
    'Grundsätze zur Zuckerreduktion sind verbindlich, Ausnahmen (Feste, Geburtstage) werden klar definiert',
    'Abstimmung zentraler Änderungen im Ernährungskonzept mit der Elternschaft im Rahmen einer EV'
  ]::TEXT[],
  artifacts = ARRAY[
    'Schriftliches Ernährungskonzept der Elterninitiative inkl. Definition Bio und zuckerfrei',
    'Dokumentation zu Qualitätsstandards für Lebensmittel',
    'Feedbacksammlung aus Elternschaft, Pädagogik und Küche'
  ]::TEXT[]
WHERE name = 'Ernährungskonzept';


-- =====================================================
-- ROLLEN - Kreis: Familien-Management & Kultur
-- =====================================================

-- Elternarbeit-Koordination
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Keine Verantwortung für die tatsächliche Durchführung der Dienste (liegt bei den jeweiligen Eltern)'
  ]::TEXT[],
  interfaces = ARRAY[
    'Vorstand: Zusammenarbeit bei der Organisation von Arbeits- und Putzeinsätzen',
    'Kommunikation: Unterstützung bei der Information der Eltern über Dienste und Einsätze',
    'Haus & Hof / Sicherheit & Compliance: Übernahme von anstehenden Tätigkeiten in die Planung'
  ]::TEXT[],
  guidelines = ARRAY[
    'Dienstlisten für Arbeitseinsätze werden mindestens vier Wochen vor dem Einsatz veröffentlicht',
    'Kehrwochen- und Elterndienstplan wird quartalsweise versandt'
  ]::TEXT[],
  artifacts = ARRAY[
    'Dienstkalender und Dienstlisten',
    'Kehrwochenplan',
    'Übersichtsliste aller geleisteten Dienste',
    'Definition der einzelnen Elterndienste'
  ]::TEXT[]
WHERE name = 'Elternarbeit-Koordination';

-- Feste & Veranstaltungen
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Keine Verantwortung für die strategische Öffentlichkeitsarbeit (liegt bei Kommunikation)'
  ]::TEXT[],
  interfaces = ARRAY[
    'Zentraleinkauf: Abstimmung bei der Beschaffung von Materialien und Lebensmitteln',
    'Finanzen: Klärung des Budgets für Veranstaltungen',
    'Kommunikation: Unterstützung bei der Bewerbung von Veranstaltungen',
    'Pädagogisches Team: Abstimmung der Events im Kalenderjahr'
  ]::TEXT[],
  guidelines = '{}'::TEXT[],
  artifacts = ARRAY[
    'Eventkalender und Eventpläne',
    'Helferlisten',
    'Budgetübersicht für Veranstaltungen',
    'Materialliste für Events'
  ]::TEXT[]
WHERE name = 'Feste & Veranstaltungen';

-- Familienonboarding und -offboarding
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Pädagogische Eingewöhnung (liegt bei Pädagogischer Leitung)',
    'Finanzielle Vertragsinhalte (liegen beim Vorstand/Kassenwart)',
    'Öffentlichkeitsarbeit außerhalb des Onboarding-Prozesses (liegt bei Interne Kommunikation)'
  ]::TEXT[],
  interfaces = ARRAY[
    'Vom Vorstand: Vorgaben zu Platzkapazitäten und Vertragsinhalten',
    'Von Pädagogischer Leitung: Unterstützung bei Hospitation und Eingewöhnung',
    'An Interne Kommunikation: Weitergabe von Terminen und relevanten Infos für neue Familien',
    'An das Team: Transparente Kommunikation zu neuen Familien und Eingewöhnungsplänen',
    'Arbeitsschutz & Hygiene: Bereitstellung der relevanten Schulungsunterlagen'
  ]::TEXT[],
  guidelines = ARRAY[
    'Fristenregel: Zusagen/Absagen innerhalb von X Tagen nach Entscheidung',
    'Datenschutz: Warteliste und Familienunterlagen DSGVO-konform verwalten',
    'Masernschutzprüfung: Vor Beginn der Eingewöhnung abgeschlossen und dokumentiert',
    'Arbeitsschutzunterweisung: Vor Beginn der Eingewöhnung an die Familien zugestellt'
  ]::TEXT[],
  artifacts = ARRAY[
    'Warteliste',
    'Kennenlernformulare',
    'Betreuungsverträge inkl. Anhänge',
    'Willkommensbooklet und Eingewöhnungsinfos',
    'Unterweisungen und Belehrungen',
    'Statistikmeldungen'
  ]::TEXT[]
WHERE name = 'Familienonboarding und -offboarding';

-- Neckarpirat-Paten
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Keine Verantwortung für die formale Aufnahme in den Verein (liegt bei Familien-Onboarding)',
    'Keine Verantwortung für die Zuteilung von Rollen (liegt bei Kreis-Koordinator Kita-Kreis)'
  ]::TEXT[],
  interfaces = ARRAY[
    'Familien-Onboarding: Zusammenarbeit bei der Weitergabe von Informationen und Unterlagen',
    'Elternarbeit-Koordination: Abstimmung bei der Unterstützung neuer Familien bei Rollenübernahme',
    'Kommunikation: Nutzung der vorgesehenen Kanäle für Informationen'
  ]::TEXT[],
  guidelines = ARRAY[
    'Erstkontakt erfolgt innerhalb der ersten Woche nach Aufnahme der Familie',
    'Regelmäßiger Austausch (mindestens einmal pro Monat) während der ersten sechs Monate'
  ]::TEXT[],
  artifacts = ARRAY[
    'Dokumentation der Begleitung (z. B. Notizen zu offenen Fragen)'
  ]::TEXT[]
WHERE name = 'Neckarpirat-Paten';


-- =====================================================
-- ROLLEN - Kreis: Sicherheit & Compliance
-- =====================================================

-- Betriebssicherheit
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Operative Reparaturen und bauliche Umsetzung (liegen beim Hausmeisteramt)'
  ]::TEXT[],
  interfaces = ARRAY[
    'An Hausmeisteramt: Abstimmung bei Sicherheitsbegehungen und baulichen Maßnahmen',
    'An Vorstand: Meldung von sicherheitsrelevanten Änderungen und Budgetbedarf',
    'An Pädagogische Leitung: Synchronisierung mit Kinderschutzkonzept',
    'Vom Team: Teilnahme an jährlichen Unterweisungen'
  ]::TEXT[],
  guidelines = ARRAY[
    'Gefährdungsbeurteilung mindestens einmal jährlich überprüfen und aktualisieren',
    'Legionellen-Prävention monatlich durchführen und dokumentieren',
    'Betriebsanweisungen in verständlicher Sprache und gut sichtbar anbringen'
  ]::TEXT[],
  artifacts = ARRAY[
    'Gefährdungsbeurteilung',
    'Betriebsanweisungen (rot und blau)',
    'Sicherheitsprotokolle und Unterweisungsnachweise',
    'Legionellentabelle',
    'Dokumentation der Sicherheitsbegehung'
  ]::TEXT[]
WHERE name = 'Betriebssicherheit';

-- Brandschutz
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Bauliche Änderungen oder Reparaturen (liegen beim Hausmeisteramt)',
    'Pädagogische Inhalte der Evakuierungsübungen (liegen bei Pädagogischer Leitung)'
  ]::TEXT[],
  interfaces = ARRAY[
    'An Hausmeisteramt: Unterstützung bei Prüfungen und baulichen Anpassungen',
    'An Vorstand: Meldung von sicherheitsrelevanten Änderungen und Budgetbedarf',
    'An Pädagogische Leitung: Abstimmung bei Evakuierungsübungen und Unterweisungen',
    'Vom Team: Teilnahme an jährlichen Unterweisungen und Fluchtwegbegehungen'
  ]::TEXT[],
  guidelines = ARRAY[
    'Rauchmelder- und Feuerlöscherprüfung mindestens einmal jährlich durchführen',
    'Brandschutzunterweisung für Team und Eltern jährlich verpflichtend',
    'Dokumentation aller Maßnahmen innerhalb von 48 Stunden nach Durchführung'
  ]::TEXT[],
  artifacts = ARRAY[
    'Prüfprotokolle für Rauchmelder und Feuerlöscher',
    'Kaminfeger-Nachweise',
    'Brandschutzunterweisungsdokumente',
    'Teilnahmeprotokolle für Unterweisungen',
    'Liste der ausgebildeten Brandschutzhelfer'
  ]::TEXT[]
WHERE name = 'Brandschutz';

-- Hygiene
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Keine Verantwortung für die tatsächliche Durchführung von Putz- oder Desinfektionsarbeiten (liegt beim Reinigungsdienst oder wird in Putzeinsätzen delegiert)',
    'Keine Verantwortung für die Budgetfreigabe für Hygienematerialien (liegt bei Finanzen)'
  ]::TEXT[],
  interfaces = ARRAY[
    'Familien-Onboarding: Zusammenarbeit bei der Bereitstellung der Infektionsschutzbelehrung, Masernschutzstatus und Hygieneschulung für neue Familien',
    'Personalvorstand: Zusammenarbeit bei der Bereitstellung der Infektionsschutzbelehrung, Masernschutzstatus und Hygieneschulung für neue Mitarbeitende',
    'Elternarbeitskoordination: Weitergabe von Maßnahmen und To-Dos aus dem Hygieneplan für Arbeitseinsätze',
    'Dokumente: Abgleich der Familien und MA Stammdaten bzgl. Belehrungen und Schulungen'
  ]::TEXT[],
  guidelines = ARRAY[
    'Auffrischung der Infektionsschutzbelehrung erfolgt spätestens alle zwei Jahre',
    'Auffrischung der Hygieneschulung erfolgt jährlich',
    'Kein Eingewöhnungsstart bei fehlender Masernimpfung'
  ]::TEXT[],
  artifacts = ARRAY[
    'Hygieneplan (aktuelle Version)',
    'Dokumentation der Hygieneschulungen',
    'Dokumentation der Reinigung in größeren Abständen',
    'Dokumentation der Hygienebegehungen',
    'Nachweise der Infektionsschutzbelehrungen',
    'Online Dokumentation'
  ]::TEXT[]
WHERE name = 'Hygiene';

-- Arbeitsschutz
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Keine Verantwortung für die operative Umsetzung von baulichen Maßnahmen (liegt bei Haus & Hof Betrieb)',
    'Keine Verantwortung für den Kauf von Arbeitsschutzmaterialien (liegt bei Zentraleinkauf)'
  ]::TEXT[],
  interfaces = ARRAY[
    'Familien-Onboarding & Personalverwaltung: Zusammenarbeit bei der Bereitstellung von Unterweisungen für neue Eltern und Mitarbeitende',
    'Haus & Hof Betrieb: Abstimmung bei Instandhaltungen und Sicherheitsmaßnahmen',
    'Vorstand: Information über Ergebnisse von Begehungen und notwendige Maßnahmen'
  ]::TEXT[],
  guidelines = ARRAY[
    'Arbeitsschutzunterweisungen erfolgen mindestens einmal jährlich',
    'Verbandbuch und Feuerschutztüren werden mindestens quartalsweise kontrolliert',
    'Hitzeschutzplan wird vor Beginn der Sommermonate überprüft und kommuniziert'
  ]::TEXT[],
  artifacts = ARRAY[
    'Arbeitsschutzunterweisungs-Dokument (aktuelle Version)',
    'Protokolle von Arbeitsschutzbegehungen',
    'Verbandbuch-Kontrollliste',
    'Hitzeschutzplan'
  ]::TEXT[]
WHERE name = 'Arbeitsschutz';


-- =====================================================
-- ROLLEN - Kreis: Personal
-- =====================================================

-- Personalvorstands-Assistenz
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Endgültige Personalentscheidungen (liegen beim Personalvorstand)',
    'Pädagogische Leitung des Teams (liegt bei Pädagogischer Leitung)',
    'Budgetplanung und Buchhaltung (liegt beim Vorstand/Kassenwart)'
  ]::TEXT[],
  interfaces = ARRAY[
    'Vom Personalvorstand: Klare Vorgaben zu Prozessen und Entscheidungen',
    'An Pädagogische Leitung: Weitergabe von relevanten Personalinformationen (z. B. Urlaubsplanung)',
    'An Interne Kommunikation: Informationen für Elternbefragungen und Teamvorstellungen'
  ]::TEXT[],
  guidelines = ARRAY[
    'Datenschutz: Bewerbungsunterlagen spätestens 6 Monaten nach Abschluss löschen',
    'Fristenregel: Änderungen bei Mitarbeitenden innerhalb von X Tagen melden',
    'Transparenz: Einnahmen und Ausgaben des Kässle monatlich dokumentieren'
  ]::TEXT[],
  artifacts = ARRAY[
    'Geburtstagsübersicht und Adressliste',
    'Planungsdateien (z.B. Urlaubsübersicht, Krankheitsübersicht)',
    'Bewerbungsunterlagen',
    'Arbeitszeugnisse',
    'Elternbefragungen',
    'Kässle-Dokumentation'
  ]::TEXT[]
WHERE name = 'Personalvorstands-Assistenz';

-- Personalverwaltung
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Strategische Personalplanung (liegt beim Personalvorstand)',
    'Durchführung von Mitarbeitergesprächen (liegt beim Personalvorstand)',
    'Pädagogische Leitung des Teams (liegt bei Pädagogischer Leitung)'
  ]::TEXT[],
  interfaces = ARRAY[
    'An Personalvorstand: Bereitstellung aktueller Daten und Dokumente für Personalentscheidungen',
    'An Pädagogische Leitung: Weitergabe von Urlaubs- und Stundenübersichten',
    'Kasse: Weitergabe der Zahlungsliste zu Überweisung der Gehälter/Fortbildungsrechnungen/Auslagen',
    'Pädagogisches Team: Ansprechpartner und Berater für diverse Belange'
  ]::TEXT[],
  guidelines = ARRAY[
    'Datenschutz: Alle Personalunterlagen DSGVO-konform verwalten',
    'Fristenregel: Änderungen für Gehaltsabrechnung spätestens bis X des Monats melden',
    'Vollständigkeit: Onboarding-Dokumente vor Arbeitsbeginn prüfen und archivieren',
    'TVÖD Richtlinie allgemein und Auslegung der Stadt Stuttgart'
  ]::TEXT[],
  artifacts = ARRAY[
    'Digitale und physische Personalakten',
    'Arbeitsverträge und Änderungsverträge',
    'Stundenzettel und Zeitübersichten',
    'Bescheinigungen und Formulare',
    'Fortbildungsnachweise',
    'Masernschutz-Dokumentation der Mitarbeiter*innen',
    'Kita-Jahresstatistik'
  ]::TEXT[]
WHERE name = 'Personalverwaltung';

-- Bufdi-Koordination
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Keine Verantwortung für die pädagogische Anleitung im Alltag (liegt beim pädagogischen Team)',
    'Keine Verantwortung für die Budgetfreigabe für Bufdi-Stellen (liegt beim Finanzvorstand)'
  ]::TEXT[],
  interfaces = ARRAY[
    'Pädagogisches Team: Zusammenarbeit bei der Einarbeitung und Integration der Bufdis',
    'Vorstand: Abstimmung bei Vertragsfragen und strategischen Entscheidungen',
    'Kommunikation: Unterstützung bei der Veröffentlichung der Ausschreibung',
    'Finanzen: Klärung von Kosten und Fördermitteln für Bufdi-Stellen',
    'Arbeitssicherheit & Hygiene: Arbeitssicherheits- und Hygieneschulung bei Neueintritt'
  ]::TEXT[],
  guidelines = ARRAY[
    'Ausschreibung erfolgt mindestens drei Monate vor gewünschtem Starttermin',
    'Feedbackgespräche finden mindestens einmal pro Quartal statt'
  ]::TEXT[],
  artifacts = ARRAY[
    'Bewerbungsunterlagen und Auswahlprotokolle',
    'Einarbeitungsplan',
    'Feedback-Dokumentation'
  ]::TEXT[]
WHERE name = 'Bufdi-Koordination';

-- Personalentwicklung
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Keine Verantwortung für die operative Dienstplanung (liegt bei Pädagogischer Leitung)',
    'Keine Verantwortung für Budgetfreigaben (liegt bei Finanzvorstand)'
  ]::TEXT[],
  interfaces = ARRAY[
    'Personalvorstand: Abstimmung bei strategischen Entscheidungen',
    'Pädagogische Leitung: Zusammenarbeit bei Umsetzung von Fortbildungen'
  ]::TEXT[],
  guidelines = '{}'::TEXT[],
  artifacts = ARRAY[
    'Fortbildungsstrategie und Dokumentation'
  ]::TEXT[]
WHERE name = 'Personalentwicklung';


-- =====================================================
-- ROLLEN - Kreis: Kommunikation
-- =====================================================

-- Visuelle Identität
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Inhaltliche Texte für Kommunikationsmaterialien (liegen bei Interne Kommunikation oder zuständigen Ämtern)',
    'Strategische Kommunikationsplanung (liegt bei Interne Kommunikation)',
    'Gestalten von Medien'
  ]::TEXT[],
  interfaces = ARRAY[
    'An Externe und Interne Kommunikation: Einhalten der Tonalität und des Corporate Designs in allen Kommunikationsmitteln',
    'Designer*in: Einhalten von Designregeln'
  ]::TEXT[],
  guidelines = ARRAY[
    'Konsistenzregel: Alle Materialien müssen dem Corporate Design entsprechen'
  ]::TEXT[],
  artifacts = ARRAY[
    'Corporate Design Manual'
  ]::TEXT[]
WHERE name = 'Visuelle Identität';

-- Designer*in
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Inhaltliche Texte für Kommunikationsmaterialien (liegen bei Interne Kommunikation oder externer Kommunikation)',
    'Strategische Kommunikationsplanung (liegt bei Interner Kommunikation)',
    'Budgetfreigaben für größere Anschaffungen (liegen beim Vorstand)'
  ]::TEXT[],
  interfaces = ARRAY[
    'An Interne Kommunikation: Bereitstellung von visuellen Materialien für Newsletter, Social Media und Elterninfos',
    'An Zentraleinkauf: Abstimmung bei Bestellung von T-Shirts und Merchandising-Artikeln',
    'Von allen Ämtern: Rechtzeitige Anfragen für Drucksachen und Materialien',
    'Pädagogisches Team: Austausch / Schulungen zum Verständnis CD und Verwendung',
    'Fundraising: Ausschreibungen visuell unterstützen bei Bedarf'
  ]::TEXT[],
  guidelines = ARRAY[
    'Aktualitätsprüfung: Alle visuellen Elemente mindestens einmal pro Quartal überprüfen',
    'Kostenkontrolle: Drucksachen und Merchandising kostengünstig und termingerecht bestellen',
    'Konsistenzregel: Alle Materialien müssen dem Corporate Design entsprechen'
  ]::TEXT[],
  artifacts = ARRAY[
    'Design-Vorlagen (Word, PowerPoint, Flyer, Plakate)',
    'Web-Assets (Fotos, Grafiken im CMS)',
    'Drucksachen und Merchandising-Artikel: Garderobenschilder, Familienübersicht, Teamübersicht, Pins, Shirts, Fotowände, Flyer, Willkommensbooklet'
  ]::TEXT[]
WHERE name = 'Designer*in';

-- Externe Kommunikation
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Visuelle Gestaltung und Corporate Design (liegt bei Rolle Visuelle Identität & Design)',
    'Strategische Entscheidungen zu Budget und großen Kampagnen (liegen beim Vorstand)',
    'Inhaltliche Freigabe sensibler Themen (liegt bei Vorstand oder zuständigen Ämtern)'
  ]::TEXT[],
  interfaces = ARRAY[
    'An Visuelle Identität & Design: Bereitstellung von Texten für visuelle Materialien und Abstimmung bei Layouts',
    'An Interne Kommunikation: Zusammenarbeit bei Informationsverteilung und Newsletter',
    'Von allen Rollen: Rechtzeitige Bereitstellung von Inhalten und Themen für Kommunikation'
  ]::TEXT[],
  guidelines = ARRAY[
    'Aktualitätsprüfung: Alle Kommunikationsinhalte mindestens einmal pro Quartal überprüfen',
    'Posting-Frequenz: Social Media mindestens X Beiträge pro Woche',
    'Kampagnenplanung: Besondere Anlässe mindestens X Wochen im Voraus vorbereiten'
  ]::TEXT[],
  artifacts = ARRAY[
    'Kommunikationsrichtlinien (Tonalität, Sprachstil)',
    'Social Media Inhalte und Kampagnenpläne',
    'Texte für Flyer, Plakate, Newsletter, Webseite',
    'Google Ads Kampagnen'
  ]::TEXT[]
WHERE name = 'Externe Kommunikation';

-- Interne Kommunikation
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Offizielle Protokoll-Pflege (liegt beim Protokollführer)',
    'Meeting-Moderation (liegt beim Moderator)'
  ]::TEXT[],
  interfaces = ARRAY[
    'Vom Secretary: Verlässliche, aktuelle Protokolle; Hinweis auf publikationsrelevante Änderungen',
    'Vom Facilitator: Kurzfassung der freigegebenen Kernbotschaften',
    'Von Rolleninhabern: Fachliche Freigabe/Präzisierung bei komplexen oder sensiblen Inhalten',
    'An andere Rollen: Leicht verständliche Eltern-Informationen inkl. FAQs, Termine, nächste Schritte wenn zentrale Kommunikation gewünscht'
  ]::TEXT[],
  guidelines = ARRAY[
    'Service-Level Zeitnah: Standardversand innerhalb von 24-48 Std. nach Meeting; dringliche Themen Same Day',
    'Einfache und verständliche Sprache: Max. Lesestufe B1, klare Überschriften, Bulletpoints, Nächste Schritte',
    'Kanal-Redundanz: Kritische Infos über mindestens zwei Kanäle (z. B. E-Mail + Aushang)',
    'Link-Hygiene: Jede Nachricht enthält einen permanenten Link zur Quelle und Datum der letzten Aktualisierung'
  ]::TEXT[],
  artifacts = ARRAY[
    'Eltern-Newsletter und Verteilerlisten',
    'Eltern-Infoseiten/Wiki'
  ]::TEXT[]
WHERE name = 'Interne Kommunikation';


-- =====================================================
-- ROLLEN - Kreis: Technologie & Systeme
-- =====================================================

-- Wissensmanagement & Datensicherheit
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Kommunikation zu allgemeinen Elterninformationen (liegt bei Interner Kommunikation)'
  ]::TEXT[],
  interfaces = ARRAY[
    'An Personalverwaltung: Abstimmung bei Mitarbeiter-Stammdaten und Dokumenten',
    'An Vorstand: Bereitstellung aktueller Mitgliederlisten für Einladungen und Beschlüsse',
    'An Mitgliederversammlungs-Koordination: Zusammenarbeit bei der Vorbereitung der Mitgliederversammlung',
    'Von allen Rollen: Rechtzeitige Meldung von Änderungen in Stammdaten',
    'IT: Zusammenarbeit zu Themen wie Verteilerlisten und Hardware'
  ]::TEXT[],
  guidelines = ARRAY[
    'Stammdaten mindestens alle 6 Monate überprüfen und aktualisieren',
    'DSGVO-konforme Löschung von Daten nach Austritt oder Ablauf gesetzlicher Fristen',
    'Einheitliche Ordnerstruktur und Namenskonventionen verbindlich einhalten'
  ]::TEXT[],
  artifacts = ARRAY[
    'Mitgliederübersicht',
    'Betreuungsverträge',
    'Kindergruppen- und Adresslisten (inkl. Nextcloud)',
    'Ämterlisten',
    'Urlaubsübersicht Eltern & Kinder',
    'Kinderübersicht für das Team (inkl. Abholberechtigungen, Allergien, Impfungen)',
    'Datenschutzrichtlinien und Schulungsnachweise'
  ]::TEXT[]
WHERE name = 'Wissensmanagement & Datensicherheit';

-- IT
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Inhaltliche Pflege der Webseite (liegt bei Kommunikation & Content)',
    'Datenschutzrichtlinien und DSGVO-Compliance (liegt bei Datenmanagement & Datensicherheit)'
  ]::TEXT[],
  interfaces = ARRAY[
    'An Datenmanagement: Abstimmung bei Zugriffsrechten und Datenschutzmaßnahmen',
    'An alle Rollen und Mitarbeitende: Bereitstellung von IT-Support bei Bedarf',
    'An Finanzkreis: Abstimmung bzgl. Kosten für IT-Infrastruktur und Telekommunikation',
    'Hort IT: Abstimmung zu Themen (unter Berücksichtigung von Datenschutz)',
    'IT Sicherheit: Austausch und Umsetzung bzgl. notwendiger Maßnahmen'
  ]::TEXT[],
  guidelines = ARRAY[
    'Passwort-Reset für alle Mailaccounts jährlich nach Rollenvergabe',
    'Regelmäßige Sicherheitsupdates für Cloud und CMS',
    'IT-Support-Anfragen zeitnah beantworten'
  ]::TEXT[],
  artifacts = ARRAY[
    'E-Mail-Accounts und Verteilerlisten',
    'Signal-Gruppen',
    'CMS-Zugangsdaten und Webseitenstruktur',
    'Cloud-Ordnerstruktur und Zugriffsrechte',
    'Verträge für Telekommunikation und digitale Infrastruktur'
  ]::TEXT[]
WHERE name = 'IT';

-- Webseite
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Erstellung von Websiteinhalten und Pflege dieser Inhalte (liegt bei Externe Kommunikation)',
    'UX-Entwicklung & UI-Gestaltung (liegt bei Designer*in)'
  ]::TEXT[],
  interfaces = ARRAY[
    'An Kommunikation & Content: Unterstützung bei SEO, GEO und Bereitstellung von Inhalten auf der Webseite',
    'Datenschutz, IT, IT Sicherheit: Abstimmung zu relevanten Themen',
    'Design & Visuelle Identität: Vorgaben für Gestaltung'
  ]::TEXT[],
  guidelines = '{}'::TEXT[],
  artifacts = ARRAY[
    'Webseite Frontend',
    'Webseite Backend'
  ]::TEXT[]
WHERE name = 'Webseite';

-- IT-Sicherheit
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Keine Verantwortung für die inhaltliche Pflege der Cloud oder Website (liegt bei IT und Kommunikation)',
    'Keine Verantwortung für Datenschutzrichtlinien (liegt bei Datenmanagement)'
  ]::TEXT[],
  interfaces = ARRAY[
    'IT: Abstimmung bei technischen Änderungen',
    'Datenmanagement: Zusammenarbeit bei DSGVO-konformen Prozessen',
    'Vorstand: Meldung von Sicherheitsvorfällen'
  ]::TEXT[],
  guidelines = '{}'::TEXT[],
  artifacts = ARRAY[
    'IT-Sicherheitsrichtlinien',
    'Backup-Systeme'
  ]::TEXT[]
WHERE name = 'IT-Sicherheit';


-- =====================================================
-- BASISROLLEN - Update across all circles
-- (These exist once per circle, update all instances)
-- =====================================================

-- Kreis-Koordinator (all circles)
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Keine Verantwortung für die operative Ausführung einzelner Rollenaufgaben',
    'Keine Entscheidungsbefugnis über die Strategie des übergeordneten Kreises (nur Umsetzung und Kommunikation)'
  ]::TEXT[],
  interfaces = ARRAY[
    'Kreis-Repräsentant: Zusammenarbeit bei der Kommunikation von Spannungen und Bedürfnissen zwischen Kreisen',
    'Alle Rollen im Kreis: Transparente Kommunikation über Prioritäten und Ressourcen'
  ]::TEXT[],
  guidelines = ARRAY[
    'Rollenbesetzungen werden mindestens einmal pro Quartal überprüft',
    'Prioritäten werden in jeder Governance-Sitzung aktualisiert'
  ]::TEXT[],
  artifacts = ARRAY[
    'Rollenbesetzungsliste',
    'Prioritätenliste für Projekte und Aufgaben'
  ]::TEXT[]
WHERE name = 'Kreis-Koordinator';

-- Kreis-Repräsentant (all circles)
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Keine Verantwortung für die operative Umsetzung von Aufgaben im Kreis',
    'Keine Entscheidungsbefugnis über Prioritäten oder Rollenbesetzungen'
  ]::TEXT[],
  interfaces = ARRAY[
    'Lead Link: Zusammenarbeit bei der Kommunikation von Kreisbedürfnissen',
    'Alle Rollen im Kreis: Austausch über Spannungen und Themen, die weitergetragen werden sollen'
  ]::TEXT[],
  guidelines = ARRAY[
    'Spannungen werden vor jeder Governance-Sitzung gesammelt und priorisiert',
    'Rückmeldungen aus dem übergeordneten Kreis erfolgen innerhalb von 48 Stunden'
  ]::TEXT[],
  artifacts = ARRAY[
    'Liste der Spannungen und Themen für den übergeordneten Kreis',
    'Protokolle der Governance-Sitzungen'
  ]::TEXT[]
WHERE name = 'Kreis-Repräsentant';

-- Moderator (all circles)
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Protokollführung und Dokumentation (liegt beim Protokollführer)',
    'Terminierung und Einladung (liegt beim Protokollführer)',
    'Verteilung der Dokumentation und Pflege des Archivs (liegt bei Protokollführer/Interne Kommunikation)'
  ]::TEXT[],
  interfaces = ARRAY[
    'An den Protokollführer: Erwartet verlässliche Erfassung und Veröffentlichung aller finalen Outputs; bietet klare, mündlich bestätigte Ergebnisse am Ende jedes Agenda-Punkts',
    'An Kreis-Koordinator / Rolleninhaber: Erwartet inhaltliche Klärung und Entscheidungskompetenz für eigene Domänen'
  ]::TEXT[],
  guidelines = ARRAY[
    'Neutralität: Der Facilitator beteiligt sich nicht inhaltlich an Debatten, außer zur Prozessklärung',
    'Zeitschutz: Time-Boxes dürfen aktiv durchgesetzt werden; Verlängerungen nur mit Zustimmung der Anwesenden',
    'Konflikt-Deeskalation: Bei Eskalation priorisiert der Moderator Prozessschritte (z. B. Klärungsfragen, Zusammenfassung, Schrittvorschlag)'
  ]::TEXT[],
  artifacts = '{}'::TEXT[]
WHERE name = 'Moderator';

-- Protokollführer (all circles)
UPDATE roles SET
  not_accountable_for = ARRAY[
    'Moderation und Prozessführung (liegt beim Moderator)',
    'Inhaltliche Entscheidungen oder Priorisierung (liegen bei Rolleninhabern/Kreis-Koordinator)',
    'Externe Kommunikation / Elterninformationen (liegt bei Rolle Interne Kommunikation)'
  ]::TEXT[],
  interfaces = ARRAY[
    'Vom Moderator: Klare, mündlich bestätigte Ergebnisse; Signal, was als Rolle/Richtlinie/Projekt/To Do zu erfassen ist',
    'Von Rolleninhabern: Rechtzeitige Bereitstellung von Agendapunkten für Kreis-Treffen'
  ]::TEXT[],
  guidelines = ARRAY[
    'Doku vor Inhalt: Bei Konflikten gilt die letzte veröffentlichte Dokumentation als Quelle der Wahrheit',
    'Zeitnahe Veröffentlichung: Struktur-Änderungen an Rollen oder Organisation spätestens innerhalb von 24-48 Std. publizieren'
  ]::TEXT[],
  artifacts = ARRAY[
    'Meeting-Kalender und Einladungen',
    'Operative Treffen-Ergebnisse'
  ]::TEXT[]
WHERE name = 'Protokollführer';
