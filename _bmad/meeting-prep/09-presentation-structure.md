# OmniPort Hildesheim -- 2. Vergaberunde Praesentation

**Ziel:** Zuschlag sichern. 15-20 Min Praesentation + 10 Min Q&A.
**Datum:** TBD (vorbereitet ab 30.03.2026)
**Publikum:** Stadt Hildesheim, Smart-City-Team, erfahrener Sysadmin (kennt Claude Code)
**Gesamtbudget Projekt:** EUR 15M (KfW-gefoerdert)

---

## Slide-by-Slide Outline

---

### SLIDE 1 -- Titelfolie

**Headline:** OmniPort Hildesheim -- Vom Prototyp zur Plattform

**Bullet Points:**
- Logo: Hi.Hildesheim (Markenfarben: H=#CE6715, i=#0998C1, .=#008580, Hildesheim=#383838)
- Untertitel: "Modulare Smart-City-Plattform -- Open Source, DSGVO-konform, KI-beschleunigt"
- Datum + Anbieter-Logo
- "2. Vergaberunde"

**Speaker Notes:**
> "Vielen Dank fuer die Einladung zur zweiten Runde. Wir haben beim letzten Mal den funktionalen Prototypen gezeigt. Heute moechten wir Ihnen zeigen, was seitdem passiert ist, wie wir arbeiten, und warum unsere Architektur die richtige Grundlage fuer OmniPort ist."

---

### SLIDE 2 -- Rueckblick Meeting 1: Was wir gezeigt haben

**Headline:** Was Sie bereits gesehen haben

**Bullet Points:**
- 5 Portal-Journeys live demonstriert (HiArbeit, HiEngagement, HiGruendung, HiErleben, HiWissen)
- Shared-Component-Philosophie: Ein Quiz-Stepper, verschiedene Portale, gleiche UX
- API-Wrapper-Konzept: Externe Daten (HAZ Jobportal, Koha, BundID) einheitlich integriert
- Admin-Dashboard mit KI-gestuetzter Moderation (Ampelsystem: Gruen/Gelb/Rot)
- Leihothek, B2B-Marktplatz, Talentpool -- alles im gleichen System

**Speaker Notes:**
> "Kurzer Rueckblick: Sie haben beim letzten Mal einen funktionalen Prototyp gesehen. Fuenf Portale, drei User Journeys, ein Admin-Dashboard mit KI-Moderation. Die Kernbotschaft war: Einmal bauen, ueberall nutzen. Shared Components sorgen dafuer, dass egal welches Portal man oeffnet, der Nutzer immer die gleiche Qualitaet erlebt. Das gilt auch fuer Module, die in Co-Entwicklung oder extern entstehen."

**Daten:**
- Live-URL gezeigt: https://omniport-hh.vercel.app
- Quiz-Demos: Ehrenamt (3 Fragen -> Match-Score), Jobs (3 Fragen -> Match-Score)

---

### SLIDE 3 -- Fortschritt seit Meeting 1

**Headline:** 14 Verbesserungen in 13 Tagen

**Bullet Points:**
- Pixel-genaues Redesign der Portal-Karten nach Ihrem Design-Template (Kreisfotos, Serif-Schrift, Sub-Modul-Icons)
- Neues Aerial-Hero-Banner mit professioneller Bildsprache (Gradient-Scrim fuer Lesbarkeit)
- Job-Quiz fuer HiArbeit + Studenten-Quiz fuer Talentpool hinzugefuegt
- Mobile-Optimierung: Admin-Hamburger-Menu, Quiz-Ergebnisse Single-Column, Overflow-Fixes
- Demo-Readiness: Alle Warnmeldungen bereinigt, Portal-Bilder photorealistisch ersetzt

**Speaker Notes:**
> "Seit unserem letzten Termin am 17. Maerz haben wir 14 gezielte Verbesserungen eingespielt. Besonders wichtig: Wir haben Ihr Design-Template genommen und die Portal-Karten pixelgenau umgesetzt -- mit den runden Bildausschnitten, der Serif-Schrift fuer Portalnamen, und den Sub-Modul-Karten mit Icons. Ausserdem haben wir zwei neue Quizze gebaut -- eines fuer die Jobsuche, eines fuer den Talentpool. Alles laeuft mobil und auf dem Desktop einwandfrei."

**Daten:**
- 14 Commits zwischen 17.03. und 30.03.2026
- Davon 5 neue Features, 9 Fixes/Polish
- Deployment: Automatisch via Vercel bei jedem Push

---

### SLIDE 4 -- Live-Demo: Was sich veraendert hat (OPTIONAL -- nur wenn Zeit)

**Headline:** Vorher/Nachher -- Portal-Karten

**Bullet Points:**
- Screenshot Vorher: SVG-Platzhalter, generische Karten
- Screenshot Nachher: Photorealistische Kreisbilder, Playfair Display, Sub-Modul-Icons
- Mobile-Ansicht: Responsive, Single-Column Quiz-Ergebnisse
- Admin: Hamburger-Menu auf Mobile

**Speaker Notes:**
> "Hier sehen Sie den direkten Vergleich. Links der Stand vom 17. Maerz, rechts der aktuelle Stand. Die Portal-Karten orientieren sich jetzt exakt an Ihrem Design-Dokument. Das zeigt unsere Arbeitsweise: Wir nehmen Ihr Feedback ernst und setzen es schnell um."

---

### SLIDE 5 -- Unsere Entwicklungsmethode: KI-beschleunigt, menschlich gefuehrt

**Headline:** AI-Accelerated, Human-Governed Development

**Bullet Points:**
- KI-gestuetzte Entwicklung = 3-5x schnellere Iterationszyklen
- Jede Zeile Code wird von einem menschlichen Entwickler reviewed und freigegeben
- Automatisierte Tests (Vitest), Linting (ESLint), Type-Checking (TypeScript strict mode)
- CI/CD-Pipeline: Jeder Push wird automatisch gebaut, getestet, deployed
- Code-Ownership bleibt immer beim Menschen -- KI ist das Werkzeug, nicht der Entscheider

**Speaker Notes:**
> "Ich moechte offen darueber sprechen, wie wir arbeiten, denn das ist ein wesentlicher Grund fuer unsere Geschwindigkeit. Wir nutzen KI-gestuetzte Entwicklungswerkzeuge. Das heisst konkret: Ein Entwickler definiert die Aufgabe, die KI schlaegt Code vor, der Entwickler reviewed, testet und gibt frei. Das ist wie ein sehr schneller Junior-Entwickler, der nie muede wird -- aber der Senior-Entwickler hat immer das letzte Wort. 14 Verbesserungen in 13 Tagen -- das waere mit klassischer Entwicklung so nicht moeglich gewesen."

---

### SLIDE 6 -- Case Study: Stripe vertraut auf KI-Entwicklung

**Headline:** Branchenstandard: Die Besten setzen auf KI-gestuetzte Entwicklung

**Bullet Points:**
- Stripe (groesster Payment-Prozessor der Welt, verarbeitet Milliarden EUR taeglich) setzt intern "AI Agents" ein
- Stripe's "Minions"-Programm: KI-Agenten loesen Tausende interne Engineering-Tickets autonom
- Ergebnis: Schnellere Feature-Releases, weniger Bugs, mehr Zeit fuer Architektur-Entscheidungen
- Weitere Unternehmen: Google (Gemini Code Assist), Microsoft (GitHub Copilot), Amazon (CodeWhisperer)
- **Der Unterschied:** Nicht OB man KI nutzt, sondern WIE verantwortungsvoll man es tut

**Speaker Notes:**
> "Falls die Frage aufkommt: Ist KI-gestuetzte Entwicklung serioes? Stripe -- das ist der groesste Payment-Prozessor der Welt, die verarbeiten Milliarden an Transaktionen taeglich -- setzt intern ein Programm namens 'Minions' ein. Das sind KI-Agenten, die selbststaendig Engineering-Aufgaben loesen. Google, Microsoft, Amazon -- alle grossen Tech-Unternehmen arbeiten so. Der entscheidende Punkt ist nicht, ob man KI nutzt, sondern welche Guardrails man hat. Und genau da unterscheiden wir uns."

**Quellen:**
- Stripe Engineering Blog: "How Stripe uses AI agents" (oeffentlich)
- GitHub Copilot: 55% schnellere Task Completion (GitHub Research, 2024)
- McKinsey 2024: "AI-assisted development increases productivity 20-45%"

---

### SLIDE 7 -- Unsere Guardrails: Wie wir Qualitaet sicherstellen

**Headline:** Verantwortungsvolle KI-Entwicklung: Unsere 5 Saeuleni

**Bullet Points:**
1. **Human Review**: Jeder Merge erfordert menschliche Freigabe -- kein Code geht ungeprüft in Production
2. **Automatisierte Tests**: Unit-Tests (Vitest), Type-Safety (TypeScript strict), Linting (ESLint)
3. **CI/CD mit Gates**: Build muss erfolgreich sein, Tests muessen gruene sein, bevor deployed wird
4. **Git-Historie**: Jede Aenderung ist nachvollziehbar -- wer, was, wann, warum
5. **KI sieht KEINE Produktionsdaten**: Entwicklung passiert ausschliesslich mit Mock-Daten und Testumgebungen

**Speaker Notes:**
> "Fuenf konkrete Sicherheitsnetze. Erstens: Kein Code geht ohne menschliche Freigabe live. Zweitens: Automatisierte Tests -- wenn etwas kaputt geht, merken wir es sofort. Drittens: Unsere CI/CD-Pipeline blockiert ein Deployment, wenn Tests fehlschlagen. Viertens: Jede einzelne Aenderung ist in der Git-Historie lueckenlos dokumentiert. Und fuenftens -- besonders wichtig fuer den Datenschutz: Die KI-Werkzeuge arbeiten ausschliesslich mit der Codebasis und Mock-Daten. Produktionsdaten, Nutzerdaten, personenbezogene Daten -- daran kommt die KI nie ran."

---

### SLIDE 8 -- Technische Architektur: Die richtige Grundlage

**Headline:** Modern, offen, zukunftssicher

**Bullet Points:**
- **Next.js 16** (React 19): Modernste Web-Technologie, Server-Side-Rendering, optimale Performance
- **Supabase**: Open-Source Backend (PostgreSQL) -- kein Vendor-Lock-in, Daten gehoeren der Stadt
- **shadcn/ui + Radix**: Barrierefreie UI-Komponenten (BITV 2.0 / WCAG 2.1 konform)
- **TypeScript strict mode**: Typ-Sicherheit verhindert ganze Fehlerklassen zur Compile-Zeit
- **Turbopack**: Naechste Generation Build-System (von Vercel/Next.js-Team), ultraschnelle Entwicklungszyklen

**Speaker Notes:**
> "Zur Technologie: Wir setzen auf Next.js 16 -- das ist das aktuellste Release, mit React 19 unter der Haube. Das Backend laeuft auf Supabase, einer Open-Source-Alternative zu Firebase. Der grosse Vorteil: Die Datenbank ist ein normales PostgreSQL. Das heisst, es gibt kein Vendor-Lock-in. Wenn die Stadt in fuenf Jahren den Anbieter wechseln will, nehmen Sie Ihre Datenbank mit. Unsere UI-Komponenten sind von Grund auf barrierefrei gebaut -- BITV 2.0 ist kein Nachgedanke, sondern eingebaut."

**Daten:**
- Next.js: 130K+ GitHub Stars, genutzt von Notion, TikTok, Nike
- Supabase: 80K+ GitHub Stars, SOC2-zertifiziert, GDPR-konform
- React: Weltweit meistgenutzte UI-Bibliothek (>40% aller Websites)

---

### SLIDE 9 -- Shared Components: Einmal bauen, ueberall nutzen

**Headline:** Architekturprinzip: Shared Components

**Bullet Points:**
- Quiz-Stepper: Gleiche Komponente in HiEngagement, HiArbeit, Talentpool -- verschiedene Fragen
- Portal-Karten: Einheitliches Design fuer alle 5 Portale, konfigurierbar per Daten
- Admin-Moderation: Ein Moderationstool fuer alle Inhalte, portaluebergreifend
- API-Wrapper: Externe Quellen (HAZ, Koha, BundID) in einheitliches internes Format uebersetzt
- **Effekt:** Neues Portal hinzufuegen = Konfiguration, nicht Neuentwicklung

**Speaker Notes:**
> "Das Architekturprinzip, das uns am meisten Zeit und Geld spart: Shared Components. Sie erinnern sich an die Quiz-Demonstration. Derselbe Stepper, dieselbe Logik -- aber verschiedene Fragen fuer verschiedene Portale. Das gleiche Prinzip gilt fuer die Portal-Karten, die Moderation, die Suche. Und wenn Sie ein sechstes Portal brauchen, dann ist das im Wesentlichen Konfiguration, nicht Neuentwicklung. Das spart nicht nur Entwicklungskosten, sondern auch Wartungskosten langfristig."

**Visualisierung (Diagramm):**
```
[Quiz-Stepper] --> HiArbeit (Jobs)
               --> HiEngagement (Ehrenamt)
               --> Talentpool (Studierende)

[API-Wrapper]  --> HAZ Jobportal
               --> Koha Bibliothek
               --> BundID Auth
               --> Partner-Module
```

---

### SLIDE 10 -- API-Wrapper: Externe Systeme sauber integrieren

**Headline:** API-Wrapper: Jede Quelle spricht unsere Sprache

**Bullet Points:**
- Problem: HAZ, Koha, BundID, Partner-Module -- alle liefern verschiedene Datenformate
- Loesung: Uebersetzungsschicht, die alle externen Daten in ein einheitliches internes Format bringt
- Shared Components greifen nur auf das interne Format zu -- egal woher die Daten kommen
- Neue Datenquelle anbinden = Einen neuen Wrapper schreiben, keine UI-Aenderungen noetig
- Co-Entwicklung mit externen Partnern (z.B. Praktikumsmatching) wird dadurch nahtlos moeglich

**Speaker Notes:**
> "Die API-Wrapper-Schicht ist entscheidend fuer die Integration externer Systeme. Beim letzten Mal habe ich gezeigt, wie Stellenangebote aus dem HAZ-Jobportal in unserem Design erscheinen. Das passiert ueber eine Uebersetzungsschicht. Jede externe Quelle spricht eine andere Sprache, aber bei uns im System sprechen alle dieselbe. Das bedeutet auch: Wenn ein neuer Partner dazukommt oder eine neue Datenquelle angebunden werden soll, schreiben wir einen neuen Wrapper -- und die gesamte UI funktioniert sofort damit, ohne Aenderungen."

---

### SLIDE 11 -- Datensouveraenitaet & Sicherheit

**Headline:** Ihre Daten gehoeren Ihnen. Punkt.

**Bullet Points:**
- **Hosting:** Supabase-Instanz in Frankfurt (AWS eu-central-1) -- Daten verlassen Deutschland nie
- **Open Source:** Gesamte Codebasis OSI-kompatibel lizenziert, opencode.de-ready
- **DSGVO by Design:** Datensparsamkeit, Zweckbindung, Loeschkonzept von Tag 1
- **KI-Werkzeuge:** Arbeiten NUR mit Code und Mock-Daten -- NIEMALS mit Produktions- oder Nutzerdaten
- **BundID-Integration:** Foederierte Authentifizierung, keine eigene Passwort-Speicherung

**Speaker Notes:**
> "Das ist vermutlich die wichtigste Folie fuer Sie. Datensouveraenitaet. Erstens: Ihre Daten liegen in Frankfurt. AWS eu-central-1, deutsches Rechenzentrum. Die Daten verlassen Deutschland nie. Zweitens: Der gesamte Code ist Open Source. Sie koennen ihn jederzeit einsehen, auditieren, forken. Wir sind bereit fuer opencode.de. Drittens: DSGVO ist kein Haekchen, das wir am Ende setzen, sondern ein Designprinzip. Datensparsamkeit, Zweckbindung, Loeschkonzepte -- das ist alles von Tag 1 eingeplant. Und viertens, um das nochmal klar zu sagen: Unsere KI-Entwicklungswerkzeuge sehen niemals Produktionsdaten. Die arbeiten ausschliesslich mit dem Quellcode und Testdaten."

**Fuer den Sysadmin im Raum (bei Rueckfrage):**
- PostgreSQL mit Row-Level-Security (RLS) in Supabase
- Supabase Auth mit JWT-Tokens, kein Custom-Auth
- SSL/TLS ueberall, HSTS-Header
- Dependency-Scanning via GitHub Dependabot
- Kein selbstgebautes Krypto -- alles Standard-Bibliotheken

---

### SLIDE 12 -- Open Source & Transparenz

**Headline:** Open Source ist kein Buzzword -- es ist unser Versprechen

**Bullet Points:**
- Vollstaendiger Quellcode auf GitHub, jederzeit einsehbar
- Keine proprietaeren Abhaengigkeiten -- jede Bibliothek ist Open Source (MIT/Apache-2.0)
- Stadt kann jederzeit einen zweiten Dienstleister beauftragen (kein Vendor-Lock-in)
- opencode.de-konform: Erfuellt die Anforderungen der OZG-Nachfolge fuer kommunale Software
- Community-Beitraege moeglich: Andere Staedte koennten die Plattform adaptieren

**Speaker Notes:**
> "Open Source heisst fuer uns: Die Stadt Hildesheim besitzt die Plattform. Nicht wir. Wenn Sie in zwei Jahren sagen, wir moechten mit einem anderen Dienstleister weiterarbeiten -- kein Problem. Der Code ist da, die Dokumentation ist da, die Architektur ist sauber. Das ist kein Vendor-Lock-in. Und weil wir auf Standard-Technologien setzen -- Next.js, Supabase, PostgreSQL -- findet man ueberall Entwickler, die damit arbeiten koennen. Das ist auch der Sinn hinter opencode.de: Kommunale Software soll wiederverwendbar sein. Eine Stadt wie Goettingen koennte unsere Plattform nehmen und fuer sich anpassen."

---

### SLIDE 13 -- Sprint-Plan & Timeline

**Headline:** Vom Prototyp zur Produktion: Der Weg

**Bullet Points:**

| Phase | Zeitraum | Inhalt |
|-------|----------|--------|
| Phase 1: Foundation | Monat 1-2 | BundID-Integration, Auth-System, Datenbank-Schema, CI/CD-Pipeline |
| Phase 2: Core Portals | Monat 3-5 | HiArbeit + HiEngagement produktionsreif, API-Wrapper HAZ + Koha |
| Phase 3: Expansion | Monat 6-8 | HiGruendung + HiErleben + HiWissen, Praktikumsmatching-Anbindung |
| Phase 4: Admin & KI | Monat 9-10 | Admin-Dashboard, KI-Moderation, Reporting, Analytics |
| Phase 5: Launch | Monat 11-12 | UAT, Penetration-Test, Performance-Tuning, Go-Live |

**Speaker Notes:**
> "Hier ist unser realistischer Zeitplan. Zwoelf Monate bis zum Go-Live. In den ersten zwei Monaten legen wir das Fundament: BundID-Integration, Authentifizierung, Datenbank-Schema, CI/CD-Pipeline. Danach bauen wir in Wellen: Zuerst die beiden Kernportale HiArbeit und HiEngagement produktionsreif, inklusive der API-Wrapper fuer HAZ und Koha. Dann die restlichen Portale. Das Admin-Dashboard und die KI-Moderation kommen in Phase 4. Und in Phase 5 geht es um Qualitaetssicherung: User Acceptance Testing, Penetration-Tests, Performance-Tuning. Erst wenn alles stimmt, gehen wir live."

**Daten:**
- Prototyp bereits funktional (Beweis: live unter omniport-hh.vercel.app)
- 14 Iterationen in 13 Tagen = Geschwindigkeit bleibt hoch
- Agile Sprints mit 2-Wochen-Zyklen, regelmaessige Demos an die Stadt

---

### SLIDE 14 -- Risikomanagement

**Headline:** Risiken kennen, Risiken managen

**Bullet Points:**
- **Technisches Risiko:** Prototyp beweist Machbarkeit -- keine unbewiesenen Technologien
- **Abhaengigkeit von KI-Tools:** KI beschleunigt, ist aber nicht essentiell -- Fallback auf klassische Entwicklung jederzeit moeglich
- **Personalrisiko:** Open-Source-Stack = grosser Talentpool, kein Spezialwissen noetig
- **Timeline-Risiko:** Buffer in jeder Phase eingeplant, Kernfunktionen priorisiert
- **Datenschutz-Risiko:** DSGVO-Audit in Phase 1 eingeplant, externer Datenschutzbeauftragter empfohlen

**Speaker Notes:**
> "Wir sind realistisch. Jedes Projekt hat Risiken. Aber wir haben sie identifiziert und Gegenmassnahmen definiert. Das technische Risiko ist minimal, weil der Prototyp bereits beweist, dass unsere Architektur funktioniert. Falls KI-Tools morgen nicht mehr verfuegbar waeren, koennten wir klassisch weiterentwickeln -- nur langsamer. Und weil wir auf Standard-Technologien setzen, sind wir nicht von einzelnen Personen abhaengig."

---

### SLIDE 15 -- Warum wir: Geschwindigkeit + Qualitaet + Innovation

**Headline:** Drei Gruende, warum wir die richtige Wahl sind

**Bullet Points:**
1. **Geschwindigkeit:** Funktionaler Prototyp bereits vor Zuschlag gebaut -- 14 Iterationen in 13 Tagen nach Ihrem Feedback
2. **Qualitaet:** Pixel-genaue Umsetzung Ihres Designs, barrierefreie Komponenten, TypeScript strict mode, automatisierte Tests
3. **Innovation:** KI-gestuetzte Moderation, selbstlernendes System, Shared-Component-Architektur -- weniger Aufwand fuer die Stadt, langfristig

**Speaker Notes:**
> "Drei Gruende. Erstens Geschwindigkeit: Wir haben nicht gewartet. Wir haben vor dem Zuschlag einen funktionalen Prototypen gebaut. Fuenf Portale, drei Quizze, ein Admin-Dashboard. Und nach unserem letzten Treffen haben wir innerhalb von 13 Tagen 14 Verbesserungen basierend auf Ihrem Feedback umgesetzt. Das ist die Geschwindigkeit, die Sie auch im Projekt erwarten koennen. Zweitens Qualitaet: Wir nehmen Ihr Design-Template ernst. Pixelgenau. Barrierefreiheit von Anfang an. TypeScript als Sicherheitsnetz. Drittens Innovation: Das KI-gestuetzte Moderationssystem lernt mit der Zeit dazu. Je laenger die Plattform laeuft, desto weniger manuelle Arbeit fuer die Stadtverwaltung."

---

### SLIDE 16 -- Closing: OmniPort gehoert Hildesheim

**Headline:** OmniPort gehoert Hildesheim -- nicht uns.

**Bullet Points:**
- Open Source, kein Vendor-Lock-in, Daten in Deutschland
- Prototyp ist live -- wir reden nicht, wir zeigen
- Modulare Architektur waechst mit den Anforderungen der Stadt
- "Weniger Aufwand fuer die Stadt, langfristig" -- selbstlernendes System
- Wir freuen uns auf Ihre Fragen.

**Speaker Notes:**
> "Zum Abschluss moechte ich einen Gedanken mitgeben: OmniPort gehoert nicht uns. Es gehoert der Stadt Hildesheim. Open Source, Daten in Frankfurt, kein Vendor-Lock-in. Wir haben nicht nur Folien mitgebracht, sondern einen funktionalen Prototypen. Wir reden nicht darueber, was wir bauen koennten -- wir zeigen, was wir bereits gebaut haben. Und unsere Architektur ist so gestaltet, dass sie mit Ihren Anforderungen waechst, ohne dass alles neu gebaut werden muss. Vielen Dank. Ich freue mich auf Ihre Fragen."

---

## Q&A Vorbereitung (10 Minuten)

### Erwartete Fragen & vorbereitete Antworten

---

**Q1: "Wie stellen Sie sicher, dass KI-generierter Code sicher ist?"**

> "Sehr gute Frage. Drei Ebenen: Erstens sieht die KI niemals Produktionsdaten -- sie arbeitet nur mit Quellcode und Mock-Daten. Zweitens durchlaeuft jeder Code-Vorschlag ein menschliches Review, automatisierte Tests, und Type-Checking. Und drittens: Der Code ist Open Source. Sie koennen ihn jederzeit von einem unabhaengigen Sicherheitsberater auditieren lassen. Wir empfehlen das sogar."

---

**Q2: "Was passiert, wenn Claude Code / die KI-Tools abgeschaltet werden?"**

> "Dann entwickeln wir klassisch weiter. Die KI ist ein Beschleuniger, kein tragendes Element. Unser Code ist normaler TypeScript/React-Code. Jeder Next.js-Entwickler kann damit arbeiten, mit oder ohne KI-Werkzeuge. Die Architektur, die Tests, die CI/CD-Pipeline -- das alles ist voellig unabhaengig von KI."

---

**Q3: "Warum Supabase und nicht ein eigener Server?" (Sysadmin-Frage)**

> "Supabase ist im Kern ein verwaltetes PostgreSQL mit einer REST-API und Auth-Schicht obendrauf. Wir haben volle Kontrolle ueber die Datenbank -- Row-Level-Security, eigene Funktionen, Migrationen via SQL. Wenn die Stadt es vorzieht, koennen wir Supabase auch self-hosted betreiben -- das ist ebenfalls Open Source. Oder wir migrieren auf ein nacktes PostgreSQL mit eigener Auth-Schicht. Kein Lock-in."

---

**Q4: "Koennen andere Staedte die Plattform nutzen?"**

> "Ja, das ist ein explizites Designziel. Durch die modulare Architektur und Open-Source-Lizenz kann jede Kommune den Code forken und fuer sich anpassen. Die Shared Components sind generisch gebaut -- man tauscht die Konfiguration aus, nicht den Code. Das passt auch zum opencode.de-Gedanken der OZG-Nachfolge."

---

**Q5: "Wie handhabt ihr Co-Entwicklung mit externen Partnern?" (z.B. Praktikumsmatching)**

> "Ueber den API-Wrapper. Der externe Partner entwickelt sein Modul unabhaengig -- mit eigener Technologie, eigenem Tempo. Sobald eine API existiert, schreiben wir einen Wrapper, und die Daten erscheinen in unserem einheitlichen Design. Der Partner muss unser Frontend nicht kennen, und wir muessen sein Backend nicht kennen. Saubere Trennung."

---

**Q6: "Was kostet das?" (Falls Budget-Frage kommt)**

> "Unsere KI-gestuetzte Entwicklung bedeutet konkret: Wir liefern mehr Features pro Sprint als ein gleich grosses klassisches Team. Das heisst nicht, dass es weniger kostet, aber Sie bekommen mehr fuer Ihr Geld. Konkrete Zahlen besprechen wir gerne im Detail -- wir haben einen transparenten Sprint-basierten Abrechnungsmodus."

---

**Q7: "Warum sollten wir Ihnen vertrauen und nicht einem groesseren Unternehmen?"**

> "Weil wir Ihnen keinen Pitch zeigen, sondern eine laufende Plattform. Grosse Beratungshaeuser bringen PowerPoints. Wir bringen einen Prototypen, den Sie anfassen koennen. 14 Verbesserungen in 13 Tagen nach Ihrem Feedback -- das ist die Reaktionsgeschwindigkeit, die Sie im Projekt brauchen. Und durch Open Source haben Sie die Sicherheit, dass Sie nie von uns abhaengig sind."

---

**Q8: "BITV 2.0 / Barrierefreiheit -- wie weit sind Sie da?"**

> "Unsere UI-Komponenten basieren auf Radix UI, einer Bibliothek, die von Grund auf fuer Barrierefreiheit gebaut ist. ARIA-Labels, Tastaturnavigation, Screenreader-Kompatibilitaet -- das ist eingebaut, nicht nachgeruestet. Fuer die Produktion planen wir einen vollstaendigen BITV-2.0-Audit mit einem spezialisierten Dienstleister ein."

---

## Timing-Plan

| Block | Dauer | Slides |
|-------|-------|--------|
| Opening & Rueckblick | 2 Min | 1-2 |
| Fortschritt seit M1 | 3 Min | 3-4 |
| Entwicklungsmethode & Guardrails | 4 Min | 5-7 |
| Technische Architektur | 4 Min | 8-10 |
| Datensouveraenitaet & Open Source | 3 Min | 11-12 |
| Sprint-Plan & Risiko | 3 Min | 13-14 |
| Closing | 2 Min | 15-16 |
| **Gesamt Praesentation** | **~20 Min** | |
| Q&A | 10 Min | |
| **Gesamt** | **~30 Min** | |

---

## Taktische Hinweise

### Fuer den Sysadmin im Raum
- Er kennt Claude Code. Das ist ein Vorteil -- er versteht die Technologie.
- NICHT verstecken, dass wir KI nutzen. Offensiv damit umgehen.
- Technische Tiefe anbieten: "Ich kann gerne im Detail auf die Architektur eingehen."
- Wenn er nach Sicherheit fragt: RLS, JWT, SSL, Dependabot, kein Custom-Crypto.
- Zeigen, dass wir WISSEN, was die Risiken sind, und sie adressiert haben.

### Koerpersprache & Rhetorik
- Prototyp-Demo auf dem eigenen Laptop vorbereiten (falls WLAN ausfaellt)
- Langsam sprechen bei Slide 11 (Datensouveraenitaet) -- das ist die Vertrauensfolie
- Bei "14 Verbesserungen in 13 Tagen" kurze Pause -- Zahl wirken lassen
- Abschluss-Satz auswendig lernen: "OmniPort gehoert Hildesheim -- nicht uns."

### Notfall-Strategien
- Vercel down? Localhost vorbereitet (`npm run dev`, Port 3001)
- Technische Detailfrage, die man nicht beantworten kann? "Das pruefe ich und liefere die Antwort innerhalb von 24 Stunden nach."
- Kritik an KI-Einsatz? Stripe-Case-Study + Guardrails-Slide. Dann: "Die Frage ist nicht ob, sondern wie verantwortungsvoll."
