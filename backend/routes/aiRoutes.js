import express from "express";
import { body } from "express-validator";
import { sendMessage } from "../controllers/aiController.js";
import { protect } from "../middleware/auth.js";
import { validate } from "../utils/validators.js";

const router = express.Router();

// @route  POST /api/ai/message
router.post(
  "/message",
  protect,
  [
    body("chatId").notEmpty().withMessage("chatId is required"),
    body("content").trim().notEmpty().withMessage("Message content is required"),
  ],
  validate,
  sendMessage
);

export default router;
