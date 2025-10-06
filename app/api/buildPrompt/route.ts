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
	top_k: 4,
      }),
    }
  ).then((response) => response.json());
};

const createContext = async (question: string, maxLen = 32768) => {
  if (question === "") {
    return "";
  }
  // get the similar data to our query from the database
  const searchResponse = await search(question);
  let curLen = 0;
  let context = 1;
  const returns : string[] = [];
  const customTemplatePath = './content/prompt-template.txt';
  const defaultTemplatePath = './content/prompt-template-default.txt';
  const templatePath = fs.existsSync(customTemplatePath)
                         ? customTemplatePath
                         : defaultTemplatePath;
  const template = fs.readFileSync(templatePath, 'utf8');
  returns.push(template);
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
    returns.push(`### Context ${context}\n\n  Source: [${title}](${path})\n\n${sentence}`);
    context++;
  }
  // we join the entries we found with a separator to show it's different
  return returns;
};

//export const POST = auth(async function POST(request: NextRequest) {
export const POST = ApiWithAuth(async (request: NextRequest) => {
  try {
    const { prompt } = await request.json();
    let context = await createContext(prompt);
    context = [`Question: ${prompt}\n`].concat(context);
    //context.push("\n\n---\n\nAnswer:\n\n"); gpt-oss does not understand this one
    return NextResponse.json({ prompt: context }, {status: 200});
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
});
