import express from "express";
import mongoose from "mongoose";
import Thread from "../models/Thread.js";
import getOpenAIAPIResponse from "../utils/openai.js";
import { optionalAuth } from "../middleware/auth.js";

const router = express.Router();

// Apply optional auth middleware to all chat & thread routes
router.use(optionalAuth);

// Get all threads for the current user
router.get("/thread", async (req, res) => {
    try {
        if (mongoose.connection.readyState !== 1) {
            return res.json([]);
        }
        const query = req.user 
            ? { userId: req.user.userId } 
            : { $or: [{ userId: null }, { userId: { $exists: false } }] };
        const threads = await Thread.find(query).sort({ updatedAt: -1 });
        return res.json(threads || []);
    } catch (err) {
        console.warn("Warning fetching threads (returning empty list):", err.message);
        return res.json([]);
    }
});


// Get a specific thread by threadId (with ownership check)
router.get("/thread/:threadId", async (req, res) => {
    const { threadId } = req.params;

    try {
        if (mongoose.connection.readyState !== 1) {
            return res.json([]);
        }
        const thread = await Thread.findOne({ threadId });

        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }

        // If thread has an owner, ensure the requesting user is the owner
        if (thread.userId && (!req.user || thread.userId.toString() !== req.user.userId)) {
            return res.status(403).json({ error: "You do not have access to this conversation." });
        }

        return res.json(thread.messages || []);
    } catch (err) {
        console.warn("Warning fetching chat:", err.message);
        return res.json([]);
    }
});

// Delete a thread by threadId (with ownership check)
router.delete("/thread/:threadId", async (req, res) => {
    const { threadId } = req.params;

    try {
        if (mongoose.connection.readyState !== 1) {
            return res.status(200).json({ success: "Thread deleted successfully" });
        }
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
        console.warn("Warning deleting thread:", err.message);
        return res.status(200).json({ success: "Thread deleted successfully" });
    }
});

// Post a chat message and generate response
router.post("/chat", async (req, res) => {
    const { threadId, message, model } = req.body;

    if (!threadId || !message) {
        return res.status(400).json({ error: "Missing required fields: threadId and message." });
    }

    try {
        let thread = null;
        try {
            thread = await Thread.findOne({ threadId });
        } catch (dbErr) {
            console.warn("Database lookup warning (proceeding in fallback mode):", dbErr.message);
        }

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

        const assistantReply = (await getOpenAIAPIResponse(message, model)) || "Sorry, I could not process your request.";

        thread.messages.push({ role: "assistant", content: assistantReply });
        thread.updatedAt = new Date();

        try {
            await thread.save();
        } catch (saveErr) {
            console.warn("Database save warning:", saveErr.message);
        }

        return res.json({ reply: assistantReply });
    } catch (err) {
        console.error("Chat error:", err);
        return res.status(500).json({ error: "Something went wrong processing your message.", details: err.message });
    }
});

export default router;