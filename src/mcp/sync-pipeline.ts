// MCP ↔ Tambo Metadata Pipeline
import { TamboComponent } from '../types/tambo';
import { sampleComponents } from '../tambo-config/components';
import { designTools } from '../tambo-config/tools';

interface MCPSyncConfig {
  apiUrl: string;
  projectId: string;
  apiKey: string;
}

interface MCPPayload {
  project_id: string;
  component_id: string;
  embeddings: number[];
  metadata: {
    category: string;
    props_schema: any;
    tags: string[];
    usage_examples: any[];
    description: string;
    framework: string;
  };
}

class MCPSyncPipeline {
  private config: MCPSyncConfig;
  private syncQueue: Map<string, TamboComponent> = new Map();
  private isProcessing = false;

  constructor(config: MCPSyncConfig) {
    this.config = config;
    this.initializeSync();
  }

  private async initializeSync() {
    // Initial sync of all components
    await this.syncAllComponents();
    
    // Set up real-time monitoring
    this.startRealTimeSync();
  }

  async syncAllComponents() {
    console.log('🔄 Starting MCP sync for all Tambo components...');
    
    for (const component of sampleComponents) {
      await this.syncComponentToMCP(component);
    }
    
    console.log('✅ MCP sync completed');
  }

  async syncComponentToMCP(component: TamboComponent): Promise<void> {
    try {
      const embeddings = await this.generateEmbeddings(component);
      
      const payload: MCPPayload = {
        project_id: this.config.projectId,
        component_id: component.name.toLowerCase(),
        embeddings,
        metadata: {
          category: component.category || 'general',
          props_schema: component.props || {},
          tags: component.tags || [],
          usage_examples: component.examples || [],
          description: component.description,
          framework: 'tambo-react'
        }
      };

      await this.sendToMCP(payload);
      console.log(`✅ Synced ${component.name} to MCP`);
    } catch (error) {
      console.error(`❌ Failed to sync ${component.name}:`, error);
    }
  }

  private async generateEmbeddings(component: TamboComponent): Promise<number[]> {
    // Create semantic text from component for embedding
    const semanticText = [
      component.name,
      component.description,
      component.category,
      ...(component.tags || []),
      JSON.stringify(component.props),
      component.examples?.map(ex => ex.name).join(' ') || ''
    ].join(' ');

    // In real implementation, use OpenAI/Anthropic embeddings API
    // For demo, return mock embeddings
    return Array.from({ length: 1536 }, () => Math.random());
  }

  private async sendToMCP(payload: MCPPayload): Promise<void> {
    const response = await fetch(`${this.config.apiUrl}/knowledge_base`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`MCP API error: ${response.statusText}`);
    }
  }

  // Real-time sync monitoring
  private startRealTimeSync() {
    // Monitor component changes and queue for sync
    const observer = new MutationObserver(() => {
      this.queueComponentsForSync();
    });

    // In real app, this would monitor file system changes
    setInterval(() => {
      this.processQueuedChanges();
    }, 5000);
  }

  private queueComponentsForSync() {
    sampleComponents.forEach(component => {
      this.syncQueue.set(component.name, component);
    });
  }

  private async processQueuedChanges() {
    if (this.isProcessing || this.syncQueue.size === 0) return;
    
    this.isProcessing = true;
    
    for (const [name, component] of this.syncQueue) {
      await this.syncComponentToMCP(component);
      this.syncQueue.delete(name);
    }
    
    this.isProcessing = false;
  }

  // Validation hooks to prevent direct /tambo-config/ modifications
  validateComponentChange(component: TamboComponent): boolean {
    const requiredFields = ['name', 'description', 'component'];
    return requiredFields.every(field => component[field as keyof TamboComponent]);
  }

  applyPatch(componentId: string, patch: any): Promise<TamboComponent> {
    // Safe component patching through Tambo validation
    return new Promise((resolve, reject) => {
      try {
        const component = sampleComponents.find(c => 
          c.name.toLowerCase() === componentId.toLowerCase()
        );
        
        if (!component) {
          reject(new Error(`Component ${componentId} not found`));
          return;
        }

        // Apply patch with validation
        const updatedComponent = { ...component, ...patch };
        
        if (!this.validateComponentChange(updatedComponent)) {
          reject(new Error('Invalid component configuration'));
          return;
        }

        // Queue for MCP sync
        this.syncQueue.set(componentId, updatedComponent);
        resolve(updatedComponent);
      } catch (error) {
        reject(error);
      }
    });
  }
}

// Export singleton instance
export const mcpSync = new MCPSyncPipeline({
  apiUrl: import.meta.env.VITE_MCP_API_URL || 'https://api.mcp.ai/v1',
  projectId: import.meta.env.VITE_TAMBO_PROJECT_ID || 'tambo_design_buddy',
  apiKey: import.meta.env.VITE_MCP_API_KEY || 'demo_key'
});

export default MCPSyncPipeline;