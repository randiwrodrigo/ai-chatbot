import { Message as MessageType } from "@/types/chat";

interface MessageProps {
  message: MessageType;
}

export default function Message({ message }: MessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-6`}>
      <div
        className={`max-w-xl rounded-3xl px-5 py-3 ${
          isUser
            ? "bg-zinc-800 text-white"
            : "bg-zinc-900 text-white border border-zinc-800"
        }`}
      >
        {message.content}
      </div>
    </div>
  ); 
}