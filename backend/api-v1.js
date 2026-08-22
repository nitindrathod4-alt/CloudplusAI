const crypto = require("crypto");

// Mount with: app.use("/api/v1", require("./api-v1")({ ApiKey, Conversation, Message, Usage, mongoose, axios, env: process.env }));
module.exports = ({ ApiKey, Conversation, Message, Usage, mongoose, axios, env }) => {
  const router = require("express").Router();

  async function developerAuth(req, res, next) {
    const header = req.headers.authorization || "";
    const raw = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
    if (!raw.startsWith("cpa_")) return res.status(401).json({ error: { message: "Valid CloudplusAI API key required." } });
    const hash = crypto.createHash("sha256").update(raw).digest("hex");
    const key = await ApiKey.findOne({ keyHash: hash, revokedAt: null });
    if (!key) return res.status(401).json({ error: { message: "Invalid or revoked API key." } });
    key.lastUsedAt = new Date();
    await key.save();
    req.apiKey = key;
    next();
  }

  router.get("/health", (req, res) => res.json({ object: "health", status: "ok" }));

  router.post("/chat", developerAuth, async (req, res) => {
    try {
      const message = String(req.body.message || "").trim();
      if (!message) return res.status(400).json({ error: { message: "message is required." } });
      if (!env.GROQ_API_KEY) return res.status(503).json({ error: { message: "AI provider is not configured." } });

      const response = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
        model: req.body.model || env.GROQ_MODEL || "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "You are CloudplusAI. Give clear, useful and concise answers." },
          { role: "user", content: message }
        ],
        temperature: 0.3,
        max_tokens: Math.min(Number(req.body.max_tokens) || 500, 2000)
      }, { headers: { Authorization: `Bearer ${env.GROQ_API_KEY}`, "Content-Type": "application/json" } });

      const reply = response.data.choices?.[0]?.message?.content || "No reply from AI.";
      const userId = req.apiKey.userId;
      let conversation = null;
      if (req.body.conversation_id) conversation = await Conversation.findOne({ _id: req.body.conversation_id, userId });
      if (!conversation) conversation = await Conversation.create({ userId, title: message.slice(0, 60) || "API Chat" });
      await Message.create({ userId, conversationId: conversation._id, role: "user", content: message });
      await Message.create({ userId, conversationId: conversation._id, role: "assistant", content: reply });
      conversation.updatedAt = new Date();
      await conversation.save();
      await Usage.findOneAndUpdate({ userId }, { $inc: { requests: 1, messages: 2 }, $set: { lastRequestAt: new Date() } }, { upsert: true });

      res.json({ id: `chat_${crypto.randomBytes(8).toString("hex")}`, object: "chat.completion", model: req.body.model || env.GROQ_MODEL || "llama-3.1-8b-instant", conversation_id: conversation._id.toString(), reply });
    } catch (error) {
      console.error(error.response?.data || error.message);
      res.status(500).json({ error: { message: "AI request failed." } });
    }
  });

  return router;
};
