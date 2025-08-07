
import { McpConfiguration, TestCase, StreamingResponse } from './types';

export class McpUtils {
  static parseStreamResponse(chunk: string): StreamingResponse | null {
    try {
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            return null;
          }
          return JSON.parse(data) as StreamingResponse;
        }
      }
      return null;
    } catch (error) {
      console.error('Error parsing stream response:', error);
      return null;
    }
  }

  static generateTestCases(scenario: string): TestCase[] {
    const baseTestCases: TestCase[] = [
      {
        id: 'basic-greeting',
        name: 'Basic Greeting',
        input: 'Hello, how are you?',
        expectedOutput: 'greeting',
        tags: ['basic', 'greeting'],
        priority: 'high'
      },
      {
        id: 'help-request',
        name: 'Help Request',
        input: 'Can you help me with something?',
        expectedOutput: 'support',
        tags: ['support', 'help'],
        priority: 'high'
      },
      {
        id: 'complex-query',
        name: 'Complex Query',
        input: 'I need to analyze customer feedback and generate a report with sentiment analysis',
        expectedOutput: 'analysis',
        tags: ['complex', 'analysis'],
        priority: 'medium'
      }
    ];

    // Add scenario-specific test cases
    if (scenario.includes('routing')) {
      baseTestCases.push({
        id: 'routing-specific',
        name: 'Routing Test',
        input: 'Route this message to the appropriate handler',
        expectedOutput: 'routing',
        tags: ['routing', 'specific'],
        priority: 'high'
      });
    }

    if (scenario.includes('error')) {
      baseTestCases.push({
        id: 'error-handling',
        name: 'Error Handling',
        input: 'This is an invalid request that should trigger error handling',
        expectedOutput: 'error',
        tags: ['error', 'exception'],
        priority: 'medium'
      });
    }

    return baseTestCases;
  }

  static calculateSuccessRate(results: Array<{ success: boolean }>): number {
    if (results.length === 0) return 0;
    const successCount = results.filter(r => r.success).length;
    return (successCount / results.length) * 100;
  }

  static calculateAverageResponseTime(results: Array<{ responseTime?: number }>): number {
    const validResults = results.filter(r => typeof r.responseTime === 'number');
    if (validResults.length === 0) return 0;
    
    const total = validResults.reduce((sum, r) => sum + r.responseTime!, 0);
    return total / validResults.length;
  }

  static validateConfiguration(config: Partial<McpConfiguration>): string[] {
    const errors: string[] = [];

    if (!config.name || config.name.trim().length === 0) {
      errors.push('Configuration name is required');
    }

    if (!config.appId || config.appId.trim().length === 0) {
      errors.push('App ID is required');
    }

    if (!config.baseUrl || config.baseUrl.trim().length === 0) {
      errors.push('Base URL is required');
    }

    try {
      new URL(config.baseUrl || '');
    } catch {
      errors.push('Base URL must be a valid URL');
    }

    return errors;
  }

  static generateRoutingScenarios(): Array<{ name: string; description: string; testCases: TestCase[] }> {
    return [
      {
        name: 'Basic Routing',
        description: 'Test basic message routing capabilities',
        testCases: this.generateTestCases('routing basic')
      },
      {
        name: 'Error Handling',
        description: 'Test error handling and fallback scenarios',
        testCases: this.generateTestCases('error handling')
      },
      {
        name: 'Complex Queries',
        description: 'Test routing of complex, multi-intent messages',
        testCases: this.generateTestCases('complex queries')
      },
      {
        name: 'Load Testing',
        description: 'Test performance under multiple concurrent requests',
        testCases: this.generateTestCases('load testing')
      }
    ];
  }

  static formatResponseTime(ms: number): string {
    if (ms < 1000) {
      return `${ms}ms`;
    } else if (ms < 60000) {
      return `${(ms / 1000).toFixed(1)}s`;
    } else {
      return `${(ms / 60000).toFixed(1)}m`;
    }
  }

  static getStatusColor(status: string): string {
    switch (status) {
      case 'passed':
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'failed':
      case 'error':
        return 'text-red-600 bg-red-100';
      case 'running':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }
}
