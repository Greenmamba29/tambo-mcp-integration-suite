
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { message, appId, config } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Simulate MCP routing logic with ABACUS integration
    const startTime = Date.now();

    // Use the ABACUS LLM API to analyze the routing
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: `You are TAMBO MCP Router. Analyze the incoming message and determine the appropriate routing category.
            
            Available routes:
            - greeting: Simple greetings and pleasantries
            - support: Help requests and support queries
            - analysis: Complex analysis requests
            - routing: Routing-specific queries
            - error: Error cases or invalid requests
            - general: General queries that don't fit other categories
            
            Respond with a confidence score (0-1) and brief reasoning.
            
            Format your response as JSON:
            {
              "route": "category_name",
              "confidence": 0.95,
              "reasoning": "Brief explanation of the routing decision"
            }`
          },
          {
            role: 'user',
            content: message
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 300,
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      throw new Error(`ABACUS API error: ${response.status}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    
    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      route: result.route,
      confidence: result.confidence,
      reasoning: result.reasoning,
      responseTime,
      appId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('MCP Test Route Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
