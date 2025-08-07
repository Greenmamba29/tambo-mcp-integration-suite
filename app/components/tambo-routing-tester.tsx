
'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Square, 
  Download, 
  Upload, 
  Settings, 
  BarChart3, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Zap
} from 'lucide-react';
import { McpClient } from '@/lib/mcp-client';
import { McpUtils } from '@/lib/mcp-utils';
import { McpIntegrationResult, StreamingResponse, TestCase } from '@/lib/types';

interface TestResult extends McpIntegrationResult {
  id: string;
  input: string;
  timestamp: Date;
}

export default function TamboRoutingTester() {
  const [testInput, setTestInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [streamingResult, setStreamingResult] = useState<any>(null);
  const [streamingProgress, setStreamingProgress] = useState(0);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [selectedAppId, setSelectedAppId] = useState('1573da0c2c');
  const [customConfig, setCustomConfig] = useState('{}');
  const [batchTests, setBatchTests] = useState<TestCase[]>([]);
  const [activeTab, setActiveTab] = useState('single');

  const mcpClient = useRef(new McpClient());
  const streamAbortController = useRef<AbortController | null>(null);

  const handleSingleTest = async () => {
    if (!testInput.trim()) return;

    setIsTesting(true);
    try {
      const config = JSON.parse(customConfig);
      const result = await mcpClient.current.testRoute(testInput, config);
      
      const testResult: TestResult = {
        ...result,
        id: Date.now().toString(),
        input: testInput,
        timestamp: new Date()
      };

      setTestResults(prev => [testResult, ...prev].slice(0, 100)); // Keep last 100 results
    } catch (error) {
      console.error('Test failed:', error);
      const errorResult: TestResult = {
        id: Date.now().toString(),
        input: testInput,
        timestamp: new Date(),
        success: false,
        responseTime: 0,
        error: error instanceof Error ? error.message : 'Test execution failed'
      };
      setTestResults(prev => [errorResult, ...prev].slice(0, 100));
    } finally {
      setIsTesting(false);
    }
  };

  const handleStreamTest = async () => {
    if (!testInput.trim() || isStreaming) return;

    setIsStreaming(true);
    setStreamingProgress(0);
    setStreamingResult(null);
    
    streamAbortController.current = new AbortController();

    try {
      const config = JSON.parse(customConfig);
      const stream = await mcpClient.current.streamRoute(testInput, config);
      const reader = stream.getReader();
      const decoder = new TextDecoder();

      let buffer = '';
      let partialRead = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        partialRead += decoder.decode(value, { stream: true });
        let lines = partialRead.split('\n');
        partialRead = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              return;
            }
            
            try {
              const parsed = JSON.parse(data) as StreamingResponse;
              
              if (parsed.status === 'processing') {
                setStreamingProgress(parsed.progress || 0);
              } else if (parsed.status === 'completed') {
                setStreamingResult(parsed.result);
                setStreamingProgress(100);
                
                // Add to results
                const testResult: TestResult = {
                  id: Date.now().toString(),
                  input: testInput,
                  timestamp: new Date(),
                  success: true,
                  route: parsed.result?.route,
                  confidence: parsed.result?.confidence,
                  responseTime: 0, // Will be calculated
                  rawResponse: parsed.result
                };
                setTestResults(prev => [testResult, ...prev].slice(0, 100));
                
                setIsStreaming(false);
                return;
              } else if (parsed.status === 'error') {
                throw new Error(parsed.message || 'Streaming failed');
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming failed:', error);
      setStreamingResult({
        error: error instanceof Error ? error.message : 'Streaming test failed'
      });
      setIsStreaming(false);
    }
  };

  const stopStreaming = () => {
    if (streamAbortController.current) {
      streamAbortController.current.abort();
    }
    setIsStreaming(false);
    setStreamingProgress(0);
  };

  const runBatchTests = async () => {
    if (batchTests.length === 0) return;

    setIsTesting(true);
    const results: TestResult[] = [];

    for (const testCase of batchTests) {
      try {
        const config = JSON.parse(customConfig);
        const result = await mcpClient.current.testRoute(testCase.input, config);
        
        results.push({
          ...result,
          id: `${Date.now()}-${testCase.id}`,
          input: testCase.input,
          timestamp: new Date()
        });
      } catch (error) {
        results.push({
          id: `${Date.now()}-${testCase.id}`,
          input: testCase.input,
          timestamp: new Date(),
          success: false,
          responseTime: 0,
          error: error instanceof Error ? error.message : 'Test failed'
        });
      }
    }

    setTestResults(prev => [...results, ...prev].slice(0, 100));
    setIsTesting(false);
  };

  const generateTestScenarios = () => {
    const scenarios = McpUtils.generateRoutingScenarios();
    const allTestCases = scenarios.flatMap(scenario => scenario.testCases);
    setBatchTests(allTestCases);
  };

  const exportResults = () => {
    const data = JSON.stringify(testResults, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tambo-routing-tests-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getResultIcon = (result: TestResult) => {
    if (result.success) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const successRate = McpUtils.calculateSuccessRate(testResults);
  const avgResponseTime = McpUtils.calculateAverageResponseTime(testResults);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          TAMBO MCP Routing Tester
        </h1>
        <p className="text-muted-foreground">
          Enhanced testing suite for ABACUS MCP integrations with real-time streaming
        </p>
      </div>

      {/* Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration
          </CardTitle>
          <CardDescription>
            Configure the MCP client settings for testing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="appId">ABACUS App ID</Label>
              <Input
                id="appId"
                value={selectedAppId}
                onChange={(e) => setSelectedAppId(e.target.value)}
                placeholder="1573da0c2c"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="config">Custom Configuration (JSON)</Label>
              <Textarea
                id="config"
                value={customConfig}
                onChange={(e) => setCustomConfig(e.target.value)}
                placeholder='{"timeout": 5000}'
                className="min-h-[60px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testing Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Testing Interface
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="single">Single Test</TabsTrigger>
              <TabsTrigger value="streaming">Streaming Test</TabsTrigger>
              <TabsTrigger value="batch">Batch Testing</TabsTrigger>
            </TabsList>
            
            <TabsContent value="single" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="testMessage">Test Message</Label>
                <Textarea
                  id="testMessage"
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder="Enter your test message here..."
                  className="min-h-[100px]"
                />
              </div>
              <Button 
                onClick={handleSingleTest} 
                disabled={isTesting || !testInput.trim()}
                className="w-full"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Run Single Test
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="streaming" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="streamMessage">Streaming Test Message</Label>
                <Textarea
                  id="streamMessage"
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder="Enter your streaming test message here..."
                  className="min-h-[100px]"
                />
              </div>
              
              {isStreaming && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span>{streamingProgress}%</span>
                  </div>
                  <Progress value={streamingProgress} className="w-full" />
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={handleStreamTest} 
                  disabled={isStreaming || !testInput.trim()}
                  className="flex-1"
                >
                  {isStreaming ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Streaming...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Start Streaming Test
                    </>
                  )}
                </Button>
                {isStreaming && (
                  <Button onClick={stopStreaming} variant="destructive">
                    <Square className="mr-2 h-4 w-4" />
                    Stop
                  </Button>
                )}
              </div>

              {streamingResult && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <div><strong>Route:</strong> {streamingResult.route}</div>
                      <div><strong>Confidence:</strong> {(streamingResult.confidence * 100).toFixed(1)}%</div>
                      <div><strong>Reasoning:</strong> {streamingResult.reasoning}</div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="batch" className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={generateTestScenarios} variant="outline" className="flex-1">
                  <Upload className="mr-2 h-4 w-4" />
                  Generate Test Scenarios
                </Button>
                <Button 
                  onClick={runBatchTests} 
                  disabled={isTesting || batchTests.length === 0}
                  className="flex-1"
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Running Tests...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Run Batch Tests ({batchTests.length})
                    </>
                  )}
                </Button>
              </div>

              {batchTests.length > 0 && (
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {batchTests.map((test) => (
                    <div key={test.id} className="p-2 border rounded text-sm">
                      <div className="font-medium">{test.name}</div>
                      <div className="text-muted-foreground truncate">{test.input}</div>
                      <div className="flex gap-1 mt-1">
                        {test.tags?.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Results Summary */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Test Results Summary
              </div>
              <Button onClick={exportResults} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{testResults.length}</div>
                <div className="text-sm text-muted-foreground">Total Tests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{successRate.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {McpUtils.formatResponseTime(avgResponseTime)}
                </div>
                <div className="text-sm text-muted-foreground">Avg Response</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {testResults.filter(r => !r.success).length}
                </div>
                <div className="text-sm text-muted-foreground">Failures</div>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {testResults.map((result) => (
                <div key={result.id} className="flex items-start gap-3 p-3 border rounded">
                  {getResultIcon(result)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={result.success ? 'default' : 'destructive'}>
                        {result.route || 'unknown'}
                      </Badge>
                      {result.confidence && (
                        <Badge variant="outline">
                          {(result.confidence * 100).toFixed(1)}% confidence
                        </Badge>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {McpUtils.formatResponseTime(result.responseTime)}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {result.input}
                    </div>
                    {result.error && (
                      <div className="text-xs text-red-600 mt-1">
                        {result.error}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {result.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
