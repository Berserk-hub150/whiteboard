# Whiteboard infinita

Lavagna infinita in Next.js + canvas 2D. Tutta la logica sta in `src/engine` (TypeScript puro, senza React);
la UI in `src/components` è un guscio sottile che legge lo stato tramite `useSyncExternalStore`.

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck
```

## Funzioni

- **Strumenti**: selezione, mano, penna (tratti lisci), gomma a oggetti, linea, freccia, rettangolo, ellisse, testo multilinea.
- **Selezione**: click, Shift+click, rettangolo di selezione, spostamento, ridimensionamento dagli angoli (Shift = proporzioni),
  frecce per spostare (Shift = ×10), duplica, copia/taglia/incolla, primo piano / sullo sfondo, elimina.
- **Stile**: colore (palette, recenti, selettore libero), spessore, riempimento forme, sfondo e griglia (punti/righe). Con una selezione attiva le modifiche si applicano agli elementi selezionati.
- **Camera**: pan con rotella/trackpad, Spazio+trascina, tasto destro o centrale; zoom con Ctrl+rotella/pinch ancorato al cursore; pinch e pan a due dita su touch; "adatta al contenuto".
- **Undo/redo** illimitati nella pratica (200 passi), anche per gomma, import e svuota.
- **Libreria di lavagne** salvata nel browser (localStorage): crea, apri, rinomina, duplica ed elimina lavagne dal
  pannello "Le mie lavagne", con anteprima. Ogni lavagna si salva da sola (contenuto, vista, sfondo) e si riapre
  com'era. Chi arriva dalla versione a lavagna singola trova il suo lavoro migrato in "Lavagna 1".
- **Export / import**: PNG di tutto il contenuto, JSON di una lavagna (dal menu File o dalla card in libreria).
  Importare un `.json` crea sempre una *nuova* lavagna, senza toccare quella aperta.
- **Condivisione via link**: dal menu File, "Copia link di condivisione" crea un URL che contiene l'intera lavagna
  (elementi, sfondo, griglia, nome), compressa nel fragment `#lavagna=…` — nessun server né database. Chi apre il link
  ottiene una *nuova* lavagna nella propria libreria (quella aperta non viene toccata) e il fragment viene rimosso
  dall'indirizzo, così un ricaricamento non la importa due volte. Le coordinate sono arrotondate al centesimo.
  Lavagne molto ricche generano link lunghi: oltre ~8 KB alcune app di messaggistica possono troncarli (l'app avvisa);
  oltre ~1,5 MB il link viene rifiutato e conviene l'export `.json`.
- **Interfaccia**: pannelli "vetro" chiari o scuri secondo il tema del sistema, strumenti raggruppati con tooltip e
  scorciatoie, pannello proprietà contestuale, notifiche, layout adattato a mobile e touch.
- Supporto mouse, touch e penna (Pointer Events), schermi HiDPI, ridimensionamento finestra.

## Scorciatoie

| Tasto | Azione | Tasto | Azione |
|---|---|---|---|
| V | Seleziona | Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y | Annulla / Ripeti |
| H | Mano | Ctrl+A | Seleziona tutto |
| P o B | Penna | Ctrl+C / X / V / D | Copia / Taglia / Incolla / Duplica |
| E | Gomma | Canc | Elimina selezione |
| L / A | Linea / Freccia | ] / [ | Primo piano / Sfondo |
| R / O | Rettangolo / Ellisse | 1 | Adatta al contenuto |
| T | Testo (doppio click per modificare) | Ctrl+0 / Ctrl+± | Zoom 100% / Zoom |
| Shift (mentre disegni) | Angoli a 15° / quadrato | Esc | Deseleziona / chiudi testo |

## Architettura

```
src/engine/
  types.ts       tipi (Camera, elementi, stato UI)
  geometry.ts    bounds, hit-test, trasformazioni, semplificazione tratti (RDP)
  render.ts      disegno di elementi e griglia (usato anche dall'export), LOD per lo zoom-out
  storage.ts     validazione/parsing JSON, download
  share.ts       codifica/decodifica della lavagna nell'URL (formato compatto + deflate + base64url)
  whiteboard.ts  classe Whiteboard: stato, input, strumenti, history, persistenza, export
src/hooks/useWhiteboard.ts
src/components/  WhiteBoard (composizione), Canvas, TextEditor, Toolbar, PropertiesPanel, ViewMenu, FileMenu,
                 BoardChip, BoardsDrawer, Toast, ui (design system)
```

### Dove finiscono i dati

| Chiave localStorage | Contenuto |
|---|---|
| `whiteboard:index` | elenco lavagne (id, nome, date, anteprima) e lavagna corrente |
| `whiteboard:board:<id>` | una lavagna: elementi, camera, sfondo, griglia |

localStorage ha un limite di pochi MB per sito: se si esaurisce, l'app continua a funzionare in memoria e lo segnala
sotto il nome della lavagna. In quel caso esporta in `.json` ed elimina le lavagne che non servono.

Il documento è un array di elementi **immutabili** in coordinate mondo: l'undo è uno snapshot dell'array
(condivide gli oggetti, costo trascurabile) e le cache per elemento (bounds, LOD) restano valide.
Il rendering avviene solo quando serve (`requestAnimationFrame` su richiesta), con culling sul viewport.

`@use-gesture/react` e `react-color` non sono più usati: puoi toglierli con `npm uninstall @use-gesture/react react-color`.

## Favicon e condivisione

Icone e anteprime usano le convenzioni file di Next in `src/app`: `favicon.ico`, `icon.svg`, `apple-icon.png`,
`opengraph-image.png`, `twitter-image.png`, `manifest.ts`. I meta tag (Open Graph, Twitter, theme-color) sono in `layout.tsx`.
In produzione imposta `NEXT_PUBLIC_SITE_URL` (es. `https://tuodominio.it`) per avere URL assoluti nelle anteprime.
