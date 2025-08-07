
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      name: 'John Doe',
      image: null,
    },
  });

  console.log('✅ Created admin user:', adminUser.email);

  // Create default MCP configuration
  const defaultConfig = await prisma.mcpConfiguration.upsert({
    where: { id: 'default-tambo-config' },
    update: {},
    create: {
      id: 'default-tambo-config',
      userId: adminUser.id,
      name: 'TAMBO BUDDY Default',
      description: 'Default configuration for TAMBO MCP integration',
      appId: '1573da0c2c',
      baseUrl: 'https://apps.abacus.ai/chatllm/',
      config: {
        timeout: 30000,
        retryAttempts: 3,
        enableStreaming: true,
        enableAnalytics: true,
        confidenceThreshold: 0.7,
        routes: {
          greeting: ['hello', 'hi', 'hey', 'good morning', 'good afternoon'],
          support: ['help', 'assist', 'support', 'problem', 'issue', 'bug'],
          analysis: ['analyze', 'analysis', 'report', 'insights', 'data', 'metrics'],
          general: ['what', 'how', 'when', 'where', 'why', 'explain']
        }
      },
      isActive: true,
    },
  });

  console.log('✅ Created default MCP configuration');

  // Create sample test suites
  const testSuites = [
    {
      name: 'Basic Routing Tests',
      description: 'Test basic message routing capabilities',
      testCases: [
        { id: 'greeting-1', name: 'Simple Greeting', input: 'Hello there!', expectedOutput: 'greeting', tags: ['basic', 'greeting'], priority: 'high' },
        { id: 'support-1', name: 'Help Request', input: 'I need help with my account', expectedOutput: 'support', tags: ['support', 'account'], priority: 'high' },
        { id: 'analysis-1', name: 'Analysis Request', input: 'Can you analyze the sales data from last quarter?', expectedOutput: 'analysis', tags: ['analysis', 'data'], priority: 'medium' },
      ],
      expectedResults: {
        successRate: 90,
        avgConfidence: 0.85,
        routes: ['greeting', 'support', 'analysis']
      }
    },
    {
      name: 'Edge Cases',
      description: 'Test edge cases and error handling',
      testCases: [
        { id: 'empty-1', name: 'Empty Message', input: '', expectedOutput: 'error', tags: ['edge', 'error'], priority: 'medium' },
        { id: 'long-1', name: 'Very Long Message', input: 'This is a very long message that goes on and on and contains multiple different intents and should test how the system handles complex multi-intent messages with various routing possibilities', expectedOutput: 'general', tags: ['edge', 'long'], priority: 'low' },
        { id: 'special-1', name: 'Special Characters', input: '!@#$%^&*()_+ Hello?', expectedOutput: 'greeting', tags: ['edge', 'special'], priority: 'medium' },
      ],
      expectedResults: {
        successRate: 70,
        avgConfidence: 0.65,
        routes: ['error', 'general', 'greeting']
      }
    },
    {
      name: 'Performance Tests',
      description: 'Test performance and load handling',
      testCases: [
        { id: 'perf-1', name: 'Quick Response', input: 'Hi', expectedOutput: 'greeting', tags: ['performance', 'quick'], priority: 'high' },
        { id: 'perf-2', name: 'Complex Query', input: 'I need a comprehensive analysis of our customer satisfaction metrics, including sentiment analysis, trend identification, and actionable recommendations for improving our service quality', expectedOutput: 'analysis', tags: ['performance', 'complex'], priority: 'high' },
      ],
      expectedResults: {
        successRate: 95,
        avgConfidence: 0.90,
        responseTimeThreshold: 1000
      }
    }
  ];

  for (const suite of testSuites) {
    const testSuite = await prisma.testSuite.create({
      data: {
        userId: adminUser.id,
        mcpConfigId: defaultConfig.id,
        name: suite.name,
        description: suite.description,
        testCases: suite.testCases,
        expectedResults: suite.expectedResults,
        status: 'pending',
      },
    });
    console.log(`✅ Created test suite: ${suite.name}`);
  }

  // Create sample routing tests
  const sampleTests = [
    {
      inputMessage: 'Hello, how are you today?',
      expectedRoute: 'greeting',
      actualRoute: 'greeting',
      confidence: 0.95,
      responseTime: 245,
      status: 'passed',
      executedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      inputMessage: 'Can you help me with billing?',
      expectedRoute: 'support',
      actualRoute: 'support',
      confidence: 0.88,
      responseTime: 312,
      status: 'passed',
      executedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    },
    {
      inputMessage: 'Analyze customer feedback trends',
      expectedRoute: 'analysis',
      actualRoute: 'analysis',
      confidence: 0.92,
      responseTime: 567,
      status: 'passed',
      executedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    },
    {
      inputMessage: 'What is the weather like?',
      expectedRoute: 'general',
      actualRoute: 'support',
      confidence: 0.65,
      responseTime: 423,
      status: 'failed',
      errorMessage: 'Route mismatch: expected general, got support',
      executedAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    },
  ];

  for (const test of sampleTests) {
    await prisma.routingTest.create({
      data: {
        userId: adminUser.id,
        mcpConfigId: defaultConfig.id,
        ...test,
      },
    });
  }

  console.log('✅ Created sample routing tests');

  // Create analytics data
  const analyticsData = [
    {
      mcpConfigId: defaultConfig.id,
      date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      totalRequests: 156,
      successRate: 94.2,
      avgResponse: 278,
      routingData: {
        greeting: 45,
        support: 67,
        analysis: 28,
        general: 16
      },
      errorCount: 9,
    },
    {
      mcpConfigId: defaultConfig.id,
      date: new Date(), // Today
      totalRequests: 89,
      successRate: 96.6,
      avgResponse: 245,
      routingData: {
        greeting: 23,
        support: 34,
        analysis: 21,
        general: 11
      },
      errorCount: 3,
    },
  ];

  for (const analytics of analyticsData) {
    await prisma.analytics.create({
      data: analytics,
    });
  }

  console.log('✅ Created analytics data');

  // Create integration examples
  const integrationExamples = [
    {
      name: 'Basic Route Testing',
      category: 'testing',
      description: 'Simple example of testing message routing',
      codeExample: `import { McpClient } from '@/lib/mcp-client';

const client = new McpClient();

// Test a single message
const result = await client.testRoute('Hello there!');
console.log('Route:', result.route);
console.log('Confidence:', result.confidence);
console.log('Response Time:', result.responseTime);`,
      metadata: {
        language: 'typescript',
        difficulty: 'beginner',
        tags: ['routing', 'testing', 'basic']
      },
    },
    {
      name: 'Streaming Integration',
      category: 'streaming',
      description: 'Real-time streaming route analysis',
      codeExample: `import { McpClient } from '@/lib/mcp-client';
import { McpUtils } from '@/lib/mcp-utils';

const client = new McpClient();

// Stream route analysis
const stream = await client.streamRoute(message);
const reader = stream.getReader();
const decoder = new TextDecoder();

let partialRead = '';
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  partialRead += decoder.decode(value, { stream: true });
  const response = McpUtils.parseStreamResponse(partialRead);
  
  if (response?.status === 'completed') {
    console.log('Final result:', response.result);
    break;
  }
}`,
      metadata: {
        language: 'typescript',
        difficulty: 'intermediate',
        tags: ['streaming', 'real-time', 'advanced']
      },
    },
    {
      name: 'Batch Testing',
      category: 'testing',
      description: 'Running multiple tests in batch',
      codeExample: `import { McpClient } from '@/lib/mcp-client';
import { McpUtils } from '@/lib/mcp-utils';

const client = new McpClient();
const testCases = McpUtils.generateTestCases('routing');

const results = [];
for (const testCase of testCases) {
  const result = await client.testRoute(testCase.input);
  results.push({
    ...result,
    expected: testCase.expectedOutput,
    passed: result.route === testCase.expectedOutput
  });
}

const successRate = McpUtils.calculateSuccessRate(results);
console.log('Batch test success rate:', successRate);`,
      metadata: {
        language: 'typescript',
        difficulty: 'intermediate',
        tags: ['batch', 'testing', 'automation']
      },
    },
    {
      name: 'Custom Configuration',
      category: 'configuration',
      description: 'Setting up custom MCP configurations',
      codeExample: `import { McpClient } from '@/lib/mcp-client';

// Create client with custom configuration
const customConfig = {
  timeout: 10000,
  retryAttempts: 5,
  confidenceThreshold: 0.8,
  customRoutes: {
    'billing': ['payment', 'invoice', 'billing', 'charge'],
    'technical': ['bug', 'error', 'crash', 'performance']
  }
};

const client = new McpClient('https://apps.abacus.ai/chatllm/', '1573da0c2c');
const result = await client.testRoute('Payment issue', customConfig);

console.log('Custom routing result:', result);`,
      metadata: {
        language: 'typescript',
        difficulty: 'advanced',
        tags: ['configuration', 'customization', 'setup']
      },
    },
    {
      name: 'Analytics and Monitoring',
      category: 'monitoring',
      description: 'Collecting and analyzing routing metrics',
      codeExample: `import { McpUtils } from '@/lib/mcp-utils';

// Simulate collecting routing results
const routingResults = [
  { success: true, responseTime: 245, route: 'support' },
  { success: true, responseTime: 312, route: 'analysis' },
  { success: false, responseTime: 1200, error: 'timeout' }
];

// Calculate metrics
const successRate = McpUtils.calculateSuccessRate(routingResults);
const avgResponseTime = McpUtils.calculateAverageResponseTime(routingResults);

console.log('Success Rate:', successRate + '%');
console.log('Average Response Time:', avgResponseTime + 'ms');

// Route distribution analysis
const routeDistribution = {};
routingResults.forEach(result => {
  if (result.route) {
    routeDistribution[result.route] = (routeDistribution[result.route] || 0) + 1;
  }
});

console.log('Route Distribution:', routeDistribution);`,
      metadata: {
        language: 'typescript',
        difficulty: 'intermediate',
        tags: ['analytics', 'monitoring', 'metrics']
      },
    },
  ];

  for (const example of integrationExamples) {
    await prisma.integrationExample.create({
      data: example,
    });
  }

  console.log('✅ Created integration examples');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
