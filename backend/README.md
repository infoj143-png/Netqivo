# Internet Speed Checker - Backend API Server

A production-ready Node.js and Express backend service built with TypeScript for real-time network speed testing (ping, streaming download, and upload measurement).

---

## Features

- **TypeScript**: Full static typing and robust compile-time safety.
- **Speed Test Endpoints**:
  - `GET /speedtest/ping` - Server latency, location, and client network detection.
  - `GET /speedtest/download` - High-throughput binary streaming download tests with strict duration validation.
  - `POST /speedtest/upload` - Zero-storage, memory-safe upload stream consumption with byte/duration tracking.
- **Health Check (`GET /health`)**: Server uptime, status, and node metadata monitoring.
- **Security & Protection**:
  - **CORS Control**: Restricts API usage exclusively to configured frontend origins.
  - **Security Headers**: HTTP security headers powered by `helmet`.
  - **Rate Limiting**: Request throttling per IP via `express-rate-limit`.
  - **Request Size Enforcement**: Rejects abusive upload payloads with HTTP 413.
  - **No Storage**: Upload payloads are processed on-the-fly and immediately discarded.
  - **Cache Prevention**: All speed test responses include `Cache-Control: no-store, no-cache...`.

---

## Environment Variables

Copy `.env.example` to `.env` to configure the backend server:

```bash
cp .env.example .env
```

| Variable                    | Default                                       | Description                                                            |
| --------------------------- | --------------------------------------------- | ---------------------------------------------------------------------- |
| `PORT`                      | `5000`                                        | Port on which the Express server listens.                              |
| `ALLOWED_ORIGINS`           | `http://localhost:3000,http://127.0.0.1:3000` | Comma-separated list of allowed frontend origin URLs for CORS control. |
| `SERVER_NAME`               | `SpeedTest Edge Node`                         | Identifier/location of the speed test server node.                     |
| `MAX_TEST_DURATION_SECONDS` | `30`                                          | Maximum allowable test duration parameter for download speed tests.    |
| `MAX_UPLOAD_BYTES`          | `52428800` (50 MB)                            | Maximum allowable binary upload payload size in bytes.                 |

---

## API Documentation

### 1. Health Check (`GET /health`)

Returns operational health status and server metadata for load balancers and monitoring services.

- **URL**: `/health`
- **Method**: `GET`
- **Response Format**: `application/json`
- **Status Codes**:
  - `200 OK`: Server is healthy and running.

#### Example Response

```json
{
  "status": "ok",
  "server": "SpeedTest Edge Node",
  "timestamp": "2025-03-01T12:00:00.000Z",
  "uptime": 3600.25
}
```

---

### 2. Ping Test (`GET /speedtest/ping`)

Measures connection latency and returns server and client details. Response caching is strictly disabled.

- **URL**: `/speedtest/ping`
- **Method**: `GET`
- **Headers Returned**:
  - `Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate`
- **Response Format**: `application/json`

#### Example Response

```json
{
  "latencyMs": 0,
  "server": "SpeedTest Edge Node",
  "clientIp": "203.0.113.42",
  "isp": "Local SpeedTest Node"
}
```

---

### 3. Download Test (`GET /speedtest/download`)

Generates and streams binary data over a requested test duration to measure download throughput.

- **URL**: `/speedtest/download`
- **Method**: `GET`
- **Query Parameters**:
  - `duration` _(optional)_: Target duration in seconds (default `10`). Must be a positive number not exceeding `MAX_TEST_DURATION_SECONDS`.
  - `format` _(optional)_: Set `format=json` to receive JSON summary metrics instead of a binary stream.
- **Response**:
  - **Binary Stream** _(Default)_: `Content-Type: application/octet-stream` (streams 64KB chunks continuously until target duration completes).
  - **JSON** _(if format=json or Accept: application/json)_: Returns calculated byte count and throughput speed.
- **Error Responses**:
  - `400 Bad Request`: If `duration` parameter is non-numeric, <= 0, or exceeds `MAX_TEST_DURATION_SECONDS`.

#### Example Error Response (Abusive Duration)

```json
{
  "error": "Bad Request",
  "message": "Invalid duration parameter. Must be a positive number not exceeding 30 seconds.",
  "statusCode": 400
}
```

---

### 4. Upload Test (`POST /speedtest/upload`)

Receives a binary upload payload, measures precise duration and byte count, and safely discards data from memory on-the-fly.

- **URL**: `/speedtest/upload`
- **Method**: `POST`
- **Request Body**: Binary buffer (`application/octet-stream`).
- **Response Format**: `application/json`
- **Error Responses**:
  - `413 Payload Too Large`: If request payload or `Content-Length` header exceeds `MAX_UPLOAD_BYTES`.

#### Example Response

```json
{
  "bytes": 4194304,
  "durationMs": 850,
  "speedMbps": 39.48,
  "server": "SpeedTest Edge Node"
}
```

---

## Installation & Local Running

1. Navigate to the `backend/` directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run development server with live reload:

   ```bash
   npm run dev
   ```

4. Build for production:

   ```bash
   npm run build
   ```

5. Start production server:
   ```bash
   npm start
   ```

---

## Docker Deployment

### Build Docker Image

```bash
docker build -t speedtest-backend:latest -f Dockerfile .
```

### Run Docker Container

```bash
docker run -d \
  -p 5000:5000 \
  -e PORT=5000 \
  -e ALLOWED_ORIGINS="http://localhost:3000" \
  -e SERVER_NAME="Docker Edge Node" \
  --name speedtest-backend \
  speedtest-backend:latest
```

---

## Cloud Deployment Instructions

### Option A: Render / Railway / Fly.io

1. Connect repository branch to your cloud platform.
2. Set Root Directory / Build Path to `backend/`.
3. Set Environment Variables:
   - `PORT=5000`
   - `ALLOWED_ORIGINS=https://your-frontend-domain.com`
   - `SERVER_NAME=Cloud Edge Node`
4. Set Build Command: `npm install && npm run build`
5. Set Start Command: `npm start`
6. Set Health Check Path: `/health`

### Option B: AWS ECS / Docker Container

1. Build container image using `Dockerfile`.
2. Push container image to AWS ECR or Docker Hub.
3. Configure ECS Task Definition / Kubernetes Deployment with `PORT` and `ALLOWED_ORIGINS` environment variables.
4. Set container health check to `/health`.
