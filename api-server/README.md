# Crypto Stats API Server

This server provides REST APIs to fetch, store, and analyze cryptocurrency statistics. It uses MongoDB for storage, CoinGecko for data, and NATS for event-driven updates.

---

## Features

- **Fetch and store cryptocurrency statistics** for Bitcoin, Ethereum, and Matic Network from CoinGecko.
- **Expose REST APIs** to get the latest stats, calculate price deviation, trigger updates, and view logs.
- **Event-driven updates**: Listens to NATS events to update stats automatically.
- **Manual and scheduled update support**.
- **Log file access**: Retrieve the last 800 lines of server logs for debugging.

---

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- NATS Server (for event-driven updates)
- CoinGecko API Key

---

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create a `.env` file in the root directory:**
   ```
   MONGODB_URI=mongodb://localhost:27017/crypto-stats
   COINGECKO_API_URL=https://api.coingecko.com/api/v3
   COINGECKO_API_KEY=your_coingecko_api_key
   PORT=3000
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

## API Endpoints

### Version 1 (`/api/v1`)

#### 1. Get Latest Cryptocurrency Statistics

- **GET `/api/v1/stats?coin=<coin>`**
- **Query Parameters:**
  - `coin`: `bitcoin`, `ethereum`, or `matic-network`
- **Response:**
  ```json
  {
    "price": 40000,
    "marketCap": 800000000,
    "24hChange": 3.4
  }
  ```

#### 2. Get Price Standard Deviation

- **GET `/api/v1/deviation?coin=<coin>`**
- **Query Parameters:**
  - `coin`: `bitcoin`, `ethereum`, or `matic-network`
- **Response:**
  ```json
  {
    "deviation": 4082.48
  }
  ```

#### 3. Get Server Logs

- **GET `/api/v1/log`**
- **Response:**  
  Returns the last 800 lines of the server log as plain text.

---

### Version 2 (`/api/v2`)

#### 4. Manually Trigger Stats Update

- **GET `/api/v2/update`**  
  Triggers an immediate update of all crypto stats.  
  **Response:**
  ```json
  {
    "message": "Crypto stats updated successfully"
  }
  ```

- **POST `/api/v2/update`**  
  Same as above, but for programmatic/API usage.

---

## Event-Driven Updates

- The server subscribes to the `crypto.update` subject on NATS.
- When a message `{ "trigger": "update" }` is received, it automatically triggers `storeCryptoStats()` to fetch and store the latest data.

---

## MongoDB Schema

See [`src/models/CryptoStat.js`](./src/models/CryptoStat.js):

- `coin`: `"bitcoin" | "ethereum" | "matic-network"`
- `price`: Number (USD)
- `marketCap`: Number (USD)
- `change24h`: Number (24h % change)
- `timestamp`: Date

---

## Logging

- All logs are written to `logs/server.log`.
- The `/api/v1/log` endpoint returns the last 800 lines for debugging.

---

## Example Usage

**Get latest Bitcoin stats:**
```
GET http://localhost:3000/api/v1/stats?coin=bitcoin
```

**Get deviation for Ethereum:**
```
GET http://localhost:3000/api/v1/deviation?coin=ethereum
```

**Trigger update manually:**
```
GET http://localhost:3000/api/v2/update
```

**Get logs:**
```
GET http://localhost:3000/api/v1/log
```

---

## Architecture

- **Controllers:** Handle API requests and responses.
- **Services:** Business logic, data fetching, and event handling.
- **Routes:** API endpoint definitions.
- **Utils:** Utility functions (DB connection, logging).
- **NATS Integration:** Subscribes to update events for real-time data refresh.

---

## Deployment

- Deploy to any Node.js-compatible environment.
- Use MongoDB Atlas for managed database.
- Ensure NATS server is accessible for event-driven updates.

---

## Worker Server

See the [worker-server README](../worker-server/README.md) for details on the background job publisher.

---