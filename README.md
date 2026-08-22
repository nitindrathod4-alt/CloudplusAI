# ☁️ CloudplusAI

<p align="center"><strong>Developer-focused AI API Platform</strong><br>AI Chat • API Keys • Analytics • Rate Limiting • Docker • CI</p>

<p align="center">
<img src="https://img.shields.io/badge/status-active-success"> <img src="https://img.shields.io/badge/CI-GitHub%20Actions-blue"> <img src="https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white"> <img src="https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white"> <img src="https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white"> <img src="https://img.shields.io/badge/Nginx-009639?logo=nginx&logoColor=white">
</p>

> CloudplusAI is a practical AI platform built to demonstrate **application engineering + API development + DevOps** in one portfolio project.

## 🚀 Overview

CloudplusAI lets users authenticate, chat with AI, persist conversations, create and revoke API keys, monitor usage, and call a protected developer API from external applications. It also includes API documentation, an interactive API tester, Docker Compose orchestration, persistent MongoDB storage, and GitHub Actions CI. fileciteturn167file0

## ✨ Feature Highlights

| Area | What is included |
|---|---|
| 👤 Auth | Registration, login, JWT protection, logout |
| 💬 AI Chat | Interactive chat, history, MongoDB persistence |
| 🔑 API Platform | API keys, revocation, Bearer authentication |
| 📚 Developer Portal | API docs, cURL, JavaScript, Python, API tester |
| 📊 Analytics | Chats, messages, requests, active keys, recent activity |
| 🛡️ Security | Rate limiting, revoked-key protection, validation, 429 responses |
| 🐳 DevOps | Docker, Compose, Nginx, persistent MongoDB volume |
| 🔄 CI | GitHub Actions, Node 24, backend/frontend validation |

## 🏗️ Architecture

```text
                         ┌─────────────────────┐
                         │       GitHub        │
                         │ Source + Versioning │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   GitHub Actions    │
                         │        CI           │
                         └──────────┬──────────┘
                                    │
                                    ▼
                  ┌──────────────────────────────────┐
                  │          Docker Compose           │
                  │                                  │
                  │  ┌──────────┐     ┌──────────┐  │
Browser ─────────▶│  │  Nginx   │────▶│ Express  │  │
                  │  │ Frontend │     │ Backend  │  │
                  │  └──────────┘     └────┬─────┘  │
                  │                        │        │
                  │                        ▼        │
                  │                  ┌───────────┐  │
                  │                  │  MongoDB  │  │
                  │                  │ Persistent│  │
                  │                  │   Volume  │  │
                  │                  └───────────┘  │
                  └──────────────────────────────────┘
```

### 🔄 API Request Flow

```text
Client → Nginx → Express API
                 ↓
        Authentication / API Key
                 ↓
           Rate Limiting
                 ↓
        Request Validation
                 ↓
             AI Provider
                 ↓
              MongoDB
                 ↓
             Response
```

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Web Server | Nginx |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| AI Integration | Axios-based AI API integration |
| API Security | API Keys, Bearer Auth, Rate Limiting |
| Containers | Docker, Docker Compose |
| CI | GitHub Actions |
| Source Control | Git, GitHub |

## 📁 Project Structure

```text
CloudplusAI/
├── backend/
│   ├── server.js
│   ├── api-v1.js
│   ├── package.json
│   ├── Dockerfile
│   └── ...
├── frontend/
│   ├── index.html
│   ├── auth.html
│   ├── dashboard.html
│   ├── settings.html
│   ├── api-keys.html
│   ├── api-docs.html
│   ├── Dockerfile
│   └── nginx.conf
├── .github/workflows/ci.yml
├── docker-compose.yml
└── README.md
```

## 🔌 Developer API

### `POST /api/v1/chat`

```http
Authorization: Bearer <API_KEY>
Content-Type: application/json
```

```json
{
  "message": "Explain Kubernetes in simple words"
}
```

Example:

```bash
curl -X POST http://localhost/api/v1/chat \
  -H "Authorization: Bearer cpa_your_api_key" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello CloudplusAI"}'
```

### `GET /api/v1/health`

```bash
curl http://localhost/api/v1/health
```

For full examples and interactive testing, open the application's **API Docs** page.

## 🚦 Rate Limiting

Default developer API policy:

```text
30 requests / minute / API key
```

When the limit is exceeded:

```http
429 Too Many Requests
Retry-After: <seconds>
```

The API also exposes rate-limit headers so clients can manage request capacity. fileciteturn167file0

## 🐳 Run Locally

### Prerequisites

- Git
- Docker Desktop / Docker Engine
- Docker Compose

### Clone

```bash
git clone https://github.com/nitindrathod4-alt/CloudplusAI.git
cd CloudplusAI
```

### Configure secrets

Create `backend/.env` and add the required MongoDB, authentication, and AI-provider configuration.

**Never commit real API keys or `.env` files.**

### Start

```bash
docker compose up --build
```

Services:

```text
Frontend → http://localhost
Backend  → http://localhost:5000
MongoDB  → Docker internal network
```

Stop:

```bash
docker compose down
```

MongoDB uses a named persistent volume, so normal container recreation does not remove stored data. fileciteturn167file0

## 🔄 GitHub Actions CI

The CI workflow validates the project on pushes and pull requests targeting `main`.

```text
✓ Checkout
✓ Node.js 24 setup
✓ Backend package verification
✓ Backend dependency installation
✓ Backend JavaScript syntax validation
✓ Frontend file validation
```

## 🔐 Security

- Never commit `.env` or provider/API secrets.
- Treat API keys as credentials.
- Revoke compromised keys immediately.
- Keep production MongoDB private.
- Use HTTPS for public deployments.
- Configure restrictive CORS and network rules.
- Use AWS Secrets Manager / SSM for production secrets when deployed.

## 🧪 Engineering / DevOps Validation

| Layer | Validation |
|---|---|
| Source Control | Git + GitHub |
| CI | GitHub Actions |
| Backend | Dependency + syntax checks |
| Frontend | Required-page validation |
| API | Authentication + validation |
| Security | API keys + rate limiting |
| Database | MongoDB persistence |
| Infrastructure | Docker + Compose |
| Web Layer | Nginx |

## 📈 DevOps Roadmap

### Completed

- [x] GitHub source control
- [x] GitHub Actions CI
- [x] Dockerized frontend
- [x] Dockerized backend
- [x] Docker Compose stack
- [x] MongoDB persistent volume
- [x] API documentation
- [x] API key management
- [x] API tester
- [x] Usage analytics
- [x] Rate limiting
- [x] Request validation

### Next

- [ ] AWS EC2 production deployment
- [ ] Amazon ECR / image registry
- [ ] Automated deployment pipeline
- [ ] Domain + HTTPS/SSL
- [ ] CloudWatch monitoring
- [ ] Production secret management
- [ ] Database backup strategy
- [ ] Production alerting

## 💼 Why This Project?

CloudplusAI demonstrates an end-to-end workflow instead of only a UI or a single Docker container:

```text
Application
    ↓
REST API
    ↓
Authentication + API Keys
    ↓
Security + Rate Limiting
    ↓
MongoDB Persistence
    ↓
Docker + Compose
    ↓
GitHub Actions CI
    ↓
AWS Deployment (Roadmap)
```

### 🎯 Recruiter Snapshot

**Problem:** Provide a usable AI experience and a developer-facing API.

**Engineering:** Authentication, persistent conversations, API keys, validation and usage analytics.

**DevOps:** GitHub, CI automation, Docker, Docker Compose, Nginx and persistent database infrastructure.

**Production direction:** AWS deployment, HTTPS, monitoring, secrets management and automated delivery are planned next.

## 📸 Screenshots

Add application screenshots here as the UI is finalized:

```text
/docs/screenshots/
├── login.png
├── dashboard.png
├── chat.png
├── api-keys.png
└── api-docs.png
```

## 👨‍💻 Author

**Nitin Rathod**  
**DevOps / Cloud Engineer**

`AWS • Docker • Kubernetes • Terraform • Jenkins • GitHub Actions • Linux`

## ⭐ Project

If CloudplusAI is useful, consider starring the repository and sharing feedback.

> **Built to learn. Built to deploy. Built with DevOps in mind. 🚀**
