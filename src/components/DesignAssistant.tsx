import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { MessageSquare, Code, Eye, Sparkles, Brain, Cpu, Zap, Package, BookOpen, Search, RotateCcw, Shield, ShieldOff, Activity } from 'lucide-react';
import { ChatInterface } from './ChatInterface';
import { ComponentPreview } from './ComponentPreview';
import { CodeEditor } from './CodeEditor';
import { ComponentRegistry } from './ComponentRegistry';
import { TamboDocumentation } from './TamboDocumentation';
import AbacusIntegratedTamboConsole from './AbacusIntegratedTamboConsole';
import { useTamboLive } from '@/hooks/useTamboLive';
import { useMCPIntegration } from '@/hooks/useMCPIntegration';

export const DesignAssistant: React.FC = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [generatedComponent, setGeneratedComponent] = useState('');
  const [selectedComponent, setSelectedComponent] = useState<string>('');
  
  // Real Tambo API integration
  const {
    state: tamboState,
    updateComponentLive,
    searchComponentsLive,
    toggleSafeMode,
    getApiStatus
  } = useTamboLive();
  
  // MCP Integration (existing)
  const {
    sendCommand,
    searchAcrossTools,
    isLoading: mcpLoading,
    results,
    error: mcpError
  } = useMCPIntegration();

  const handleLiveUpdate = async (request: string) => {
    try {
      console.log('🎯 Processing live update request:', request);
      
      // If we have a selected component, update it directly
      if (selectedComponent) {
        const response = await updateComponentLive(selectedComponent, request);
        
        if (response.code) {
          setGeneratedComponent(response.code);
          setActiveTab('preview');
        }
        
        return response;
      } else {
        // Use MCP for general requests
        const response = await sendCommand(request, {
          currentTab: activeTab,
          tamboConnected: tamboState.isConnected,
          safeMode: tamboState.safeMode
        });
        
        if (response.code) {
          setGeneratedComponent(response.code);
        }
        
        return response;
      }
    } catch (error) {
      console.error('Live update failed:', error);
      throw error;
    }
  };

  const handleComponentSelect = (componentName: string) => {
    setSelectedComponent(componentName);
    setActiveTab('docs');
  };

  const handleLiveSearch = async (query: string) => {
    try {
      const [tamboResults, mcpResults] = await Promise.all([
        searchComponentsLive(query),
        searchAcrossTools(query)
      ]);
      
      console.log('🔍 Search results:', { tambo: tamboResults, mcp: mcpResults });
      return { tamboResults, mcpResults };
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const features = [
    {
      icon: Brain,
      title: "ABACUS.AI Integration",
      description: "Leverage advanced AI models for intelligent component generation"
    },
    {
      icon: Cpu,
      title: "MCP Protocol",
      description: "Model Context Protocol enables seamless tool integration"
    },
    {
      icon: Zap,
      title: "Tambo Framework",
      description: "React-based generative UI components for AI applications"
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="p-3 gradient-primary rounded-xl shadow-glow animate-float">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent-bright to-primary bg-clip-text text-transparent">
          Tambo Design Buddy
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          AI-powered React component designer with live Tambo API integration
        </p>
        
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          <Badge variant="secondary" className="px-3 py-1">
            <Brain className="h-3 w-3 mr-1" />
            ABACUS.AI
          </Badge>
          <Badge variant="secondary" className="px-3 py-1">
            <Cpu className="h-3 w-3 mr-1" />
            MCP Protocol
          </Badge>
          <Badge variant={tamboState.isConnected ? "default" : "destructive"} className="px-3 py-1">
            <Activity className="h-3 w-3 mr-1" />
            Tambo {tamboState.isConnected ? 'Connected' : 'Offline'}
          </Badge>
        </div>
      </div>

      {/* Live API Status & Controls */}
      <Card className="gradient-card shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Live Tambo Integration
            </CardTitle>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={tamboState.safeMode}
                  onCheckedChange={toggleSafeMode}
                />
                <span className="text-sm flex items-center gap-1">
                  {tamboState.safeMode ? <Shield className="h-3 w-3" /> : <ShieldOff className="h-3 w-3" />}
                  Safe Mode
                </span>
              </div>
              <Badge variant={tamboState.isConnected ? "default" : "destructive"}>
                {tamboState.isConnected ? '🟢 Live' : '🔴 Offline'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${tamboState.isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span>API Status: {tamboState.isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${tamboState.safeMode ? 'bg-blue-500' : 'bg-orange-500'}`} />
              <span>Mode: {tamboState.safeMode ? 'Safe (Protected)' : 'Development'}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <span>Last Update: {tamboState.lastUpdate?.toLocaleTimeString() || 'Never'}</span>
            </div>
          </div>
          {tamboState.error && (
            <div className="mt-3 p-2 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
              {tamboState.error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Interface */}
      <Card className="gradient-card shadow-elegant">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Live Design Assistant
              </CardTitle>
              <CardDescription>
                Create and modify React components with real-time Tambo API integration
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {(tamboState.isLoading || mcpLoading) && (
                <div className="flex items-center gap-2 text-primary">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span className="text-sm">Processing live update...</span>
                </div>
              )}
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleLiveSearch(selectedComponent || 'components')}
                className="h-6 w-6 p-0"
                disabled={!tamboState.isConnected}
              >
                <Search className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="mcp" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                MCP Console
              </TabsTrigger>
              <TabsTrigger value="registry" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Registry
              </TabsTrigger>
              <TabsTrigger value="docs" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Docs
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="code" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Code
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="mt-6">
              <div className="space-y-4">
                {(tamboState.error || mcpError) && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive">{tamboState.error || mcpError}</p>
                  </div>
                )}
                
                {results?.analysis && (
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <p className="text-sm text-primary">{results.analysis}</p>
                  </div>
                )}
                
                <ChatInterface 
                  onSend={handleLiveUpdate}
                  isLoading={tamboState.isLoading || mcpLoading}
                  placeholder={tamboState.isConnected ? "Describe your component update (live mode enabled)..." : "Chat with the design assistant..."}
                />
              </div>
            </TabsContent>

            <TabsContent value="mcp" className="mt-6">
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-800">ABACUS Intelligence Layer</h3>
                  </div>
                  <p className="text-sm text-blue-700">
                    Advanced MCP routing, component intelligence, and agent diagnostics powered by ABACUS AI.
                  </p>
                </div>
                <AbacusIntegratedTamboConsole />
              </div>
            </TabsContent>

            <TabsContent value="registry" className="mt-6">
              <ComponentRegistry
                onSelectComponent={handleComponentSelect}
                onModifyComponent={(name, instructions) => handleLiveUpdate(`Update ${name}: ${instructions}`)}
              />
            </TabsContent>

            <TabsContent value="docs" className="mt-6">
              <TamboDocumentation
                selectedComponent={selectedComponent}
                onUpdateComponent={(name, instructions) => handleLiveUpdate(`Update ${name}: ${instructions}`)}
              />
            </TabsContent>

            <TabsContent value="preview" className="mt-6">
              <ComponentPreview 
                componentCode={generatedComponent}
                onModify={(instructions) => handleLiveUpdate(`Modify: ${instructions}`)}
              />
            </TabsContent>

            <TabsContent value="code" className="mt-6">
              <CodeEditor
                code={generatedComponent}
                onChange={setGeneratedComponent}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Live Component Controls */}
      {selectedComponent && tamboState.isConnected && (
        <Card className="gradient-card shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5" />
              Live Update: {selectedComponent}
            </CardTitle>
            <CardDescription>
              Real-time component modifications with Tambo API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                "Add accessibility features",
                "Make responsive", 
                "Add loading states",
                "Improve styling",
                "Add animations",
                "Dark mode support"
              ].map((updateType) => (
                <Button
                  key={updateType}
                  variant="outline"
                  size="sm"
                  onClick={() => handleLiveUpdate(`${updateType} for ${selectedComponent}`)}
                  disabled={tamboState.isLoading}
                  className="transition-all hover:shadow-md"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  {updateType}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
