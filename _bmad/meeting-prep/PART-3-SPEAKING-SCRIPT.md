# Part 3: Technische Architektur — Sprechskript

**Dauer:** ca. 3-4 Minuten
**Kontext:** Nach der Live-Demo. Uebergang von "was Sie gesehen haben" zu "wie es gebaut ist."
**Ton:** Selbstbewusst, sachlich, technisch aber zugaenglich. Kein Sales-Sprech.

---

## Ueberleitung (10 Sek.)

> Ich moechte Ihnen jetzt kurz zeigen, was unter der Haube steckt -- also die Architektur, die das moeglich macht, was Sie gerade gesehen haben. Fuenf Punkte, jeder davon ein Designprinzip, das langfristig Geld spart.

---

## 1. Modularitaet: Baukastensystem (60 Sek.)

> **Unsere Architektur ist ein Baukastensystem.**

> Sie haben gerade fuenf Portale gesehen -- HiArbeit, HiEngagement, HiGruendung, Quartiere, Wissenstransfer. Aber unter der Haube ist das EINE Anwendung. Eine Navigation. Eine Suchfunktion. Eine Matching-Engine. Eine Karte.

> Konkret: Es gibt ueber 90 gemeinsam genutzte Komponenten. Die Matching-Engine, die in HiEngagement passende Ehrenamts-Angebote findet, ist exakt dieselbe Engine, die in HiArbeit Talente mit Stellen abgleicht. Derselbe Algorithmus, dieselben erklaerbaren Match-Cards -- angepasst per Konfiguration, nicht per Copy-Paste.

*[Optional: auf Demo verweisen]* > Sie haben die farbigen Kreise gesehen -- Orange fuer Wirtschaft, Gruen fuer Engagement, Teal fuer Quartiere. Das sind keine separaten Designs. Das ist ein einziges Farbsystem mit Portal-Tokens. In der CSS-Datei stehen sechs Zeilen pro Portal -- Primaerfarbe und Akzentfarbe. Mehr nicht.

> Was heisst das praktisch? **Wenn die Stadt ein sechstes Portal braucht -- zum Beispiel Gesundheit -- dann ist das Konfiguration, nicht Neuentwicklung.** Sechs Zeilen Farbdefinition, ein Eintrag in der Portal-Registry, und alle bestehenden Komponenten -- Suche, Karte, Matching, Feed, Navigation -- funktionieren sofort.

> Und umgekehrt: Wenn ein Portal wegfaellt, aendert sich fuer die anderen nichts. Kein Dominoeffekt. Kein Umbau.

---

## 2. API-Wrapper fuer externe Systeme (30 Sek.)

> Zum Thema externe Anbindungen -- in der Leistungsbeschreibung steht, dass zum Beispiel das HAZ-Jobportal oder die Bundesagentur fuer Arbeit integriert werden sollen. Unser Ansatz dafuer ist das, was wir "Elevation Pattern" nennen.

> Statt eines Links oder eines iFrames bauen wir einen API-Wrapper. Die externen Stellenangebote erscheinen in OmniPort in der gleichen Kartenoptik, mit den gleichen Filtern, mit der gleichen Suche. Der Nutzer merkt keinen Bruch. Ob die Stelle aus unserer Plattform kommt oder von der Bundesagentur -- die Erfahrung ist einheitlich.

*[Auf Demo verweisen]* > Das haben Sie vorhin in HiArbeit gesehen: Stellenangebote von Computacenter, der Sparkasse, dem Landkreis -- alle nativ eingebettet, nicht verlinkt.

---

## 3. Sicherheit auf Datenbankebene: Row-Level Security (45 Sek.)

> Jetzt zum Thema Datenschutz -- und das ist ein Punkt, den ich bewusst technisch mache, weil er wichtig ist.

> Wir setzen Row-Level Security ein. Das bedeutet: Die Zugriffsregeln sitzen nicht im Anwendungscode, sondern direkt in der Datenbank. PostgreSQL prueft bei JEDER Abfrage, ob der anfragende Nutzer diese Zeile sehen oder aendern darf. Egal ob die Anfrage vom Browser kommt, von einer API, oder von einem Admin-Tool.

> Warum ist das besser als die uebliche Loesung? Bei den meisten Plattformen schreibt der Entwickler IF-Abfragen in den Anwendungscode: "Wenn Nutzer X, dann zeige Y." Wenn jemand eine Abfrage vergisst -- Datenleck. Bei Row-Level Security kann das nicht passieren. Die Datenbank ist die letzte Verteidigungslinie, nicht der Anwendungscode.

> Praktisch: Ein Arbeitgeber im Talentpool sieht nur die Profile, die fuer seine Branche freigeschaltet sind. Ein Quartiersmanager sieht nur sein Quartier. Ein anonymer Besucher sieht nur oeffentliche Inhalte. Alles durchgesetzt auf Datenbankebene.

> Das ist kein Experiment -- PostgreSQL, Supabase und jede grosse Bankenanwendung nutzen dieses Muster. Wir uebernehmen es fuer kommunale Daten.

---

## 4. Barrierefreiheit: BITV 2.0 (40 Sek.)

> Barrierefreiheit ist bei uns kein Nachgedanke -- es ist in die Architektur eingebaut.

> Wir nutzen shadcn/ui und Radix UI. Das sind Komponentenbibliotheken, die WCAG-Konformitaet als Designprinzip haben. Jedes Eingabefeld, jeder Dialog, jede Navigation kommt mit eingebauter Tastatursteuerung, ARIA-Labels und Screenreader-Unterstuetzung.

*[Auf Demo verweisen]* > Sie haben vorhin das Barrierefreiheits-Werkzeug gesehen -- Schriftgroesse, hoher Kontrast, Leichte Sprache. Das ist nicht nur ein Schalter fuer die Optik. Die Barrierefreiheitserklaerung auf der Seite ist eine echte, rechtskonforme BITV-2.0-Erklaerung mit Kontaktformular und Beschwerdeweg.

> Und die Portalfarben -- Orange, Gruen, Teal -- sind nicht zufaellig. Jede Farbe ist auf WCAG-AA-Kontrastverhaealtnis geprueft: mindestens 4,5 zu 1 fuer Fliesstext, 3 zu 1 fuer UI-Elemente. Und wir nutzen Farbe niemals allein als Informationstraeger -- immer zusammen mit Text oder Icons.

---

## 5. Authentifizierung und BundID (30 Sek.)

> Zur Authentifizierung: OmniPort hat ein dreistufiges Modell. Anonym browsen -- ohne Konto. Registriert -- fuer Aktionen wie Bewerben oder Posten. Und BundID-verifiziert -- fuer Dienste wie die Leihothek, wo Identitaet rechtlich relevant ist.

> Wichtig: Wir speichern keine eigenen Passwoerter. Supabase Auth uebernimmt die Identitaetsverwaltung mit OAuth-Standards. Und BundID ist als foederierter Identitaetsanbieter vorgesehen -- die Stadt gibt den Standard vor, wir binden ihn ein. Keine eigene Passwortverwaltung, kein eigenes Identitaetssilo.

> Das Soft-Gate-Muster, das Sie in der Demo gesehen haben -- dieses dezente Overlay bei "Anmeldung erforderlich" -- ist ein bewusstes UX-Design. Der Nutzer verliert seinen Kontext nicht. Er wird nicht auf eine Login-Seite umgeleitet und muss danach suchen, wo er war.

---

## 6. Vendor-Lock-in: Null (30 Sek.)

> Letzter Punkt, und der ist mir persoenlich wichtig: **Kein Vendor-Lock-in. Auf keiner Ebene.**

> Die gesamte Plattform ist Standard-Technologie: Next.js -- das meistgenutzte Web-Framework weltweit. PostgreSQL -- die am weitesten verbreitete relationale Open-Source-Datenbank. TypeScript. React.

> Was heisst das konkret? Jeder React-Entwickler auf dem Markt kann diesen Code lesen, verstehen und weiterentwickeln. Kein proprietaeres Framework, kein Spezialwissen noetig. Und Supabase ist Open Source und self-hostable -- falls die Stadt es vorzieht, die gesamte Infrastruktur auf eigene Server zu migrieren, ist das technisch moeglich.

> Das deployte Produkt hat null Abhaengigkeit von irgendwelchen KI-Diensten. Es ist reines Web -- HTML, CSS, JavaScript, PostgreSQL. Standard. Wartbar. Zukunftssicher.

---

## Abschluss (10 Sek.)

> Das sind die sechs Prinzipien: Modulare Shared Components, API-Wrapper statt Links, Row-Level Security, BITV-2.0-konforme Barrierefreiheit, foederierte Authentifizierung, und null Vendor-Lock-in. Jedes davon spart der Stadt langfristig Geld und gibt ihr die Kontrolle ueber ihre eigene Plattform.

---

## Spickzettel: Technische Begriffe in zugaenglicher Sprache

| Fachbegriff | Zugaengliche Erklaerung (falls noetig) |
|---|---|
| Row-Level Security | "Die Datenbank entscheidet pro Zeile, wer was sehen darf" |
| Shared Components | "Einmal gebaute Bausteine, die in allen Portalen funktionieren" |
| API-Wrapper | "Externe Daten werden so eingebettet, als waeren sie unsere eigenen" |
| Portal-Tokens | "Sechs Zeilen CSS pro Portal -- Farbe rein, fertig" |
| Soft-Gate | "Login-Aufforderung als Overlay, nicht als Seitenumleitung" |
| BundID | "Elektronischer Personalausweis fuer digitale Behoerdendienste" |
| WCAG AA / BITV 2.0 | "Gesetzlicher Standard fuer barrierefreie Websites" |
| Self-hostable | "Kann auf eigenen Servern der Stadt laufen, wenn gewuenscht" |
