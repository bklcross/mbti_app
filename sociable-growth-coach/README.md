# Sociable Growth Coach

Minimal CSCA 5028 app with:

- React Vite frontend
- Node.js / Express backend
- SQLite quote data collection
- Echo reflection API
- Basic metrics endpoint

Public app URL:

```text
https://dzmxv9ygl1eyq.cloudfront.net
```

## Project Structure

```text
client/   React frontend
server/   Express backend, SQLite migration, quote collector
```

## Architecture

```text
React frontend -> Express API -> SQLite
Quote collector -> DummyJSON Quotes API -> SQLite
```

## Run Locally

Install dependencies:

```bash
npm install
npm install --prefix client
```

Create the SQLite database and table:

```bash
npm run migrate
```

Collect one quote from DummyJSON and save it:

```bash
npm run collect:quotes
```

Run tests:

```bash
npm test
```

Start the app:

```bash
npm run dev
```

Local URLs:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:3001
```

## Data Collection Assignment

External API:

```text
https://dummyjson.com/quotes/random
```

Database:

```text
SQLite
server/data/sociable_growth_coach.sqlite
```

Migration:

```text
server/migrations/001_create_quotes.sql
```

This satisfies the assignment because the app fetches quote data from an external REST API and stores it in SQLite using a schema migration.

## API Endpoints

Health:

```http
GET /health
```

Echo reflection:

```http
POST /api/echo
Content-Type: application/json
```

Body:

```json
{
  "reflection": "I feel stressed about school."
}
```

Saved quotes:

```http
GET /api/quotes
```

Quote analysis:

```http
GET /api/quotes/analysis
```

Collect and save a new quote:

```http
POST /api/quotes/collect
```

Monitoring:

```http
GET /metrics
```

## Build

Build the frontend:

```bash
npm run build --prefix client
```

The deployed frontend calls same-origin API paths through CloudFront, such as `/api/echo`.

## Deploy

Push to `main` to auto-deploy with GitHub Actions:

```bash
git push origin main
```

The workflow deploys:

- frontend to S3 / CloudFront
- backend to EC2
- migration on the backend server

## Final Project Checklist

- React frontend
- Express backend
- SQLite database
- Migration file
- External API data collector
- API endpoints for saved data and analysis
- Basic monitoring endpoint
- Automated tests
- GitHub Actions CI
- Public deployment
