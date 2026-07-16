import api from "./api";

// Fetch the list of chat sessions for the logged-in user
export const getChats = async () => {
  const { data } = await api.get("/chats");
  return data.chats;
};

// Fetch a single chat session with full message history
export const getChatById = async (chatId) => {
  const { data } = await api.get(`/chats/${chatId}`);
  return data.chat;
};

// Create a new empty chat session
export const createChat = async (title) => {
  const { data } = await api.post("/chats", { title });
  return data.chat;
};

// Rename a chat session
export const updateChatTitle = async (chatId, title) => {
  const { data } = await api.put(`/chats/${chatId}`, { title });
  return data.chat;
};

// Delete a chat session
export const deleteChat = async (chatId) => {
  const { data } = await api.delete(`/chats/${chatId}`);
  return data;
};

// Send a message to the AI within a given chat session, returns updated chat
export const sendMessage = async (chatId, content) => {
  const { data } = await api.post("/ai/message", { chatId, content });
  return data.chat;
};

export const sendGuestMessage = async (messages) => {
  const { data } = await api.post("/ai/guest-message", { messages });
  return data.reply;
};