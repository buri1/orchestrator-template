# MAYTT Content Engine -- UX Design Document

**Datum:** 2026-04-05
**Version:** 1.0
**Erstellt von:** BMAD UX Designer Agent
**Basierend auf:** Product Brief v1.0, PRD v1.0, UX Research (8 AI-Apps), Research-Report (10 Agents)
**Primaerer Nutzer:** Ali (Non-Technical Content-Operator)
**Status:** Draft

---

## Inhaltsverzeichnis

1. [Design Principles](#1-design-principles)
2. [Information Architecture](#2-information-architecture)
3. [Page Designs](#3-page-designs)
4. [Key Interaction Patterns](#4-key-interaction-patterns)
5. [Component Library Plan](#5-component-library-plan)
6. [User Flows](#6-user-flows)
7. [UX Inspirationen](#7-ux-inspirationen)
8. [Edge Cases & Empty States](#8-edge-cases--empty-states)

---

## 1. Design Principles

### 1.1 Desktop-First mit Mobile-Dashboard

**Entscheidung: Desktop-First.**

**Begruendung:**
- Ali arbeitet primaer am Desktop (aus Product Brief: "Desktop = primaere Nutzung")
- Video-Preview im 9:16-Format braucht vertikalen Platz -- auf Mobile waere der Player winzig
- Kombinations-Generator mit Multi-Select (Influencer x Produkt x Overlay) braucht Bildschirmflaeche
- Drag & Drop im Content Calendar funktioniert nur mit Maus/Trackpad zuverlaessig
- Side-by-Side AI-Modell-Vergleich braucht horizontale Breite

**Ausnahme Mobile:** Das Performance-Dashboard (Metriken, Account-Status, CPL-Monitoring) wird responsive optimiert. Ali checkt Metriken unterwegs auf dem Handy -- das muss funktionieren.

### 1.2 Design Language

**Basis: shadcn/ui + Tailwind CSS**

| Eigenschaft | Wert | Begruendung |
|-------------|------|-------------|
| **Farbschema** | Light Mode (Standard), Dark Mode (P2) | Ali ist kein Developer -- helle UIs sind ihm vertrauter |
| **Primaerfarbe** | Violet/Purple (shadcn Default) oder eigene Brand-Farbe | Hebt sich von TikTok (schwarz/rot) und Instagram (Gradient) ab |
| **Typographie** | Inter (shadcn Default) | Hervorragende Lesbarkeit, auch bei kleinen Schriftgroessen |
| **Border Radius** | `0.5rem` (Standard shadcn) | Modern, freundlich, nicht zu rund |
| **Spacing** | 4px-Raster (Tailwind Default) | Konsistent, sauber |
| **Schatten** | Minimal (shadow-sm fuer Cards, shadow-md fuer Modals) | Saubere Hierarchie ohne visuelles Rauschen |
| **Icons** | Lucide Icons (shadcn-Mitlieferung) | Konsistent, umfangreich, gut lesbar |
| **Animationen** | Subtil (Framer Motion fuer Page-Transitions, skeleton fuer Loading) | Ali soll nicht auf Animationen warten -- Performance vor Aesthetik |

**Farbsemantik:**

| Farbe | Bedeutung |
|-------|-----------|
| Gruen (`--success`) | Erfolg: Video gerendert, Post veroeffentlicht, Verbindung aktiv |
| Gelb (`--warning`) | Warnung: CPL fast erreicht, Token laeuft bald ab |
| Rot (`--destructive`) | Fehler: Render fehlgeschlagen, Upload gescheitert, Account-Problem |
| Blau (`--info`) | Information: Neue Metriken, System-Updates |
| Grau (`--muted`) | Inaktiv: Deaktivierte Assets, archivierte Videos |

### 1.3 Accessibility Requirements

| Anforderung | Umsetzung |
|-------------|-----------|
| Kontrast | WCAG AA Minimum (4.5:1 fuer Text, 3:1 fuer grosse Texte) |
| Tastatur-Navigation | Alle interaktiven Elemente per Tab erreichbar |
| Screen Reader | aria-labels auf allen Buttons und Icons |
| Schriftgroesse | Minimum 14px fuer Body-Text, 12px nur fuer Labels |
| Farbblindheit | Nie nur Farbe als Informationstraeger -- immer Icons/Text dazu |
| Loading-Feedback | Spinner + Text ("Video wird gerendert...") statt nur visueller Indikator |

### 1.4 Core UX Principles fuer Ali

#### Prinzip 1: "Sieht aus wie eine App, nicht wie eine Datenbank"

Airtable-Trauma vermeiden. Ali soll NIE das Gefuehl haben, in einer Tabelle zu arbeiten. Stattdessen:
- **Cards statt Zeilen** fuer Assets, Videos, Posts
- **Visuelle Vorschaubilder** ueberall (Thumbnails, Video-Player)
- **Formulare statt Filter** fuer Erstellung
- **Drag & Drop** statt ID-Eingabe

#### Prinzip 2: "Zeig mir was passiert, bevor es passiert"

- Kombinations-Generator: "Du erstellst 340 neue Videos" (mit Kosten-Schaetzung)
- Render-Button: "~45 Sekunden, kostet ca. $0.02"
- AI Generation: "~5 Sekunden, kostet ca. $0.03"
- Publishing: "Wird auf @GenMedia gepostet um 14:00"

#### Prinzip 3: "Ein Klick weniger ist immer besser"

- Quick Actions auf jeder Card (Rendern, Posten, Preview)
- Batch-Operationen fuer alles (alle rendern, alle posten, alle archivieren)
- Keyboard-Shortcuts fuer Power-User (Burak) -- aber unsichtbar fuer Ali

#### Prinzip 4: "Wenn etwas schief geht, sag mir was ich tun soll"

- Nie technische Fehlermeldungen: "Error 500" wird zu "Beim Rendern ist etwas schiefgelaufen. Klick auf 'Nochmal versuchen' oder kontaktiere Burak."
- Jeder Fehler-State hat einen Action-Button ("Nochmal versuchen", "Account neu verbinden", "Burak kontaktieren")

#### Prinzip 5: "Ich muss nichts lernen -- es erklaert sich selbst"

- Inline-Hilfe statt Dokumentation
- Tooltips auf nicht-offensichtlichen Buttons
- Leere Zustaende mit konkreter Handlungsanweisung ("Noch keine Videos -- klicke hier um dein erstes zu erstellen")
- Neue Features mit kurzer Einblendung erklaeren (kein 10-Step-Onboarding-Wizard)

---

## 2. Information Architecture

### 2.1 Navigationsstruktur

**Entscheidung: Linke Sidebar (collapsible) + Top-Bar**

**Begruendung:**
- Sidebar ist Standard in SaaS-Tools (Ali kennt das von Google Drive)
- Bietet Platz fuer 6-8 Hauptnavigationspunkte mit Icons + Labels
- Kann auf schmalen Screens eingeklappt werden (nur Icons)
- Top-Bar fuer: Suchfunktion, Notifications, User-Menu

**NICHT gewaehlt:**
- Top-Nav: Zu wenig Platz fuer alle Sektionen
- Tab-Bar (Bottom): Ist ein Mobile-Pattern, nicht Desktop
- Mega-Menu: Zu komplex fuer 2-Personen-Team

### 2.2 Sitemap

```
MAYTT Content Engine
|
|-- Dashboard (Home)
|   |-- Uebersicht-Karten (Videos, Posts, Performance)
|   |-- Quick Actions
|   |-- Letzte Aktivitaeten
|   |-- CPL-Status (Ampel-Widget)
|
|-- Video-Pipeline
|   |-- Alle Videos (Kartenansicht mit Status-Filter)
|   |-- Neues Video erstellen (Template + Preview)
|   |-- Batch-Generator (Kombinations-Formular)
|   |-- Render-Queue (aktive Render-Jobs)
|
|-- Social Media
|   |-- Accounts (Verbundene Plattformen)
|   |-- Content Calendar (Woche/Monat)
|   |-- Performance (Metriken pro Account/Video)
|   |-- Post erstellen (Plattform + Video + Caption)
|
|-- AI Studio
|   |-- Erkunden (Explore Mode -- einzelnes Modell)
|   |-- Vergleichen (Compare Mode -- Multi-Modell)
|   |-- Benchmark (Test-Suites -- nur fuer Burak)
|   |-- Galerie (alle Generierungen, Suche, Favoriten)
|
|-- Assets
|   |-- Influencer-Clips (Kartenansicht)
|   |-- Produkt-Clips (Kartenansicht)
|   |-- Overlays (Kartenansicht)
|   |-- Produkt-Katalog (Tabelle/Karten)
|
|-- Einstellungen
|   |-- Mein Profil
|   |-- Verbundene Accounts (Social Media)
|   |-- Team (Einladungen)
|   |-- System (nur Burak: API-Keys, Rendering-Config)
```

### 2.3 Sidebar-Navigation (konkret)

```
+----------------------------------------+
|  [MAYTT Logo]           [_] (collapse) |
|----------------------------------------|
|                                        |
|  [Home-Icon]     Dashboard             |
|                                        |
|  [Video-Icon]    Video-Pipeline        |
|                                        |
|  [Share-Icon]    Social Media          |
|                                        |
|  [Sparkle-Icon]  AI Studio             |
|                                        |
|  [Folder-Icon]   Assets                |
|                                        |
|  ---  (Separator)  ---                 |
|                                        |
|  [Settings-Icon] Einstellungen         |
|                                        |
+----------------------------------------+
|  [Ali-Avatar]  Ali                     |
|  Content-Operator                      |
+----------------------------------------+
```

**Aktiver State:** Hintergrundfaerbung + farbige linke Linie (Accent-Color), Icon wird gefuellt statt outlined.

**Sub-Navigation:** Tabs innerhalb der Seite (nicht verschachtelte Sidebar). Beispiel: Video-Pipeline hat Tabs "Alle Videos | Neu erstellen | Batch | Render-Queue".

### 2.4 Top-Bar

```
+------------------------------------------------------------------+
|  [Hamburger (Mobile)]  [Suche...]          [Bell] [User-Avatar]  |
+------------------------------------------------------------------+
```

- **Suche:** Globale Suche ueber Videos, Assets, Generierungen. Oeffnet Command-Palette (Cmd+K).
- **Bell:** Notification-Center (neue Renders fertig, Posts veroeffentlicht, Fehler).
- **User-Avatar:** Dropdown mit "Profil", "Einstellungen", "Abmelden".

---

## 3. Page Designs

### 3.1 Dashboard (Home)

**Was sieht Ali wenn er die App oeffnet?**

Das Dashboard ist Alis Startpunkt. Es beantwortet sofort drei Fragen:
1. "Was lief heute/diese Woche?" (Metriken)
2. "Was muss ich als naechstes tun?" (Quick Actions)
3. "Gibt es Probleme?" (Fehler, Warnungen)

#### Layout (von oben nach unten):

```
+------------------------------------------------------------------+
|  Guten Morgen, Ali                          Heute: 5. April 2026 |
+------------------------------------------------------------------+
|                                                                    |
|  +----------------+  +----------------+  +----------------+        |
|  | 1.132          |  | 847            |  | 23             |        |
|  | Videos gesamt  |  | Veroeffentlicht|  | Geplant        |        |
|  | +42 diese Wo.  |  | +15 heute      |  | naechste 7 Tage|        |
|  +----------------+  +----------------+  +----------------+        |
|                                                                    |
|  +----------------+  +----------------+  +----------------+        |
|  | 54.200         |  | 3,2%           |  | $12.40         |        |
|  | Views gesamt   |  | Engagement     |  | Render-Kosten  |        |
|  | diese Woche    |  | Durchschnitt   |  | diesen Monat   |        |
|  +----------------+  +----------------+  +----------------+        |
|                                                                    |
|  Quick Actions                                                     |
|  +------------------+  +------------------+  +-----------------+   |
|  | [+] Neues Video  |  | [Upload] Posten  |  | [Sparkle] AI    |   |
|  |    erstellen     |  |    planen        |  |    generieren   |   |
|  +------------------+  +------------------+  +-----------------+   |
|                                                                    |
|  Letzte Aktivitaeten                               [Alle anzeigen]|
|  +--------------------------------------------------------------+ |
|  | [Gruen] Video "Redhead-Lidschatten-Hook3" gerendert  vor 5m  | |
|  | [Blau]  @GenMedia TikTok-Post veroeffentlicht        vor 12m | |
|  | [Rot]   Render fehlgeschlagen: "Shampoo-Overlay7"    vor 1h  | |
|  |         [Nochmal versuchen]                                   | |
|  | [Gelb]  CPL-Warnung: @GenMedia2 hat 4/5 Shop-Videos  vor 2h  | |
|  +--------------------------------------------------------------+ |
|                                                                    |
|  Account-Status (CPL)                                              |
|  +---------------+  +---------------+  +---------------+          |
|  | @GenMedia     |  | @GenMedia2    |  | @GenMedia3    |          |
|  | [TikTok-Icon] |  | [TikTok-Icon] |  | [TikTok-Icon] |          |
|  | 2/5 Shop-Vids |  | 4/5 Shop-Vids |  | 0/5 Shop-Vids |          |
|  | [Gruen]       |  | [Gelb]        |  | [Gruen]       |          |
|  +---------------+  +---------------+  +---------------+          |
|                                                                    |
+------------------------------------------------------------------+
```

#### Metriken-Cards:
- Grosse Zahl oben (48px, font-bold)
- Label darunter (14px, muted)
- Delta-Angabe darunter (12px, gruen/rot mit Pfeil)
- Card hat hover-Effekt: Klick fuehrt zur Detail-Seite

#### Quick Actions:
- 3 grosse Buttons in einer Reihe
- Jeder mit Icon + Label
- Primaere Aktion ("Neues Video erstellen") hat Accent-Farbe

#### Letzte Aktivitaeten:
- Chronologische Liste, maximal 8 Eintraege
- Farbige Punkte (Semantik: gruen/blau/rot/gelb)
- Fehler-Eintraege haben einen Action-Button direkt in der Zeile
- "Alle anzeigen" Link fuehrt zum Notification-Center

#### CPL-Status-Widget:
- Card pro TikTok-Account
- Ampel-Farben: Gruen (0-2), Gelb (3-4), Rot (5 = Limit)
- Fortschrittsbalken (X von 5 gefuellt)
- Wird nur angezeigt, wenn TikTok-Accounts verbunden sind

---

### 3.2 Video-Pipeline

Die Video-Pipeline ist Alis Hauptarbeitsbereich. Hier erstellt, previewt, rendert und verwaltet er Videos.

#### 3.2.1 Tab: Alle Videos

**Ansicht: Kartenraster (nicht Tabelle!)**

```
+------------------------------------------------------------------+
|  Video-Pipeline                                                    |
|  [Alle Videos] [Neu erstellen] [Batch-Generator] [Render-Queue]  |
+------------------------------------------------------------------+
|                                                                    |
|  Filter: [Alle Status v] [Alle Produkte v] [Alle Influencer v]   |
|  Sortierung: [Neueste zuerst v]          Suche: [............]   |
|                                                                    |
|  Status-Uebersicht:                                                |
|  [To Render: 340] [Rendering: 5] [Gerendert: 420] [Bereit: 180] |
|  [Geplant: 23]   [Publiziert: 847] [Archiviert: 112]            |
|                                                                    |
|  +------------------+  +------------------+  +------------------+ |
|  | [Thumbnail]      |  | [Thumbnail]      |  | [Thumbnail]      | |
|  | 9:16 Preview     |  | 9:16 Preview     |  | 9:16 Preview     | |
|  |                  |  |                  |  |                  | |
|  | Redhead x        |  | Redhead x        |  | Redhead x        | |
|  | Lidschatten x    |  | Shampoo x        |  | Mascara x        | |
|  | "Preisfehler"    |  | "OMG Angebot"    |  | "Preisfehler"    | |
|  |                  |  |                  |  |                  | |
|  | [Gruen: Bereit]  |  | [Blau: Geplant]  |  | [Grau: To Render]| |
|  |                  |  |                  |  |                  | |
|  | [Play] [Posten]  |  | [Play] [Details] |  | [Play] [Rendern] | |
|  +------------------+  +------------------+  +------------------+ |
|                                                                    |
|  [Weitere laden...]                                                |
+------------------------------------------------------------------+
```

**Video-Card Aufbau:**
1. **Thumbnail** (16:9 Vorschau, bei Hover: kurzer Autoplay)
2. **Kombinations-Info** (3 Zeilen: Influencer, Produkt, Overlay -- abgekuerzt)
3. **Status-Badge** (farbig, mit Text)
4. **Quick Actions** (2 Buttons: kontextabhaengig je nach Status)

**Status-spezifische Quick Actions:**

| Status | Button 1 | Button 2 |
|--------|----------|----------|
| To Render | Preview | Rendern |
| Rendering | Preview | Fortschritt |
| Gerendert | Preview | Als Bereit markieren |
| Bereit | Preview | Posten/Planen |
| Geplant | Preview | Details |
| Publiziert | Preview | Metriken |
| Archiviert | Preview | Wiederherstellen |

**Batch-Aktionen (Toolbar bei Multi-Select):**
- "Alle [gefilterten] rendern"
- "Alle [gefilterten] als bereit markieren"
- "Alle [gefilterten] archivieren"
- Multi-Select via Checkbox auf jeder Card oder Shift+Klick

#### 3.2.2 Tab: Neues Video erstellen

**Zwei-Spalten-Layout: Formular links, Remotion Player rechts**

```
+----------------------------+  +--------------------------------+
|  Neues Video erstellen     |  |                                |
|                            |  |     [Remotion Player]          |
|  1. Influencer-Clip        |  |                                |
|  [Dropdown mit Thumbnails] |  |     9:16 Video-Preview         |
|  > Redhead - Schlafzimmer  |  |     Live-aktualisiert          |
|                            |  |                                |
|  2. Produkt-Clip           |  |     [Play/Pause] [Scrubber]    |
|  [Dropdown mit Thumbnails] |  |     [Ton an/aus] [Vollbild]    |
|  > Lidschatten Gold - Swipe|  |                                |
|                            |  |                                |
|  3. Overlay                |  |                                |
|  [Dropdown mit Thumbnails] |  |                                |
|  > "Ist das ein Preis..."  |  |                                |
|                            |  |                                |
|  4. Template               |  |                                |
|  [Standard-TikTok v]       |  |                                |
|                            |  +--------------------------------+
|                            |
|  Vorschau: Video 1.133     |  Diese Kombination existiert
|  (Influencer + Produkt +   |  noch NICHT. Einzigartig!
|   Overlay = eindeutig)     |
|                            |
|  Geschaetzte Render-Dauer: |
|  ~45 Sekunden              |
|  Geschaetzte Kosten: ~$0.02|
|                            |
|  [Nur Vorschau]            |
|  [Erstellen & Rendern]     |  <- Primaerer Button (Accent)
|                            |
+----------------------------+
```

**Dropdown-Design fuer Clips:**
- Jeder Eintrag zeigt: Thumbnail (klein, 48x64px) + Name + Setting/Typ
- Suchfeld im Dropdown (ab 10+ Eintraegen)
- Zuletzt benutzte Clips oben anzeigen
- Deaktivierte Clips ausgegraut

**Live-Preview:**
- Remotion Player aktualisiert sich bei JEDER Aenderung im Formular (< 1 Sekunde)
- Player zeigt exaktes 9:16-Format (1080x1920), skaliert auf verfuegbare Hoehe
- Play/Pause, Scrubber, Lautstaerke, Vollbild
- Wenn noch nicht alle 3 Felder gewaehlt: Player zeigt Platzhalter ("Waehle alle 3 Bausteine fuer eine Vorschau")

**Dedup-Hinweis:**
- Wenn die Kombination bereits existiert: Warnung (gelb) mit Link zum existierenden Video
- Wenn die Kombination neu ist: Gruener Haken "Einzigartig!"

#### 3.2.3 Tab: Batch-Generator

**Alis Power-Tool: Hunderte Videos mit wenigen Klicks**

```
+------------------------------------------------------------------+
|  Batch-Generator                                                   |
+------------------------------------------------------------------+
|                                                                    |
|  Generierungs-Modus:                                               |
|  ( ) Alle Kombinationen generieren                                 |
|  (x) Influencer mit allen Produkten kombinieren                    |
|  ( ) Produkt mit allen Influencern kombinieren                     |
|  ( ) Manuell auswaehlen                                            |
|                                                                    |
|  +---------------------------+  +---------------------------+      |
|  | Influencer-Clips          |  | Produkt-Clips             |      |
|  | [x] Redhead Schlafzimmer  |  | [x] Lidschatten Gold      |      |
|  | [x] Redhead Kueche        |  | [x] Shampoo Premium       |      |
|  | [ ] Redhead Bad            |  | [x] Mascara Deluxe        |      |
|  | ...                       |  | ...                       |      |
|  | [Alle] [Keine] [Aktive]   |  | [Alle] [Keine] [Aktive]   |      |
|  +---------------------------+  +---------------------------+      |
|                                                                    |
|  +---------------------------+                                     |
|  | Overlays                  |                                     |
|  | Strategie: [Alle aktiven v]                                     |
|  |   ( ) Alle aktiven                                              |
|  |   ( ) Nur generische                                            |
|  |   ( ) Nur produkt-spezifische                                   |
|  +---------------------------+                                     |
|                                                                    |
|  +-----------------------------------------------------------+    |
|  |  ZUSAMMENFASSUNG                                           |    |
|  |                                                            |    |
|  |  Influencer-Clips:  2 ausgewaehlt                         |    |
|  |  Produkt-Clips:     3 ausgewaehlt                         |    |
|  |  Overlays:          32 aktive                             |    |
|  |                                                            |    |
|  |  Moegliche Kombinationen:  192                            |    |
|  |  Davon bereits existierend: 48                            |    |
|  |  NEUE Kombinationen:        144                           |    |
|  |                                                            |    |
|  |  Geschaetzte Render-Kosten: ~$2.88 - $7.20               |    |
|  |  Geschaetzte Render-Dauer:  ~25 Minuten (5 parallel)     |    |
|  |                                                            |    |
|  |  Max Videos pro Batch: [____] (leer = alle)               |    |
|  |                                                            |    |
|  |  [Nur Kombinationen erstellen]                            |    |
|  |  [Erstellen & sofort rendern]  <- Primaer                 |    |
|  +-----------------------------------------------------------+    |
|                                                                    |
+------------------------------------------------------------------+
```

**Zusammenfassung-Box (gelb hervorgehoben):**
- Berechnet LIVE waehrend der Auswahl
- Zeigt klar: wie viele NEU, wie viele DUPLIKATE (uebersprungen)
- Kosten-Range ($min - $max basierend auf Lambda-Kosten)
- Dauer-Schaetzung (basierend auf concurrent renders)
- Ali sieht VOR dem Klick genau was passiert

**Nach dem Klick auf "Erstellen & sofort rendern":**
- Fortschrittsbalken: "Kombinationen erstellen: 144 von 144"
- Dann: "Rendering starten: 5 von 144 aktiv, 0 fertig"
- Live-Counter der fertig gerenderten Videos
- Ali kann die Seite verlassen -- Rendering laeuft im Hintergrund
- Notification wenn alles fertig: "144 Videos gerendert. 2 fehlgeschlagen."

#### 3.2.4 Tab: Render-Queue

```
+------------------------------------------------------------------+
|  Render-Queue                                 [Alles pausieren]   |
+------------------------------------------------------------------+
|                                                                    |
|  Aktiv: 5 / 5 (Max Concurrent)    Warteschlange: 139              |
|  Fertig: 48    Fehlgeschlagen: 2                                  |
|                                                                    |
|  [============================----] 48/194 (25%)                  |
|  Geschaetzte Restzeit: ~18 Minuten                                |
|                                                                    |
|  Aktive Render-Jobs:                                               |
|  +--------------------------------------------------------------+ |
|  | Redhead-Lidschatten-Hook3    [=======---] 72%    ~12s uebrig | |
|  | Redhead-Shampoo-Preisfehler  [====------] 41%    ~25s uebrig | |
|  | Kueche-Mascara-OMG           [==--------] 18%    ~38s uebrig | |
|  | Redhead-Creme-Angebot        [=---------]  8%    ~42s uebrig | |
|  | Kueche-Lidschatten-WOW       [----------]  0%    Startet...  | |
|  +--------------------------------------------------------------+ |
|                                                                    |
|  Fehlgeschlagen:                                                   |
|  +--------------------------------------------------------------+ |
|  | [Rot] Redhead-Serum-Hook3    Timeout (>5min)  [Nochmal]      | |
|  | [Rot] Bad-Creme-Preisfehler  Lambda Error      [Nochmal]     | |
|  +--------------------------------------------------------------+ |
|                                                                    |
+------------------------------------------------------------------+
```

---

### 3.3 AI Generation Studio

Das AI Studio ist in drei Modes unterteilt (Tabs oben). Fuer Ali ist primaer "Erkunden" relevant. "Vergleichen" nutzen Ali und Burak gemeinsam. "Benchmark" ist nur fuer Burak sichtbar.

#### 3.3.1 Tab: Erkunden (Explore Mode)

**Referenz-Pattern: Freepik (Two-Panel) + Midjourney (Variant Grid)**

```
+----------------------------+  +--------------------------------+
|  Erkunden                  |  |  Ergebnisse                    |
|                            |  |                                |
|  Beschreibe dein Bild:     |  |  +------------+  +----------+ |
|  +----------------------+  |  |  | [Bild 1]   |  | [Bild 2] | |
|  | Ein suesses Kaetzchen|  |  |  |            |  |          | |
|  | sitzt auf einem...   |  |  |  +------------+  +----------+ |
|  +----------------------+  |  |  +------------+  +----------+ |
|  [Verbessern] <- AI Prompt |  |  | [Bild 3]   |  | [Bild 4] | |
|                            |  |  |            |  |          | |
|  Modell:                   |  |  +------------+  +----------+ |
|  +----------------------+  |  |                                |
|  | [Star] Flux 1.1      |  |  |  Generiert in 3.2s            |
|  | Stark bei: Schnell,  |  |  |  Kosten: $0.03               |
|  | Allround              |  |  |                                |
|  +----------------------+  |  |  Pro Bild:                     |
|  [Andere Modelle...]       |  |  [Herunterladen] [Variante]    |
|                            |  |  [In Sammlung] [Favorit]       |
|  Format:                   |  |                                |
|  [1:1] [16:9] [9:16]      |  +--------------------------------+
|  (Quadrat ist markiert)    |
|                            |
|  Stil:                     |
|  [Foto] [Illustration]     |
|  [Anime] [Vintage]         |
|  [Abstrakt] [Keiner]       |
|                            |
|  Anzahl Bilder: [4]        |
|                            |
|  [v Erweiterte Optionen]   |  <- Toggle, Default geschlossen
|  | Seed: [leer]            |
|  | Kreativitaet: [====o==] |  <- Slider statt "CFG Scale"
|  | Ausschliessen: [....]   |  <- statt "Negative Prompt"
|  | Schritte: [====o=====]  |  <- Slider statt Zahleneingabe
|                            |
|  Geschaetzte Kosten: ~$0.03|
|  Geschaetzte Dauer:  ~5s   |
|                            |
|  [Generieren]              |  <- Primaer-Button
|                            |
+----------------------------+
```

**Modell-Auswahl (Model Cards):**

Beim Klick auf "Andere Modelle..." oeffnet sich ein Modal/Sheet:

```
+------------------------------------------------------------------+
|  Modell auswaehlen                              [Suche: ........] |
+------------------------------------------------------------------+
|                                                                    |
|  Filter: [Alle] [Bilder] [Videos] [Audio]                         |
|  Sortierung: [Empfohlen] [Schnellste] [Guenstigste] [Bewertung]  |
|                                                                    |
|  +--------------------+  +--------------------+  +---------------+ |
|  | FLUX 1.1           |  | Seedream 3.0       |  | Ideogram 3   | |
|  | [Beispiel-Thumb]   |  | [Beispiel-Thumb]   |  | [Beispiel]   | |
|  |                    |  |                    |  |              | |
|  | Stark bei:         |  | Stark bei:         |  | Stark bei:   | |
|  | Schnell, Allround  |  | Fotorealismus      |  | Text in Bild | |
|  |                    |  |                    |  |              | |
|  | ~2-5 Sek | ~$0.01  |  | ~8-15 Sek | ~$0.04 |  | ~5s | $0.03 | |
|  | [Star: 1620 ELO]   |  | [Star: 1580 ELO]   |  | [Star: 1540] | |
|  |                    |  |                    |  |              | |
|  | [Auswaehlen]       |  | [Auswaehlen]       |  | [Auswaehlen] | |
|  +--------------------+  +--------------------+  +---------------+ |
|                                                                    |
|  Video-Modelle:                                                    |
|  +--------------------+  +--------------------+                    |
|  | Kling 3.0 Pro      |  | Veo 3.1            |                    |
|  | [Beispiel-Thumb]   |  | [Beispiel-Thumb]   |                    |
|  | Stark bei:         |  | Stark bei:         |                    |
|  | Multi-Shot, Audio  |  | 4K, Realismus      |                    |
|  | ~30s | ~$1.10/5s   |  | ~45s | ~$1.00/s    |                    |
|  | [Auswaehlen]       |  | [Auswaehlen]       |                    |
|  +--------------------+  +--------------------+                    |
+------------------------------------------------------------------+
```

**Ali versteht Model Cards durch:**
- Menschliche Staerke-Labels ("Stark bei: Fotorealismus") statt technischer IDs
- Beispielbilder pro Modell (1 Thumbnail reicht)
- Kosten und Dauer-Schaetzung KLAR sichtbar
- ELO-Score als Sterne oder einfache Zahl (optional, wenn Benchmark-Daten existieren)
- Kein "fal-ai/flux/dev" -- nur "Flux 1.1"

**AI Prompt Enhancement:**
- Ali tippt: "suesses kaetzchen auf sofa"
- Klick auf "Verbessern"
- System zeigt: "Ein entzueckendes, flauschiges Kaetzchen mit grossen Augen sitzt entspannt auf einem weichen, beigen Sofa in einem warm beleuchteten Wohnzimmer. Weiches Bokeh-Licht im Hintergrund."
- Ali kann die verbesserte Version bearbeiten oder direkt nutzen
- Originaler Prompt bleibt sichtbar (Toggle: "Original anzeigen")

#### 3.3.2 Tab: Vergleichen (Compare Mode)

**Referenz-Pattern: Artificial Analysis Image Lab**

```
+------------------------------------------------------------------+
|  Vergleichen                                                       |
+------------------------------------------------------------------+
|                                                                    |
|  Beschreibe dein Bild:                                             |
|  +--------------------------------------------------------------+ |
|  | Ein futuristischer Roboter malt ein Oelgemaelde in einem     | |
|  | Atelier mit natuerlichem Licht                                | |
|  +--------------------------------------------------------------+ |
|  [Verbessern]                                                      |
|                                                                    |
|  Modelle auswaehlen (max. 5):                                      |
|  [x] Flux 1.1 (~$0.01)                                            |
|  [x] Seedream 3.0 (~$0.04)                                        |
|  [x] Ideogram 3 (~$0.03)                                          |
|  [ ] DALL-E 4 (~$0.04)                                            |
|  [ ] Midjourney V8 (~$0.03)                                       |
|  [Weitere Modelle...]                                              |
|                                                                    |
|  Gesamtkosten: ~$0.08    Dauer: ~5-15 Sekunden                    |
|                                                                    |
|  [Vergleich starten]                                               |
|                                                                    |
+------------------------------------------------------------------+
|                                                                    |
|  Ergebnisse:                                                       |
|                                                                    |
|  +------------------+  +------------------+  +------------------+ |
|  | Flux 1.1         |  | Seedream 3.0     |  | Ideogram 3       | |
|  |                  |  |                  |  |                  | |
|  | [Bild]           |  | [Spinner...]     |  | [Bild]           | |
|  |                  |  |  Generiert...    |  |                  | |
|  |                  |  |  [===----] 45%   |  |                  | |
|  |                  |  |                  |  |                  | |
|  | 2.1s | $0.01     |  | ...              |  | 4.8s | $0.03     | |
|  |                  |  |                  |  |                  | |
|  | [Herunterladen]  |  |                  |  | [Herunterladen]  | |
|  | [Variante]       |  |                  |  | [Variante]       | |
|  | [Gewinner!]      |  |                  |  | [Gewinner!]      | |
|  +------------------+  +------------------+  +------------------+ |
|                                                                    |
+------------------------------------------------------------------+
```

**Progressive Grid Loading:**
- Jedes Modell hat seine eigene Card im Grid
- Wenn das Ergebnis noch nicht da ist: Skeleton-Loader + Spinner + Fortschrittsbalken
- Sobald ein Ergebnis eintrifft: Bild einblenden (Fade-In)
- Kein Warten auf das langsamste Modell -- die schnellen Ergebnisse erscheinen sofort
- Generierungszeit und Kosten werden unter jedem Bild angezeigt

**Winner-Markierung (fuer ELO):**
- Jede Modell-Card hat einen "Gewinner!"-Button
- Klick markiert dieses Modell als Sieger fuer diese Runde
- Optional: Pairwise-Vergleich ("A oder B?" -- erscheint als Overlay bei Klick auf "Bewerten")

#### 3.3.3 Tab: Benchmark (nur Burak)

**Sichtbarkeit: Nur wenn User.role === 'admin'**

```
+------------------------------------------------------------------+
|  Benchmark-Suites                            [Neue Suite erstellen]|
+------------------------------------------------------------------+
|                                                                    |
|  +--------------------------------------------------------------+ |
|  | Fotorealismus-Test                          Letzter Run: 3.4. | |
|  | 5 Prompts x 4 Modelle = 20 Generierungen                     | |
|  | Kosten letzter Run: $0.64                                     | |
|  | [Erneut ausfuehren] [Ergebnisse ansehen] [Bearbeiten]        | |
|  +--------------------------------------------------------------+ |
|  | Illustration-Benchmark                      Letzter Run: 1.4. | |
|  | 8 Prompts x 3 Modelle = 24 Generierungen                     | |
|  | Kosten letzter Run: $0.96                                     | |
|  | [Erneut ausfuehren] [Ergebnisse ansehen] [Bearbeiten]        | |
|  +--------------------------------------------------------------+ |
|                                                                    |
|  ELO-Leaderboard (Alle Modelle):                                   |
|  +--------------------------------------------------------------+ |
|  | #1  Seedream 3.0      ELO: 1620   Wins: 72%   48 Vergleiche  | |
|  | #2  Flux 1.1 Pro      ELO: 1580   Wins: 65%   52 Vergleiche  | |
|  | #3  Ideogram 3        ELO: 1540   Wins: 58%   36 Vergleiche  | |
|  | #4  DALL-E 4          ELO: 1490   Wins: 51%   44 Vergleiche  | |
|  +--------------------------------------------------------------+ |
|                                                                    |
+------------------------------------------------------------------+
```

#### 3.3.4 Tab: Galerie (History)

```
+------------------------------------------------------------------+
|  Galerie                                                           |
+------------------------------------------------------------------+
|                                                                    |
|  Suche: [Prompt-Text oder Tag eingeben...]                         |
|  Filter: [Alle Modelle v] [Alle Typen v] [Nur Favoriten]         |
|  Sortierung: [Neueste zuerst v]                                   |
|                                                                    |
|  +--------+  +--------+  +--------+  +--------+  +--------+      |
|  | [Bild] |  | [Bild] |  | [Bild] |  | [Bild] |  | [Video]|      |
|  |        |  |        |  |        |  |        |  | [Play] |      |
|  | Flux   |  | Seed.. |  | Flux   |  | Ideo.. |  | Kling  |      |
|  | $0.01  |  | $0.04  |  | $0.01  |  | $0.03  |  | $1.10  |      |
|  | [Star] |  | [Star] |  | [Star] |  | [Star] |  | [Star] |      |
|  +--------+  +--------+  +--------+  +--------+  +--------+      |
|                                                                    |
|  [Mehr laden...]                                                   |
+------------------------------------------------------------------+
```

**Klick auf ein Bild oeffnet Detail-View:**
- Grosses Bild (oder Video-Player)
- Prompt (Original + Enhanced)
- Modell, Parameter, Kosten, Dauer
- Tags (editierbar)
- "In Sammlung hinzufuegen"
- "Variante generieren" (gleicher Prompt, neuer Seed)
- "Herunterladen"
- Datum/Uhrzeit

---

### 3.4 Social Media Dashboard

#### 3.4.1 Account-Uebersicht

```
+------------------------------------------------------------------+
|  Social Media                                                      |
|  [Accounts] [Calendar] [Performance] [Post erstellen]             |
+------------------------------------------------------------------+
|                                                                    |
|  Verbundene Accounts                    [Account verbinden +]      |
|                                                                    |
|  +--------------------------------------------------------------+ |
|  | [TikTok-Icon]  @GenMedia                                      | |
|  | Follower: 4.823  |  Videos: 234  |  Engagement: 3.4%         | |
|  | Status: [Gruen] Aktiv  |  CPL: 2/5 Shop-Videos                | |
|  | [Metriken] [Posts anzeigen] [Trennen]                         | |
|  +--------------------------------------------------------------+ |
|  | [TikTok-Icon]  @GenMedia2                                     | |
|  | Follower: 1.205  |  Videos: 89   |  Engagement: 2.8%         | |
|  | Status: [Gruen] Aktiv  |  CPL: 4/5 Shop-Videos [Gelb]        | |
|  | [Metriken] [Posts anzeigen] [Trennen]                         | |
|  +--------------------------------------------------------------+ |
|  | [IG-Icon]  @genmedia_official                                 | |
|  | Follower: 812   |  Reels: 45    |  Engagement: 4.1%          | |
|  | Status: [Gruen] Aktiv                                         | |
|  | [Metriken] [Posts anzeigen] [Trennen]                         | |
|  +--------------------------------------------------------------+ |
|  | [YT-Icon]  GenMedia Shorts                                    | |
|  | Status: [Rot] Token abgelaufen                                | |
|  | [Neu verbinden]                                               | |
|  +--------------------------------------------------------------+ |
|                                                                    |
+------------------------------------------------------------------+
```

**Account verbinden (Modal):**
- Drei grosse Kacheln: TikTok, Instagram, YouTube
- Klick oeffnet OAuth-Flow in neuem Tab
- Waehrend des Wartens: "Verbindung wird hergestellt..." Spinner
- Nach Erfolg: Account erscheint in der Liste mit gruener Animation

#### 3.4.2 Content Calendar

**Referenz-Pattern: Google Calendar (vereinfacht)**

```
+------------------------------------------------------------------+
|  Content Calendar                                                  |
|  [< Vorherige Woche]  KW 14: 31. Maerz - 6. April  [Naechste >] |
|  Ansicht: [Tag] [Woche] [Monat]                                   |
+------------------------------------------------------------------+
|                                                                    |
|     Mo 31.     Di 1.      Mi 2.      Do 3.     Fr 4.     Sa 5.   |
|  +----------+----------+----------+---------+---------+---------+ |
|  |          |          |          |         |         |         | |
|  | [TK] 10h| [TK] 14h | [TK] 10h|         | [TK] 9h|         | |
|  | Redhead  | Kueche   | Redhead  |         | Bad     |         | |
|  | Lidsch.  | Shampoo  | Mascara  |         | Serum   |         | |
|  |          |          |          |         |         |         | |
|  | [IG] 12h| [IG] 18h |          | [IG] 11h|         |         | |
|  | Redhead  | Kueche   |          | Redhead |         |         | |
|  | Lidsch.  | Shampoo  |          | Creme   |         |         | |
|  |          |          |          |         |         |         | |
|  +----------+----------+----------+---------+---------+---------+ |
|                                                                    |
|  Legende: [TK] = TikTok  [IG] = Instagram  [YT] = YouTube        |
|                                                                    |
+------------------------------------------------------------------+
```

**Interaktionen:**
- **Drag & Drop:** Geplante Posts koennen zwischen Tagen/Zeiten verschoben werden
- **Klick auf Post:** Oeffnet Detail-Sheet (Caption, Plattform, Video-Preview, Status)
- **Klick auf leeren Slot:** Oeffnet "Post erstellen" fuer diesen Zeitpunkt
- **Farbkodierung:** Jede Plattform hat ihre eigene Farbe (TikTok=Schwarz, IG=Lila-Gradient, YT=Rot)

#### 3.4.3 Performance-Dashboard

```
+------------------------------------------------------------------+
|  Performance                                                       |
|  Zeitraum: [Letzte 7 Tage v]  Account: [Alle Accounts v]         |
+------------------------------------------------------------------+
|                                                                    |
|  +----------------+  +----------------+  +----------------+        |
|  | 54.200         |  | 1.735          |  | 3,2%           |        |
|  | Views gesamt   |  | Likes gesamt   |  | Engagement     |        |
|  | +12% vs letzte |  | +8% vs letzte  |  | -0.1% vs letzte|        |
|  | Woche          |  | Woche          |  | Woche          |        |
|  +----------------+  +----------------+  +----------------+        |
|                                                                    |
|  [Views-Chart: Liniengrafik ueber 7 Tage]                         |
|                                                                    |
|  Top-Performer:                                                    |
|  +--------------------------------------------------------------+ |
|  | Was performt am besten?                                       | |
|  | [Nach Overlay v]  [Nach Produkt]  [Nach Influencer]           | |
|  |                                                                | |
|  | #1  "Ist das ein Preisfehler?"   Avg Views: 2.340  Eng: 4.1% | |
|  | #2  "OMG dieses Angebot"         Avg Views: 1.890  Eng: 3.8% | |
|  | #3  "Schaut euch das an"         Avg Views: 1.220  Eng: 2.9% | |
|  +--------------------------------------------------------------+ |
|                                                                    |
|  Letzte Posts:                                                     |
|  +--------------------------------------------------------------+ |
|  | [Thumb] Redhead-Lidsch.-Preis  | @GenMedia  | 3.400 Views    | |
|  | [Thumb] Kueche-Shampoo-OMG     | @GenMedia  | 2.100 Views    | |
|  | [Thumb] Redhead-Mascara-WOW    | @GenMedia2 | 1.800 Views    | |
|  +--------------------------------------------------------------+ |
|                                                                    |
+------------------------------------------------------------------+
```

**Mobile-optimiert:**
- Metriken-Cards stacken vertikal
- Chart wird Vollbreite
- Top-Performer-Tabelle scrollt horizontal
- Ali kann auf dem Handy schnell reinschauen

---

### 3.5 Post erstellen (Content Planner)

```
+------------------------------------------------------------------+
|  Post erstellen                                                    |
+------------------------------------------------------------------+
|                                                                    |
|  1. Video auswaehlen                                               |
|  +--------------------------------------------------------------+ |
|  | [Dropdown: Videos mit Status "Bereit"]                        | |
|  | > Redhead-Lidschatten-Preisfehler                             | |
|  | [Mini-Preview des Videos]                                     | |
|  +--------------------------------------------------------------+ |
|                                                                    |
|  2. Plattform & Account                                           |
|  +--------------------------------------------------------------+ |
|  | [x] TikTok  -> [@GenMedia v]                                  | |
|  | [x] Instagram -> [@genmedia_official v]                       | |
|  | [ ] YouTube (Token abgelaufen -- erst neu verbinden)          | |
|  +--------------------------------------------------------------+ |
|                                                                    |
|  3. Caption                                                        |
|  +--------------------------------------------------------------+ |
|  | TikTok-Caption:                                               | |
|  | [OMG ist das ein PREISFEHLER?! Diesen Lidschatten gibts fuer  | |
|  |  nur 4.99!! Link in Bio #preisfehler #beauty #tiktokshop]    | |
|  |                                                                | |
|  | Instagram-Caption:                              [Von TikTok   | |
|  | [OMG ist das ein PREISFEHLER?! ...             kopieren]      | |
|  +--------------------------------------------------------------+ |
|                                                                    |
|  4. Produkt verknuepfen (TikTok Shop)                              |
|  +--------------------------------------------------------------+ |
|  | Produkt: [Lidschatten Gold - Amazon v]                        | |
|  | Automatisches Product-Linking: [An]                           | |
|  | CPL-Status @GenMedia: 2/5 [Gruen]                             | |
|  +--------------------------------------------------------------+ |
|                                                                    |
|  5. Zeitpunkt                                                      |
|  +--------------------------------------------------------------+ |
|  | ( ) Sofort posten                                             | |
|  | (x) Planen fuer:                                              | |
|  |     Datum: [05.04.2026]  Uhrzeit: [14:00]                    | |
|  +--------------------------------------------------------------+ |
|                                                                    |
|  Zusammenfassung:                                                  |
|  TikTok @GenMedia + Instagram @genmedia_official                   |
|  Geplant fuer: 05.04.2026 14:00                                   |
|  Product-Linking: Ja (automatisch nach Upload)                     |
|                                                                    |
|  [Entwurf speichern]  [Post planen]                                |
|                                                                    |
+------------------------------------------------------------------+
```

**Caption-Editor:**
- Plattform-spezifische Felder (TikTok hat andere Hashtag-Regeln als Instagram)
- "Von TikTok kopieren"-Button um Caption zu duplizieren
- Zeichenzaehler pro Plattform (TikTok: 2.200 Zeichen, IG: 2.200)
- Emoji-Picker
- Hashtag-Vorschlaege (basierend auf Produkt-Kategorie)

**Product-Linking:**
- Nur sichtbar wenn TikTok ausgewaehlt
- Zeigt CPL-Status des gewahlten Accounts
- Wenn Account am Limit (rot): Warnung + Vorschlag einen anderen Account zu waehlen

---

### 3.6 Asset Library

#### Influencer-Clips, Produkt-Clips, Overlays (gleiche Struktur)

```
+------------------------------------------------------------------+
|  Assets                                                            |
|  [Influencer-Clips] [Produkt-Clips] [Overlays] [Produkt-Katalog] |
+------------------------------------------------------------------+
|                                                                    |
|  Influencer-Clips (45)                        [Neu hochladen +]   |
|  Filter: [Alle v]  [Nur aktive]  Suche: [................]        |
|                                                                    |
|  +------------------+  +------------------+  +------------------+ |
|  | [Video-Thumb]    |  | [Video-Thumb]    |  | [Video-Thumb]    | |
|  | 9:16             |  | 9:16             |  | 9:16             | |
|  |                  |  |                  |  |                  | |
|  | Redhead          |  | Redhead          |  | Redhead          | |
|  | Schlafzimmer     |  | Kueche           |  | Bad              | |
|  | 8.2s             |  | 6.5s             |  | 7.1s             | |
|  |                  |  |                  |  |                  | |
|  | Benutzt: 234x    |  | Benutzt: 189x    |  | Benutzt: 45x     | |
|  | Score: 4.2/5     |  | Score: 3.8/5     |  | Score: 2.1/5     | |
|  |                  |  |                  |  |                  | |
|  | [Aktiv]          |  | [Aktiv]          |  | [Inaktiv]        | |
|  | [Abspielen]      |  | [Abspielen]      |  | [Aktivieren]     | |
|  +------------------+  +------------------+  +------------------+ |
|                                                                    |
+------------------------------------------------------------------+
```

**Asset-Upload (Modal):**
```
+--------------------------------------------------+
|  Neuen Clip hochladen                             |
+--------------------------------------------------+
|                                                    |
|  Quelle:                                           |
|  (x) Datei hochladen (Drag & Drop oder Klick)    |
|  ( ) Google Drive URL einfuegen                   |
|                                                    |
|  +----------------------------------------------+ |
|  |                                              | |
|  |     [Cloud-Icon]                             | |
|  |     Video hierher ziehen                     | |
|  |     oder klicken zum Auswaehlen              | |
|  |                                              | |
|  |     MP4, MOV, WebM (max. 100 MB)            | |
|  +----------------------------------------------+ |
|                                                    |
|  Name: [____________________________]             |
|  Typ:  [Influencer-Clip v]                        |
|  Setting: [Schlafzimmer v] (oder neues eingeben)  |
|  Tags: [beauty] [redhead] [+ Tag hinzufuegen]     |
|                                                    |
|  [Abbrechen] [Hochladen]                          |
+--------------------------------------------------+
```

**Overlay-Verwaltung:**
- Overlays zeigen gerenderte PNG-Vorschau
- "Neues Overlay" oeffnet ein Formular: Text eingeben, Position waehlen, Farbe waehlen
- System rendert Overlay als PNG via Remotion (statt Creatomate)
- Preview in Echtzeit waehrend der Eingabe

**Produkt-Katalog:**
- Tabellen-Ansicht (hier passt eine Tabelle, weil Produkte einfache Daten sind)
- Spalten: Name, Kategorie, Brand, TikTok-Shop-URL, Status, Aktionen
- Inline-Editing fuer einfache Felder
- "Neues Produkt"-Button oeffnet kurzes Formular

---

### 3.7 Einstellungen

```
+------------------------------------------------------------------+
|  Einstellungen                                                     |
|  [Mein Profil] [Accounts] [Team] [System]                        |
+------------------------------------------------------------------+
```

#### Mein Profil
- Name, E-Mail, Profilbild
- Sprache (Deutsch/Englisch)
- Notification-Praeferenzen (was soll im Notification-Center erscheinen)

#### Accounts (Social Media Verbindungen)
- Gleiche UI wie Account-Uebersicht im Social-Media-Bereich
- Hier koennen Accounts verbunden/getrennt werden
- Token-Status mit Ablaufdatum

#### Team
- Team-Mitglieder einladen (E-Mail)
- Rollen: Operator (Ali) | Admin (Burak)
- Operator sieht: Alles ausser System-Einstellungen und Benchmark-Mode
- Admin sieht: Alles

#### System (nur Burak, role === 'admin')

```
+------------------------------------------------------------------+
|  System-Einstellungen (Admin)                                      |
+------------------------------------------------------------------+
|                                                                    |
|  API-Schluessel:                                                   |
|  +--------------------------------------------------------------+ |
|  | Fal AI         [***...***aX3]      [Anzeigen] [Aendern]      | |
|  | AWS (Lambda)   [***...***7bQ]      [Anzeigen] [Aendern]      | |
|  | Claude API     [***...***mNp]      [Anzeigen] [Aendern]      | |
|  +--------------------------------------------------------------+ |
|                                                                    |
|  Rendering-Konfiguration:                                          |
|  +--------------------------------------------------------------+ |
|  | Max parallele Renders:  [5___]                                | |
|  | Render-Timeout:         [5 Minuten v]                         | |
|  | Lambda-Region:          [eu-central-1 v]                      | |
|  | S3-Bucket:              [maytt-renders v]                     | |
|  +--------------------------------------------------------------+ |
|                                                                    |
|  TikTok Shop Automation:                                           |
|  +--------------------------------------------------------------+ |
|  | Automatisches Product-Linking: [An v]                         | |
|  | Delay zwischen Aktionen:       [2-5 Sekunden v]              | |
|  | Playwright-Browser-Profile:    [3 Profile konfiguriert]       | |
|  +--------------------------------------------------------------+ |
|                                                                    |
+------------------------------------------------------------------+
```

**Wichtig:** API-Schluessel sind IMMER maskiert. "Anzeigen" zeigt sie nur fuer 10 Sekunden, dann werden sie wieder maskiert. Ali sieht diesen Tab gar nicht.

---

## 4. Key Interaction Patterns

### 4.1 Drag & Drop

| Wo | Was wird gedraggt | Wohin |
|----|-------------------|-------|
| Content Calendar | Geplanter Post (Card) | Anderer Tag/Zeitslot |
| Asset Upload | Datei von Desktop | Upload-Zone (Dropzone) |
| Video-Pipeline (P2) | Video-Card | Status-Spalte (Kanban-View, spaeter) |

**Implementierung:**
- `@dnd-kit/core` (React DnD Library, gut mit shadcn kompatibel)
- Visuelles Feedback: Ghost-Element beim Drag, Highlight auf gueltigem Drop-Target
- Touch-Support: Nicht noetig (Desktop-first), aber grundsaetzlich mit @dnd-kit moeglich

### 4.2 Progress & Loading

#### Rendering-Jobs (Sekunden bis Minuten)

```
Phasen-Indikator:
[Warten...] -> [Startet...] -> [========----] 68% -> [Fertig!]

Details:
- Numerischer Prozent-Wert
- Geschaetzte Restzeit ("~12 Sekunden uebrig")
- Spinner-Animation waehrend "Startet..."
- Gruener Haken + Konfetti-Micro-Animation bei "Fertig!"
```

**Technisch:** Supabase Realtime subscribes auf `render_jobs`-Tabelle. Lambda Callback updatet Status -> Supabase Realtime feuert -> Client-UI updatet automatisch.

#### AI Generation (Sekunden)

```
Phasen-Indikator:
[In Warteschlange] -> [Wird generiert...] -> [Bild erscheint]

Details:
- Skeleton-Loader an der Stelle wo das Bild erscheinen wird
- Pulsierender Rand (subtle, nicht aggressiv)
- Bei Compare Mode: Jede Modell-Card hat eigenen unabhaengigen Loader
- Fade-In-Animation wenn Ergebnis eintrifft
```

**Technisch:** Fal AI Queue -> SSE (Server-Sent Events) oder Webhook -> Supabase Realtime -> Client.

#### Seiten-Lade-States

- **Skeleton-Screens** statt Spinner (shadcn `Skeleton` Komponente)
- Cards zeigen Skeleton mit korrekter Groesse bevor Daten laden
- Nie eine leere Seite mit einem einsamen Spinner in der Mitte

### 4.3 Error-Handling (Ali-freundlich)

**Prinzip: Jeder Fehler hat eine Erklaerung in Alltagssprache und einen Aktions-Button.**

| Technischer Fehler | Ali sieht | Button |
|--------------------|-----------|--------|
| Lambda Timeout | "Das Rendern hat zu lange gedauert. Manchmal passiert das bei komplexen Videos." | "Nochmal versuchen" |
| Lambda Error 500 | "Beim Rendern ist ein technisches Problem aufgetreten." | "Nochmal versuchen" |
| Fal AI Rate Limit | "Zu viele Anfragen gleichzeitig. Bitte warte kurz." | "In 30 Sekunden erneut versuchen" (Auto-Retry) |
| Fal AI Model Error | "Das Modell konnte dein Bild nicht erstellen. Versuch einen anderen Prompt." | "Prompt aendern" |
| OAuth Token Expired | "Die Verbindung zu TikTok ist abgelaufen." | "Neu verbinden" |
| TikTok Upload Failed | "Das Video konnte nicht auf TikTok hochgeladen werden." | "Nochmal versuchen" / "Details anzeigen" |
| CPL Limit Reached | "Dieser Account hat das Maximum an Shop-Videos fuer diese Woche erreicht." | "Anderen Account waehlen" |
| Network Error | "Keine Internetverbindung. Pruefe deine Verbindung und versuche es erneut." | "Nochmal versuchen" |
| Google Drive 403 | "Kein Zugriff auf diese Datei in Google Drive. Pruefe die Freigabe." | "In Google Drive oeffnen" |

**Error-Display:**
- **Inline-Error:** Rote Box direkt unter dem betroffenen Element (z.B. unter einem Video-Card)
- **Toast:** Fuer kurze Bestaetigungen und kleinere Fehler (oben rechts, 5 Sekunden sichtbar)
- **Modal:** Nur fuer kritische Fehler die eine Entscheidung erfordern (z.B. "Account am Limit -- welchen Account stattdessen nutzen?")

### 4.4 Toast & Notification Pattern

**Toast-Nachrichten (transient, oben rechts):**

| Typ | Beispiel | Dauer | Auto-Close |
|-----|----------|-------|------------|
| Erfolg | "Video erfolgreich gerendert" | 4s | Ja |
| Info | "3 neue Videos in der Warteschlange" | 4s | Ja |
| Warnung | "CPL-Limit fast erreicht bei @GenMedia2" | 8s | Ja |
| Fehler | "Render fehlgeschlagen" + [Details] | Bleibt offen | Nein (manuell schliessen) |

**Implementierung:** shadcn `Toast` (Sonner) -- unterstuetzt Stacking, Actions, Progress.

**Notification Center (Bell-Icon in Top-Bar):**
- Dropdown/Sheet mit allen Notifications
- Gruppiert nach Typ (Rendering, Social Media, System)
- Ungelesene Notifications mit blauem Punkt
- "Alle als gelesen markieren"-Button
- Aeltere Notifications nach 7 Tagen automatisch archivieren

### 4.5 Confirmation Dialogs

**Wann werden Confirmation Dialogs angezeigt?**

| Aktion | Dialog? | Begruendung |
|--------|---------|-------------|
| Einzelnes Video rendern | Nein | Kosten minimal, reversibel (neuer Render) |
| Batch-Rendering (>10 Videos) | Ja | Kosten und Dauer werden angezeigt |
| Post sofort veroeffentlichen | Ja | Nicht rueckgaengig machbar |
| Account trennen | Ja | Kann Daten verlieren |
| Video archivieren | Nein | Kann wiederhergestellt werden |
| Alle Daten loeschen (Admin) | Ja + Texteingabe | Destructive Aktion |
| AI Vergleich starten (>$0.50) | Ja | Kosten-Bestaetigung |
| AI Vergleich starten (<$0.50) | Nein | Zu oft, wuerde nerven |

**Dialog-Design:**

```
+--------------------------------------------------+
|  Batch-Rendering starten?                         |
+--------------------------------------------------+
|                                                    |
|  Du startest das Rendering von 144 Videos.        |
|                                                    |
|  Geschaetzte Kosten: $2.88 - $7.20               |
|  Geschaetzte Dauer:  ~25 Minuten                  |
|                                                    |
|  Das Rendering laeuft im Hintergrund. Du kannst   |
|  weiterarbeiten waehrend die Videos gerendert      |
|  werden.                                           |
|                                                    |
|  [Abbrechen]                 [Rendering starten]  |
+--------------------------------------------------+
```

---

## 5. Component Library Plan

### 5.1 shadcn/ui Komponenten (direkt nutzbar)

| Komponente | Verwendung |
|------------|------------|
| `Button` | Primaer, Sekundaer, Ghost, Destructive, Icon-Buttons |
| `Card` | Video-Cards, Asset-Cards, Metriken-Cards, Account-Cards |
| `Dialog` | Confirmation Dialogs, Asset-Upload, Account verbinden |
| `Sheet` | Detail-Views (Video-Detail, Post-Detail, Generation-Detail) |
| `DropdownMenu` | User-Menu, Kontext-Menus auf Cards |
| `Select` | Modell-Auswahl, Account-Auswahl, Filter-Dropdowns |
| `Input` | Text-Eingabe, Suche |
| `Textarea` | Prompt-Input, Caption-Editor |
| `Badge` | Status-Badges (To Render, Bereit, Publiziert), Tags |
| `Tabs` | Seiten-interne Navigation (Alle Videos / Neu / Batch / Queue) |
| `Skeleton` | Lade-States fuer alle Karten und Listen |
| `Toast` (Sonner) | Notifications, Fehler, Bestaetigungen |
| `Progress` | Render-Fortschritt, Upload-Fortschritt |
| `Slider` | Kreativitaet, Stylization, Weirdness (AI Studio) |
| `Switch` | Toggle: AI Prompt Enhance, Auto Product-Linking, Aktiv/Inaktiv |
| `Checkbox` | Multi-Select in Batch-Generator, Modell-Auswahl |
| `RadioGroup` | Generierungs-Modi, Overlay-Strategie |
| `Avatar` | User-Avatar, Account-Avatare |
| `Tooltip` | Erklaerungen fuer nicht-offensichtliche Buttons |
| `Separator` | Visueller Trenner in Sidebar und Formularen |
| `ScrollArea` | Scrollbare Listen (Assets, Generierungen) |
| `Calendar` | Datums-Auswahl fuer Scheduling |
| `Popover` | Kleine Inline-Formulare (z.B. Tag hinzufuegen) |
| `Command` (cmdk) | Globale Suche (Cmd+K) |
| `AlertDialog` | Destructive Confirmations |
| `HoverCard` | Asset-Preview bei Hover ueber Dropdown-Eintrag |
| `Table` | Produkt-Katalog, ELO-Leaderboard |
| `Pagination` | Seitennavigation in langen Listen |
| `Breadcrumb` | Navigation innerhalb von Detail-Views |
| `Collapsible` | "Erweiterte Optionen" Toggle im AI Studio |
| `ResizablePanel` | Two-Panel-Layout im AI Studio (Formular | Preview) |

### 5.2 Custom Components (muessen gebaut werden)

| Komponente | Beschreibung | Komplexitaet |
|------------|-------------|-------------|
| `RemotionPreview` | Remotion Player eingebettet mit Play/Pause/Scrub/Vollbild | Hoch |
| `VideoCard` | Card mit Thumbnail, Status-Badge, Quick Actions, Hover-Autoplay | Mittel |
| `AssetPicker` | Dropdown mit Thumbnails fuer Influencer/Produkt/Overlay-Auswahl | Mittel |
| `CombinationSummary` | Live-berechnete Zusammenfassung (Anzahl, Kosten, Dauer) | Mittel |
| `CPLWidget` | Ampel-Karte pro Account mit Fortschrittsbalken | Niedrig |
| `ModelCard` | Modell-Karte mit Staerken-Labels, Kosten, Beispielbild | Mittel |
| `ProgressiveGrid` | Grid das sich Zelle fuer Zelle fuellt (AI Compare Mode) | Hoch |
| `ContentCalendar` | Kalender-Ansicht mit Drag & Drop (basierend auf Date-FNS) | Hoch |
| `CaptionEditor` | Textarea mit Zeichenzaehler, Emoji-Picker, Hashtag-Vorschlaegen | Mittel |
| `MetricsCard` | Grosse Zahl + Label + Delta-Anzeige (positiv/negativ) | Niedrig |
| `ActivityFeed` | Chronologische Liste mit farbigen Punkten und Action-Buttons | Niedrig |
| `OAuthButton` | Plattform-spezifischer Button (TikTok/IG/YT Farben und Icons) | Niedrig |
| `BudgetEstimate` | Kosten-/Dauer-Anzeige die sich bei Input-Aenderungen live updatet | Niedrig |
| `StatusPipeline` | Horizontale Leiste mit Statusverteilung (To Render: 340, ...) | Niedrig |
| `ELOLeaderboard` | Sortierbare Tabelle mit ELO-Score, Win-Rate, Vergleiche | Niedrig |

### 5.3 Responsive Breakpoints

| Breakpoint | Name | Layout-Verhalten |
|------------|------|------------------|
| `< 640px` | Mobile | Sidebar collapsed (Hamburger), 1 Spalte Cards, kein Calendar-Drag-Drop |
| `640-1024px` | Tablet | Sidebar collapsed, 2 Spalten Cards, Calendar vereinfacht |
| `1024-1440px` | Desktop | Sidebar expanded, 3 Spalten Cards, voller Calendar |
| `> 1440px` | Wide | Sidebar expanded, 4 Spalten Cards, Two-Panel-Layouts komfortabler |

**Mobile-Prioritaet (was MUSS mobil funktionieren):**
1. Dashboard (Metriken-Cards, CPL-Status)
2. Performance-Ansicht (Engagement-Daten)
3. Video-Liste mit Status
4. Notifications

**Desktop-Only (funktioniert nur mit Maus/Tastatur sinnvoll):**
1. Batch-Generator (Multi-Select)
2. Content Calendar (Drag & Drop)
3. AI Studio Compare Mode (Side-by-Side braucht Breite)
4. Remotion Player mit Formular (Two-Panel)

---

## 6. User Flows

### 6.1 Flow 1: Ali erstellt ein neues TikTok-Video

**Ziel:** Von der Idee zum veroeffentlichten Video in unter 5 Minuten.

```
Start: Ali oeffnet die App
  |
  v
[Dashboard]
  |-- Klick auf "Neues Video erstellen" (Quick Action)
  |
  v
[Video-Pipeline > Neu erstellen]
  |
  |-- 1. Influencer-Clip auswaehlen
  |   Ali oeffnet Dropdown, sieht Thumbnails, waehlt "Redhead - Schlafzimmer"
  |
  |-- 2. Produkt-Clip auswaehlen
  |   Ali oeffnet Dropdown, waehlt "Lidschatten Gold - Swipe"
  |
  |-- 3. Overlay auswaehlen
  |   Ali oeffnet Dropdown, waehlt "Ist das ein Preisfehler?"
  |
  |-- LIVE: Remotion Player zeigt sofort die Vorschau
  |   Ali klickt Play, sieht das fertige Video, ist zufrieden
  |
  |-- 4. Klick auf "Erstellen & Rendern"
  |   Kosten-Hinweis: "~$0.02, ~45 Sekunden"
  |
  v
[Rendering startet im Hintergrund]
  |-- Toast: "Video wird gerendert..."
  |-- Progress-Bar erscheint in der Video-Card
  |
  v
[~45 Sekunden spaeter: Notification]
  |-- Toast: "Video erfolgreich gerendert!"
  |-- Video-Status: "Gerendert"
  |
  |-- Ali klickt auf Video-Card -> Quick Action "Posten"
  |
  v
[Post erstellen]
  |-- TikTok + @GenMedia auswaehlen (vorausgewaehlt)
  |-- Caption eingeben: "OMG Preisfehler! #beauty #tiktokshop"
  |-- Produkt verknuepfen: "Lidschatten Gold" (aus Produktkatalog)
  |-- Zeitpunkt: "Sofort posten"
  |-- Klick auf "Posten"
  |
  v
[Confirmation Dialog]
  |-- "Video wird auf TikTok @GenMedia gepostet. Sicher?"
  |-- Ali klickt "Ja, posten"
  |
  v
[Upload + Publishing]
  |-- Toast: "Wird auf TikTok hochgeladen..."
  |-- Toast: "Erfolgreich gepostet!"
  |-- Automatisch: Playwright startet Product-Linking im Hintergrund
  |-- Toast: "Produkt erfolgreich verknuepft!"
  |
  v
[Video-Status: "Publiziert"]
  |-- TikTok-URL gespeichert
  |-- Metriken werden ab jetzt automatisch gepollt
```

**Gesamtdauer: ~3-5 Minuten** (davon ~45 Sekunden Rendering-Wartezeit)

---

### 6.2 Flow 2: Ali vergleicht AI-Modelle

**Ziel:** Ali will wissen welches AI-Modell die besten Produktbilder generiert.

```
Start: Ali oeffnet AI Studio
  |
  v
[AI Studio > Vergleichen]
  |
  |-- 1. Prompt eingeben:
  |   "ein goldener lidschatten auf weissem marmor hintergrund"
  |
  |-- 2. Klick auf "Verbessern"
  |   AI verbessert: "Ein luxurioeser, goldener Lidschatten in elegantem
  |   Tiegel auf poliertem weissem Marmor, weiches Studiolichet von links,
  |   Bokeh-Hintergrund, Produktfotografie, 4K-Aufloesung"
  |   Ali liest, findet es gut, behaelt es
  |
  |-- 3. Modelle auswaehlen:
  |   [x] Flux 1.1 (~$0.01)         <- Schnell + guenstig
  |   [x] Seedream 3.0 (~$0.04)     <- Fotorealismus
  |   [x] Ideogram 3 (~$0.03)       <- Text in Bild
  |   Gesamtkosten: ~$0.08
  |
  |-- 4. Klick auf "Vergleich starten"
  |
  v
[Progressive Grid Loading]
  |
  |-- Flux 1.1: [Bild erscheint nach 2.1s]
  |-- Ideogram 3: [Bild erscheint nach 4.8s]
  |-- Seedream 3.0: [Bild erscheint nach 12.3s]
  |
  |-- Ali sieht alle drei Ergebnisse nebeneinander
  |-- Unter jedem: Dauer + Kosten
  |
  v
[Ali bewertet]
  |-- Ali klickt "Gewinner!" bei Seedream 3.0
  |-- System speichert Vergleich fuer ELO-Berechnung
  |
  |-- Optional: Ali klickt "Variante" bei Seedream
  |   -> Neue Generation mit gleichem Prompt, neuem Seed
  |
  |-- Ali klickt "Herunterladen" beim Gewinner-Bild
  |
  v
[Alles automatisch in Galerie gespeichert]
  |-- Prompt, Modell, Kosten, Ergebnis -- alles nachvollziehbar
```

---

### 6.3 Flow 3: Ali erstellt eine Kampagne (Multi-Video-Post)

**Ziel:** Ali plant 20 Videos fuer die naechste Woche auf mehreren Accounts.

```
Start: Ali hat 180 gerenderte Videos mit Status "Bereit"
  |
  v
[Video-Pipeline > Alle Videos]
  |-- Filter: Status "Bereit"
  |-- Ali sieht 180 Videos als Cards
  |
  |-- 1. Ali waehlt 20 Videos aus (Checkbox auf jeder Card)
  |   Batch-Toolbar erscheint: "20 Videos ausgewaehlt"
  |   [Post planen] [Archivieren] [Abwaehlen]
  |
  |-- 2. Klick auf "Post planen"
  |
  v
[Batch-Scheduling Dialog]
  |
  |-- Plattformen:
  |   [x] TikTok @GenMedia (CPL: 2/5)
  |   [x] TikTok @GenMedia2 (CPL: 0/5)
  |   [x] Instagram @genmedia_official
  |
  |-- Verteilung:
  |   "Gleichmaessig ueber 7 Tage verteilen"
  |   Start: Montag 07.04.2026
  |   Ende:  Sonntag 13.04.2026
  |   Uhrzeiten: 10:00, 14:00, 18:00 (3 pro Tag)
  |
  |-- Caption-Vorlage:
  |   "OMG ist das ein PREISFEHLER?! {produkt_name}
  |    nur {preis}!! Link in Bio
  |    #preisfehler #beauty #tiktokshop"
  |   (Variablen werden pro Video automatisch ersetzt)
  |
  |-- Product-Linking: Automatisch (pro Video richtig zugeordnet)
  |
  |-- Zusammenfassung:
  |   "20 Videos auf 3 Accounts, 7 Tage, 60 Posts gesamt"
  |   "CPL-Warnungen: @GenMedia hat nur noch 3 Shop-Slots diese Woche"
  |
  |-- 3. Klick auf "Kampagne planen"
  |
  v
[Content Calendar zeigt alle 60 geplanten Posts]
  |-- Ali sieht die Verteilung
  |-- Kann einzelne Posts per Drag & Drop verschieben
  |-- Posts werden automatisch zum geplanten Zeitpunkt veroeffentlicht
```

---

### 6.4 Flow 4: Ali checkt Performance

**Ziel:** Ali will wissen welcher Content am besten laeuft.

```
Start: Ali oeffnet die App (Morgens auf dem Handy)
  |
  v
[Dashboard]
  |-- Sofort sichtbar: Views diese Woche (54.200), Engagement (3.2%)
  |-- Trend-Pfeile zeigen: Views +12%, Engagement -0.1%
  |
  |-- Ali will mehr Details -> Klick auf "Views"-Card
  |
  v
[Social Media > Performance]
  |-- Zeitraum: "Letzte 7 Tage"
  |-- Views-Chart (Linie ueber 7 Tage)
  |-- Engagement-Chart
  |
  |-- Top-Performer nach Overlay:
  |   #1 "Ist das ein Preisfehler?" -> 2.340 avg Views
  |   #2 "OMG dieses Angebot"       -> 1.890 avg Views
  |   Ali sieht: "Preisfehler" Hook funktioniert am besten
  |
  |-- Top-Performer nach Produkt:
  |   #1 Lidschatten Gold           -> 3.100 avg Views
  |   #2 Mascara Deluxe             -> 2.200 avg Views
  |   Ali sieht: Lidschatten ist der Star
  |
  |-- Top-Performer nach Influencer-Clip:
  |   #1 Redhead Schlafzimmer       -> 2.800 avg Views
  |   #1 Redhead Kueche             -> 2.300 avg Views
  |   Ali sieht: Schlafzimmer-Setting performt besser
  |
  |-- Ali klickt auf ein spezifisches Video in der "Letzte Posts"-Liste
  |
  v
[Post-Detail (Sheet)]
  |-- Video-Thumbnail + Play
  |-- Plattform + Account
  |-- Caption
  |-- Metriken-Zeitverlauf: Views, Likes, Comments (Erste 72h)
  |-- Engagement Rate
  |-- TikTok-URL (Link zum Originalpost)
  |
  |-- Ali zurueck zum Dashboard, zufrieden mit den Insights
```

---

## 7. UX Inspirationen

### 7.1 Konkrete Pattern-Uebernahmen

| Pattern | Quelle | Wo bei MAYTT | Warum |
|---------|--------|-------------|-------|
| Two-Panel (Controls links, Preview rechts) | Freepik AI | AI Studio Explore Mode, Video Erstellen | Standard fuer kreative Tools, Ali kennt links-rechts-Layouts |
| AI Prompt Enhancement | Freepik AI | AI Studio (alle Modi) | Ali schreibt grobe Ideen, AI macht den Rest |
| 2x2 Variant Grid | Midjourney | AI Studio Ergebnisse | Gibt Ali Auswahl, ohne zu ueberfordern |
| Vary Subtle / Vary Strong | Midjourney | AI Studio "Variante erstellen" | Ein-Klick-Iteration ohne neuen Prompt |
| Progressive Grid Loading | Artificial Analysis Image Lab | AI Studio Compare Mode | Schnelle Modelle zeigen sofort Ergebnisse |
| Model Cards mit Staerken-Labels | Freepik | AI Studio Modell-Auswahl | Ali braucht keine technischen Specs |
| Inline-Editing | Leonardo Omni Editor | AI Studio Galerie-Detail (P2) | Bearbeitung ohne Kontextwechsel |
| Content Calendar | Postiz / Buffer | Social Media Planer | Visueller Standard fuer Social Media Tools |
| Status-Pipeline | Trello / Linear | Video-Pipeline Statusuebersicht | Ali sieht auf einen Blick wo seine Videos stehen |
| OAuth-Connect-Cards | Postiz | Account-Verwaltung | Grosse Plattform-Kacheln mit einem Klick |
| Cost Estimate vor Generation | Freepik, Runway | AI Studio, Render-Queue, Batch-Generator | Ali sieht VOR dem Klick was es kostet |
| Skeleton Loading | Alle modernen SaaS-Apps | Ueberall | Nie eine leere Seite -- immer visuelles Feedback |
| Global Search (Cmd+K) | Linear, Notion, Vercel | Top-Bar | Power-User-Feature fuer Burak, ignorierbar fuer Ali |

### 7.2 Anti-Patterns (was wir NICHT uebernehmen)

| Anti-Pattern | Quelle | Warum nicht |
|-------------|--------|-------------|
| Model-Overload (zu viele Optionen auf einmal) | Leonardo.ai | Ali waere von 30+ Modellen ueberfordert -- wir zeigen max 6-8 empfohlene |
| Node-Based-Workflows | Runway Workflows | Zu komplex fuer Ali, gehoert in die Admin-Toolbox |
| Chat-basierte Generation | Luma, MiniMax | Ali will klicken, nicht chatten. Chat-UI verwirrt bei komplexen Formularen |
| Timeline-Editor als Standard | Runway, Pika | Ali editiert keine Videos -- er fuellt Templates aus |
| Aggressive Upgrade-Pop-ups | Viele SaaS-Tools | Ali und Burak sind die einzigen User -- kein Upselling noetig |
| Dark-Mode-Only | Runway | Ali ist kein Developer, Light Mode ist vertrauter |
| Discord als Interface | Midjourney (frueher) | Offensichtlich nicht |

### 7.3 Referenz-URLs fuer das Entwicklerteam

| App | URL | Was anschauen |
|-----|-----|---------------|
| Freepik AI | freepik.com/ai/image-generator | Two-Panel-Layout, Model Browser, AI Enhance |
| Midjourney Web | midjourney.com | Imagine Bar, 2x2 Grid, Vary Subtle/Strong |
| Artificial Analysis | artificialanalysis.ai/image-lab | Progressive Grid, Multi-Model-Comparison |
| Buffer Calendar | buffer.com | Content Calendar UI, Account-Karten |
| Linear | linear.app | Sidebar Navigation, Status-Pipeline, Cmd+K |
| Vercel Dashboard | vercel.com/dashboard | Metriken-Cards mit Deltas, sauberes Layout |
| Canva | canva.com | Template-Auswahl, Drag & Drop, Ali-freundliche UX |

---

## 8. Edge Cases & Empty States

### 8.1 Empty States

Jede leere Seite muss Ali sagen: WAS das hier ist und WIE er anfaengt.

#### Dashboard (kein Content)

```
+--------------------------------------------------+
|                                                    |
|     [Illustration: Leere Leinwand]                |
|                                                    |
|     Willkommen bei MAYTT!                         |
|                                                    |
|     Hier siehst du bald deine Video-Statistiken   |
|     und Account-Performance.                       |
|                                                    |
|     Starte mit:                                    |
|     1. [Assets hochladen] -- Deine Video-Clips    |
|     2. [Account verbinden] -- TikTok, IG, YouTube |
|     3. [Erstes Video erstellen] -- Sofort loslegen |
|                                                    |
+--------------------------------------------------+
```

#### Video-Pipeline (keine Videos)

```
+--------------------------------------------------+
|                                                    |
|     [Illustration: Video-Filmklappe]              |
|                                                    |
|     Noch keine Videos erstellt                    |
|                                                    |
|     Kombiniere Influencer-Clips, Produkt-Clips    |
|     und Overlays zu fertigen TikTok-Videos.       |
|                                                    |
|     [Erstes Video erstellen]                      |
|     [Batch-Generator starten] (fuer viele Videos) |
|                                                    |
+--------------------------------------------------+
```

#### AI Studio Galerie (keine Generierungen)

```
+--------------------------------------------------+
|                                                    |
|     [Illustration: Zauberstab + Sterne]           |
|                                                    |
|     Noch keine Bilder generiert                   |
|                                                    |
|     Beschreibe was du sehen willst und unsere     |
|     AI erstellt es fuer dich. Probiers aus!       |
|                                                    |
|     [Jetzt ausprobieren] -> Fuehrt zu Explore-Tab |
|                                                    |
+--------------------------------------------------+
```

#### Content Calendar (keine geplanten Posts)

```
+--------------------------------------------------+
|                                                    |
|     [Illustration: Leerer Kalender]               |
|                                                    |
|     Keine Posts geplant                           |
|                                                    |
|     Plane deine Videos im Voraus und sie werden   |
|     automatisch zur richtigen Zeit gepostet.      |
|                                                    |
|     [Post planen] -> Fuehrt zu Post-Erstellen     |
|                                                    |
+--------------------------------------------------+
```

#### Assets (keine Clips)

```
+--------------------------------------------------+
|                                                    |
|     [Illustration: Leerer Ordner]                 |
|                                                    |
|     Noch keine Influencer-Clips                   |
|                                                    |
|     Lade deine Video-Clips von deinem Computer    |
|     oder aus Google Drive hoch.                    |
|                                                    |
|     [Video hochladen]                             |
|     [Aus Google Drive importieren]                |
|                                                    |
+--------------------------------------------------+
```

### 8.2 API-Error-States

#### Social-Media-API nicht erreichbar

```
+--------------------------------------------------+
|                                                    |
|  [Gelb] TikTok-Dienst gerade nicht erreichbar    |
|                                                    |
|  Posts koennen aktuell nicht veroeffentlicht       |
|  werden. Geplante Posts werden automatisch         |
|  nachgeholt sobald TikTok wieder verfuegbar ist.  |
|                                                    |
|  [Status pruefen] [Spaeter erneut versuchen]      |
|                                                    |
+--------------------------------------------------+
```

#### Fal AI nicht erreichbar

```
+--------------------------------------------------+
|                                                    |
|  [Gelb] AI-Generierung gerade nicht verfuegbar    |
|                                                    |
|  Der AI-Service ist voruebergehend nicht           |
|  erreichbar. Deine anderen Funktionen             |
|  (Videos, Social Media) funktionieren normal.      |
|                                                    |
|  [Spaeter erneut versuchen]                       |
|                                                    |
+--------------------------------------------------+
```

### 8.3 Render-Fehler

#### Einzelner Render schlaegt fehl

```
+------------------+
| [Video-Thumb]    |
| Redhead x        |
| Shampoo x Hook3  |
|                  |
| [Rot: Fehler]    |
|                  |
| Rendering fehl-  |
| geschlagen.      |
| Timeout (>5min)  |
|                  |
| [Nochmal         |
|  versuchen]      |
+------------------+
```

#### Batch-Rendering: Teilerfolg

```
+--------------------------------------------------+
|                                                    |
|  Batch-Rendering abgeschlossen                    |
|                                                    |
|  [Gruen] 142 von 144 erfolgreich gerendert       |
|  [Rot]   2 fehlgeschlagen                         |
|                                                    |
|  Fehlgeschlagene Videos:                           |
|  - Redhead-Serum-Hook3: Timeout                   |
|  - Bad-Creme-Preisfehler: Unbekannter Fehler      |
|                                                    |
|  [Fehlgeschlagene erneut rendern]                 |
|  [Ignorieren und fortfahren]                      |
|                                                    |
+--------------------------------------------------+
```

### 8.4 Onboarding-Flow (Erster Login)

**Kein langer Wizard. Stattdessen: Aufgaben-Checkliste auf dem Dashboard.**

Nach dem ersten Login sieht Ali auf dem Dashboard eine "Erste Schritte"-Card:

```
+--------------------------------------------------+
|  Erste Schritte                       [Ausblenden]|
+--------------------------------------------------+
|                                                    |
|  [x] Account erstellt                             |
|  [ ] TikTok-Account verbinden                     |
|      -> [Jetzt verbinden]                         |
|  [ ] Erste Assets hochladen                       |
|      -> [Clips hochladen]                         |
|  [ ] Erstes Video erstellen                       |
|      -> [Video erstellen]                         |
|  [ ] Erstes Video rendern                         |
|  [ ] Erstes Video veroeffentlichen                |
|                                                    |
|  Fortschritt: 1 von 6 erledigt                    |
|  [=========-----------------------------------]    |
|                                                    |
+--------------------------------------------------+
```

**Regeln:**
- Die Checkliste verschwindet automatisch nachdem alle 6 Schritte erledigt sind
- "Ausblenden"-Button erlaubt Ali, sie frueher zu entfernen
- Jeder Schritt hat einen direkten Link zur passenden Seite
- Erledigte Schritte werden automatisch abgehakt (basierend auf DB-Zustand)
- Kein blockierender Wizard -- Ali kann sofort ueberall hin navigieren

### 8.5 Rate-Limit und Quota-States

#### TikTok: Zu viele Uploads

```
+--------------------------------------------------+
|  [Gelb] Upload-Limit erreicht                     |
|                                                    |
|  Du hast heute viele Videos hochgeladen.           |
|  TikTok erlaubt ca. 600 Anfragen pro Minute.      |
|                                                    |
|  Naechster Versuch in: 00:42                      |
|  [======================-------] (Countdown)      |
|                                                    |
|  Dein Post wird automatisch erneut versucht.      |
+--------------------------------------------------+
```

#### YouTube: Tages-Quota erschoepft

```
+--------------------------------------------------+
|  [Rot] YouTube-Upload-Limit fuer heute erreicht   |
|                                                    |
|  YouTube erlaubt maximal 6 Video-Uploads pro Tag. |
|  Du hast heute bereits 6 Videos hochgeladen.       |
|                                                    |
|  Dein geplanter Upload wird automatisch morgen     |
|  frueh nachgeholt.                                 |
|                                                    |
|  [OK, verstanden]                                 |
+--------------------------------------------------+
```

#### Fal AI: Budget-Warnung

```
+--------------------------------------------------+
|  [Gelb] AI-Budget-Warnung                         |
|                                                    |
|  Du hast diesen Monat bereits $45.20 fuer AI-     |
|  Generierungen ausgegeben.                         |
|                                                    |
|  Monatliches Limit: $50.00                        |
|  Verbleibend: $4.80                               |
|                                                    |
|  [Weiter generieren] [Limit erhoehen (Admin)]    |
+--------------------------------------------------+
```

### 8.6 Offline / Verbindungsprobleme

```
+--------------------------------------------------+
|  [Banner oben, rot, volle Breite]                 |
|                                                    |
|  Keine Internetverbindung. Einige Funktionen      |
|  sind nicht verfuegbar. Aenderungen werden         |
|  gespeichert sobald du wieder online bist.         |
|                                                    |
+--------------------------------------------------+
```

---

## Anhang: Design-Token-Vorschlag

```css
/* Farben (shadcn-kompatibel, CSS Custom Properties) */
--primary: 262.1 83.3% 57.8%;       /* Violet */
--primary-foreground: 0 0% 100%;
--success: 142 76% 36%;             /* Gruen */
--warning: 38 92% 50%;              /* Gelb */
--destructive: 0 84% 60%;           /* Rot */
--info: 217 91% 60%;                /* Blau */

/* Spacing */
--space-xs: 0.25rem;   /* 4px */
--space-sm: 0.5rem;    /* 8px */
--space-md: 1rem;      /* 16px */
--space-lg: 1.5rem;    /* 24px */
--space-xl: 2rem;      /* 32px */
--space-2xl: 3rem;     /* 48px */

/* Border Radius */
--radius-sm: 0.25rem;
--radius-md: 0.5rem;
--radius-lg: 0.75rem;
--radius-full: 9999px;

/* Schatten */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);

/* Animation */
--transition-fast: 150ms;
--transition-normal: 250ms;
--transition-slow: 350ms;
```

---

## Anhang: Ali-Sprachguide

Technische Begriffe werden in Alis Sprache uebersetzt:

| Technisch | Ali sieht |
|-----------|-----------|
| Render / Rendering | "Video erstellen" oder "Video wird erstellt" |
| Queue | "Warteschlange" |
| Batch | "Mehrere auf einmal" |
| Lambda | (nie sichtbar) |
| S3 | (nie sichtbar) |
| CFG Scale | "Kreativitaet" (Slider: Wenig -> Viel) |
| Negative Prompt | "Ausschliessen" (Was soll NICHT im Bild sein?) |
| Steps | "Qualitaet" (Slider: Schnell -> Detailliert) |
| Seed | "Zufallswert" (Experten-Option, Default versteckt) |
| API Key | "Zugangscode" (nur Admin sichtbar) |
| OAuth | "Verbinden" (Ein-Klick-Vorgang) |
| Webhook | (nie sichtbar) |
| Rate Limit | "Zu viele Anfragen -- kurz warten" |
| Token expired | "Verbindung abgelaufen -- bitte neu verbinden" |
| RLS / Row Level Security | (nie sichtbar) |
| Playwright | (nie sichtbar) |
| ELO | "Bewertung" oder "Ranking" |
| Benchmark Suite | "Test-Vorlage" |
| Progressive Loading | (passiert einfach -- kein Label noetig) |
| Generation | "Erstellung" oder "Ergebnis" |
| Model | "KI-Modell" oder einfach "Modell" (mit Beispielbild) |
| Prompt | "Beschreibung" |
| Enhanced Prompt | "Verbesserte Beschreibung" |
| Collection | "Sammlung" |
| Template | "Vorlage" |
| Concurrent | (nie sichtbar -- "5 Videos gleichzeitig") |
| Combination Fingerprint | (nie sichtbar) |
| Dedup / Deduplication | "Bereits vorhanden" oder "Duplikat" |

---

**Ende des UX Design Documents.**

Naechste Schritte:
1. Review mit Ali (Verstaendlichkeits-Check auf den Wireframes)
2. Figma/Excalidraw High-Fidelity-Mockups fuer Phase 1 Seiten
3. Component Library Setup (shadcn/ui init + Custom Components)
4. Routing-Struktur in Next.js 15 anlegen
