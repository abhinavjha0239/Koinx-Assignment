# Crypto Stats Worker Server

This server runs scheduled background jobs to trigger updates of cryptocurrency statistics. It publishes events to NATS that are consumed by the API server.

---

## Features

- Runs a background job every 15 minutes using `node-cron`.
- Publishes update events to NATS (`crypto.update` subject).
- Triggers the API server to fetch and store the latest cryptocurrency data automatically.
- Can be started/stopped gracefully.

---

## Prerequisites

- Node.js (v14 or higher)
- NATS Server (running and accessible)

---

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create a `.env` file in the root directory:**
   ```
   NATS_URL=nats://localhost:4222
   ```

---

## Running the Server

- **Development:**  
  ```bash
  npm run dev
  ```
- **Production:**  
  ```bash
  npm start
  ```

---

## How It Works

1. The worker server initializes a cron job that runs every 15 minutes.
2. When the job runs, it publishes an event to the `crypto.update` subject in NATS:
   ```json
   { "trigger": "update" }
   ```
3. The API server, which is subscribed to this subject, receives the event and triggers the `storeCryptoStats()` function.
4. The API server fetches the latest cryptocurrency data from CoinGecko and stores it in MongoDB.

---

## NATS Event Structure

- **Subject:** `crypto.update`
- **Message:**  
  ```json
  { "trigger": "update" }
  ```

---

## Deployment

- Deploy to any Node.js-compatible environment.
- Ensure the NATS server is accessible from both the worker server and the API server.

---

## Related API Server Endpoints

See the [api-server README](../api-server/README.md) for details on available endpoints and how the API server consumes these events.

---

## Architecture

- **jobs/updateJob.js:** Schedules and triggers the update event.
- **services/natsService.js:** Handles NATS connection and publishing.
- **src/index.js:** Main entry point, handles startup and graceful shutdown.

---