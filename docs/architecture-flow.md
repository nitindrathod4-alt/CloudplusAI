# CloudplusAI — Digital Architecture & Runtime Flow

## 🖥️ Digital Platform UI

```text
┌──────────────────────────────────────────────────────────────────────┐
│                         CLOUDPLUSAi                                  │
├──────────────┬───────────────────────────────────────────────────────┤
│ Dashboard    │  Overview                                             │
│ AI Chat      │  ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│ API Keys     │  │ Requests │ │ API Usage│ │ Errors   │             │
│ Analytics    │  └──────────┘ └──────────┘ └──────────┘             │
│ Playground   │                                                       │
│ Settings     │  Recent Activity                                      │
│ Docs         │  ───────────────────────────────────────────────      │
│              │  API requests • AI chats • deployments • alerts      │
└──────────────┴───────────────────────────────────────────────────────┘
```

## 👤 User Runtime Flow

```text
User
  │
  ▼
CloudplusAI UI
  │
  ├── Login / Register
  ├── Dashboard
  ├── AI Chat
  ├── API Keys
  ├── Analytics
  └── Settings
          │
          ▼
      Backend API
          │
    ┌─────┼──────────────┐
    ▼     ▼              ▼
  Auth  Validation   Rate Limit
          │              │
          └──────┬───────┘
                 ▼
             AI Service
                 │
        ┌────────┴────────┐
        ▼                 ▼
     MongoDB         AI Provider
```

## 🚀 DevOps Runtime Flow

```text
Developer
   │
   ▼
GitHub Repository
   │
   ▼
GitHub Actions
   │
   ├── Install / Test
   ├── SonarQube
   ├── Docker Build
   └── Trivy Scan
          │
          ▼
      Amazon ECR
          │
          ▼
     Amazon EKS
          │
          ▼
        Helm
          │
          ▼
   ┌──────┴─────────┐
   ▼                ▼
Nginx/Ingress   Kubernetes Services
   │                │
   └───────┬────────┘
           ▼
      CloudplusAI
```

## 📊 Monitoring Flow

```text
CloudplusAI Pods
      │
      ▼
 /metrics endpoint
      │
      ▼
 Prometheus
      │
      ▼
 Grafana Dashboards
      │
      ├── CPU
      ├── Memory
      ├── Requests
      ├── Errors
      └── Service Health

AWS Infrastructure
      │
      ▼
   CloudWatch
      │
      └── Logs / operational metrics
```

## 🏗️ AWS Infrastructure Flow

```text
AWS
└── VPC
    ├── Public Subnet A
    │   └── EC2 Application Host
    ├── Public Subnet B
    ├── Internet Gateway
    ├── ECR
    ├── S3 Artifacts
    └── EKS
        └── Managed Node Group
            └── CloudplusAI Pods
```

## 🔁 Complete End-to-End Flow

```text
                    ┌──────────────┐
                    │     User     │
                    └──────┬───────┘
                           ▼
                    ┌──────────────┐
                    │ CloudplusAI  │
                    │     UI       │
                    └──────┬───────┘
                           ▼
                    ┌──────────────┐
                    │ Nginx / LB   │
                    └──────┬───────┘
                           ▼
                    ┌──────────────┐
                    │ Backend API  │
                    └───┬────┬─────┘
                        │    │
              ┌─────────┘    └─────────┐
              ▼                        ▼
         ┌──────────┐             ┌──────────┐
         │ MongoDB  │             │AI Service│
         └──────────┘             └──────────┘

Developer ──► GitHub ──► Actions ──► Trivy/Sonar ──► ECR ──► EKS ──► Helm
                                                        │
                                                        ▼
                                              Prometheus ──► Grafana
                                                        │
AWS infrastructure ─────────────────────────────────► CloudWatch
```

> These diagrams describe the intended repository/runtime architecture. A component is considered live only after it has been deployed and verified in the target environment.
