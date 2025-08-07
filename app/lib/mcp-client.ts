
import { McpIntegrationResult } from './types';

export class McpClient {
  private baseUrl: string;
  private appId: string;

  constructor(baseUrl: string = "https://apps.abacus.ai/chatllm/", appId: string = "1573da0c2c") {
    this.baseUrl = baseUrl;
    this.appId = appId;
  }

  async testRoute(message: string, config?: Record<string, any>): Promise<McpIntegrationResult> {
    const startTime = Date.now();
    
    try {
      // Since we're working with ABACUS MCP, we'll use our API route to interact with it
      const response = await fetch('/api/mcp/test-route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          appId: this.appId,
          config: config || {},
        }),
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        route: data.route,
        confidence: data.confidence,
        responseTime,
        rawResponse: data,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        success: false,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async streamRoute(
    message: string, 
    config?: Record<string, any>
  ): Promise<ReadableStream<Uint8Array>> {
    const response = await fetch('/api/mcp/stream-route', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        appId: this.appId,
        config: config || {},
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.body!;
  }

  getEmbedUrl(hideTopBar: boolean = true): string {
    return `${this.baseUrl}?appId=${this.appId}&hideTopBar=${hideTopBar ? '2' : '0'}`;
  }
}

export const defaultMcpClient = new McpClient();
