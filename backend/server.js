require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "change-this-secret-in-production";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  lastActiveAt: { type: Date, default: Date.now }
});

const messageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const conversationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, default: "New Chat", trim: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const usageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  requests: { type: Number, default: 0 },
  messages: { type: Number, default: 0 },
  lastRequestAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);
const Conversation = mongoose.model("Conversation", conversationSchema);
const Message = mongoose.model("Message", messageSchema);
const Usage = mongoose.model("Usage", usageSchema);

function tokenFor(user) {
  return jwt.sign({ id: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: "7d" });
}

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Authentication required." });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

app.get("/", (req, res) => {
  res.json({ name: "CloudplusAI", status: "online" });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 6) {
      return res.status(400).json({ message: "Name, valid email and password of at least 6 characters are required." });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: "An account with this email already exists." });
    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email: email.toLowerCase(), password: hashed });
    await Usage.create({ userId: user._id });
    res.status(201).json({ token: tokenFor(user), user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to create account." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || "").toLowerCase() });
    if (!user || !(await bcrypt.compare(password || "", user.password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    user.lastActiveAt = new Date();
    await user.save();
    res.json({ token: tokenFor(user), user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Unable to sign in." });
  }
});

app.get("/api/me", auth, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) return res.status(404).json({ message: "User not found." });
  res.json({ user });
});

app.get("/api/conversations", auth, async (req, res) => {
  const conversations = await Conversation.find({ userId: req.user.id }).sort({ updatedAt: -1 }).limit(50);
  res.json({ conversations });
});

app.post("/api/conversations", auth, async (req, res) => {
  const conversation = await Conversation.create({ userId: req.user.id, title: req.body.title || "New Chat" });
  res.status(201).json({ conversation });
});

app.get("/api/conversations/:id/messages", auth, async (req, res) => {
  const conversation = await Conversation.findOne({ _id: req.params.id, userId: req.user.id });
  if (!conversation) return res.status(404).json({ message: "Conversation not found." });
  const messages = await Message.find({ conversationId: conversation._id, userId: req.user.id }).sort({ createdAt: 1 });
  res.json({ messages });
});

app.delete("/api/conversations/:id", auth, async (req, res) => {
  await Message.deleteMany({ conversationId: req.params.id, userId: req.user.id });
  await Conversation.deleteOne({ _id: req.params.id, userId: req.user.id });
  res.json({ message: "Conversation deleted." });
});

app.get("/api/usage", auth, async (req, res) => {
  const usage = await Usage.findOne({ userId: req.user.id });
  const chats = await Conversation.countDocuments({ userId: req.user.id });
  const messages = await Message.countDocuments({ userId: req.user.id });
  res.json({ usage: usage || { requests: 0, messages: 0 }, chats, messages });
});

app.post("/api/ai", async (req, res) => {
  try {
    const userMessage = (req.body.message || "").trim();
    if (!userMessage) return res.status(400).json({ reply: "Please enter a question." });
    if (!process.env.GROQ_API_KEY) return res.status(500).json({ reply: "GROQ_API_KEY is not configured." });

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "You are CloudplusAI. Give clear, concise and useful answers." },
          { role: "user", content: userMessage }
        ],
        temperature: 0.3,
        max_tokens: 300
      },
      { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}`, "Content-Type": "application/json" } }
    );

    res.json({ reply: response.data.choices?.[0]?.message?.content || "No reply from AI." });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ reply: "AI connection failed." });
  }
});

async function start() {
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("CloudplusAI MongoDB connected");
    } catch (error) {
      console.error("MongoDB connection failed:", error.message);
    }
  } else {
    console.warn("MONGODB_URI is not configured; auth/dashboard persistence is disabled.");
  }
  app.listen(PORT, "0.0.0.0", () => console.log(`CloudplusAI backend running on port ${PORT}`));
}

start();
