# CloudplusAI — MongoDB Complete Connection Guide

This document covers the two supported patterns: **MongoDB Atlas (recommended for a cloud deployment)** and **local MongoDB (development only)**.

## 1. MongoDB Atlas — Recommended

### Step 1 — Create an Atlas account/project

1. Open MongoDB Atlas.
2. Create or select a project.
3. Create a database deployment.
4. Choose a region close to the AWS/EKS region where practical.
5. Create the deployment.

### Step 2 — Create a database user

Atlas → **Security / Database Access** → Add Database User.

Create a dedicated application user. Do not use the Atlas account password as an application secret.

Example:

```text
Username: cloudplusai-app
Password: <STRONG_PASSWORD>
```

Store the password in a secret manager/password manager.

### Step 3 — Configure Network Access

Atlas → **Security / Network Access** → Add IP Address.

For development, allow only your current public IP when possible.

For production, prefer a private networking design such as VPC peering or PrivateLink where supported by the selected Atlas plan/architecture. Avoid permanently allowing `0.0.0.0/0` unless there is a deliberate, documented reason and compensating controls.

### Step 4 — Get the connection string

Atlas → Database → **Connect** → Drivers.

Select the appropriate driver for the Node.js/Mongoose backend and copy the SRV URI.

Typical format:

```text
mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER_HOST>/<DATABASE>?retryWrites=true&w=majority
```

Replace the placeholders and URL-encode special characters in credentials when required.

Example database name:

```text
cloudplusai
```

### Step 5 — Test from the deployment machine

Use the project's actual MongoDB URI in a protected shell/environment variable.

```bash
export MONGODB_URI='mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER_HOST>/cloudplusai?retryWrites=true&w=majority'
```

Do not echo the variable or paste it into GitHub issues/logs.

If `mongosh` is installed:

```bash
mongosh "$MONGODB_URI"
```

Inside `mongosh`:

```javascript
db.runCommand({ ping: 1 })
show dbs
```

Expected ping result includes:

```text
ok: 1
```

Exit:

```javascript
exit
```

### Step 6 — Connect the backend locally

From the repository root, configure `.env` using the variable name expected by the current backend.

```env
MONGODB_URI=mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER_HOST>/cloudplusai?retryWrites=true&w=majority
```

Then start the backend using the project's current command, for example:

```bash
cd backend
npm install
npm start
```

Watch for a successful MongoDB connection in the application logs.

### Step 7 — Connect MongoDB to Docker Compose

If the current `docker-compose.yml` passes environment variables into the backend, keep the URI in `.env` and reference it from Compose rather than hard-coding it.

Example pattern:

```yaml
environment:
  MONGODB_URI: ${MONGODB_URI}
```

Then:

```bash
docker compose up --build -d
docker compose logs backend --tail=100
```

### Step 8 — Connect MongoDB to Kubernetes

Create the Kubernetes Secret without committing the URI:

```bash
kubectl create namespace cloudplusai --dry-run=client -o yaml | kubectl apply -f -

kubectl -n cloudplusai create secret generic cloudplusai-secrets \
  --from-literal=MONGODB_URI="$MONGODB_URI" \
  --dry-run=client -o yaml | kubectl apply -f -
```

Verify only the Secret metadata:

```bash
kubectl get secret cloudplusai-secrets -n cloudplusai
```

The backend Deployment must consume the secret using the environment-variable name expected by the application. Check the rendered Helm manifest before deployment:

```bash
helm template cloudplusai ./helm/cloudplusai \
  --namespace cloudplusai
```

Then deploy:

```bash
helm upgrade --install cloudplusai ./helm/cloudplusai \
  --namespace cloudplusai --create-namespace --wait
```

### Step 9 — Verify the Kubernetes application can reach MongoDB

```bash
kubectl get pods -n cloudplusai
kubectl logs deployment/<BACKEND_DEPLOYMENT> -n cloudplusai --tail=200
```

If the application has a health endpoint:

```bash
kubectl port-forward deployment/<BACKEND_DEPLOYMENT> 8080:<BACKEND_PORT> -n cloudplusai
```

Then, in another terminal:

```bash
curl -i http://localhost:8080/api/v1/health
```

Use the endpoint and port actually implemented by the project.

### Step 10 — MongoDB Atlas production checklist

```text
[ ] Dedicated application DB user created
[ ] Strong password stored securely
[ ] Network access restricted
[ ] Production private networking evaluated
[ ] Connection string stored as a secret
[ ] .env excluded from Git
[ ] Kubernetes Secret configured
[ ] Backend receives MONGODB_URI
[ ] Backend logs show successful DB connection
[ ] Health/API smoke test passed
[ ] Backups/Atlas backup policy reviewed
[ ] Database indexes and connection limits reviewed
```

---

## 2. Local MongoDB — Development

Use local MongoDB only when the project is intentionally configured for local development.

### Option A — Docker MongoDB

```bash
docker volume create cloudplusai-mongo-data

docker run -d \
  --name cloudplusai-mongodb \
  -p 27017:27017 \
  -v cloudplusai-mongo-data:/data/db \
  mongo:8
```

Check:

```bash
docker ps
```

Local URI:

```env
MONGODB_URI=mongodb://localhost:27017/cloudplusai
```

Stop/start:

```bash
docker stop cloudplusai-mongodb
docker start cloudplusai-mongodb
```

Remove the container while retaining its named volume:

```bash
docker rm cloudplusai-mongodb
```

Remove the data volume only when intentionally deleting local database data:

```bash
docker volume rm cloudplusai-mongo-data
```

### Option B — MongoDB installed directly

Install MongoDB Community Edition using the official MongoDB installation instructions for your operating system. Then verify:

```bash
mongosh
```

Test:

```javascript
db.runCommand({ ping: 1 })
```

Configure:

```env
MONGODB_URI=mongodb://localhost:27017/cloudplusai
```

---

## 3. MongoDB Connection Troubleshooting

### Authentication failed

Check the Atlas database username/password and ensure special characters in the password are URL-encoded.

### Server selection timeout

Check Atlas Network Access, DNS, outbound connectivity and private-network configuration.

### `ECONNREFUSED 127.0.0.1:27017`

The backend is trying to use local MongoDB. Either start local MongoDB or replace the URI with the intended Atlas URI.

### Kubernetes works but MongoDB does not

Check the Secret exists, the Deployment references the correct Secret key, and the Pod can reach the database host.

```bash
kubectl describe deployment <BACKEND_DEPLOYMENT> -n cloudplusai
kubectl logs deployment/<BACKEND_DEPLOYMENT> -n cloudplusai --tail=200
```

### Never do this

Do not commit:

```text
mongodb+srv://username:password@...
```

Do not place real credentials in:

```text
README.md
GitHub Actions logs
Dockerfiles
Helm values committed to Git
Kubernetes YAML committed to Git
```

---

## 4. Connection Flow

```text
MongoDB Atlas
     │
     │ MONGODB_URI
     ▼
Secret Manager / Kubernetes Secret
     │
     ▼
CloudplusAI Backend Pod
     │
     ▼
Mongoose / MongoDB Driver
     │
     ▼
MongoDB Atlas Cluster
```

For local development:

```text
CloudplusAI Backend
       │
       ▼
localhost:27017
       │
       ▼
Local MongoDB Container
```
