// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { ApiWithAuth } from "@/lib/auth";
import type { MessageRecord } from '@/components/ai/search-ai';
import fs from 'fs';

const openai = new OpenAI({
  apiKey: process.env.SOLVER_API_KEY,
  baseURL: process.env.SOLVER_URL,
});

export const POST = ApiWithAuth(async (request: NextRequest) => {
  try {
    const { messages } = await request.json();
    const customTemplatePath = './content/ds-template.txt';
    const defaultTemplatePath = './content/ds-template-default.txt';
    const templatePath = fs.existsSync(customTemplatePath)
                           ? customTemplatePath
                           : defaultTemplatePath;
    const template = fs.readFileSync(templatePath, 'utf8');
    
    const stream = await openai.chat.completions.create({
      model: process.env.SOLVER_MODEL || '',
      messages: [
        {
          role: 'system',
          content: 'Format code blocks with appropriate language tags'
        },
        {
          role: 'system',
          content: template
        },
        ...messages.map((msg: MessageRecord) => ({
          role: msg.role,
          content: msg.content
        }))
      ],
      stream: true,
    }, { signal: request.signal });

    const encoder = new TextEncoder();
    
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
          );
        }
        controller.close();
      },
      cancel() {
        // Handle stream cancellation
        stream.controller.abort();
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
    console.error('OpenAI API error:', err);
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
