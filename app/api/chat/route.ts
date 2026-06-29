import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse, stepCountIs, streamText, tool, toUIMessageStream, UIDataTypes, UITools, type UIMessage } from 'ai';
import { z } from 'zod';
import { source } from '@/lib/source';
import { Document, type DocumentData } from 'flexsearch';
import { ApiWithAuth } from '@/lib/auth';

interface CustomDocument extends DocumentData {
  url: string;
  title: string;
  description: string;
  content: string;
}

type MyDataPart = {
  client: {
    location: string
  }
}

export type ChatUIMessage = UIMessage<undefined, MyDataPart, UITools>;

const searchServer = createSearchServer();

async function createSearchServer() {
  const search = new Document<CustomDocument>({
    document: {
      id: 'url',
      index: ['title', 'description', 'content'],
      store: true,
    },
  });

  const docs = await chunkedAll(
    source.getPages().map(async (page) => {
      if (!('getText' in page.data)) return null;

      return {
        title: page.data.title,
        description: page.data.description,
        url: page.url,
        content: await page.data.getText('raw'),
      } as CustomDocument;
    }),
  );

  for (const doc of docs) {
    if (doc) search.add(doc);
  }

  return search;
}

async function chunkedAll<O>(promises: Promise<O>[]): Promise<O[]> {
  const SIZE = 50;
  const out: O[] = [];
  for (let i = 0; i < promises.length; i += SIZE) {
    out.push(...(await Promise.all(promises.slice(i, i + SIZE))));
  }
  return out;
}

const openai = createOpenAICompatible({
  baseURL: process.env.LOCAL_URL || "",
  apiKey: process.env.LOCAL_API_KEY,
  name: "openaiCompatible",
});

/** System prompt, you can update it to provide more specific information */
const systemPrompt = [
  'You are an AI assistant for a documentation site.',
  'Use the `search` tool to retrieve relevant docs context before answering when needed.',
  'The `search` tool returns raw JSON results from documentation. Use those results to ground your answer and cite sources as markdown links using the document `url` field when available.',
  'If you cannot find the answer in search results, say you do not know and suggest a better search query.',
  'If the user query is not related to the documentation, do not answer it and politely tell the user that you can only answer questions related to the documentation.',
].join('\n');

export const POST = ApiWithAuth(async (req: Request, ctx: RouteContext<"/api/chat">) => {
  const reqJson = await req.json();

  const stream =  createUIMessageStream({
    execute: async ({ writer }) => {
      const result = streamText({
        model: openai.chatModel(process.env.LOCAL_MODEL ?? ""),
        stopWhen: stepCountIs(5),
        tools: {
          search: searchTool,
        },
        system: {
          role: 'system',
          content: systemPrompt
        },
        messages: [
          ...(await convertToModelMessages<ChatUIMessage>(reqJson.messages ?? [], {
            convertDataPart(part) {
              if (part.type === 'data-client')
                return {
                  type: 'text',
                  text: `[Client Context: ${JSON.stringify(part.data)}]`,
                };
            },
          })),
        ],
        toolChoice: 'auto',
      });

      writer.merge(toUIMessageStream({ stream: result.stream }));
    }
  })

  return createUIMessageStreamResponse({ stream });
});

export type SearchTool = typeof searchTool;

const searchTool = tool({
  description: 'Search the docs content and return raw JSON results.',
  inputSchema: z.object({
    query: z.string(),
    limit: z.number().int().min(1).max(100).default(10),
  }),
  async execute({ query, limit }) {
    const search = await searchServer;
    return await search.searchAsync(query, { limit, merge: true, enrich: true });
  },
});
