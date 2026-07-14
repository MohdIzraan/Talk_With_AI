import express from "express";
import {
  getChats,
  getChatById,
  createChat,
  updateChatTitle,
  deleteChat,
} from "../controllers/chatController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All chat routes require a logged-in user
router.use(protect);

router.route("/").get(getChats).post(createChat);

router.route("/:id").get(getChatById).put(updateChatTitle).delete(deleteChat);

export default router;
