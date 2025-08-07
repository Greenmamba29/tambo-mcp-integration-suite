
import { useState, useCallback, useEffect } from 'react';
import { tamboClient } from '../services/tamboClient';
import { commandEngine } from '../mcp/command-engine';

interface TamboLiveState {
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  safeMode: boolean;
}

interface TamboLiveHook {
  state: TamboLiveState;
  updateComponentLive: (componentId: string, instruction: string) => Promise<any>;
  searchComponentsLive: (query: string) => Promise<any[]>;
  toggleSafeMode: () => void;
  getApiStatus: () => any;
}

export const useTamboLive = (): TamboLiveHook => {
  const [state, setState] = useState<TamboLiveState>({
    isConnected: false,
    isLoading: false,
    error: null,
    lastUpdate: null,
    safeMode: true
  });

  // Test connection on mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const status = tamboClient.getStatus();
        setState(prev => ({ 
          ...prev, 
          isConnected: true, 
          safeMode: status.safeMode 
        }));
        console.log('🔗 Tambo API connected successfully', status);
      } catch (error) {
        setState(prev => ({ 
          ...prev, 
          isConnected: false, 
          error: 'Failed to connect to Tambo API' 
        }));
        console.error('❌ Tambo API connection failed:', error);
      }
    };

    testConnection();
  }, []);

  const updateComponentLive = useCallback(async (componentId: string, instruction: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Use MCP command engine to interpret the instruction
      const mcpResponse = await commandEngine.processCommand(
        `Update component ${componentId}: ${instruction}`,
        { source: 'tambo-live', componentId }
      );

      // Extract the actual changes from MCP response
      const changes = {
        instruction,
        analysis: mcpResponse.analysis,
        code: mcpResponse.code,
        timestamp: new Date().toISOString()
      };

      // Apply changes through Tambo API with safety guards
      const updatedComponent = await tamboClient.updateComponent(componentId, changes);
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        lastUpdate: new Date() 
      }));

      console.log('🎉 Live component update successful:', updatedComponent);
      return updatedComponent;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Update failed';
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      
      console.error('💥 Live update failed:', error);
      throw error;
    }
  }, []);

  const searchComponentsLive = useCallback(async (query: string) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const results = await tamboClient.searchComponents(query);
      setState(prev => ({ ...prev, isLoading: false }));
      
      console.log(`🔍 Found ${results.length} components for query: ${query}`);
      return results;
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false, error: 'Search failed' }));
      console.error('🔍 Search failed:', error);
      return [];
    }
  }, []);

  const toggleSafeMode = useCallback(() => {
    const currentSafeMode = tamboClient.getStatus().safeMode;
    
    if (currentSafeMode) {
      tamboClient.disableSafeMode();
      setState(prev => ({ ...prev, safeMode: false }));
    } else {
      tamboClient.enableSafeMode();
      setState(prev => ({ ...prev, safeMode: true }));
    }
  }, []);

  const getApiStatus = useCallback(() => {
    return tamboClient.getStatus();
  }, []);

  return {
    state,
    updateComponentLive,
    searchComponentsLive,
    toggleSafeMode,
    getApiStatus
  };
};
