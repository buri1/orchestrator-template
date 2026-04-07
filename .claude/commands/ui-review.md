# UI Review - Playwright Story Test Suite

Fuehre die Playwright-basierte UI-Review gegen die deployed App aus.

## Ausfuehrung
1. cd zu dem Lagerlink-Projekt: /Users/buraksmac/Desktop/code/Lagerlink Hildesheim
2. Installiere deps falls noetig: cd autarkis/apps/web && pnpm install
3. Fuehre P0 Stories aus: npx tsx e2e/lib/cli.ts run-all --priority P0
4. Bei Failures: Analysiere den HTML-Report in e2e/results/reports/
5. Mache Screenshots von gefailten Steps: e2e/results/screenshots/
6. Report summary an den User

## Erwartete Ergebnisse
- Alle P0 Stories: PASS
- HTML-Report generiert
- Screenshots pro Step als Audit Trail
