# CloudplusAI — Click-to-Click Complete Deployment Runbook

> **Purpose:** This is the repository's single deployment document. Follow the sections from top to bottom. Commands are grouped by **where they must be run**. Replace every `<PLACEHOLDER>` before running a command.
>
> **Important:** Do not commit AWS credentials, API keys, database passwords, JWT secrets, `.env` files, kubeconfig files, or Terraform state containing secrets.

---

## 0. Deployment Flow

```text
Developer
  ↓
GitHub
  ↓
GitHub Actions
  ↓
CI: Install → Test → SonarQube → Docker → Trivy
  ↓
Amazon ECR
  ↓
Amazon EKS
  ↓
Helm
  ↓
Nginx / Ingress
  ↓
CloudplusAI Backend
  ├── MongoDB
  └── AI Provider
  ↓
Prometheus → Grafana
  ↓
CloudWatch
```

---

# 1. Where Everything Runs

| Step | Run location |
|---|---|
| Git commands | Local PC / Cloud Shell |
| Docker commands | Local PC / Linux host |
| Terraform | Local PC / Cloud Shell |
| AWS CLI | Local PC / Cloud Shell |
| kubectl | Local PC / Cloud Shell |
| Helm | Local PC / Cloud Shell |
| GitHub Actions | GitHub runner — automatic |
| Application | Docker / Kubernetes |
| AWS infrastructure | AWS |
| Monitoring | Kubernetes + AWS |

---

# 2. Clone Repository

### Run on Local PC / Cloud Shell

```bash
git clone https://github.com/nitindrathod4-alt/CloudplusAI.git
cd CloudplusAI
git branch
git status
```

Check the repository structure:

```bash
ls
ls terraform
ls kubernetes
ls helm/cloudplusai
ls .github/workflows
```

Windows PowerShell alternative:

```powershell
git clone https://github.com/nitindrathod4-alt/CloudplusAI.git
cd CloudplusAI
git status
Get-ChildItem
```

---

# 3. Check Required Tools

```bash
git --version
docker --version
node --version
npm --version
aws --version
terraform --version
kubectl version --client
helm version
```

If a command is missing, install that tool before continuing.

---

# 4. Configure AWS

### Run on Local PC / Cloud Shell

```bash
aws configure
```

Enter the credentials for the **intended AWS account** and region.

Recommended region example:

```text
ap-south-1
```

Verify identity:

```bash
aws sts get-caller-identity
aws configure get region
```

Verify the account before creating infrastructure.

---

# 5. Local Environment

### Run from repository root

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Open `.env` and configure only local/development values.

**Never commit `.env`.**

Check Git status:

```bash
git status
```

---

# 6. Local Application — Docker Compose

### Run from repository root

Build and start:

```bash
docker compose up --build -d
```

Check containers:

```bash
docker compose ps
```

Check logs:

```bash
docker compose logs --tail=100
```

Backend logs:

```bash
docker compose logs backend --tail=100
```

Frontend logs:

```bash
docker compose logs frontend --tail=100
```

MongoDB logs:

```bash
docker compose logs mongodb --tail=100
```

Stop local stack:

```bash
docker compose down
```

Stop and remove volumes only when you intentionally want to remove local data:

```bash
docker compose down -v
```

---

# 7. Local API Verification

Use the health endpoint exposed by the current application:

```bash
curl http://localhost/api/v1/health
```

If the backend is exposed directly on a different port, use the port defined by the current Docker/compose configuration.

Test an API-key protected endpoint using a test key:

```bash
curl -X POST http://localhost/api/v1/chat \
  -H "Authorization: Bearer <API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello CloudplusAI"}'
```

Verify:

- Registration/login
- JWT authentication
- AI chat
- API key creation/revocation
- Rate limiting
- Request validation
- MongoDB persistence

---

# 8. Terraform — Preflight

### Run from `terraform/`

```bash
cd terraform
terraform init
terraform fmt -check
terraform validate
terraform providers
```

Review variables:

```bash
terraform plan
```

**STOP and inspect the plan.** Confirm the AWS account, region, resource names and expected costs.

---

# 9. Terraform — Create AWS Infrastructure

### Run from `terraform/`

```bash
terraform apply
```

Type `yes` only after reviewing the plan.

After completion:

```bash
terraform output
terraform state list
```

Useful AWS verification:

```bash
aws ec2 describe-vpcs --filters "Name=tag:Name,Values=*CloudplusAI*"
aws ecr describe-repositories
aws eks list-clusters
aws s3api list-buckets
```

> If the exact Terraform resource names differ, use `terraform output` and the AWS console/CLI to verify the resources actually created.

---

# 10. ECR — Verify Registry

### Run on Local PC / Cloud Shell

```bash
aws ecr describe-repositories --region <AWS_REGION>
```

Login:

```bash
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=<AWS_REGION>
ECR_REGISTRY=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$ECR_REGISTRY"
```

---

# 11. Build Docker Images

### Run from repository root

Set a Git SHA tag:

```bash
GIT_SHA=$(git rev-parse --short HEAD)
```

Build backend:

```bash
docker build -t cloudplusai-backend:$GIT_SHA ./backend
```

Build frontend:

```bash
docker build -t cloudplusai-frontend:$GIT_SHA ./frontend
```

Check images:

```bash
docker images | grep cloudplusai
```

Local test if required:

```bash
docker run --rm cloudplusai-backend:$GIT_SHA
```

Use the application's actual required environment variables when running the backend locally.

---

# 12. Push Images to ECR

```bash
docker tag cloudplusai-backend:$GIT_SHA $ECR_REGISTRY/cloudplusai-backend:$GIT_SHA
docker tag cloudplusai-frontend:$GIT_SHA $ECR_REGISTRY/cloudplusai-frontend:$GIT_SHA

docker push $ECR_REGISTRY/cloudplusai-backend:$GIT_SHA
docker push $ECR_REGISTRY/cloudplusai-frontend:$GIT_SHA
```

Verify:

```bash
aws ecr list-images --repository-name cloudplusai-backend --region $AWS_REGION
aws ecr list-images --repository-name cloudplusai-frontend --region $AWS_REGION
```

---

# 13. Trivy Image Scan

### Run on Local PC / CI runner

```bash
trivy image --severity HIGH,CRITICAL cloudplusai-backend:$GIT_SHA
trivy image --severity HIGH,CRITICAL cloudplusai-frontend:$GIT_SHA
```

For a CI-style blocking scan:

```bash
trivy image --exit-code 1 --severity HIGH,CRITICAL cloudplusai-backend:$GIT_SHA
trivy image --exit-code 1 --severity HIGH,CRITICAL cloudplusai-frontend:$GIT_SHA
```

Fix vulnerabilities before production deployment where practical.

---

# 14. Configure kubectl for EKS

First identify the cluster:

```bash
aws eks list-clusters --region <AWS_REGION>
```

Configure kubeconfig:

```bash
aws eks update-kubeconfig \
  --region <AWS_REGION> \
  --name <EKS_CLUSTER_NAME>
```

Verify:

```bash
kubectl config current-context
kubectl cluster-info
kubectl get nodes
```

Expected node state:

```text
STATUS
Ready
```

---

# 15. Create Kubernetes Namespace

```bash
kubectl create namespace cloudplusai
```

If it already exists:

```bash
kubectl get namespace cloudplusai
```

---

# 16. Kubernetes Secrets

Use your approved secret-management method. For a basic deployment, create a Kubernetes Secret without committing it to Git:

```bash
kubectl -n cloudplusai create secret generic cloudplusai-secrets \
  --from-literal=MONGODB_URI='<MONGODB_URI>' \
  --from-literal=AI_API_KEY='<AI_API_KEY>' \
  --from-literal=JWT_SECRET='<JWT_SECRET>' \
  --dry-run=client -o yaml | kubectl apply -f -
```

Verify only metadata:

```bash
kubectl get secret cloudplusai-secrets -n cloudplusai
```

Never print secret contents into logs or commit them.

---

# 17. Apply Kubernetes Base Resources

Inspect the manifests first:

```bash
find kubernetes -maxdepth 3 -type f -print
```

Linux/macOS:

```bash
kubectl apply --dry-run=client -f kubernetes/
```

Then apply the manifests that belong to the current deployment:

```bash
kubectl apply -f kubernetes/ -n cloudplusai
```

If the repository uses Helm as the source of truth, prefer the Helm deployment in Section 18 instead of applying duplicate resources manually.

---

# 18. Helm — Validate Chart

### Run from repository root

```bash
helm lint ./helm/cloudplusai
```

Render manifests without applying:

```bash
helm template cloudplusai ./helm/cloudplusai \
  --namespace cloudplusai
```

Search rendered output for images:

```bash
helm template cloudplusai ./helm/cloudplusai \
  --namespace cloudplusai | grep -n "image:"
```

---

# 19. Helm — Deploy CloudplusAI

Use immutable image tags where supported by the chart:

```bash
helm upgrade --install cloudplusai ./helm/cloudplusai \
  --namespace cloudplusai \
  --create-namespace \
  --wait
```

If the chart exposes image repository/tag values, use the ECR image values expected by the chart, for example:

```bash
helm upgrade --install cloudplusai ./helm/cloudplusai \
  --namespace cloudplusai \
  --set backend.image.repository=$ECR_REGISTRY/cloudplusai-backend \
  --set backend.image.tag=$GIT_SHA \
  --set frontend.image.repository=$ECR_REGISTRY/cloudplusai-frontend \
  --set frontend.image.tag=$GIT_SHA \
  --wait
```

**Use only keys actually defined in the chart's `values.yaml`.** Check first:

```bash
cat helm/cloudplusai/values.yaml
```

---

# 20. Kubernetes Deployment Verification

```bash
kubectl get pods -n cloudplusai -o wide
kubectl get deployments -n cloudplusai
kubectl get replicasets -n cloudplusai
kubectl get svc -n cloudplusai
kubectl get ingress -n cloudplusai
kubectl get hpa -n cloudplusai
```

Watch pods:

```bash
kubectl get pods -n cloudplusai -w
```

Check rollout:

```bash
kubectl rollout status deployment/<BACKEND_DEPLOYMENT> -n cloudplusai
```

Describe an unhealthy pod:

```bash
kubectl describe pod <POD_NAME> -n cloudplusai
```

Logs:

```bash
kubectl logs <POD_NAME> -n cloudplusai --tail=200
```

Previous crashed container logs:

```bash
kubectl logs <POD_NAME> -n cloudplusai --previous
```

---

# 21. Kubernetes Health Checks

Verify probes in the deployment:

```bash
kubectl describe deployment <BACKEND_DEPLOYMENT> -n cloudplusai
```

Test the backend from inside the cluster when appropriate:

```bash
kubectl run curl-test -n cloudplusai --rm -it \
  --image=curlimages/curl --restart=Never -- \
  curl -i http://<BACKEND_SERVICE>:<PORT>/api/v1/health
```

Replace service and port with the actual current Service configuration.

---

# 22. Ingress / Load Balancer

Check:

```bash
kubectl get ingress -n cloudplusai
kubectl describe ingress -n cloudplusai
```

If using an AWS Load Balancer Controller, verify:

```bash
kubectl get deployment -A | grep aws-load-balancer
kubectl get pods -A | grep aws-load-balancer
```

Check the external address:

```bash
kubectl get ingress -n cloudplusai -w
```

Once DNS/TLS is configured, test:

```bash
curl -I https://<YOUR_DOMAIN>
```

---

# 23. HPA / Autoscaling

```bash
kubectl get hpa -n cloudplusai
kubectl describe hpa <HPA_NAME> -n cloudplusai
```

If metrics are unavailable:

```bash
kubectl get apiservice | grep metrics
kubectl top nodes
kubectl top pods -n cloudplusai
```

HPA requires a working metrics source and appropriate resource requests.

---

# 24. Prometheus Monitoring

Repository monitoring files are under `kubernetes/monitoring/`.

Check resources:

```bash
kubectl get configmap -n cloudplusai
kubectl get servicemonitor -n cloudplusai
```

If Prometheus Operator is installed:

```bash
kubectl get prometheus -A
kubectl get servicemonitor -A
```

Check Prometheus/Grafana pods:

```bash
kubectl get pods -A | grep -E 'prometheus|grafana'
```

Check services:

```bash
kubectl get svc -A | grep -E 'prometheus|grafana'
```

Verify that the backend `/metrics` endpoint exists before expecting Prometheus to scrape it.

---

# 25. Grafana

Find Grafana service:

```bash
kubectl get svc -A | grep grafana
```

For temporary local access:

```bash
kubectl port-forward svc/<GRAFANA_SERVICE> 3000:80 -n <GRAFANA_NAMESPACE>
```

Open:

```text
http://localhost:3000
```

Recommended dashboard panels:

- Request rate
- Request latency
- HTTP error rate
- CPU usage
- Memory usage
- Pod restarts
- Replica count
- HPA status
- Application health

---

# 26. CloudWatch

Verify AWS logging/monitoring resources configured for the target environment.

Basic CLI checks:

```bash
aws logs describe-log-groups --region <AWS_REGION>
aws cloudwatch list-metrics --namespace AWS/EC2 --region <AWS_REGION>
```

For EKS/container observability, deploy and configure the AWS-supported logging/metrics components appropriate to the target cluster.

---

# 27. GitHub Actions — CI

Workflow:

```text
.github/workflows/ci.yml
```

Open GitHub:

```text
Repository → Actions → CloudplusAI CI
```

For every failed run:

```text
Actions → Failed job → Failed step → Read first real error
```

Do not treat warnings such as Node deprecation messages as the root failure unless the job actually stops because of them.

---

# 28. GitHub Actions — Deployment

Workflow:

```text
.github/workflows/deploy.yml
```

Required repository/environment configuration depends on the current workflow. The intended values include:

```text
AWS_REGION
EKS_CLUSTER_NAME
EKS_DEPLOY_ENABLED=true
```

AWS credentials should be stored as GitHub Secrets or preferably supplied using GitHub OIDC with an IAM role.

Check:

```text
GitHub → Settings → Secrets and variables → Actions
```

Then:

```text
GitHub → Actions → CloudplusAI Deploy → Run workflow
```

After execution:

```text
build-and-scan → deploy → rollout/health verification
```

---

# 29. SonarQube

If SonarQube is configured in the CI pipeline:

```text
GitHub Actions → SonarQube analysis → Quality Gate
```

Verify:

- Bugs
- Vulnerabilities
- Code smells
- Coverage where configured
- Quality Gate result

A quality gate failure should stop promotion when production policy requires it.

---

# 30. Complete Production Smoke Test

Run after deployment:

```bash
kubectl get pods -n cloudplusai
kubectl get svc -n cloudplusai
kubectl get ingress -n cloudplusai
kubectl get hpa -n cloudplusai
```

Application checks:

```bash
curl -i https://<YOUR_DOMAIN>/api/v1/health
```

Then manually verify:

```text
1. Open CloudplusAI UI
2. Register/login
3. Open Dashboard
4. Open AI Chat
5. Send an AI request
6. Create an API key
7. Test Developer API
8. Confirm rate limiting behavior
9. Confirm analytics/usage
10. Confirm data persistence
11. Check Grafana
12. Check GitHub Actions
```

---

# 31. Rollback

Check releases:

```bash
helm history cloudplusai -n cloudplusai
```

Rollback:

```bash
helm rollback cloudplusai <REVISION> -n cloudplusai --wait
```

Verify:

```bash
kubectl rollout status deployment/<BACKEND_DEPLOYMENT> -n cloudplusai
kubectl get pods -n cloudplusai
```

If using image tags directly, restore the previous known-good image tag through Helm or the deployment configuration.

---

# 32. Troubleshooting — ImagePullBackOff

```bash
kubectl describe pod <POD_NAME> -n cloudplusai
```

Check:

```text
1. Image repository
2. Image tag
3. ECR repository exists
4. Node IAM permissions
5. ECR login/image push
6. Kubernetes imagePullSecrets if required
```

Verify ECR:

```bash
aws ecr describe-images \
  --repository-name cloudplusai-backend \
  --region <AWS_REGION>
```

---

# 33. Troubleshooting — CrashLoopBackOff

```bash
kubectl logs <POD_NAME> -n cloudplusai --previous
kubectl describe pod <POD_NAME> -n cloudplusai
```

Check:

```text
1. Environment variables
2. MongoDB connectivity
3. AI provider configuration
4. Application startup errors
5. Port configuration
6. Readiness/liveness probes
7. Resource limits
```

---

# 34. Troubleshooting — Pending Pod

```bash
kubectl describe pod <POD_NAME> -n cloudplusai
kubectl get nodes
kubectl describe nodes
```

Check:

```text
1. CPU/memory capacity
2. Resource requests
3. Node readiness
4. Taints/tolerations
5. Affinity rules
6. Subnet/IP capacity
```

---

# 35. Troubleshooting — Service Not Reachable

```bash
kubectl get svc -n cloudplusai
kubectl get endpoints -n cloudplusai
kubectl describe svc <SERVICE_NAME> -n cloudplusai
```

If endpoints are empty, check Service selectors and Pod labels.

---

# 36. Troubleshooting — Ingress Not Reachable

```bash
kubectl describe ingress -n cloudplusai
kubectl get ingress -n cloudplusai
```

Check:

```text
1. Ingress controller
2. Load balancer
3. DNS
4. TLS certificate
5. Security groups
6. Service port
7. Backend health
```

---

# 37. Troubleshooting — HPA Not Scaling

```bash
kubectl describe hpa <HPA_NAME> -n cloudplusai
kubectl top pods -n cloudplusai
kubectl top nodes
```

Check that metrics are available and the Deployment has CPU/memory requests.

---

# 38. Troubleshooting — Prometheus Target Down

```bash
kubectl get servicemonitor -n cloudplusai
kubectl get svc -n cloudplusai
kubectl get endpoints -n cloudplusai
```

Check:

```text
1. ServiceMonitor selector labels
2. Service port name
3. /metrics endpoint
4. Prometheus Operator configuration
5. Network policies
```

---

# 39. Troubleshooting — Terraform

Run:

```bash
terraform fmt -check
terraform validate
terraform plan
```

Inspect:

```bash
terraform state list
terraform output
```

Never delete Terraform state blindly. If state is remote, follow the project's configured backend/locking process.

---

# 40. Safe Cleanup

Destroy only when intentionally removing the environment:

```bash
terraform plan -destroy
terraform destroy
```

For Kubernetes:

```bash
helm uninstall cloudplusai -n cloudplusai
```

Do not delete production infrastructure or persistent data without an approved backup/recovery plan.

---

# 41. Final Deployment Checklist

```text
[ ] Repository cloned
[ ] Tools installed
[ ] AWS identity verified
[ ] Local .env configured safely
[ ] Docker Compose tested
[ ] API health verified
[ ] Terraform init complete
[ ] Terraform validate passed
[ ] Terraform plan reviewed
[ ] AWS infrastructure created
[ ] ECR verified
[ ] Docker images built
[ ] Trivy scan passed
[ ] Images pushed to ECR
[ ] EKS kubeconfig configured
[ ] EKS nodes Ready
[ ] Kubernetes namespace ready
[ ] Secrets configured securely
[ ] Helm lint passed
[ ] Helm template reviewed
[ ] Helm release deployed
[ ] Pods Ready
[ ] Services have endpoints
[ ] Ingress/load balancer reachable
[ ] HPA verified
[ ] Prometheus scraping verified
[ ] Grafana verified
[ ] CloudWatch verified
[ ] CI passed
[ ] CD passed
[ ] Application smoke test passed
[ ] Rollback procedure confirmed
[ ] README/image documentation updated
```

---

# 42. Final Rule

**Green GitHub commit ≠ live deployment.**

The deployment is complete only after the target AWS and Kubernetes environment has been actually deployed and the verification checklist above has been checked.

```text
CODE
 ↓
CI
 ↓
SECURITY
 ↓
IMAGE
 ↓
REGISTRY
 ↓
INFRASTRUCTURE
 ↓
KUBERNETES
 ↓
HELM
 ↓
INGRESS
 ↓
APPLICATION
 ↓
MONITORING
 ↓
VERIFICATION
 ↓
ROLLBACK READY
```

**CloudplusAI — Built to learn. Built to deploy. Built with DevOps in mind. 🚀**
