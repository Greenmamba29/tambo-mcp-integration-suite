
export interface McpConfiguration {
  id: string;
  name: string;
  description?: string;
  appId: string;
  baseUrl: string;
  config: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoutingTest {
  id: string;
  inputMessage: string;
  expectedRoute?: string;
  actualRoute?: string;
  confidence?: number;
  responseTime?: number;
  status: 'pending' | 'running' | 'passed' | 'failed';
  errorMessage?: string;
  metadata?: Record<string, any>;
  executedAt?: Date;
  createdAt: Date;
}

export interface TestSuite {
  id: string;
  name: string;
  description?: string;
  testCases: TestCase[];
  expectedResults: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  lastRunAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestCase {
  id: string;
  name: string;
  input: string;
  expectedOutput?: string;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
}

export interface Analytics {
  id: string;
  mcpConfigId: string;
  date: Date;
  totalRequests: number;
  successRate: number;
  avgResponse: number;
  routingData: Record<string, any>;
  errorCount: number;
  metadata?: Record<string, any>;
}

export interface StreamingResponse {
  status: 'processing' | 'completed' | 'error';
  message?: string;
  result?: any;
  progress?: number;
}

export interface McpIntegrationResult {
  success: boolean;
  route?: string;
  confidence?: number;
  responseTime: number;
  rawResponse?: any;
  error?: string;
}

export interface IntegrationExample {
  id: string;
  name: string;
  category: string;
  description: string;
  codeExample: string;
  metadata?: Record<string, any>;
  isPublic: boolean;
}
