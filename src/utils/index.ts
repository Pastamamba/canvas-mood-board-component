import type { OpenGraphData } from '../types';

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

export const distance = (p1: { x: number; y: number }, p2: { x: number; y: number }): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

export const isPointInRect = (
  point: { x: number; y: number },
  rect: { x: number; y: number; width: number; height: number }
): boolean => {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
};

export const getYouTubeVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
};

export const getVimeoVideoId = (url: string): string | null => {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
};

export const getYouTubeThumbnail = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
};

export const getYouTubeEmbedUrl = (videoId: string): string => {
  return `https://www.youtube.com/embed/${videoId}`;
};

export const getVimeoEmbedUrl = (videoId: string): string => {
  return `https://player.vimeo.com/video/${videoId}`;
};

export const isValidUrl = (string: string): boolean => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

export const detectContentType = (content: string): 'url' | 'text' => {
  const urlPattern = /^https?:\/\/[^\s]+$/;
  return urlPattern.test(content.trim()) ? 'url' : 'text';
};

// Mock function for OpenGraph scraping (you would implement this with a real API)
export const fetchOpenGraphData = async (url: string): Promise<OpenGraphData> => {
  // In a real implementation, you would use a service like:
  // - Your own backend endpoint
  // - A third-party service like Unfurl or LinkPreview
  
  // For now, we'll return mock data based on the domain
  const domain = new URL(url).hostname;
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        title: `Content from ${domain}`,
        description: `This is a preview of content from ${domain}. In a real implementation, this would be fetched from the actual page.`,
        image: `https://via.placeholder.com/300x200?text=${encodeURIComponent(domain)}`,
        siteName: domain,
        url: url,
      });
    }, 1000);
  });
};

export const downloadCanvasAsJSON = (data: any, filename: string = 'canvas-export.json'): void => {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

export const uploadJSONFile = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          resolve(data);
        } catch (error) {
          reject(new Error('Invalid JSON file'));
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  });
};

export const generateNodeId = (): string => {
  return `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateConnectionId = (): string => {
  return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};