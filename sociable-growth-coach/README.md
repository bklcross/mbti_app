# Sociable Growth Coach

Sociable Growth Coach is a minimal CSCA 5028 web app. The React frontend accepts a short reflection, sends it to a Node.js and Express API, and displays the echoed response.

## Project Structure

```text
client/     React Vite frontend
server/     Node.js and Express backend
README.md
.gitignore
```

The app has no database, login, Ollama integration, or MBTI scoring yet.

## App Behavior

- Title: `Sociable Growth Coach`
- Subtitle: `A personality-based personal growth reflection app.`
- Textarea label: `How are you feeling today?`
- Submit button: `Submit Reflection`
- Empty input message: `Please enter a reflection.`
- Success message: `Reflection received: <user input>`

## API Endpoints

Health check:

```http
GET /health
```

Response:

```json
{
  "status": "ok"
}
```

Echo reflection:

```http
POST /api/echo
Content-Type: application/json
```

Request body:

```json
{
  "reflection": "I feel stressed about school."
}
```

Response:

```json
{
  "message": "Reflection received",
  "echo": "I feel stressed about school."
}
```

## Run Locally

Install dependencies:

```bash
npm install
npm install --prefix client
```

Start the backend and frontend:

```bash
npm run dev
```

Local URLs:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:3001
```

For local development, the Vite dev server proxies `/api` and `/health` to the local Express server.

## AWS Deployment Overview

Use this AWS architecture:

```text
React Vite build -> S3 bucket -> CloudFront public URL
Express API      -> EC2 Ubuntu public URL
```

The final public UI URL to submit to Coursera is the CloudFront distribution URL.

On this machine, use AWS CLI profile `blee` for account `129405039505`. The `default` profile points to a different AWS account.

## GitHub Actions Auto Deploy

This repo includes a push-triggered workflow at:

```text
.github/workflows/deploy-sociable-growth-coach.yml
```

On pushes to `main`, it:

1. Installs backend and frontend dependencies.
2. Builds the Vite frontend with `VITE_API_BASE_URL`.
3. Syncs `client/dist` to S3.
4. Invalidates CloudFront.
5. Packages `server/` and uploads it to the backend deployment S3 bucket.
6. Uses AWS Systems Manager to update and restart the EC2 backend.

No GitHub repository secrets are required for the current workflow. It uses GitHub Actions OIDC to assume this AWS role:

```text
arn:aws:iam::129405039505:role/sociable-growth-coach-github-actions
```

Current deploy values:

```text
AWS_REGION=us-west-1
FRONTEND_BUCKET=sociable-growth-coach-frontend-129405039505-us-west-1
BACKEND_BUCKET=sociable-growth-coach-deploy-129405039505-us-west-1
CLOUDFRONT_DISTRIBUTION_ID=E3KGFLBSEN7JYF
VITE_API_BASE_URL=http://13.52.211.250
CORS_ORIGIN=https://dzmxv9ygl1eyq.cloudfront.net
EC2_INSTANCE_ID=i-010b746e7db1ab34f
```

The EC2 instance is registered with AWS Systems Manager, so GitHub Actions can deploy without SSH.

Current public URLs:

```text
Frontend: https://dzmxv9ygl1eyq.cloudfront.net
Backend:  http://13.52.211.250
```

## 1. Deploy Backend to EC2

Launch an EC2 instance:

1. Open AWS account `129405039505`.
2. Go to EC2.
3. Launch an Ubuntu Server instance.
4. Allow inbound SSH on port `22` from your IP.
5. Allow inbound HTTP on port `80` from anywhere.
6. If you run Node directly on port `3001`, also allow inbound TCP `3001` from anywhere. For a class assignment, port `3001` is acceptable, but port `80` with Nginx is cleaner.

Connect to the instance:

```bash
ssh -i your-key.pem ubuntu@<EC2_PUBLIC_IP_OR_DNS>
```

Install Node.js:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs git
node --version
npm --version
```

Copy or clone this project onto EC2, then from the project root install backend dependencies:

```bash
npm install
```

Start the API:

```bash
PORT=3001 CORS_ORIGIN='*' npm start
```

Test the backend:

```bash
curl http://localhost:3001/health
curl -X POST http://localhost:3001/api/echo \
  -H 'Content-Type: application/json' \
  -d '{"reflection":"I feel stressed about school."}'
```

After CloudFront is created, restart the API with a stricter CORS origin:

```bash
PORT=3001 CORS_ORIGIN='https://<CLOUDFRONT_DISTRIBUTION_DOMAIN>' npm start
```

For a longer-running EC2 process, use `pm2`:

```bash
sudo npm install -g pm2
CORS_ORIGIN='https://<CLOUDFRONT_DISTRIBUTION_DOMAIN>' PORT=3001 pm2 start server/index.js --name sociable-growth-coach-api
pm2 save
pm2 startup
```

Your backend API base URL will be:

```text
http://<EC2_PUBLIC_IP_OR_DNS>:3001
```

If you configure Nginx to proxy port `80` to `3001`, use:

```text
http://<EC2_PUBLIC_IP_OR_DNS>
```

## 2. Build React App With EC2 Backend URL

On your local machine, from the project root:

```bash
npm install
npm install --prefix client
VITE_API_BASE_URL=http://<EC2_PUBLIC_IP_OR_DNS>:3001 npm run build --prefix client
```

If your EC2 backend is available through port `80`, use:

```bash
VITE_API_BASE_URL=http://<EC2_PUBLIC_IP_OR_DNS> npm run build --prefix client
```

This creates the static frontend files in:

```text
client/dist
```

## 3. Upload `client/dist` to S3

Create an S3 bucket for the frontend.

Recommended bucket settings:

- Block all public access can stay enabled if CloudFront uses Origin Access Control.
- Static website hosting is not required when CloudFront serves the S3 origin.

Upload the contents of `client/dist` to the S3 bucket. With the AWS CLI:

```bash
aws s3 sync client/dist s3://<S3_BUCKET_NAME> --delete --profile blee
```

## 4. Create CloudFront Distribution

Create a CloudFront distribution:

1. Origin domain: choose the S3 bucket.
2. Origin access: use Origin Access Control.
3. Viewer protocol policy: Redirect HTTP to HTTPS.
4. Default root object: `index.html`.
5. Add an error response for single-page app routing:
   - HTTP error code: `403`
   - Response page path: `/index.html`
   - HTTP response code: `200`
6. Create the distribution.
7. If CloudFront gives you an S3 bucket policy for Origin Access Control, add it to the S3 bucket permissions.

After deployment finishes, your frontend URL will look like:

```text
https://<CLOUDFRONT_DISTRIBUTION_DOMAIN>
```

## 5. Submit Public URL to Coursera

Submit the CloudFront distribution URL, not the EC2 backend URL:

```text
https://<CLOUDFRONT_DISTRIBUTION_DOMAIN>
```

The CloudFront page is the public UI. It calls the EC2 Express API through the `VITE_API_BASE_URL` value that was set during the React build.

## Environment Variables

Frontend build variable:

```bash
VITE_API_BASE_URL=http://<EC2_PUBLIC_IP_OR_DNS>
```

Backend runtime variables:

```bash
PORT=3001
CORS_ORIGIN=https://<CLOUDFRONT_DISTRIBUTION_DOMAIN>
```

Use `CORS_ORIGIN='*'` only for initial testing. Use the CloudFront URL after the distribution is created.
