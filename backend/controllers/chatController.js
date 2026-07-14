import Chat from "../models/Chat.js";

/**
 * @desc    Get all chat sessions for the logged-in user (sidebar history)
 * @route   GET /api/chats
 * @access  Private
 */
export const getChats = async (req, res, next) => {
  try {
    // Only return metadata needed for the sidebar list, not full message bodies, and sort by most recently updated first 
    const chats = await Chat.find({ userId: req.user._id })
      .select("title createdAt updatedAt")
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, chats });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single chat session with full message history
 * @route   GET /api/chats/:id
 * @access  Private
 */
export const getChatById = async (req, res, next) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user._id });

    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    res.status(200).json({ success: true, chat });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new (empty) chat session
 * @route   POST /api/chats
 * @access  Private
 */
export const createChat = async (req, res, next) => {
  try {
    const { title } = req.body;

    const chat = await Chat.create({
      userId: req.user._id,
      title: title || "New Chat",
      messages: [],
    });

    res.status(201).json({ success: true, chat });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Rename a chat session
 * @route   PUT /api/chats/:id
 * @access  Private
 */
export const updateChatTitle = async (req, res, next) => {
  try {
    const { title } = req.body;

    const chat = await Chat.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { title },
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    res.status(200).json({ success: true, chat });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a chat session
 * @route   DELETE /api/chats/:id
 * @access  Private
 */
export const deleteChat = async (req, res, next) => {
  try {
    const chat = await Chat.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    res.status(200).json({ success: true, message: "Chat deleted successfully" });
  } catch (error) {
    next(error);
  }
};
