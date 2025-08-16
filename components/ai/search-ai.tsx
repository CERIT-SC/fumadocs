'use client';
import {
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
  type AnchorHTMLAttributes,
  type FC,
  useCallback,
  useEffect,
  useRef,
  useState,
  forwardRef
} from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from '@radix-ui/react-dialog';
import { Loader2, RefreshCw, Send, X } from 'lucide-react';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { twMerge as cn } from 'tailwind-merge';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import type { Processor } from './markdown-processor';
import Link, {type LinkProps} from 'fumadocs-core/link';
import { cva } from 'class-variance-authority';
import { signIn } from "next-auth/react";
import { AssistantHierarchy, Assistant, Category } from '@/types/assistant';
import { createOpenAIEngine } from './engines/openai';
import { createRunLLMEngine } from './engines/runllm';

export interface Engine {
  prompt: (
    text: string,
    onUpdate?: (full: string) => void,
    onEnd?: (full: string) => void,
  ) => Promise<void>;

  abortAnswer: () => void;
  getHistory: () => MessageRecord[];
  clearHistory: () => void;
  regenerateLast: (
    onUpdate?: (full: string) => void,
    onEnd?: (full: string) => void,
  ) => Promise<void>;
}

export interface MessageRecord {
  role: 'user' | 'assistant';
  content: string;
  context?: string[]; 
  suggestions?: string[];
  references?: MessageReference[];
}

export interface MessageReference {
  breadcrumbs?: string[];
  title: string;
  description?: string;
  url: string;
}

export interface AIDialogProps {
  assistant: Assistant;
  onCloseDialog: () => void;
}

const engines = new Map<string, Engine | undefined>();

function AIDialog({assistant, onCloseDialog} : AIDialogProps) {
  const [engine, setEngine] = useState(engines.get(assistant.id));
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, update] = useState(0);
  const shouldFocus = useRef(false); // should focus on input on next render

  useEffect(() => {
   (async () => {
      let instance: Engine | undefined;
      if (assistant.engine === 'openai') {
        instance = engines.get(assistant.id) ?? (await createOpenAIEngine(assistant.api_path, assistant.embed ?? false));
      } else if (assistant.engine === 'runllm') {
        const pipeline_id = parseInt(assistant.id.split('_')[1], 10);
        instance = engines.get(assistant.id) ?? (await createRunLLMEngine(assistant.api_path, pipeline_id));
      }

      engines.set(assistant.id, instance);
      setEngine(instance);
    })()
  }, [assistant])

  const onTry = useCallback(() => {
    if (!engine) return;

    setLoading(true);
    void engine
      .regenerateLast(() => {
        update((prev) => prev + 1);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [engine]);

  const onClear = useCallback(() => {
    engine?.clearHistory();
    update((prev) => prev + 1);
  }, [engine]);

  const onSubmit = useCallback(
    (message: string) => {
      if (!engine || message.length === 0) return;

      setLoading(true);
      void engine
        .prompt(message, () => {
          update((prev) => prev + 1);
        })
        .finally(() => {
          setLoading(false);
          shouldFocus.current = true;
        });
    },
    [engine],
  );

  useEffect(() => {
    if (shouldFocus.current) {
      document.getElementById('nd-ai-input')?.focus();
      shouldFocus.current = false;
    }
  });

  const messages = engine?.getHistory() ?? [];
  const activeBar = (
    <div className="mt-2 flex flex-row items-center gap-2 border-t pt-1">
      <button
        type="button"
        className={cn(
          buttonVariants({
            color: 'secondary',
            className: 'gap-1.5',
          }),
        )}
        onClick={onTry}
      >
        <RefreshCw className="size-4" />
        Retry
      </button>
      <button
        type="button"
        className={cn(
          buttonVariants({
            color: 'ghost',
          }),
        )}
        onClick={onClear}
      >
        Ask Something Else
      </button>
    </div>
  );

  return (
    <>
      <List className={cn(messages.length === 0 && 'hidden')}>
        {messages.map((item, i) => (
          <Message key={i} message={item} onSuggestionSelected={onSubmit} onInternalLinkClicked={onCloseDialog} >
            {!loading && item.role === 'assistant' && i === messages.length - 1
              ? activeBar
              : null}
          </Message>
        ))}
      </List>
      {loading ? (
        <button
          type="button"
          className={cn(
            buttonVariants({
              color: 'secondary',
              className: 'rounded-full mx-auto my-1',
            }), 
          )}
          onClick={() => {
            engine?.abortAnswer();
          }}
        >
          Abort Answer
        </button>
      ) : null}
      <AIInput loading={loading} onSubmit={onSubmit} />
    </>
  );
}

function AIInput({
  loading,
  onSubmit,
}: {
  loading: boolean;
  onSubmit: (message: string) => void;
}) {
  const [message, setMessage] = useState('');

  const onStart = (e?: React.FormEvent) => {
    e?.preventDefault();
    setMessage('');
    onSubmit(message);
  };

  return (
    <form
      className={cn(
        'flex flex-row rounded-b-lg border-t pe-2 transition-colors',
        loading && 'bg-fd-muted',
      )}
      onSubmit={onStart}
    >
      <Input
        value={message}
        placeholder={loading ? 'Jarvis is answering ...' : 'Ask GPT a question ...'}
        disabled={loading}
        onChange={(e) => {
          setMessage(e.target.value);
        }}
        onKeyDown={(event) => {
          if (!event.shiftKey && event.key === 'Enter') {
            onStart();
            event.preventDefault();
          }
        }}
      />
      {loading ? (
        <Loader2 className="mt-2 size-5 animate-spin text-fd-muted-foreground" />
      ) : (
        <button
          type="submit"
          className={cn(
            buttonVariants({
              size: 'sm',
              color: 'ghost',
              className: 'rounded-full p-1',
            }),
          )}
          disabled={message.length === 0}
        >
          <Send className="size-4" />
        </button>
      )}
    </form>
  );
}

function List(props: HTMLAttributes<HTMLDivElement>) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(() => {
      const container = containerRef.current;
      if (!container) return;

      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'instant',
      });
    });

    containerRef.current.scrollTop =
      containerRef.current.scrollHeight - containerRef.current.clientHeight;

    // after animation
    setTimeout(() => {
      const element = containerRef.current?.firstElementChild;

      if (element) {
        observer.observe(element);
      }
    }, 2000);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      {...props}
      ref={containerRef}
      className={cn('min-h-0 flex-1 overflow-auto p-2', props.className)}
    >
      <div className="flex flex-col gap-1">{props.children}</div>
    </div>
  );
}

function Input(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLDivElement>(null);
  const shared = cn('col-start-1 row-start-1 max-h-60 min-h-12 px-3 py-1.5');

  return (
    <div className="grid flex-1">
      <textarea
        id="nd-ai-input"
        className={cn(
          shared,
          'resize-none bg-transparent placeholder:text-fd-muted-foreground focus-visible:outline-none',
        )}
        {...props}
      />
      <div ref={ref} className={cn(shared, 'invisible whitespace-pre-wrap')}>
        {`${props.value?.toString() ?? ''}\n`}
      </div>
    </div>
  );
}

let processor: Processor | undefined;
const map = new Map<string, ReactNode>();

const roleName: Record<string, string> = {
  user: 'You',
  assistant: 'Jarvis',
};

function Message({
  children,
  onSuggestionSelected,
  onInternalLinkClicked,
  message,
}: {
  message: MessageRecord;
  onSuggestionSelected: (suggestion: string) => void;
  onInternalLinkClicked: () => void;
  children: ReactNode;
}) {
  const { suggestions = [], references = [] } = message;
  const [rendered, setRendered] = useState<ReactNode>(
    map.get(message.content) ?? message.content,
  );

  useEffect(() => {
    const run = async () => {
      const { createProcessor } = await import('./markdown-processor');

      processor ??= createProcessor();
      let result = map.get(message.content);

      if (!result) {
        result = await processor
          .process(message.content, {
            ...defaultMdxComponents,
            a: ((props) => <CustomLink onInternalLinkClick={() => onInternalLinkClicked()} {...props} /> ) as FC<AnchorHTMLAttributes<HTMLAnchorElement>>,
            img: undefined, // use JSX
          })
          .catch(() => undefined);
      }

      if (result) {
        map.set(message.content, result);
        setRendered(result);
      }
    };

    void run();
  }, [message.content, onInternalLinkClicked]);

  return (
    <div
      className={cn(
        'rounded-lg border bg-fd-card px-2 py-1.5 text-fd-card-foreground',
        message.role === 'user' &&
          'bg-fd-secondary text-fd-secondary-foreground',
      )}
    >
      <p
        className={cn(
          'mb-1 text-xs font-medium text-fd-muted-foreground',
          message.role === 'assistant' && 'text-fd-primary',
        )}
      >
        {roleName[message.role] ?? 'unknown'}
      </p>
      <div className="prose text-sm">{rendered}</div>
      {references.length > 0 ? (
        <div className="mt-2 flex flex-row flex-wrap items-center gap-1">
          {references.map((item, i) => (
            <Link
              key={i}
              href={item.url}
              className="block rounded-lg border bg-fd-secondary p-2 text-fd-secondary-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
            >
              <p className="text-sm font-medium">{item.title}</p>
              <p className="text-xs text-fd-muted-foreground">
                {item.description}
              </p>
            </Link>
          ))}
        </div>
      ) : null}
      {suggestions.length > 0 ? (
        <div className="flex flex-row items-center gap-1 overflow-x-auto p-2">
          {suggestions.map((item) => (
            <button
              key={item}
              type="button"
              className={cn(
                buttonVariants({
                  color: 'secondary',
                  className: 'py-1 text-nowrap',
                }),
              )}
              onClick={() => {
                onSuggestionSelected(item);
              }}
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}
      {children}
    </div>
  );
}

export interface CustomLinkProps
  extends Pick<LinkProps, 'prefetch'>,
    AnchorHTMLAttributes<HTMLAnchorElement> {

  external?: boolean;
  onInternalLinkClick?: () => void;
}

/**
 * Wrapper for fumadocs link component to add onClick behavior when link is internal
 */
const CustomLink = forwardRef<HTMLAnchorElement, CustomLinkProps>(
  (
    {
      href = '#',
      external = !(
        href.startsWith('/') ||
        href.startsWith('#') ||
        href.startsWith('.')
      ),
      onInternalLinkClick = () => {},
      ...props
    },
    ref,
  ) => {
    const handleClick = () => {
      if (!external) {
        onInternalLinkClick();
      }
    };

  return <Link href={href}
               external={external}
               onClick={handleClick}
               ref={ref}
               {...props} />
  },
);

CustomLink.displayName = "FunctionLink";

const typeButtonVariants = cva(
  'inline-flex items-center justify-center rounded-lg px-2 py-1 text-sm font-medium transition-colors duration-100',
  {
    variants: {
      active: {
        true: 'bg-fd-primary/10 text-fd-primary',
        false: 'text-fd-muted-foreground',
      },
    },
  },
);

export function Trigger({
  session,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { session?: boolean }) {
  const [open, setOpen] = useState<boolean>(false);

  const [activeItem, setActiveItem] = useState<Assistant | Category | null>(null);
  const [activeAssistant, setActiveAssistant] = useState<Assistant | null>(null);
  const [assistantHierarchy, setAssistantHierarchy] = useState<AssistantHierarchy | null>(null);

  const closeDialog = useCallback(() => setOpen(false), [])

  useEffect(() => {
    // fetch assistant hierarchy
    (async () => {
      const response = await fetch('/api/assistants');
      if (!response.ok) {
        console.error('Failed to fetch assistants');
        return;
      }

      const data: AssistantHierarchy | null = await response.json();
      if (!data) {
        console.error('No assistants found');
        return;
      }

      setAssistantHierarchy(data);
      if (data.length > 0) {
        setActiveItem(data[0]);
      }
    })();
  }, [])

  useEffect(() => {
    if (!activeItem) return;

    if (activeItem.type === 'assistant') {
      setActiveAssistant(activeItem);
    } else if (activeItem.type === 'category') {
      setActiveAssistant(activeItem.assistants[0] ?? null);
    }

  }, [activeItem]);

  return (
     <Dialog open={open} onOpenChange={setOpen} >
      <DialogTrigger {...props}
        onClick={(e) => {
          if (!session) {
            e.preventDefault();
            signIn("einfracz");
          }
          props.onClick?.(e);
        }}
      />
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-50 bg-fd-background/50 backdrop-blur-sm data-[state=closed]:animate-fd-fade-out data-[state=open]:animate-fd-fade-in" />
        <DialogContent
          onOpenAutoFocus={(e) => {
            document.getElementById('nd-ai-input')?.focus();
            e.preventDefault();
          }}
          aria-describedby={undefined}
          className="fixed left-1/2 z-50 my-[5vh] flex max-h-[90dvh] w-[98vw] max-w-[860px] origin-left -translate-x-1/2 flex-col rounded-lg border bg-fd-popover text-fd-popover-foreground shadow-lg focus-visible:outline-none data-[state=closed]:animate-fd-dialog-out data-[state=open]:animate-fd-dialog-in"
        >
          <DialogTitle className="sr-only">Consult AI</DialogTitle>
          <DialogClose
            aria-label="Close Dialog"
            tabIndex={-1}
            className="absolute right-1 top-1 rounded-full p-1.5 text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground"
          >
            <X className="size-4" />
          </DialogClose>
          <div className="bg-fd-muted px-2.5 py-2">
            <div className="flex flex-row items-center">
              {assistantHierarchy && assistantHierarchy.map((item) => (
                <button
                  key={item.id}
                  className={cn(
                    typeButtonVariants({ active: item.id === activeItem?.id }),
                  )}
                  onClick={() => {
                    setActiveItem(item);
                  }}
                >
                  {item.name}
                </button>
              ))}
            </div>
            {activeItem && activeItem.type === 'category' && (
              <>
                <p className="mt-2 mb-2 text-xs text-fd-muted-foreground">
                  Pick a specialized AI model for your conversation:
                </p>
                <div className="flex flex-row items-center">
                  {activeItem.assistants.map((assistant) => (
                    <button
                      key={assistant.id}
                      className={cn(
                        typeButtonVariants({ active: assistant.id === activeAssistant?.id }),
                      )}
                      onClick={() => {
                        setActiveAssistant(assistant);
                      }}
                    >
                      {assistant.name}
                    </button>
                  ))}
                </div>
              </>
            )}
            <p className="mt-2 text-xs text-fd-muted-foreground">
              {activeAssistant?.description ? (<span dangerouslySetInnerHTML={{ __html: activeAssistant.description }} /> ) : (
              <span>
                Answers from AI may be inaccurate, please verify the information.<br/>
                Ask a direct question or paste an error—only the first question searches the documentation; <b>for a new topic, use the button below.</b>
              </span>
              )}
            </p>
          </div>
          {activeAssistant && <AIDialog assistant={activeAssistant} onCloseDialog={closeDialog} />}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
