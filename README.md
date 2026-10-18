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
- **Salvataggio automatico** in localStorage (contenuto, vista e impostazioni).
- **Export**: PNG di tutto il contenuto, JSON (salva/apri lavagna).
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
  whiteboard.ts  classe Whiteboard: stato, input, strumenti, history, persistenza, export
src/hooks/useWhiteboard.ts
src/components/  Canvas, TextEditor, Toolbar, StylePanel, WhiteBoard
```

Il documento è un array di elementi **immutabili** in coordinate mondo: l'undo è uno snapshot dell'array
(condivide gli oggetti, costo trascurabile) e le cache per elemento (bounds, LOD) restano valide.
Il rendering avviene solo quando serve (`requestAnimationFrame` su richiesta), con culling sul viewport.

`@use-gesture/react` e `react-color` non sono più usati: puoi toglierli con `npm uninstall @use-gesture/react react-color`.
