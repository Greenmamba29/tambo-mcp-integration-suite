
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  TestTube, 
  BarChart3, 
  Settings, 
  BookOpen, 
  Zap,
  Globe,
  Database
} from 'lucide-react';
import TamboRoutingTester from '@/components/tambo-routing-tester';
import McpDashboard from '@/components/mcp-dashboard';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-8 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TAMBO MCP Integration Suite
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Comprehensive integration suite for ABACUS TAMBO BUDDY MCP BOT with advanced testing, 
            monitoring, and analytics capabilities. Build, test, modify, and connect all MCP integrations 
            with intelligent ABACUS-powered routing.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              <Globe className="mr-1 h-3 w-3" />
              ABACUS Powered
            </Badge>
            <Badge variant="outline" className="text-green-600 border-green-200">
              <Database className="mr-1 h-3 w-3" />
              Real-time Analytics
            </Badge>
            <Badge variant="outline" className="text-purple-600 border-purple-200">
              <Zap className="mr-1 h-3 w-3" />
              Streaming Support
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="chatbot" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="chatbot" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              TAMBO Chat
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="testing" className="flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              Testing
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuration
            </TabsTrigger>
            <TabsTrigger value="examples" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Examples
            </TabsTrigger>
          </TabsList>

          {/* TAMBO Chatbot Tab */}
          <TabsContent value="chatbot" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-6 w-6 text-blue-600" />
                  ABACUS TAMBO BUDDY MCP BOT
                </CardTitle>
                <CardDescription>
                  Interactive chatbot interface with advanced MCP routing capabilities. 
                  Test routing scenarios in real-time and see how TAMBO processes different types of messages.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="w-full">
                  <iframe
                    src="https://apps.abacus.ai/chatllm/?appId=1573da0c2c&hideTopBar=2"
                    className="w-full border-0 rounded-b-lg"
                    style={{ minHeight: '800px' }}
                    title="TAMBO BUDDY MCP BOT"
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Integration Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Bot className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-medium">TAMBO Status</h3>
                  <p className="text-sm text-muted-foreground">Connected & Active</p>
                  <Badge className="mt-2 bg-green-100 text-green-800">Online</Badge>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Zap className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-medium">MCP Routing</h3>
                  <p className="text-sm text-muted-foreground">AI-Powered Intelligence</p>
                  <Badge className="mt-2 bg-blue-100 text-blue-800">Enabled</Badge>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Database className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-medium">Analytics</h3>
                  <p className="text-sm text-muted-foreground">Real-time Monitoring</p>
                  <Badge className="mt-2 bg-purple-100 text-purple-800">Recording</Badge>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <McpDashboard />
          </TabsContent>

          {/* Testing Tab */}
          <TabsContent value="testing">
            <TamboRoutingTester />
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="config" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  MCP Configuration Manager
                </CardTitle>
                <CardDescription>
                  Manage and configure your TAMBO MCP integration settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Current Configuration</h3>
                    <div className="space-y-3 p-4 border rounded">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">App ID</span>
                        <span className="text-sm font-mono">1573da0c2c</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Base URL</span>
                        <span className="text-sm font-mono">apps.abacus.ai/chatllm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Last Updated</span>
                        <span className="text-sm">Today</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Integration Settings</h3>
                    <div className="space-y-3 p-4 border rounded">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Streaming Support</span>
                        <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Analytics Collection</span>
                        <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Error Logging</span>
                        <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Real-time Monitoring</span>
                        <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Examples Tab */}
          <TabsContent value="examples" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Integration Examples
                  </CardTitle>
                  <CardDescription>
                    Code examples and patterns for MCP integration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 border rounded">
                    <h4 className="font-medium text-sm mb-2">Basic Route Testing</h4>
                    <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
{`import { McpClient } from '@/lib/mcp-client';

const client = new McpClient();
const result = await client.testRoute(
  'Help me analyze customer feedback'
);

console.log(result.route); // 'analysis'
console.log(result.confidence); // 0.95`}
                    </pre>
                  </div>
                  
                  <div className="p-3 border rounded">
                    <h4 className="font-medium text-sm mb-2">Streaming Integration</h4>
                    <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
{`const stream = await client.streamRoute(message);
const reader = stream.getReader();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const response = parseStreamResponse(value);
  console.log(response);
}`}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Usage Patterns</CardTitle>
                  <CardDescription>
                    Common integration patterns and best practices
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Routing Categories</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Support queries</span>
                        <Badge variant="outline">support</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Analysis requests</span>
                        <Badge variant="outline">analysis</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>General conversation</span>
                        <Badge variant="outline">general</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Greetings</span>
                        <Badge variant="outline">greeting</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Best Practices</h4>
                    <ul className="text-xs space-y-1 text-muted-foreground">
                      <li>• Always handle streaming errors gracefully</li>
                      <li>• Implement timeout mechanisms for API calls</li>
                      <li>• Use batch testing for comprehensive coverage</li>
                      <li>• Monitor confidence scores for accuracy</li>
                      <li>• Log all interactions for analytics</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
