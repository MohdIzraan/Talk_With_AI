import { useState, useEffect, useRef, useCallback } from "react";
import { FiSend } from "react-icons/fi";
import { FiCornerDownLeft } from "react-icons/fi";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import MessageBubble from "../components/MessageBubble";
import TypingIndicator from "../components/TypingIndicator";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  getChats,
  getChatById,
  createChat,
  deleteChat as deleteChatRequest,
  sendMessage,
} from "../services/chatService";

const Chat = () => {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null); // ref for the chat input textarea

  // Scroll to the latest message whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  // Auto-resize the textarea height as the user types more lines
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";           // reset first so it can shrink
      ta.style.height = ta.scrollHeight + "px"; // grow to fit content
    }
  }, [input]);

  // Load the chat list on mount
  useEffect(() => {
    const loadChats = async () => {
      try {
        const data = await getChats();
        setChats(data);
        if (data.length > 0) {
          selectChat(data[0]._id);
        }
      } catch (err) {
        setError("Failed to load chat history.");
      } finally {
        setLoadingChats(false);
      }
    };
    loadChats();
  }, []);

  const selectChat = useCallback(async (chatId) => {
    setActiveChatId(chatId);
    setSidebarOpen(false);
    setLoadingMessages(true);
    setError("");
    try {
      const chat = await getChatById(chatId);
      setMessages(chat.messages);
    } catch (err) {
      setError("Failed to load this conversation.");
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const handleNewChat = async () => {
    try {
      const chat = await createChat("New Chat");
      setChats((prev) => [chat, ...prev]);
      setActiveChatId(chat._id);
      setMessages([]);
      setSidebarOpen(false);
    } catch (err) {
      setError("Failed to create a new chat.");
    }
  };

  const handleDeleteChat = async (chatId) => {
    try {
      await deleteChatRequest(chatId);
      setChats((prev) => prev.filter((c) => c._id !== chatId));
      if (activeChatId === chatId) {
        setActiveChatId(null);
        setMessages([]);
      }
    } catch (err) {
      setError("Failed to delete chat.");
    }
  };

  // Called when Enter is pressed without Shift — submits the form
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // stop the default newline from being added
      handleSend(e);
    }
    // Shift+Enter: allow newline.
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const content = input.trim();
    if (!content || sending) return;

    // Reset textarea height back to single line after sending
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    let chatId = activeChatId;

    // If there's no active chat yet, create one first
    if (!chatId) {
      try {
        const chat = await createChat("New Chat");
        setChats((prev) => [chat, ...prev]);
        chatId = chat._id;
        setActiveChatId(chatId);
      } catch (err) {
        setError("Failed to start a new chat.");
        return;
      }
    }

    // Optimistically add the user's message to the UI
    const optimisticUserMsg = { role: "user", content, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, optimisticUserMsg]);
    setInput("");
    setSending(true);
    setError("");

    try {
      const updatedChat = await sendMessage(chatId, content);
      setMessages(updatedChat.messages);

      // Update the sidebar title/order in case it was auto-generated
      setChats((prev) => {
        const others = prev.filter((c) => c._id !== chatId);
        return [{ _id: chatId, title: updatedChat.title, updatedAt: new Date() }, ...others];
      });
    } catch (err) {
      setError(err.response?.data?.message || "The AI failed to respond. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={selectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="chat-scroll flex-1 overflow-y-auto px-4 py-6">
          {loadingChats ? (
            <LoadingSpinner fullScreen={false} />
          ) : loadingMessages ? (
            <div className="flex h-full items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-gray-400">
              <p className="text-lg font-medium">Start a conversation</p>
              <p className="text-sm">Type a message below to chat with the AI assistant.</p>
            </div>
          ) : (
            <div className="mx-auto flex max-w-3xl flex-col gap-4">
              {messages.map((msg, idx) => (
                <MessageBubble
                  key={msg._id || idx}
                  role={msg.role}
                  content={msg.content}
                  timestamp={msg.timestamp}
                />
              ))}
              {sending && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        {error && (
          <div className="mx-4 mb-2 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSend}
          className="border-t border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="mx-auto flex max-w-3xl items-end gap-2">
            {/* Textarea grows up to 6 lines, then scrolls */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message... (Shift+Enter for new line)"
              disabled={sending}
              style={{ maxHeight: "160px", overflowY: "auto", resize: "none" }}
              className="flex-1 rounded-2xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            />
            <div className="flex shrink-0 flex-col items-center gap-1">
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
                aria-label="Send message"
                title="Send (Enter)"
              >
                <FiSend size={16} />
              </button>
              {/* Small hint label below the send button */}
              <span className="text-[10px] text-gray-400 dark:text-gray-500">
                ⇧↵ new line
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;
