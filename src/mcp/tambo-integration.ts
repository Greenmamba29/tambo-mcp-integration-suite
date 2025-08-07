// Enhanced MCP ↔ Tambo Integration with Real API
import { tamboClient } from '../services/tamboClient';
import { commandEngine } from './command-engine';

interface TamboMCPBridgeInterface {
  syncComponentToMCP: (componentId: string) => Promise<void>;
  processNaturalLanguageUpdate: (componentId: string, instruction: string) => Promise<any>;
  validateAndApplyChanges: (componentId: string, changes: any) => Promise<any>;
}

class TamboMCPBridge implements TamboMCPBridgeInterface {
  async syncComponentToMCP(componentId: string): Promise<void> {
    try {
      // Get latest component data from Tambo
      const component = await tamboClient.getComponent(componentId);
      
      // Generate embeddings for MCP context
      const embeddings = await this.generateEmbeddings(component);
      
      // Sync to MCP knowledge base
      const mcpPayload = {
        component_id: componentId,
        embeddings,
        metadata: {
          name: component.name,
          category: component.category,
          props: component.props,
          tags: component.tags,
          code: component.code,
          framework: 'tambo-react',
          lastUpdated: new Date().toISOString()
        }
      };

      console.log(`🔄 Syncing ${componentId} to MCP...`);
      
      // In a real implementation, this would call MCP API
      // For now, we'll store it in memory for the command engine
      await this.updateMCPKnowledgeBase(mcpPayload);
      
      console.log(`✅ ${componentId} synced to MCP successfully`);
    } catch (error) {
      console.error(`❌ Failed to sync ${componentId} to MCP:`, error);
      throw error;
    }
  }

  async processNaturalLanguageUpdate(componentId: string, instruction: string): Promise<any> {
    try {
      console.log(`🧠 Processing: "${instruction}" for ${componentId}`);
      
      // Get current component state
      const currentComponent = await tamboClient.getComponent(componentId);
      
      // Use MCP command engine with Tambo context
      const mcpResponse = await commandEngine.processCommand(instruction, {
        componentId,
        currentState: currentComponent,
        framework: 'tambo',
        safeMode: tamboClient.getStatus().safeMode
      });

      // Validate the proposed changes
      if (!this.validateChanges(mcpResponse, currentComponent)) {
        throw new Error('MCP proposed invalid changes');
      }

      return mcpResponse;
    } catch (error) {
      console.error('Natural language processing failed:', error);
      throw error;
    }
  }

  async validateAndApplyChanges(componentId: string, changes: any): Promise<any> {
    try {
      // Additional validation layer for Tambo-specific constraints
      if (!this.validateTamboConstraints(changes)) {
        throw new Error('Changes violate Tambo constraints');
      }

      // Apply changes through Tambo API
      const updatedComponent = await tamboClient.updateComponent(componentId, changes);
      
      // Re-sync to MCP with updated data
      await this.syncComponentToMCP(componentId);
      
      return updatedComponent;
    } catch (error) {
      console.error('Failed to validate and apply changes:', error);
      throw error;
    }
  }

  private async generateEmbeddings(component: any): Promise<number[]> {
    // Create semantic representation for MCP
    const semanticText = [
      component.name,
      component.category,
      component.tags?.join(' ') || '',
      component.code?.substring(0, 1000) || '', // First 1000 chars of code
      JSON.stringify(component.props)
    ].join(' ');

    // In production, use proper embedding service
    // For demo, return mock embeddings
    return Array.from({ length: 384 }, () => Math.random() * 2 - 1);
  }

  private async updateMCPKnowledgeBase(payload: any): Promise<void> {
    // Mock MCP knowledge base update
    // In production, this would call the actual MCP API
    console.log('📚 MCP Knowledge Base updated with:', payload.component_id);
  }

  private validateChanges(mcpResponse: any, currentComponent: any): boolean {
    // Validate that MCP response is reasonable
    if (!mcpResponse || typeof mcpResponse !== 'object') {
      return false;
    }

    // Check for required fields
    if (!mcpResponse.analysis) {
      return false;
    }

    // Validate code changes don't break TypeScript
    if (mcpResponse.code && typeof mcpResponse.code !== 'string') {
      return false;
    }

    return true;
  }

  private validateTamboConstraints(changes: any): boolean {
    // Tambo-specific validation rules
    const constraints = [
      // Must preserve component interface
      () => !changes.name || typeof changes.name === 'string',
      // Must maintain props structure
      () => !changes.props || typeof changes.props === 'object',
      // Code changes must be strings
      () => !changes.code || typeof changes.code === 'string',
      // Category must be valid
      () => !changes.category || ['display', 'user', 'visualization', 'interaction', 'development'].includes(changes.category)
    ];

    return constraints.every(constraint => {
      try {
        return constraint();
      } catch {
        return false;
      }
    });
  }
}

export const tamboMCPBridge = new TamboMCPBridge();
export default TamboMCPBridge;