// Cross-Tool Search Integration
import { TamboComponent } from '../types/tambo';
import { sampleComponents } from '../tambo-config/components';

interface CrossToolResult {
  source: 'tambo' | 'figma' | 'jira' | 'github' | 'notion';
  type: 'component' | 'design' | 'ticket' | 'documentation';
  title: string;
  description: string;
  url?: string;
  metadata?: any;
  relevance: number;
}

interface SearchFilters {
  sources?: string[];
  types?: string[];
  categories?: string[];
  dateRange?: { start: Date; end: Date };
}

class CrossToolSearchEngine {
  private mcpApiUrl: string;
  private apiKey: string;
  private indexedComponents: Map<string, TamboComponent> = new Map();

  constructor() {
    this.mcpApiUrl = import.meta.env.VITE_MCP_API_URL || 'https://api.mcp.ai/v1';
    this.apiKey = import.meta.env.VITE_MCP_API_KEY || 'demo_key';
    this.buildComponentIndex();
  }

  private buildComponentIndex() {
    sampleComponents.forEach(component => {
      // Index by name
      this.indexedComponents.set(component.name.toLowerCase(), component);
      
      // Index by tags
      component.tags?.forEach(tag => {
        this.indexedComponents.set(tag.toLowerCase(), component);
      });
      
      // Index by category
      if (component.category) {
        this.indexedComponents.set(component.category.toLowerCase(), component);
      }
    });
  }

  async searchUnified(query: string, filters?: SearchFilters): Promise<CrossToolResult[]> {
    const results: CrossToolResult[] = [];

    // 1. Search Tambo components (local)
    const tamboResults = await this.searchTamboComponents(query);
    results.push(...tamboResults);

    // 2. Search external tools via MCP
    if (!filters?.sources || filters.sources.includes('figma')) {
      const figmaResults = await this.searchFigma(query);
      results.push(...figmaResults);
    }

    if (!filters?.sources || filters.sources.includes('jira')) {
      const jiraResults = await this.searchJira(query);
      results.push(...jiraResults);
    }

    if (!filters?.sources || filters.sources.includes('github')) {
      const githubResults = await this.searchGithub(query);
      results.push(...githubResults);
    }

    if (!filters?.sources || filters.sources.includes('notion')) {
      const notionResults = await this.searchNotion(query);
      results.push(...notionResults);
    }

    // 3. Sort by relevance and apply filters
    return this.filterAndRankResults(results, filters);
  }

  private async searchTamboComponents(query: string): Promise<CrossToolResult[]> {
    const results: CrossToolResult[] = [];
    const queryLower = query.toLowerCase();

    for (const [key, component] of this.indexedComponents) {
      if (key.includes(queryLower) || 
          component.description.toLowerCase().includes(queryLower)) {
        
        results.push({
          source: 'tambo',
          type: 'component',
          title: component.name,
          description: component.description,
          metadata: {
            category: component.category,
            tags: component.tags,
            props: Object.keys(component.props || {})
          },
          relevance: this.calculateRelevance(query, component)
        });
      }
    }

    return results;
  }

  private async searchFigma(query: string): Promise<CrossToolResult[]> {
    try {
      // Mock Figma API call via MCP
      const response = await fetch(`${this.mcpApiUrl}/tools/figma/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query,
          tool: 'figma',
          filters: { type: 'component' }
        })
      });

      if (!response.ok) {
        return this.getMockFigmaResults(query);
      }

      const data = await response.json();
      return data.results.map((item: any) => ({
        source: 'figma' as const,
        type: 'design' as const,
        title: item.name,
        description: item.description || 'Figma design component',
        url: item.web_url,
        metadata: {
          fileKey: item.file_key,
          nodeId: item.node_id,
          lastModified: item.last_modified
        },
        relevance: item.relevance || 0.5
      }));
    } catch (error) {
      console.warn('Figma search failed, using mock results:', error);
      return this.getMockFigmaResults(query);
    }
  }

  private async searchJira(query: string): Promise<CrossToolResult[]> {
    try {
      // Mock Jira API call via MCP
      const response = await fetch(`${this.mcpApiUrl}/tools/jira/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query,
          tool: 'jira',
          filters: { project: 'DESIGN' }
        })
      });

      if (!response.ok) {
        return this.getMockJiraResults(query);
      }

      const data = await response.json();
      return data.issues.map((issue: any) => ({
        source: 'jira' as const,
        type: 'ticket' as const,
        title: issue.summary,
        description: issue.description,
        url: issue.self,
        metadata: {
          issueType: issue.issuetype.name,
          status: issue.status.name,
          priority: issue.priority.name
        },
        relevance: 0.6
      }));
    } catch (error) {
      console.warn('Jira search failed, using mock results:', error);
      return this.getMockJiraResults(query);
    }
  }

  private async searchGithub(query: string): Promise<CrossToolResult[]> {
    try {
      // Mock GitHub API call via MCP
      const response = await fetch(`${this.mcpApiUrl}/tools/github/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: `${query} filename:*.tsx OR filename:*.ts`,
          tool: 'github'
        })
      });

      if (!response.ok) {
        return this.getMockGithubResults(query);
      }

      const data = await response.json();
      return data.items.map((item: any) => ({
        source: 'github' as const,
        type: 'component' as const,
        title: item.name,
        description: `GitHub: ${item.path}`,
        url: item.html_url,
        metadata: {
          repository: item.repository.full_name,
          language: item.language,
          lastModified: item.last_modified
        },
        relevance: 0.7
      }));
    } catch (error) {
      console.warn('GitHub search failed, using mock results:', error);
      return this.getMockGithubResults(query);
    }
  }

  private async searchNotion(query: string): Promise<CrossToolResult[]> {
    try {
      // Mock Notion API call via MCP
      const response = await fetch(`${this.mcpApiUrl}/tools/notion/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query,
          tool: 'notion',
          filters: { object: 'page' }
        })
      });

      if (!response.ok) {
        return this.getMockNotionResults(query);
      }

      const data = await response.json();
      return data.results.map((page: any) => ({
        source: 'notion' as const,
        type: 'documentation' as const,
        title: page.properties.title.title[0]?.plain_text || 'Untitled',
        description: 'Notion documentation page',
        url: page.url,
        metadata: {
          pageId: page.id,
          lastEditedTime: page.last_edited_time
        },
        relevance: 0.5
      }));
    } catch (error) {
      console.warn('Notion search failed, using mock results:', error);
      return this.getMockNotionResults(query);
    }
  }

  private calculateRelevance(query: string, component: TamboComponent): number {
    const queryLower = query.toLowerCase();
    let score = 0;

    // Exact name match
    if (component.name.toLowerCase() === queryLower) score += 1.0;
    else if (component.name.toLowerCase().includes(queryLower)) score += 0.8;

    // Description match
    if (component.description.toLowerCase().includes(queryLower)) score += 0.6;

    // Tag matches
    if (component.tags?.some(tag => tag.toLowerCase().includes(queryLower))) score += 0.4;

    // Category match
    if (component.category?.toLowerCase().includes(queryLower)) score += 0.3;

    return Math.min(score, 1.0);
  }

  private filterAndRankResults(results: CrossToolResult[], filters?: SearchFilters): CrossToolResult[] {
    let filtered = results;

    // Apply filters
    if (filters?.sources) {
      filtered = filtered.filter(result => filters.sources!.includes(result.source));
    }

    if (filters?.types) {
      filtered = filtered.filter(result => filters.types!.includes(result.type));
    }

    if (filters?.categories && filters.categories.length > 0) {
      filtered = filtered.filter(result => 
        result.metadata?.category && 
        filters.categories!.includes(result.metadata.category)
      );
    }

    // Sort by relevance
    return filtered.sort((a, b) => b.relevance - a.relevance);
  }

  // Mock data generators for demo purposes
  private getMockFigmaResults(query: string): CrossToolResult[] {
    return [
      {
        source: 'figma',
        type: 'design',
        title: `${query} Design System`,
        description: 'Figma component design file',
        url: 'https://figma.com/mock-url',
        metadata: { fileKey: 'mock-key' },
        relevance: 0.8
      }
    ];
  }

  private getMockJiraResults(query: string): CrossToolResult[] {
    return [
      {
        source: 'jira',
        type: 'ticket',
        title: `Update ${query} component`,
        description: 'Design improvement ticket',
        url: 'https://jira.mock/DESIGN-123',
        metadata: { issueType: 'Story', status: 'In Progress' },
        relevance: 0.6
      }
    ];
  }

  private getMockGithubResults(query: string): CrossToolResult[] {
    return [
      {
        source: 'github',
        type: 'component',
        title: `${query}.tsx`,
        description: 'React component implementation',
        url: 'https://github.com/mock/repo',
        metadata: { repository: 'mock/repo', language: 'TypeScript' },
        relevance: 0.7
      }
    ];
  }

  private getMockNotionResults(query: string): CrossToolResult[] {
    return [
      {
        source: 'notion',
        type: 'documentation',
        title: `${query} Documentation`,
        description: 'Component usage guide',
        url: 'https://notion.so/mock-page',
        metadata: { pageId: 'mock-id' },
        relevance: 0.5
      }
    ];
  }
}

export const crossToolSearch = new CrossToolSearchEngine();
export default CrossToolSearchEngine;
export type { CrossToolResult, SearchFilters };