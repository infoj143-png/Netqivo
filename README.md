# Internet Speed Checker

A modern, production-ready broadband internet speed checker application built with Next.js, TypeScript, and Tailwind CSS.

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
- **Cancel Test & Concurrency Control**: Cancel running tests at any time and prevent multiple tests from executing simultaneously.
- **LocalStorage Test History**: Stores recent speed test runs with timestamps, formatted speeds, and quick clear options.
- **Error & Timeout Handling**: Graceful fallback, cancellation, timeout detection, response validation, and clear UI notifications.
- **Mock Mode Support**: Toggleable mock mode via `NEXT_PUBLIC_ENABLE_MOCK_MODE=true` for local frontend testing.

---

## Environment Variables

Copy `.env.example` to `.env.local` to configure environment variables:

```bash
cp .env.example .env.local
```

| Variable                        | Default | Description                                                                 |
| ------------------------------- | ------- | --------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SPEEDTEST_API_URL` | `""`    | Base URL for external speed test API backend.                               |
| `NEXT_PUBLIC_ENABLE_MOCK_MODE`  | `false` | Set to `true` to enable development mock test mode with simulated progress. |

> **Production Note**: In production mode (`NEXT_PUBLIC_ENABLE_MOCK_MODE=false`), real tests measure actual data transfer against speed test backend endpoints (`NEXT_PUBLIC_SPEEDTEST_API_URL`) and never output fake speed results.

---

## Backend API Contract

The application calls the following external or relative backend endpoints:

### 1. GET `/speedtest/ping`

Returns server ping latency, server location, and optional client network details.

**Response Example**:

```json
{
  "latencyMs": 42,
  "server": "Lahore"
}
```

### 2. GET `/speedtest/download?duration=10`

Measures or returns download bandwidth metrics.

**Parameters**:

- `duration`: Test duration target in seconds (default `10`).

**Response Example**:

```json
{
  "bytes": 123456789,
  "durationMs": 10000,
  "speedMbps": 98.76,
  "server": "Lahore"
}
```

### 3. POST `/speedtest/upload`

Receives binary payload and measures upload bandwidth metrics.

**Request Payload**: `application/octet-stream` (binary buffer payload).

**Response Example**:

```json
{
  "bytes": 12345678,
  "durationMs": 10000,
  "speedMbps": 9.87,
  "server": "Lahore"
}
```

### Speed Calculation Formula

$$\text{speedMbps} = \frac{\text{bytes} \times 8}{\text{durationSeconds} \times 1,000,000}$$

---

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run the development server:

   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Testing & Quality Commands

- **Run Unit & Component Tests**:
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

### Vercel / Netlify / Next.js Hosts

1. Connect your repository to Vercel or your hosting provider.
2. Ensure environment variables are set in your provider's dashboard:
   - `NEXT_PUBLIC_SPEEDTEST_API_URL`
   - `NEXT_PUBLIC_ENABLE_MOCK_MODE=false`
3. Deploy! Next.js App Router API routes will automatically be hosted as Serverless / Edge Functions.
