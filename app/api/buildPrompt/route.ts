import { auth } from "../../utils/auth"

// pages/api/buildPrompt.ts
import { get_encoding } from '@dqbd/tiktoken';
// Load the tokenizer which is designed to work with the embedding model
const enc = get_encoding('cl100k_base');
// this is how you search Embedbase with a string query
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
  // We want to add context to some limit of length (tokens)
  // because usually LLM have limited input size
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
  }
  // we join the entries we found with a separator to show it's different
  return returns.join('\n\n###\n\n');
};
// this is the endpoint that returns an answer to the client
export default async function buildPrompt(req, res) {
  const session = await auth(req, res);
  if (session) {
    const prompt = req.body.prompt;
    const context = await createContext(prompt);
    const newPrompt = `Answer the question based on the context below, and if the question can't be answered based on the context, say "I don't know"\nIf the question can be answered based on the context, add "Source" link from the used context strictly without any change.\n\nContext: ${context}\n\n---\n\nQuestion: ${prompt}\nAnswer:`;
    res.status(200).json({ prompt: newPrompt });
  } else {
    res.status(401).json({ message: "Login Required"});
  }
}
