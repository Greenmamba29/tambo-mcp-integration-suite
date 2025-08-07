import React, { useState } from 'react';
import { DesignAssistant } from '@/components/DesignAssistant';
import TamboChatWithGemini from '@/components/TamboChatWithGemini';
import EnhancedTamboConsolePro from '@/components/EnhancedTamboConsolePro';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, MessageSquare, Settings, Sparkles, Zap, Bot } from 'lucide-react';
import heroImage from '@/assets/hero-tambo.jpg';

const Index = () => {
  const [activeTab, setActiveTab] = useState('chat');

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Gemini AI Intelligence",
      description: "Advanced reasoning and decision-making powered by Google Gemini"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "ABACUS MCP Integration",
      description: "Specialized routing intelligence for Model Context Protocol operations"
    },
    {
      icon: <Bot className="w-6 h-6" />,
      title: "TAMBO Safety Protocols",
      description: "Enterprise-grade safety guards and component protection"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Real-time Analysis",
      description: "Live AI analysis and recommendations as you type"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-blue-50">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-5"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center space-y-6 mb-16">
            <div className="flex justify-center space-x-2 mb-4">
              <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">
                <Brain className="w-3 h-3 mr-1" />
                Gemini AI Enhanced
              </Badge>
              <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                <Zap className="w-3 h-3 mr-1" />
                MCP Protocol Ready
              </Badge>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
              TAMBO MCP Integration Suite
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto">
              Next-generation AI-powered integration suite with Gemini intelligence, ABACUS routing, and TAMBO safety protocols for enterprise MCP operations
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <button 
                onClick={() => setActiveTab('chat')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex items-center space-x-2"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Try AI Chat</span>
              </button>
              <button 
                onClick={() => setActiveTab('console')}
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2"
              >
                <Settings className="w-5 h-5" />
                <span>Enterprise Console</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Powered by Triple AI Intelligence</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the convergence of three powerful AI systems working together for unprecedented integration capabilities
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-4 text-blue-600">
                {feature.icon}
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Interface */}
      <div className="container mx-auto px-4 pb-16">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="chat" className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>AI Chat Assistant</span>
              <Badge variant="outline" className="ml-2 bg-purple-50 text-purple-700 text-xs">
                Gemini
              </Badge>
            </TabsTrigger>
            
            <TabsTrigger value="console" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Enterprise Console</span>
              <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 text-xs">
                Enhanced
              </Badge>
            </TabsTrigger>
            
            <TabsTrigger value="designer" className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4" />
              <span>Component Designer</span>
              <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 text-xs">
                Classic
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Brain className="w-6 h-6 text-purple-600" />
                  <span>TAMBO BUDDY with Gemini AI</span>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700">
                    Intelligent Decision Making
                  </Badge>
                </CardTitle>
                <p className="text-muted-foreground">
                  Chat with your AI-powered TAMBO assistant. Ask about routing decisions, component updates, 
                  diagnostics, or any MCP integration questions. Powered by Google Gemini for advanced reasoning.
                </p>
              </CardHeader>
              <CardContent>
                <TamboChatWithGemini />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="console" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Settings className="w-6 h-6 text-blue-600" />
                  <span>Enhanced Enterprise Console</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    AI-Enhanced Operations
                  </Badge>
                </CardTitle>
                <p className="text-muted-foreground">
                  Professional-grade console for MCP operations with real-time AI analysis, safety protocols, 
                  and intelligent recommendations. Perfect for production environments.
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <EnhancedTamboConsolePro />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="designer" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Sparkles className="w-6 h-6 text-green-600" />
                  <span>Classic Design Assistant</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Component Creation
                  </Badge>
                </CardTitle>
                <p className="text-muted-foreground">
                  Create and modify React components with AI assistance. The original TAMBO design buddy 
                  for component-focused development work.
                </p>
              </CardHeader>
              <CardContent>
                <DesignAssistant />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Brain className="w-4 h-4" />
                <span>Google Gemini AI</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className="w-4 h-4" />
                <span>ABACUS MCP</span>
              </div>
              <div className="flex items-center space-x-1">
                <Bot className="w-4 h-4" />
                <span>TAMBO Framework</span>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              Powered by Triple AI Intelligence • Model Context Protocol • Enterprise Safety Guards
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
