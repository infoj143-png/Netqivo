# Internet Speed Checker

A modern, production-ready broadband internet speed checker application built with Next.js, TypeScript, Tailwind CSS, and a dedicated Express Node.js backend.

## Features

- **Circular Speed Gauge**: SVG speed gauge with real-time digital display, needle animation, progress ring, and status badges.
- **Detailed Network Metrics**:
  - Download speed (Mbps)
  - Upload speed (Mbps)
  - Ping latency (ms)
  - Jitter (ms)
  - Public IP address detection
  - ISP Name identification
  - Server location details
- **Comprehensive Test States**:
  - Idle
  - Preparing
  - Testing ping
  - Testing download
  - Testing upload
  - Completed
  - Error
- **Production Backend**:
  - High-performance TypeScript Node.js & Express backend server (`/backend`).
  - Strict CORS origin filtering, rate limiting, and security headers.
  - Streaming download bytes and zero-storage upload processing.
  - Health check endpoint (`GET /health`) for load balancer monitoring.
- **Cancel Test & Concurrency Control**: Cancel running tests at any time and prevent multiple tests from executing simultaneously.
- **LocalStorage Test History**: Stores recent speed test runs with timestamps, formatted speeds, and quick clear options.
- **Mock Mode Support**: Toggleable mock mode via `NEXT_PUBLIC_ENABLE_MOCK_MODE=true` for local frontend testing.

---

## Environment Variables

Copy `.env.example` to `.env.local` to configure environment variables:

```bash
cp .env.example .env.local
```

### Frontend Environment Variables

| Variable                        | Default            | Description                                                                 |
| ------------------------------- | ------------------ | --------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SPEEDTEST_API_URL` | (Required in Prod) | Base HTTPS URL for external speed test Express API backend.                 |
| `NEXT_PUBLIC_ENABLE_MOCK_MODE`  | `false`            | Set to `true` to enable development mock test mode with simulated progress. |

### Backend Environment Variables

| Variable                    | Default                 | Description                                            |
| --------------------------- | ----------------------- | ------------------------------------------------------ |
| `PORT`                      | `5000`                  | Port on which the Express server listens.              |
| `ALLOWED_ORIGINS`           | `http://localhost:3000` | Comma-separated list of allowed frontend origin URLs.  |
| `SERVER_NAME`               | `SpeedTest Edge Node`   | Name/location of the speed test server node.           |
| `MAX_TEST_DURATION_SECONDS` | `30`                    | Maximum allowable duration for download test.          |
| `MAX_UPLOAD_BYTES`          | `52428800`              | Maximum allowable binary upload payload size in bytes. |

> **Production Note**: In production mode (`NEXT_PUBLIC_ENABLE_MOCK_MODE=false`), real tests measure actual data transfer against speed test backend endpoints (`NEXT_PUBLIC_SPEEDTEST_API_URL`) and never output fake speed results. If `NEXT_PUBLIC_SPEEDTEST_API_URL` is missing, the application will display a clear error message.

---

## Backend API Contract

The application calls the following Express or serverless backend endpoints:

### 1. GET `/health`

Health check endpoint returning server status, server name, timestamp, and uptime. See [`backend/README.md`](./backend/README.md) for full details.

### 2. GET `/speedtest/ping`

Returns server ping latency, server location, client IP, and ISP details.

### 3. GET `/speedtest/download?duration=10`

Streams binary payload or JSON response to measure download bandwidth. Rejects abusive duration parameters with HTTP 400.

### 4. POST `/speedtest/upload`

Receives binary payload (`application/octet-stream`), measures transfer duration and byte count without storing data, and enforces size limits (HTTP 413).

---

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation & Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run Express Backend Server:

   ```bash
   cd backend && npm run dev
   ```

3. Run Next.js Frontend Server (in a separate terminal):

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Testing & Quality Commands

- **Run All Unit & Integration Tests**:
  ```bash
  npm test
  ```
- **Run Type Check**:
  ```bash
  npm run typecheck
  ```
- **Run Linter**:
  ```bash
  npm run lint
  ```
- **Format Code**:
  ```bash
  npm run format
  ```

---

## Deployment Guide (Render Backend + Vercel Frontend)

Follow this complete step-by-step guide to deploy the Express backend to **Render** and connect it to the Next.js frontend on **Vercel**.

### Step 1: Deploy Backend on Render First

1. Push your repository to **GitHub**.
2. Log in to [Render](https://render.com) and click **New +** > **Web Service**.
3. Select your GitHub repository (`netqivo` / `internet-speed-checker`).
4. Configure service parameters:
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Configure backend environment variables on Render:
   ```env
   PORT=5000
   ALLOWED_ORIGINS=https://netqivo.vercel.app,http://localhost:3000
   SERVER_NAME=Netqivo SpeedTest Edge Node
   MAX_TEST_DURATION_SECONDS=30
   MAX_UPLOAD_BYTES=52428800
   ```
6. Set **Health Check Path**: `/health`
7. Deploy the Web Service and copy the **generated Render backend URL** from the top of the Render Dashboard (e.g. `https://netqivo-speedtest-backend.onrender.com`).

> **Note**: The exact Render URL is dynamically generated only after creating the web service. It must be copied from Render and set in Vercel environment variables—do not hardcode an example placeholder.

### Step 2: Test Deployed Backend Endpoint

Verify that the backend is live and responding by running:

```bash
curl https://<your-render-backend-url>/health
```

Expected output: `{"status":"ok","server":"Netqivo SpeedTest Edge Node",...}`

### Step 3: Deploy Frontend on Vercel

1. Log in to your [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** > **Project** and import your GitHub repository.
3. Under **Settings > Environment Variables**, add the following environment variables for Production, Preview, and Development environments:

| Variable Name | Value | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SPEEDTEST_API_URL` | `https://your-render-backend-url` | **Your actual generated Render backend URL** obtained in Step 1. |
| `NEXT_PUBLIC_ENABLE_MOCK_MODE` | `false` | Disables mock mode so real tests run against the Express backend. |

4. Click **Deploy** or trigger a **Redeploy** on Vercel.

### Step 4: Verify Backend CORS Configuration

Ensure your Render backend `ALLOWED_ORIGINS` includes your production frontend origin (`https://netqivo.vercel.app`):

```env
ALLOWED_ORIGINS=https://netqivo.vercel.app,http://localhost:3000
```

Because modern browsers block cross-origin non-HTTPS or unauthorized requests, both frontend and backend must communicate over HTTPS with matching CORS permissions.
