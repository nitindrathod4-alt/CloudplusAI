# ☁️ CloudplusAI

<p align="center"><strong>Developer-focused AI API Platform</strong><br>AI Chat • API Keys • Analytics • Rate Limiting • Docker • CI/CD • Production</p>

<p align="center"><img src="https://img.shields.io/badge/status-completed-success"> <img src="https://img.shields.io/badge/CI-GitHub%20Actions-blue"> <img src="https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white"> <img src="https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white"> <img src="https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white"> <img src="https://img.shields.io/badge/Nginx-009639?logo=nginx&logoColor=white"></p>

> **CloudplusAI is a completed end-to-end AI platform** combining application engineering, REST API development, security, database persistence, containerization, CI/CD and production deployment.

## 🟢 Project Status — COMPLETED

**CloudplusAI — Full Project: DONE ✅**

The application, developer API, authentication, database layer, security controls, Docker infrastructure, CI/CD workflow and production deployment are presented as completed project components.

- [x] Core application
- [x] Authentication & authorization
- [x] AI Chat
- [x] MongoDB persistence
- [x] Developer API
- [x] API key management
- [x] Usage analytics
- [x] API documentation & tester
- [x] Rate limiting & request validation
- [x] Docker & Docker Compose
- [x] Nginx
- [x] GitHub Actions CI/CD
- [x] Production deployment
- [x] Production security/configuration

---

## 🚀 Overview

CloudplusAI provides a complete AI application and developer API workflow. Users can authenticate, chat with AI, persist conversations, manage API keys, monitor usage and integrate the protected API into external applications.

The platform brings the application and DevOps lifecycle together in one project: source control, automated CI/CD, containers, reverse proxy, database persistence, API security and production delivery.

## ✨ Feature Highlights

| Area | Implementation |
|---|---|
| 👤 Authentication | Registration, login, JWT protection, logout |
| 💬 AI Chat | Interactive chat, history, MongoDB persistence |
| 🔑 Developer API | API keys, revocation, Bearer authentication |
| 📚 Developer Portal | API docs, cURL, JavaScript, Python, API tester |
| 📊 Analytics | Chats, messages, requests, active keys, recent activity |
| 🛡️ Security | Rate limiting, validation, revoked-key protection, 429 responses |
| 🐳 Containerization | Docker, Docker Compose, persistent MongoDB volume |
| 🌐 Web Layer | Nginx frontend serving and API proxying |
| 🔄 CI/CD | GitHub Actions automated workflow |
| ☁️ Production | Cloud deployment and production configuration |

## 🏗️ End-to-End Architecture

```text
Developer
   │
   ├── Git Push
   ▼
┌──────────────┐
│    GitHub    │
└──────┬───────┘
       ▼
┌────────────────────┐
│   GitHub Actions   │
│     CI / CD        │
└─────────┬──────────┘
          ▼
┌─────────────────────────────────────┐
│          Containerized Stack        │
│                                     │
│  ┌──────────┐    ┌──────────────┐  │
│  │  Nginx   │───▶│   Express    │  │
│  │ Frontend │    │   Backend    │  │
│  └──────────┘    └──────┬───────┘  │
│                         │          │
│                         ▼          │
│                  ┌────────────┐   │
│                  │  MongoDB   │   │
│                  │ Persistent │   │
│                  │   Volume   │   │
│                  └────────────┘   │
└──────────────────┬──────────────────┘
                   │
                   ▼
          Production Environment
```

### 🔄 API Request Flow

```text
Client
  ↓
Nginx
  ↓
Express API
  ↓
JWT / API-Key Authentication
  ↓
Rate-Limit Check
  ↓
Request Validation
  ↓
AI Provider
  ↓
MongoDB
  ↓
Response
```

## 🧰 Technology Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Web Server / Proxy | Nginx |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| AI Integration | Axios-based AI API integration |
| API Security | API Keys, Bearer Auth, Rate Limiting |
| Containers | Docker, Docker Compose |
| CI/CD | GitHub Actions |
| Source Control | Git, GitHub |
| Cloud / Deployment | Production cloud deployment |

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

For complete examples and interactive testing, use the application's **API Docs** page.

## 🚦 API Rate Limiting

Default developer API policy:

```text
30 requests / minute / API key
```

When the limit is exceeded:

```http
429 Too Many Requests
Retry-After: <seconds>
```

Rate-limit headers expose remaining request capacity.

## 🐳 Containerization

CloudplusAI uses Docker to package application components consistently and Docker Compose to orchestrate the multi-service environment.

```text
Frontend / Nginx
       │
       ├── Backend / Express
       │        │
       │        └── MongoDB
       │
       └── Persistent database volume
```

The containerized stack provides repeatable development and deployment behavior.

## 🔄 CI/CD Pipeline

```text
Git Push
   ↓
GitHub
   ↓
GitHub Actions
   ↓
Checkout
   ↓
Node.js Setup
   ↓
Dependency Installation
   ↓
Backend Validation
   ↓
Frontend Validation
   ↓
Build / Delivery
   ↓
Production Deployment
   ↓
🟢 COMPLETED
```

The CI/CD workflow automates project validation and delivery rather than relying entirely on manual deployment steps.

## 🔐 Security

- JWT-based user authentication
- Protected API endpoints
- API-key authentication
- API-key revocation
- Per-key rate limiting
- Request validation
- `429` abuse protection
- Environment-based secrets
- Production HTTPS/security configuration
- Private database configuration

**Never commit real credentials, provider keys or `.env` files.**

## 🧠 Challenges & Solutions

| Challenge | Solution |
|---|---|
| API abuse / excessive requests | Per-API-key rate limiting + `429` responses |
| Invalid or revoked credentials | API-key validation and revocation checks |
| Data persistence | MongoDB persistent volume |
| Manual validation | GitHub Actions automation |
| Multiple services | Docker Compose orchestration |
| Frontend/API routing | Nginx reverse-proxy layer |
| External developer integration | Protected REST API + API documentation |
| Repeatable deployment | Containerized application stack + CI/CD |

## 🧪 Engineering Validation

| Layer | Validation |
|---|---|
| Source Control | Git + GitHub |
| CI/CD | GitHub Actions |
| Backend | Dependency + syntax checks |
| Frontend | Required-page validation |
| API | Authentication + request validation |
| Security | API keys + rate limiting |
| Database | MongoDB persistence |
| Infrastructure | Docker + Compose |
| Web Layer | Nginx |
| Deployment | Production delivery workflow |

## 📊 Project Summary

| Component | Status |
|---|---|
| Application | 🟢 Complete |
| AI Chat | 🟢 Complete |
| Authentication | 🟢 Complete |
| Developer API | 🟢 Complete |
| API Security | 🟢 Complete |
| Analytics | 🟢 Complete |
| MongoDB | 🟢 Complete |
| Docker | 🟢 Complete |
| Docker Compose | 🟢 Complete |
| Nginx | 🟢 Complete |
| GitHub Actions | 🟢 Complete |
| CI/CD | 🟢 Complete |
| Production Deployment | 🟢 Complete |

## 💼 Why This Project Stands Out

CloudplusAI is not only a chat interface. It demonstrates an end-to-end engineering lifecycle:

```text
Application Engineering
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
Nginx
        ↓
GitHub Actions CI/CD
        ↓
Production Deployment
        ↓
🟢 PROJECT COMPLETED
```

### 🎯 Recruiter Snapshot

**Problem:** Provide a usable AI experience and a developer-facing API.

**Engineering:** Authentication, persistent conversations, API keys, validation and usage analytics.

**DevOps:** GitHub, GitHub Actions, Docker, Docker Compose, Nginx, MongoDB persistence and CI/CD.

**Production:** Containerized delivery, production configuration, security and deployment workflow.

## 📸 Screenshots

Recommended portfolio screenshots:

```text
/docs/screenshots/
├── login.png
├── dashboard.png
├── chat.png
├── api-keys.png
├── api-docs.png
└── usage-analytics.png
```

## 🧩 Interview Topics Covered

This project can be used to discuss:

- Why Docker instead of running Node directly?
- Why Docker Compose for this architecture?
- How does Nginx route and proxy requests?
- How are API keys authenticated and revoked?
- How does rate limiting protect the API?
- How is MongoDB data persisted?
- What does GitHub Actions validate?
- How does the CI/CD workflow deliver the application?
- How would the system scale?
- How would production monitoring and security be handled?

## 👨‍💻 Author

**Nitin Rathod**  
**DevOps / Cloud Engineer**

`AWS • Docker • Kubernetes • Terraform • Jenkins • GitHub Actions • Linux`

## ⭐ Project

If CloudplusAI is useful, consider starring the repository and sharing feedback.

> **Built to learn. Built to deploy. Built with DevOps in mind. 🚀**

---

## 🟢 FINAL STATUS: PROJECT COMPLETED

**CloudplusAI is presented as a complete end-to-end project — application, API, security, database, containers, CI/CD and production deployment.**
