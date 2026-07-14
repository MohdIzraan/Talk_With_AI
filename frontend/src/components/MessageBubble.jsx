import { FiUser, FiCpu } from "react-icons/fi";

// Renders a single message bubble, styled differently for user vs assistant.
const MessageBubble = ({ role, content, timestamp }) => {
  const isUser = role === "user";

  const time = timestamp
    ? new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div className={`flex w-full gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser ? "bg-primary-600 text-white" : "bg-gray-700 text-white dark:bg-gray-600"
        }`}
      >
        {isUser ? <FiUser size={16} /> : <FiCpu size={16} />}
      </div>

      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
          isUser
            ? "rounded-tr-sm bg-primary-600 text-white"
            : "rounded-tl-sm bg-white text-gray-800 dark:bg-gray-700 dark:text-gray-100"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{content}</p>
        {time && (
          <span
            className={`mt-1 block text-[10px] ${
              isUser ? "text-primary-100" : "text-gray-400 dark:text-gray-400"
            }`}
          >
            {time}
          </span>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
