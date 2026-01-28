import React, { useEffect, memo } from 'react';
import { 
  MousePointer, 
  Link, 
  Plus, 
  Download, 
  Upload, 
  FileText,
  Video,
  Paintbrush,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import useCanvasStore from '../store/canvasStore';
import { downloadCanvasAsJSON, uploadJSONFile } from '../utils';

const Toolbar: React.FC = () => {
  const {
    mode,
    setMode,
    addNode,
    exportState,
    importState,
    nodes,
  } = useCanvasStore();

  // Load example data on first load
  useEffect(() => {
    if (nodes.length === 0) {
      loadExampleData();
    }
  }, []);

  const loadExampleData = async () => {
    try {
      const response = await fetch('/example-canvas-data.json');
      const exampleData = await response.json();
      importState(exampleData);
    } catch (error) {
      console.log('Could not load example data:', error);
    }
  };

    const handleAddNode = (nodeType: 'document' | 'link' | 'video' | 'sketch' | 'text') => {
    const position = {
      x: 100 + nodes.length * 20,
      y: 100 + nodes.length * 20,
    };

    switch (nodeType) {
      case 'document':
        addNode({
          type: 'document',
          position,
          width: 300,
          height: 200,
          data: {
            title: 'New Document',
            content: '',
            categories: [],
            actors: [],
            attachments: [],
          },
        });
        break;

      case 'link':
        addNode({
          type: 'link',
          position,
          width: 250,
          height: 150,
          data: {
            url: '',
          },
        });
        break;

      case 'video':
        addNode({
          type: 'video',
          position,
          width: 320,
          height: 240,
          data: {
            url: '',
            embedType: 'youtube',
          },
        });
        break;

      case 'sketch':
        addNode({
          type: 'sketch',
          position,
          width: 300,
          height: 250,
          data: {
            strokes: [],
          },
        });
        break;

      case 'text':
        addNode({
          type: 'text',
          position,
          width: 250,
          height: 150,
          data: {
            content: 'New text note...',
            isMarkdown: false,
          },
        });
        break;
    }
  };

  const handleExport = () => {
    const state = exportState();
    downloadCanvasAsJSON(state, 'canvas-export.json');
  };

  const handleImport = async () => {
    try {
      const data = await uploadJSONFile();
      importState(data);
    } catch (error) {
      console.error('Failed to import file:', error);
      alert('Failed to import file. Please check if it\'s a valid JSON file.');
    }
  };

  return (
    <div className="toolbar">
      {/* Mode Selection */}
      <div style={{ display: 'flex', gap: '4px', marginRight: '12px' }}>
        <button
          className={mode === 'select' ? 'active' : ''}
          onClick={() => setMode('select')}
          title="Select Mode (S)"
        >
          <MousePointer size={16} />
        </button>
        
        <button
          className={mode === 'connect' ? 'active' : ''}
          onClick={() => setMode('connect')}
          title="Connect Mode (C)"
        >
          <Link size={16} />
        </button>
      </div>

      {/* Add Node Buttons */}
      <div style={{ display: 'flex', gap: '4px', marginRight: '12px' }}>
        <button
          onClick={() => handleAddNode('document')}
          title="Add Document Node"
        >
          <Plus size={14} />
          Doc
        </button>
        
        <button
          onClick={() => handleAddNode('text')}
          title="Add Text Node"
        >
          <FileText size={14} />
          Text
        </button>
        
        <button
          onClick={() => handleAddNode('link')}
          title="Add Link Node"
        >
          <ExternalLink size={14} />
          Link
        </button>
        
        <button
          onClick={() => handleAddNode('video')}
          title="Add Video Node"
        >
          <Video size={14} />
          Video
        </button>
        
        <button
          onClick={() => handleAddNode('sketch')}
          title="Add Sketch Node"
        >
          <Paintbrush size={14} />
          Sketch
        </button>
      </div>

      {/* Import/Export */}
      <div style={{ display: 'flex', gap: '4px' }}>
        <button
          onClick={loadExampleData}
          title="Load Example Data"
        >
          <RotateCcw size={14} />
          Example
        </button>
        
        <button
          onClick={handleExport}
          title="Export Canvas (Ctrl+E)"
        >
          <Download size={14} />
          Export
        </button>
        
        <button
          onClick={handleImport}
          title="Import Canvas"
        >
          <Upload size={14} />
          Import
        </button>
      </div>
    </div>
  );
};

export default memo(Toolbar);