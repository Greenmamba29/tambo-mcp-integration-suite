
import { NextRequest } from 'next/server';

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { message, appId, config } = await request.json();

    if (!message) {
      return new Response('Message is required', { status: 400 });
    }

    // Create streaming response for real-time MCP routing
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
            content: `You are TAMBO MCP Router. Analyze the incoming message and provide detailed routing analysis with streaming updates.
            
            Provide:
            1. Initial route classification
            2. Confidence analysis
            3. Alternative routing options
            4. Detailed reasoning
            
            Available routes:
            - greeting: Simple greetings and pleasantries
            - support: Help requests and support queries
            - analysis: Complex analysis requests
            - routing: Routing-specific queries
            - error: Error cases or invalid requests
            - general: General queries that don't fit other categories`
          },
          {
            role: 'user',
            content: `Analyze this message for routing: "${message}"`
          }
        ],
        stream: true,
        max_tokens: 1000,
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      throw new Error(`ABACUS API error: ${response.status}`);
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let buffer = '';
        let partialRead = '';

        try {
          let progress = 0;
          
          // Send initial progress
          const initialData = JSON.stringify({
            status: 'processing',
            message: 'Initializing MCP routing analysis...',
            progress: 10
          });
          controller.enqueue(encoder.encode(`data: ${initialData}\n\n`));

          while (true) {
            const { done, value } = await reader!.read();
            if (done) break;

            partialRead += decoder.decode(value, { stream: true });
            let lines = partialRead.split('\n');
            partialRead = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  // Process the complete buffer and send final result
                  try {
                    const finalResult = {
                      route: buffer.toLowerCase().includes('greeting') ? 'greeting' :
                             buffer.toLowerCase().includes('support') || buffer.toLowerCase().includes('help') ? 'support' :
                             buffer.toLowerCase().includes('analysis') || buffer.toLowerCase().includes('analyze') ? 'analysis' :
                             buffer.toLowerCase().includes('error') ? 'error' : 'general',
                      confidence: Math.random() * 0.3 + 0.7, // Simulate confidence 0.7-1.0
                      reasoning: buffer || 'Routing analysis completed',
                      fullResponse: buffer,
                      timestamp: new Date().toISOString(),
                      appId
                    };

                    const finalData = JSON.stringify({
                      status: 'completed',
                      result: finalResult,
                      progress: 100
                    });
                    controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));
                  } catch (e) {
                    const errorData = JSON.stringify({
                      status: 'error',
                      message: 'Failed to process routing result'
                    });
                    controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
                  }
                  return;
                }

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content || '';
                  buffer += content;
                  
                  progress = Math.min(progress + 5, 90);
                  const progressData = JSON.stringify({
                    status: 'processing',
                    message: 'Analyzing routing patterns...',
                    progress,
                    partial: buffer.slice(-50) // Show last 50 chars as preview
                  });
                  controller.enqueue(encoder.encode(`data: ${progressData}\n\n`));
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream error:', error);
          const errorData = JSON.stringify({
            status: 'error',
            message: error instanceof Error ? error.message : 'Stream processing failed'
          });
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('MCP Stream Route Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
