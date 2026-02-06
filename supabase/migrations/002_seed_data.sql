-- =====================================================
-- NECKARPIRATEN KOMPASS - Seed Data
-- =====================================================

-- =====================================================
-- KREISE
-- =====================================================

-- Anker-Kreis (Vorstand)
INSERT INTO circles (id, name, purpose, parent_circle_id, color, icon) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Anker-Kreis', 'Strategische Führung und rechtliche Verantwortung des Vereins', NULL, '#E8927C', '⚓');

-- Sub-Kreise
INSERT INTO circles (id, name, purpose, parent_circle_id, color, icon) VALUES
  ('00000000-0000-0000-0000-000000000002', 'Betrieb', 'Reibungsloser Kita-Alltag für alle Kinder und Familien', '00000000-0000-0000-0000-000000000001', '#4A90D9', '🏠'),
  ('00000000-0000-0000-0000-000000000003', 'Gebäude & Garten', 'Sichere, gepflegte Räume und Außenanlagen', '00000000-0000-0000-0000-000000000001', '#6EC9A8', '🔧'),
  ('00000000-0000-0000-0000-000000000004', 'Gemeinschaft', 'Zusammenhalt und Kommunikation fördern', '00000000-0000-0000-0000-000000000001', '#F5C842', '🎉'),
  ('00000000-0000-0000-0000-000000000005', 'Finanzen & Ressourcen', 'Nachhaltige Wirtschaftlichkeit des Vereins', '00000000-0000-0000-0000-000000000001', '#A78BFA', '💰');

-- =====================================================
-- ROLLEN
-- =====================================================

-- Kreis: Betrieb
INSERT INTO roles (name, purpose, domains, accountabilities, circle_id) VALUES
  (
    'Elterndienst-Koordination',
    'Elterndienste sind fair verteilt und alle Schichten sind besetzt',
    ARRAY['Elterndienst-Plan', 'Tauschbörse'],
    ARRAY[
      'Monatlichen Elterndienst-Plan erstellen und kommunizieren',
      'Tausch-Anfragen koordinieren',
      'Bei Ausfällen Ersatz organisieren',
      'Neue Familien in Elterndienst einweisen'
    ],
    '00000000-0000-0000-0000-000000000002'
  ),
  (
    'Küchen-Organisation',
    'Gesunde, abwechslungsreiche Mahlzeiten für alle Kinder',
    ARRAY['Speiseplan', 'Einkaufslisten', 'Küchenhygiene'],
    ARRAY[
      'Wöchentlichen Speiseplan erstellen',
      'Einkaufslisten für Kocheltern bereitstellen',
      'Küchenhygiene-Standards überwachen',
      'Allergien und Unverträglichkeiten dokumentieren'
    ],
    '00000000-0000-0000-0000-000000000002'
  ),
  (
    'Hygiene-Beauftragte',
    'Kita erfüllt alle Hygiene-Anforderungen',
    ARRAY['Hygieneplan', 'Reinigungsstandards'],
    ARRAY[
      'Hygieneplan aktuell halten',
      'Reinigungsprotokolle führen',
      'Gesundheitsamt-Kontakt pflegen',
      'Bei Krankheitsausbrüchen Maßnahmen koordinieren'
    ],
    '00000000-0000-0000-0000-000000000002'
  );

-- Kreis: Gebäude & Garten
INSERT INTO roles (name, purpose, domains, accountabilities, circle_id) VALUES
  (
    'Arbeitsschutz',
    'Alle Kinder und Erwachsenen arbeiten und spielen in einer sicheren Umgebung',
    ARRAY['Gefährdungsbeurteilungen', 'Sicherheitsunterweisungen', 'Kontakt zu BGW und Betriebsarzt'],
    ARRAY[
      'Jährliche Begehung aller Bereiche durchführen',
      'Gefährdungsbeurteilungen aktuell halten',
      'Mängel dokumentieren und Verantwortliche informieren',
      'Gefahrstoffverzeichnis pflegen',
      'Neue Eltern in Sicherheitsthemen einweisen'
    ],
    '00000000-0000-0000-0000-000000000003'
  ),
  (
    'Arbeitseinsatz-Koordination',
    'Gebäude und Garten werden regelmäßig instandgehalten',
    ARRAY['Planung der Arbeitseinsätze', 'Aufgabenverteilung bei Einsätzen'],
    ARRAY[
      'Termine für 4 Arbeitseinsätze + 2 Putztage pro Jahr festlegen',
      'Aufgabenlisten für jeden Einsatz erstellen',
      'Teilnahme dokumentieren',
      'Bei Bedarf Eltern an Pflicht erinnern'
    ],
    '00000000-0000-0000-0000-000000000003'
  ),
  (
    'Garten',
    'Kinder haben einen naturnahen, anregenden Außenbereich',
    ARRAY['Gartengestaltung', 'Pflanzenpflege', 'Spielgeräte-Wartung'],
    ARRAY[
      'Saisonale Bepflanzung planen',
      'Rasenpflege koordinieren',
      'Spielgeräte regelmäßig prüfen',
      'Sandkasten-Hygiene sicherstellen'
    ],
    '00000000-0000-0000-0000-000000000003'
  ),
  (
    'Brandschutz',
    'Im Brandfall sind alle Personen sicher und wissen was zu tun ist',
    ARRAY['Fluchtpläne', 'Brandschutz-Übungen', 'Feuerlöscher-Wartung'],
    ARRAY[
      'Jährliche Brandschutz-Übung organisieren',
      'Flucht- und Rettungspläne aktuell halten',
      'Feuerlöscher-Prüfung veranlassen',
      'Brandschutzordnung pflegen'
    ],
    '00000000-0000-0000-0000-000000000003'
  );

-- Kreis: Gemeinschaft
INSERT INTO roles (name, purpose, domains, accountabilities, circle_id) VALUES
  (
    'Feste & Events',
    'Gemeinschaftsgefühl durch gemeinsame Feiern stärken',
    ARRAY['Jahresplanung Feste', 'Event-Organisation'],
    ARRAY[
      'Sommerfest und Laternenfest planen',
      'Elternabende organisieren',
      'Abschiedsfeiern für gehende Familien',
      'Budget für Feste verwalten'
    ],
    '00000000-0000-0000-0000-000000000004'
  ),
  (
    'Öffentlichkeitsarbeit',
    'Positive Außendarstellung des Vereins',
    ARRAY['Website', 'Social Media', 'Pressekontakt'],
    ARRAY[
      'Website aktuell halten',
      'Fotos von Veranstaltungen machen (mit Einverständnis)',
      'Bei Bedarf Presseanfragen bearbeiten',
      'Flyer für Tag der offenen Tür erstellen'
    ],
    '00000000-0000-0000-0000-000000000004'
  ),
  (
    'Onboarding neue Familien',
    'Neue Familien fühlen sich willkommen und finden sich schnell zurecht',
    ARRAY['Willkommenspaket', 'Mentoren-Programm'],
    ARRAY[
      'Willkommensmappe erstellen und aktuell halten',
      'Mentor für jede neue Familie zuweisen',
      'Einführungs-Rundgang durchführen',
      'Nach 3 Monaten Feedback einholen'
    ],
    '00000000-0000-0000-0000-000000000004'
  );

-- Kreis: Finanzen & Ressourcen
INSERT INTO roles (name, purpose, domains, accountabilities, circle_id) VALUES
  (
    'Fundraising & Spenden',
    'Zusätzliche Mittel für besondere Projekte und Anschaffungen',
    ARRAY['Spendenaktionen', 'Förderanträge', 'Sponsoring-Partnerschaften'],
    ARRAY[
      'Potentielle Fördertöpfe recherchieren',
      'Förderanträge stellen und nachverfolgen',
      'Spendenaktionen konzipieren und durchführen',
      'Spender angemessen danken'
    ],
    '00000000-0000-0000-0000-000000000005'
  ),
  (
    'Einkauf',
    'Benötigte Materialien sind verfügbar und werden wirtschaftlich beschafft',
    ARRAY['Lieferanten-Auswahl', 'Bestellungen'],
    ARRAY[
      'Regelmäßigen Bedarf ermitteln',
      'Preise vergleichen und günstige Quellen finden',
      'Bestellungen durchführen',
      'Rechnungen an Vorstand weiterleiten'
    ],
    '00000000-0000-0000-0000-000000000005'
  ),
  (
    'IT',
    'Digitale Infrastruktur läuft stabil und sicher',
    ARRAY['E-Mail-Verteiler', 'Cloud-Speicher', 'Website-Technik'],
    ARRAY[
      'E-Mail-Verteiler pflegen',
      'Cloud-Zugriffe verwalten',
      'Bei technischen Problemen helfen',
      'Datenschutz-Anforderungen umsetzen'
    ],
    '00000000-0000-0000-0000-000000000005'
  );

-- =====================================================
-- BEISPIEL-FAMILIE UND PERSON (für Tests)
-- =====================================================

INSERT INTO families (id, name, joined_at) VALUES
  ('00000000-0000-0000-0001-000000000001', 'Familie Mustermann', '2024-01-15');

-- Hinweis: Die Person wird erst nach der ersten Anmeldung mit auth_user_id verknüpft
INSERT INTO persons (id, email, name, phone, family_id, role) VALUES
  ('00000000-0000-0000-0002-000000000001', 'max@example.com', 'Max Mustermann', '+49 170 1234567', '00000000-0000-0000-0001-000000000001', 'member');

-- Beispiel-Rollen-Zuweisung
INSERT INTO role_assignments (role_id, person_id, valid_from) VALUES
  ((SELECT id FROM roles WHERE name = 'Arbeitsschutz'), '00000000-0000-0000-0002-000000000001', '2024-08-01'),
  ((SELECT id FROM roles WHERE name = 'Brandschutz'), '00000000-0000-0000-0002-000000000001', '2024-08-01');

-- =====================================================
-- BEISPIEL-SPANNUNGEN
-- =====================================================

INSERT INTO tensions (title, description, circle_id, raised_by, status, priority) VALUES
  (
    'Fenstergriff im Bad locker',
    'Der Griff am Fenster im Kinder-Bad wackelt und lässt sich kaum noch drehen. Sollte vor dem Winter repariert werden.',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0002-000000000001',
    'NEW',
    'MEDIUM'
  ),
  (
    'Gartentor schließt nicht richtig',
    'Das Gartentor zum Parkplatz schließt nicht mehr selbständig. Sicherheitsrisiko!',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0002-000000000001',
    'NEW',
    'HIGH'
  ),
  (
    'Rauchmelder im DG fehlt',
    'Bei der letzten Begehung wurde festgestellt, dass im Dachgeschoss ein Rauchmelder fehlt.',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0002-000000000001',
    'IN_PROGRESS',
    'HIGH'
  ),
  (
    'Neue Eltern für Elterndienst schulen',
    'Drei neue Familien sind noch nicht in den Elterndienst eingewiesen.',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0002-000000000001',
    'NEW',
    'MEDIUM'
  ),
  (
    'Sommerfest-Termin festlegen',
    'Der Termin für das Sommerfest sollte bald kommuniziert werden, damit alle planen können.',
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0002-000000000001',
    'NEW',
    'LOW'
  );

-- =====================================================
-- MEETINGS
-- =====================================================

-- Anstehendes Meeting (Gebäude & Garten)
INSERT INTO meetings (id, type, circle_id, date, facilitator_id, notes) VALUES
  (
    '00000000-0000-0000-0003-000000000001',
    'TACTICAL',
    '00000000-0000-0000-0000-000000000003',
    NOW() + INTERVAL '7 days' + TIME '19:00',
    '00000000-0000-0000-0002-000000000001',
    NULL
  );

-- Anstehendes Meeting (Betrieb)
INSERT INTO meetings (id, type, circle_id, date, facilitator_id, notes) VALUES
  (
    '00000000-0000-0000-0003-000000000002',
    'TACTICAL',
    '00000000-0000-0000-0000-000000000002',
    NOW() + INTERVAL '14 days' + TIME '18:30',
    NULL,
    NULL
  );

-- Anstehendes Governance Meeting (Gemeinschaft)
INSERT INTO meetings (id, type, circle_id, date, facilitator_id, notes) VALUES
  (
    '00000000-0000-0000-0003-000000000003',
    'GOVERNANCE',
    '00000000-0000-0000-0000-000000000004',
    NOW() + INTERVAL '21 days' + TIME '19:30',
    NULL,
    'Rollen-Neuverteilung nach Schuljahreswechsel'
  );

-- Vergangenes Meeting
INSERT INTO meetings (id, type, circle_id, date, facilitator_id, notes) VALUES
  (
    '00000000-0000-0000-0003-000000000004',
    'TACTICAL',
    '00000000-0000-0000-0000-000000000003',
    NOW() - INTERVAL '14 days' + TIME '19:00',
    '00000000-0000-0000-0002-000000000001',
    'Arbeitseinsatz am 15.03. besprochen, Material-Liste erstellt.'
  );

-- Meeting-Teilnehmer
INSERT INTO meeting_attendees (meeting_id, person_id) VALUES
  ('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0002-000000000001'),
  ('00000000-0000-0000-0003-000000000004', '00000000-0000-0000-0002-000000000001');

-- Agenda-Items (verknüpft mit Spannungen)
INSERT INTO meeting_agenda_items (meeting_id, tension_id, position, notes)
SELECT
  '00000000-0000-0000-0003-000000000001',
  id,
  ROW_NUMBER() OVER (ORDER BY priority DESC, created_at),
  NULL
FROM tensions
WHERE circle_id = '00000000-0000-0000-0000-000000000003'
  AND status IN ('NEW', 'IN_PROGRESS')
LIMIT 3;

-- =====================================================
-- CHECKLISTEN
-- =====================================================

INSERT INTO checklist_items (circle_id, title, description, frequency) VALUES
  ('00000000-0000-0000-0000-000000000003', 'Gefährdungsbeurteilung aktuell?', 'Wurde die Gefährdungsbeurteilung in den letzten 12 Monaten aktualisiert?', 'YEARLY'),
  ('00000000-0000-0000-0000-000000000003', 'Feuerlöscher geprüft?', 'Letzte Prüfung nicht älter als 2 Jahre?', 'YEARLY'),
  ('00000000-0000-0000-0000-000000000003', 'Arbeitseinsatz-Termine kommuniziert?', 'Sind die nächsten Termine im Kalender?', 'MEETING'),
  ('00000000-0000-0000-0000-000000000002', 'Elterndienst-Plan aktuell?', 'Ist der Plan für den kommenden Monat veröffentlicht?', 'MONTHLY'),
  ('00000000-0000-0000-0000-000000000002', 'Allergieliste aktuell?', 'Sind alle Allergien und Unverträglichkeiten dokumentiert?', 'MONTHLY');
