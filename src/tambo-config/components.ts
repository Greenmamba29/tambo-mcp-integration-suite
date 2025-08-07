import { TamboComponent } from '../types/tambo';
import { DashboardCard } from '../components/examples/DashboardCard';
import { UserProfile } from '../components/examples/UserProfile';
import { DataChart } from '../components/examples/DataChart';
import { ChatInterface } from '../components/ChatInterface';
import { ComponentPreview } from '../components/ComponentPreview';
import { CodeEditor } from '../components/CodeEditor';

export const sampleComponents: TamboComponent[] = [
  {
    name: 'DashboardCard',
    description: 'A card component for displaying metrics and key information on dashboards',
    component: DashboardCard,
    category: 'display',
    tags: ['dashboard', 'metrics', 'card', 'data'],
    props: {
      title: {
        type: 'string',
        description: 'The title of the metric or information',
        required: true
      },
      value: {
        type: 'string',
        description: 'The main value to display',
        required: true
      },
      change: {
        type: 'number',
        description: 'Percentage change (optional)',
        required: false
      },
      icon: {
        type: 'string',
        description: 'Icon name (optional)',
        required: false
      },
      variant: {
        type: 'string',
        description: 'Card variant: default, success, warning, danger',
        required: false,
        default: 'default'
      }
    },
    examples: [
      {
        name: 'Revenue Card',
        props: {
          title: 'Total Revenue',
          value: '$124,563',
          change: 12.5,
          icon: 'DollarSign'
        }
      },
      {
        name: 'Users Card',
        props: {
          title: 'Active Users',
          value: '2,341',
          change: -3.2,
          icon: 'Users'
        }
      }
    ]
  },
  {
    name: 'UserProfile',
    description: 'User profile component with avatar, name, and additional information',
    component: UserProfile,
    category: 'user',
    tags: ['profile', 'user', 'avatar', 'contact'],
    props: {
      name: {
        type: 'string',
        description: 'User full name',
        required: true
      },
      email: {
        type: 'string',
        description: 'User email address',
        required: true
      },
      avatar: {
        type: 'string',
        description: 'Avatar image URL (optional)',
        required: false
      },
      role: {
        type: 'string',
        description: 'User role or title (optional)',
        required: false
      },
      status: {
        type: 'string',
        description: 'User status: online, offline, away',
        required: false,
        default: 'offline'
      }
    },
    examples: [
      {
        name: 'Basic Profile',
        props: {
          name: 'John Doe',
          email: 'john@example.com',
          role: 'Senior Developer'
        }
      }
    ]
  },
  {
    name: 'DataChart',
    description: 'Flexible chart component for data visualization using various chart types',
    component: DataChart,
    category: 'visualization',
    tags: ['chart', 'data', 'visualization', 'analytics'],
    props: {
      data: {
        type: 'array',
        description: 'Array of data points for the chart',
        required: true
      },
      type: {
        type: 'string',
        description: 'Chart type: line, bar, pie, area',
        required: true
      },
      title: {
        type: 'string',
        description: 'Chart title (optional)',
        required: false
      },
      height: {
        type: 'number',
        description: 'Chart height in pixels (optional, default: 300)',
        required: false,
        default: 300
      },
      colors: {
        type: 'array',
        description: 'Custom color palette for the chart',
        required: false
      }
    },
    examples: [
      {
        name: 'Revenue Line Chart',
        props: {
          type: 'line',
          title: 'Monthly Revenue',
          data: [
            { month: 'Jan', value: 1000 },
            { month: 'Feb', value: 1200 },
            { month: 'Mar', value: 1100 }
          ]
        }
      }
    ]
  },
  {
    name: 'ChatInterface',
    description: 'Interactive chat interface for AI conversations and component generation',
    component: ChatInterface,
    category: 'interaction',
    tags: ['chat', 'ai', 'conversation', 'interface'],
    props: {
      onSend: {
        type: 'function',
        description: 'Callback function when message is sent',
        required: true
      },
      isLoading: {
        type: 'boolean',
        description: 'Loading state indicator',
        required: false,
        default: false
      },
      placeholder: {
        type: 'string',
        description: 'Input placeholder text',
        required: false,
        default: 'Type your message...'
      },
      height: {
        type: 'string',
        description: 'Chat interface height',
        required: false,
        default: '600px'
      }
    },
    examples: [
      {
        name: 'Design Assistant Chat',
        props: {
          placeholder: 'Describe the component you want to create...',
          height: '500px'
        }
      }
    ]
  },
  {
    name: 'ComponentPreview',
    description: 'Live preview component for generated or existing components with modification tools',
    component: ComponentPreview,
    category: 'development',
    tags: ['preview', 'component', 'development', 'tools'],
    props: {
      componentCode: {
        type: 'string',
        description: 'Component source code to preview',
        required: true
      },
      onModify: {
        type: 'function',
        description: 'Callback for component modification requests',
        required: false
      }
    }
  },
  {
    name: 'CodeEditor',
    description: 'Code editor component with syntax highlighting and editing capabilities',
    component: CodeEditor,
    category: 'development',
    tags: ['editor', 'code', 'development', 'syntax'],
    props: {
      code: {
        type: 'string',
        description: 'Code content to edit',
        required: true
      },
      onChange: {
        type: 'function',
        description: 'Callback when code changes',
        required: false
      },
      readOnly: {
        type: 'boolean',
        description: 'Whether the editor is read-only',
        required: false,
        default: false
      },
      language: {
        type: 'string',
        description: 'Programming language for syntax highlighting',
        required: false,
        default: 'typescript'
      }
    }
  }
];

// Component registry for easy lookup and modification
export const componentRegistry = new Map(
  sampleComponents.map(comp => [comp.name.toLowerCase(), comp])
);

// Helper functions for component management
export const findComponent = (query: string): TamboComponent | undefined => {
  // Try exact match first
  const exactMatch = componentRegistry.get(query.toLowerCase());
  if (exactMatch) return exactMatch;

  // Search by tags or description
  return sampleComponents.find(comp => 
    comp.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase())) ||
    comp.description.toLowerCase().includes(query.toLowerCase()) ||
    comp.category?.toLowerCase().includes(query.toLowerCase())
  );
};

export const findComponentsByCategory = (category: string): TamboComponent[] => {
  return sampleComponents.filter(comp => comp.category === category);
};

export const findComponentsByTag = (tag: string): TamboComponent[] => {
  return sampleComponents.filter(comp => 
    comp.tags?.some(t => t.toLowerCase().includes(tag.toLowerCase()))
  );
};

export const getAllCategories = (): string[] => {
  return [...new Set(sampleComponents.map(comp => comp.category).filter(Boolean))];
};

export const getAllTags = (): string[] => {
  return [...new Set(sampleComponents.flatMap(comp => comp.tags || []))];
};