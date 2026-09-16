require("dotenv").config();
const express=require("express"),cors=require("cors"),axios=require("axios"),mongoose=require("mongoose"),bcrypt=require("bcryptjs"),jwt=require("jsonwebtoken"),crypto=require("crypto");
const app=express(); app.use(cors()); app.use(express.json());
const PORT=process.env.PORT||5000, JWT_SECRET=process.env.JWT_SECRET||"change-this-secret-in-production";
const userSchema=new mongoose.Schema({name:{type:String,required:true,trim:true},email:{type:String,required:true,unique:true,lowercase:true,trim:true},password:{type:String,required:true},createdAt:{type:Date,default:Date.now},lastActiveAt:{type:Date,default:Date.now}});
const messageSchema=new mongoose.Schema({userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},conversationId:{type:mongoose.Schema.Types.ObjectId,ref:"Conversation",required:true},role:{type:String,enum:["user","assistant"],required:true},content:{type:String,required:true},createdAt:{type:Date,default:Date.now}});
const conversationSchema=new mongoose.Schema({userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},projectId:{type:mongoose.Schema.Types.ObjectId,ref:"Project",default:null},title:{type:String,default:"New Chat",trim:true},pinned:{type:Boolean,default:false},archived:{type:Boolean,default:false},createdAt:{type:Date,default:Date.now},updatedAt:{type:Date,default:Date.now}});
const usageSchema=new mongoose.Schema({userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},requests:{type:Number,default:0},messages:{type:Number,default:0},lastRequestAt:{type:Date,default:Date.now}});
const apiKeySchema=new mongoose.Schema({userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},name:{type:String,default:"My API Key",trim:true},prefix:{type:String,required:true},keyHash:{type:String,required:true},createdAt:{type:Date,default:Date.now},lastUsedAt:{type:Date},revokedAt:{type:Date}});

/* ================= CLOUDPLUSAI_PROJECT_FEATURE ================= */

const projectSchema=new mongoose.Schema({
  userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
  name:{type:String,required:true,trim:true,maxlength:80},
  description:{type:String,default:"",trim:true,maxlength:300},
  icon:{type:String,default:"📁"},
  createdAt:{type:Date,default:Date.now},
  updatedAt:{type:Date,default:Date.now}
});

const Project=
  mongoose.models.Project||
  mongoose.model("Project",projectSchema);

/* Create project */
app.post("/api/projects",auth,async(req,res)=>{
  try{
    const name=String(req.body.name||"").trim();

    if(!name)
      return res.status(400).json({message:"Project name is required."});

    const project=await Project.create({
      userId:req.user.id,
      name,
      description:String(req.body.description||"").trim(),
      icon:String(req.body.icon||"📁")
    });

    res.status(201).json({project});
  }catch(e){
    console.error(e);
    res.status(500).json({message:"Unable to create project."});
  }
});

/* Get projects */
app.get("/api/projects",auth,async(req,res)=>{
  try{
    const projects=await Project.find({
      userId:req.user.id
    }).sort({updatedAt:-1});

    res.json({projects});
  }catch(e){
    console.error(e);
    res.status(500).json({message:"Unable to load projects."});
  }
});

/* Rename/update project */
app.patch("/api/projects/:id",auth,async(req,res)=>{
  try{
    const update={};

    if(req.body.name!==undefined)
      update.name=String(req.body.name).trim().slice(0,80);

    if(req.body.description!==undefined)
      update.description=String(req.body.description).trim().slice(0,300);

    if(req.body.icon!==undefined)
      update.icon=String(req.body.icon).slice(0,10);

    update.updatedAt=new Date();

    const project=await Project.findOneAndUpdate(
      {
        _id:req.params.id,
        userId:req.user.id
      },
      update,
      {new:true}
    );

    if(!project)
      return res.status(404).json({message:"Project not found."});

    res.json({project});
  }catch(e){
    console.error(e);
    res.status(500).json({message:"Unable to update project."});
  }
});

/* Delete project */
app.delete("/api/projects/:id",auth,async(req,res)=>{
  try{
    const project=await Project.findOne({
      _id:req.params.id,
      userId:req.user.id
    });

    if(!project)
      return res.status(404).json({message:"Project not found."});

    /*
      Remove conversations belonging to this project
      when projectId is available on conversation documents.
    */
    const chats=await Conversation.find({
      userId:req.user.id,
      projectId:project._id
    }).select("_id");

    const ids=chats.map(c=>c._id);

    if(ids.length){
      await Message.deleteMany({
        userId:req.user.id,
        conversationId:{$in:ids}
      });

      await Conversation.deleteMany({
        userId:req.user.id,
        _id:{$in:ids}
      });
    }

    await Project.deleteOne({
      _id:project._id
    });

    res.json({
      message:"Project deleted.",
      deletedChats:ids.length
    });

  }catch(e){
    console.error(e);
    res.status(500).json({message:"Unable to delete project."});
  }
});

/* ================= END CLOUDPLUSAI_PROJECT_FEATURE ================= */

const User=mongoose.model("User",userSchema),Message=mongoose.model("Message",messageSchema),Conversation=mongoose.model("Conversation",conversationSchema),Usage=mongoose.model("Usage",usageSchema),ApiKey=mongoose.model("ApiKey",apiKeySchema);
const apiV1=require("./api-v1")({ApiKey,Conversation,Message,Usage,mongoose,axios,env:process.env});
app.use("/api/v1",apiV1);
function tokenFor(user){return jwt.sign({id:user._id.toString(),email:user.email},JWT_SECRET,{expiresIn:"7d"})} function auth(req,res,next){const h=req.headers.authorization||"",t=h.startsWith("Bearer ")?h.slice(7):null;if(!t)return res.status(401).json({message:"Authentication required."});try{req.user=jwt.verify(t,JWT_SECRET);next()}catch{return res.status(401).json({message:"Invalid or expired token."})}}
app.get("/",(req,res)=>res.json({name:"CloudplusAI",status:"online"})); app.get("/api/health",(req,res)=>res.json({status:"ok",database:mongoose.connection.readyState===1?"connected":"disconnected"}));
app.post("/api/auth/register",async(req,res)=>{try{const{name,email,password}=req.body;if(!name||!email||!password||password.length<6)return res.status(400).json({message:"Name, valid email and password of at least 6 characters are required."});const existing=await User.findOne({email:email.toLowerCase()});if(existing)return res.status(409).json({message:"An account with this email already exists."});const user=await User.create({name,email:email.toLowerCase(),password:await bcrypt.hash(password,12)});await Usage.create({userId:user._id});res.status(201).json({token:tokenFor(user),user:{id:user._id,name:user.name,email:user.email}})}catch(e){console.error(e);res.status(500).json({message:"Unable to create account."})}});
app.post("/api/auth/login",async(req,res)=>{try{const{email,password}=req.body,user=await User.findOne({email:(email||"").toLowerCase()});if(!user||!(await bcrypt.compare(password||"",user.password)))return res.status(401).json({message:"Invalid email or password."});user.lastActiveAt=new Date();await user.save();res.json({token:tokenFor(user),user:{id:user._id,name:user.name,email:user.email}})}catch(e){res.status(500).json({message:"Unable to sign in."})}});
app.get("/api/me",auth,async(req,res)=>{const user=await User.findById(req.user.id).select("-password");if(!user)return res.status(404).json({message:"User not found."});res.json({user})});
app.get("/api/conversations",auth,async(req,res)=>res.json({conversations:await Conversation.find({userId:req.user.id}).sort({updatedAt:-1}).limit(50)}));
app.post("/api/conversations",auth,async(req,res)=>res.status(201).json({conversation:await Conversation.create({userId:req.user.id,title:req.body.title||"New Chat"})}));
app.get("/api/conversations/:id/messages",auth,async(req,res)=>{const c=await Conversation.findOne({_id:req.params.id,userId:req.user.id});if(!c)return res.status(404).json({message:"Conversation not found."});res.json({messages:await Message.find({conversationId:c._id,userId:req.user.id}).sort({createdAt:1})})});
app.delete("/api/conversations/:id",auth,async(req,res)=>{await Message.deleteMany({conversationId:req.params.id,userId:req.user.id});await Conversation.deleteOne({_id:req.params.id,userId:req.user.id});res.json({message:"Conversation deleted."})});

/* ================= CLOUDPLUSAI EXTRA FEATURES ================= */

/* Rename chat */
app.patch("/api/conversations/:id",auth,async(req,res)=>{
  try{
    const title=String(req.body.title||"").trim().slice(0,100);
    if(!title) return res.status(400).json({message:"Chat title is required."});

    const conversation=await Conversation.findOneAndUpdate(
      {_id:req.params.id,userId:req.user.id},
      {title,updatedAt:new Date()},
      {new:true}
    );

    if(!conversation)
      return res.status(404).json({message:"Conversation not found."});

    res.json({conversation});
  }catch(e){
    console.error(e);
    res.status(500).json({message:"Unable to rename chat."});
  }
});


/* Pin / Unpin chat */
app.post("/api/conversations/:id/pin",auth,async(req,res)=>{
  try{
    const conversation=await Conversation.findOne({
      _id:req.params.id,
      userId:req.user.id
    });

    if(!conversation)
      return res.status(404).json({message:"Conversation not found."});

    conversation.pinned=!Boolean(conversation.pinned);
    conversation.updatedAt=new Date();

    await conversation.save();

    res.json({
      pinned:conversation.pinned,
      conversation
    });
  }catch(e){
    console.error(e);
    res.status(500).json({message:"Unable to update pin status."});
  }
});


/* Archive / Unarchive chat */
app.post("/api/conversations/:id/archive",auth,async(req,res)=>{
  try{
    const conversation=await Conversation.findOne({
      _id:req.params.id,
      userId:req.user.id
    });

    if(!conversation)
      return res.status(404).json({message:"Conversation not found."});

    conversation.archived=!Boolean(conversation.archived);
    conversation.updatedAt=new Date();

    await conversation.save();

    res.json({
      archived:conversation.archived,
      conversation
    });
  }catch(e){
    console.error(e);
    res.status(500).json({message:"Unable to update archive status."});
  }
});


/* Regenerate latest assistant answer */
app.post("/api/conversations/:id/regenerate",auth,async(req,res)=>{
  try{
    if(!process.env.GROQ_API_KEY)
      return res.status(503).json({message:"GROQ_API_KEY is not configured."});

    const conversation=await Conversation.findOne({
      _id:req.params.id,
      userId:req.user.id
    });

    if(!conversation)
      return res.status(404).json({message:"Conversation not found."});

    const messages=await Message.find({
      conversationId:conversation._id,
      userId:req.user.id
    }).sort({createdAt:1});

    let lastUser=null;

    for(let i=messages.length-1;i>=0;i--){
      if(messages[i].role==="user"){
        lastUser=messages[i];
        break;
      }
    }

    if(!lastUser)
      return res.status(400).json({message:"No user message found."});

    const response=await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model:process.env.GROQ_MODEL||"openai/gpt-oss-20b",
        messages:[
          {
            role:"system",
            content:"You are CloudplusAI, a general-purpose AI assistant. Help the user with general knowledge, everyday questions, technology, programming, DevOps, AWS, Cloud, Kubernetes, Linux, learning, English practice, jobs, interviews, resumes, career guidance, writing, mathematics, business, productivity and normal conversation. Answer clearly, accurately and completely. Do not assume every question is technical. Give step-by-step instructions when useful. Use Markdown when useful. Be helpful, natural and conversational."
          },
          {
            role:"user",
            content:lastUser.content
          }
        ],
        temperature:.3,
        max_tokens:800
      },
      {
        headers:{
          Authorization:`Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type":"application/json"
        }
      }
    );

    await Message.create({
      userId:req.user.id,
      conversationId:conversation._id,
      role:"assistant",
      content:reply
    });

    conversation.updatedAt=new Date();
    await conversation.save();

    await Usage.findOneAndUpdate(
      {userId:req.user.id},
      {
        $inc:{requests:1,messages:1},
        $set:{lastRequestAt:new Date()}
      },
      {upsert:true}
    );

    res.json({reply});

  }catch(e){
    console.error(e.response?.data||e.message);
    res.status(500).json({message:"Unable to regenerate response."});
  }
});


/* Message feedback */
const feedbackSchema=new mongoose.Schema({
  userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
  messageId:{type:mongoose.Schema.Types.ObjectId,ref:"Message",required:true},
  type:{type:String,enum:["up","down"],required:true},
  createdAt:{type:Date,default:Date.now}
});

const Feedback=
  mongoose.models.Feedback||
  mongoose.model("Feedback",feedbackSchema);


app.post("/api/messages/:id/feedback",auth,async(req,res)=>{
  try{
    const type=req.body.type;

    if(!["up","down"].includes(type))
      return res.status(400).json({message:"Feedback must be up or down."});

    const message=await Message.findOne({
      _id:req.params.id,
      userId:req.user.id
    });

    if(!message)
      return res.status(404).json({message:"Message not found."});

    const feedback=await Feedback.findOneAndUpdate(
      {
        userId:req.user.id,
        messageId:message._id
      },
      {type},
      {upsert:true,new:true}
    );

    res.json({feedback});

  }catch(e){
    console.error(e);
    res.status(500).json({message:"Unable to save feedback."});
  }
});


/* Models available to frontend */
app.get("/api/models",auth,async(req,res)=>{
  res.json({
    models:[
      {
        id:"openai/gpt-oss-20b",
        name:"GPT OSS 20B",
        description:"Fast general purpose AI"
      },
      {
        id:"openai/gpt-oss-120b",
        name:"GPT OSS 120B",
        description:"Advanced reasoning"
      },
      {
        id:"qwen/qwen3.6-27b",
        name:"Qwen 3.6 27B",
        description:"Text + image capable model"
      },
      {
        id:"groq/compound",
        name:"Groq Compound",
        description:"Tool-enabled AI"
      }
    ]
  });
});


/* ================= END EXTRA FEATURES ================= */

app.get("/api/usage",auth,async(req,res)=>{const usage=await Usage.findOne({userId:req.user.id}),chats=await Conversation.countDocuments({userId:req.user.id}),messages=await Message.countDocuments({userId:req.user.id});res.json({usage:usage||{requests:0,messages:0},chats,messages})});
app.get("/api/keys",auth,async(req,res)=>{const keys=await ApiKey.find({userId:req.user.id,revokedAt:null}).sort({createdAt:-1});res.json({keys:keys.map(k=>({id:k._id.toString(),name:k.name,maskedKey:k.prefix+"••••••••",createdAt:k.createdAt,lastUsedAt:k.lastUsedAt}))})});
app.post("/api/keys",auth,async(req,res)=>{const raw="cpa_"+crypto.randomBytes(30).toString("hex"),keyHash=crypto.createHash("sha256").update(raw).digest("hex"),key=await ApiKey.create({userId:req.user.id,name:req.body.name||"My API Key",prefix:raw.slice(0,10),keyHash});res.status(201).json({id:key._id.toString(),key:raw})});
app.delete("/api/keys/:id",auth,async(req,res)=>{const key=await ApiKey.findOneAndUpdate({_id:req.params.id,userId:req.user.id,revokedAt:null},{revokedAt:new Date()},{new:true});if(!key)return res.status(404).json({message:"API key not found."});res.json({message:"API key revoked."})});

app.post("/api/playground",auth,async(req,res)=>{
  try{
    const message=String(req.body.message||"").trim();

    if(!message){
      return res.status(400).json({
        message:"Message is required."
      });
    }

    if(!process.env.GROQ_API_KEY){
      return res.status(500).json({
        message:"GROQ_API_KEY is not configured."
      });
    }

    const model=req.body.model||
      process.env.GROQ_MODEL||
      "openai/gpt-oss-20b";

    const response=await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model,
        messages:[
          {
            role:"system",
            content:
              "You are CloudplusAI, a general-purpose AI assistant. Answer clearly, accurately and completely. Help with general knowledge, everyday questions, technology, programming, DevOps, AWS, Cloud, Kubernetes, Linux, learning, English practice, jobs, interviews, resumes, career guidance, writing, mathematics, business, productivity and normal conversation. Do not assume every question is technical. Give step-by-step instructions when useful. Use Markdown when useful. Be helpful, natural and conversational."
          },
          {
            role:"user",
            content:message
          }
        ],
        temperature:0.3,
        max_tokens:1500
      },
      {
        headers:{
          Authorization:`Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type":"application/json"
        }
      }
    );

    const reply=
      response.data.choices?.[0]?.message?.content||
      "No response from AI.";

    res.json({
      model,
      reply
    });

  }catch(e){
    console.error(
      "PLAYGROUND ERROR:",
      e.response?.data||e.message
    );

    res.status(500).json({
      message:
        e.response?.data?.error?.message||
        "AI playground request failed."
    });
  }
});


// ======================================================
// CLOUDPLUSAI — SEARCH / MEMORY / ANALYTICS / NOTIFICATIONS
// ======================================================

const memorySchema = new mongoose.Schema({
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
    required: true,
    trim: true
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
  mongoose.models.Memory ||
  mongoose.model("Memory", memorySchema);


// ======================================================
// CHAT SEARCH
// GET /api/search?q=hello
// ======================================================

app.get("/api/search", auth, async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();

    if (!q) {
      return res.json({
        conversations: [],
        messages: []
      });
    }

    const conversations = await Conversation.find({
      userId: req.user.id,
      title: {
        $regex: q,
        $options: "i"
      }
    })
    .sort({ updatedAt: -1 })
    .limit(50);

    const messages = await Message.find({
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
    console.error("SEARCH ERROR:", e);

    res.status(500).json({
      message: "Unable to search chats."
    });
  }
});


// ======================================================
// GET MEMORY
// ======================================================

app.get("/api/memory", auth, async (req, res) => {
  try {

    const memories = await Memory.find({
      userId: req.user.id
    })
    .sort({ updatedAt: -1 })
    .limit(100);

    res.json({
      memories
    });

  } catch (e) {
    console.error("MEMORY GET ERROR:", e);

    res.status(500).json({
      message: "Unable to load memory."
    });
  }
});


// ======================================================
// CREATE / UPDATE MEMORY
// ======================================================

app.post("/api/memory", auth, async (req, res) => {
  try {

    const key = String(req.body.key || "").trim();
    const value = String(req.body.value || "").trim();

    if (!key || !value) {
      return res.status(400).json({
        message: "Memory key and value are required."
      });
    }

    const memory = await Memory.findOneAndUpdate(
      {
        userId: req.user.id,
        key
      },
      {
        $set: {
          value,
          updatedAt: new Date()
        },
        $setOnInsert: {
          userId: req.user.id,
          key
        }
      },
      {
        new: true,
        upsert: true
      }
    );

    res.status(201).json({
      memory
    });

  } catch (e) {
    console.error("MEMORY SAVE ERROR:", e);

    res.status(500).json({
      message: "Unable to save memory."
    });
  }
});


// ======================================================
// DELETE MEMORY
// ======================================================

app.delete("/api/memory/:id", auth, async (req, res) => {
  try {

    const result = await Memory.deleteOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!result.deletedCount) {
      return res.status(404).json({
        message: "Memory not found."
      });
    }

    res.json({
      message: "Memory deleted."
    });

  } catch (e) {
    console.error("MEMORY DELETE ERROR:", e);

    res.status(500).json({
      message: "Unable to delete memory."
    });
  }
});


// ======================================================
// ANALYTICS
// ======================================================

app.get("/api/analytics", auth, async (req, res) => {
  try {

    const userId = req.user.id;

    const [
      chats,
      messages,
      memories,
      usage
    ] = await Promise.all([
      Conversation.countDocuments({
        userId
      }),

      Message.countDocuments({
        userId
      }),

      Memory.countDocuments({
        userId
      }),

      Usage.findOne({
        userId
      })
    ]);

    const user = await User.findById(userId)
      .select("createdAt lastActiveAt");

    res.json({
      chats,
      messages,
      memories,

      requests: usage?.requests || 0,

      apiMessages: usage?.messages || 0,

      accountCreated: user?.createdAt || null,

      lastActive: user?.lastActiveAt || null
    });

  } catch (e) {
    console.error("ANALYTICS ERROR:", e);

    res.status(500).json({
      message: "Unable to load analytics."
    });
  }
});


// ======================================================
// NOTIFICATIONS
// ======================================================

app.get("/api/notifications", auth, async (req, res) => {
  try {

    const usage = await Usage.findOne({
      userId: req.user.id
    });

    const notifications = [
      {
        id: "welcome",
        type: "system",
        title: "Welcome to CloudplusAI",
        message: "Your AI workspace is ready.",
        read: false,
        createdAt: new Date()
      },

      {
        id: "memory",
        type: "feature",
        title: "Memory is available",
        message: "CloudplusAI can remember useful information from your conversations.",
        read: false,
        createdAt: new Date()
      },

      {
        id: "api",
        type: "developer",
        title: "API access available",
        message: "Create an API key and use CloudplusAI from your applications.",
        read: false,
        createdAt: new Date()
      }
    ];

    if (usage?.requests > 0) {
      notifications.push({
        id: "usage",
        type: "usage",
        title: "Usage update",
        message: `You have made ${usage.requests} API request(s).`,
        read: false,
        createdAt: new Date()
      });
    }

    res.json({
      notifications
    });

  } catch (e) {
    console.error("NOTIFICATION ERROR:", e);

    res.status(500).json({
      message: "Unable to load notifications."
    });
  }
});


// ======================================================
// END FEATURES
// ======================================================

app.post("/api/ai",auth,async(req,res)=>{
  try{
    const userMessage=(req.body.message||"").trim();
    let conversationId=req.body.conversationId;

    if(!userMessage)
      return res.status(400).json({reply:"Please enter a question."});

    if(!process.env.GROQ_API_KEY)
      return res.status(500).json({reply:"GROQ_API_KEY is not configured."});

    let conversation;

    if(conversationId){
      conversation=await Conversation.findOne({
        _id:conversationId,
        userId:req.user.id
      });

      if(!conversation)
        return res.status(404).json({reply:"Conversation not found."});
    }else{
      conversation=await Conversation.create({
        userId:req.user.id,
        title:userMessage.slice(0,60)||"New Chat"
      });
      conversationId=conversation._id.toString();
    }

    await Message.create({
      userId:req.user.id,
      conversationId:conversation._id,
      role:"user",
      content:userMessage
    });

    const previousMessages=await Message.find({
      userId:req.user.id,
      conversationId:conversation._id
    }).sort({createdAt:1}).limit(30);

    const messages=[
      {
        role:"system",
        content:"You are CloudplusAI, a general-purpose AI assistant. Help the user with general questions, technology, programming, DevOps, AWS, Cloud, Kubernetes, Linux, learning, English practice, jobs, interviews, resumes, career guidance, writing, mathematics, business and normal conversation. Answer directly, clearly and completely. Do not assume every question is technical. Give practical step-by-step answers when useful. Use Markdown when useful. Be helpful, natural and conversational."
      },
      ...previousMessages.map(m=>({
        role:m.role,
        content:m.content
      }))
    ];

    const response=await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model:process.env.GROQ_MODEL||"openai/gpt-oss-20b",
        messages,
        temperature:.3,
        max_tokens:1000
      },
      {
        headers:{
          Authorization:`Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type":"application/json"
        }
      }
    );

    const reply=response.data.choices?.[0]?.message?.content||"No reply from AI.";

    await Message.create({
      userId:req.user.id,
      conversationId:conversation._id,
      role:"assistant",
      content:reply
    });

    conversation.updatedAt=new Date();
    await conversation.save();

    await Usage.findOneAndUpdate(
      {userId:req.user.id},
      {
        $inc:{requests:1,messages:2},
        lastRequestAt:new Date()
      },
      {upsert:true,new:true}
    );

    res.json({
      reply,
      conversationId:conversation._id.toString()
    });

  }catch(e){
    console.error(e.response?.data||e.message);
    res.status(500).json({reply:"AI connection failed."});
  }
});
async function start(){if(process.env.MONGODB_URI){try{await mongoose.connect(process.env.MONGODB_URI);console.log("CloudplusAI MongoDB connected")}catch(e){console.error("MongoDB connection failed:",e.message)}}else console.warn("MONGODB_URI is not configured; persistence is disabled.");app.listen(PORT,"0.0.0.0",()=>console.log(`CloudplusAI backend running on port ${PORT}`))} start();
