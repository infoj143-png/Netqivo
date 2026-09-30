import { Request, Response, NextFunction } from "express";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    error: "Not Found",
    message: `Cannot ${req.method} ${req.path}`,
    statusCode: 404,
  });
}

export function errorHandler(
  err: Error & { status?: number; statusCode?: number; type?: string },
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) {
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || "An unexpected error occurred.";

  if (err.message && err.message.includes("CORS policy violation")) {
    return res.status(403).json({
      error: "Forbidden",
      message: err.message,
      statusCode: 403,
    });
  }

  if (err.type === "entity.too.large" || statusCode === 413) {
    return res.status(413).json({
      error: "Payload Too Large",
      message: "Uploaded payload exceeds maximum allowed size.",
      statusCode: 413,
    });
  }

  return res.status(statusCode).json({
    error: statusCode === 500 ? "Internal Server Error" : "Request Error",
    message:
      process.env.NODE_ENV === "production" && statusCode === 500
        ? "Internal server error occurred."
        : message,
    statusCode,
  });
}
