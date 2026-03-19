import Chat from "../models/Chat.js";
import imagekit from "../configs/imagekit.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ✅ Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


// ==========================
// TEXT MESSAGE CONTROLLER
// ==========================
export const textMessageController = async (req, res) => {
    try {
        const userId = req.user._id;
        const { chatId, prompt } = req.body;

        const chat = await Chat.findOne({ userId, _id: chatId });

        if (!chat) {
            return res.json({ success: false, message: "Chat not found" });
        }

        chat.messages = chat.messages || [];

        // store user message
        chat.messages.push({
            role: "user",
            content: prompt,
            timestamp: Date.now(),
            isImage: false
        });

        // ==========================
        // ✅ GEMINI API CALL (WORKING)
        // ==========================
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash"
        });

        const result = await model.generateContent(prompt);
        const aiMessage = result.response.text();

        const reply = {
            role: "assistant",
            content: aiMessage,
            timestamp: Date.now(),
            isImage: false
        };

        chat.messages.push(reply);
        await chat.save();

        res.json({ success: true, reply });

    } catch (error) {
        console.error("Gemini Error:", error);

        res.json({
            success: false,
            message: error.message
        });
    }
};


// ==========================
// IMAGE MESSAGE CONTROLLER
// ==========================
export const imageMessageController = async (req, res) => {
    try {
        const userId = req.user._id;
        const { prompt, chatId, isPublished } = req.body;

        const chat = await Chat.findOne({ userId, _id: chatId });

        if (!chat) {
            return res.json({ success: false, message: "Chat not found" });
        }

        chat.messages = chat.messages || [];

        // store user message
        chat.messages.push({
            role: "user",
            content: prompt,
            timestamp: Date.now(),
            isImage: false
        });

        // (your existing image logic — unchanged)
        const encodedPrompt = encodeURIComponent(prompt);

        const generatedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/jnanagpt/${Date.now()}.png?tr=w-800,h-800`;

        const response = await fetch(generatedImageUrl);
        const buffer = await response.arrayBuffer();

        const base64Image = `data:image/png;base64,${Buffer.from(buffer).toString("base64")}`;

        const uploadResponse = await imagekit.upload({
            file: base64Image,
            fileName: `${Date.now()}.png`,
            folder: "JnanaGPT"
        });

        const reply = {
            role: "assistant",
            content: uploadResponse.url,
            timestamp: Date.now(),
            isImage: true,
            isPublished
        };

        chat.messages.push(reply);
        await chat.save();

        res.json({ success: true, reply });

    } catch (error) {
        console.error("Image Error:", error.message);

        res.json({
            success: false,
            message: error.message
        });
    }
};