// Frontend: createOpenAIEngine.ts
import type { Engine, MessageRecord } from '@/components/ai/search-ai';

export async function createOpenAIEngine(url: string, embed: boolean): Promise<Engine> {
  let messages: MessageRecord[] = [];
  let currentAbortController: AbortController | null = null;

  async function buildEnhancedPrompt(userPrompt: string): Promise<string[]> {
    try {
      const response = await fetch('/api/buildPrompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userPrompt }),
      });

      if (!response.ok) throw new Error('Prompt building failed');

      const data = await response.json();
      return data.prompt || [userPrompt]; // Fallback to original
    } catch (error) {
      console.error('Prompt enhancement failed:', error);
      return [userPrompt]; // Return original if enhancement fails
    }
  }

  async function generateNew(
    onUpdate?: (full: string) => void,
    onEnd?: (full: string) => void
  ) {
    const controller = new AbortController();
    currentAbortController = controller;

    const assistantMessage: MessageRecord = {
      role: 'assistant',
      content: 'Generating answer ...',
    };
    messages.push(assistantMessage);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
	       messages:  messages.map(message => {
		       if ('context' in message && message.context !== null) {
                         // Handle array contexts
                         if (Array.isArray(message.context)) {
                           return message.context.map(contextItem => ({
                             role: message.role,
                             content: contextItem
                           }));
                         }
                         // Handle non-array context
                         return {
                           role: message.role,
                           content: message.context
                         };
                       }
                       if (message.role === 'assistant' && message.content === 'Generating answer ...') {
                          return {
                            role: message.role,
                            content: ''
                          };
                       }
                       // Return original message if no context or context is null
                       return message;
               }).flatMap((message) => message as MessageRecord)
	}),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error('API request failed');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let content = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n').filter(line => line.startsWith('data: '));

        for (const line of lines) {
          const data = JSON.parse(line.slice(6));
          content += data.content;

          if (content.startsWith('<think>') && (data.content.indexOf('</think>') !== -1)) {
            const endIdx = content.indexOf('</think>');
            if (endIdx !== -1) {
              content = content.substring(endIdx + 8).trim();
            }
          }

          assistantMessage.content = content;
          onUpdate?.(content);
        }
      }

      onEnd?.(content);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        onEnd?.(assistantMessage.content);
      } else {
        assistantMessage.content = 'Error generating response';
        onEnd?.(assistantMessage.content);
        throw err;
      }
    } finally {
      currentAbortController = null;
    }
  }

  return {
    async prompt(text, onUpdate, onEnd) {
      if ((messages.length === 0) && embed) {
	messages.push({ role: 'user', content: text});
        messages.push({ role: 'assistant', content: "Searching documents ..."});
        const context = await buildEnhancedPrompt(text);
        onUpdate && onUpdate(''); // change 'searching documents' to 'generating answer'
        messages.pop();
        messages[0].context = context;
      } else {
        messages.push({ role: 'user', content: text });
      }
      await generateNew(onUpdate, onEnd);
    },

    async regenerateLast(onUpdate, onEnd) {
      const last = messages.at(-1);
      if (!last || last.role === 'user') return;
      messages.pop();
      await generateNew(onUpdate, onEnd);
    },

    getHistory() {
      return messages;
    },

    clearHistory() {
      messages = [];
    },

    abortAnswer() {
      currentAbortController?.abort();
      currentAbortController = null;
    },
  };
}
