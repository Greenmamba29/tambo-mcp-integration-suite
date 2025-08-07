import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  EyeOff, 
  RotateCcw, 
  Download, 
  Share2, 
  Sparkles,
  Code,
  Palette,
  Settings
} from 'lucide-react';

interface ComponentPreviewProps {
  componentCode: string;
  onModify?: (instructions: string) => void;
}

export const ComponentPreview: React.FC<ComponentPreviewProps> = ({ 
  componentCode, 
  onModify 
}) => {
  const [showCode, setShowCode] = useState(false);
  const [modifyInstructions, setModifyInstructions] = useState('');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const handleModify = () => {
    if (modifyInstructions.trim() && onModify) {
      onModify(modifyInstructions.trim());
      setModifyInstructions('');
    }
  };

  const getPreviewWidth = () => {
    switch (previewMode) {
      case 'tablet': return 'max-w-2xl';
      case 'mobile': return 'max-w-sm';
      default: return 'max-w-4xl';
    }
  };

  // Mock component for preview (in a real implementation, this would dynamically render the generated component)
  const MockGeneratedComponent = () => (
    <Card className="gradient-card shadow-elegant">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent-bright" />
          Generated Component
        </CardTitle>
        <CardDescription>
          Created with Tambo + ABACUS.AI MCP integration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            This is a preview of your generated component. In a real implementation, 
            this would render the actual component from the generated code.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-accent rounded-lg">
              <h4 className="font-semibold text-accent-foreground">AI-Powered</h4>
              <p className="text-sm text-accent-foreground/80">Generated with ABACUS.AI</p>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg">
              <h4 className="font-semibold text-primary">Tambo Ready</h4>
              <p className="text-sm text-muted-foreground">MCP Compatible</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="default" size="sm">
              <Code className="h-3 w-3 mr-2" />
              Primary Action
            </Button>
            <Button variant="outline" size="sm">
              <Palette className="h-3 w-3 mr-2" />
              Secondary
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!componentCode) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-4">
        <div className="p-4 gradient-accent rounded-full opacity-50">
          <Eye className="h-8 w-8 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-muted-foreground">No Component Yet</h3>
          <p className="text-sm text-muted-foreground">
            Start a conversation to generate your first component
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Preview Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Live Preview
          </Badge>
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={previewMode === 'desktop' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPreviewMode('desktop')}
              className="h-7 px-2"
            >
              Desktop
            </Button>
            <Button
              variant={previewMode === 'tablet' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPreviewMode('tablet')}
              className="h-7 px-2"
            >
              Tablet
            </Button>
            <Button
              variant={previewMode === 'mobile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPreviewMode('mobile')}
              className="h-7 px-2"
            >
              Mobile
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCode(!showCode)}
          >
            {showCode ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showCode ? 'Hide Code' : 'Show Code'}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="space-y-4">
        <Card className="p-6 bg-muted/20 pattern-dots">
          <div className={`mx-auto transition-all duration-300 ${getPreviewWidth()}`}>
            <MockGeneratedComponent />
          </div>
        </Card>

        {/* Code View */}
        {showCode && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Code className="h-4 w-4" />
                Generated Component Code
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                <code>{componentCode || '// No code generated yet'}</code>
              </pre>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modification Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Settings className="h-4 w-4" />
            Modify Component
          </CardTitle>
          <CardDescription>
            Describe how you'd like to modify this component
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={modifyInstructions}
              onChange={(e) => setModifyInstructions(e.target.value)}
              placeholder="e.g., Make it more colorful, add animation, change layout..."
              className="flex-1"
            />
            <Button 
              onClick={handleModify}
              disabled={!modifyInstructions.trim()}
              variant="hero"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Modify
            </Button>
          </div>
          
          {/* Quick Modification Buttons */}
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              'Add animation',
              'Change colors',
              'Make responsive',
              'Add icons',
              'Improve styling',
              'Add interactivity'
            ].map((suggestion) => (
              <Button
                key={suggestion}
                variant="outline"
                size="sm"
                onClick={() => setModifyInstructions(suggestion)}
                className="text-xs"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};