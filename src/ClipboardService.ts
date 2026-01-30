import { type Node } from '@xyflow/react';

export interface ClipboardHandler {
  detectContentType: (content: string) => 'url' | 'video' | 'image' | 'text';
  createNodeFromClipboard: (content: string, position: { x: number; y: number }) => Node;
}

class ClipboardService implements ClipboardHandler {
  detectContentType(content: string): 'url' | 'video' | 'image' | 'text' {
    // Clean the content
    const cleanContent = content.trim();
    
    // Check if it's a URL
    try {
      const url = new URL(cleanContent);
      const hostname = url.hostname.toLowerCase();
      const pathname = url.pathname.toLowerCase();
      
      // Video platforms
      if (hostname.includes('youtube.com') || hostname.includes('youtu.be') || 
          hostname.includes('vimeo.com') || hostname.includes('twitch.tv') ||
          pathname.endsWith('.mp4') || pathname.endsWith('.webm') || pathname.endsWith('.mov')) {
        return 'video';
      }
      
      // Image URLs
      if (pathname.endsWith('.jpg') || pathname.endsWith('.jpeg') || 
          pathname.endsWith('.png') || pathname.endsWith('.gif') || 
          pathname.endsWith('.webp') || pathname.endsWith('.svg')) {
        return 'image';
      }
      
      // Any other URL
      return 'url';
    } catch {
      // Not a valid URL, treat as text
      return 'text';
    }
  }

  createNodeFromClipboard(content: string, position: { x: number; y: number }): Node {
    const contentType = this.detectContentType(content);
    const nodeId = `${contentType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    switch (contentType) {
      case 'video':
        return {
          id: nodeId,
          type: 'videoNode',
          position,
          data: {
            url: content.trim(),
            title: this.extractTitle(content) || 'Video',
          },
        };
        
      case 'image':
        return {
          id: nodeId,
          type: 'imageNode',
          position,
          data: {
            imageUrl: content.trim(),
            caption: 'Pasted image',
          },
        };
        
      case 'url':
        return {
          id: nodeId,
          type: 'linkNode',
          position,
          data: {
            url: content.trim(),
            title: this.extractTitle(content) || 'Link',
          },
        };
        
      default: // text
        // Check if it looks like markdown
        if (this.isMarkdownContent(content)) {
          return {
            id: nodeId,
            type: 'markdownNode',
            position,
            data: {
              content: content,
              title: this.extractFirstLine(content) || 'Markdown Note',
            },
          };
        } else {
          return {
            id: nodeId,
            type: 'textNode',
            position,
            data: {
              text: content,
            },
          };
        }
    }
  }

  private extractTitle(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.replace('www.', '');
      
      // YouTube specific
      if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
        return 'YouTube Video';
      }
      
      // Vimeo specific  
      if (hostname.includes('vimeo.com')) {
        return 'Vimeo Video';
      }
      
      // Generic domain name
      return hostname.charAt(0).toUpperCase() + hostname.slice(1);
    } catch {
      return null;
    }
  }

  private extractFirstLine(content: string): string | null {
    const firstLine = content.split('\n')[0].trim();
    if (firstLine.startsWith('#')) {
      return firstLine.replace(/^#+\s*/, '');
    }
    return firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine;
  }

  private isMarkdownContent(content: string): boolean {
    // Simple heuristics to detect markdown
    const markdownPatterns = [
      /^#+\s/m,           // Headers
      /\*\*.*\*\*/,       // Bold
      /\*.*\*/,           // Italic
      /^\s*-\s/m,         // Lists
      /^\s*\*\s/m,        // Lists
      /`.*`/,             // Code
      /\[.*\]\(.*\)/,     // Links
    ];
    
    return markdownPatterns.some(pattern => pattern.test(content));
  }

  async readFromClipboard(): Promise<string | null> {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        return await navigator.clipboard.readText();
      }
      return null;
    } catch (error) {
      console.warn('Could not read from clipboard:', error);
      return null;
    }
  }

  async pasteAndCreateNode(position: { x: number; y: number }): Promise<Node | null> {
    const content = await this.readFromClipboard();
    if (!content) return null;
    
    return this.createNodeFromClipboard(content, position);
  }
}

export const clipboardService = new ClipboardService();