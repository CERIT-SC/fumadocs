import { NextRequest, NextResponse } from 'next/server';
import { ApiWithAuth } from "@/lib/auth";
import { get_encoding } from 'tiktoken';
import fs from 'fs';

const enc = get_encoding('cl100k_base');

const search = async (query: string) => {
  return fetch(
    process.env.EMBEDURL+'/search',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: query,
      }),
    }
  ).then((response) => response.json());
};

const createContext = async (question: string, maxLen = 16384) => {
  if (question === "") {
    return "";
  }
  // get the similar data to our query from the database
  const searchResponse = await search(question);
  let curLen = 0;
  const returns : string[] = [];
  // return only top 2 similarities
  let sims = 0;
  for (const similarity of searchResponse['similarities']) {
    const sentence = similarity['data'];
    const metadata = similarity['metadata'];
    const path = metadata['path'];
    const title = metadata['title'];
    // count the tokens
    const nTokens = enc.encode(sentence).length;
    // a token is roughly 4 characters, to learn more
    // https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them
    curLen += nTokens + 4;
    if (curLen > maxLen) {
      console.log("Context too long, curLen:",curLen," nTokens: ", nTokens, " maxLen: ", maxLen);
      break;
    }
    returns.push(`Source: [${title}](${path})\n\n${sentence}`);
    sims++;
    if (sims >= 2) {
      break;
    }
  }
  // we join the entries we found with a separator to show it's different
  return returns.join('\n\n###\n\n');
};

//export const POST = auth(async function POST(request: NextRequest) {
export const POST = ApiWithAuth(async (request: NextRequest) => {
  try {
    const template = fs.readFileSync('./content/prompt-template.txt', 'utf8');
    const { prompt } = await request.json();
    const context = await createContext(prompt);
    const newPrompt = template
      .replace('${context}', context)
      .replace('${prompt}', prompt);
    return NextResponse.json({ prompt: newPrompt }, {status: 200});
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
});
