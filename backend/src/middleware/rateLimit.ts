import rateLimit from "express-rate-limit";

export function createRateLimiter(
  windowMs: number = 15 * 60 * 1000, // 15 minutes
  maxRequests: number = 100, // limit each IP to 100 requests per windowMs
) {
  return rateLimit({
    windowMs,
    max: maxRequests,
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
    message: {
      error: "Too Many Requests",
      message:
        "Rate limit exceeded. Please wait before attempting more speed tests.",
      statusCode: 429,
    },
  });
}
