import type { Engine, MessageRecord } from '@/components/ai/search-ai';

enum ChunkType {
  Retrieval = "retrieval",
  Classification = "classification",
  GenerationStarts = "generation_starts",
  GenerationInProgress = "generation_in_progress",
  GenerationFinished = "generation_finished",
  Sources = "sources",
  Explanation = "explanation",
}

type Chunk = {
  chunk_type: ChunkType;
  chat_id: number;
  session_id: number;
  content: string;
}

function getEndIndexAfterLastMatch(str: string, substring: string): number {
  const pattern = substring.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(pattern, "g");
  const matches = [...str.matchAll(regex)];
  if (matches.length === 0) return -1;

  const lastMatch = matches[matches.length - 1];
  return lastMatch.index + lastMatch[0].length;
}

const insertAt = (str: string, sub: string, pos: number) => `${str.slice(0, pos)}${sub}${str.slice(pos)}`;

export async function createRunLLMEngine(url: string, pipeline_id: number): Promise<Engine | undefined> {
	let messages: MessageRecord[] = [];
  let session_id: number | undefined = undefined;
	let abortController: AbortController | null = null;
  const generatingAnswer = "Generating answer ...";

  const _chunkHandler = (chunk: Chunk, messageRecord: MessageRecord, onUpdate?: (full: string) => void, onEnd?: (full: string) => void) => {
    if (chunk.chunk_type === ChunkType.GenerationStarts) {
      session_id = chunk.session_id;
    } else if ([ChunkType.GenerationInProgress, ChunkType.Sources].includes(chunk.chunk_type)) {
      if (messageRecord?.content === generatingAnswer) {
        messageRecord.content = "";
      }

      messageRecord.content += chunk.content;
      onUpdate?.(messageRecord.content);
    } else if (chunk.chunk_type === ChunkType.Explanation) {
      const explanationMap = new Map<string, string>(Object.entries(JSON.parse(chunk.content)));
      explanationMap.forEach((value: string, key: string) => {
        const idx = getEndIndexAfterLastMatch(messageRecord.content, key);
        const endIdx = messageRecord.content.indexOf(')', idx);
        messageRecord.content = insertAt(messageRecord.content, `\n\n${value}\n`, endIdx + 1);
      })
      onUpdate?.(messageRecord.content);
    } else if (chunk.chunk_type === ChunkType.GenerationFinished) {
      onEnd?.(messageRecord.content);
    }
  }

  async function prompt(text: string, onUpdate?: (full: string) => void, onEnd?: (full: string) => void): Promise<void> {
    abortController = new AbortController();
    messages.push({ role: 'user', content: text });
    try {
      messages.push({ role: 'assistant', content: generatingAnswer });
      const assistantMessage = messages[messages.length - 1];
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pipeline_id,
          session_id,
          message: text,
        }),
        signal: abortController.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to connect to chat endpoint");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;

          const jsonString = line.slice(6);
          try {
            const chunk = JSON.parse(jsonString);
            _chunkHandler(chunk, assistantMessage, onUpdate, onEnd);
          } catch (err) {
            console.error('Error parsing chunk:', err);
          }
        }
      }

    } catch (error) {
      console.error("Error during prompt:", error);
      throw error;
    }
  }

  function abortAnswer() {
    abortController?.abort();
    abortController = null;
  }

	function getHistory() {
		return messages;
	}

	function clearHistory() {
    session_id = undefined;
		messages = [];
	}

	function regenerateLast(onUpdate?: (full: string) => void, onEnd?: (full: string) => void): Promise<void> {
		if (messages.length === 0) {
			return Promise.resolve();
		}

		const lastMessage = messages[messages.length - 1];
		if (lastMessage.role !== 'assistant') {
			return Promise.resolve();
		}

		messages.pop();
		return prompt(lastMessage.content, onUpdate, onEnd);
	}

	return {
		prompt,
		abortAnswer,
		getHistory,
		clearHistory,
		regenerateLast
	}
}