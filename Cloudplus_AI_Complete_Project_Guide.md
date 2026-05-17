# CloudplusAI Complete Project Guide

## 1. Project Name

**CloudplusAI Chatbot**

---

## 2. Project Domain

This project belongs to:

- Artificial Intelligence
- Cloud Computing
- DevOps
- Docker
- Web Development
- API Integration

---

## 3. Project Description

CloudplusAI is a cloud-deployed AI chatbot application.

The user opens the frontend page in a browser, types a question, clicks **Ask AI**, and receives an answer from the Groq AI API through a Node.js backend.

---

## 4. Technologies Used

| Component | Technology |
|---|---|
| Cloud Server | AWS EC2 Ubuntu |
| Frontend | HTML, CSS, JavaScript |
| Frontend Server | Nginx |
| Backend | Node.js, Express.js |
| AI Provider | Groq API |
| API Call Library | Axios |
| Environment Variables | dotenv |
| Containerization | Docker |
| Multi-container Setup | Docker Compose |

---

## 5. High Level Architecture Diagram

```text
+------------------+
|   User Browser   |
|  CloudplusAI UI |
+---------+--------+
          |
          | HTTP Request
          v
+------------------+
| Frontend Container|
| Nginx + index.html|
| Port: 80          |
+---------+--------+
          |
          | /api/ai reverse proxy
          v
+-------------------+
| Backend Container |
| Node.js + Express |
| Port: 5000        |
+---------+---------+
          |
          | HTTPS API Call
          v
+------------------+
|    Groq AI API    |
| Llama AI Model    |
+---------+--------+
          |
          | AI Reply
          v
+------------------+
| Browser Response |
+------------------+
```

---

## 6. Running Flow

```text
Step 1: User opens http://EC2_PUBLIC_IP
Step 2: Nginx serves index.html
Step 3: User enters question
Step 4: JavaScript fetch() sends POST request to /api/ai
Step 5: Nginx forwards /api/ai request to backend:5000/api/ai
Step 6: Backend reads user question
Step 7: Backend sends question to Groq API
Step 8: Groq returns AI answer
Step 9: Backend sends answer to frontend
Step 10: Frontend displays answer on page
```

---

## 7. Use Cases

### Use Case 1: Ask General Question

User asks:

```text
What is AWS?
```

AI replies with a simple explanation.

### Use Case 2: DevOps Learning

User asks:

```text
What is Docker?
```

AI explains Docker.

### Use Case 3: Interview Preparation

User asks:

```text
Explain EC2 in 2 lines.
```

AI gives a short interview-style answer.

### Use Case 4: Cloud Project Demo

This project can be shown as a practical AI + DevOps project.

---

## 8. Final Folder Structure

```text
docker-3tier-app/
│
├── docker-compose.yml
│
├── frontend/
│   ├── Dockerfile
│   ├── index.html
│   └── nginx.conf
│
└── backend/
    ├── Dockerfile
    ├── package.json
    ├── package-lock.json
    ├── server.js
    └── .env
```

---

# PART A: AWS EC2 SETUP

---

## 9. Launch EC2 Instance

Recommended configuration:

```text
AMI: Ubuntu Server
Instance Type: c7flex.large  or higher
Storage: 50 GB
Security Group Ports:
22   SSH
80   HTTP
5000 is mainly used to run a backend server or API in applications like Node.js/Express
5173 frontend development server
3306 mysql db

## Allocate Elastic IP

After creating the EC2 instance, allocate an Elastic IP and associate it with the instance.

Steps:
1. Open AWS Console
2. Go to EC2 Dashboard
3. Click Elastic IPs
4. Allocate new Elastic IP
5. Associate the Elastic IP with your EC2 instance 
---

## 10. Connect to EC2

From Windows PowerShell or terminal:

```bash
ssh -i "cloudwatch.pem" ubuntu@YOUR_EC2_PUBLIC_IP
```

Example:

```bash
ssh -i "cloudwatch.pem" ubuntu@13.126.173.112
```

---

## 11. Become Root User

```bash
sudo -i
```

---

# PART B: DOCKER INSTALLATION

---

## 12. Update Server

```bash
apt update
```

---

## 13. Install Docker

```bash
apt install docker.io -y
```

---

## 14. Start Docker

```bash
systemctl start docker
systemctl enable docker
```

---

## 15. Check Docker Version

```bash
docker --version
```

---

## 16. Install Docker Compose Plugin

```bash
apt install docker-compose-v2 -y
```

---

## 17. Check Docker Compose Version

```bash
docker compose version
```

---

# PART C: PROJECT CREATION

---

## 18. Create Main Project Directory

```bash
cd ~
mkdir docker-3tier-app
cd docker-3tier-app
```

---

## 19. Create Frontend and Backend Folders

```bash
mkdir frontend backend
```

---

# PART D: FRONTEND SETUP

---

## 20. Go to Frontend Folder

```bash
cd ~/docker-3tier-app/frontend
```

---

## 21. Create Frontend Dockerfile

```bash
nano Dockerfile
```

Paste this code:

```Dockerfile
FROM nginx:latest

COPY index.html /usr/share/nginx/html/index.html
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

Save:

```text
Ctrl + O
Enter
Ctrl + X
```

---

## 22. Create Nginx Config File

```bash
nano nginx.conf
```

Paste this code:

```nginx
server {
    listen 80;

    location / {
        root /usr/share/nginx/html;
        index index.html;
    }

    location /api/ {
        proxy_pass http://backend:5000/api/;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
}
```

Save:

```text
Ctrl + O
Enter
Ctrl + X
```

---

## 23. Create Frontend Page

```bash
nano index.html
```

Paste this code:

```html
<!DOCTYPE html>
<html>
<head>
    <title>CloudplusAI</title>

    <style>
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #1e3c72, #2a5298);
            color: white;
            text-align: center;
            padding-top: 90px;
        }

        .box {
            width: 420px;
            margin: auto;
            padding: 30px;
            border-radius: 16px;
            background: rgba(255, 255, 255, 0.12);
            box-shadow: 0 0 20px rgba(0,0,0,0.3);
        }

        h1 {
            margin-bottom: 20px;
        }

        input {
            width: 85%;
            padding: 12px;
            border-radius: 10px;
            border: none;
            outline: none;
            font-size: 16px;
        }

        button {
            margin-top: 16px;
            padding: 12px 24px;
            border: none;
            border-radius: 10px;
            background: orange;
            color: white;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
        }

        button:hover {
            background: darkorange;
        }

        #response {
            margin-top: 22px;
            background: white;
            color: black;
            padding: 16px;
            border-radius: 10px;
            min-height: 30px;
            text-align: left;
            white-space: pre-wrap;
        }
    </style>
</head>

<body>

<div class="box">
    <h1>CloudplusAI</h1>

    <input type="text" id="question" placeholder="Ask AI anything...">

    <br>

    <button onclick="askAI()">Ask AI</button>

    <div id="response">AI answer will appear here...</div>
</div>

<script>
async function askAI() {

    const question = document.getElementById("question").value;
    const responseBox = document.getElementById("response");

    if (!question.trim()) {
        responseBox.innerHTML = "Please type a question.";
        return;
    }

    responseBox.innerHTML = "Thinking...";

    try {
        const res = await fetch("/api/ai", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: question
            })
        });

        const data = await res.json();

        responseBox.innerHTML = data.reply || "No reply from AI";

    } catch (error) {
        console.log(error);
        responseBox.innerHTML = "Error connecting AI";
    }
}
</script>

</body>
</html>
```

Save:

```text
Ctrl + O
Enter
Ctrl + X
```

---

# PART E: BACKEND SETUP

---

## 24. Go to Backend Folder

```bash
cd ~/docker-3tier-app/backend
```

---

## 25. Initialize Node.js Project

```bash
npm init -y
```
-
## 26. Install Backend Packages

```bash
npm install express cors axios dotenv
```

---

## 27. Create Backend Dockerfile

```bash
nano Dockerfile
```

Paste this code:

```Dockerfile
FROM node:18

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

CMD ["npm", "start"]
```

Save:

```text
Ctrl + O
Enter
Ctrl + X
```

---

## 28. Create .env File for Groq API Key

```bash
nano .env
```

Paste this:

```env
GROQ_API_KEY=YOUR_GROQ_API_KEY_HERE
```

Important:

```text
GROQ_API_KEY=gsk_your_real_groq_api_key
### 
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root123
DB_NAME=astramindai
DB_PORT=3306 
###

```

Save:

```text
Ctrl + O
Enter
Ctrl + X
```

---

## 29. Get Groq API Key

Open Groq Console:

```text
https://console.groq.com/keys
```

Steps:

```text
Login
Create API Key
Copy Key
Paste in backend/.env
```

---

## 30. Create server.js

```bash
nano server.js
```

Paste this code:

```js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend Running");
});

app.post("/api/ai", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({
        reply: "Please enter a question."
      });
    }

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: "You are CloudplusAI. Give clear, short, correct answers. If you do not know something, say I don't know."
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        temperature: 0.3,
        max_tokens: 300
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({
      reply: response.data.choices[0].message.content
    });

  } catch (error) {
    console.log(error.response?.data || error.message);

    res.status(500).json({
      reply: "AI connection failed"
    });
  }
});

app.listen(5000, "0.0.0.0", () => {
  console.log("Backend running on port 5000");
});
```

Save:

```text
Ctrl + O
Enter
Ctrl + X
```

---

## 31. Check package.json
'''bash
npm install express cors axios dotenv mysql2 

```bash
cat package.json
```

It should contain this start script:

```json
"scripts": {
  "start": "node server.js"
}
```

If missing, edit:

```bash
nano package.json
```

Example full package.json:

```json
{
  "name": "backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.18.2"
  }
}
```

---

# PART F: DOCKER COMPOSE SETUP

---

## 32. Go to Main Project Folder

```bash
cd ~/docker-3tier-app
```

---

## 33. Create docker-compose.yml

```bash
nano docker-compose.yml
```

Paste this code:

```yaml
services:

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: always

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    env_file:
      - ./backend/.env
    depends_on:
      - mysql
    restart: always

  mysql:
    image: mysql:8.0
    container_name: cloudplusai_mysql
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: root123
      MYSQL_DATABASE: CloudplusAI
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

Save:

```text
Ctrl + O
Enter
Ctrl + X
```

---

# PART G: RUN PROJECT

---

## 34. Stop Old Containers

```bash
docker compose down
```

---

## 35. Build and Start Containers

```bash
docker compose up -d --build
```

---

## 36. Check Containers

```bash
docker compose ps
```

Expected output:

```text
frontend   Up   0.0.0.0:80->80/tcp
backend    Up   0.0.0.0:5000->5000/tcp
```

---

# PART H: TESTING

---

## 37. Test Backend Home Route

```bash
curl http://localhost:5000
```

Expected:

```text
Backend Running
```

---

## 38. Test AI API Directly

```bash
curl -X POST http://localhost:5000/api/ai \
-H "Content-Type: application/json" \
-d '{"message":"what is aws in 2 lines"}'
```

Expected:

```json
{"reply":"AWS is Amazon Web Services..."}
```

---

## 39. Test Through Nginx Proxy

```bash
curl -X POST http://localhost/api/ai \
-H "Content-Type: application/json" \
-d '{"message":"what is docker"}'
```

Expected:

```json
{"reply":"Docker is a containerization platform..."}
```

---

## 40. Open in Browser

```text
http://YOUR_EC2_PUBLIC_IP
```

Example:

```text
http://13.126.173.112
```

Then ask:

```text
what is aws
```

---

# PART I: TROUBLESHOOTING

---

## 41. Error: AI connection failed

Check backend logs:

```bash
docker compose logs backend --tail=50
```

Common reasons:

```text
Wrong Groq API key
Missing .env file
Wrong model name
Internet issue
Groq quota limit
```

---

## 42. Error: Backend Not Running

Check:

```bash
docker compose ps -a
```

Restart:

```bash
docker compose up -d --build backend
```

---

## 43. Error: Browser Refused to Connect

Check containers:

```bash
docker compose ps
```

Check AWS Security Group:

```text
Port 80 must be open
Source: 0.0.0.0/0
```

---

## 44. Error: API Key Not Working

Check `.env`:

```bash
cat backend/.env
```

Expected:

```env
GROQ_API_KEY=gsk_your_real_key
```

Rebuild:

```bash
docker compose down
docker compose up -d --build
```

---

## 45. Error: Model Not Found

Use this Groq model:

```text
llama-3.1-8b-instant
```

Do not use old model names if Groq rejects them.

---

# PART J: IMPORTANT COMMANDS

---

## 46. View Containers

```bash
docker ps
```

---

## 47. View Compose Services

```bash
docker compose ps
```

---

## 48. View Backend Logs

```bash
docker compose logs backend --tail=80
```

---

## 49. View Frontend Logs

```bash
docker compose logs frontend --tail=80
```

---

## 50. Restart All Services

```bash
docker compose restart
```

---

## 51. Rebuild Full Project

```bash
docker compose down
docker compose up -d --build
```

---

## 52. Delete Containers Only

```bash
docker compose down
```

---

# PART K: FINAL PROJECT EXPLANATION FOR STUDENTS

---

## 53. What We Installed

```text
Docker
Docker Compose
Node.js packages inside backend container
Nginx inside frontend container
Groq API key in .env file
```

---

## 54. Why Dockerfile is Used

Dockerfile is used to create an image.

Frontend Dockerfile creates an Nginx image with our HTML page.

Backend Dockerfile creates a Node.js image with Express API.

---

## 55. Why docker-compose.yml is Used

Docker Compose runs multiple containers together.

In this project it runs:

```text
frontend container
backend container
```

---

## 56. Why Nginx is Used

Nginx serves frontend page and forwards API requests to backend.

Frontend request:

```text
/api/ai
```

Nginx forwards it to:

```text
backend:5000/api/ai
```

---

## 57. Why .env is Used

`.env` stores secret API key safely.

We should not write API key directly in code.

---

## 58. Why Backend is Used

Frontend should not directly call Groq API because API key would be exposed.

Backend protects API key and securely calls Groq.

---

# PART L: FINAL DEMO SCRIPT

---

## 59. Demo Steps

```text
1. Open browser
2. Visit EC2 public IP
3. CloudplusAI page opens
4. Type: What is AWS?
5. Click Ask AI
6. Frontend sends request to backend
7. Backend calls Groq API
8. AI answer appears on screen
```

---

## 60. Resume Line

```text
Built and deployed CloudplusAI, a Dockerized AI chatbot using Node.js, Express.js, Nginx, Groq API, and AWS EC2.
```

---

## 61. Interview Explanation

```text
CloudplusAI is an AI chatbot project deployed on AWS EC2. I used Docker Compose to run frontend and backend containers. The frontend is served by Nginx, and the backend is built with Node.js and Express. The backend securely calls Groq API using an API key stored in a .env file.
```

---

# Final Note

This guide contains the full setup from EC2 to Docker deployment, including all files, commands, flow, use cases, and troubleshooting steps.
