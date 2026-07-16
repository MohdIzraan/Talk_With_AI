import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FiSend, FiUserX, FiLogIn } from "react-icons/fi";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import MessageBubble from "../components/MessageBubble";
import TypingIndicator from "../components/TypingIndicator";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";
import {
  getChats,
  getChatById,
  createChat,
  deleteChat as deleteChatRequest,
  sendMessage,
  sendGuestMessage,
} from "../services/chatService";

const Chat = () => {
  const { isGuest, logout } = useAuth();
  const navigate = useNavigate();

  // ── Authenticated state ──
  const [chats, setChats]               = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [loadingChats, setLoadingChats] = useState(!isGuest);

  // ── Shared state ──
  const [messages, setMessages]         = useState([]);
  const [input, setInput]               = useState("");
  const [sending, setSending]           = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [error, setError]               = useState("");

  const messagesEndRef = useRef(null);
  const textareaRef    = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = "auto";
      ta.style.height = ta.scrollHeight + "px";
    }
  }, [input]);

  // Load chat list only for authenticated users
  useEffect(() => {
    if (isGuest) return;
    const loadChats = async () => {
      try {
        const data = await getChats();
        setChats(data);
        if (data.length > 0) selectChat(data[0]._id);
      } catch (err) {
        setError("Failed to load chat history.");
      } finally {
        setLoadingChats(false);
      }
    };
    loadChats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGuest]);

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
      if (activeChatId === chatId) { setActiveChatId(null); setMessages([]); }
    } catch (err) {
      setError("Failed to delete chat.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const content = input.trim();
    if (!content || sending) return;

    if (textareaRef.current) textareaRef.current.style.height = "auto";

    // ── GUEST MODE ── store in state only, call public endpoint
    if (isGuest) {
      const userMsg = { role: "user", content, timestamp: new Date().toISOString() };
      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setInput("");
      setSending(true);
      setError("");
      try {
        const replyText = await sendGuestMessage(
          updatedMessages.map((m) => ({ role: m.role, content: m.content }))
        );
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: replyText, timestamp: new Date().toISOString() },
        ]);
      } catch (err) {
        setError("The AI failed to respond. Please try again.");
      } finally {
        setSending(false);
      }
      return;
    }

    // ── AUTHENTICATED MODE ── create chat if needed, save to DB
    let chatId = activeChatId;
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

    const optimisticUserMsg = { role: "user", content, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, optimisticUserMsg]);
    setInput("");
    setSending(true);
    setError("");

    try {
      const updatedChat = await sendMessage(chatId, content);
      setMessages(updatedChat.messages);
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

  const handleGuestLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 dark:bg-gray-900">

      {/* Sidebar — only shown for authenticated users */}
      {!isGuest && (
        <Sidebar
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={selectChat}
          onNewChat={handleNewChat}
          onDeleteChat={handleDeleteChat}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-1 flex-col">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />

        {/* Guest mode banner */}
        {isGuest && (
          <div className="flex items-center justify-between bg-amber-50 px-4 py-2 dark:bg-amber-900/30">
            <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
              <FiUserX size={15} />
              <span>
                You're in <strong>Guest Mode</strong> — your chat won't be saved.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/register")}
                className="flex items-center gap-1 rounded-lg bg-primary-600 px-3 py-1 text-xs font-semibold text-white hover:bg-primary-700"
              >
                <FiLogIn size={13} /> Sign Up to Save
              </button>
              <button
                onClick={handleGuestLogout}
                className="rounded-lg px-3 py-1 text-xs text-amber-600 hover:underline dark:text-amber-400"
              >
                Exit
              </button>
            </div>
          </div>
        )}

        <main className="chat-scroll flex-1 overflow-y-auto px-4 py-6">
          {loadingChats ? (
            <LoadingSpinner fullScreen={false} />
          ) : loadingMessages ? (
            <div className="flex h-full items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-gray-400">
              <p className="text-lg font-medium">
                {isGuest ? "You're chatting as a Guest" : "Start a conversation"}
              </p>
              <p className="text-sm">
                {isGuest
                  ? "Ask me anything — no account needed. Sign up to save your history."
                  : "Type a message below to chat with the AI assistant."}
              </p>
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
              >
                <FiSend size={16} />
              </button>
              <span className="text-[10px] text-gray-400 dark:text-gray-500">⇧↵ new line</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;
