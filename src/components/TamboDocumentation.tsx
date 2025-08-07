import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  Code, 
  Palette, 
  Zap, 
  CheckCircle, 
  AlertCircle,
  Copy,
  ExternalLink,
  Lightbulb
} from 'lucide-react';
import { sampleComponents, findComponent } from '@/tambo-config/components';
import { designTools } from '@/tambo-config/tools';

interface TamboDocumentationProps {
  selectedComponent?: string;
  onUpdateComponent?: (componentName: string, instructions: string) => void;
}

export const TamboDocumentation: React.FC<TamboDocumentationProps> = ({
  selectedComponent,
  onUpdateComponent
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const component = selectedComponent ? findComponent(selectedComponent) : null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const generateUsageExample = (component: any) => {
    const requiredProps = Object.entries(component.props || {})
      .filter(([_, prop]: [string, any]) => prop.required)
      .map(([name, prop]: [string, any]) => `${name}="${prop.description.toLowerCase()}"`)
      .join('\n  ');

    return `<${component.name}
  ${requiredProps}
/>`;
  };

  if (!component) {
    return (
      <Card className="gradient-card shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Tambo Documentation
          </CardTitle>
          <CardDescription>
            Select a component from the registry to view its documentation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Framework Overview */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Tambo Framework Overview</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="font-medium">AI-Powered Components</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Components designed for AI interactions with clear descriptions and examples
                  </p>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Code className="h-4 w-4 text-accent-bright" />
                    <span className="font-medium">MCP Integration</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Model Context Protocol support for seamless tool integration
                  </p>
                </Card>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Quick Actions</h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm">
                  <BookOpen className="h-3 w-3 mr-1" />
                  Browse Components
                </Button>
                <Button variant="outline" size="sm">
                  <Palette className="h-3 w-3 mr-1" />
                  Design System
                </Button>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  API Reference
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Component Header */}
      <Card className="gradient-card shadow-card">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <BookOpen className="h-6 w-6" />
                {component.name}
              </CardTitle>
              <CardDescription className="text-base mt-2">
                {component.description}
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2">
              <Badge variant="outline" className="capitalize">
                {component.category}
              </Badge>
              <Button 
                variant="hero" 
                size="sm"
                onClick={() => onUpdateComponent?.(component.name, 'Improve this component with latest best practices')}
              >
                <Lightbulb className="h-3 w-3 mr-1" />
                Update
              </Button>
            </div>
          </div>
          {component.tags && component.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {component.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Documentation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="props">Props</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
          <TabsTrigger value="updates">Updates</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Component Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-muted-foreground">{component.description}</p>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="font-medium mb-2">Usage</h4>
                <div className="bg-muted p-4 rounded-lg relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyToClipboard(generateUsageExample(component))}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <pre className="text-sm">
                    <code>{generateUsageExample(component)}</code>
                  </pre>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Quick Stats</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-2 bg-accent/20 rounded">
                    <div className="font-bold text-accent-foreground">
                      {Object.keys(component.props || {}).length}
                    </div>
                    <div className="text-xs text-muted-foreground">Props</div>
                  </div>
                  <div className="text-center p-2 bg-primary/10 rounded">
                    <div className="font-bold text-primary">
                      {Object.values(component.props || {}).filter((prop: any) => prop.required).length}
                    </div>
                    <div className="text-xs text-muted-foreground">Required</div>
                  </div>
                  <div className="text-center p-2 bg-success/10 rounded">
                    <div className="font-bold text-success">
                      {component.examples?.length || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Examples</div>
                  </div>
                  <div className="text-center p-2 bg-secondary rounded">
                    <div className="font-bold text-secondary-foreground">
                      {component.tags?.length || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Tags</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="props" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Component Props</CardTitle>
              <CardDescription>
                All available props for the {component.name} component
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(component.props || {}).map(([propName, prop]: [string, any]) => (
                  <div key={propName} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <code className="font-mono font-medium">{propName}</code>
                        {prop.required && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {prop.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {prop.description}
                    </p>
                    {prop.default && (
                      <div className="text-xs text-muted-foreground">
                        Default: <code>{JSON.stringify(prop.default)}</code>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-4">
          {component.examples && component.examples.length > 0 ? (
            component.examples.map((example, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{example.name}</CardTitle>
                  {example.description && (
                    <CardDescription>{example.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-lg relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(`<${component.name}\n${Object.entries(example.props).map(([key, value]) => `  ${key}={${JSON.stringify(value)}}`).join('\n')}\n/>`)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <pre className="text-sm">
                      <code>
                        {`<${component.name}\n${Object.entries(example.props).map(([key, value]) => `  ${key}={${JSON.stringify(value)}}`).join('\n')}\n/>`}
                      </code>
                    </pre>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No examples available for this component yet.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => onUpdateComponent?.(component.name, 'Add usage examples to this component')}
                >
                  <Lightbulb className="h-3 w-3 mr-1" />
                  Generate Examples
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="updates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Available Updates</CardTitle>
              <CardDescription>
                Suggested improvements and modifications for this component
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { type: 'accessibility', title: 'Improve Accessibility', description: 'Add ARIA labels and keyboard navigation' },
                  { type: 'styling', title: 'Update Styling', description: 'Apply latest design system tokens and responsive patterns' },
                  { type: 'feature', title: 'Add Features', description: 'Enhance functionality with new capabilities' },
                  { type: 'behavior', title: 'Improve Behavior', description: 'Optimize user interactions and performance' }
                ].map((update) => (
                  <div key={update.type} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{update.title}</h4>
                      <p className="text-sm text-muted-foreground">{update.description}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onUpdateComponent?.(component.name, `Apply ${update.type} improvements: ${update.description}`)}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Apply
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};