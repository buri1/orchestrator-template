# FAHRPLAN FINAL -- 2. Vergaberunde OmniPort Hildesheim

**Datum:** 31.03.2026 | **Ort:** Stadt Hildesheim
**Gesamtdauer:** ca. 21-26 Min Praesentation + 10 Min Q&A
**URL:** https://omniport-hh.vercel.app
**Backup:** `cd ~/Desktop/code2/omniport-hh && npm run dev` (Port 3001)

---

## A. MINUTE-BY-MINUTE FAHRPLAN

### Part 1: Kollege + KI-Redepart (0:00 - 4:00)

| Zeit | Wer | Was passiert | Kernsatz | Bildschirm |
|------|-----|-------------|----------|------------|
| 0:00-2:30 | Kollege | Tech-Stack, DSGVO-Grundlagen, Datenhaltung Frankfurt | *(Kollege prasentiert)* | Folien des Kollegen |
| 2:30-2:40 | Kollege | Uebergabe an Burak | "Jetzt uebergibt mein Kollege Burak zum Thema KI-gestuetzte Entwicklung." | Folienuebergang |
| 2:40-3:00 | **Burak** | Uebernahme, Kontext setzen | **"Danke. Ich moechte offen darueber sprechen, wie wir arbeiten -- denn KI-gestuetzte Entwicklung ist kein Experiment mehr. Es ist Industriestandard."** | Titelfolie oder Uebergangsfolie |
| 3:00-3:20 | **Burak** | Deutsche Referenzen kompakt | "SAP in Walldorf berichtet von bis zu 12-facher Produktivitaet. Zalando hat 3.000 Entwickler mit KI-Tools ausgestattet und misst ueber 20% mehr Code-Output. Delivery Hero hat den Google DORA Award dafuer gewonnen." | Referenz-Folie (optional) |
| 3:20-3:30 | **Burak** | Jensen Huang Anker | "Jensen Huang sagte vor zwei Wochen: Jeder Ingenieur bekommt kuenftig die Haelfte seines Gehalts nochmal als KI-Budget obendrauf." | -- |
| 3:30-3:40 | **Burak** | opencode.de Pflicht | **"Und fuer uns besonders relevant: Software aus KfW-Smart-City-Foerderung MUSS auf opencode.de veroeffentlicht werden. Unsere Architektur ist dafuer gebaut."** | -- |
| 3:40-3:50 | **Burak** | Sicherheitsmechanismen (2 Saetze) | "Unsere Leitplanken: Sandbox-Isolation, menschliches Review bei jeder Zeile Code, automatisierte Tests. KI trifft keine Entscheidungen -- Menschen entscheiden." | -- |
| 3:50-4:00 | **Burak** | Ueberleitung Demo | **"Jetzt zeige ich euch, was dabei herauskommt. Drei Perspektiven auf eine Plattform."** | Browser oeffnen: omniport-hh.vercel.app |

---

### Part 2: Live-Demo -- Homepage + 3 Flows (4:00 - 17:30)

| Zeit | Wer | Was passiert | Kernsatz | Bildschirm |
|------|-----|-------------|----------|------------|
| 4:00-4:30 | **Burak** | Demo-Eroeffnung | "Nicht drei separate Tools. Drei Blickwinkel auf eine Architektur, die von Anfang an portaluebergreifend gedacht ist." | omniport-hh.vercel.app Startseite |
| **4:30-5:45** | **Burak** | **FLOW 0: Homepage Walkthrough** | *(Details siehe Abschnitt C.0)* | Homepage |
| 5:45-6:00 | **Burak** | Ueberleitung Flow 1 | "So viel zur Startseite. Jetzt zeige ich euch drei konkrete User Flows." | -- |
| **6:00-9:30** | **Burak** | **FLOW 1: Ehrenamtsmatching** | *(Details siehe Abschnitt C.1)* | HiEngagement Portal |
| 9:30-10:00 | **Burak** | Ueberleitung Karte | "Jan hat sich fuer ein Ehrenamt interessiert. Aber was passiert, wenn man hunderte solcher Interaktionen zusammendenkt? Die uebergeordnete Karte zeigt genau das." | -- |
| **10:00-12:30** | **Burak** | **FLOW 2: Karte** | *(Details siehe Abschnitt C.2)* | Uebergeordnete Karte |
| 12:30-13:00 | **Burak** | Ueberleitung Admin | "Jetzt wechseln wir die Perspektive. Was sieht die Wirtschaftsfoerderung? Alles, was wir gerade gezeigt haben, kommt hier zusammen -- in einem einzigen Cockpit." | -- |
| **13:00-17:00** | **Burak** | **FLOW 3: Admin Dashboard** | *(Details siehe Abschnitt C.3)* | Admin Dashboard |
| 17:00-17:30 | **Burak** | Demo-Abschluss / Help Score | **"Der Help Score misst: Wie lebendig ist Hildesheim? Jedes Portal liefert seinen Teil, das Dashboard liefert das Gesamtbild. OmniPort gehoert Hildesheim -- nicht uns."** | Help Score sichtbar |

---

### Part 3: Technische Architektur (17:30 - 21:30)

| Zeit | Wer | Was passiert | Kernsatz | Bildschirm |
|------|-----|-------------|----------|------------|
| 17:30-17:40 | **Burak** | Ueberleitung | "Kurz unter die Haube: Fuenf Designprinzipien, die langfristig Geld sparen." | Architektur-Folie (optional) |
| 17:40-18:40 | **Burak** | Modularitaet | **"Ueber 90 gemeinsam genutzte Komponenten. Sechstes Portal = Konfiguration, nicht Neuentwicklung."** | -- |
| 18:40-19:10 | **Burak** | API-Wrapper | "Auf der Karte habt ihr die orangen Punkte gesehen -- externe Daten erscheinen nativ. Der Nutzer merkt keinen Unterschied." | -- |
| 19:10-19:55 | **Burak** | Row-Level Security | "Zugriffsregeln sitzen in der Datenbank, nicht im Anwendungscode. Datenleck ausgeschlossen." | -- |
| 19:55-20:35 | **Burak** | BITV 2.0 / Barrierefreiheit | "Barrierefreiheit ist eingebaut, nicht nachgeruestet. WCAG-AA-Kontrast geprueft." | -- |
| 20:35-21:05 | **Burak** | Auth + BundID | "Dreistufig: Anonym, Registriert, BundID-verifiziert. Keine eigene Passwortverwaltung." | -- |
| 21:05-21:30 | **Burak** | Vendor-Lock-in = Null + Abschluss | **"Kein Vendor-Lock-in. KI-Moderation ist drin -- aber auf Open-Source-Modellen, eigener Infrastruktur. Sichere KI, offene KI, deutsche KI."** | -- |

---

### Q&A (21:30 - 31:30)

| Zeit | Wer | Was passiert | Bildschirm |
|------|-----|-------------|------------|
| 21:30-21:40 | **Burak** | "Vielen Dank. Ich freue mich auf eure Fragen." | Startseite oder Abschluss-Folie |
| 21:40-31:30 | **Burak** | Q&A -- Antworten aus Abschnitt F | Seiten je nach Frage zeigen |

---

## B. PART 1: KI-REDEPART (Vollstaendiges Skript)

### Uebernahme vom Kollegen

> Danke, [Name Kollege]. Ihr habt gerade die technische Grundlage und das DSGVO-Konzept gesehen. Ich moechte jetzt offen darueber sprechen, wie wir entwickeln -- denn das erklaert, warum wir in kurzer Zeit einen funktionalen Prototyp mit fuenf Portalen zeigen koennen.

### KI als Industriestandard

> **KI-gestuetzte Softwareentwicklung ist laengst Industriestandard in Deutschland.**
>
> SAP in Walldorf -- Deutschlands groesstes Technologieunternehmen, 40.000 Entwickler -- berichtet intern von 7- bis 12-facher Produktivitaet in manchen Teams durch KI-Agenten. Das ist nicht Silicon Valley. Das ist Baden-Wuerttemberg.
>
> Zalando in Berlin hat 3.000 Entwickler mit KI-Coding-Tools ausgestattet und misst offiziell ueber 20 Prozent mehr Code-Output -- in einer komplexen Produktionsumgebung, nicht in einem Experiment.
>
> Delivery Hero, ebenfalls Berlin, 4.000 Ingenieure, hat den Google DORA Award fuer KI-gestuetzte Entwicklung gewonnen. Die KI-Agenten dort pruefen 15.000 Code-Repositories automatisch auf Fehler.
>
> Siemens generiert mit dem Industrial Copilot SPS-Code per KI und rollt das zusammen mit thyssenkrupp weltweit aus. BMW hat mit JoyCode eine eigene KI-Entwicklungsplattform gebaut. VW nutzt KI im Codebeamer fuer 20 bis 40 Prozent Zeitersparnis bei Anforderungsspezifikationen.

### Jensen Huang Anker

> **Jensen Huang, CEO von NVIDIA -- dem wertvollsten Unternehmen der Welt -- hat vor zwei Wochen auf der GTC 2026 gesagt: Jeder Ingenieur bekommt kuenftig die Haelfte seines Gehalts nochmal als KI-Token-Budget obendrauf. NVIDIA plant, 2 Milliarden Dollar pro Jahr dafuer auszugeben. Wer keine KI nutzt, so Huang, arbeitet wie ein Chipdesigner mit Bleistift und Papier.**

### Deutsche Studie

> Eine aktuelle Studie unter deutschen Softwareentwicklern zeigt: 90 Prozent nutzen bereits KI-Tools. Die Bundesbank erwartet, dass 56 Prozent der deutschen Firmen bis 2026 Generative KI einsetzen. Das BSI hat zusammen mit der franzoesischen ANSSI offizielle Leitlinien fuer KI-Coding-Assistenten herausgegeben -- nicht um sie zu verbieten, sondern um den verantwortungsvollen Einsatz zu steuern.

### opencode.de (KfW-Pflicht)

> **Und fuer dieses Projekt besonders relevant: Software, die mit KfW-Smart-City-Foerderung entwickelt wird, MUSS auf opencode.de veroeffentlicht werden -- das ist Pflicht seit Oktober 2022.**
>
> opencode.de hat ueber 8.000 Nutzer und 3.000 Projekte. Es ist die zentrale Open-Source-Plattform der oeffentlichen Verwaltung. Unsere modulare Architektur -- Shared Components, kein Vendor-Lock-in, EUPL-kompatibel -- ist genau dafuer gebaut. Wenn Hildesheim OmniPort veroeffentlicht, steht die Loesung allen 11.000 deutschen Kommunen zur Nachnutzung bereit. Das ist das EfA-Prinzip: Einer fuer Alle.
>
> Wie Marvin euch vorhin gezeigt hat, ist opencode.de die zentrale Plattform dafuer. Ergaenzend dazu: Es gibt mittlerweile auch Open-Source-Alternativen fuer KI-Entwicklungswerkzeuge selbst -- wie zum Beispiel "Open Code" -- was zeigt, dass das gesamte Oekosystem auf Offenheit und Unabhaengigkeit von einzelnen Anbietern setzt. Kein Vendor-Lock-in, auch nicht beim Entwicklungswerkzeug.

### Sicherheitsmechanismen (max. 2 Saetze)

> Wie stellen wir Qualitaet sicher? **Sandbox-Isolation, menschliches Review bei jeder Code-Aenderung, automatisierte Tests, kein autonomes Deployment. KI trifft keine Entscheidungen -- Menschen entscheiden.** Stripe, der groesste Zahlungsdienstleister der Welt, arbeitet mit exakt denselben vier Mechanismen.

### Eigene Hardware / Open Source Closer

> Und noch ein wichtiger Punkt: Die Infrastruktur, die Marvin euch vorhin gezeigt hat -- darauf laufen unsere Open-Source-Modelle. Das fertige Produkt ist reines Web: HTML, CSS, JavaScript, PostgreSQL. Die KI-Moderation laeuft auf eigener Hardware mit offenen Modellen. **Falls die Stadt es vorzieht, die komplette KI-Infrastruktur selbst zu betreiben -- das ist jederzeit moeglich, ohne eine einzige Zeile am Produkt zu aendern.**

### Ueberleitung zur Demo

> **Jetzt zeige ich euch, was dabei herauskommt. Drei Perspektiven auf eine Plattform -- nicht drei Inselloesungen, sondern ein System, in dem jedes Teil die anderen staerker macht.**

### Vorbereitete Antworten fuer Unterbrechungen

**Falls "Welches KI-Tool nutzt ihr?" kommt:**
> "Wir nutzen KI-gestuetzte Entwicklungswerkzeuge, die dem aktuellen Industriestandard entsprechen -- vergleichbar mit dem, was SAP fuer seine Entwickler einsetzt. Entscheidend fuer euch ist nicht welches Werkzeug, sondern welche Sicherheitsmechanismen wir drumherum gebaut haben."

**Falls "Wird unser Code fuer KI-Training verwendet?" kommt:**
> "Nein. Wir nutzen Enterprise-Konfiguration, bei der Training explizit deaktiviert ist."

**Falls "Ist das nicht riskant?" kommt:**
> "SAP, Siemens und die Deutsche Telekom investieren gemeinsam eine Milliarde Euro in souveraene KI-Infrastruktur. Wenn diese drei Unternehmen KI-gestuetzte Entwicklung mit DSGVO-Konformitaet als Designprinzip betreiben, dann ist das auch fuer ein Smart-City-Projekt der richtige Ansatz. Das BSI gibt den Rahmen vor -- wir halten ihn ein."

---

## C. PART 2: DEMO FLOWS (3 Skripte)

### C.1 Flow 1: Ehrenamtsmatching (~3.5 Min)

**Konzepte die hier landen:** Shared Components, Modularitaet, Transparentes Scoring

| Schritt | URL / Aktion | Sprechtext |
|---------|-------------|-----------|
| 1 | omniport-hh.vercel.app -> HiEngagement Portal oeffnen | "Beginnen wir mit einer konkreten User Journey. Jemand ist neu in Hildesheim und will sich engagieren." |
| 2 | Auf "Ehrenamt finden" / Quiz starten klicken | "Drei kurze Fragen. Und hier seht ihr bereits etwas Wichtiges: **Dieser Quiz-Stepper ist kein Einzelstueck. Dieselbe Komponente wird in HiArbeit fuer Jobmatching eingesetzt -- einmal gebaut, ueberall nutzbar.**" |
| 3 | Frage 1 beantworten (Interessen auswaehlen) | "Der Nutzer waehlt seine Interessen. Einfache, klare Sprache. Barrierefrei -- Tastaturnavigation funktioniert." |
| 4 | Frage 2 beantworten (Stadtteil) | "Stadtteil-Praeferenz. Diese Daten fliessen anonymisiert ins Gesamtbild -- gleich sehen wir, wo das sichtbar wird." |
| 5 | Frage 3 beantworten (Engagement-Typ) | "Letzte Frage. Jetzt rechnet die Matching-Engine." |
| 6 | Ergebnis-Seite zeigen, auf Match-Score klicken | **"87 Prozent Match. Und das Entscheidende: Der Nutzer kann fragen 'Warum 87 Prozent?' und bekommt eine transparente Erklaerung. Dieselbe Matching-Engine, dieselbe Transparenz -- egal ob Ehrenamt oder Stellensuche."** |
| 7 | Kurz ein Ergebnis-Detail oeffnen | "Kontaktaufnahme direkt moeglich. Der Nutzer verliert seinen Kontext nie -- kein Seitenumbruch, kein Neuanfang." |

---

### C.2 Flow 2: Karte (~2.5-3 Min)

**Konzepte die hier landen:** Unified Data, Geographic Intelligence, API-Wrapper

**ACHTUNG: NICHT klicken auf Gruendung-, Quartiere-, Wissenstransfer-Filter (0 Ergebnisse in Seed-Daten)**

| Schritt | URL / Aktion | Sprechtext |
|---------|-------------|-----------|
| 1 | Zur uebergeordneten Karte navigieren | "Jan hat sich gerade fuer ein Ehrenamt im Nordviertel interessiert. Aber was passiert, wenn man diese einzelne Interaktion mit hunderten anderen zusammendenkt?" |
| 2 | Karte zeigen, Gesamtansicht | **"Eine Karte -- gespeist aus allen Portalen. Nicht fuenf separate Kartenansichten."** |
| 3 | Engagement-Layer aktivieren | "Jedes Portal liefert seine Datenpunkte. Hier sehen wir, wo in Hildesheim Engagement entsteht." |
| 4 | Arbeit-Layer umschalten | "Umschalten: Wo werden Jobs gesucht? Wo gibt es offene Stellen? **Ein neues Portal -- sagen wir ein sechstes fuer Kultur -- taucht automatisch als Layer auf. Keine Zusatzentwicklung.**" |
| 5 | Filter / Suche nutzen (NUR Engagement oder Arbeit) | "Dieselbe Such- und Filterlogik wie in der uebergeordneten Suche. Kein Zufall -- derselbe Baustein." |
| 6 | Auf einen Marker klicken | "Fuer die Stadtplanung: Ihr seht auf einen Blick, in welchen Quartieren was passiert. **Ueber unseren API-Wrapper erscheint jede externe Datenquelle -- HAZ-Jobportal, Bibliothekssystem -- hier genauso nativ.**" |

---

### C.3 Flow 3: Admin Dashboard (~3.5-4 Min)

**Konzepte die hier landen:** Help Score, KI-Moderation Ampelsystem, Stadtteil-Heatmap, Trendbericht

| Schritt | URL / Aktion | Sprechtext |
|---------|-------------|-----------|
| 1 | Admin Dashboard oeffnen (/admin) | "Jetzt die Verwaltungsperspektive. Alles, was wir gerade gezeigt haben, kommt hier zusammen." |
| 2 | Stadtpuls / Help Score zeigen | **"Das ist kein einzelner KPI -- das ist ein Komposit-Score aus allen fuenf Portalen. Engagement, Wirtschaft, Gruendung, Quartiersentwicklung, Wissenstransfer. Help Score: 74 -- 'Gut'."** |
| 3 | Portal-KPI-Kacheln zeigen | "Jedes Portal hat eigene Metriken, aber sie folgen demselben Schema. **Neues Portal hinzufuegen? Erscheint automatisch. Entfernen? Der Rest funktioniert weiter.**" |
| 4 | Stadtteil-Heatmap oeffnen | "Geografische Verteilung der Aktivitaet. Wo in Hildesheim passiert was? Welche Quartiere brauchen Aufmerksamkeit?" |
| 5 | Moderation oeffnen | **"Ein Moderationsteam fuer alle Portale. KI-gestuetzte Vorpruefung: Gruen, Gelb, Rot. Bulk-Approve fuer alle gruenen Eintraege mit einem Klick. Je laenger das System laeuft, desto besser wird die Vorpruefung -- desto weniger manuelle Arbeit fuer die Stadt."** |
| 6 | Trendbericht oeffnen | "Der Trendbericht -- als A4 druckbar. Fuer den Ausschuss, fuer die Berichterstattung an den Bund, fuer die KfW-Dokumentation. **Portaluebergreifend, automatisch generiert.**" |
| 7 | Zurueck zur Dashboard-Uebersicht | "Das ist das Cockpit der Wirtschaftsfoerderung. Nicht fuenf separate Tools -- ein System." |

---

## D. PART 3: ARCHITEKTUR (Vollstaendiges Skript)

### Ueberleitung (10 Sek.)

> Ich moechte euch jetzt kurz zeigen, was unter der Haube steckt -- also die Architektur, die das moeglich macht, was ihr gerade gesehen habt. Sechs Punkte, jeder davon ein Designprinzip, das langfristig Geld spart.

### 1. Modularitaet: Baukastensystem (60 Sek.)

> **Unsere Architektur ist ein Baukastensystem.**
>
> Ihr habt gerade fuenf Portale gesehen. Aber unter der Haube ist das EINE Anwendung. Eine Navigation. Eine Suchfunktion. Eine Matching-Engine. Eine Karte.
>
> Konkret: Es gibt ueber 90 gemeinsam genutzte Komponenten. Die Matching-Engine, die in HiEngagement passende Ehrenamts-Angebote findet, ist exakt dieselbe Engine, die in HiArbeit Talente mit Stellen abgleicht. Derselbe Algorithmus, dieselben erklaerbaren Match-Cards -- angepasst per Konfiguration, nicht per Copy-Paste.
>
> Ihr habt die farbigen Kreise gesehen -- Orange fuer Wirtschaft, Gruen fuer Engagement, Teal fuer Quartiere. Das ist ein einziges Farbsystem mit Portal-Tokens. In der CSS-Datei stehen sechs Zeilen pro Portal.
>
> **Was heisst das praktisch? Wenn die Stadt ein sechstes Portal braucht -- zum Beispiel Gesundheit -- dann ist das Konfiguration, nicht Neuentwicklung.** Sechs Zeilen Farbdefinition, ein Eintrag in der Portal-Registry, und alle bestehenden Komponenten funktionieren sofort. Und umgekehrt: Wenn ein Portal wegfaellt, aendert sich fuer die anderen nichts.

### 2. API-Wrapper fuer externe Systeme (30 Sek.)

> Auf der Karte habt ihr die orangen Punkte gesehen -- das sind Stellenangebote, teilweise aus externen Quellen wie dem HAZ-Jobportal oder der Bundesagentur fuer Arbeit. Unser API-Wrapper uebersetzt deren Datenformat, sodass alles einheitlich auf der Karte und in der Suche erscheint. **Der Nutzer merkt keinen Unterschied.** Wenn morgen eine neue externe Quelle dazukommt -- ein Wrapper, null UI-Aenderungen.

### 3. Row-Level Security (45 Sek.)

> Zum Datenschutz -- und das mache ich bewusst technisch.
>
> Wir setzen Row-Level Security ein. Die Zugriffsregeln sitzen nicht im Anwendungscode, sondern direkt in der Datenbank. PostgreSQL prueft bei JEDER Abfrage, ob der anfragende Nutzer diese Zeile sehen oder aendern darf.
>
> Warum ist das besser? Bei den meisten Plattformen schreibt der Entwickler IF-Abfragen: "Wenn Nutzer X, dann zeige Y." Wenn jemand eine Abfrage vergisst -- Datenleck. **Bei Row-Level Security kann das nicht passieren. Die Datenbank ist die letzte Verteidigungslinie.**
>
> Das ist kein Experiment -- PostgreSQL, Supabase und jede grosse Bankenanwendung nutzen dieses Muster.

### 4. Barrierefreiheit: BITV 2.0 (40 Sek.)

> Barrierefreiheit ist bei uns kein Nachgedanke -- es ist in die Architektur eingebaut. Wir nutzen shadcn/ui und Radix UI. Jedes Eingabefeld, jeder Dialog, jede Navigation kommt mit eingebauter Tastatursteuerung, ARIA-Labels und Screenreader-Unterstuetzung.
>
> Die Portalfarben sind auf WCAG-AA-Kontrastverhaeltnis geprueft: mindestens 4,5 zu 1 fuer Fliesstext. **Und wir nutzen Farbe niemals allein als Informationstraeger** -- immer zusammen mit Text oder Icons.

### 5. Authentifizierung und BundID (30 Sek.)

> Dreistufiges Modell. Anonym browsen -- ohne Konto. Registriert -- fuer Aktionen wie Bewerben. BundID-verifiziert -- fuer Dienste, wo Identitaet rechtlich relevant ist.
>
> Keine eigenen Passwoerter. OAuth-Standards. BundID als foederierter Identitaetsanbieter. Das Soft-Gate-Muster -- dieses dezente Overlay bei "Anmeldung erforderlich" -- ist bewusstes UX-Design. Der Nutzer verliert seinen Kontext nie.

### 6. Vendor-Lock-in: Null (30 Sek.)

> **Letzter Punkt, und der ist mir persoenlich wichtig: Kein Vendor-Lock-in. Auf keiner Ebene.**
>
> Next.js -- meistgenutztes Web-Framework weltweit. PostgreSQL -- meistverbreitete Open-Source-Datenbank. TypeScript. React. Jeder React-Entwickler auf dem Markt kann diesen Code lesen. Supabase ist Open Source und self-hostable.
>
> Aber das heisst nicht, dass keine KI drin ist. Im Gegenteil -- die KI-Moderation, die ihr gerade gesehen habt, ist bewusst eingebaut. Sie soll langfristig immer autonomer werden und euch Personalkosten sparen. Der entscheidende Punkt: Wir setzen auf Open-Source-Modelle und eigene Infrastruktur. Wie Marvin euch vorhin gezeigt hat, bauen wir gerade unsere eigene KI-Hardware auf -- mit DSGVO-konformen, offenen Modellen innerhalb des EU AI Act, Kategorie minimales Risiko.
>
> **Das heisst: Die KI-Modelle sind austauschbar, die Daten bleiben bei euch, und ihr seid von keinem Anbieter abhaengig. Weder beim Produkt noch bei der KI. Sichere KI, offene KI, deutsche KI.**

### Abschluss (10 Sek.)

> Das sind die sechs Prinzipien: Modulare Shared Components, API-Wrapper, Row-Level Security, BITV-2.0-Barrierefreiheit, foederierte Authentifizierung, null Vendor-Lock-in. **Jedes davon spart der Stadt langfristig Geld und gibt ihr die Kontrolle ueber ihre eigene Plattform.**

---

## E. KEY NUMBERS CHEAT SHEET (Quick Reference Card)

### OmniPort Architektur

| Metrik | Wert |
|--------|------|
| Shared Components | ueber 90 gemeinsam genutzte Bausteine |
| Portal-spezifische Komponenten | ca. 12 |
| Verhaeltnis shared:spezifisch | ca. 18:1 |
| Neues Portal anlegen | 6 Zeilen CSS + 1 Registry-Eintrag |
| Help Score (aktuell) | 74 "Gut" |
| KI-Moderation | Open-Source-Modelle, eigene Infrastruktur, DSGVO-konform |

### Deutsche Unternehmen

| Unternehmen | Stadt | Kennzahl |
|-------------|-------|----------|
| SAP | Walldorf | 7-12x Produktivitaet, 40.000 Devs, 35% avg. Gain, 30% Kostenreduktion |
| Zalando | Berlin | 3.000 Devs, >20% mehr Code-Output |
| Delivery Hero | Berlin | 4.000 Engineers, 15.000 Repos, DORA Award |
| Siemens | Muenchen | Industrial Copilot, 120.000 TIA-Portal-User, thyssenkrupp-Rollout |
| BMW | Muenchen | JoyCode-Plattform, 500 Mio. Zeilen Code, 10.000 IT-Experten |
| VW | Wolfsburg | 20-40% Zeitersparnis Anforderungsmanagement |
| Deutsche Telekom | Bonn | ChatGPT Enterprise company-wide, EUR 1,2 Mrd. KI-Cloud mit NVIDIA |
| Bosch | Stuttgart | $2,7 Mrd. KI-Investition, 65.000 Geschulte |
| Allianz | Muenchen | AllianzGPT, 60.000+ aktive Nutzer |

### Industriezahlen

| Metrik | Wert |
|--------|------|
| DE Devs mit KI-Tools | 90% (ChatGPT), 55% (GitHub Copilot) |
| DE Firmen mit GenAI (2026) | 56% (Bundesbank-Umfrage) |
| Google AI-generierter Code | >30% |
| SAP Backlog-Luecke | 40.000 Devs, Bedarf fuer 200.000 |

### Stripe Referenz

| Metrik | Wert |
|--------|------|
| Zahlungsvolumen | >$1 Billion/Jahr |
| Mechanismen | 4: Sandbox, Berechtigungen, Human Review, Auto-Begrenzung |
| Agenten-Limit | Max. 2 Versuche, dann Mensch |

### opencode.de

| Metrik | Wert |
|--------|------|
| Registrierte Nutzer | 8.000+ |
| Projekte | 3.000+ |
| Wachstum | ca. 200 neue Projekte/Monat |
| KfW-Pflicht | seit Oktober 2022 |
| Hildesheim-Foerderung | EUR 17,5 Mio. (15,75 Bund + 1,75 Eigenanteil) |
| EfA-Reichweite | 11.000 deutsche Kommunen |

### Jensen Huang / NVIDIA

| Metrik | Wert |
|--------|------|
| Token-Budget pro Ingenieur | 50% des Gehalts obendrauf |
| NVIDIA Token-Ausgaben/Jahr | ca. $2 Mrd. |
| Zitat-Datum | GTC 2026, 17. Maerz 2026 |

### Deutschland-Stack (SAP + Telekom + Siemens)

| Metrik | Wert |
|--------|------|
| Investition | EUR 1 Mrd. |
| GPUs | ca. 10.000 NVIDIA Blackwell |
| Rechenleistung | bis 0,5 ExaFLOPS |
| Standort | Muenchen (Tucherpark) |
| DE KI-Kapazitaet | +50% |

---

## F. Q&A ARSENAL (Top 10 + Bonus)

### Sicherheit & KI

**F1: "Wie stellt ihr sicher, dass KI-generierter Code sicher ist?"**
> "Drei Ebenen. Erstens: Die KI-Werkzeuge sehen niemals Produktionsdaten. Zweitens: Jeder Code durchlaeuft menschliches Review, automatisierte Tests und Typ-Pruefung. Drittens: Der Code ist Open Source -- ihr koennt ihn jederzeit auditieren lassen. Das BSI hat offizielle Leitlinien dafuer veroeffentlicht -- wir halten sie ein."

**F2: "Wird unser Code fuer KI-Training verwendet?"**
> "Nein. Enterprise-Konfiguration mit deaktiviertem Training. Fuer die Produktionsphase empfehlen wir Enterprise-Plan mit vertraglichem Ausschluss und Auftragsverarbeitungsvertrag."

**F3: "Welches KI-Tool genau?"**
> "Industriestandard-Werkzeuge mit Enterprise-Konfiguration. Entscheidend sind die Sicherheitsmechanismen: Sandbox-Isolation, menschliches Review, automatisierte Tests, kein Zugriff auf Produktionsdaten. Das sind die Leitplanken, die zaehlen -- vergleichbar mit dem, was SAP fuer 40.000 Entwickler einsetzt."

### DSGVO & Datenschutz

**F4: "Wo liegen die Daten?"**
> "Alle Produktionsdaten in Frankfurt. Deutsches Rechenzentrum. Daten verlassen Deutschland nicht. Supabase ist Open Source und self-hostable."

**F5: "Ist das DSGVO-konform?"**
> "Ja. DSGVO by Design von Tag 1. KI-Werkzeuge verarbeiten Code-Muster, keine personenbezogenen Daten. Row-Level-Security auf Datenbankebene. BundID fuer foederierte Authentifizierung."

### Zuverlaessigkeit & Team

**F6: "Was passiert, wenn die KI-Tools wegfallen?"**
> "Dann entwickeln wir klassisch weiter. Der Code ist normaler TypeScript/React-Code. Die Architektur, Tests, CI/CD-Pipeline -- alles voellig unabhaengig von KI."

**F7: "Wie gross ist euer Team?"**
> "Ein effizientes Team mit modernen Werkzeugen. Unser Prototyp mit fuenf Portalen zeigt, was wir leisten. Nach Zuschlag skalieren wir bei Bedarf."

**F8: "Aber die KI schreibt doch den Code!"**
> "Die KI erstellt einen Entwurf -- genau wie ein Taschenrechner eine Berechnung durchfuehrt. Der Buchhalter ist trotzdem verantwortlich fuer die Bilanz. OWASP empfiehlt: 'Behandle KI wie einen Junior-Entwickler, dessen Arbeit Senior-Review erfordert.' Genau das tun wir."

### Open Source & Kosten

**F9: "Vendor-Lock-in?"**
> "Null. PostgreSQL, Next.js, TypeScript, alles Standard. Wenn die Stadt in fuenf Jahren den Dienstleister wechselt, nimmt sie Code und Datenbank mit. Ueberall findet man React/TypeScript-Entwickler."

**F10: "Koennen andere Staedte das nutzen?"**
> "Ja. Explizites Designziel. Modulare Architektur plus Open-Source-Lizenz. Passt zum EfA-Prinzip, zu opencode.de, und zur KfW-Foerderverpflichtung. Die Stadt Hildesheim wird zum Vorreiter fuer 11.000 Kommunen."

---

### BONUS-Antworten

**F11: "Klarna hat KI eingesetzt und Hunderte Leute entlassen. Wollt ihr das auch?"**
> "Klarna ist genau die Warnung. Die haben KI als Ersatz fuer Menschen positioniert -- und die Qualitaet hat gelitten. Unser Ansatz ist das Gegenteil: **KI augmentiert, ersetzt nicht.** Das BSI sagt dasselbe. Der DORA State of DevOps Report 2025 zeigt: KI macht gute Teams besser, aber sie kann kein schlechtes Team retten. Wir nutzen KI, um mehr Features zu liefern -- nicht um weniger Menschen zu beschaeftigen."

**F12: "Habt ihr das schon mal gemacht? Referenzen?"**
> "Autarkis -- eine Solar-Plattform, die wir mit dieser Methodik gebaut haben. Gleicher Ansatz: KI-gestuetzte Entwicklung, modulare Architektur, Open Source, kein Vendor-Lock-in. Und fuer den breiteren Kontext: Thought2Action hat mit einem aehnlichen Multi-Agenten-Ansatz ein System fuer eine Bank deployed, das in Produktion laeuft."

**F13: "Wie geht ihr mit KI-Halluzinationen um?"**
> "Drei Schichten. TypeScript-Compiler faengt Typ-Fehler sofort. Automatisierte Tests pruefen Logik. Menschliches Review prueft Sinn und Kontext. Ausserdem: Strukturierte Spezifikationen mit exakten Komponentennamen und Dateipfaden reduzieren Halluzinationen drastisch."

**F14: "Warum Supabase?" (Sysadmin-Frage)**
> "Supabase IST ein PostgreSQL. REST-API und Auth-Schicht obendrauf. Volle Kontrolle: RLS, eigene Funktionen, SQL-Migrationen. Self-hosted-Option verfuegbar. Migration auf nacktes PostgreSQL jederzeit moeglich. Kein Lock-in."

**F15: "Ist der Code wartbar ohne KI?"**
> "Ja. Standard Next.js App Router Patterns, shadcn/ui, TypeScript-Interfaces. Am Code erkennt man nicht, ob KI beteiligt war -- und genau das ist der Punkt."

---

## G. NOTFALL-STRATEGIEN (Quick Reference)

| Situation | Sofort-Reaktion |
|-----------|----------------|
| **Vercel ist down** | Localhost vorbereitet: `cd ~/Desktop/code2/omniport-hh && npm run dev` (Port 3001). Umschalten: "Wir haben das lokal vorbereitet -- Moment." |
| **WLAN im Rathaus faellt aus** | Mobile Hotspot vom Handy. Demo auf Localhost. "Wir haben genau fuer diesen Fall vorgebaut." |
| **404 wird entdeckt** | "Das ist eingeplant im Sprint-Plan, Prioritaet P0. Die Architektur steht -- es ist ein Content-Thema, kein technisches Problem." |
| **"Welches Tool genau?"** | "Industriestandard-Werkzeuge mit Enterprise-Konfiguration. Entscheidend sind die Leitplanken: Sandbox, Human Review, Tests." |
| **"Nur ein Prototyp!"** | **"Genau -- und genau das ist der Punkt. Andere Bieter zeigen PowerPoints. Wir zeigen lauffaehigen Code."** |
| **Talentpool-Frage** | "Nach vertiefter Analyse der Leistungsbeschreibung wissen wir, dass Talentpool die Arbeitgeber-Perspektive ist. Redesign ist Sprint 2. Architektur steht -- es ist ein UI/UX-Umbau, kein technischer Neubau." |
| **Frage, die man nicht beantworten kann** | "Das pruefe ich und liefere die Antwort innerhalb von 24 Stunden." |
| **Sysadmin bohrt technisch nach** | "Gerne im Detail: RLS auf Supabase, JWT-Tokens, SSL/TLS, HSTS, Dependabot fuer Dependency-Scanning, kein Custom-Crypto." |

---

## H. VERMEIDEN

### URLs die 404 geben -- NIEMALS anklicken

- `/stellenmarkt`
- `/stadtherz`
- `/unternehmenslandschaft`
- `/profil`

### Karte-Filter die 0 Ergebnisse liefern

- Gruendung
- Quartiere
- Wissenstransfer

### NIEMALS sagen

- ~~Claude Code~~
- ~~Claude Max~~
- ~~Anthropic~~
- ~~"1 Entwickler"~~
- ~~"9 Tage"~~
- ~~"200 Commits"~~
- ~~Konkreter Tool-Name~~

### IMMER sagen

- **"KI-gestuetzte Entwicklungswerkzeuge"**
- **"Agentic Engineering"**
- **"Industriestandard"**
- **"Enterprise-Konfiguration"**
- **"Sandbox-Isolation, menschliches Review"**

---

## ALLERLETZTER SATZ (auswendig)

> **"OmniPort gehoert Hildesheim -- nicht uns."**

---

## I. QUELLENVERZEICHNIS

*Alle Behauptungen, Statistiken und Fallstudien in diesem Dokument mit Quellen-URLs.*

---

### 1. Deutsche Unternehmen

**SAP -- 7-12x Produktivitaet, Joule for Developers, MCP Server**
- SAP TechEd 2025: AI Innovation -- [https://news.sap.com/2025/11/business-ai-innovation-unveiled-at-sap-teched/](https://news.sap.com/2025/11/business-ai-innovation-unveiled-at-sap-teched/)
- SAP TechEd: Developers Drive Agentic AI Revolution -- [https://news.sap.com/2025/11/sap-teched-developers-drive-agentic-ai-revolution/](https://news.sap.com/2025/11/sap-teched-developers-drive-agentic-ai-revolution/)
- SAP 2026 Roadmap Joule for Developers -- [https://community.sap.com/t5/technology-blog-posts-by-sap/our-2026-roadmap-for-joule-for-developers-abap-ai-capabilities/ba-p/14360358](https://community.sap.com/t5/technology-blog-posts-by-sap/our-2026-roadmap-for-joule-for-developers-abap-ai-capabilities/ba-p/14360358)
- SAP News: Joule for Developers -- [https://news.sap.com/2025/03/joule-for-developers-ai-powered-capabilities/](https://news.sap.com/2025/03/joule-for-developers-ai-powered-capabilities/)
- SAP News: Joule + ABAP -- [https://news.sap.com/2025/07/joule-abap-transform-developer-experience/](https://news.sap.com/2025/07/joule-abap-transform-developer-experience/)
- Constellation Research: SAP Developer Tools -- [https://www.constellationr.com/blog-news/insights/sap-rolls-out-developer-tools-joule-ecosystem-connections](https://www.constellationr.com/blog-news/insights/sap-rolls-out-developer-tools-joule-ecosystem-connections)

**Deutsche Telekom -- ChatGPT Enterprise, KI-Cloud mit NVIDIA**
- OpenAI: Deutsche Telekom Collaboration -- [https://openai.com/index/deutsche-telekom-collaboration/](https://openai.com/index/deutsche-telekom-collaboration/)
- Deutsche Telekom: Business GPT -- [https://www.telekom.com/en/media/media-information/archive/business-gpt-trusted-partner-for-ai-1064318](https://www.telekom.com/en/media/media-information/archive/business-gpt-trusted-partner-for-ai-1064318)
- Deutsche Telekom: AI at DT -- [https://www.telekom.com/en/company/details/shape-take-make-ai-at-deutsche-telekom-1078506](https://www.telekom.com/en/company/details/shape-take-make-ai-at-deutsche-telekom-1078506)

**Siemens -- Industrial Copilot, thyssenkrupp-Rollout**
- Siemens Press: Industrial Copilot + thyssenkrupp -- [https://press.siemens.com/global/en/pressrelease/siemens-industrial-copilot-expanded-adopted-thyssenkrupp](https://press.siemens.com/global/en/pressrelease/siemens-industrial-copilot-expanded-adopted-thyssenkrupp)
- Siemens: Engineering Copilot TIA -- [https://www.siemens.com/en-us/products/tia-portal/engineering-copilot-tia-standard/](https://www.siemens.com/en-us/products/tia-portal/engineering-copilot-tia-standard/)

**Zalando -- 3.000 Devs, >20% mehr Code-Output**
- Zalando Full Year 2025 Results (Investor Report) -- [https://corporate.zalando.com/en/investor-relations/zalando-full-year-2025-results](https://corporate.zalando.com/en/investor-relations/zalando-full-year-2025-results)

**Delivery Hero -- 4.000 Engineers, DORA Award**
- Google Cloud Case Study: Delivery Hero -- [https://cloud.google.com/customers/delivery-hero-ai](https://cloud.google.com/customers/delivery-hero-ai)
- Delivery Hero Blog: DORA Award Story -- [https://deliveryhero.jobs/blog/from-pilot-to-prize-our-2025-dora-award-story/](https://deliveryhero.jobs/blog/from-pilot-to-prize-our-2025-dora-award-story/)

**BMW -- JoyCode, 10.000 IT-Experten**
- BMW Group IT and Software Hubs -- [https://www.bmwgroup.com/en/news/general/2025/it-and-software-hubs.html](https://www.bmwgroup.com/en/news/general/2025/it-and-software-hubs.html)

**VW -- Codebeamer Copilot, 20-40% Zeitersparnis**
- Microsoft Customer Story: Volkswagen -- [https://www.microsoft.com/en/customers/story/24120-volkswagen-microsoft-copilot](https://www.microsoft.com/en/customers/story/24120-volkswagen-microsoft-copilot)

---

### 2. Deutschland-Stack / Souveraene KI (EUR 1 Mrd. Investment)

- Deutsche Telekom: Industrial AI Cloud with NVIDIA -- [https://www.telekom.com/en/media/media-information/archive/launch-industrial-ai-cloud-with-nvidia-1098706](https://www.telekom.com/en/media/media-information/archive/launch-industrial-ai-cloud-with-nvidia-1098706)
- Euronews: Germany's first AI factory -- [https://www.euronews.com/next/2026/02/05/germany-unveils-its-first-ai-factory-in-boost-for-european-digital-sovereignty](https://www.euronews.com/next/2026/02/05/germany-unveils-its-first-ai-factory-in-boost-for-european-digital-sovereignty)
- NVIDIA Blog: Deutsche Telekom Launch -- [https://blogs.nvidia.com/blog/germany-industrial-ai-cloud-launch/](https://blogs.nvidia.com/blog/germany-industrial-ai-cloud-launch/)
- Deutsche Telekom: AI Factory Expansion -- [https://www.telekom.com/en/media/media-information/archive/ai-factory-deutsche-telekom-expands-its-german-ai-stack-1103010](https://www.telekom.com/en/media/media-information/archive/ai-factory-deutsche-telekom-expands-its-german-ai-stack-1103010)
- SAP News: Industrial AI Cloud + Sovereignty -- [https://news.sap.com/2025/11/industrial-ai-cloud-digital-sovereignty-europe-partnership-innovation/](https://news.sap.com/2025/11/industrial-ai-cloud-digital-sovereignty-europe-partnership-innovation/)

---

### 3. Jensen Huang / NVIDIA GTC 2026

- CNBC: Nvidia's Huang pitches AI tokens on top of salary -- [https://www.cnbc.com/2026/03/20/nvidia-ai-agents-tokens-human-workers-engineer-jobs-unemployment-jensen-huang.html](https://www.cnbc.com/2026/03/20/nvidia-ai-agents-tokens-human-workers-engineer-jobs-unemployment-jensen-huang.html)
- Fortune: Jensen Huang AI infrastructure buildout -- [https://fortune.com/2026/03/17/jensen-huang-ai-infrastructure-buildout-1-trillion-dollars/](https://fortune.com/2026/03/17/jensen-huang-ai-infrastructure-buildout-1-trillion-dollars/)
- Tom's Hardware: Huang token budget statement -- [https://www.tomshardware.com/tech-industry/artificial-intelligence/jensen-huang-says-nvidia-engineers-should-use-ai-tokens-worth-half-their-annual-salary-every-year-to-be-fully-productive-compares-not-using-ai-to-using-paper-and-pencil-for-designing-chips](https://www.tomshardware.com/tech-industry/artificial-intelligence/jensen-huang-says-nvidia-engineers-should-use-ai-tokens-worth-half-their-annual-salary-every-year-to-be-fully-productive-compares-not-using-ai-to-using-paper-and-pencil-for-designing-chips)

---

### 4. Stripe Minions

- Stripe Dev Blog: Minions Part 1 -- [https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents)
- Stripe Dev Blog: Minions Part 2 -- [https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents-part-2](https://stripe.dev/blog/minions-stripes-one-shot-end-to-end-coding-agents-part-2)
- InfoQ: Stripe Engineers Deploy Minions -- [https://www.infoq.com/news/2026/03/stripe-autonomous-coding-agents/](https://www.infoq.com/news/2026/03/stripe-autonomous-coding-agents/)
- ByteByteGo: How Stripe's Minions Ship 1,300 PRs a Week -- [https://blog.bytebytego.com/p/how-stripes-minions-ship-1300-prs](https://blog.bytebytego.com/p/how-stripes-minions-ship-1300-prs)
- Patrick Collison Interview (Retool) -- [https://retool.com/blog/stripe-ceo-ai-agents-and-the-future-of-software](https://retool.com/blog/stripe-ceo-ai-agents-and-the-future-of-software)
- Steve Kaliski: How Stripe built Minions (How I AI Podcast) -- [https://www.lennysnewsletter.com/p/how-stripe-built-minionsai-coding](https://www.lennysnewsletter.com/p/how-stripe-built-minionsai-coding)

---

### 5. BSI / EU AI Act

- BSI/ANSSI: AI Coding Assistants (PDF) -- [https://www.bsi.bund.de/SharedDocs/Downloads/EN/BSI/KI/ANSSI_BSI_AI_Coding_Assistants.pdf](https://www.bsi.bund.de/SharedDocs/Downloads/EN/BSI/KI/ANSSI_BSI_AI_Coding_Assistants.pdf)
- BSI Kriterienkatalog KI Bundesverwaltung -- [https://www.bsi.bund.de/DE/Service-Navi/Presse/Alle-Meldungen-News/Meldungen/Kriterienkatalog_KI_Bundesverwaltung_250624.html](https://www.bsi.bund.de/DE/Service-Navi/Presse/Alle-Meldungen-News/Meldungen/Kriterienkatalog_KI_Bundesverwaltung_250624.html)
- EU AI Act Portal -- [https://artificialintelligenceact.eu/](https://artificialintelligenceact.eu/)
- Linux Foundation: AI Act Explainer -- [https://linuxfoundation.eu/newsroom/ai-act-explainer](https://linuxfoundation.eu/newsroom/ai-act-explainer)

---

### 6. Industrie-Statistiken (Google 30%, DORA, CodeRabbit)

**Google >30% KI-generierter Code**
- Fortune: Over 25% of Google's code written by AI -- [https://fortune.com/2024/10/30/googles-code-ai-sundar-pichai/](https://fortune.com/2024/10/30/googles-code-ai-sundar-pichai/)
- Medium: Google CEO AI writes over 30% of code -- [https://medium.com/design-bootcamp/google-ceo-sundar-pichai-ai-writes-over-30-of-our-code-111eb360f272](https://medium.com/design-bootcamp/google-ceo-sundar-pichai-ai-writes-over-30-of-our-code-111eb360f272)

**DORA Report 2025 (Google)**
- DORA: State of AI-Assisted Software Development 2025 -- [https://dora.dev/research/2025/dora-report/](https://dora.dev/research/2025/dora-report/)
- InfoQ Summary: AI + DORA Report -- [https://www.infoq.com/news/2026/03/ai-dora-report/](https://www.infoq.com/news/2026/03/ai-dora-report/)

**CodeRabbit -- KI-Code hat 1.7x mehr Fehler**
- CodeRabbit: State of AI vs Human Code Generation Report -- [https://www.coderabbit.ai/blog/state-of-ai-vs-human-code-generation-report](https://www.coderabbit.ai/blog/state-of-ai-vs-human-code-generation-report)
- CodeRabbit: 2025 Was Speed, 2026 Will Be Quality -- [https://www.coderabbit.ai/blog/2025-was-the-year-of-ai-speed-2026-will-be-the-year-of-ai-quality](https://www.coderabbit.ai/blog/2025-was-the-year-of-ai-speed-2026-will-be-the-year-of-ai-quality)

**Allgemeine Marktdaten**
- AI Coding Statistics 2026 (Panto) -- [https://www.getpanto.ai/blog/ai-coding-assistant-statistics](https://www.getpanto.ai/blog/ai-coding-assistant-statistics)
- GitHub Copilot Statistics 2026 (Panto) -- [https://www.getpanto.ai/blog/github-copilot-statistics](https://www.getpanto.ai/blog/github-copilot-statistics)
- Developer Productivity Statistics with AI Tools 2026 (Index.dev) -- [https://www.index.dev/blog/developer-productivity-statistics-with-ai-tools](https://www.index.dev/blog/developer-productivity-statistics-with-ai-tools)
- Gartner: 40% of Enterprise Apps with AI Agents by 2026 -- [https://www.gartner.com/en/newsroom/press-releases/2025-08-26-gartner-predicts-40-percent-of-enterprise-apps-will-feature-task-specific-ai-agents-by-2026-up-from-less-than-5-percent-in-2025](https://www.gartner.com/en/newsroom/press-releases/2025-08-26-gartner-predicts-40-percent-of-enterprise-apps-will-feature-task-specific-ai-agents-by-2026-up-from-less-than-5-percent-in-2025)

---

### 7. opencode.de

- openCode.de -- About -- [https://opencode.de/en/about-opencode](https://opencode.de/en/about-opencode)
- ZenDiS -- Official Website -- [https://www.zendis.de/en](https://www.zendis.de/en)
- BSI und ZenDiS: More security for openCode (Heise) -- [https://www.heise.de/en/news/BSI-and-ZenDiS-More-security-for-digital-infrastructures-with-openCode-10351578.html](https://www.heise.de/en/news/BSI-and-ZenDiS-More-security-for-digital-infrastructures-with-openCode-10351578.html)
- Smart City Dialog: Open Source Regelungen -- [https://www.smart-city-dialog.de/regelungen-zu-open-source-fuer-modellprojekte-smart-cities](https://www.smart-city-dialog.de/regelungen-zu-open-source-fuer-modellprojekte-smart-cities)
- Connected Urban Twins -- [https://www.connectedurbantwins.de/en/the-project/](https://www.connectedurbantwins.de/en/the-project/)
- EfA-Prinzip -- [https://www.digitale-verwaltung.de/Webs/DV/DE/onlinezugangsgesetz/efa/efa-node.html](https://www.digitale-verwaltung.de/Webs/DV/DE/onlinezugangsgesetz/efa/efa-node.html)

---

### 8. Deutsche Studie KI-Adoption

- arXiv: Adoption of GenAI in German Software Engineering (Jan 2026) -- [https://arxiv.org/html/2601.16700v1](https://arxiv.org/html/2601.16700v1)
- CEPR: Generative AI in German Firms (Bundesbank-Umfrage) -- [https://cepr.org/voxeu/columns/generative-ai-german-firms-diffusion-costs-and-expected-economic-effects](https://cepr.org/voxeu/columns/generative-ai-german-firms-diffusion-costs-and-expected-economic-effects)
- KPMG: GenAI in German Economy 2025 -- [https://kpmg.com/de/en/home/insights/2025/04/study-generative-ai-in-the-german-economy-in-2025.html](https://kpmg.com/de/en/home/insights/2025/04/study-generative-ai-in-the-german-economy-in-2025.html)
