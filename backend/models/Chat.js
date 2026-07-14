import mongoose from "mongoose";

// Sub-schema for an individual message inside a chat session.
// Not registered as its own model - it is embedded inside Chat.messages.
const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

// Schema representing a single chat conversation belonging to a user.
const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "New Chat",
      trim: true,
    },
    messages: [messageSchema],
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
