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

| Variable                        | Default                 | Description                                                                 |
| ------------------------------- | ----------------------- | --------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SPEEDTEST_API_URL` | `http://localhost:5000` | Base URL for external speed test Express API backend.                       |
| `NEXT_PUBLIC_ENABLE_MOCK_MODE`  | `false`                 | Set to `true` to enable development mock test mode with simulated progress. |

### Backend Environment Variables

| Variable                    | Default                 | Description                                            |
| --------------------------- | ----------------------- | ------------------------------------------------------ |
| `PORT`                      | `5000`                  | Port on which the Express server listens.              |
| `ALLOWED_ORIGINS`           | `http://localhost:3000` | Comma-separated list of allowed frontend origin URLs.  |
| `SERVER_NAME`               | `SpeedTest Edge Node`   | Name/location of the speed test server node.           |
| `MAX_TEST_DURATION_SECONDS` | `30`                    | Maximum allowable duration for download test.          |
| `MAX_UPLOAD_BYTES`          | `52428800`              | Maximum allowable binary upload payload size in bytes. |

> **Production Note**: In production mode (`NEXT_PUBLIC_ENABLE_MOCK_MODE=false`), real tests measure actual data transfer against speed test backend endpoints (`NEXT_PUBLIC_SPEEDTEST_API_URL`) and never output fake speed results.

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
  npm run type-check
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

## Deployment Instructions

### Express Backend Deployment

See complete Docker and Cloud deployment instructions in [`backend/README.md`](./backend/README.md).

### Frontend Deployment (Vercel / Netlify)

1. Connect your repository to Vercel or your hosting provider.
2. Configure environment variables in provider dashboard:
   - `NEXT_PUBLIC_SPEEDTEST_API_URL=https://your-backend-domain.com`
   - `NEXT_PUBLIC_ENABLE_MOCK_MODE=false`
3. Deploy!
