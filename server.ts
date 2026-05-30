import { serveDir } from "@std/http/file-server";

const PORT = parseInt(Deno.env.get("PORT") || "8085");

// ── Security Headers Configuration ──────────────────────────────────────────

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://giscus.app",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https:",
  "connect-src 'self' https://api.darkvisitors.com https://giscus.app https://api.github.com",
  "frame-src https://giscus.app",
  "media-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const PERMISSIONS_POLICY = [
  "camera=()",
  "microphone=()",
  "geolocation=()",
  "interest-cohort=()",
].join(", ");

const SECURITY_HEADERS: Record<string, string> = {
  "Content-Security-Policy": CONTENT_SECURITY_POLICY,
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": PERMISSIONS_POLICY,
};

// ── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Appends security headers to an HTTP response.
 * @param response - The original Response object
 * @returns A new Response with security headers attached
 */
function with_security_headers(response: Response): Response {
  const headers = new Headers(response.headers);

  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(key, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Logs an incoming request as a structured JSON line.
 * @param request - The incoming Request object
 */
function log_request(request: Request): void {
  const url = new URL(request.url);

  // eslint-disable-next-line no-console
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    method: request.method,
    path: url.pathname,
    ip: request.headers.get("x-forwarded-for")
      || request.headers.get("x-real-ip")
      || "unknown",
    userAgent: request.headers.get("user-agent") || "unknown",
    referer: request.headers.get("referer") || "direct",
  }));
}

// ── Request Handler ─────────────────────────────────────────────────────────

const handler = async (request: Request): Promise<Response> => {
  log_request(request);

  try {
    const response = await serveDir(request, {
      fsRoot: "./dist",
      urlRoot: "",
      showDirListing: false,
      enableCors: true,
    });

    return with_security_headers(response);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error serving request:", error);
    return with_security_headers(
      new Response("Internal Server Error", { status: 500 }),
    );
  }
};

// ── Entrypoint ──────────────────────────────────────────────────────────────

// eslint-disable-next-line no-console
console.log(`HTTP webserver running on port ${PORT}`);
Deno.serve({ port: PORT }, handler);
