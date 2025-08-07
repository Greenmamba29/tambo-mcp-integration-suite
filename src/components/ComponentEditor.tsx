import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Code, 
  Eye, 
  Save, 
  Copy, 
  Check, 
  Download,
  Play,
  Edit3,
  FileCode,
  Sparkles,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Settings
} from 'lucide-react';

interface ComponentEditorProps {
  componentName?: string;
  initialCode?: string;
  onSave?: (code: string, componentName: string) => void;
  onPreview?: (code: string) => void;
  onClose?: () => void;
}

interface CodeHistory {
  version: number;
  code: string;
  timestamp: Date;
  description: string;
}

export const ComponentEditor: React.FC<ComponentEditorProps> = ({
  componentName = 'NewComponent',
  initialCode = '',
  onSave,
  onPreview,
  onClose
}) => {
  const [code, setCode] = useState(initialCode);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const [history, setHistory] = useState<CodeHistory[]>([]);
  const [currentVersion, setCurrentVersion] = useState(1);
  const [copied, setCopied] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (initialCode && initialCode !== code) {
      setCode(initialCode);
      addToHistory(initialCode, 'Initial component creation');
    }
  }, [initialCode]);

  useEffect(() => {
    setIsSaved(code === initialCode);
  }, [code, initialCode]);

  const addToHistory = (newCode: string, description: string) => {
    const newVersion: CodeHistory = {
      version: currentVersion + 1,
      code: newCode,
      timestamp: new Date(),
      description
    };
    setHistory(prev => [newVersion, ...prev.slice(0, 9)]); // Keep last 10 versions
    setCurrentVersion(newVersion.version);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(code, componentName);
      addToHistory(code, 'Manual save');
      setIsSaved(true);
    }
  };

  const handlePreview = () => {
    try {
      // Generate preview HTML (simplified)
      const previewContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${componentName} Preview</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; }
        .preview-container { max-width: 800px; margin: 0 auto; }
    </style>
</head>
<body>
    <div class="preview-container">
        <h2>${componentName} Preview</h2>
        <div id="root"></div>
    </div>
    <script type="text/babel">
        ${code}
        
        // Render component
        const container = document.getElementById('root');
        const root = ReactDOM.createRoot(container);
        try {
          root.render(React.createElement(${componentName}));
        } catch (error) {
          container.innerHTML = '<div style="color: red; padding: 20px; border: 1px solid red; border-radius: 4px;">Error rendering component: ' + error.message + '</div>';
        }
    </script>
</body>
</html>`;
      setPreviewHtml(previewContent);
      setIsPreviewOpen(true);
      if (onPreview) {
        onPreview(code);
      }
    } catch (error) {
      console.error('Preview generation failed:', error);
      setErrors([`Preview failed: ${error}`]);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const validateCode = () => {
    const issues: string[] = [];
    
    if (!code.includes('export') && !code.includes('const ' + componentName)) {
      issues.push('Component should export or define the component');
    }
    
    if (!code.includes('React') && !code.includes('import')) {
      issues.push('Component should import React or use React');
    }
    
    if (code.length < 50) {
      issues.push('Component seems incomplete');
    }
    
    setErrors(issues);
    return issues.length === 0;
  };

  const generateComponentFromDescription = async (description: string) => {
    // This would integrate with your AI system to generate code
    const generatedCode = `
import React from 'react';

const ${componentName} = () => {
  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-2">${componentName}</h3>
      <p className="text-gray-600">
        Generated component based on: ${description}
      </p>
    </div>
  );
};

export default ${componentName};`;
    
    setCode(generatedCode);
    addToHistory(generatedCode, `Generated from: ${description}`);
  };

  const ComponentPreview = () => (
    <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
      <DialogContent className="max-w-6xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            {componentName} Preview
          </DialogTitle>
          <DialogDescription>
            Live preview of your component
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <iframe
            srcDoc={previewHtml}
            className="w-full h-[60vh] border rounded"
            title={`${componentName} Preview`}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
            Close Preview
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileCode className="h-6 w-6" />
            Component Editor
          </h2>
          <p className="text-muted-foreground">
            Edit and preview your {componentName} component
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isSaved ? "default" : "secondary"}>
            {isSaved ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Saved
              </>
            ) : (
              <>
                <AlertTriangle className="h-3 w-3 mr-1" />
                Unsaved
              </>
            )}
          </Badge>
          <Badge variant="outline">
            v{currentVersion}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="editor" className="space-y-6">
        <TabsList>
          <TabsTrigger value="editor">
            <Code className="h-4 w-4 mr-2" />
            Code Editor
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="history">
            <RefreshCw className="h-4 w-4 mr-2" />
            Version History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-6">
          {/* Toolbar */}
          <Card>
            <CardContent className="py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Button onClick={handlePreview}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button variant="outline" onClick={handleCopy}>
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => validateCode()}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Validate
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button onClick={handleSave} disabled={isSaved}>
                    <Save className="h-4 w-4 mr-2" />
                    Save to Code Tab
                  </Button>
                  {onClose && (
                    <Button variant="outline" onClick={onClose}>
                      Close Editor
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {errors.length > 0 && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Validation Issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index} className="text-sm text-destructive">
                      {error}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Code Editor */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Edit3 className="h-5 w-5" />
                  {componentName}.tsx
                </CardTitle>
                <Badge variant="outline">
                  {code.split('\n').length} lines
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="// Start coding your component here..."
                className="min-h-[400px] font-mono text-sm"
              />
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI-Powered Enhancements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => generateComponentFromDescription('Add responsive design')}
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Add Responsive Design
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => generateComponentFromDescription('Add dark mode support')}
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Add Dark Mode
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => generateComponentFromDescription('Add accessibility features')}
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Improve Accessibility
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => generateComponentFromDescription('Add loading states')}
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Add Loading States
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Component Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Component Name</label>
                <Input value={componentName} readOnly className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Export Type</label>
                <select className="w-full mt-1 p-2 border rounded">
                  <option>Default Export</option>
                  <option>Named Export</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="typescript" defaultChecked />
                <label htmlFor="typescript" className="text-sm">Use TypeScript</label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Version History</CardTitle>
              <p className="text-sm text-muted-foreground">
                Track changes and revert to previous versions
              </p>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {history.map((version, index) => (
                    <div key={version.version} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">Version {version.version}</div>
                        <div className="text-sm text-muted-foreground">
                          {version.description}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {version.timestamp.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCode(version.code)}
                        >
                          Restore
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setPreviewHtml(version.code);
                            setIsPreviewOpen(true);
                          }}
                        >
                          Preview
                        </Button>
                      </div>
                    </div>
                  ))}
                  {history.length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      No version history available
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ComponentPreview />
    </div>
  );
};

export default ComponentEditor;
