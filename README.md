# ☁️ CloudplusAI

> A developer-focused AI platform with authentication, conversations, API keys, usage analytics, rate limiting, API documentation, Docker, MongoDB, and GitHub Actions CI.

![Status](https://img.shields.io/badge/status-active-success)
![CI](https://img.shields.io/badge/CI-GitHub%20Actions-blue)
![Docker](https://img.shields.io/badge/containerized-Docker-2496ED)
![Database](https://img.shields.io/badge/database-MongoDB-47A248)
![Backend](https://img.shields.io/badge/backend-Node.js-339933)

## 🚀 Overview

CloudplusAI is designed as a practical AI API platform rather than a simple chat UI. Users can authenticate, manage conversations, create API keys, monitor usage, and call the AI API from external applications.

The project also includes a developer portal with API documentation and examples for cURL, JavaScript, and Python.

## ✨ Key Features

### 👤 Authentication
- User registration and login
- JWT-based authentication
- Protected application routes
- Logout/session handling

### 💬 AI Chat
- Interactive AI chat interface
- Conversation persistence with MongoDB
- Chat history
- Backend API for AI requests

### 🔑 API Platform
- API key creation and management
- API key revocation
- Bearer-token authentication
- `POST /api/v1/chat`
- Developer API documentation
- cURL, JavaScript, and Python examples
- Built-in API tester

### 📊 Usage & Analytics
- Total chats
- Total messages
- API request count
- Active API keys
- Recent API activity
- Seven-day usage visualization

### 🛡️ Security & Reliability
- API key validation
- Revoked-key protection
- Per-key rate limiting
- `429 Too Many Requests` responses
- `Retry-After` and rate-limit headers
- Request/message size validation
- Environment-based configuration

### 🐳 DevOps
- Dockerized frontend and backend
- Docker Compose orchestration
- MongoDB container with persistent volume
- Nginx frontend container
- GitHub Actions CI
- Automated backend dependency installation and syntax checks
- Frontend validation in CI

## 🏗️ Architecture

```text
                         ┌──────────────────────┐
                         │       GitHub         │
                         │   Source Control     │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   GitHub Actions CI  │
                         │ Build / Validation   │
                         └──────────┬───────────┘
                                    │
                                    ▼
                    ┌────────────────────────────────┐
                    │         Docker Compose         │
                    │                                │
                    │  ┌────────────┐  ┌──────────┐ │
                    │  │  Frontend  │  │ Backend  │ │
                    │  │   Nginx    │─▶│ Express  │ │
                    │  └────────────┘  └────┬─────┘ │
                    │                       │       │
                    │                       ▼       │
                    │                ┌────────────┐ │
                    │                │  MongoDB   │ │
                    │                │ Persistent │ │
                    │                │   Volume   │ │
                    │                └────────────┘ │
                    └────────────────────────────────┘
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
│
├── frontend/
│   ├── index.html
│   ├── auth.html
│   ├── dashboard.html
│   ├── settings.html
│   ├── api-keys.html
│   ├── api-docs.html
│   ├── Dockerfile
│   └── nginx.conf
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── docker-compose.yml
└── README.md
```

## 🔌 API

### Chat

```http
POST /api/v1/chat
Authorization: Bearer <API_KEY>
Content-Type: application/json
```

Request:

```json
{
  "message": "Explain Kubernetes in simple words"
}
```

The API validates the API key, applies rate limiting, processes the request, and persists relevant usage/conversation data.

### Health Check

```http
GET /api/v1/health
```

## 🧪 Local Development

### Prerequisites

- Git
- Docker Desktop / Docker Engine
- Docker Compose

### 1. Clone

```bash
git clone https://github.com/nitindrathod4-alt/CloudplusAI.git
cd CloudplusAI
```

### 2. Configure environment variables

Create:

```text
backend/.env
```

Add the required application secrets and AI provider configuration used by the backend. **Do not commit `.env` or real API keys to GitHub.**

### 3. Start the complete stack

```bash
docker compose up --build
```

Services:

```text
Frontend : http://localhost
Backend  : http://localhost:5000
MongoDB  : mongodb://localhost:27017
```

### 4. Stop the stack

```bash
docker compose down
```

MongoDB data is stored in the named `mongo_data` volume so the database survives normal container recreation.

## 🔄 CI/CD

GitHub Actions runs the project's CI workflow for pushes and pull requests targeting `main`.

Current checks include:

- Checkout source code
- Setup Node.js 24
- Verify backend package configuration
- Install backend dependencies
- Check backend JavaScript syntax
- Validate important frontend files

## 🔐 Security Notes

- Never commit `.env` files or provider/API secrets.
- Store production secrets in a proper secret-management system when deploying to AWS.
- API keys should be treated as credentials.
- Revoke compromised keys immediately.
- Keep production database access private.
- Use HTTPS for public deployments.
- Configure restrictive CORS and network rules for production.

## 📈 DevOps Roadmap

- [x] GitHub repository
- [x] GitHub Actions CI
- [x] Dockerized frontend
- [x] Dockerized backend
- [x] Docker Compose stack
- [x] MongoDB container + persistent volume
- [x] API documentation
- [x] API key management
- [x] Rate limiting
- [x] Usage analytics
- [ ] AWS EC2 production deployment
- [ ] Docker image registry / ECR
- [ ] HTTPS with domain + SSL
- [ ] CloudWatch monitoring
- [ ] Production secret management
- [ ] Automated deployment pipeline
- [ ] Database backup strategy

## 💼 Why This Project?

CloudplusAI demonstrates an end-to-end engineering workflow combining application development with practical DevOps concepts: source control, CI validation, containerization, service orchestration, persistent data, API security, observability-oriented usage metrics, and deployment readiness.

## 👨‍💻 Author

**Nitin Rathod**

DevOps / Cloud Engineer — AWS • Docker • Kubernetes • Terraform • Jenkins • GitHub Actions

## ⭐ Support

If you find the project useful, consider starring the repository and sharing feedback.
