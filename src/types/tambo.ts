// Tambo Framework Types - Mock implementation for demonstration
import { ComponentType } from 'react';

export interface TamboProp {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'function';
  description: string;
  required?: boolean;
  default?: any;
}

export interface TamboExample {
  name: string;
  props: Record<string, any>;
  description?: string;
}

export interface TamboComponent {
  name: string;
  description: string;
  component: ComponentType<any>;
  category?: string;
  tags?: string[];
  props?: Record<string, TamboProp>;
  examples?: TamboExample[];
}

export interface TamboToolParameter {
  type: string;
  description: string;
  enum?: string[];
  items?: { type: string };
  default?: any;
}

export interface TamboToolParameters {
  type: 'object';
  properties: Record<string, TamboToolParameter>;
  required?: string[];
}

export interface TamboTool {
  name: string;
  description: string;
  parameters: TamboToolParameters;
  handler: (params: any) => Promise<any>;
}

// Mock Tambo Provider Props
export interface TamboProviderProps {
  components: TamboComponent[];
  tools: TamboTool[];
  apiKey?: string;
  children: React.ReactNode;
}

// Mock hooks
export interface TamboHookResult {
  sendMessage: (message: string, options?: any) => Promise<any>;
  isLoading: boolean;
}

export interface TamboThreadResult {
  messages: any[];
  thread: any;
}