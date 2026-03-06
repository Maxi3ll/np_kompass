# Termine-Flow: Fix-Plan

## Bugs fixen

### 1. Datum-Default im Formular
- **Datei:** `src/app/meetings/neu/meeting-form.tsx:35,55,160`
- **Problem:** `date`-State startet mit `""`, Input zeigt `getDefaultDate()` als Fallback. Validation schlägt fehl ohne Interaktion.
- **Fix:** `useState("")` → `useState(getDefaultDate())`, Fallback im `value` entfernen.

### 2. `undefined20` CSS-Wert
- **Datei:** `src/app/meetings/[id]/page.tsx:306`
- **Problem:** `${meeting.circle?.color}20` produziert `"undefined20"` wenn color undefined.
- **Fix:** Fallback-Farbe einfügen: `${meeting.circle?.color || '#4A90D9'}20`

### 3. Realtime AGENDA_INSERT ohne Relations
- **Datei:** `src/hooks/use-meeting-realtime.ts:261-264`
- **Problem:** Neue Agenda-Items haben keine `tension`/`owner`-Daten, werden als "Unbenannter Punkt" angezeigt.
- **Fix:** Nach INSERT die vollständigen Daten per Query nachladen (analog zu `fetchAttendee`).

## Sicherheit

### 4. Comment-Subscription ohne Meeting-Filter
- **Datei:** `src/hooks/use-meeting-realtime.ts:287`
- **Problem:** Empfängt INSERT-Events für Kommentare ALLER Meetings.
- **Fix:** Agenda-Item-IDs als Filter nutzen oder die Architektur so anpassen, dass nur relevante Events ankommen (z.B. über meeting_id Join).

## UX-Verbesserungen (high impact)

### 5. Bestätigungsdialoge für irreversible Aktionen
- **Dateien:** `start-meeting-button.tsx`, `facilitator-controls.tsx`
- **Problem:** Meeting starten, Phase vorrücken, Meeting abschliessen — alles ohne Nachfrage.
- **Fix:** Confirmation-Dialog vor `startMeeting`, `advanceMeetingPhase` (CLOSING→COMPLETED).

### 6. Fehleranzeige bei fehlgeschlagenen Actions
- **Dateien:** `start-meeting-button.tsx`, `facilitator-controls.tsx`, `agenda-section.tsx`, `agenda-item-live.tsx`
- **Problem:** ~6 Server Actions ignorieren Fehler komplett.
- **Fix:** Error-State + Toast/Inline-Fehlermeldung hinzufügen.

### 7. Leere "Vergangen"-Beschreibung
- **Datei:** `src/app/meetings/page.tsx:244`
- **Problem:** Empty-State für vergangene Termine hat leeren String.
- **Fix:** Hilfreichen Text einfügen.

### 8. Touch Target Agenda-Remove-Button
- **Datei:** `src/app/meetings/[id]/agenda-section.tsx:111`
- **Problem:** `w-7 h-7` (28px) unter 48px Minimum für Mobile.
- **Fix:** Auf `w-9 h-9` (36px) oder größer erhöhen, ggf. Padding-basiert.

### 9. `maxLength` auf Inputs
- **Dateien:** `meeting-form.tsx`, `agenda-section.tsx`, `agenda-item-live.tsx`
- **Problem:** Kein Client-seitiges Limit, Server begrenzt auf 5000.
- **Fix:** `maxLength={5000}` (bzw. passende Limits) auf relevante Inputs setzen.

## Code Quality

### 10. `any`-Typing durch richtige Typen ersetzen
- **Dateien:** `meetings/page.tsx`, `[id]/page.tsx`, `agenda-phase.tsx`, `use-meeting-realtime.ts`
- **Problem:** ~20+ `any`-Stellen.
- **Fix:** Domain-Types aus `src/types/index.ts` verwenden oder lokale Interfaces.

### 11. Duplizierten Code refactoren
- **Facilitator/Attendee-Cards:** In `[id]/page.tsx` zwischen SCHEDULED und COMPLETED dupliziert → extrahieren.
- **CheckInPhase/ClosingPhase:** Fast identisch → generische `RoundPhase`-Komponente.
- **MEETING_TYPE_CONFIG:** In 2 Dateien separat definiert → in shared Modul.

### 12. Offline-/Reconnection-Indikator
- **Datei:** `src/hooks/use-meeting-realtime.ts`
- **Problem:** Keine Fehlerbehandlung bei Verbindungsabbruch.
- **Fix:** Channel-Status überwachen, Reconnection-Banner anzeigen.
