// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ApiWithAuth } from "@/lib/auth";
import type { MessageRecord } from '@/components/ai/search-ai';
import { Ollama } from 'ollama';

const ollama = new Ollama({
  host: process.env.LLAMA_URL,
});

export const POST = ApiWithAuth(async (request: NextRequest) => {
  try {
    const { messages } = await request.json();
     
    const stream = await ollama.chat({
      model: 'llama3.3:latest',
      messages: [
        {
          role: 'system',
          content: 'Format code blocks with appropriate language tags'
        },
        ...messages.map((msg: MessageRecord) => ({
          role: msg.role,
          content: msg.content
        }))
      ],
      options: { "num_ctx": 16384 },
      stream: true,
    });

    const encoder = new TextEncoder();
    
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content = chunk.message?.content || '';
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
          );
        }
        controller.close();
      },
      cancel() {
        // Ignore stream cancellation
      }
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      return new Response(null, { status: 499 });
    }
    console.error('Ollama API error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
