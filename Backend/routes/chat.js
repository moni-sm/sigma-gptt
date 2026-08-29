import express from "express";
import Thread from "../models/Thread.js";
import getOpenAIAPIResponse from "../utils/openai.js";
import { optionalAuth } from "../middleware/auth.js";

const router = express.Router();

// Apply optional auth middleware to all chat & thread routes
router.use(optionalAuth);

// Get all threads for the current user
router.get("/thread", async (req, res) => {
    try {
        const query = req.user ? { userId: req.user.userId } : { userId: null };
        const threads = await Thread.find(query).sort({ updatedAt: -1 });
        return res.json(threads);
    } catch (err) {
        console.error("Error fetching threads:", err);
        return res.status(500).json({ error: "Failed to fetch threads" });
    }
});

// Get a specific thread by threadId (with ownership check)
router.get("/thread/:threadId", async (req, res) => {
    const { threadId } = req.params;

    try {
        const thread = await Thread.findOne({ threadId });

        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }

        // If thread has an owner, ensure the requesting user is the owner
        if (thread.userId && (!req.user || thread.userId.toString() !== req.user.userId)) {
            return res.status(403).json({ error: "You do not have access to this conversation." });
        }

        return res.json(thread.messages);
    } catch (err) {
        console.error("Error fetching chat:", err);
        return res.status(500).json({ error: "Failed to fetch chat" });
    }
});

// Delete a thread by threadId (with ownership check)
router.delete("/thread/:threadId", async (req, res) => {
    const { threadId } = req.params;

    try {
        const thread = await Thread.findOne({ threadId });

        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }

        // If thread has an owner, ensure the requesting user is the owner
        if (thread.userId && (!req.user || thread.userId.toString() !== req.user.userId)) {
            return res.status(403).json({ error: "You do not have permission to delete this conversation." });
        }

        await Thread.findOneAndDelete({ threadId });
        return res.status(200).json({ success: "Thread deleted successfully" });
    } catch (err) {
        console.error("Error deleting thread:", err);
        return res.status(500).json({ error: "Failed to delete thread" });
    }
});

// Post a chat message and generate response
router.post("/chat", async (req, res) => {
    const { threadId, message } = req.body;

    if (!threadId || !message) {
        return res.status(400).json({ error: "missing required fields" });
    }

    try {
        let thread = await Thread.findOne({ threadId });

        if (!thread) {
            // Create a new thread linked to user (if logged in)
            thread = new Thread({
                threadId,
                title: message.length > 40 ? message.substring(0, 40) + "..." : message,
                userId: req.user ? req.user.userId : null,
                messages: [{ role: "user", content: message }]
            });
        } else {
            // Check ownership if thread belongs to a user
            if (thread.userId && (!req.user || thread.userId.toString() !== req.user.userId)) {
                return res.status(403).json({ error: "You do not have access to this conversation." });
            }
            // If anonymous thread is now being continued by a logged-in user, claim it
            if (!thread.userId && req.user) {
                thread.userId = req.user.userId;
            }
            thread.messages.push({ role: "user", content: message });
        }

        const assistantReply = (await getOpenAIAPIResponse(message)) || "Sorry, I could not process your request.";

        thread.messages.push({ role: "assistant", content: assistantReply });
        thread.updatedAt = new Date();

        await thread.save();
        return res.json({ reply: assistantReply });
    } catch (err) {
        console.error("Chat error:", err);
        return res.status(500).json({ error: "Something went wrong processing your message." });
    }
});

export default router;