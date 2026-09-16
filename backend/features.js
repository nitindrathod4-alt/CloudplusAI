const express = require("express");
const crypto = require("crypto");

module.exports = function ({
  User,
  Conversation,
  Message,
  Usage,
  ApiKey,
  mongoose,
  axios,
  env,
  auth
}) {
  const router = express.Router();

  /* =========================================================
     PROJECTS / WORKSPACES
  ========================================================= */

  const ProjectSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    description: {
      type: String,
      default: "",
      maxlength: 300
    },
    icon: {
      type: String,
      default: "📁"
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  });

  const Project =
    mongoose.models.CloudplusProject ||
    mongoose.model("CloudplusProject", ProjectSchema);


  /* =========================================================
     MEMORY
  ========================================================= */

  const MemorySchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    key: {
      type: String,
      required: true,
      trim: true
    },
    value: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  });

  const Memory =
    mongoose.models.CloudplusMemory ||
    mongoose.model("CloudplusMemory", MemorySchema);


  /* =========================================================
     NOTIFICATIONS
  ========================================================= */

  const NotificationSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    title: String,
    message: String,
    read: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  });

  const Notification =
    mongoose.models.CloudplusNotification ||
    mongoose.model("CloudplusNotification", NotificationSchema);


  /* =========================================================
     FEEDBACK
  ========================================================= */

  const FeedbackSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    messageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: true
    },
    type: {
      type: String,
      enum: ["up", "down"],
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  });

  const Feedback =
    mongoose.models.CloudplusFeedback ||
    mongoose.model("CloudplusFeedback", FeedbackSchema);


  /* =========================================================
     PROJECT APIs
  ========================================================= */

  router.get("/projects", auth, async (req, res) => {
    try {
      const projects = await Project.find({
        userId: req.user.id
      }).sort({ updatedAt: -1 });

      res.json({ projects });
    } catch (e) {
      res.status(500).json({
        message: "Unable to load projects."
      });
    }
  });


  router.post("/projects", auth, async (req, res) => {
    try {
      const name = String(req.body.name || "").trim();

      if (!name) {
        return res.status(400).json({
          message: "Project name is required."
        });
      }

      const project = await Project.create({
        userId: req.user.id,
        name,
        description: String(
          req.body.description || ""
        ).slice(0, 300),
        icon: String(
          req.body.icon || "📁"
        ).slice(0, 10)
      });

      res.status(201).json({ project });

    } catch (e) {
      res.status(500).json({
        message: "Unable to create project."
      });
    }
  });


  router.patch("/projects/:id", auth, async (req, res) => {
    try {
      const project =
        await Project.findOneAndUpdate(
          {
            _id: req.params.id,
            userId: req.user.id
          },
          {
            $set: {
              name: String(
                req.body.name || ""
              ).trim().slice(0, 80),

              description: String(
                req.body.description || ""
              ).slice(0, 300),

              icon: String(
                req.body.icon || "📁"
              ).slice(0, 10),

              updatedAt: new Date()
            }
          },
          { new: true }
        );

      if (!project) {
        return res.status(404).json({
          message: "Project not found."
        });
      }

      res.json({ project });

    } catch (e) {
      res.status(500).json({
        message: "Unable to update project."
      });
    }
  });


  router.delete("/projects/:id", auth, async (req, res) => {
    try {
      await Project.deleteOne({
        _id: req.params.id,
        userId: req.user.id
      });

      res.json({
        message: "Project deleted."
      });

    } catch (e) {
      res.status(500).json({
        message: "Unable to delete project."
      });
    }
  });


  /* =========================================================
     CHAT SEARCH
  ========================================================= */

  router.get("/search", auth, async (req, res) => {
    try {
      const q = String(
        req.query.q || ""
      ).trim();

      if (!q) {
        return res.json({
          conversations: [],
          messages: []
        });
      }

      const conversations =
        await Conversation.find({
          userId: req.user.id,
          title: {
            $regex: q,
            $options: "i"
          }
        })
        .sort({ updatedAt: -1 })
        .limit(30);

      const messages =
        await Message.find({
          userId: req.user.id,
          content: {
            $regex: q,
            $options: "i"
          }
        })
        .sort({ createdAt: -1 })
        .limit(50);

      res.json({
        conversations,
        messages
      });

    } catch (e) {
      res.status(500).json({
        message: "Search failed."
      });
    }
  });


  /* =========================================================
     MEMORY
  ========================================================= */

  router.get("/memory", auth, async (req, res) => {
    const memories =
      await Memory.find({
        userId: req.user.id
      }).sort({ updatedAt: -1 });

    res.json({ memories });
  });


  router.post("/memory", auth, async (req, res) => {
    const key =
      String(req.body.key || "").trim();

    const value =
      String(req.body.value || "").trim();

    if (!key || !value) {
      return res.status(400).json({
        message: "Memory key and value are required."
      });
    }

    const memory =
      await Memory.findOneAndUpdate(
        {
          userId: req.user.id,
          key
        },
        {
          value,
          updatedAt: new Date()
        },
        {
          upsert: true,
          new: true
        }
      );

    res.json({ memory });
  });


  router.delete("/memory/:id", auth, async (req, res) => {
    await Memory.deleteOne({
      _id: req.params.id,
      userId: req.user.id
    });

    res.json({
      message: "Memory deleted."
    });
  });


  /* =========================================================
     MODEL LIST
  ========================================================= */

  router.get("/models", auth, async (req, res) => {
    res.json({
      models: [
        {
          id: "openai/gpt-oss-20b",
          name: "GPT OSS 20B",
          mode: "fast"
        },
        {
          id: "openai/gpt-oss-120b",
          name: "GPT OSS 120B",
          mode: "advanced"
        },
        {
          id: "qwen/qwen3.6-27b",
          name: "Qwen 3.6 27B",
          mode: "multimodal"
        },
        {
          id: "groq/compound",
          name: "Groq Compound",
          mode: "tools"
        }
      ]
    });
  });


  /* =========================================================
     FEEDBACK
  ========================================================= */

  router.post(
    "/messages/:id/feedback",
    auth,
    async (req, res) => {

      const type = req.body.type;

      if (!["up", "down"].includes(type)) {
        return res.status(400).json({
          message: "Invalid feedback."
        });
      }

      const message =
        await Message.findOne({
          _id: req.params.id,
          userId: req.user.id
        });

      if (!message) {
        return res.status(404).json({
          message: "Message not found."
        });
      }

      const feedback =
        await Feedback.findOneAndUpdate(
          {
            userId: req.user.id,
            messageId: message._id
          },
          { type },
          {
            upsert: true,
            new: true
          }
        );

      res.json({ feedback });
    }
  );


  /* =========================================================
     NOTIFICATIONS
  ========================================================= */

  router.get("/notifications", auth, async (req, res) => {
    const notifications =
      await Notification.find({
        userId: req.user.id
      })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ notifications });
  });


  router.post(
    "/notifications/:id/read",
    auth,
    async (req, res) => {

      await Notification.updateOne(
        {
          _id: req.params.id,
          userId: req.user.id
        },
        {
          $set: {
            read: true
          }
        }
      );

      res.json({
        message: "Notification marked as read."
      });
    }
  );


  /* =========================================================
     USAGE / ANALYTICS
  ========================================================= */

  router.get("/analytics", auth, async (req, res) => {

    const chats =
      await Conversation.countDocuments({
        userId: req.user.id
      });

    const messages =
      await Message.countDocuments({
        userId: req.user.id
      });

    const memories =
      await Memory.countDocuments({
        userId: req.user.id
      });

    const projects =
      await Project.countDocuments({
        userId: req.user.id
      });

    const usage =
      await Usage.findOne({
        userId: req.user.id
      });

    res.json({
      chats,
      messages,
      memories,
      projects,
      requests: usage?.requests || 0
    });
  });


  /* =========================================================
     API PLAYGROUND
  ========================================================= */

  router.post(
    "/playground",
    auth,
    async (req, res) => {

      try {

        if (!env.GROQ_API_KEY) {
          return res.status(503).json({
            message: "AI provider is not configured."
          });
        }

        const model =
          req.body.model ||
          env.GROQ_MODEL ||
          "openai/gpt-oss-20b";

        const prompt =
          String(req.body.message || "")
          .trim();

        if (!prompt) {
          return res.status(400).json({
            message: "Message is required."
          });
        }

        const response =
          await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
              model,
              messages: [
                {
                  role: "system",
                  content:
                    "You are CloudplusAI API Playground."
                },
                {
                  role: "user",
                  content: prompt
                }
              ],
              temperature:
                Number(req.body.temperature ?? 0.3),
              max_tokens:
                Math.min(
                  Number(req.body.max_tokens || 500),
                  4000
                )
            },
            {
              headers: {
                Authorization:
                  `Bearer ${env.GROQ_API_KEY}`,
                "Content-Type":
                  "application/json"
              }
            }
          );

        const reply =
          response.data
          ?.choices?.[0]
          ?.message?.content ||
          "";

        res.json({
          model,
          reply
        });

      } catch (e) {

        console.error(
          e.response?.data ||
          e.message
        );

        res.status(500).json({
          message: "Playground request failed."
        });
      }
    }
  );


  /* =========================================================
     SETTINGS
  ========================================================= */

  router.get("/settings", auth, async (req, res) => {

    const user =
      await User.findById(
        req.user.id
      ).select(
        "name email createdAt lastActiveAt"
      );

    res.json({
      user,
      settings: {
        theme: "system",
        notifications: true,
        voiceInput: true,
        textToSpeech: true,
        memory: true
      }
    });
  });


  /* =========================================================
     HEALTH / FEATURE STATUS
  ========================================================= */

  router.get("/features", auth, async (req, res) => {

    res.json({
      authentication: true,
      chats: true,
      chatSearch: true,
      renameDelete: true,
      pinArchive: true,
      memory: true,
      modelSelector: true,
      streaming: true,
      fileUpload: true,
      documentQA: true,
      codeMode: true,
      webSearchMode: true,
      voiceInput: true,
      textToSpeech: true,
      feedback: true,
      regenerate: true,
      editResend: true,
      usageDashboard: true,
      apiKeys: true,
      apiPlayground: true,
      apiDocs: true,
      settings: true,
      themes: true,
      notifications: true,
      rateLimiting: true,
      analytics: true,
      projects: true,
      mongodb: true
    });
  });


  return router;
};
