
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, Zap, Bot, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { geminiClient } from '@/services/geminiClient';
import { abacusClient } from '@/services/abacusClient';
import { tamboClient } from '@/services/tamboClient';

const EnhancedTamboConsolePro = () => {
  const [tier, setTier] = useState('Pro');
  const [payload, setPayload] = useState('');
  const [componentId, setComponentId] = useState('');
  const [updateInstructions, setUpdateInstructions] = useState('');
  const [agent, setAgent] = useState('');
  const [diagnosticScope, setDiagnosticScope] = useState('fast');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('routeRequest');
  const [environment, setEnvironment] = useState('development');
  const [aiIntelligence, setAiIntelligence] = useState(true);
  const [intelligenceResults, setIntelligenceResults] = useState<any>(null);

  const [realtimeAnalysis, setRealtimeAnalysis] = useState<any>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // Real-time AI analysis when payload changes
  useEffect(() => {
    if (payload && payload.length > 10 && aiIntelligence && mode === 'routeRequest') {
      const delayedAnalysis = setTimeout(async () => {
        setAnalysisLoading(true);
        try {
          const analysis = await geminiClient.analyzeAndRoute({
            userTier: tier,
            environment,
            requestType: 'routing',
            payload
          });
          setRealtimeAnalysis(analysis);
        } catch (error) {
          console.error('Real-time analysis failed:', error);
          setRealtimeAnalysis(null);
        }
        setAnalysisLoading(false);
      }, 1000);

      return () => clearTimeout(delayedAnalysis);
    } else {
      setRealtimeAnalysis(null);
    }
  }, [payload, tier, environment, aiIntelligence, mode]);

  const handleSubmit = async () => {
    setLoading(true);
    setIntelligenceResults(null);
    let requestBody = {};
    let aiAnalysis = null;

    // AI-Enhanced Processing
    if (aiIntelligence) {
      try {
        switch (mode) {
          case 'routeRequest':
            aiAnalysis = await geminiClient.analyzeAndRoute({
              userTier: tier,
              environment,
              requestType: 'routing',
              payload
            });
            break;
            
          case 'componentUpdate':
            aiAnalysis = await geminiClient.analyzeComponentUpdate(
              componentId,
              updateInstructions
            );
            break;
            
          case 'agentDiagnostics':
            aiAnalysis = await geminiClient.analyzeDiagnostics(agent, diagnosticScope);
            break;
        }
        
        setIntelligenceResults(aiAnalysis);
      } catch (error) {
        console.error('AI analysis failed:', error);
      }
    }

    // Standard request processing
    switch (mode) {
      case 'routeRequest':
        requestBody = {
          tool: 'routeRequest',
          args: { 
            tier, 
            payload, 
            environment,
            ...(aiAnalysis && { aiRecommendation: aiAnalysis })
          }
        };
        break;
        
      case 'componentUpdate':
        requestBody = {
          tool: 'componentUpdate',
          args: {
            componentId,
            updateInstructions,
            author: 'admin@tambo.ai',
            environment,
            ...(aiAnalysis && { safetyAnalysis: aiAnalysis })
          }
        };
        break;
        
      case 'agentDiagnostics':
        requestBody = {
          tool: 'agentDiagnostics',
          args: {
            agent,
            scope: diagnosticScope,
            environment,
            ...(aiAnalysis && { aiInsights: aiAnalysis })
          }
        };
        break;
        
      default:
        break;
    }

    try {
      const apiUrl = environment === 'production' 
        ? 'https://api.tambo.ai/mcp/execute'
        : 'https://filesinasnap.com/api/mcp/execute';
      
      const result = await axios.post(apiUrl, requestBody);
      setResponse(result.data);
    } catch (error) {
      setResponse({ error: error.message });
    }

    setLoading(false);
  };

  const renderRealtimeAnalysis = () => {
    if (!realtimeAnalysis && !analysisLoading) return null;

    return (
      <Card className="mt-4 border-purple-200 bg-purple-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-sm">
            <Brain className="w-4 h-4 text-purple-600" />
            <span>Live AI Analysis</span>
            {analysisLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          </CardTitle>
        </CardHeader>
        
        {realtimeAnalysis && (
          <CardContent className="pt-0">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">Suggested Route:</span>
                <Badge variant="outline" className="bg-white">
                  {realtimeAnalysis.route}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Recommended Agent:</span>
                <Badge variant="outline" className="bg-white">
                  {realtimeAnalysis.agent}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Confidence:</span>
                <Badge 
                  variant={realtimeAnalysis.confidence > 0.8 ? "default" : "secondary"}
                  className="bg-white"
                >
                  {(realtimeAnalysis.confidence * 100).toFixed(0)}%
                </Badge>
              </div>
              
              {realtimeAnalysis.riskAssessment.level !== 'low' && (
                <div className="flex items-start space-x-2 mt-3 p-2 bg-amber-50 rounded border border-amber-200">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                  <div className="text-xs text-amber-800">
                    <div className="font-medium">Risk Level: {realtimeAnalysis.riskAssessment.level}</div>
                    {realtimeAnalysis.riskAssessment.concerns.length > 0 && (
                      <div className="mt-1">
                        {realtimeAnalysis.riskAssessment.concerns.map((concern: string, idx: number) => (
                          <div key={idx}>• {concern}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  const renderIntelligenceResults = () => {
    if (!intelligenceResults) return null;

    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-600" />
            <span>AI Intelligence Analysis</span>
            <Badge variant="outline" className="bg-purple-50">Gemini Enhanced</Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="analysis" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="analysis" className="space-y-4">
              {mode === 'routeRequest' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Detected Intent</Label>
                      <div className="mt-1">
                        <Badge variant="outline">{intelligenceResults.intent}</Badge>
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium">Confidence Score</Label>
                      <div className="mt-1">
                        <Badge variant={intelligenceResults.confidence > 0.8 ? "default" : "secondary"}>
                          {(intelligenceResults.confidence * 100).toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">AI Reasoning</Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded text-sm">
                      {intelligenceResults.reasoning}
                    </div>
                  </div>
                </div>
              )}
              
              {mode === 'componentUpdate' && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Label className="text-sm font-medium">Safety Assessment:</Label>
                    <Badge 
                      variant={
                        intelligenceResults.updateFeasibility === 'safe' ? 'default' :
                        intelligenceResults.updateFeasibility === 'risky' ? 'secondary' : 'destructive'
                      }
                    >
                      {intelligenceResults.updateFeasibility.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Complexity</Label>
                    <div className="mt-1">
                      <Badge variant="outline">{intelligenceResults.estimatedComplexity}</Badge>
                    </div>
                  </div>
                  
                  {intelligenceResults.securityConcerns.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-red-600">Security Concerns</Label>
                      <div className="mt-1 space-y-1">
                        {intelligenceResults.securityConcerns.map((concern: string, idx: number) => (
                          <div key={idx} className="flex items-center space-x-2 text-sm text-red-700">
                            <AlertTriangle className="w-4 h-4" />
                            <span>{concern}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {mode === 'agentDiagnostics' && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Label className="text-sm font-medium">Agent Status:</Label>
                    <Badge 
                      variant={intelligenceResults.status === 'healthy' ? 'default' : 'secondary'}
                    >
                      {intelligenceResults.status}
                    </Badge>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Key Insights</Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded text-sm">
                      {intelligenceResults.insights}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="recommendations" className="space-y-2">
              {(intelligenceResults.recommendations || intelligenceResults.suggestedChanges || []).map((rec: string, idx: number) => (
                <div key={idx} className="flex items-start space-x-2 p-2 bg-blue-50 rounded">
                  <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                  <span className="text-sm text-blue-800">{rec}</span>
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="details">
              <ScrollArea className="h-48">
                <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto">
                  {JSON.stringify(intelligenceResults, null, 2)}
                </pre>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold">🧠 TAMBO Enterprise Console</h1>
          <Badge variant="outline" className="bg-purple-50 text-purple-700">
            AI Enhanced
          </Badge>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={aiIntelligence}
              onCheckedChange={setAiIntelligence}
            />
            <Label className="text-sm">AI Intelligence</Label>
            <Brain className={`w-4 h-4 ${aiIntelligence ? 'text-purple-600' : 'text-gray-400'}`} />
          </div>
          
          <div className="flex items-center space-x-2">
            <Label htmlFor="environment-toggle" className="text-sm font-medium">
              Development
            </Label>
            <Switch
              id="environment-toggle"
              checked={environment === 'production'}
              onCheckedChange={(checked) => setEnvironment(checked ? 'production' : 'development')}
            />
            <Label htmlFor="environment-toggle" className="text-sm font-medium">
              Production
            </Label>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Enhanced Console</span>
            <span className={`px-2 py-1 rounded text-xs ${
              environment === 'production' 
                ? 'bg-red-100 text-red-700' 
                : 'bg-green-100 text-green-700'
            }`}>
              {environment.toUpperCase()}
            </span>
            {aiIntelligence && (
              <Badge variant="outline" className="bg-purple-50">
                <Brain className="w-3 h-3 mr-1" />
                Gemini AI Active
              </Badge>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium">Operation Mode</Label>
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routeRequest">🧭 Route Request</SelectItem>
                  <SelectItem value="componentUpdate">🔧 Component Update</SelectItem>
                  <SelectItem value="agentDiagnostics">🔍 Agent Diagnostics</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">User Tier</Label>
              <Select value={tier} onValueChange={setTier}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Free">Free</SelectItem>
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="Pro">Pro</SelectItem>
                  <SelectItem value="Enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={handleSubmit}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {aiIntelligence && <Brain className="w-4 h-4 mr-2" />}
                    Execute
                  </>
                )}
              </Button>
            </div>
          </div>

          {mode === 'routeRequest' && (
            <div>
              <Label className="text-sm font-medium">Request Payload</Label>
              <Textarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                placeholder="Enter the request that needs routing..."
                rows={3}
                className="mt-1"
              />
              {renderRealtimeAnalysis()}
            </div>
          )}

          {mode === 'componentUpdate' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Component ID</Label>
                <Input
                  value={componentId}
                  onChange={(e) => setComponentId(e.target.value)}
                  placeholder="e.g., navbar-component"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Update Instructions</Label>
                <Input
                  value={updateInstructions}
                  onChange={(e) => setUpdateInstructions(e.target.value)}
                  placeholder="Describe the changes needed..."
                  className="mt-1"
                />
              </div>
            </div>
          )}

          {mode === 'agentDiagnostics' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Agent Name</Label>
                <Input
                  value={agent}
                  onChange={(e) => setAgent(e.target.value)}
                  placeholder="e.g., ContentRouterAgent"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Diagnostic Scope</Label>
                <Select value={diagnosticScope} onValueChange={setDiagnosticScope}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fast">Fast Check</SelectItem>
                    <SelectItem value="comprehensive">Comprehensive</SelectItem>
                    <SelectItem value="deep">Deep Analysis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {renderIntelligenceResults()}

      {response && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-blue-600" />
              <span>API Response</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(response, null, 2)}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedTamboConsolePro;
