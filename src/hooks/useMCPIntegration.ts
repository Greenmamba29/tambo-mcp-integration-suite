// Enhanced Tambo hooks with ABACUS MCP integration
import { useState, useEffect, useCallback } from 'react';
import { commandEngine } from '../mcp/command-engine';
import { crossToolSearch, CrossToolResult } from '../mcp/cross-tool-search';
import { mcpSync } from '../mcp/sync-pipeline';
import { abacusClient } from '../services/abacusClient';

interface MCPState {
  isLoading: boolean;
  lastCommand: string;
  results: any;
  error: string | null;
}

interface MCPHookOptions {
  autoSync: boolean;
  enableCrossToolSearch: boolean;
  validateChanges: boolean;
}

export const useMCPIntegration = (options: MCPHookOptions = {
  autoSync: true,
  enableCrossToolSearch: true,
  validateChanges: true
}) => {
  const [state, setState] = useState<MCPState>({
    isLoading: false,
    lastCommand: '',
    results: null,
    error: null
  });

  // Natural language command processing with ABACUS intelligence
  const sendCommand = useCallback(async (command: string, context?: any) => {
    setState(prev => ({ ...prev, isLoading: true, error: null, lastCommand: command }));
    
    try {
      // First, try to process with ABACUS if it's a routing command
      if (command.includes('route') || command.includes('Route') || context?.payload) {
        const tier = context?.tier || 'Pro';
        const payload = context?.payload || command;
        const response = await abacusClient.routeRequest(tier, payload, context?.environment || 'development');
        setState(prev => ({ ...prev, results: response, isLoading: false }));
        return response;
      }
      
      // For component updates, use ABACUS component intelligence
      if (command.includes('component') || command.includes('Component') || context?.componentId) {
        const componentId = context?.componentId || 'unknown';
        const instructions = context?.instructions || command;
        const response = await abacusClient.componentUpdate(componentId, instructions, context?.author || 'user', context?.environment || 'development');
        setState(prev => ({ ...prev, results: response, isLoading: false }));
        return response;
      }
      
      // Fall back to traditional command engine for other operations
      const response = await commandEngine.processCommand(command, {
        ...context,
        abacusEnhanced: true,
        timestamp: new Date().toISOString()
      });
      setState(prev => ({ ...prev, results: response, isLoading: false }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      throw error;
    }
  }, []);

  // Cross-tool search with MCP
  const searchAcrossTools = useCallback(async (query: string, filters?: any) => {
    if (!options.enableCrossToolSearch) {
      throw new Error('Cross-tool search is disabled');
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const results = await crossToolSearch.searchUnified(query, filters);
      setState(prev => ({ ...prev, results: { searchResults: results }, isLoading: false }));
      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      throw error;
    }
  }, [options.enableCrossToolSearch]);

  // Component modification with validation
  const modifyComponent = useCallback(async (componentId: string, instructions: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      if (options.validateChanges) {
        // Pre-validate the change request
        const validation = await commandEngine.processCommand(
          `Validate modification for ${componentId}: ${instructions}`,
          { validationOnly: true }
        );
        
        if (!validation || validation.analysis.includes('Error')) {
          throw new Error('Invalid modification request');
        }
      }

      const response = await commandEngine.processCommand(
        `Modify ${componentId}: ${instructions}`
      );
      
      if (options.autoSync) {
        // Auto-sync changes to MCP
        await mcpSync.syncAllComponents();
      }
      
      setState(prev => ({ ...prev, results: response, isLoading: false }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Modification failed';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      throw error;
    }
  }, [options.autoSync, options.validateChanges]);

  // Component creation with MCP enhancement
  const createComponent = useCallback(async (description: string, requirements?: any) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const command = `Create component: ${description}`;
      const response = await commandEngine.processCommand(command, { requirements });
      
      if (options.autoSync && response.code) {
        // Auto-register new component
        await mcpSync.syncAllComponents();
      }
      
      setState(prev => ({ ...prev, results: response, isLoading: false }));
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Creation failed';
      setState(prev => ({ ...prev, error: errorMessage, isLoading: false }));
      throw error;
    }
  }, [options.autoSync]);

  return {
    // State
    isLoading: state.isLoading,
    results: state.results,
    error: state.error,
    lastCommand: state.lastCommand,
    
    // Actions
    sendCommand,
    searchAcrossTools,
    modifyComponent,
    createComponent,
    
    // Utilities
    clearError: () => setState(prev => ({ ...prev, error: null })),
    clearResults: () => setState(prev => ({ ...prev, results: null }))
  };
};

// Specialized hook for component management
export const useTamboComponents = () => {
  const mcp = useMCPIntegration();
  
  const updateComponent = useCallback(async (componentName: string, updateType: string) => {
    const suggestions = {
      'accessibility': 'Add ARIA labels and keyboard navigation',
      'responsive': 'Make responsive for mobile and tablet',
      'loading': 'Add loading states and error handling',
      'dark-mode': 'Add dark mode support with theme tokens',
      'animations': 'Add smooth transitions and hover effects'
    };
    
    const instruction = suggestions[updateType as keyof typeof suggestions] || updateType;
    return await mcp.modifyComponent(componentName, instruction);
  }, [mcp]);

  const findSimilarComponents = useCallback(async (componentName: string) => {
    return await mcp.searchAcrossTools(`components similar to ${componentName}`, {
      sources: ['tambo', 'figma', 'github'],
      types: ['component', 'design']
    });
  }, [mcp]);

  return {
    ...mcp,
    updateComponent,
    findSimilarComponents
  };
};

// Hook for real-time MCP synchronization
export const useMCPSync = () => {
  const [syncStatus, setSyncStatus] = useState<{
    isOnline: boolean;
    lastSync: Date | null;
    queueSize: number;
  }>({
    isOnline: false,
    lastSync: null,
    queueSize: 0
  });

  useEffect(() => {
    // Monitor MCP sync status
    const checkSyncStatus = () => {
      setSyncStatus({
        isOnline: true, // Mock status
        lastSync: new Date(),
        queueSize: 0
      });
    };

    checkSyncStatus();
    const interval = setInterval(checkSyncStatus, 30000); // Check every 30s

    return () => clearInterval(interval);
  }, []);

  const forcSync = useCallback(async () => {
    try {
      await mcpSync.syncAllComponents();
      setSyncStatus(prev => ({ ...prev, lastSync: new Date(), queueSize: 0 }));
    } catch (error) {
      console.error('Manual sync failed:', error);
      setSyncStatus(prev => ({ ...prev, isOnline: false }));
    }
  }, []);

  return {
    syncStatus,
    forcSync
  };
};