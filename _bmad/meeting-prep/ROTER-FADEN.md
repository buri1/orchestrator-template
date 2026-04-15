# Roter Faden — Praesentation 01.04.2026

---

## PART 1: KI-Redepart (~1.5 Min)

**Einstieg** (nach Uebergabe vom Kollegen)
- "Wir nutzen KI-gestuetzte Entwicklungswerkzeuge — das ist ein Werkzeug, kein Ersatz"
- Effizienzgewinne, die wir uns zu Nutze machen
- Umsetzung nach Industriestandards

**[OPTIONAL] Jensen Huang Anker**
- CEO von NVIDIA — aktuell wertvollstes Unternehmen der Welt
- "Wer keine KI-Werkzeuge nutzt = Chipdesigner mit Bleistift und Notizblock"
- NVIDIA gibt $2 Mrd./Jahr fuer KI-Token-Budget aus

**[OPTIONAL] Stripe Referenz** (Skin in the Game)
- Groesster Zahlungsdienstleister: >$1 Billion/Jahr
- Kann sich NULL Fehler erlauben
- Nutzt exakt diese 4 Mechanismen als Industriestandard

**4 Kernpfeiler auf der Folie:**

1. **Sandboxes — Isolierte Entwicklungsumgebung**
   - Eigener kleiner Computer, komplett abgeschottet
   - "Physikalisch unmoeglich, dass KI destruktives anrichtet"
   - Kein Zugriff auf Produktionsdaten

2. **Human in the Loop**
   - Jede Zeile Code wird vor Go-Live von Entwicklern Zeile fuer Zeile geprueft
   - Alles transparent, alles nachvollziehbar
   - KI = Werkzeug, nicht Entscheider

3. **Automatisiertes Testen (Test-Driven Development)**
   - Im Laufe des Projekts: ueber 500 automatisierte Tests
   - Laufen bei JEDER Aenderung ueber die gesamte App
   - Fehler werden sofort erkannt, bevor sie live gehen
   - TDD war schon VOR KI der Industriestandard — mit KI noch wichtiger

4. **Kein Vendor-Lock-in / Datenschutz**
   - Auf API-Level: keine KI trainiert auf diesen Daten
   - Daten bleiben bei unserem Unternehmen
   - Eigene Infrastruktur im Aufbau — komplett in-house
   - Nur Open-Source-Modelle, austauschbar

**Ueberleitung zu Marvin:**
- "Jetzt uebergibt mein Kollege Marvin..." *(Marvin prasentiert seinen Teil)*

---

## PART 2: Demo Flows (~13 Min)

*(Marvin leitet irgendwann zur Plattform ueber, oder du uebernimmst)*

**Einstieg Demo:**
- "Ich zeige euch jetzt den funktionalen Prototyp. Drei Perspektiven auf eine Plattform — nicht drei Inselloesungen, sondern ein System, in dem jedes Teil die anderen staerker macht."

**Alle Flows in Mobile-Ansicht zeigen** (Mobile-First-Ansatz)

### Flow 0: Homepage Walkthrough (~1 Min) [MOBILE]
- Startseite zeigen
- "Mobile First konzipiert — die meisten Buerger kommen uebers Handy"
- Portal-Uebersicht: alle Portale mit Farben auf einen Blick
- Karten-Vorschau: alle Portale auf einer Karte
- Feed: Portal-uebergreifende Neuigkeiten

### Flow 1: Ehrenamtsmatching (~3.5 Min)
- HiEngagement oeffnen
- Quiz starten: "3 Fragen — **derselbe Stepper wie bei HiArbeit**"
  - Interessen → Stadtteil → Engagement-Typ
- Ergebnis: "87% Match — und der Nutzer kann fragen WARUM"
  - Transparente Erklaerung, dieselbe Engine wie Jobmatching
- Kontaktaufnahme direkt moeglich, kein Seitenumbruch

### Flow 1.5: Kurzer Vergleich HiArbeit (~30 Sek)
- Schnell HiArbeit oeffnen → zeigen: gleiche Komponenten, andere Farbe
- "Shared Components — einmal gebaut, ueberall genutzt"

### Flow 2: Karte (~2.5 Min)
- "Was passiert, wenn man hunderte Interaktionen zusammendenkt?"
- **Eine Karte — gespeist aus allen Portalen**
- Filter-Chips zeigen: Portal an/abwaehlen
  - "Neues Portal = neuer Layer, automatisch, keine Zusatzentwicklung"
- Auf Marker klicken → Detail-Panel
- **KEY: "Modularitaet — neue Farbe, neues Portal, fertig"**

### Flow 3: Admin Dashboard (~3.5 Min)
- "Was sieht die Wirtschaftsfoerderung?"
- Stadtpuls-Statistiken: Aktivitaet ueber alle Portale auf einen Blick
- Help Score: Komposit aus allen 5 Portalen (aktuell: 74 "Gut")
- Portal-KPI-Kacheln: "Neues Portal? Erscheint automatisch"
- Stadtteil-Heatmap: Wo passiert was? → Business Intelligence fuer die Wirtschaftsfoerderung
- **→ AUF DESKTOP WECHSELN fuer Moderation**
- **Moderation** [DESKTOP]: KI-Ampelsystem (Gruen/Gelb/Rot), Bulk-Approve
  - "Je laenger das System laeuft, desto weniger manuelle Arbeit"
  - System lernt mit — wird mit der Zeit autonomer
  - Kein wachsender Personalbedarf, Kosten sinken ueber Zeit
- Trendbericht: A4-druckbar, fuer Ausschuss/KfW-Doku
- **Closer:** "Intelligente Moderation von Anfang an eingeplant — das System lernt mit, die Kosten sinken. Und das Dashboard liefert der Wirtschaftsfoerderung echte Business Intelligence — nicht nur Zahlen, sondern Entscheidungsgrundlagen."
- **→ Homepage nochmal in Desktop-Ansicht zeigen** — zeigt responsive Design, selbe Inhalte, anderes Layout

---

## PART 3: Architektur (~4 Min)

**Ueberleitung:** "Kurz unter die Haube — sechs Prinzipien, die langfristig Geld sparen"

1. **Modularitaet / Baukastensystem**
   - Ueber 90 Shared Components, Verhaeltnis 18:1
   - 6. Portal = Konfiguration, nicht Neuentwicklung
   - 6 Zeilen CSS + 1 Registry-Eintrag
   - Auch die Datenbank: Tabellen sind so strukturiert, dass ein neues Portal Eintraege hinzufuegt/entfernt — keine neuen Tabellen, kein Umbauen
   - "Hinzufuegen und Entfernen, nicht Neubauen"

2. **API-Wrapper fuer externe Systeme**
   - HAZ-Jobportal, Bundesagentur etc. erscheinen nativ
   - Neue Quelle = ein Wrapper, null UI-Aenderungen

3. **Row-Level Security**
   - Zugriffsregeln in der Datenbank, nicht im Code
   - "Datenleck ausgeschlossen — Datenbank ist letzte Verteidigungslinie"
   - Dasselbe System, das Banken nutzen — hoechste Sicherheitsstufe

4. **BITV 2.0 / Barrierefreiheit**
   - "Barrierefreiheit ist kein Nachgedanke — es ist in die Architektur eingebaut"
   - shadcn/ui + Radix UI: jedes Eingabefeld, Dialog, Navigation kommt mit Tastatursteuerung, ARIA-Labels, Screenreader-Unterstuetzung
   - WCAG-AA Kontrast geprueft (4,5:1)
   - Farbe nie allein als Informationstraeger — immer in Kombination mit Icons oder Text

5. **Auth + BundID + Value-First-Design**
   - Dreistufig: Anonym → Registriert → BundID-verifiziert
   - Keine eigene Passwortverwaltung, OAuth-Standards
   - **Value-First-Prinzip:** Jeder User kriegt sofort Mehrwert — auch anonym
   - Stufenweise Authentifizierung haelt User auf der Seite
   - Wenn User keinen schnellen Mehrwert sehen → hohe Absprungrate (Churn)
   - "Die beste Plattform bringt nichts, wenn die Leute nach 10 Sekunden abspringen"
   - Bewusste UX-Entscheidung: erst Value liefern, dann zur Registrierung einladen

6. **Vendor-Lock-in = Null**
   - Next.js, PostgreSQL, TypeScript, React — alles Open Source
   - KI-Moderation auf eigener Hardware mit offenen Modellen
   - **"Sichere KI, offene KI, deutsche KI"**

**Abschluss:**
- "Sechs Prinzipien. Jedes spart der Stadt langfristig Geld und gibt ihr die Kontrolle."
- "Vielen Dank. Ich freue mich auf eure Fragen."

---

## QUICK REFERENCE — Zahlen zum Einstreuen

| Was | Zahl |
|-----|------|
| Shared Components | 90+ |
| Neues Portal | 6 Zeilen CSS |
| Help Score | 74 "Gut" |
| Stripe Volumen | >$1 Billion/Jahr |
| Jensen Huang Budget | 50% Gehalt obendrauf, $2 Mrd./Jahr |
| SAP Produktivitaet | 7-12x |
| Zalando | 3.000 Devs, >20% mehr Output |
| opencode.de | 8.000+ Nutzer, 3.000+ Projekte |
| KfW-Pflicht | seit Okt. 2022 |
| Automatisierte Tests | 500+ geplant |
| EfA-Reichweite | 11.000 Kommunen |
