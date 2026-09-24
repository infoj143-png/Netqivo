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
- **LocalStorage Test History**: Stores recent speed test runs with timestamps, formatted speeds, and quick clear options.
- **Error Handling**: Graceful fallback and clear UI notification when backend endpoints are unreachable.
- **Mock Mode Support**: Toggleable mock mode via environment variables for local frontend testing without backend dependency.

---

## Environment Variables

Copy `.env.example` to `.env.local` to configure environment variables:

```bash
cp .env.example .env.local
```

| Variable                        | Default | Description                                                                 |
| ------------------------------- | ------- | --------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SPEEDTEST_API_URL` | `""`    | Base URL for the speed test API (leave blank for local Next.js API routes). |
| `NEXT_PUBLIC_ENABLE_MOCK_MODE`  | `false` | Set to `true` to enable development mock test mode with simulated progress. |

> **Production Note**: In production mode (`NEXT_PUBLIC_ENABLE_MOCK_MODE=false`), real tests measure real data transfer against speed test backend endpoints and never output fake speed results.

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

## API Endpoints

The application includes built-in speed test backend endpoints:

- `GET /api/speedtest/ping`: Returns server timestamp, detected client IP, ISP information, and server location.
- `GET /api/speedtest/download?size=10`: Streams binary data payload for download bandwidth measurement with `no-store` headers.
- `POST /api/speedtest/upload`: Receives binary data payload for upload bandwidth measurement.

---

## Deployment Instructions

### Vercel / Netlify / Next.js Hosts

1. Connect your repository to Vercel or your hosting provider.
2. Ensure environment variables are set in your provider's dashboard:
   - `NEXT_PUBLIC_SPEEDTEST_API_URL`
   - `NEXT_PUBLIC_ENABLE_MOCK_MODE=false`
3. Deploy! Next.js App Router API routes will automatically be hosted as Serverless / Edge Functions.
