import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import axios from 'axios';

const TamboRoutingConsolePro = () => {
  const [tier, setTier] = useState('Pro');
  const [payload, setPayload] = useState('');
  const [componentId, setComponentId] = useState('');
  const [updateInstructions, setUpdateInstructions] = useState('');
  const [agent, setAgent] = useState('');
  const [diagnosticScope, setDiagnosticScope] = useState('fast');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('routeRequest');
  const [environment, setEnvironment] = useState('development'); // New state for environment

  const handleSubmit = async () => {
    setLoading(true);
    let requestBody = {};

    switch (mode) {
      case 'routeRequest':
        requestBody = {
          tool: 'routeRequest',
          args: { tier, payload, environment }
        };
        break;
      case 'componentUpdate':
        requestBody = {
          tool: 'componentUpdate',
          args: {
            componentId,
            updateInstructions,
            author: 'admin@tambo.ai',
            environment
          }
        };
        break;
      case 'agentDiagnostics':
        requestBody = {
          tool: 'agentDiagnostics',
          args: {
            agent,
            scope: diagnosticScope,
            environment
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

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">🧠 TAMBO Enterprise Routing Console</h1>
        
        {/* Environment Toggle */}
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Console</span>
            <span className={`px-2 py-1 rounded text-xs ${
              environment === 'production' 
                ? 'bg-red-100 text-red-700' 
                : 'bg-green-100 text-green-700'
            }`}>
              {environment.toUpperCase()}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={mode} onValueChange={setMode}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="routeRequest">📦 Route Request</SelectItem>
              <SelectItem value="componentUpdate">🧱 Component Update</SelectItem>
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
                  <SelectItem value="Standard">Standard</SelectItem>
                  <SelectItem value="Pro">Pro</SelectItem>
                  <SelectItem value="Enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Enter routing scenario payload..."
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                rows={4}
              />
            </>
          )}

          {mode === 'componentUpdate' && (
            <>
              <Input
                placeholder="Component ID"
                value={componentId}
                onChange={(e) => setComponentId(e.target.value)}
              />
              <Textarea
                placeholder="Update instructions for component..."
                value={updateInstructions}
                onChange={(e) => setUpdateInstructions(e.target.value)}
                rows={4}
              />
            </>
          )}

          {mode === 'agentDiagnostics' && (
            <>
              <Input
                placeholder="Agent Name"
                value={agent}
                onChange={(e) => setAgent(e.target.value)}
              />
              <Select value={diagnosticScope} onValueChange={setDiagnosticScope}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fast">Fast</SelectItem>
                  <SelectItem value="deep">Deep</SelectItem>
                </SelectContent>
              </Select>
            </>
          )}

          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading ? 'Running...' : 'Execute'}
          </Button>
        </CardContent>
      </Card>

      {response && (
        <Card>
          <CardHeader>
            <CardTitle>📤 Response</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-3 rounded overflow-auto text-sm">
              {JSON.stringify(response, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TamboRoutingConsolePro;