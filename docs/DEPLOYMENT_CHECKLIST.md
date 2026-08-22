# CloudplusAI — Final Deployment Verification Checklist

This file is the final go/no-go checklist after the deployment documentation is complete.

> **Important:** A green GitHub commit or CI run does not prove that AWS/EKS is live. Tick an item only after the corresponding command/result is verified in the target environment.

## 1. Prerequisites

```bash
git --version
docker --version
node --version
npm --version
aws --version
terraform --version
kubectl version --client
helm version
trivy --version
```

- [ ] All required tools are installed.
- [ ] Correct AWS account is selected.

```bash
aws sts get-caller-identity
aws configure get region
```

## 2. MongoDB Atlas

- [ ] Atlas account/project exists.
- [ ] Cluster is running.
- [ ] Database user exists.
- [ ] Network Access allows the application's required outbound IP/network.
- [ ] Connection URI is configured securely.
- [ ] `.env` is not committed.

Local backend test:

```bash
cd backend
npm install
npm start
```

- [ ] Backend connects to Atlas without authentication/network errors.
- [ ] Application can create/read required data.

## 3. Local Docker

From repository root:

```bash
docker compose up --build -d
docker compose ps
docker compose logs backend --tail=200
```

- [ ] Frontend container healthy.
- [ ] Backend container healthy.
- [ ] Atlas connection works from the backend container.
- [ ] Health endpoint works.

```bash
curl http://localhost/api/v1/health
```

## 4. Terraform / AWS

From `terraform/`:

```bash
terraform init
terraform fmt -check
terraform validate
terraform plan
```

- [ ] Plan reviewed.
- [ ] Correct AWS region/account confirmed.
- [ ] Required AWS infrastructure exists.

Apply only when intentionally deploying:

```bash
terraform apply
```

Verify:

```bash
terraform output
aws eks list-clusters --region <AWS_REGION>
aws ecr describe-repositories --region <AWS_REGION>
```

## 5. Docker + ECR

```bash
GIT_SHA=$(git rev-parse --short HEAD)
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=<AWS_REGION>
ECR_REGISTRY=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$ECR_REGISTRY"

docker build -t cloudplusai-backend:$GIT_SHA ./backend
docker build -t cloudplusai-frontend:$GIT_SHA ./frontend
```

- [ ] Images build successfully.

Security scan:

```bash
trivy image --severity HIGH,CRITICAL cloudplusai-backend:$GIT_SHA
trivy image --severity HIGH,CRITICAL cloudplusai-frontend:$GIT_SHA
```

- [ ] Trivy result reviewed.

Push:

```bash
docker tag cloudplusai-backend:$GIT_SHA $ECR_REGISTRY/cloudplusai-backend:$GIT_SHA
docker tag cloudplusai-frontend:$GIT_SHA $ECR_REGISTRY/cloudplusai-frontend:$GIT_SHA

docker push $ECR_REGISTRY/cloudplusai-backend:$GIT_SHA
docker push $ECR_REGISTRY/cloudplusai-frontend:$GIT_SHA
```

- [ ] Both images exist in ECR.

## 6. EKS

```bash
aws eks update-kubeconfig --region <AWS_REGION> --name <EKS_CLUSTER_NAME>
kubectl config current-context
kubectl cluster-info
kubectl get nodes
```

- [ ] Correct EKS context selected.
- [ ] All required nodes are `Ready`.

## 7. Kubernetes + MongoDB Atlas Secret

```bash
kubectl create namespace cloudplusai
```

Create the secret without committing it:

```bash
kubectl -n cloudplusai create secret generic cloudplusai-secrets \
  --from-literal=MONGODB_URI='<MONGODB_ATLAS_URI>' \
  --from-literal=AI_API_KEY='<AI_API_KEY>' \
  --from-literal=JWT_SECRET='<JWT_SECRET>' \
  --dry-run=client -o yaml | kubectl apply -f -
```

Verify only metadata:

```bash
kubectl get secret cloudplusai-secrets -n cloudplusai
```

- [ ] Secret exists.
- [ ] Backend Deployment references `MONGODB_URI` from the Secret.

## 8. Helm Deployment

```bash
helm lint ./helm/cloudplusai
helm template cloudplusai ./helm/cloudplusai --namespace cloudplusai
helm upgrade --install cloudplusai ./helm/cloudplusai \
  --namespace cloudplusai \
  --create-namespace \
  --wait
```

Verify:

```bash
helm status cloudplusai -n cloudplusai
kubectl get pods -n cloudplusai
kubectl get deployments -n cloudplusai
kubectl get svc -n cloudplusai
kubectl get ingress -n cloudplusai
```

- [ ] Helm release deployed.
- [ ] Backend Pods are Ready.
- [ ] Frontend Pods are Ready.
- [ ] Services have endpoints.

## 9. Application Smoke Test

```bash
curl -i https://<YOUR_DOMAIN>/api/v1/health
```

Manually verify:

- [ ] Website opens.
- [ ] Registration works.
- [ ] Login works.
- [ ] AI chat works.
- [ ] API key creation works.
- [ ] Developer API works.
- [ ] Rate limiting works.
- [ ] Request validation works.
- [ ] MongoDB Atlas persistence works.
- [ ] Usage/analytics works.

## 10. Ingress / Load Balancer

```bash
kubectl get ingress -n cloudplusai
kubectl describe ingress -n cloudplusai
```

- [ ] External address exists.
- [ ] DNS points to the correct endpoint.
- [ ] TLS/HTTPS works.
- [ ] Backend health is reachable through ingress.

## 11. HPA

```bash
kubectl get hpa -n cloudplusai
kubectl describe hpa <HPA_NAME> -n cloudplusai
kubectl top nodes
kubectl top pods -n cloudplusai
```

- [ ] Metrics are available.
- [ ] HPA has valid targets.
- [ ] Resource requests are configured.

## 12. Monitoring

```bash
kubectl get servicemonitor -n cloudplusai
kubectl get pods -A | grep -E 'prometheus|grafana'
kubectl get svc -A | grep -E 'prometheus|grafana'
```

- [ ] Prometheus is running.
- [ ] Backend target is being scraped.
- [ ] Grafana is running.
- [ ] Dashboard displays application/infrastructure metrics.
- [ ] CloudWatch logging/metrics are available as configured.

## 13. CI/CD

GitHub:

```text
Actions → CI workflow → latest run
Actions → Deploy workflow → latest run
```

- [ ] CI is green.
- [ ] Tests pass.
- [ ] SonarQube quality gate passes where configured.
- [ ] Trivy security stage passes according to project policy.
- [ ] ECR push succeeds.
- [ ] EKS/Helm deployment succeeds.
- [ ] Rollout/health check succeeds.

Prefer GitHub OIDC/short-lived AWS credentials for production.

## 14. Rollback Readiness

```bash
helm history cloudplusai -n cloudplusai
```

- [ ] Previous known-good release exists.

Test rollback only when approved:

```bash
helm rollback cloudplusai <REVISION> -n cloudplusai --wait
kubectl get pods -n cloudplusai
```

- [ ] Previous version can be restored.

## 15. Security Final Check

- [ ] No AWS credentials in repository.
- [ ] No MongoDB password in repository.
- [ ] No AI API key in repository.
- [ ] No JWT secret in repository.
- [ ] `.env` is ignored.
- [ ] Kubernetes secrets are not committed.
- [ ] ECR image scanning is enabled where configured.
- [ ] Trivy scanning is enabled.
- [ ] IAM follows least privilege as practical.
- [ ] MongoDB Atlas Network Access is not unnecessarily open.
- [ ] HTTPS/TLS is enabled for production.

## 16. Troubleshooting Commands

### CrashLoopBackOff

```bash
kubectl logs <POD_NAME> -n cloudplusai --previous
kubectl describe pod <POD_NAME> -n cloudplusai
```

### ImagePullBackOff

```bash
kubectl describe pod <POD_NAME> -n cloudplusai
aws ecr describe-images --repository-name cloudplusai-backend --region <AWS_REGION>
```

### Service has no endpoints

```bash
kubectl get svc -n cloudplusai
kubectl get endpoints -n cloudplusai
kubectl describe svc <SERVICE_NAME> -n cloudplusai
```

### MongoDB Atlas failure

Check Atlas:

```text
Database Access
Network Access
Cluster status
Connection string
```

Then check application logs without printing secrets:

```bash
kubectl logs deployment/<BACKEND_DEPLOYMENT> -n cloudplusai --tail=200
```

## 17. Final Go/No-Go

Deployment is **GO** only when all critical boxes are checked:

```text
[ ] AWS verified
[ ] Terraform verified
[ ] ECR verified
[ ] EKS nodes Ready
[ ] MongoDB Atlas connected
[ ] Kubernetes Secrets configured
[ ] Helm release Ready
[ ] Ingress reachable
[ ] Application smoke test passed
[ ] CI/CD passed
[ ] Security checks passed
[ ] Monitoring passed
[ ] Rollback available
```

**CloudplusAI deployment is complete only after live verification, not merely after committing the configuration.**
