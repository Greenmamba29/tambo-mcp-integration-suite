
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Loader2, Send, Bot, User, Brain, Zap } from 'lucide-react';
import { geminiClient } from '@/services/geminiClient';
import { abacusClient } from '@/services/abacusClient';
import { tamboClient } from '@/services/tamboClient';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'tambo';
  timestamp: Date;
  metadata?: {
    agent?: string;
    route?: string;
    confidence?: number;
    intelligence_source?: 'gemini' | 'abacus' | 'tambo' | 'hybrid';
  };
}

interface IntelligenceResponse {
  message: string;
  decision?: any;
  recommendations?: string[];
  source: 'gemini' | 'abacus' | 'tambo' | 'hybrid';
}

const TamboChatWithGemini = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userTier, setUserTier] = useState('Pro');
  const [environment, setEnvironment] = useState('development');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Welcome message
    const welcomeMessage: Message = {
      id: 'welcome',
      content: `🧠 **TAMBO BUDDY with Gemini Intelligence** is online!\n\nI now combine three powerful AI layers:\n• **Gemini AI** - Advanced reasoning and decision-making\n• **ABACUS MCP** - Specialized routing intelligence\n• **TAMBO API** - Component and integration safety\n\nTry asking me about:\n• Routing decisions\n• Component updates\n• MCP integrations\n• Diagnostics and analysis\n• General TAMBO operations`,
      sender: 'tambo',
      timestamp: new Date(),
      metadata: {
        intelligence_source: 'hybrid'
      }
    };
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const processWithIntelligence = async (userMessage: string): Promise<IntelligenceResponse> => {
    try {
      // Determine the best intelligence approach based on message content
      const messageType = analyzeMessageType(userMessage);
      
      switch (messageType) {
        case 'routing_request':
          return await processRoutingRequest(userMessage);
        
        case 'component_update':
          return await processComponentUpdate(userMessage);
        
        case 'diagnostics':
          return await processDiagnostics(userMessage);
        
        case 'general_chat':
        default:
          return await processGeneralChat(userMessage);
      }
    } catch (error) {
      console.error('Intelligence processing failed:', error);
      return {
        message: "I encountered an issue processing your request. The error has been logged and our team will review it. You can try rephrasing your request or contact support if this persists.",
        source: 'tambo'
      };
    }
  };

  const analyzeMessageType = (message: string): 'routing_request' | 'component_update' | 'diagnostics' | 'general_chat' => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('route') || lowerMessage.includes('where should') || lowerMessage.includes('which agent')) {
      return 'routing_request';
    }
    
    if (lowerMessage.includes('update') || lowerMessage.includes('modify') || lowerMessage.includes('change component')) {
      return 'component_update';
    }
    
    if (lowerMessage.includes('diagnose') || lowerMessage.includes('performance') || lowerMessage.includes('health check')) {
      return 'diagnostics';
    }
    
    return 'general_chat';
  };

  const processRoutingRequest = async (message: string): Promise<IntelligenceResponse> => {
    // Use Gemini for intelligent analysis combined with ABACUS routing
    const geminiDecision = await geminiClient.analyzeAndRoute({
      userTier,
      environment,
      requestType: 'routing',
      payload: message
    });

    // Cross-validate with ABACUS for specialized MCP knowledge
    const abacusResponse = await abacusClient.routeRequest(userTier, message, environment);

    // Combine insights
    const hybridResponse = `## 🧠 Intelligent Routing Decision

**Gemini AI Analysis:**
- **Agent:** ${geminiDecision.agent}
- **Route:** ${geminiDecision.route}
- **Intent:** ${geminiDecision.intent}
- **Confidence:** ${(geminiDecision.confidence * 100).toFixed(1)}%

**Reasoning:** ${geminiDecision.reasoning}

**ABACUS MCP Validation:**
- **Agent:** ${abacusResponse.agent}
- **Route:** ${abacusResponse.route}
- **Keywords Matched:** ${abacusResponse.metadata.keywords_matched.join(', ') || 'general content'}

**Recommendations:**
${geminiDecision.recommendations.map(rec => `• ${rec}`).join('\n')}

**Risk Assessment:** ${geminiDecision.riskAssessment.level}
${geminiDecision.riskAssessment.concerns.length > 0 ? 
  `\n**Concerns:**\n${geminiDecision.riskAssessment.concerns.map(c => `⚠️ ${c}`).join('\n')}` : ''}

**Next Steps:**
${geminiDecision.nextSteps.map(step => `1. ${step}`).join('\n')}`;

    return {
      message: hybridResponse,
      decision: geminiDecision,
      recommendations: geminiDecision.recommendations,
      source: 'hybrid'
    };
  };

  const processComponentUpdate = async (message: string): Promise<IntelligenceResponse> => {
    // Extract component ID from message (simple pattern matching)
    const componentMatch = message.match(/component[:\s]+([a-zA-Z0-9-_]+)/i);
    const componentId = componentMatch ? componentMatch[1] : 'unknown-component';

    const analysis = await geminiClient.analyzeComponentUpdate(componentId, message);

    const responseMessage = `## 🔧 Component Update Analysis

**Component:** ${analysis.componentId}
**Safety Assessment:** ${analysis.updateFeasibility.toUpperCase()}

**Suggested Implementation:**
${analysis.suggestedChanges.map(change => `• ${change}`).join('\n')}

**Security Review:**
${analysis.securityConcerns.length > 0 ? 
  analysis.securityConcerns.map(concern => `🔒 ${concern}`).join('\n') : '✅ No immediate security concerns detected'}

**Implementation Plan:**
${analysis.implementationPlan.map((step, index) => `${index + 1}. ${step}`).join('\n')}

**Complexity:** ${analysis.estimatedComplexity.charAt(0).toUpperCase() + analysis.estimatedComplexity.slice(1)}

${analysis.updateFeasibility === 'dangerous' ? 
  '\n⚠️ **WARNING:** This update has been flagged as potentially dangerous. Manual review and additional security measures are required.' : ''}`;

    return {
      message: responseMessage,
      source: 'gemini'
    };
  };

  const processDiagnostics = async (message: string): Promise<IntelligenceResponse> => {
    const agentMatch = message.match(/agent[:\s]+([a-zA-Z0-9-_]+)/i);
    const agent = agentMatch ? agentMatch[1] : 'system';

    const diagnostics = await geminiClient.analyzeDiagnostics(agent, 'comprehensive');

    const responseMessage = `## 🔍 Agent Diagnostics Report

**Agent:** ${diagnostics.agent}
**Status:** ${diagnostics.status.toUpperCase()}

**Key Insights:**
${diagnostics.insights}

**Recommendations:**
${diagnostics.recommendations.map(rec => `• ${rec}`).join('\n')}

**Risk Level:** ${diagnostics.riskLevel.toUpperCase()}

${diagnostics.metrics ? `
**Performance Metrics:**
• **Performance:** ${diagnostics.metrics.performance}
• **Reliability:** ${diagnostics.metrics.reliability}  
• **Security:** ${diagnostics.metrics.security}` : ''}`;

    return {
      message: responseMessage,
      source: 'gemini'
    };
  };

  const processGeneralChat = async (message: string): Promise<IntelligenceResponse> => {
    const context = {
      userTier,
      environment,
      conversationHistory: messages.slice(-3) // Last 3 messages for context
    };

    const response = await geminiClient.processChat(message, context);

    return {
      message: response,
      source: 'gemini'
    };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const intelligenceResponse = await processWithIntelligence(inputValue);
      
      const tamboMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: intelligenceResponse.message,
        sender: 'tambo',
        timestamp: new Date(),
        metadata: {
          intelligence_source: intelligenceResponse.source,
          ...(intelligenceResponse.decision && {
            agent: intelligenceResponse.decision.agent,
            route: intelligenceResponse.decision.route,
            confidence: intelligenceResponse.decision.confidence
          })
        }
      };

      setMessages(prev => [...prev, tamboMessage]);
    } catch (error) {
      console.error('Message processing failed:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '❌ I encountered an error processing your message. Please try again or contact support if the issue persists.',
        sender: 'tambo',
        timestamp: new Date(),
        metadata: {
          intelligence_source: 'tambo'
        }
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getSourceIcon = (source?: string) => {
    switch (source) {
      case 'gemini': return <Brain className="w-4 h-4" />;
      case 'abacus': return <Zap className="w-4 h-4" />;
      case 'tambo': return <Bot className="w-4 h-4" />;
      case 'hybrid': return <div className="flex space-x-1"><Brain className="w-3 h-3" /><Zap className="w-3 h-3" /></div>;
      default: return <Bot className="w-4 h-4" />;
    }
  };

  const getSourceColor = (source?: string) => {
    switch (source) {
      case 'gemini': return 'bg-purple-100 text-purple-700';
      case 'abacus': return 'bg-blue-100 text-blue-700';
      case 'tambo': return 'bg-green-100 text-green-700';
      case 'hybrid': return 'bg-gradient-to-r from-purple-100 to-blue-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="flex flex-col h-[600px] max-w-4xl mx-auto">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Brain className="w-6 h-6 text-purple-600" />
              <span>TAMBO BUDDY with Gemini AI</span>
              <Badge variant="outline" className="bg-purple-50">
                Intelligent Decision Making
              </Badge>
            </CardTitle>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Tier: <Badge variant="outline">{userTier}</Badge></span>
              <span>Env: <Badge variant={environment === 'production' ? 'destructive' : 'default'}>{environment}</Badge></span>
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-3xl ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className="flex items-center space-x-2 mb-1">
                      {message.sender === 'user' ? (
                        <User className="w-4 h-4 text-blue-600" />
                      ) : (
                        getSourceIcon(message.metadata?.intelligence_source)
                      )}
                      
                      <span className="text-xs text-gray-500">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                      
                      {message.metadata?.intelligence_source && (
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getSourceColor(message.metadata.intelligence_source)}`}
                        >
                          {message.metadata.intelligence_source}
                        </Badge>
                      )}
                      
                      {message.metadata?.confidence && (
                        <Badge variant="outline" className="text-xs">
                          {(message.metadata.confidence * 100).toFixed(0)}% confidence
                        </Badge>
                      )}
                    </div>
                    
                    <div
                      className={`p-3 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm">
                        {message.content}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-3xl">
                    <div className="flex items-center space-x-2 mb-1">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                      <span className="text-xs text-gray-500">Processing with AI...</span>
                      <Badge variant="outline" className="text-xs bg-purple-50">
                        gemini + abacus + tambo
                      </Badge>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-100">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-gray-600">Analyzing with multiple AI layers...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <Separator />

          <div className="p-6">
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about routing, components, diagnostics, or anything TAMBO..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="px-4"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            <div className="mt-2 text-xs text-gray-500">
              Powered by Gemini AI, ABACUS MCP Intelligence, and TAMBO Safety Protocols
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TamboChatWithGemini;
