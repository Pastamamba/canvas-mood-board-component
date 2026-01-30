# React Flow Canvas Project

Interaktiivinen React Flow -sovellus, joka sisältää erilaisia mukautettuja node- ja edge-tyyppejä.

## Ominaisuudet

- **Custom Node Types:**
  - AnnotationNode - Selitykset ja merkinnät
  - ToolbarNode - Työkalupalkki emojivalitsimella
  - ResizerNode - Koon muutettava node
  - CircleNode - Pyöreä node
  - TextInputNode - Tekstinsyöttökomponentti

- **Custom Edge Types:**
  - ButtonEdge - Klikkattavat edget poistopainikkeella

- **Ominaisuudet:**
  - Drag & drop
  - Zoomaus ja panorointi
  - Minimap
  - Controls-palkki
  - Background-ruudukko
  - TypeScript-tuki
  - ESLint-konfigurointi
  - Tailwind CSS (valmis käyttöön)

## Käyttö

### Kehityspalvelimen käynnistys
```bash
npm run dev
```

### Build tuotantoon
```bash
npm run build
```

### ESLint-tarkistus
```bash
npm run lint
```

### Esikatselun avaaminen buildista
```bash
npm run preview
```

## Teknologiat

- React 18
- TypeScript
- @xyflow/react (React Flow)
- Vite
- ESLint
- Tailwind CSS (konfiguroitu)

## Projektisrakenne

```
src/
├── AnnotationNode.tsx      # Annotation node komponentti
├── ButtonEdge.tsx          # Custom edge klikkauspainikkeella
├── CircleNode.tsx          # Pyöreä node
├── OverviewFlow.tsx        # Pää-React Flow komponentti
├── ResizerNode.tsx         # Koon muutettava node
├── TextInputNode.tsx       # Tekstinsyöttö node
├── ToolbarNode.tsx         # Työkalupalkki node
├── initial-elements.ts     # Node- ja edge-data
├── xy-theme.css           # React Flow tyylitiedosto
├── index.css              # Globaalit tyylit
└── App.tsx                # Pääsovellus
```

Sovellus käynnistyy automaattisesti osoitteessa http://localhost:5173/
```
