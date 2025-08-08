import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

interface TestComponentProps {
  // Add your props here
}

export const TestComponent: React.FC<TestComponentProps> = (props) => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Test Component
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          This is a test component to verify live rendering functionality!
        </p>
        <div className="flex gap-2 mb-3">
          <Badge variant="default">Live</Badge>
          <Badge variant="secondary">Rendering</Badge>
          <Badge variant="outline">Active</Badge>
        </div>
        <Button className="w-full">
          <Sparkles className="h-4 w-4 mr-2" />
          Rendered Successfully!
        </Button>
      </CardContent>
    </Card>
  );
};

export default TestComponent;
