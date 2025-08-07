
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
import { abacusClient } from '@/services/abacusClient';
import { Brain, Zap, Activity, Settings, History, ChevronRight } from 'lucide-react';

const AbacusIntegratedTamboConsole = () => {
  // Core state
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

  // ABACUS integration state
  const [abacusHistory, setAbacusHistory] = useState([]);
  const [abacusStatus, setAbacusStatus] = useState('ready');
  const [processingMetrics, setProcessingMetrics] = useState({
    totalRequests: 0,
    averageResponseTime: 0,
    successRate: 100
  });

  // Update history from ABACUS client
  useEffect(() => {
    const updateHistory = () => {
      const history = abacusClient.getConversationHistory();
      setAbacusHistory(history);
      
      // Update metrics
      if (history.length > 0) {
        const avgTime = history.reduce((sum, item) => 
          sum + (item.response?.metadata?.processing_time_ms || 0), 0) / history.length;
        
        setProcessingMetrics({
          totalRequests: history.length,
          averageResponseTime: Math.round(avgTime),
          successRate: Math.round((history.filter(h => !h.response?.error).length / history.length) * 100)
        });
      }
    };

    updateHistory();
    const interval = setInterval(updateHistory, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setAbacusStatus('processing');
    let result = null;

    try {
      switch (mode) {
        case 'routeRequest':
          result = await abacusClient.routeRequest(tier, payload, environment);
          break;
        case 'componentUpdate':
          result = await abacusClient.componentUpdate(componentId, updateInstructions, 'admin@tambo.ai', environment);
          break;
        case 'agentDiagnostics':
          result = await abacusClient.agentDiagnostics(agent, diagnosticScope, environment);
          break;
      }
      
      setResponse(result);
      setAbacusStatus('success');
    } catch (error) {
      setResponse({ error: error.message, abacusError: true });
      setAbacusStatus('error');
    }

    setLoading(false);
    setTimeout(() => setAbacusStatus('ready'), 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'bg-yellow-100 text-yellow-700';
      case 'success': return 'bg-green-100 text-green-700';
      case 'error': return 'bg-red-100 text-red-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header with ABACUS branding */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TAMBO BUDDY MCP Console
            </h1>
            <p className="text-sm text-gray-600">Powered by ABACUS Intelligence</p>
          </div>
        </div>
        
        {/* Environment & Status */}
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className={getStatusColor(abacusStatus)}>
            <Zap className="h-3 w-3 mr-1" />
            ABACUS {abacusStatus.toUpperCase()}
          </Badge>
          
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

      <Tabs defaultValue="console" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="console" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Console
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Main Console Tab */}
        <TabsContent value="console" className="space-y-6">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-2">
                <span>Intelligence Console</span>
                <Badge className={`${
                  environment === 'production' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-green-500 text-white'
                } border-0`}>
                  {environment.toUpperCase()}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="routeRequest">🧠 Intelligent Routing</SelectItem>
                  <SelectItem value="componentUpdate">🧱 Component Intelligence</SelectItem>
                  <SelectItem value="agentDiagnostics">🛠 Agent Diagnostics</SelectItem>
                </SelectContent>
              </Select>

              {mode === 'routeRequest' && (
                <>
                  <Select value={tier} onValueChange={setTier}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Standard">Standard Tier</SelectItem>
                      <SelectItem value="Pro">Pro Tier</SelectItem>
                      <SelectItem value="Enterprise">Enterprise Tier</SelectItem>
                    </SelectContent>
                  </Select>
                  <Textarea
                    placeholder="Describe your routing scenario... (e.g., 'Customer reported login issue', 'Need help with pricing', 'User left feedback about checkout')"
                    value={payload}
                    onChange={(e) => setPayload(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </>
              )}

              {mode === 'componentUpdate' && (
                <>
                  <Input
                    placeholder="Component ID (e.g., user-profile-card)"
                    value={componentId}
                    onChange={(e) => setComponentId(e.target.value)}
                  />
                  <Textarea
                    placeholder="Describe the update you want... (e.g., 'Add dark mode support', 'Make responsive for mobile', 'Add loading spinner')"
                    value={updateInstructions}
                    onChange={(e) => setUpdateInstructions(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </>
              )}

              {mode === 'agentDiagnostics' && (
                <>
                  <Input
                    placeholder="Agent Name (e.g., TriageAgent, ContentRouterAgent)"
                    value={agent}
                    onChange={(e) => setAgent(e.target.value)}
                  />
                  <Select value={diagnosticScope} onValueChange={setDiagnosticScope}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fast">Fast Scan</SelectItem>
                      <SelectItem value="deep">Deep Analysis</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}

              <Button 
                onClick={handleSubmit} 
                disabled={loading} 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                size="lg"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>ABACUS Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Brain className="h-4 w-4" />
                    <span>Execute with ABACUS Intelligence</span>
                    <ChevronRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Response Display */}
          {response && (
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>ABACUS Intelligence Response</span>
                  {response.confidence && (
                    <Badge className="bg-white text-green-600 border-0">
                      {Math.round(response.confidence * 100)}% Confidence
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <pre className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-auto text-sm font-mono">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{processingMetrics.totalRequests}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Avg Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{processingMetrics.averageResponseTime}ms</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{processingMetrics.successRate}%</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          {abacusHistory.length > 0 ? (
            abacusHistory.map((item, index) => (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <CardTitle className="text-sm font-medium">
                    Request #{index + 1} - {new Date(item.timestamp).toLocaleTimeString()}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold">Request:</p>
                      <pre className="text-xs bg-slate-100 p-2 rounded overflow-auto">
                        {JSON.stringify(item.request, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Response:</p>
                      <pre className="text-xs bg-slate-100 p-2 rounded overflow-auto">
                        {JSON.stringify(item.response, null, 2)}
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No requests processed yet. Start using the console to see history.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AbacusIntegratedTamboConsole;
