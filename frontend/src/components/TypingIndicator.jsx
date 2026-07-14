import { FiCpu } from "react-icons/fi";

// Shown inside the chat window while waiting for the AI's reply, so the user gets visual feedback that a request is in progress.
const TypingIndicator = () => (
  <div className="flex w-full gap-3">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-700 text-white dark:bg-gray-600">
      <FiCpu size={16} />
    </div>
    <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-sm dark:bg-gray-700">
      <span className="typing-dot h-2 w-2 rounded-full bg-gray-400" style={{ animationDelay: "0s" }} />
      <span className="typing-dot h-2 w-2 rounded-full bg-gray-400" style={{ animationDelay: "0.2s" }} />
      <span className="typing-dot h-2 w-2 rounded-full bg-gray-400" style={{ animationDelay: "0.4s" }} />
    </div>
  </div>
);

export default TypingIndicator;
