import { FiPlus, FiTrash2, FiMessageSquare, FiX } from "react-icons/fi";

// Displays the list of past chat sessions and lets the user start a new chat or delete an existing one. Also handles the mobile slide-in overlay.
const Sidebar = ({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  isOpen,
  onClose,
}) => {
  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed z-30 flex h-full w-72 flex-col border-r border-gray-200 bg-white transition-transform duration-200 dark:border-gray-700 dark:bg-gray-800 md:static md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onNewChat}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            <FiPlus size={16} /> New Chat
          </button>
          <button
            onClick={onClose}
            className="ml-2 rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden"
            aria-label="Close sidebar"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="chat-scroll flex-1 space-y-1 overflow-y-auto px-2 pb-4">
          {chats.length === 0 && (
            <p className="mt-6 text-center text-sm text-gray-400">
              No chats yet. Start a new conversation!
            </p>
          )}

          {chats.map((chat) => (
            <div
              key={chat._id}
              onClick={() => onSelectChat(chat._id)}
              className={`group flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors ${
                activeChatId === chat._id
                  ? "bg-primary-50 text-primary-700 dark:bg-primary-500/20 dark:text-primary-300"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              <div className="flex min-w-0 items-center gap-2">
                <FiMessageSquare size={15} className="shrink-0" />
                <span className="truncate">{chat.title}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat._id);
                }}
                className="ml-2 shrink-0 rounded p-1 text-gray-400 opacity-0 hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 dark:hover:bg-red-900/30"
                aria-label="Delete chat"
                title="Delete chat"
              >
                <FiTrash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
