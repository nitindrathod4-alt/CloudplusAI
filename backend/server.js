require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("CloudplusAI backend is running");
});

app.post("/api/ai", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({ reply: "Please enter a question." });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ reply: "GROQ_API_KEY is not configured." });
    }

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "You are CloudplusAI. Give clear, concise and useful answers."
          },
          { role: "user", content: userMessage }
        ],
        temperature: 0.3,
        max_tokens: 300
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({ reply: response.data.choices?.[0]?.message?.content || "No reply from AI." });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ reply: "AI connection failed." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`CloudplusAI backend running on port ${PORT}`);
});
