# CloudplusAI — MongoDB Atlas Click-to-Click Setup

This document covers the complete MongoDB Atlas flow for CloudplusAI: Atlas account → project → cluster → database user → Network Access → connection URI → local `.env` → Docker → Kubernetes/EKS Secret → verification → troubleshooting.

> **Security:** Never commit the real MongoDB URI, username/password, `.env`, Kubernetes Secret YAML, or screenshots containing credentials.

---

## 1. MongoDB Atlas Account

1. Open the official MongoDB Atlas website.
2. Sign in or create an account.
3. Create/select an organization.
4. Create a project named:

```text
CloudplusAI
```

---

## 2. Create MongoDB Cluster

Atlas:

```text
Project
  ↓
Database
  ↓
Build a Database
```

For learning/development, select an available free/shared tier if appropriate.

For production, choose the appropriate production tier, region, backups and security settings.

Recommended placement: choose an AWS region close to the application workload where practical.

Example:

```text
AWS / Mumbai
```

Wait until the cluster status becomes available.

---

## 3. Create Database User

Atlas:

```text
Security
  ↓
Database Access
  ↓
Add New Database User
```

Create:

```text
Username: <MONGODB_USERNAME>
Password: <STRONG_PASSWORD>
```

Use the minimum database privileges required by the application.

Save the password securely.

**Do not put it in GitHub.**

---

## 4. Configure Network Access

Atlas:

```text
Security
  ↓
Network Access
  ↓
Add IP Address
```

For development, add the IP address that needs database access.

For production, allow only the application's stable egress/network path where possible.

Avoid permanently using:

```text
0.0.0.0/0
```

unless you intentionally accept the security implications and have compensating controls.

Wait until the rule is active.

---

## 5. Get MongoDB Connection String

Atlas:

```text
Database
  ↓
Connect
  ↓
Drivers
  ↓
Node.js
  ↓
Copy connection string
```

The URI normally looks like:

```text
mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER>.mongodb.net/<DATABASE>?retryWrites=true&w=majority
```

Example structure:

```text
mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/cloudplusai?retryWrites=true&w=majority
```

Replace the placeholders with the Atlas user and database name.

If the password contains reserved URL characters, URL-encode the password before placing it in the URI.

---

## 6. Connect CloudplusAI Locally

From the repository root:

```bash
cp .env.example .env
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Open `.env` and use the exact variable name expected by the backend. Typical example:

```env
MONGODB_URI=mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER>.mongodb.net/cloudplusai?retryWrites=true&w=majority
```

Do not commit `.env`.

Check:

```bash
git status
```

If `.env` appears as an untracked file, stop and fix `.gitignore` before committing.

---

## 7. Test Backend → Atlas Connection

```bash
cd backend
npm install
```

Start using the command defined by the project, for example:

```bash
npm start
```

or:

```bash
npm run dev
```

Watch the logs:

```text
MongoDB connection successful
```

The exact success message depends on the backend implementation.

If the application exposes a health endpoint, test it using the actual project route, for example:

```bash
curl http://localhost:<BACKEND_PORT>/api/v1/health
```

---

## 8. Docker → MongoDB Atlas

Return to repository root:

```bash
cd ..
```

Start the application:

```bash
docker compose up --build -d
```

Check:

```bash
docker compose ps
docker compose logs backend --tail=200
```

The backend container must receive `MONGODB_URI` through the Docker Compose environment configuration.

Stop:

```bash
docker compose down
```

**Important:** There is no need to run a local MongoDB container when the application is configured to use Atlas.

---

## 9. EKS → MongoDB Atlas

After the EKS cluster is ready:

```bash
aws eks update-kubeconfig \
  --region <AWS_REGION> \
  --name <EKS_CLUSTER_NAME>

kubectl get nodes
```

Create the namespace if needed:

```bash
kubectl create namespace cloudplusai
```

Create a Kubernetes Secret from the Atlas URI:

```bash
kubectl -n cloudplusai create secret generic cloudplusai-secrets \
  --from-literal=MONGODB_URI='<MONGODB_ATLAS_URI>' \
  --dry-run=client -o yaml | kubectl apply -f -
```

Verify only metadata:

```bash
kubectl get secret cloudplusai-secrets -n cloudplusai
```

Never use `kubectl get secret ... -o yaml` in a screenshot/documentation if it would expose encoded secret material.

---

## 10. Backend Deployment Must Read the Secret

The backend Deployment should reference the Secret using the environment variable expected by the application:

```yaml
env:
  - name: MONGODB_URI
    valueFrom:
      secretKeyRef:
        name: cloudplusai-secrets
        key: MONGODB_URI
```

Verify the Deployment configuration without exposing the secret value:

```bash
kubectl describe deployment <BACKEND_DEPLOYMENT> -n cloudplusai
```

Then inspect logs:

```bash
kubectl logs deployment/<BACKEND_DEPLOYMENT> -n cloudplusai --tail=200
```

---

## 11. MongoDB Atlas Production Network Flow

```text
CloudplusAI Backend Pod
        ↓
Kubernetes Secret
        ↓
MONGODB_URI
        ↓
Internet / AWS egress
        ↓
MongoDB Atlas Network Access
        ↓
MongoDB Atlas Cluster
        ↓
cloudplusai database
```

The Kubernetes cluster does **not** need a MongoDB Pod when Atlas is being used.

---

## 12. MongoDB Verification

Verify:

```text
[ ] Atlas project created
[ ] Cluster available
[ ] Database user created
[ ] Password stored securely
[ ] Network Access configured
[ ] Connection URI copied
[ ] Local .env configured
[ ] Local backend connects
[ ] Docker backend connects
[ ] Kubernetes Secret created
[ ] EKS backend reads Secret
[ ] Application health passes
[ ] Application data is persisted in Atlas
```

To confirm persistence, create a test record through the application and verify it from the Atlas UI's data browser.

---

## 13. Troubleshooting — Authentication Failed

Check:

```text
Atlas → Security → Database Access
```

Verify:

- Username is correct.
- Password is correct.
- Password special characters are URL-encoded.
- The database user has the required permissions.

Do not print the complete URI into logs.

---

## 14. Troubleshooting — Connection Timeout

Check:

```text
Atlas → Security → Network Access
```

Verify that the client/application's outbound IP/network is allowed.

For an AWS workload, identify the actual egress path before creating a restrictive production allowlist.

---

## 15. Troubleshooting — Kubernetes Cannot Connect

Run:

```bash
kubectl get secret cloudplusai-secrets -n cloudplusai
kubectl describe deployment <BACKEND_DEPLOYMENT> -n cloudplusai
kubectl logs deployment/<BACKEND_DEPLOYMENT> -n cloudplusai --tail=200
```

Check:

```text
1. Secret name
2. Secret key: MONGODB_URI
3. Deployment env reference
4. Atlas Network Access
5. Atlas database user
6. URI formatting
7. Pod internet/egress access
```

---

## 16. Final MongoDB Rule

```text
MongoDB Atlas
     ↓
Secure URI
     ↓
Local .env (never commit)
     ↓
Docker environment
     ↓
Kubernetes Secret (never commit)
     ↓
Backend Pod
     ↓
CloudplusAI
```

**Never hard-code the Atlas URI in application source code, Dockerfile, Helm values committed to Git, README, screenshots or GitHub Actions logs.**
