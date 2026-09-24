import express from "express";
import verifyToken from "../Middlewares/verifyToken.js";
import { textChatResponse } from "../Services/AIService.js";

const router = express.Router();

router.post("/chat", verifyToken, async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || typeof message !== "string" || message.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "A valid message is required."
            });
        }

        if (message.length > 2000) {
            return res.status(400).json({
                success: false,
                message: "Message is too long."
            });
        }

        const aiResponse = await textChatResponse(message);

        res.status(200).json({
            success: true,
            message: aiResponse
        });

    } catch (error) {
        console.error("Gemini AI Chat Error:", error);

        const errMsg = error.message || "";

        // Handle unconfigured or invalid keys
        if (errMsg.includes("GEMINI_API_KEY") || errMsg.includes("API key not valid") || errMsg.includes("API_KEY_INVALID")) {
            return res.status(503).json({
                success: false,
                message: "AI service is currently unavailable. Please configure a valid Google Gemini API Key in the backend .env file."
            });
        }

        // Handle rate limits or other Google Errors
        if (errMsg.includes("429") || errMsg.includes("quota")) {
            return res.status(503).json({
                success: false,
                message: "AI service is currently experiencing high demand. Please try again later."
            });
        }

        res.status(500).json({
            success: false,
            message: "Unable to get AI response. Please try again later."
        });
    }
});

export default router;
