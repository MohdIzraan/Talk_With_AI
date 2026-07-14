import Chat from "../models/Chat.js";
import { getAIReply } from "../services/aiService.js";

/**
 * @desc    Send a user message to a chat session, get the AI's reply,
 *          save both to the database, and return the updated chat.
 * @route   POST /api/ai/message
 * @access  Private
 * @body    { chatId: string, content: string }
 */
export const sendMessage = async (req, res, next) => {
  try {
    const { chatId, content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: "Message content is required" });
    }

    // Find the chat and make sure it belongs to the logged-in user
    const chat = await Chat.findOne({ _id: chatId, userId: req.user._id });
    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    // Append the user's message
    chat.messages.push({ role: "user", content, timestamp: new Date() });

    // Auto-generate a title from the first message if this is a new chat
    if (chat.title === "New Chat" && chat.messages.length === 1) {
      chat.title = content.length > 40 ? content.slice(0, 40) + "..." : content;
    }

    // Build the conversation history 
    const history = chat.messages.map((m) => ({ role: m.role, content: m.content }));

    // Get the AI's reply
    const aiReplyText = await getAIReply(history);

    // Append the assistant's reply
    chat.messages.push({ role: "assistant", content: aiReplyText, timestamp: new Date() });

    await chat.save();

    res.status(200).json({ success: true, chat });
  } catch (error) {
    next(error);
  }
};
