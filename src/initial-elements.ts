import type { Node, Edge } from '@xyflow/react';

export const nodes: Node[] = [
  // Welcome Text Node
  {
    id: '1',
    type: 'textNode',
    position: { x: 100, y: 100 },
    data: {
      text: 'Tervetuloa Canvas Mood Board -sovellukseen! 🎨\n\nTämä on interaktiivinen työtila ideoiden ja sisällön järjestämiseen. Voit:\n• Vetää ja pudottaa eri sisältötyyppejä\n• Yhdistää solmuja nuolilla\n• Muuttaa kokoja ja värejä\n• Tallentaa ja ladata projekteja',
      fontSize: 16,
      color: '#2563eb'
    },
    style: { width: 400, height: 200 }
  },

  // Sample Link Nodes
  {
    id: '2',
    type: 'linkNode',
    position: { x: 600, y: 50 },
    data: {
      url: 'https://github.com/xyflow/xyflow',
      title: 'React Flow GitHub',
      description: 'A highly customizable React component for building interactive graphs and node-based editors',
      favicon: 'https://github.com/favicon.ico'
    },
    style: { width: 350, height: 150 }
  },

  {
    id: '3',
    type: 'linkNode',
    position: { x: 1000, y: 100 },
    data: {
      url: 'https://reactjs.org',
      title: 'React – A JavaScript library for building user interfaces',
      description: 'React makes it painless to create interactive UIs',
      favicon: 'https://reactjs.org/favicon.ico'
    },
    style: { width: 350, height: 150 }
  },

  // Image Nodes
  {
    id: '4',
    type: 'imageNode',
    position: { x: 150, y: 350 },
    data: {
      src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
      alt: 'Creative workspace',
      caption: 'Luova työympäristö'
    },
    style: { width: 300, height: 250 }
  },

  {
    id: '5',
    type: 'imageNode',
    position: { x: 500, y: 400 },
    data: {
      src: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=300&fit=crop',
      alt: 'Design inspiration',
      caption: 'Suunnittelun inspiraatio'
    },
    style: { width: 280, height: 220 }
  },

  // Note Nodes (different colors)
  {
    id: '6',
    type: 'noteNode',
    position: { x: 850, y: 300 },
    data: {
      note: 'Muista lisätä värit ja fontit projektiin! 🎨',
      color: 'yellow'
    },
    style: { width: 200, height: 120 }
  },

  {
    id: '7',
    type: 'noteNode',
    position: { x: 1100, y: 300 },
    data: {
      note: 'Ideoita:\n• Lisää animaatiot\n• Parempi UX\n• Mobiilituki',
      color: 'blue'
    },
    style: { width: 180, height: 140 }
  },

  {
    id: '8',
    type: 'noteNode',
    position: { x: 1320, y: 250 },
    data: {
      note: 'TÄRKEÄ!\nTarkista API-avaimet ennen julkaisua 🔐',
      color: 'pink'
    },
    style: { width: 200, height: 100 }
  },

  // Document Node
  {
    id: '9',
    type: 'documentNode',
    position: { x: 100, y: 650 },
    data: {
      title: 'Projektin Dokumentaatio',
      content: 'Kattava ohjeistus canvas-sovelluksen käyttöön ja kehittämiseen',
      documentId: 'doc-001',
      categories: ['Dokumentaatio', 'Ohjeistus', 'Kehitys'],
      actors: [
        { id: 'user-1', name: 'Projektipäällikkö', avatar: '👨‍💼' },
        { id: 'user-2', name: 'UI Designer', avatar: '🎨' },
        { id: 'user-3', name: 'Kehittäjä', avatar: '👩‍💻' }
      ],
      attachments: [
        { 
          id: 'att-1', 
          name: 'wireframes.fig', 
          type: 'design', 
          url: '/files/wireframes.fig',
          thumbnail: 'https://images.unsplash.com/photo-1586717799252-bd134ad00e26?w=100&h=100&fit=crop'
        },
        { 
          id: 'att-2', 
          name: 'api-docs.pdf', 
          type: 'document', 
          url: '/files/api-docs.pdf' 
        }
      ],
      metadata: {
        createdAt: '2026-01-25',
        updatedAt: '2026-01-30',
        tags: ['canvas', 'react', 'typescript', 'mood-board']
      }
    },
    style: { width: 400, height: 350 }
  },

  // Video Nodes
  {
    id: '10',
    type: 'videoNode',
    position: { x: 600, y: 700 },
    data: {
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      title: 'React Flow Tutorial',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
    },
    style: { width: 350, height: 250 }
  },

  {
    id: '11',
    type: 'videoNode',
    position: { x: 1000, y: 650 },
    data: {
      url: 'https://vimeo.com/76979871',
      title: 'Design Inspiration Video',
      description: 'Luovan suunnittelun periaatteet'
    },
    style: { width: 320, height: 220 }
  },

  // IFrame Node
  {
    id: '12',
    type: 'iframeNode',
    position: { x: 1400, y: 500 },
    data: {
      url: 'https://www.openstreetmap.org/export/embed.html?bbox=-0.004017949104309083%2C51.47612752641776%2C0.00030577182769775396%2C51.478569861898606&layer=mapnik',
      title: 'Kartta: Lontoo',
      description: 'Interaktiivinen kartta projektikohteesta'
    },
    style: { width: 400, height: 300 }
  },

  // Markdown Node
  {
    id: '13',
    type: 'markdownNode',
    position: { x: 150, y: 1050 },
    data: {
      content: `# Projektin Tilanne 📊

## Valmistuneet ominaisuudet ✅
- [x] Drag & Drop toiminnallisuus
- [x] 9 erilaista node-tyyppiä
- [x] Koko-muutokset (NodeResizer)
- [x] JSON serialisointi
- [x] OpenGraph metadata
- [x] Leikepöytä-integraatio

## Seuraavat askeleet 🚀
1. **Käyttöliittymä parannukset**
   - Paremmat ikonit
   - Animaatiot siirtymille
   
2. **Lisäominaisuudet**
   - Ryhmittely toiminto
   - Versionhallinta
   - Yhteistyötyökalut

## Tekniset yksityiskohdat ⚙️
\`\`\`typescript
interface NodeData {
  id: string;
  type: NodeType;
  position: Position;
  data: unknown;
}
\`\`\`

> **Huomio:** Muista testata kaikki toiminnot ennen deploymenttia!`,
      theme: 'default'
    },
    style: { width: 450, height: 400 }
  },

  // Additional Creative Notes
  {
    id: '14',
    type: 'noteNode',
    position: { x: 700, y: 1000 },
    data: {
      note: '💡 Uusi idea:\nLisää ääni-muistiinpanot!',
      color: 'green'
    },
    style: { width: 200, height: 100 }
  },

  {
    id: '15',
    type: 'noteNode',
    position: { x: 950, y: 1050 },
    data: {
      note: '🎯 Tavoite:\n95% käyttäjätyytyväisyys',
      color: 'purple'
    },
    style: { width: 180, height: 100 }
  },

  // Additional Text Node with different styling
  {
    id: '16',
    type: 'textNode',
    position: { x: 1200, y: 950 },
    data: {
      text: 'Käyttäjäpalautteen yhteenveto:\n\n"Loistava työkalu ideointiin!"\n"Intuitiivinen käyttöliittymä"\n"Kaipaan lisää värivaihtoehtoja"',
      fontSize: 14,
      color: '#059669'
    },
    style: { width: 300, height: 150 }
  },

  // Sample Image Node with different styling
  {
    id: '17',
    type: 'imageNode',
    position: { x: 1450, y: 850 },
    data: {
      src: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=300&h=200&fit=crop',
      alt: 'Team collaboration',
      caption: 'Tiimityöskentely toimistolla'
    },
    style: { width: 250, height: 180 }
  }
];

export const edges: Edge[] = [
  // Connect welcome text to main features
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'button',
    animated: true,
    style: { stroke: '#2563eb' }
  },
  {
    id: 'e1-4',
    source: '1',
    target: '4',
    type: 'button',
    style: { stroke: '#059669' }
  },
  
  // Connect related nodes
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    type: 'button',
    animated: true,
    label: 'React ekosysteemi',
    style: { stroke: '#7c3aed' }
  },
  
  // Connect images
  {
    id: 'e4-5',
    source: '4',
    target: '5',
    type: 'button',
    label: 'Inspiraatio',
    style: { stroke: '#dc2626' }
  },
  
  // Connect notes to documentation
  {
    id: 'e6-9',
    source: '6',
    target: '9',
    type: 'button',
    style: { stroke: '#f59e0b' }
  },
  {
    id: 'e7-9',
    source: '7',
    target: '9',
    type: 'button',
    style: { stroke: '#3b82f6' }
  },
  
  // Connect videos
  {
    id: 'e10-11',
    source: '10',
    target: '11',
    type: 'button',
    label: 'Oppimateriaali',
    style: { stroke: '#ec4899' }
  },
  
  // Connect documentation to markdown
  {
    id: 'e9-13',
    source: '9',
    target: '13',
    type: 'button',
    animated: true,
    label: 'Projektin status',
    style: { stroke: '#06b6d4' }
  },
  
  // Connect creative notes
  {
    id: 'e14-15',
    source: '14',
    target: '15',
    type: 'button',
    style: { stroke: '#10b981' }
  },
  
  // Connect feedback to team image
  {
    id: 'e16-17',
    source: '16',
    target: '17',
    type: 'button',
    label: 'Tiimi',
    style: { stroke: '#f97316' }
  },

  // Additional connections for flow
  {
    id: 'e8-12',
    source: '8',
    target: '12',
    type: 'button',
    style: { stroke: '#ef4444' }
  },
  {
    id: 'e13-14',
    source: '13',
    target: '14',
    type: 'button',
    style: { stroke: '#8b5cf6' }
  }
];
