import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Code, 
  Copy, 
  Download, 
  FileText, 
  CheckCircle,
  AlertCircle,
  Save,
  RotateCcw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CodeEditorProps {
  code: string;
  onChange?: (code: string) => void;
  readOnly?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ 
  code, 
  onChange, 
  readOnly = false 
}) => {
  const [localCode, setLocalCode] = useState(code);
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  const handleCodeChange = (newCode: string) => {
    setLocalCode(newCode);
    setHasChanges(newCode !== code);
    if (onChange && !readOnly) {
      onChange(newCode);
    }
  };

  const handleSave = () => {
    if (onChange) {
      onChange(localCode);
      setHasChanges(false);
      toast({
        title: "Code Saved",
        description: "Your changes have been applied successfully.",
        duration: 2000,
      });
    }
  };

  const handleReset = () => {
    setLocalCode(code);
    setHasChanges(false);
    toast({
      title: "Code Reset",
      description: "Changes have been reverted to the original code.",
      duration: 2000,
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(localCode || code);
      toast({
        title: "Code Copied",
        description: "Component code has been copied to clipboard.",
        duration: 2000,
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy code to clipboard.",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([localCode || code], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-component.tsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Code Downloaded",
      description: "Component code has been downloaded as a .tsx file.",
      duration: 2000,
    });
  };

  const getCodeStats = () => {
    const codeText = localCode || code || '';
    const lines = codeText.split('\n').length;
    const chars = codeText.length;
    const words = codeText.split(/\s+/).filter(word => word.length > 0).length;
    
    return { lines, chars, words };
  };

  const stats = getCodeStats();

  if (!code && !localCode) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-4">
        <div className="p-4 gradient-primary rounded-full opacity-50">
          <Code className="h-8 w-8 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-muted-foreground">No Code Generated</h3>
          <p className="text-sm text-muted-foreground">
            Generate a component first to see and edit the code
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Code className="h-3 w-3" />
            TypeScript
          </Badge>
          <Badge variant="outline">
            {stats.lines} lines
          </Badge>
          <Badge variant="outline">
            {stats.chars} characters
          </Badge>
          {hasChanges && (
            <Badge variant="default" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Unsaved Changes
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasChanges && !readOnly && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button
                variant="hero"
                size="sm"
                onClick={handleSave}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Code Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <FileText className="h-4 w-4" />
            Component Code
          </CardTitle>
          <CardDescription>
            {readOnly 
              ? "View the generated component code below" 
              : "Edit the component code directly or use the chat to modify it"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Textarea
              value={localCode || code || ''}
              onChange={(e) => handleCodeChange(e.target.value)}
              readOnly={readOnly}
              className="min-h-[400px] font-mono text-sm resize-none"
              placeholder="// Generated component code will appear here..."
            />
            
            {/* Line Numbers Overlay (Visual Only) */}
            <div className="absolute left-3 top-3 text-xs text-muted-foreground pointer-events-none select-none opacity-50">
              {Array.from({ length: Math.max(20, stats.lines) }, (_, i) => (
                <div key={i + 1} className="h-[1.5em] leading-[1.5]">
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Code Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4" />
            Code Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-accent/20 rounded-lg">
              <div className="text-lg font-bold text-accent-foreground">{stats.lines}</div>
              <div className="text-sm text-muted-foreground">Lines</div>
            </div>
            <div className="text-center p-3 bg-primary/10 rounded-lg">
              <div className="text-lg font-bold text-primary">{stats.chars}</div>
              <div className="text-sm text-muted-foreground">Characters</div>
            </div>
            <div className="text-center p-3 bg-success/10 rounded-lg">
              <div className="text-lg font-bold text-success">{stats.words}</div>
              <div className="text-sm text-muted-foreground">Words</div>
            </div>
            <div className="text-center p-3 bg-secondary rounded-lg">
              <div className="text-lg font-bold text-secondary-foreground">TSX</div>
              <div className="text-sm text-muted-foreground">Type</div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              ✨ This component was generated using Tambo + ABACUS.AI MCP integration. 
              It follows React best practices and is ready for production use.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};