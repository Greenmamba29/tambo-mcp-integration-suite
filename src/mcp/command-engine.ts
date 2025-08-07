// Natural Language Command Engine - The AI Brain
import { TamboComponent } from '../types/tambo';
import { mcpSync } from './sync-pipeline';

interface CommandAnalysis {
  componentId: string;
  action: {
    type: 'MODIFY' | 'CREATE' | 'SEARCH' | 'GENERATE_DOCS';
    description: string;
    confidence: number;
  };
  targetTab: 'chat' | 'registry' | 'docs' | 'preview' | 'code';
}

interface CommandResponse {
  registry?: any;
  docs?: any;
  preview?: string;
  code?: string;
  analysis: string;
}

class NaturalLanguageCommandEngine {
  private mcpApiUrl: string;
  private apiKey: string;

  constructor() {
    this.mcpApiUrl = import.meta.env.VITE_MCP_API_URL || 'https://api.mcp.ai/v1';
    this.apiKey = import.meta.env.VITE_MCP_API_KEY || 'demo_key';
  }

  async processCommand(command: string, context?: any): Promise<CommandResponse> {
    try {
      // 1. MCP interprets natural language
      const analysis = await this.analyzeCommand(command, context);
      
      // 2. Execute action based on analysis
      const response = await this.executeAction(analysis);
      
      return response;
    } catch (error) {
      console.error('Command processing error:', error);
      return {
        analysis: `Error processing command: ${error.message}`,
        code: '// Error occurred during processing'
      };
    }
  }

  private async analyzeCommand(command: string, context?: any): Promise<CommandAnalysis> {
    // Enhanced command mapping with Tambo-specific context
    const tamboCommandPatterns = {
      // Component identification patterns
      'chat': ['chat', 'message', 'conversation', 'dialog'],
      'button': ['button', 'btn', 'click', 'action'],
      'card': ['card', 'dashboard', 'metric', 'display'],
      'user': ['user', 'profile', 'avatar', 'person'],
      'chart': ['chart', 'graph', 'data', 'visualization']
    };

    // Action identification patterns
    const actionPatterns = {
      MODIFY: ['update', 'change', 'modify', 'edit', 'improve', 'enhance'],
      CREATE: ['create', 'make', 'build', 'generate', 'new'],
      SEARCH: ['find', 'search', 'show', 'display', 'list'],
      GENERATE_DOCS: ['docs', 'documentation', 'examples', 'help']
    };

    // Smart component detection
    let componentId = 'unknown';
    let maxMatches = 0;
    
    for (const [component, keywords] of Object.entries(tamboCommandPatterns)) {
      const matches = keywords.filter(keyword => 
        command.toLowerCase().includes(keyword)
      ).length;
      
      if (matches > maxMatches) {
        maxMatches = matches;
        componentId = component;
      }
    }

    // Enhanced action detection
    let actionType: CommandAnalysis['action']['type'] = 'SEARCH';
    let actionConfidence = 0;

    for (const [action, keywords] of Object.entries(actionPatterns)) {
      const matches = keywords.filter(keyword => 
        command.toLowerCase().includes(keyword)
      ).length;
      
      if (matches > actionConfidence) {
        actionConfidence = matches;
        actionType = action as CommandAnalysis['action']['type'];
      }
    }

    // Determine target tab based on action
    const targetTab = this.determineTargetTab(actionType, command);

    return {
      componentId,
      action: {
        type: actionType,
        description: command,
        confidence: Math.min((maxMatches + actionConfidence) / 5, 1)
      },
      targetTab
    };
  }

  private determineTargetTab(actionType: CommandAnalysis['action']['type'], command: string): CommandAnalysis['targetTab'] {
    const tabKeywords = {
      registry: ['components', 'registry', 'list', 'browse'],
      docs: ['docs', 'documentation', 'help', 'examples'],
      preview: ['preview', 'show', 'demo', 'live'],
      code: ['code', 'implementation', 'source']
    };

    for (const [tab, keywords] of Object.entries(tabKeywords)) {
      if (keywords.some(keyword => command.toLowerCase().includes(keyword))) {
        return tab as CommandAnalysis['targetTab'];
      }
    }

    // Default tab based on action
    switch (actionType) {
      case 'CREATE':
      case 'MODIFY':
        return 'preview';
      case 'SEARCH':
        return 'registry';
      case 'GENERATE_DOCS':
        return 'docs';
      default:
        return 'chat';
    }
  }

  private async executeAction(analysis: CommandAnalysis): Promise<CommandResponse> {
    switch (analysis.action.type) {
      case 'MODIFY':
        return await this.handleModifyAction(analysis);
      
      case 'CREATE':
        return await this.handleCreateAction(analysis);
      
      case 'SEARCH':
        return await this.handleSearchAction(analysis);
      
      case 'GENERATE_DOCS':
        return await this.handleGenerateDocsAction(analysis);
      
      default:
        return {
          analysis: `I understand you want to ${analysis.action.description}, but I need more specific instructions.`
        };
    }
  }

  private async handleModifyAction(analysis: CommandAnalysis): Promise<CommandResponse> {
    const patch = await this.generateCodePatch(
      analysis.componentId,
      analysis.action.description
    );

    // Apply patch safely through Tambo validation
    try {
      const updatedComponent = await mcpSync.applyPatch(analysis.componentId, patch);
      
      return {
        analysis: `Updated ${analysis.componentId} component successfully`,
        code: this.generateComponentCode(updatedComponent),
        preview: this.generatePreviewHtml(updatedComponent),
        registry: updatedComponent
      };
    } catch (error) {
      return {
        analysis: `Failed to update ${analysis.componentId}: ${error.message}`,
        code: '// Update failed - validation error'
      };
    }
  }

  private async handleCreateAction(analysis: CommandAnalysis): Promise<CommandResponse> {
    const componentCode = await this.generateNewComponent(analysis.action.description);
    
    return {
      analysis: `Created new component based on: ${analysis.action.description}`,
      code: componentCode,
      preview: this.generatePreviewFromCode(componentCode)
    };
  }

  private async handleSearchAction(analysis: CommandAnalysis): Promise<CommandResponse> {
    const searchResults = await this.searchComponents(analysis.action.description);
    
    return {
      analysis: `Found ${searchResults.length} components matching: ${analysis.action.description}`,
      registry: searchResults
    };
  }

  private async handleGenerateDocsAction(analysis: CommandAnalysis): Promise<CommandResponse> {
    const docs = await this.generateDocumentation(analysis.componentId);
    
    return {
      analysis: `Generated documentation for ${analysis.componentId}`,
      docs
    };
  }

  private async generateCodePatch(componentId: string, description: string): Promise<any> {
    // Enhanced prompts for Tambo-specific modifications
    const tamboRules = [
      "Never modify /tambo-config/ directly - use tambo.applyPatch()",
      "All components must have category: [display, user, visualization, interaction]",
      "Prop types must match TypeScript definitions",
      "Include proper component descriptions for LLM understanding",
      "Maintain Tambo component registration format"
    ];

    // Generate patch using context-aware rules
    return {
      styling: this.generateStyleUpdates(description),
      props: this.generatePropUpdates(description),
      functionality: this.generateFunctionalityUpdates(description)
    };
  }

  private generateStyleUpdates(description: string): any {
    const styleKeywords = {
      'blue': 'bg-primary text-primary-foreground',
      'rounded': 'rounded-lg',
      'shadow': 'shadow-elegant',
      'accessible': 'focus:ring-2 focus:ring-primary focus:outline-none'
    };

    const styles: any = {};
    
    for (const [keyword, className] of Object.entries(styleKeywords)) {
      if (description.toLowerCase().includes(keyword)) {
        styles[keyword] = className;
      }
    }

    return styles;
  }

  private generatePropUpdates(description: string): any {
    if (description.toLowerCase().includes('loading')) {
      return {
        isLoading: {
          type: 'boolean',
          description: 'Loading state indicator',
          default: false
        }
      };
    }
    return {};
  }

  private generateFunctionalityUpdates(description: string): any {
    if (description.toLowerCase().includes('accessibility')) {
      return {
        ariaLabel: 'Enhanced accessibility',
        tabIndex: 0,
        role: 'button'
      };
    }
    return {};
  }

  private async generateNewComponent(description: string): Promise<string> {
    return `import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface GeneratedComponentProps {
  title?: string;
  description?: string;
}

export const GeneratedComponent: React.FC<GeneratedComponentProps> = ({ 
  title = "Generated Component",
  description = "Created from: ${description}" 
}) => {
  return (
    <Card className="gradient-card shadow-elegant">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            This component was generated using MCP + Tambo integration.
          </p>
          <Button variant="primary" className="w-full">
            Generated Action
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};`;
  }

  private async searchComponents(query: string): Promise<any[]> {
    // Mock search results - in real implementation, use MCP's semantic search
    return [
      { name: 'ChatInterface', relevance: 0.95 },
      { name: 'UserProfile', relevance: 0.87 },
      { name: 'DashboardCard', relevance: 0.73 }
    ];
  }

  private async generateDocumentation(componentId: string): Promise<any> {
    return {
      component: componentId,
      description: `AI-generated documentation for ${componentId}`,
      examples: [
        { name: 'Basic Usage', code: `<${componentId} />` },
        { name: 'With Props', code: `<${componentId} title="Example" />` }
      ],
      props: {
        title: { type: 'string', description: 'Component title' }
      }
    };
  }

  private generateComponentCode(component: TamboComponent): string {
    return `// ${component.name} Component\n// Generated by Tambo + MCP\n\nexport const ${component.name} = () => {\n  // Component implementation\n};`;
  }

  private generatePreviewHtml(component: TamboComponent): string {
    return `<div class="component-preview">${component.name} Preview</div>`;
  }

  private generatePreviewFromCode(code: string): string {
    return `<div class="code-preview">Preview of generated component</div>`;
  }
}

export const commandEngine = new NaturalLanguageCommandEngine();
export default NaturalLanguageCommandEngine;
