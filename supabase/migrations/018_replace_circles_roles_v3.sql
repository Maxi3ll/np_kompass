-- =====================================================
-- NECKARPIRATEN KOMPASS - Kreise & Rollen V3
-- Basierend auf: Neckarpiraten_Rollenübersicht_V2_geklärt.md (März 2026)
-- =====================================================

-- Aufräumen: Alle bestehenden Daten entfernen (Reihenfolge wegen Foreign Keys)
TRUNCATE notifications CASCADE;
TRUNCATE meeting_agenda_items CASCADE;
TRUNCATE meeting_attendees CASCADE;
TRUNCATE meetings CASCADE;
TRUNCATE tension_comments CASCADE;
TRUNCATE tensions CASCADE;
TRUNCATE subtask_volunteers CASCADE;
TRUNCATE subtask_comments CASCADE;
TRUNCATE subtasks CASCADE;
TRUNCATE projekte_circles CASCADE;
TRUNCATE projekte CASCADE;
TRUNCATE checklist_completions CASCADE;
TRUNCATE checklist_items CASCADE;
TRUNCATE role_assignments CASCADE;
TRUNCATE roles CASCADE;
TRUNCATE circles CASCADE;

-- =====================================================
-- KREISE (12 Kreise)
-- =====================================================

-- 1. Neckarpiraten e.V. (Anker-Kreis / Top-Level)
INSERT INTO circles (id, name, purpose, parent_circle_id, color, icon) VALUES
  ('10000000-0000-0000-0000-000000000001',
   'Neckarpiraten e.V.',
   'Stellt sicher, dass der Verein als Träger der Kita rechtlich handlungsfähig bleibt, die Satzung und Vereinsziele erfüllt und die Governance-Struktur für alle untergeordneten Kreise bereitstellt.',
   NULL, '#E8927C', '⚓');

-- 2. Kita (Haupt-Operationskreis)
INSERT INTO circles (id, name, purpose, parent_circle_id, color, icon) VALUES
  ('10000000-0000-0000-0000-000000000002',
   'Kita',
   'Sichert die strategische und operative Steuerung der Kita, stellt die pädagogische Qualität sicher und koordiniert alle untergeordneten Kreise.',
   '10000000-0000-0000-0000-000000000001', '#4A90D9', '🏠');

-- 3. Finanzen
INSERT INTO circles (id, name, purpose, parent_circle_id, color, icon) VALUES
  ('10000000-0000-0000-0000-000000000003',
   'Finanzen',
   'Stellt die finanzielle Stabilität und Transparenz sicher und sorgt für korrekte Abrechnung gegenüber Mitgliedern und Förderstellen.',
   '10000000-0000-0000-0000-000000000002', '#A78BFA', '💰');

-- 4. Haus & Hof
INSERT INTO circles (id, name, purpose, parent_circle_id, color, icon) VALUES
  ('10000000-0000-0000-0000-000000000004',
   'Haus & Hof',
   'Sorgt für die Pflege, Sicherheit und Weiterentwicklung der Kita-Immobilie und des Außengeländes.',
   '10000000-0000-0000-0000-000000000002', '#6EC9A8', '🔧');

-- 5. Küche & Ernährung
INSERT INTO circles (id, name, purpose, parent_circle_id, color, icon) VALUES
  ('10000000-0000-0000-0000-000000000005',
   'Küche & Ernährung',
   'Sorgt für eine gesunde, nachhaltige und gut organisierte Ernährung für Kinder und Team.',
   '10000000-0000-0000-0000-000000000002', '#F59E0B', '🍽️');

-- 6. Familien-Management & Kultur
INSERT INTO circles (id, name, purpose, parent_circle_id, color, icon) VALUES
  ('10000000-0000-0000-0000-000000000006',
   'Familien-Management & Kultur',
   'Fördert Gemeinschaft, organisiert Elternarbeit und integriert neue Familien.',
   '10000000-0000-0000-0000-000000000002', '#F5C842', '👪');

-- 7. Sicherheit & Compliance
INSERT INTO circles (id, name, purpose, parent_circle_id, color, icon) VALUES
  ('10000000-0000-0000-0000-000000000007',
   'Sicherheit & Compliance',
   'Stellt sicher, dass alle gesetzlichen und internen Anforderungen zu Hygiene, Arbeitsschutz, Brandschutz und Betriebssicherheit erfüllt sind.',
   '10000000-0000-0000-0000-000000000002', '#EF4444', '🛡️');

-- 8. Personal
INSERT INTO circles (id, name, purpose, parent_circle_id, color, icon) VALUES
  ('10000000-0000-0000-0000-000000000008',
   'Personal',
   'Stellt sicher, dass alle Personalprozesse rechtskonform, transparent und effizient ablaufen und Mitarbeitende gut begleitet werden.',
   '10000000-0000-0000-0000-000000000002', '#EC4899', '👥');

-- 9. Kommunikation
INSERT INTO circles (id, name, purpose, parent_circle_id, color, icon) VALUES
  ('10000000-0000-0000-0000-000000000009',
   'Kommunikation',
   'Stellt sicher, dass interne und externe Kommunikation professionell und konsistent erfolgt.',
   '10000000-0000-0000-0000-000000000002', '#8B5CF6', '📢');

-- 10. Technologie & Systeme
INSERT INTO circles (id, name, purpose, parent_circle_id, color, icon) VALUES
  ('10000000-0000-0000-0000-000000000010',
   'Technologie & Systeme',
   'Sorgt für eine stabile, sichere und effiziente digitale Infrastruktur und Datenverwaltung.',
   '10000000-0000-0000-0000-000000000002', '#06B6D4', '💻');

-- 11. Pädagogisches Team (NEU - Sub-Kreis von Kita)
INSERT INTO circles (id, name, purpose, parent_circle_id, color, icon) VALUES
  ('10000000-0000-0000-0000-000000000011',
   'Pädagogisches Team',
   'Stellt die zuverlässige, liebevolle und pädagogisch hochwertige Betreuung der kleinen Neckarpirat*innen im Alter von eins bis sieben Jahren sicher.',
   '10000000-0000-0000-0000-000000000002', '#10B981', '🧒');

-- 12. Vorstandsitzung (NEU - Sub-Kreis von Kita)
INSERT INTO circles (id, name, purpose, parent_circle_id, color, icon) VALUES
  ('10000000-0000-0000-0000-000000000012',
   'Vorstandsitzung',
   'Stellt sicher, dass alle Belange der Kita regelmäßig in der Vorstandsrunde besprochen und notwendige Aktionen abgeleitet werden.',
   '10000000-0000-0000-0000-000000000002', '#F97316', '🤝');


-- =====================================================
-- BASISROLLEN (4 pro Kreis × 12 Kreise = 48)
-- =====================================================

DO $$
DECLARE
  circle RECORD;
BEGIN
  FOR circle IN SELECT id, name FROM circles LOOP
    INSERT INTO roles (name, purpose, domains, accountabilities, circle_id) VALUES
    (
      'Kreis-Koordinator',
      'Stellt sicher, dass der Kreis seinen Zweck erfüllt, die Rollen gut besetzt sind und die Arbeit im Sinne des übergeordneten Kreises ausgerichtet ist.',
      ARRAY['Rollenbesetzung im Kreis', 'Priorisierung von Projekten'],
      ARRAY[
        'Besetzt Rollen im Kreis bei Bedarf',
        'Priorisiert die Arbeit des Kreises',
        'Verteilt Ressourcen im Kreis',
        'Kommuniziert Strategie und Erwartungen des übergeordneten Kreises',
        'Unterstützt und fördert das Miteinander im Kreis'
      ],
      circle.id
    ),
    (
      'Kreis-Repräsentant',
      'Stellt sicher, dass die Spannungen und Bedürfnisse des Kreises im übergeordneten Kreis Gehör finden und berücksichtigt werden.',
      ARRAY[]::text[],
      ARRAY[
        'Bringt Spannungen des Kreises in den übergeordneten Kreis',
        'Kommuniziert Entscheidungen zurück an den eigenen Kreis',
        'Fördert Transparenz und Austausch zwischen den Kreisen',
        'Unterstützt den Kreis bei der Lösung von Hindernissen'
      ],
      circle.id
    ),
    (
      'Moderator',
      'Sorgt für einen sicheren, neutralen und effizienten Ablauf von Kreistreffen, damit Spannungen geklärt und klare Ergebnisse erzielt werden.',
      ARRAY['Struktur der Treffen & Moderationsrahmen'],
      ARRAY[
        'Moderiert Meetings prozesssicher gemäß vereinbartem Prozess',
        'Stellt Klarheit und Fokus sicher, trennt Prozess von Inhalt',
        'Ermöglicht Entscheidungsfindung und integriert Einwände',
        'Sichert Transparenz über Ergebnisse am Ende jedes Themas'
      ],
      circle.id
    ),
    (
      'Protokollführer',
      'Sorgt für eine zuverlässige, transparente und leicht zugängliche Dokumentation der Ergebnisse von Kreistreffen.',
      ARRAY['Treffen-Kalender & Einladungen', 'Ergebnisdokumentation von Entscheidungen'],
      ARRAY[
        'Organisiert und terminiert Kreis-Treffen, verschickt Einladungen mit Agenda',
        'Dokumentiert Entscheidungen vollständig, korrekt und versionssicher',
        'Erfasst nächste Schritte (wer, bis wann, Ziel) und veröffentlicht Protokoll zeitnah',
        'Verwaltet Historie und Versionierung nachvollziehbar'
      ],
      circle.id
    );
  END LOOP;
END $$;


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
      'Organisiert Elterndienste eigenverantwortlich',
      'Teilt Aufgaben partnerschaftlich mit Partner*in',
      'Kommuniziert offen mit dem Vorstand über relevante Umstände'
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
      'Bearbeitet Spendenbescheinigungen',
      'Prüft jährlich Mitglieds- und Betreuungsbeiträge',
      'Ist federführender Ansprechpartner für die Bank'
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
    ARRAY['Jährlicher Prüfbericht und Revisionsdokumentation'],
    ARRAY[
      'Prüft die Finanzunterlagen von Kita und Hort zum Abschluss des Kitajahres',
      'Meldet Auffälligkeiten und Risiken an den Vorstand'
    ],
    '10000000-0000-0000-0000-000000000001'
  );


-- =====================================================
-- ROLLEN - Kreis: Kita (3 Rollen)
-- =====================================================

INSERT INTO roles (name, purpose, domains, accountabilities, circle_id) VALUES
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
    'Holacracy-Trainer*in',
    'Stellt sicher, dass alle Mitglieder die Prinzipien und Praktiken von Holacracy verstehen und anwenden können.',
    ARRAY['Holacracy-Schulungsmaterialien', 'Meeting-Moderation'],
    ARRAY[
      'Schult neue Mitglieder in Holacracy',
      'Unterstützt bei der Anwendung der Regeln',
      'Erstellt und pflegt Schulungsmaterialien',
      'Moderiert Governance- und Tactical-Meetings bei Bedarf',
      'Fördert kontinuierliche Verbesserung und sammelt Feedback'
    ],
    '10000000-0000-0000-0000-000000000002'
  ),
  (
    'Projekt-Koordination',
    'Stellt sicher, dass das Ziel des Vorhabens (Zeit, Kosten, Ergebnisse) klar ist, alle relevanten Personen beteiligt werden und kontinuierlich auf das Ziel hingearbeitet wird.',
    ARRAY['Problemstellung und -lösung des Projekts', 'Projektablaufplan'],
    ARRAY[
      'Arbeitet Zielbild aus und stimmt es mit allen relevanten Personen ab',
      'Beteiligt alle relevanten Personen und formt ein Projektteam',
      'Priorisiert und treibt alle notwendigen Schritte bis zur Zielerreichung'
    ],
    '10000000-0000-0000-0000-000000000002'
  );


-- =====================================================
-- ROLLEN - Kreis: Pädagogisches Team (2 Rollen)
-- =====================================================

INSERT INTO roles (name, purpose, domains, accountabilities, circle_id) VALUES
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
    '10000000-0000-0000-0000-000000000011'
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
    '10000000-0000-0000-0000-000000000011'
  );


-- =====================================================
-- ROLLEN - Kreis: Vorstandsitzung (5 Rollen)
-- Finanzvorstand, Personalvorstand, Vereinsvorstand sind
-- auch in Neckarpiraten e.V. - hier als Duplikat für Sichtbarkeit
-- =====================================================

INSERT INTO roles (name, purpose, domains, accountabilities, circle_id) VALUES
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
    '10000000-0000-0000-0000-000000000012'
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
    '10000000-0000-0000-0000-000000000012'
  ),
  (
    'Personalvorstand Kita',
    'Sichert die rechtskonforme, strategische und operative Steuerung aller personalbezogenen Themen in der Kita.',
    ARRAY['Personalplanung', 'Mitarbeitergespräche und -dokumentation', 'Arbeitszeugnisse'],
    ARRAY[
      'Stellt rechtskonforme Personalführung sicher',
      'Delegiert operative Betriebsführung an pädagogische Leitung',
      'Führt Recruiting und Einstellungsprozess',
      'Bereitet jährliche Mitarbeitergespräche vor und führt diese durch'
    ],
    '10000000-0000-0000-0000-000000000012'
  ),
  (
    'Organisationskoordination',
    'Sorgt für eine rechtssichere, gut organisierte und kontinuierlich weiterentwickelte Kita-Struktur.',
    ARRAY['Geschäftsordnung Kita', 'Strategisches Zielbild Kita', 'Versicherungsschutz'],
    ARRAY[
      'Erarbeitet abgestimmtes Zielbild für die Kita und treibt Umsetzung voran',
      'Führt die Kita gemäß Geschäftsordnung',
      'Stimmt sich regelmäßig mit dem Hort ab',
      'Wirkt an Weiterentwicklung von Satzung und Geschäftsordnung mit',
      'Stellt sicher, dass Kita-Konzeption den rechtlichen Anforderungen entspricht',
      'Koordiniert den Versicherungsschutz des Vereins',
      'Erstellt den Vorstandsbericht für die Mitgliederversammlung'
    ],
    '10000000-0000-0000-0000-000000000012'
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
      'Klärt Versicherungsanfragen',
      'Protokolliert Elternversammlungen und Vorstandssitzungen',
      'Organisation von Vorstandssitzungen'
    ],
    '10000000-0000-0000-0000-000000000012'
  );


-- =====================================================
-- ROLLEN - Kreis: Finanzen (5 Rollen)
-- =====================================================

INSERT INTO roles (name, purpose, domains, accountabilities, circle_id) VALUES
  (
    'Fundraising',
    'Sichert zusätzliche finanzielle und materielle Ressourcen durch Fördermittel, Spenden und externe Kooperationen.',
    ARRAY['eBay-Kleinanzeigen-Konto', 'Raumnutzungsplanung für private Zwecke', 'Förderkonzepte'],
    ARRAY[
      'Bereitet auf Zuruf vom Finanzvorstand Förderanträge vor',
      'Akquiriert Sachspenden bei lokalen Partnern',
      'Koordiniert Raumanfragen für private Nutzung',
      'Betreut das eBay-Kleinanzeigen-Konto',
      'Recherchiert regelmäßig Ausschreibungen und Wettbewerbe für Fördermittel'
    ],
    '10000000-0000-0000-0000-000000000003'
  ),
  (
    'Buchhaltung',
    'Stellt sicher, dass die finanzielle Verwaltung des Vereins korrekt, transparent und fristgerecht erfolgt.',
    ARRAY['Kontenführung und Buchungsdaten', 'Mitgliedsbeitragsverwaltung', 'Betreuungsgebühren'],
    ARRAY[
      'Zieht Mitgliedsbeiträge und Betreuungsgebühren fristgerecht ein',
      'Kontrolliert regelmäßig die Konten auf Vollständigkeit und Ordnungsmäßigkeit',
      'Schließt das Geschäftsjahr buchhalterisch ab',
      'Erfasst bezahlte Rechnungen und überträgt diese in die Buchhaltung'
    ],
    '10000000-0000-0000-0000-000000000003'
  ),
  (
    'Controlling',
    'Sorgt für finanzielle Transparenz und frühzeitige Orientierung über die wirtschaftliche Lage der Kita.',
    ARRAY['Budget- und Abweichungsübersicht', 'Liquiditätsübersicht'],
    ARRAY[
      'Erstellt eine Budgetübersicht (Plan-Ist-Vergleich)',
      'Überwacht wesentliche Abweichungen und macht diese transparent',
      'Erstellt eine Liquiditätsvorschau',
      'Bereitet Entscheidungsgrundlagen für den Finanzvorstand vor',
      'Macht finanzielle Risiken frühzeitig sichtbar'
    ],
    '10000000-0000-0000-0000-000000000003'
  ),
  (
    'Kasse',
    'Stellt sicher, dass alle finanziellen Transaktionen korrekt und fristgerecht abgewickelt werden.',
    ARRAY['Kontozugang und Zahlungsfreigabe', 'Überweisung der Gehälter', 'Bargeldabhebungen'],
    ARRAY[
      'Überweist Auslagen fristgerecht',
      'Führt Gehaltsüberweisungen pünktlich durch',
      'Hebt Bargeld für Personalbedarf und Veranstaltungen ab',
      'Überprüft eingehende Rechnungen auf Rechtmäßigkeit und Vollständigkeit'
    ],
    '10000000-0000-0000-0000-000000000003'
  ),
  (
    'Zentraleinkauf',
    'Sorgt für bedarfsgerechte, kosteneffiziente Beschaffung aller Non-Food-Artikel.',
    ARRAY['Non-Food-Inventar', 'Inventarliste und Bestandsführung', 'Bestellprozesse für Non-Food-Artikel'],
    ARRAY[
      'Ist Ansprechperson für alle Non-Food-Anschaffungen',
      'Bestellt Artikel vorausschauend bei bevorzugten Lieferanten',
      'Überprüft und verwaltet Putz- und Hygienemittelvorräte',
      'Führt und aktualisiert die Inventarliste (Inventur min. quartalsweise)',
      'Recherchiert günstigste Preise und Förderungen',
      'Beobachtet Heizöl-Marktpreise und koordiniert Bestellungen',
      'Budgetiert größere Anschaffungen in Abstimmung mit dem Finanzvorstand'
    ],
    '10000000-0000-0000-0000-000000000003'
  );


-- =====================================================
-- ROLLEN - Kreis: Haus & Hof (7 Rollen)
-- =====================================================

INSERT INTO roles (name, purpose, domains, accountabilities, circle_id) VALUES
  (
    'Schlüsselverwaltung',
    'Stellt sicher, dass die Vergabe und Rücknahme von Kita-Schlüsseln transparent dokumentiert und zuverlässig organisiert wird.',
    ARRAY['Schlüsselverwaltung'],
    ARRAY[
      'Vergibt Kita-Schlüssel gegen Pfand an neue Familien und Mitarbeitende',
      'Dokumentiert die Ausgabe mit Namen und Datum',
      'Meldet Verluste an den Vorstand',
      'Bestellt Ersatzschlüssel',
      'Regelt die Rückgabe des Pfands bei Schlüsselrückgabe'
    ],
    '10000000-0000-0000-0000-000000000004'
  ),
  (
    'Aquarium',
    'Sorgt für ein sauberes, funktionsfähiges und gesundes Aquarium mit optimalen Lebensbedingungen.',
    ARRAY['Aquarium und Zubehör', 'Futter und Pflegemittel', 'Aquarienbewohner'],
    ARRAY[
      'Reinigt und wartet Technik monatlich',
      'Pflegt das Aquarium-Ökosystem',
      'Wechselt alle 2 Wochen ca. 25 Liter Wasser',
      'Organisiert die tägliche Fütterung',
      'Überwacht Wasserqualität regelmäßig',
      'Meldet Futterbedarf rechtzeitig an Zentraleinkauf'
    ],
    '10000000-0000-0000-0000-000000000004'
  ),
  (
    'Hausmeister*in',
    'Sorgt für die funktionale, sichere und gepflegte Infrastruktur der Kita.',
    ARRAY['Hausgeräte und technische Ausstattung', 'Instandhaltungsmaßnahmen'],
    ARRAY[
      'Führt Reparaturen und Schönheitsarbeiten durch',
      'Definiert Aufgaben für Arbeitseinsätze',
      'Wartet alle Hausgeräte regelmäßig',
      'Führt Schädlingsprophylaxe durch',
      'Prüft jährlich Hitzeschutz-Geräte (Mai)',
      'Wartet den Kinderbus'
    ],
    '10000000-0000-0000-0000-000000000004'
  ),
  (
    'Haus & Hof Entwicklung',
    'Sorgt für die langfristige Instandhaltung und Weiterentwicklung der Kita-Immobilie und des Außengeländes.',
    ARRAY['Zielbild Haus & Hof', 'Projektplanung für Immobilie'],
    ARRAY[
      'Erstellt ein nachhaltiges Gesamtzielbild für Haus und Hof',
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
      'Bereitet Gartenpumpe und Sonnensegel saisonal vor und nach',
      'Inspiziert Spielgeräte mindestens jährlich',
      'Kontrolliert Garten auf gefährliche Pflanzen',
      'Führt saisonale Pflegearbeiten durch',
      'Sichert Zugangswege bei Schnee',
      'Verwaltet Gartenmaterial und Geräte',
      'Gräbt Mulch regelmäßig um und füllt bei Bedarf nach'
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
-- ROLLEN - Kreis: Küche & Ernährung (5 Rollen)
-- =====================================================

INSERT INTO roles (name, purpose, domains, accountabilities, circle_id) VALUES
  (
    'Speiseplan',
    'Erstellt monatlich die Wochenspeisepläne entsprechend des Ernährungskonzepts.',
    ARRAY['Speisepläne und Rezeptdokumentation'],
    ARRAY[
      'Plant und erstellt monatlich saisonale Kochpläne mit vegetarischen Gerichten',
      'Entwickelt oder passt Rezepte in Absprache mit dem Küchenteam an',
      'Ergänzt die Rezeptsammlung in Absprache mit der Köchin',
      'Übernimmt Feedback aus dem Küchenteam',
      'Berücksichtigt Lebensmittelallergien und kennzeichnet entsprechend',
      'Hält den Hitzeschutz-Essensplan vor',
      'Reagiert auf spontane Änderungen des Speiseplans'
    ],
    '10000000-0000-0000-0000-000000000005'
  ),
  (
    'Lebensmitteleinkauf (frisch)',
    'Plant und organisiert frische Lebensmittel vorausschauend, ressourcenschonend und zuverlässig.',
    ARRAY['Beschaffung für Obst, Gemüse, Milchprodukte und Backwaren'],
    ARRAY[
      'Ermittelt wöchentlichen Bedarf an Bio-Obst, Gemüse und Milchprodukten und bestellt termingerecht',
      'Kauft spontan benötigte Artikel auf Zuruf ein',
      'Behält Preise im Blick und trifft kostensensible Einkaufsentscheidungen',
      'Reklamiert Fehllieferungen zeitnah',
      'Berücksichtigt Urlaubs- und Schließzeiten',
      'Koordiniert Einkauf bei Hitzealarm gemäß Hitzekochplan',
      'Achtet auf Bio-Qualität gemäß Ernährungskonzept'
    ],
    '10000000-0000-0000-0000-000000000005'
  ),
  (
    'Lebensmitteleinkauf (trocken)',
    'Plant und organisiert haltbare Lebensmittel vorausschauend, ressourcenschonend und zuverlässig.',
    ARRAY['Beschaffung für haltbare Lebensmittel'],
    ARRAY[
      'Ermittelt wöchentlichen Bedarf an trockenen Bio-Lebensmitteln und Getränken',
      'Kauft spontan benötigte Artikel auf Zuruf ein',
      'Behält Preise im Blick und trifft kostensensible Einkaufsentscheidungen',
      'Überprüft und organisiert die Vorrats- und Lagerhaltung',
      'Achtet auf MHD-gerechte Lagerung und Schädlingsschutz',
      'Berücksichtigt Urlaubs- und Schließzeiten',
      'Achtet auf Bio-Qualität gemäß Ernährungskonzept'
    ],
    '10000000-0000-0000-0000-000000000005'
  ),
  (
    'AdHoc Einkauf Lebensmittel',
    'Kurzfristig auftretende Lebensmittelengpässe vorbeugen und beheben.',
    ARRAY[]::text[],
    ARRAY[
      'Kauft auf Zuruf spontan und zeitnah Lebensmittel im stationären Einzelhandel',
      'Achtet beim Kauf auf gutes Preis-Leistungsverhältnis sowie Bio-Qualität'
    ],
    '10000000-0000-0000-0000-000000000005'
  ),
  (
    'Ernährungskonzept',
    'Sichert eine ausgewogene, kindgerechte und nachhaltige Ernährung in der Kita.',
    ARRAY['Ernährungskonzept der Elterninitiative'],
    ARRAY[
      'Erstellt, aktualisiert und dokumentiert Grundsätze zu Ernährung und Lebensmittelauswahl',
      'Achtet auf Übereinstimmung mit Vorgaben zur Lebensmittelqualität (Bio, regional, saisonal)',
      'Holt Feedback von Team, Küche, Eltern und pädagogischer Leitung ein',
      'Stellt sicher, dass das Ernährungskonzept im Speiseplan umgesetzt wird',
      'Erstellt Materialien zur transparenten Kommunikation des Konzepts',
      'Integriert Ernährungsbesonderheiten, Allergien und religiöse Essgewohnheiten'
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
    ARRAY['Dienstkalender und Dienstlisten'],
    ARRAY[
      'Koordiniert alle Elternarbeitsbereiche (Kehrwoche, Arbeitseinsätze, Putzeinsätze, Elterndienste)',
      'Pflegt und verwaltet Dienstkalender und Listen',
      'Erstellt und aktualisiert den Kehrwochenplan pro Quartal',
      'Dokumentiert geleistete Dienste und meldet Kennzahlen quartalsweise',
      'Organisiert Arbeits- und Putzeinsätze',
      'Koordiniert Küchendienste bei Ausfällen'
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
      'Dokumentiert Budget und Ausgaben',
      'Überprüft regelmäßig den Getränkebestand und verwaltet die Spendenkasse',
      'Verwaltet das Paypalkonto Festamt Neckarpiraten'
    ],
    '10000000-0000-0000-0000-000000000006'
  ),
  (
    'Familienonboarding und -offboarding',
    'Sorgt für einen transparenten, freundlichen Prozess vom ersten Kontakt bis zum Austritt.',
    ARRAY['Onboarding-/Offboarding-Dokumentation', 'Auswahlsystem für neue Familien', 'Warteliste'],
    ARRAY[
      'Plant freie Plätze (3+ Jahre voraus) und pflegt Warteliste DSGVO-konform',
      'Bearbeitet Platzanfragen und ist zentrale Ansprechperson für interessierte Familien',
      'Organisiert Kennenlerntermine, koordiniert Hospitation und Eingewöhnung',
      'Koordiniert Offboarding inkl. Stammdatenmeldungen',
      'Plant und organisiert Tag der offenen Tür und Herbstfest für neue Familien',
      'Bereitet Betreuungsverträge vor und verwaltet Unterlagen',
      'Überprüft Masernschutz vor Eingewöhnungsbeginn',
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
-- ROLLEN - Kreis: Sicherheit & Compliance (4 Rollen)
-- =====================================================

INSERT INTO roles (name, purpose, domains, accountabilities, circle_id) VALUES
  (
    'Betriebssicherheit',
    'Stellt sicher, dass alle sicherheitsrelevanten Prozesse rechtskonform, präventiv und nachvollziehbar umgesetzt werden.',
    ARRAY['Gefährdungsbeurteilung', 'Betriebsanweisungen', 'Sicherheitsdokumentation'],
    ARRAY[
      'Organisiert jährliche Sicherheitsbegehung mit der Firma Engels',
      'Prüft und aktualisiert Gefährdungsbeurteilung (mind. jährlich)',
      'Erstellt und pflegt rote und blaue Betriebsanweisungen',
      'Führt jährlich Teamunterweisungen zur Betriebssicherheit durch',
      'Führt monatlich Legionellen-Prävention durch und dokumentiert lückenlos'
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
      'Organisiert bei Bedarf Prüfung aller elektrischen Geräte',
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
      'Pflegt und aktualisiert den Hygieneplan jährlich',
      'Definiert Maßnahmen für Arbeits- und Putzeinsätze',
      'Dokumentiert Masernschutz-Nachweise',
      'Ist Ansprechperson bei externen Hygieneprüfungen (LMÜ, Gesundheitsamt)',
      'Koordiniert und dokumentiert Hygienebegehungen',
      'Verwaltet Hygiene-Lager und meldet Einkaufsbedarfe',
      'Hält Hygieneboxen jederzeit einsatzbereit'
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
  );


-- =====================================================
-- ROLLEN - Kreis: Personal (4 Rollen)
-- =====================================================

INSERT INTO roles (name, purpose, domains, accountabilities, circle_id) VALUES
  (
    'Personalvorstands-Assistenz',
    'Unterstützt den Personalvorstand bei Organisation, Kommunikation und Dokumentation aller personalbezogenen Prozesse.',
    ARRAY['Team-Stammdaten', 'Bewerbungsunterlagen', 'Kässle'],
    ARRAY[
      'Pflegt Geburtstagsübersicht und Adressliste des Teams',
      'Stellt Planungsdateien für Personaleinsatz und Urlaubsplanung bereit',
      'Bereitet Arbeitszeugnisse vor',
      'Meldet Personaländerungen per UvPM an den KVJS',
      'Bearbeitet Bewerbungen und organisiert Vorstellungsgespräche',
      'Vertritt den Personalvorstand bei Abwesenheit',
      'Organisiert Geburtstagsgeschenke für Teammitglieder',
      'Erstellt und führt Elternbefragungen durch',
      'Verwaltet das Kässle'
    ],
    '10000000-0000-0000-0000-000000000008'
  ),
  (
    'Personalverwaltung',
    'Sichert die vollständige, strukturierte und datenschutzkonforme Verwaltung aller personalbezogenen Unterlagen.',
    ARRAY['Digitale und physische Personalakten', 'Stundenzettel und Zeitdokumentation', 'Vertragsunterlagen', 'Bescheinigungen und Formulare', 'Fortbildungsdokumentation', 'Masernschutz-Dokumentation'],
    ARRAY[
      'Führt und pflegt digitale und physische Personalakten',
      'Erstellt und aktualisiert Arbeitsverträge',
      'Dokumentiert Kranktage, Urlaub und Stundensoll',
      'Kommuniziert mit Krankenkassen und erstellt Bescheinigungen',
      'Meldet monatlich Änderungen an Dachverband zur Gehaltsabrechnung',
      'Bearbeitet Fortbildungsanträge und erstellt Kita-Jahresstatistik',
      'Unterstützt beim Onboarding neuer Mitarbeitender',
      'Überprüft Masernschutz neuer Mitarbeitender'
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
-- ROLLEN - Kreis: Kommunikation (4 Rollen)
-- =====================================================

INSERT INTO roles (name, purpose, domains, accountabilities, circle_id) VALUES
  (
    'Visuelle Identität',
    'Definiert und gestaltet die visuelle Identität der Neckarpiraten für konsistente Kommunikation.',
    ARRAY['Corporate Design', 'Kommunikationsrichtlinien'],
    ARRAY[
      'Entwickelt und pflegt die visuelle Identität (Corporate Design)',
      'Stellt einheitliche Anwendung in allen Kommunikationsmitteln sicher',
      'Berät bei Innenraumgestaltung und Gebäudebeschriftungen'
    ],
    '10000000-0000-0000-0000-000000000009'
  ),
  (
    'Designer*in',
    'Stellt sicher, dass alle Kommunikationsmittel eine konsistente visuelle Sprache sprechen.',
    ARRAY['Design-Vorlagen und Drucksachen', 'Web-Assets', 'Medienlibrary'],
    ARRAY[
      'Erstellt Infomaterialien für on- und offline (Flyer, Social Media, Plakate)',
      'Gestaltet Design-Vorlagen für Dokumente',
      'Erstellt Fotos und Grafiken für die Webseite',
      'Gestaltet und bestellt Drucksachen und T-Shirts',
      'Fragt jährlich T-Shirt-Bedarf ab und organisiert Bestellung',
      'Überprüft regelmäßig Garderobenschilder und Fotowände'
    ],
    '10000000-0000-0000-0000-000000000009'
  ),
  (
    'Externe Kommunikation',
    'Prägt die Tonalität der externen Kommunikation für eine konsistente, professionelle Darstellung.',
    ARRAY['Social Media Kanäle', 'Google-Konto und Anzeigenkampagnen'],
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
    'Interne Kommunikation',
    'Stellt sicher, dass alle Eltern zeitnah, korrekt und verständlich informiert sind.',
    ARRAY['Eltern-Info-Kanäle (Newsletter, Aushänge, Chat, Wiki)', 'Verständlichkeitsstandards'],
    ARRAY[
      'Übersetzt Beschlüsse und Ergebnisse in geeignete Nachrichtenformate',
      'Pflegt Eltern-Infoseiten/Wiki aktuell und vollständig',
      'Strukturiert Inhalte nach Zielgruppe (FAQ, Termine, Zuständigkeiten)',
      'Wählt passende Kanäle und achtet auf Barrierefreiheit',
      'Bündelt Rückfragen und behebt Missverständnisse proaktiv'
    ],
    '10000000-0000-0000-0000-000000000009'
  );


-- =====================================================
-- ROLLEN - Kreis: Technologie & Systeme (4 Rollen)
-- =====================================================

INSERT INTO roles (name, purpose, domains, accountabilities, circle_id) VALUES
  (
    'Wissensmanagement & Datensicherheit',
    'Stellt sicher, dass alle personenbezogenen Daten strukturiert, aktuell und datenschutzkonform verwaltet werden.',
    ARRAY['Digitale und physische Stammdaten', 'Cloud-Ordnerstruktur und Archivierung', 'Datenschutzrichtlinien'],
    ARRAY[
      'Gewährleistet Einhaltung der DSGVO',
      'Fungiert als Datenschutzbeauftragte*r',
      'Führt Änderungen in Stammdaten durch',
      'Stimmt Mitgliederlisten für Mitgliederversammlung ab',
      'Legt Dokumente in nachvollziehbarer Ordnerstruktur ab',
      'Unterweist Mitarbeitende und Vereinsmitglieder in Datenschutz',
      'Erstellt Strukturvorgaben für Wissensablage'
    ],
    '10000000-0000-0000-0000-000000000010'
  ),
  (
    'IT',
    'Stellt sicher, dass die technische Infrastruktur der Neckarpiraten zuverlässig funktioniert.',
    ARRAY['IT-Infrastruktur', 'Digitale Kommunikationssysteme', 'Cloud-System', 'Server'],
    ARRAY[
      'Leistet technischen Support für Geräte und Kita-Internet',
      'Koordiniert technische Geräte für Veranstaltungen',
      'Erstellt und verwaltet E-Mail-Accounts und Verteiler',
      'Setzt jährlich Passwörter zurück (nach Ämterwahl)',
      'Erstellt und pflegt Signal-Gruppen',
      'Verwaltet die Neckarpiraten-Cloud und Server',
      'Pflegt und optimiert IT-relevante Verträge'
    ],
    '10000000-0000-0000-0000-000000000010'
  ),
  (
    'Webseite',
    'Stellt sicher, dass die Website aktuell ist, zuverlässig funktioniert und regelmäßig gesichert wird.',
    ARRAY['Frontend der Webseite', 'Backend der Webseite', 'Webseite und CMS', 'Rollenmanagement'],
    ARRAY[
      'Sorgt für zuverlässige Darstellung der Webseite insbesondere auf mobilen Geräten',
      'Aktualisiert regelmäßig Pakete und erstellt Backups',
      'Überprüft regelmäßig die Sicherheit der Webseite',
      'Stellt Hosting sicher'
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
