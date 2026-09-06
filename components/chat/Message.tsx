import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage } from "@/lib/chat";

interface MessageProps {
  message: ChatMessage;
}

const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="mb-4 mt-6 text-3xl font-bold">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-3 mt-5 text-2xl font-semibold">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-4 text-xl font-semibold">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mb-4 leading-7 text-zinc-200">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mb-4 list-disc space-y-2 pl-6">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 list-decimal space-y-2 pl-6">{children}</ol>
  ),
  li: ({ children }) => <li className="text-zinc-200">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-4 border-l-4 border-zinc-600 pl-4 italic text-zinc-400">
      {children}
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-400 underline hover:text-blue-300"
    >
      {children}
    </a>
  ),
  code: ({ className, children }) => {
    const isCodeBlock = className?.includes("language-");

    if (isCodeBlock) {
      return <code className={className}>{children}</code>;
    }

    return (
      <code className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-sm text-green-400">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="mb-4 overflow-x-auto rounded-xl bg-zinc-950 p-4">
      {children}
    </pre>
  ),
};

export default function Message({ message }: MessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-6`}>
      <div
        className={`max-w-xl rounded-3xl px-5 py-3 ${
          isUser
            ? "bg-bg-300 text-text-100"
            : "border border-bg-300 bg-bg-100 text-text-100"
        }`}
      >
        {isUser ? (
          message.content
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}