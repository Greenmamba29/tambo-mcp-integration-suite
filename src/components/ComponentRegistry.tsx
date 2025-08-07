import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Package, 
  Eye, 
  Code, 
  Tag, 
  Filter,
  BookOpen,
  Wrench,
  Sparkles
} from 'lucide-react';
import { 
  sampleComponents, 
  findComponent, 
  findComponentsByCategory, 
  findComponentsByTag,
  getAllCategories,
  getAllTags
} from '@/tambo-config/components';
import { designTools } from '@/tambo-config/tools';

interface ComponentRegistryProps {
  onSelectComponent?: (componentName: string) => void;
  onModifyComponent?: (componentName: string, instructions: string) => void;
}

export const ComponentRegistry: React.FC<ComponentRegistryProps> = ({
  onSelectComponent,
  onModifyComponent
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('browse');

  const categories = getAllCategories();
  const allTags = getAllTags();

  const filteredComponents = useMemo(() => {
    let results = sampleComponents;

    // Filter by search query
    if (searchQuery.trim()) {
      results = results.filter(comp =>
        comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory) {
      results = results.filter(comp => comp.category === selectedCategory);
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      results = results.filter(comp =>
        selectedTags.some(tag => comp.tags?.includes(tag))
      );
    }

    return results;
  }, [searchQuery, selectedCategory, selectedTags]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleQuickUpdate = async (componentName: string, updateType: string) => {
    try {
      const updateTool = designTools.find(tool => tool.name === 'update_component');
      if (updateTool) {
        const result = await updateTool.handler({
          componentName,
          updateType,
          updateDescription: `Quick ${updateType} update for ${componentName}`,
          preserveExisting: true
        });
        
        if (onModifyComponent) {
          onModifyComponent(componentName, `Apply ${updateType} improvements`);
        }
      }
    } catch (error) {
      console.error('Error updating component:', error);
    }
  };

  const ComponentCard = ({ component }: { component: any }) => (
    <Card className="gradient-card shadow-card hover:shadow-elegant transition-smooth">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              {component.name}
            </CardTitle>
            <CardDescription className="mt-1">
              {component.description}
            </CardDescription>
          </div>
          <Badge variant="outline" className="capitalize">
            {component.category}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Tags */}
        {component.tags && component.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {component.tags.map((tag: string) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs cursor-pointer hover:bg-accent"
                onClick={() => handleTagToggle(tag)}
              >
                <Tag className="h-2 w-2 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Props Summary */}
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">
            {Object.keys(component.props || {}).length} props
          </span>
          {component.examples && (
            <span className="ml-2">
              • {component.examples.length} examples
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectComponent?.(component.name)}
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickUpdate(component.name, 'styling')}
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Style
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuickUpdate(component.name, 'feature')}
          >
            <Wrench className="h-3 w-3 mr-1" />
            Enhance
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <BookOpen className="h-6 w-6" />
          Component Registry
        </h2>
        <p className="text-muted-foreground">
          Browse, search, and manage your Tambo components
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">
            <Package className="h-4 w-4 mr-2" />
            Browse
          </TabsTrigger>
          <TabsTrigger value="search">
            <Search className="h-4 w-4 mr-2" />
            Search
          </TabsTrigger>
          <TabsTrigger value="tools">
            <Wrench className="h-4 w-4 mr-2" />
            Tools
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="text-center p-4">
              <div className="text-2xl font-bold text-primary">{sampleComponents.length}</div>
              <div className="text-sm text-muted-foreground">Total Components</div>
            </Card>
            <Card className="text-center p-4">
              <div className="text-2xl font-bold text-accent-bright">{categories.length}</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </Card>
            <Card className="text-center p-4">
              <div className="text-2xl font-bold text-success">{allTags.length}</div>
              <div className="text-sm text-muted-foreground">Tags</div>
            </Card>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Browse by Category</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button
                variant={selectedCategory === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('')}
                className="justify-start"
              >
                All Components
              </Button>
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="justify-start capitalize"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Components Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredComponents.map(component => (
              <ComponentCard key={component.name} component={component} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="search" className="space-y-6">
          {/* Search Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Smart Component Search
              </CardTitle>
              <CardDescription>
                Find components by name, description, functionality, or tags
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for 'chat interface', 'dashboard', 'user profile'..."
                  className="pl-10"
                />
              </div>

              {/* Tag Filters */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Filter by tags:</div>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Search Results */}
              <div>
                <div className="text-sm text-muted-foreground mb-3">
                  Found {filteredComponents.length} components
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {filteredComponents.map(component => (
                    <ComponentCard key={component.name} component={component} />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-6">
          {/* Available Tools */}
          <div className="grid md:grid-cols-2 gap-4">
            {designTools.map(tool => (
              <Card key={tool.name} className="gradient-card">
                <CardHeader>
                  <CardTitle className="text-base">{tool.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Parameters:</div>
                    <div className="text-xs text-muted-foreground">
                      {Object.keys(tool.parameters.properties).join(', ')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};