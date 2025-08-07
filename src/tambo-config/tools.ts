import { TamboTool } from '../types/tambo';
import { findComponent, sampleComponents } from './components';

export const designTools: TamboTool[] = [
  {
    name: 'analyze_design_patterns',
    description: 'Analyze current design patterns and suggest improvements',
    parameters: {
      type: 'object',
      properties: {
        componentType: {
          type: 'string',
          description: 'Type of component to analyze'
        },
        currentImplementation: {
          type: 'string',
          description: 'Current component code or description'
        }
      },
      required: ['componentType']
    },
    handler: async ({ componentType, currentImplementation }) => {
      const component = findComponent(componentType);
      
      const suggestions = [
        'Improve accessibility with ARIA labels',
        'Add loading states and error handling',
        'Implement responsive design patterns',
        'Consider dark mode support',
        'Add keyboard navigation support',
        'Optimize for performance with memo/callback',
        'Add proper TypeScript types',
        'Include comprehensive prop validation'
      ];

      if (component) {
        suggestions.unshift(`Follow ${component.name} patterns from the component library`);
      }

      return {
        analysis: `Design analysis for ${componentType}`,
        component: component || null,
        suggestions,
        bestPractices: [
          'Use semantic HTML elements',
          'Follow design system tokens',
          'Implement proper focus management',
          'Add meaningful error messages',
          'Use consistent spacing and typography'
        ]
      };
    }
  },
  {
    name: 'generate_component_variants',
    description: 'Generate different variants of a component based on design requirements',
    parameters: {
      type: 'object',
      properties: {
        baseComponent: {
          type: 'string',
          description: 'Base component name to create variants from'
        },
        variantTypes: {
          type: 'array',
          items: { type: 'string' },
          description: 'Types of variants to generate (size, color, layout, etc.)'
        },
        requirements: {
          type: 'string',
          description: 'Specific requirements for the variants'
        }
      },
      required: ['baseComponent', 'variantTypes']
    },
    handler: async ({ baseComponent, variantTypes, requirements }) => {
      const component = findComponent(baseComponent);
      
      const variants = variantTypes.map(type => ({
        type,
        options: getVariantOptions(type, component),
        implementation: generateVariantCode(baseComponent, type, requirements)
      }));

      return {
        baseComponent: component?.name || baseComponent,
        variants,
        totalVariants: variants.length,
        recommendations: [
          'Use CSS variables for consistent theming',
          'Implement variants with class-variance-authority',
          'Maintain accessibility across all variants',
          'Test variants in different screen sizes'
        ]
      };
    }
  },
  {
    name: 'update_component',
    description: 'Update an existing component with new features or modifications',
    parameters: {
      type: 'object',
      properties: {
        componentName: {
          type: 'string',
          description: 'Name of the component to update'
        },
        updateType: {
          type: 'string',
          enum: ['feature', 'styling', 'props', 'behavior', 'accessibility'],
          description: 'Type of update to perform'
        },
        updateDescription: {
          type: 'string',
          description: 'Description of the update requirements'
        },
        preserveExisting: {
          type: 'boolean',
          description: 'Whether to preserve existing functionality',
          default: true
        }
      },
      required: ['componentName', 'updateType', 'updateDescription']
    },
    handler: async ({ componentName, updateType, updateDescription, preserveExisting }) => {
      const component = findComponent(componentName);
      
      if (!component) {
        return {
          error: `Component '${componentName}' not found in registry`,
          suggestions: sampleComponents.map(c => c.name).slice(0, 5)
        };
      }

      const updatePlan = generateUpdatePlan(component, updateType, updateDescription);
      
      return {
        component: component.name,
        updateType,
        currentVersion: component,
        updatePlan,
        estimatedComplexity: calculateComplexity(updateType, updateDescription),
        preserveExisting,
        nextSteps: [
          'Review current component implementation',
          'Identify breaking changes',
          'Update component props and types',
          'Modify component logic',
          'Update documentation and examples',
          'Test component variants'
        ]
      };
    }
  },
  {
    name: 'search_components',
    description: 'Search for components by name, category, tags, or functionality',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query (component name, functionality, or keywords)'
        },
        category: {
          type: 'string',
          description: 'Filter by component category'
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Filter by tags'
        }
      },
      required: ['query']
    },
    handler: async ({ query, category, tags }) => {
      let results = sampleComponents;

      // Filter by query
      if (query) {
        results = results.filter(comp =>
          comp.name.toLowerCase().includes(query.toLowerCase()) ||
          comp.description.toLowerCase().includes(query.toLowerCase()) ||
          comp.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );
      }

      // Filter by category
      if (category) {
        results = results.filter(comp => comp.category === category);
      }

      // Filter by tags
      if (tags && tags.length > 0) {
        results = results.filter(comp =>
          tags.some(tag => comp.tags?.includes(tag))
        );
      }

      return {
        query,
        filters: { category, tags },
        results: results.map(comp => ({
          name: comp.name,
          description: comp.description,
          category: comp.category,
          tags: comp.tags,
          propsCount: Object.keys(comp.props || {}).length,
          examplesCount: comp.examples?.length || 0
        })),
        totalResults: results.length,
        suggestions: results.length === 0 ? [
          'Try broader search terms',
          'Check available categories',
          'Browse all components',
          'Create a new component'
        ] : []
      };
    }
  },
  {
    name: 'get_component_documentation',
    description: 'Get comprehensive documentation for a specific component',
    parameters: {
      type: 'object',
      properties: {
        componentName: {
          type: 'string',
          description: 'Name of the component to get documentation for'
        },
        includeExamples: {
          type: 'boolean',
          description: 'Whether to include usage examples',
          default: true
        }
      },
      required: ['componentName']
    },
    handler: async ({ componentName, includeExamples }) => {
      const component = findComponent(componentName);
      
      if (!component) {
        return {
          error: `Component '${componentName}' not found`,
          availableComponents: sampleComponents.map(c => c.name)
        };
      }

      return {
        name: component.name,
        description: component.description,
        category: component.category,
        tags: component.tags,
        props: component.props,
        examples: includeExamples ? component.examples : undefined,
        usage: generateUsageExamples(component),
        relatedComponents: findRelatedComponents(component),
        lastUpdated: new Date().toISOString()
      };
    }
  }
];

// Helper functions
function getVariantOptions(type: string, component: any) {
  const options = {
    size: ['xs', 'sm', 'md', 'lg', 'xl'],
    color: ['primary', 'secondary', 'accent', 'muted', 'destructive'],
    layout: ['horizontal', 'vertical', 'grid', 'flex'],
    style: ['filled', 'outlined', 'ghost', 'minimal'],
    state: ['default', 'loading', 'error', 'success']
  };
  
  return options[type] || ['default', 'alternative'];
}

function generateVariantCode(baseComponent: string, type: string, requirements?: string) {
  return `// ${type} variant for ${baseComponent}
// Generated based on: ${requirements || 'standard patterns'}
const ${baseComponent}${type.charAt(0).toUpperCase() + type.slice(1)} = ({ variant = 'default', ...props }) => {
  // Implementation would be generated here
  return <${baseComponent} className={\`variant-\${variant}\`} {...props} />;
};`;
}

function generateUpdatePlan(component: any, updateType: string, description: string) {
  const plans = {
    feature: [
      'Add new prop definitions',
      'Implement feature logic',
      'Update component interface',
      'Add feature tests'
    ],
    styling: [
      'Update design system tokens',
      'Modify component styles',
      'Add responsive variants',
      'Test visual consistency'
    ],
    props: [
      'Define new prop types',
      'Update prop validation',
      'Handle backward compatibility',
      'Update documentation'
    ],
    behavior: [
      'Modify component logic',
      'Update event handlers',
      'Test user interactions',
      'Ensure accessibility'
    ],
    accessibility: [
      'Add ARIA attributes',
      'Improve keyboard navigation',
      'Enhance screen reader support',
      'Test with accessibility tools'
    ]
  };
  
  return plans[updateType] || ['Review requirements', 'Plan implementation', 'Execute changes', 'Test thoroughly'];
}

function calculateComplexity(updateType: string, description: string) {
  const complexity = {
    styling: 'Low',
    props: 'Medium',
    feature: 'High',
    behavior: 'Medium',
    accessibility: 'Medium'
  };
  
  return complexity[updateType] || 'Medium';
}

function generateUsageExamples(component: any) {
  return [
    {
      title: 'Basic Usage',
      code: `<${component.name} ${Object.entries(component.props || {})
        .filter(([_, prop]: [string, any]) => prop.required)
        .map(([name, prop]: [string, any]) => `${name}="${prop.description}"`)
        .join(' ')} />`
    },
    {
      title: 'With All Props',
      code: `<${component.name}\n${Object.entries(component.props || {})
        .map(([name, prop]: [string, any]) => `  ${name}={${prop.type === 'string' ? '"example"' : 'value'}}`).join('\n')}\n/>`
    }
  ];
}

function findRelatedComponents(component: any) {
  return sampleComponents
    .filter(comp => 
      comp.name !== component.name && 
      (comp.category === component.category || 
       comp.tags?.some(tag => component.tags?.includes(tag)))
    )
    .map(comp => ({ name: comp.name, description: comp.description }))
    .slice(0, 3);
}