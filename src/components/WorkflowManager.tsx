import React, { useState, useCallback } from 'react';
import SimpleDesignAssistant from '@/components/SimpleDesignAssistant';
import { ComponentRegistry } from '@/components/ComponentRegistry';
import ComponentEditor from '@/components/ComponentEditor';
import { ComponentPreview } from '@/components/ComponentPreview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Sparkles, 
  BookOpen, 
  FileCode, 
  Eye, 
  ArrowRight, 
  CheckCircle,
  AlertTriangle,
  Info,
  Zap,
  Save
} from 'lucide-react';

interface WorkflowState {
  activeTab: string;
  componentName: string;
  generatedCode: string;
  isCodeSaved: boolean;
  lastAction: string;
  workflowStep: 'design' | 'registry' | 'edit' | 'preview' | 'complete';
}

const WorkflowManager: React.FC = () => {
  const [workflow, setWorkflow] = useState<WorkflowState>({
    activeTab: 'design',
    componentName: '',
    generatedCode: '',
    isCodeSaved: false,
    lastAction: 'Started workflow',
    workflowStep: 'design'
  });

  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'info' | 'success' | 'warning';
    message: string;
    timestamp: Date;
  }>>([]);

  const addNotification = useCallback((type: 'info' | 'success' | 'warning', message: string) => {
    const notification = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date()
    };
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  }, []);

  const handleComponentGenerated = useCallback((componentName: string, code: string) => {
    setWorkflow(prev => ({
      ...prev,
      componentName,
      generatedCode: code,
      lastAction: `Generated ${componentName}`,
      workflowStep: 'registry'
    }));
    
    addNotification('success', `🎉 Component "${componentName}" created! Check the Registry tab to modify or the Code tab to edit.`);
    
    // Auto-navigate to registry after a short delay
    setTimeout(() => {
      setWorkflow(prev => ({ ...prev, activeTab: 'registry' }));
    }, 2000);
  }, [addNotification]);

  const handleComponentSelected = useCallback((componentName: string) => {
    setWorkflow(prev => ({
      ...prev,
      componentName,
      lastAction: `Selected ${componentName}`,
      workflowStep: 'edit'
    }));
    
    addNotification('info', `Selected "${componentName}" for editing. Navigate to Code tab to make changes.`);
  }, [addNotification]);

  const handleCodeSaved = useCallback((code: string, componentName: string) => {
    setWorkflow(prev => ({
      ...prev,
      generatedCode: code,
      componentName,
      isCodeSaved: true,
      lastAction: `Saved ${componentName}`,
      workflowStep: 'preview'
    }));
    
    addNotification('success', `💾 Code saved! Your changes to "${componentName}" are ready for preview.`);
    
    // Auto-navigate to preview
    setTimeout(() => {
      setWorkflow(prev => ({ ...prev, activeTab: 'preview' }));
    }, 1500);
  }, [addNotification]);

  const handleTabChange = useCallback((tab: string) => {
    setWorkflow(prev => ({
      ...prev,
      activeTab: tab,
      lastAction: `Navigated to ${tab}`
    }));
    
    // Update workflow step based on tab
    let newStep = prev => prev.workflowStep;
    if (tab === 'design') newStep = 'design';
    else if (tab === 'registry') newStep = 'registry';
    else if (tab === 'code') newStep = 'edit';
    else if (tab === 'preview') newStep = 'preview';
    
    setWorkflow(prev => ({ ...prev, workflowStep: newStep }));
  }, []);

  const getStepStatus = (step: string) => {
    const currentSteps = ['design', 'registry', 'edit', 'preview', 'complete'];
    const currentIndex = currentSteps.indexOf(workflow.workflowStep);
    const stepIndex = currentSteps.indexOf(step);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  const WorkflowProgress = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Zap className="h-5 w-5" />
          Design Workflow Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          {[
            { key: 'design', label: 'Design', icon: <Sparkles className="h-4 w-4" /> },
            { key: 'registry', label: 'Registry', icon: <BookOpen className="h-4 w-4" /> },
            { key: 'edit', label: 'Code', icon: <FileCode className="h-4 w-4" /> },
            { key: 'preview', label: 'Preview', icon: <Eye className="h-4 w-4" /> },
          ].map((step, index, array) => {
            const status = getStepStatus(step.key);
            return (
              <React.Fragment key={step.key}>
                <div className="flex flex-col items-center">
                  <div 
                    className={`
                      flex items-center justify-center w-10 h-10 rounded-full border-2 mb-2
                      ${status === 'completed' ? 'bg-green-500 border-green-500 text-white' : 
                        status === 'current' ? 'bg-blue-500 border-blue-500 text-white' : 
                        'bg-gray-100 border-gray-300 text-gray-400'}
                    `}
                  >
                    {status === 'completed' ? <CheckCircle className="h-5 w-5" /> : step.icon}
                  </div>
                  <span className={`text-sm font-medium ${status === 'current' ? 'text-blue-600' : 'text-gray-600'}`}>
                    {step.label}
                  </span>
                </div>
                {index < array.length - 1 && (
                  <ArrowRight className={`h-5 w-5 ${status === 'completed' ? 'text-green-500' : 'text-gray-300'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
        
        {/* Current Status */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="font-medium">Current:</span>
            <span className="text-muted-foreground">{workflow.lastAction}</span>
          </div>
          {workflow.componentName && (
            <Badge variant="outline">
              {workflow.componentName}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const NotificationPanel = () => (
    notifications.length > 0 && (
      <div className="fixed top-4 right-4 space-y-2 z-50 max-w-md">
        {notifications.map((notification) => (
          <Alert 
            key={notification.id}
            className={`
              transition-all duration-300 shadow-lg
              ${notification.type === 'success' ? 'border-green-200 bg-green-50' :
                notification.type === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                'border-blue-200 bg-blue-50'}
            `}
          >
            {notification.type === 'success' ? <CheckCircle className="h-4 w-4" /> :
             notification.type === 'warning' ? <AlertTriangle className="h-4 w-4" /> :
             <Info className="h-4 w-4" />}
            <AlertDescription className="text-sm">
              {notification.message}
            </AlertDescription>
          </Alert>
        ))}
      </div>
    )
  );

  return (
    <div className="space-y-6">
      <NotificationPanel />
      <WorkflowProgress />

      <Tabs value={workflow.activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="design" className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4" />
            <span>Design Assistant</span>
            {getStepStatus('design') === 'completed' && <CheckCircle className="w-3 h-3 text-green-500" />}
          </TabsTrigger>
          
          <TabsTrigger value="registry" className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4" />
            <span>Component Registry</span>
            {getStepStatus('registry') === 'completed' && <CheckCircle className="w-3 h-3 text-green-500" />}
          </TabsTrigger>
          
          <TabsTrigger value="code" className="flex items-center space-x-2">
            <FileCode className="w-4 h-4" />
            <span>Code Editor</span>
            {workflow.isCodeSaved && <CheckCircle className="w-3 h-3 text-green-500" />}
            {workflow.generatedCode && !workflow.isCodeSaved && <AlertTriangle className="w-3 h-3 text-yellow-500" />}
          </TabsTrigger>
          
          <TabsTrigger value="preview" className="flex items-center space-x-2">
            <Eye className="w-4 h-4" />
            <span>Preview</span>
            {getStepStatus('preview') === 'completed' && <CheckCircle className="w-3 h-3 text-green-500" />}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="design" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <Sparkles className="w-6 h-6 text-green-600" />
                <span>AI Design Assistant</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Component Creation
                </Badge>
              </CardTitle>
              <p className="text-muted-foreground">
                Create React components with AI assistance. Describe what you want to build and I'll generate the code.
              </p>
            </CardHeader>
            <CardContent>
              <SimpleDesignAssistant onComponentGenerated={handleComponentGenerated} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="registry" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-3">
                    <BookOpen className="w-6 h-6 text-blue-600" />
                    <span>Component Registry</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      Browse & Modify
                    </Badge>
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Browse existing components, make modifications, or select components for editing.
                  </p>
                </div>
                {workflow.componentName && workflow.generatedCode && (
                  <Button 
                    onClick={() => handleTabChange('code')}
                    className="flex items-center gap-2"
                  >
                    <FileCode className="h-4 w-4" />
                    Edit {workflow.componentName}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {workflow.componentName && workflow.generatedCode && (
                <Alert className="mb-6 border-blue-200 bg-blue-50">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    🎉 <strong>{workflow.componentName}</strong> was just created! You can now modify it here or edit the code directly.
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" onClick={() => handleTabChange('code')}>
                        <FileCode className="h-3 w-3 mr-1" />
                        Edit Code
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleTabChange('preview')}>
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
              <ComponentRegistry 
                onSelectComponent={handleComponentSelected}
                onModifyComponent={(name, instructions) => {
                  addNotification('info', `Modifying ${name}: ${instructions}`);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="code" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-3">
                    <FileCode className="w-6 h-6 text-purple-600" />
                    <span>Code Editor</span>
                    <Badge variant={workflow.isCodeSaved ? "default" : "secondary"}>
                      {workflow.isCodeSaved ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Saved
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Unsaved Changes
                        </>
                      )}
                    </Badge>
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Edit your component code with live preview and version control.
                  </p>
                </div>
                {workflow.generatedCode && workflow.isCodeSaved && (
                  <Button 
                    onClick={() => handleTabChange('preview')}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Preview Component
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!workflow.generatedCode ? (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    No component code available. Create a component in the Design Assistant first or select one from the Registry.
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" onClick={() => handleTabChange('design')}>
                        <Sparkles className="h-3 w-3 mr-1" />
                        Create Component
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleTabChange('registry')}>
                        <BookOpen className="h-3 w-3 mr-1" />
                        Browse Registry
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : (
                <ComponentEditor
                  componentName={workflow.componentName}
                  initialCode={workflow.generatedCode}
                  onSave={handleCodeSaved}
                  onPreview={(code) => {
                    addNotification('info', 'Opening live preview...');
                  }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-3">
                    <Eye className="w-6 h-6 text-indigo-600" />
                    <span>Live Preview</span>
                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700">
                      Interactive Demo
                    </Badge>
                  </CardTitle>
                  <p className="text-muted-foreground">
                    See your component in action with responsive preview and theme switching.
                  </p>
                </div>
                {workflow.generatedCode && (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleTabChange('code')}>
                      <FileCode className="h-4 w-4 mr-2" />
                      Edit Code
                    </Button>
                    <Button onClick={() => {
                      addNotification('success', '🎉 Workflow completed! Your component is ready for production.');
                      setWorkflow(prev => ({ ...prev, workflowStep: 'complete' }));
                    }}>
                      <Save className="h-4 w-4 mr-2" />
                      Complete Workflow
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {!workflow.generatedCode ? (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    No component available for preview. Complete the workflow by creating and editing a component first.
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" onClick={() => handleTabChange('design')}>
                        <Sparkles className="h-3 w-3 mr-1" />
                        Start Workflow
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : (
                <ComponentPreview 
                  componentCode={workflow.generatedCode}
                  onModify={(instructions) => {
                    addNotification('info', `Modifying component: ${instructions}`);
                    handleTabChange('code');
                  }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkflowManager;
