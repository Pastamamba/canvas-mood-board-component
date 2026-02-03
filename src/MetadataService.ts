export interface OpenGraphData {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  type?: string;
  url?: string;
}

export class MetadataService {
  private static cache = new Map<string, OpenGraphData>();
  private static readonly maxCacheSize = 100; // Limit cache to prevent memory issues
  
  static async fetchMetadata(url: string): Promise<OpenGraphData | null> {
    // Check cache first (implements LRU behavior)
    if (this.cache.has(url)) {
      const data = this.cache.get(url) || null;
      // Move to end for LRU
      this.cache.delete(url);
      if (data) this.cache.set(url, data);
      return data;
    }

    try {
      // Since we can't directly fetch from frontend due to CORS,
      // we'll use a proxy service or implement a backend endpoint
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      
      const response = await fetch(proxyUrl);
      const data = await response.json();
      
      if (!data.contents) {
        throw new Error('No content received');
      }
      
      const html = data.contents;
      const metadata = this.parseMetadata(html);
      
      // Manage cache size (LRU eviction)
      if (this.cache.size >= this.maxCacheSize) {
        const firstKey = this.cache.keys().next().value;
        if (firstKey) {
          this.cache.delete(firstKey);
        }
      }
      
      // Cache the result
      this.cache.set(url, metadata);
      
      return metadata;
    } catch (error) {
      console.warn('Failed to fetch metadata for URL:', url, error);
      
      // Return basic metadata from URL
      const basicMetadata: OpenGraphData = {
        title: this.extractDomainName(url),
        description: url,
        url,
      };
      
      // Manage cache size before adding
      if (this.cache.size >= this.maxCacheSize) {
        const firstKey = this.cache.keys().next().value;
        if (firstKey) {
          this.cache.delete(firstKey);
        }
      }
      
      this.cache.set(url, basicMetadata);
      return basicMetadata;
    }
  }
  
  private static parseMetadata(html: string): OpenGraphData {
    const metadata: OpenGraphData = {};
    
    // Create a temporary DOM element to parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Get OpenGraph tags
    const ogTags = doc.querySelectorAll('meta[property^="og:"]');
    ogTags.forEach(tag => {
      const property = tag.getAttribute('property');
      const content = tag.getAttribute('content');
      
      if (!property || !content) return;
      
      switch (property) {
        case 'og:title':
          metadata.title = content;
          break;
        case 'og:description':
          metadata.description = content;
          break;
        case 'og:image':
          metadata.image = content;
          break;
        case 'og:site_name':
          metadata.siteName = content;
          break;
        case 'og:type':
          metadata.type = content;
          break;
        case 'og:url':
          metadata.url = content;
          break;
      }
    });
    
    // Fallback to standard meta tags if OpenGraph tags are not available
    if (!metadata.title) {
      const titleTag = doc.querySelector('title');
      metadata.title = titleTag?.textContent || undefined;
    }
    
    if (!metadata.description) {
      const descTag = doc.querySelector('meta[name="description"]');
      metadata.description = descTag?.getAttribute('content') || undefined;
    }
    
    return metadata;
  }
  
  private static extractDomainName(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return 'Link';
    }
  }
  
  static clearCache() {
    this.cache.clear();
  }
  
  static getCacheSize(): number {
    return this.cache.size;
  }
}