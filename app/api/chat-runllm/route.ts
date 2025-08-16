// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ApiWithAuth } from "@/lib/auth";

// const baseURL = "https://api.runllm.com/api/pipeline/1018";
const api_key = process.env.RUNLLM_API_KEY as string;

async function getChatStream(pipeline_id: number, session_id: number | undefined, message: string, signal?: AbortSignal) {
  const response = await fetch(`https://api.runllm.com/api/pipeline/${pipeline_id}/chat`, {
    method: "POST",
    headers: {
      Accept: "*/*",
      "Content-Type": "application/json",
      "x-api-key": api_key,
    },
    body: JSON.stringify({
      message,
      source: "web",
      session_id,
    }),
    signal,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API returned ${response.status}: ${text}`);
  }

  const decoder = new TextDecoder();
  const reader = response.body!.getReader();

  const stream = new ReadableStream({
    async start(controller) {
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;

          const jsonString = line.slice(6);
          controller.enqueue(
            new TextEncoder().encode(`data: ${jsonString}\n\n`)
          );
        }
      }

      controller.close();
    },
    cancel(reason) {
      console.log("Stream canceled:", reason);
      reader.cancel();
    },
  });

  return stream;
}

export const POST = ApiWithAuth(async (req: NextRequest) => {
  const { pipeline_id, session_id, message } = await req.json();

  try {
    const stream = await getChatStream(pipeline_id, session_id, message, req.signal);

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (err) {
    console.error("Streaming error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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
