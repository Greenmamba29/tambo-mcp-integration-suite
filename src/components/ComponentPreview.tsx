import React, { useState, useMemo } from 'react';
import { LiveProvider, LivePreview, LiveError } from 'react-live';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Eye, 
  EyeOff, 
  RotateCcw, 
  Download, 
  Share2, 
  Sparkles,
  Code,
  Palette,
  Settings,
  AlertTriangle,
  Play
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

  // Scope for react-live - provides all necessary components and utilities
  const liveScope = useMemo(() => ({
    React,
    useState,
    useMemo,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Input,
    Badge,
    Alert,
    AlertDescription,
    Eye,
    EyeOff,
    RotateCcw,
    Download,
    Share2,
    Sparkles,
    Code,
    Palette,
    Settings,
    AlertTriangle,
    Play
  }), []);

  // Clean and prepare the component code for rendering
  const cleanedComponentCode = useMemo(() => {
    if (!componentCode) return '';
    
    // Remove imports as they'll be provided by scope
    let cleaned = componentCode.replace(/^import.*$/gm, '');
    
    // Remove empty lines from start
    cleaned = cleaned.replace(/^\s*\n/gm, '');
    
    // If it's a default export, extract just the component
    if (cleaned.includes('export default')) {
      const match = cleaned.match(/export default\s+(\w+)/);
      if (match) {
        const componentName = match[1];
        // Remove the export default line and render the component
        cleaned = cleaned.replace(/export default.*$/gm, '');
        cleaned += `\n\n<${componentName} />`;
      }
    }
    
    // If it's a named export, try to extract and render it
    if (cleaned.includes('export const') || cleaned.includes('export function')) {
      const namedMatch = cleaned.match(/export (?:const|function)\s+(\w+)/);
      if (namedMatch && !cleaned.includes(`<${namedMatch[1]}`)) {
        cleaned += `\n\n<${namedMatch[1]} />`;
      }
    }
    
    // If no JSX render found and it looks like a component definition, try to render it
    if (!cleaned.includes('<') && cleaned.includes('const ')) {
      const constMatch = cleaned.match(/const\s+(\w+)\s*=/);
      if (constMatch) {
        cleaned += `\n\n<${constMatch[1]} />`;
      }
    }
    
    return cleaned;
  }, [componentCode]);

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

  // Fallback component when live rendering fails
  const FallbackComponent = () => (
    <div className="flex flex-col items-center justify-center py-8 space-y-4">
      <div className="p-3 rounded-full bg-muted">
        <AlertTriangle className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="text-center">
        <h3 className="text-sm font-medium text-muted-foreground">Component Preview Unavailable</h3>
        <p className="text-xs text-muted-foreground mt-1">
          The generated code cannot be rendered safely. Check for syntax errors below.
        </p>
      </div>
    </div>
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
            <LiveProvider code={cleanedComponentCode} scope={liveScope} noInline={false}>
              <div className="space-y-4">
                {/* Live Preview */}
                <div className="rounded-lg border bg-background p-4 min-h-[200px]">
                  <LivePreview />
                </div>
                
                {/* Error Display */}
                <LiveError className="bg-destructive/10 border-destructive text-destructive px-4 py-2 rounded-lg text-sm font-mono" />
              </div>
            </LiveProvider>
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