# ModernUX – moderne Navigation für phpBB

Eine phpBB-3.3-Extension, die dem Forum eine **moderne, intuitive Navigation** als Overlay
hinzufügt – **ohne den aktiven Style zu verändern**. Entwickelt und abgestimmt auf den
Premium-Style **Prosilver (Dark Edition)**; die Akzentfarben des Styles werden über
CSS-Custom-Properties übernommen (kein neuer Look, nur bessere Bedienung).

Die Extension arbeitet als reines *progressive enhancement*: CSS/JS werden per Template-Events
(`overall_header_head_append`, `overall_footer_after`) in den aktiven Style injiziert. Ohne
JavaScript bleibt das Forum voll funktionsfähig.

## Funktionen

- **Sticky/Shrink-Header** – die Navbar bleibt beim Scrollen oben und wird kompakt; der aktive
  Menüpunkt wird hervorgehoben.
- **Mobiler Off-Canvas-Drawer** – Hamburger-Button mit eingeschobener Seitenleiste auf kleinen
  Screens, große Touch-Ziele, Fokus-Trap, Schließen per Esc/Backdrop.
- **Quick-Search-Overlay** – `Strg/⌘ + K` öffnet eine zentrale Suche, die das vorhandene
  phpBB-Suchformular wiederverwendet.
- **Scroll-to-Top + Lesefortschritt** – Zurück-nach-oben-Button und dezenter Fortschrittsbalken
  in Themen.

Barrierearm: ARIA-Attribute, vollständige Tastaturbedienung, `prefers-reduced-motion`.

## Installation

```
cd phpBB/ext/
git clone https://github.com/dbt1/modernux-style.git dbt/modernux
cd ../
php bin/phpbbcli.php extension:enable dbt/modernux
php bin/phpbbcli.php cache:purge
```

## Aktivierung / Rollout

Die Extension ist nach dem Enable installiert, aber standardmäßig **nur als Opt-in-Vorschau**
aktiv, damit sie auf einem Live-Forum gefahrlos getestet werden kann:

| Modus | Wie | Wirkung |
|-------|-----|---------|
| Opt-in-Test | `…/?modernux=1` aufrufen (`?modernux=0` deaktiviert wieder) | Nur dieser Browser sieht ModernUX (per Cookie). |
| Go-Live | `php bin/phpbbcli.php config:set modernux_force_all 1` + Cache purge | Alle Besucher sehen ModernUX. |

Rollback: `config:set modernux_force_all 0`, oder `extension:disable dbt/modernux`, oder
`extension:purge dbt/modernux` (entfernt auch die Config-Zeile).

## Kompatibilität

phpBB `>= 3.3.0, < 4.0.0`, PHP `>= 7.2`. Getestet auf phpBB 3.3.16 mit prosilver / Prosilver
Dark Edition.

## Lizenz

[GPL-2.0-only](LICENSE)
