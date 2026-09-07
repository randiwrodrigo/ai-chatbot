import { Loader2 } from "lucide-react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "./CodeBlock";
import type { ChatMessage } from "@/lib/chat";

interface MessageProps {
  message: ChatMessage;
  isStreaming?: boolean;
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
    <p className="mb-4 leading-7 text-text-200">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mb-4 list-disc space-y-2 pl-6">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 list-decimal space-y-2 pl-6">{children}</ol>
  ),
  li: ({ children }) => <li className="text-text-200">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-4 border-l-4 border-bg-300 pl-4 italic text-text-400">
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
      const language = className?.replace("language-", "") ?? "";
      const code = String(children).replace(/\n$/, "");
      return <CodeBlock language={language} code={code} />;
    }

    return (
      <code className="rounded bg-bg-300 px-1.5 py-0.5 font-mono text-sm text-green-400">
        {children}
      </code>
    );
  },
  pre: ({ children }) => <>{children}</>,
};

export default function Message({ message, isStreaming }: MessageProps) {
  const isUser = message.role === "user";
  const isWaitingForFirstToken = isStreaming && message.content.length === 0;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-6`}>
      <div
        className={`rounded-3xl px-5 py-3 ${isUser ? "max-w-xl" : "max-w-2xl"} ${
          isUser
            ? "bg-bg-300 text-text-100"
            : "border border-bg-300 bg-bg-100 text-text-100"
        }`}
      >
        {isUser ? (
          <span className="whitespace-pre-wrap">{message.content}</span>
        ) : isWaitingForFirstToken ? (
          <Loader2 className="h-4 w-4 animate-spin text-accent" />
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}
