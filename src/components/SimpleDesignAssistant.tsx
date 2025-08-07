import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Code, Wand2, FileText, Brain } from 'lucide-react';

interface SimpleDesignAssistantProps {
  onComponentGenerated?: (componentName: string, code: string) => void;
}

const SimpleDesignAssistant: React.FC<SimpleDesignAssistantProps> = ({ 
  onComponentGenerated 
}) => {
  const [componentName, setComponentName] = useState('');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateComponent = async () => {
    if (!componentName.trim() || !description.trim()) {
      return;
    }

    setIsGenerating(true);

    try {
      // Simulate component generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      const generatedCode = `
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ${componentName}Props {
  // Add your props here
}

export const ${componentName}: React.FC<${componentName}Props> = (props) => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>${componentName}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          ${description}
        </p>
        <Button className="mt-4">
          Click me
        </Button>
      </CardContent>
    </Card>
  );
};

export default ${componentName};
      `.trim();

      // Call the callback if provided
      if (onComponentGenerated) {
        onComponentGenerated(componentName, generatedCode);
      }

    } catch (error) {
      console.error('Failed to generate component:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Brain className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-semibold">AI Component Generator</h3>
        </div>
        <p className="text-muted-foreground">
          Describe your component and I'll generate React code for you
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Component Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="component-name">Component Name</Label>
            <Input
              id="component-name"
              placeholder="e.g. UserCard, ProductButton, DashboardWidget"
              value={componentName}
              onChange={(e) => setComponentName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what your component should do, its appearance, and any special features..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <Button 
            onClick={generateComponent}
            disabled={isGenerating || !componentName.trim() || !description.trim()}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                Generating Component...
              </>
            ) : (
              <>
                <Code className="h-4 w-4 mr-2" />
                Generate Component
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <div className="h-2 w-2 bg-green-500 rounded-full" />
          <span>React + TypeScript</span>
        </div>
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <div className="h-2 w-2 bg-blue-500 rounded-full" />
          <span>Shadcn/ui Components</span>
        </div>
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <div className="h-2 w-2 bg-purple-500 rounded-full" />
          <span>Modern Styling</span>
        </div>
      </div>

      {/* Sample prompts for inspiration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Quick Examples
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {[
              { name: "UserProfile", desc: "A user profile card with avatar, name, email, and social links" },
              { name: "PricingCard", desc: "A pricing tier card with features list, price, and CTA button" },
              { name: "StatsWidget", desc: "A dashboard widget showing metrics with icons and trend indicators" }
            ].map((example) => (
              <Button
                key={example.name}
                variant="ghost"
                size="sm"
                className="justify-start text-left h-auto p-3"
                onClick={() => {
                  setComponentName(example.name);
                  setDescription(example.desc);
                }}
              >
                <div>
                  <div className="font-medium">{example.name}</div>
                  <div className="text-xs text-muted-foreground">{example.desc}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleDesignAssistant;
