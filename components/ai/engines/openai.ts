// Frontend: createOpenAIEngine.ts
import type { Engine, MessageRecord } from '@/components/ai/search-ai';

export async function createOpenAIEngine(): Promise<Engine> {
  let messages: MessageRecord[] = [];
  let currentAbortController: AbortController | null = null;

  async function generateNew(
    onUpdate?: (full: string) => void,
    onEnd?: (full: string) => void
  ) {
    const controller = new AbortController();
    currentAbortController = controller;

    const assistantMessage: MessageRecord = {
      role: 'assistant',
      content: '',
    };
    messages.push(assistantMessage);

    try {
      const response = await fetch('/api/chat-openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
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
          assistantMessage.content = content;
          onUpdate?.(content);
        }
      }

      onEnd?.(content);
    } catch (err) {
      if (err.name === 'AbortError') {
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
      messages.push({ role: 'user', content: text });
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
