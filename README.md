# ☁️ CloudplusAI

<p align="center">
  <strong>Production AI Platform • Developer API • Cloud & DevOps Showcase</strong>
</p>

<p align="center">
  AI Chat • GPT OSS 20B • Authentication • Conversations • API Keys • Analytics • Rate Limiting • Docker • Kubernetes • Terraform • CI/CD • Observability
</p>

<p align="center">
  <a href="https://cloudplusai.dreamapexai.online">🌐 Live Application</a> •
  <a href="https://github.com/nitindrathod4-alt/CloudplusAI">💻 GitHub Repository</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/AI-GPT%20OSS%2020B-7C3AED?style=for-the-badge" alt="AI Model">
  <img src="https://img.shields.io/badge/Provider-Groq-000000?style=for-the-badge" alt="Groq">
  <img src="https://img.shields.io/badge/Backend-Railway-0B0D0E?style=for-the-badge" alt="Railway">
  <img src="https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB Atlas">
  <img src="https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white" alt="GitHub Actions">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker">
  <img src="https://img.shields.io/badge/Kubernetes-326CE5?style=flat-square&logo=kubernetes&logoColor=white" alt="Kubernetes">
  <img src="https://img.shields.io/badge/Terraform-844FBA?style=flat-square&logo=terraform&logoColor=white" alt="Terraform">
  <img src="https://img.shields.io/badge/Jenkins-D24939?style=flat-square&logo=jenkins&logoColor=white" alt="Jenkins">
  <img src="https://img.shields.io/badge/FluxCD-5468FF?style=flat-square&logo=flux&logoColor=white" alt="Flux CD">
  <img src="https://img.shields.io/badge/Prometheus-E6522C?style=flat-square&logo=prometheus&logoColor=white" alt="Prometheus">
  <img src="https://img.shields.io/badge/Grafana-F46800?style=flat-square&logo=grafana&logoColor=white" alt="Grafana">
</p>

> **CloudplusAI is a developer-focused AI platform built to demonstrate a complete application and DevOps lifecycle — from authentication and AI conversations to API security, containerization, infrastructure as code, CI/CD, Kubernetes and observability.**

---

## 🆕 CloudplusAI AI Version

### **CloudplusAI v2.0 — GPT OSS 20B**

| Component | Current Version / Configuration |
|---|---|
| 🤖 AI Model | **GPT OSS 20B** |
| 🧠 Model ID | `openai/gpt-oss-20b` |
| ⚡ AI Provider | **Groq API** |
| 🔐 Authentication | JWT |
| 💬 Conversations | MongoDB persistence |
| 🔑 Developer API | API-key based access |
| 🛡️ API Protection | Request validation + rate limiting |
| 🗄️ Database | MongoDB Atlas |
| 🔧 Backend | Node.js + Express |
| 🌐 Live Frontend | CloudplusAI custom domain |
| ☁️ Live Backend | Railway |

The active AI model is controlled through the backend `GROQ_MODEL` environment variable, allowing the model configuration to be changed without rewriting the frontend.

---

## 🌐 Live Application

**Production URL:**

### 👉 https://cloudplusai.dreamapexai.online

The current production deployment has been verified through the custom domain and returns the CloudplusAI application successfully.

### Production architecture

```text
👤 User
   │
   ▼
🌐 CloudplusAI
   │
   ▼
⚙️ Express API
   ├──────────────► 🗄️ MongoDB Atlas
   │
   └──────────────► 🤖 Groq API
                         │
                         ▼
                   GPT OSS 20B
```

> The architecture diagram focuses on the application/runtime flow. Infrastructure and DevOps workflows are documented separately below.

---

## 🎬 Digital System Flows

### 🖥️ Master Platform Architecture

<p align="center">
  <img src="docs/images/platform-ui.svg" alt="CloudplusAI platform architecture" width="100%">
</p>

### 🔁 User → Application Flow

<p align="center">
  <img src="docs/images/user-application-flow.svg" alt="CloudplusAI user application flow" width="100%">
</p>

### 🚀 DevOps Flow

<p align="center">
  <img src="docs/images/devops-flow.svg" alt="CloudplusAI DevOps flow" width="100%">
</p>

### 🔄 CI/CD Flow

<p align="center">
  <img src="docs/images/cicd-flow.svg" alt="CloudplusAI CI/CD flow" width="100%">
</p>

### 📊 Monitoring Flow

<p align="center">
  <img src="docs/images/monitoring-flow.svg" alt="CloudplusAI monitoring flow" width="100%">
</p>

---

## ✨ AI Application Features

| Feature | Description |
|---|---|
| 🔐 Authentication | Registration, login, JWT session protection and logout |
| 💬 AI Chat | Interactive AI conversations |
| 🗂️ Conversations | Create, search and persist conversations |
| 🧠 Memory | User conversation-memory functionality |
| 🔎 Chat Search | Search saved conversations |
| 🎙️ Voice Input | Browser speech-recognition integration |
| 🔊 Text-to-Speech | Browser speech synthesis |
| 🤖 Model Selection | AI model configuration interface |
| 🧪 API Playground | Test AI requests through the application |
| 🔑 API Keys | Developer API authentication and key management |
| 📚 API Docs | Developer-oriented API documentation |
| 📊 Analytics | Usage and activity information |
| 🔔 Notifications | Application notification interface |
| ⚙️ Settings | Application preferences and AI controls |

---

## 🔐 Authentication & API Flow

```text
User
 │
 ├── Register
 │      ↓
 │   Password Hash
 │      ↓
 │   MongoDB
 │
 └── Login
        ↓
      JWT
        ↓
   Protected API
        ↓
  CloudplusAI Services
```

The frontend sends authenticated requests using:

```http
Authorization: Bearer <TOKEN>
Content-Type: application/json
```

---

## 🔌 Developer API

Example protected request:

```http
POST /api/v1/chat
Authorization: Bearer <API_KEY>
Content-Type: application/json
```

Example payload:

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

Health endpoint:

```bash
curl http://localhost/api/v1/health
```

---

## 🛡️ API Security

CloudplusAI includes multiple application-level security controls:

- JWT authentication
- API-key authentication
- API-key revocation
- Request validation
- Per-key rate limiting
- HTTP 429 protection
- Environment-based secrets
- Kubernetes Secrets configuration
- IAM policy configuration
- Trivy security scanning
- SonarQube integration

### Request pipeline

```text
Client
  ↓
API Key / JWT Validation
  ↓
Rate Limit Check
  ↓
Request Validation
  ↓
Application API
  ↓
AI / Database
```

> Never commit real API keys, AWS credentials, MongoDB passwords or `.env` files.

---

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express |
| AI | Groq API, GPT OSS 20B |
| Database | MongoDB, Mongoose, MongoDB Atlas |
| Authentication | JWT, bcrypt |
| API | REST, API Keys |
| Source Control | Git, GitHub |
| CI/CD | GitHub Actions, Jenkins |
| Containers | Docker, Docker Compose |
| Cloud | AWS |
| IaC | Terraform |
| Kubernetes | Kubernetes, Amazon EKS, kubectl |
| GitOps | Flux CD |
| Packaging | Helm |
| Ingress | Nginx, Kubernetes Ingress |
| Security | Trivy, SonarQube, IAM |
| Monitoring | Prometheus, Grafana, CloudWatch |
| Runtime | Linux, Node.js |

---

## 🏗️ AWS / DevOps Architecture

<p align="center">
  <img src="docs/images/architecture-flow.svg" alt="CloudplusAI AWS DevOps architecture" width="100%">
</p>

The repository contains infrastructure definitions and deployment configuration for:

- AWS networking
- IAM
- EC2
- ECR
- S3
- RDS
- ALB
- Auto Scaling
- CloudWatch
- Amazon EKS
- Kubernetes
- Helm
- Flux CD
- Prometheus
- Grafana

> **Important:** infrastructure definitions stored in Git are not automatically proof that every AWS resource is currently running. Live application services are documented separately from infrastructure configuration.

---

## ☁️ Terraform

<p align="center">
  <img src="docs/images/terraform-flow.svg" alt="CloudplusAI Terraform flow" width="100%">
</p>

Terraform workflow:

```bash
cd terraform

terraform init
terraform fmt -check
terraform validate
terraform plan
```

After reviewing the plan:

```bash
terraform apply
```

---

## ☸️ Kubernetes & Helm

<p align="center">
  <img src="docs/images/observability-flow.svg" alt="CloudplusAI Kubernetes observability" width="100%">
</p>

Repository configuration includes:

- Backend Deployment and Service
- MongoDB deployment
- Namespace isolation
- Readiness/liveness probes
- CPU and memory requests/limits
- HPA foundation
- Nginx Ingress
- Prometheus configuration
- Grafana configuration
- ServiceMonitor
- Helm packaging

---

## 🐳 Docker

<p align="center">
  <img src="docs/images/docker-flow.svg" alt="CloudplusAI Docker flow" width="100%">
</p>

Local development:

```bash
docker compose up --build
```

The project uses Docker for reproducible application environments and provides Kubernetes/Helm configuration for a container-orchestration path.

---

## 📈 Observability

<p align="center">
  <img src="docs/images/monitoring-flow.svg" alt="CloudplusAI monitoring flow" width="100%">
</p>

Monitoring configuration includes:

- Prometheus
- Grafana
- CloudWatch
- Kubernetes metrics configuration
- ServiceMonitor configuration
- Application health endpoints

---

## 📁 Repository Structure

<!-- DYNAMIC_STRUCTURE:START -->
```text
CloudplusAI/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── deploy.yml
│       ├── devops.yml
│       └── dynamic-readme.yml
├── backend/
│   ├── .env.example
│   ├── api-v1.js
│   ├── Dockerfile
│   ├── features.js
│   ├── package.json
│   └── server.js
├── docs/
│   ├── images/
│   │   ├── architecture-flow.svg
│   │   ├── cicd-flow.svg
│   │   ├── devops-flow.svg
│   │   ├── docker-flow.svg
│   │   ├── monitoring-flow.svg
│   │   ├── observability-flow.svg
│   │   ├── platform-ui.svg
│   │   ├── README.md
│   │   ├── terraform-flow.svg
│   │   └── user-application-flow.svg
│   ├── architecture-flow.md
│   ├── DEPLOYMENT_CHECKLIST.md
│   ├── DEPLOYMENT_RUNBOOK.md
│   ├── MONGODB_ATLAS_SETUP.md
│   └── MONGODB_DEPLOYMENT.md
├── frontend/
│   ├── api-docs.html
│   ├── api-keys.html
│   ├── auth.html
│   ├── dashboard.html
│   ├── Dockerfile
│   ├── index.html
│   ├── nginx.conf
│   ├── nr-logo.png
│   └── settings.html
├── helm/
│   └── cloudplusai/
│       ├── templates/
│       │   ├── _helpers.tpl
│       │   └── backend.yaml
│       ├── Chart.yaml
│       └── values.yaml
├── infra/
│   └── terraform/
│       ├── main.tf
│       ├── providers.tf
│       └── variables.tf
├── kubernetes/
│   ├── autoscaling/
│   │   └── hpa.yaml
│   ├── monitoring/
│   │   ├── grafana-secret.yaml
│   │   ├── grafana.yaml
│   │   ├── prometheus-config.yaml
│   │   ├── prometheus.yaml
│   │   └── servicemonitor.yaml
│   ├── networking/
│   │   └── nginx-ingress.yaml
│   ├── backend.yaml
│   ├── mongodb.yaml
│   └── namespace.yaml
├── monitoring/
│   └── prometheus/
│       └── prometheus.yml
├── terraform/
│   ├── compute.tf
│   ├── eks.tf
│   ├── iam.tf
│   ├── main.tf
│   ├── network.tf
│   ├── outputs.tf
│   ├── README.md
│   ├── variables.tf
│   └── versions.tf
├── .gitignore
├── Cloudplus_AI_Complete_Project_Guide.md
├── docker-compose.yml
└── README.md
```
<!-- DYNAMIC_STRUCTURE:END -->

> The detailed repository tree is maintained automatically by the dynamic README workflow.

---

## ⚡ Dynamic Live Status

<!-- DYNAMIC_STATUS:START -->
| Service | Live Status |
|---|---|
| 🌐 Frontend | 🔴 Check failed |
| 🔄 CI | [![CI](https://img.shields.io/github/actions/workflow/status/nitindrathod4-alt/CloudplusAI/ci.yml?branch=main&style=flat-square)](https://github.com/nitindrathod4-alt/CloudplusAI/actions/workflows/ci.yml) |
| 🤖 AI Model | `openai/gpt-oss-20b` |
| 🕒 Last automatic check | 2026-09-20 20:20 UTC |
<!-- DYNAMIC_STATUS:END -->

---

## 🧪 Engineering Validation

| Layer | Technology / Control |
|---|---|
| Source | Git + GitHub |
| CI | GitHub Actions |
| Build | Docker |
| Code Quality | SonarQube |
| Security Scan | Trivy |
| Registry | Amazon ECR configuration |
| Infrastructure | Terraform |
| Orchestration | Kubernetes / EKS |
| GitOps | Flux CD |
| Packaging | Helm |
| Monitoring | Prometheus / Grafana |
| API Security | JWT + API Keys + Rate Limiting |
| Database | MongoDB Atlas |

---

## 💻 Local Development

### 1. Clone

```bash
git clone https://github.com/nitindrathod4-alt/CloudplusAI.git
cd CloudplusAI
```

### 2. Configure environment

Create the backend environment file using the example configuration:

```bash
cd backend
cp .env.example .env
```

Configure the required values for your local environment.

### 3. Run with Docker Compose

```bash
cd ..
docker compose up --build
```

> Do not use production credentials for local development.

---

## 🚀 Production Deployment

### Current live application

```text
🌐 Frontend
   ↓
CloudplusAI custom domain

🔧 Backend
   ↓
Railway

🗄️ Database
   ↓
MongoDB Atlas

🤖 AI
   ↓
Groq API → GPT OSS 20B
```

The laptop is only used as a development/deployment workstation; the live application services run in the configured cloud environments.

---

## 📌 Project Status

### Application

- 🟢 CloudplusAI web application
- 🟢 Custom domain
- 🟢 Authentication
- 🟢 AI chat
- 🟢 Conversation persistence
- 🟢 MongoDB Atlas
- 🟢 Groq GPT OSS 20B
- 🟢 API layer
- 🟢 API-key functionality
- 🟢 Rate limiting configuration

### DevOps

- 🟢 Git + GitHub
- 🟢 GitHub Actions
- 🟢 Docker
- 🟢 Docker Compose
- 🟢 Terraform configuration
- 🟢 Kubernetes configuration
- 🟢 Helm structure
- 🟢 Flux CD configuration
- 🟢 Prometheus / Grafana configuration
- 🟢 Trivy / SonarQube integration

### Infrastructure

- 🟡 AWS resources depend on the target AWS account and Terraform deployment
- 🟡 Kubernetes monitoring depends on deployment to a running cluster
- 🟡 Full AWS CI/CD deployment requires the required GitHub/AWS environment configuration

---

## 🎯 What This Project Demonstrates

CloudplusAI is designed to demonstrate practical engineering across several layers:

```text
Application Development
        ↓
REST API
        ↓
Authentication & Security
        ↓
AI Integration
        ↓
MongoDB Persistence
        ↓
Docker
        ↓
CI/CD
        ↓
Terraform
        ↓
Kubernetes / EKS
        ↓
GitOps
        ↓
Monitoring & Observability
```

This makes the repository suitable as a **DevOps / AWS Cloud Engineer portfolio project** while still demonstrating real application development.

---

## 👨‍💻 Author

**Nitin Rathod**  
**DevOps / AWS Cloud Engineer**

```text
AWS • Docker • Kubernetes • Terraform
Jenkins • GitHub Actions • Linux
MongoDB • Node.js • CI/CD
```

<p align="center">
  <strong>Built to learn. Built to deploy. Built with DevOps in mind. 🚀☁️</strong>
</p>
