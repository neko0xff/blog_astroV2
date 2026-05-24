import { serveDir } from "@std/http/file-server";
const port = parseInt(Deno.env.get("PORT") || "8085");

/**
 * Adds security headers to every response to harden against common web attacks.
 * @param response The original Response object
 * @returns A new Response with security headers appended
 */
function withSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);

  // Content-Security-Policy: restricts what resources can be loaded
  headers.set(
    "Content-Security-Policy",
    [
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
    ].join("; "),
  );

  // Prevent MIME type sniffing
  headers.set("X-Content-Type-Options", "nosniff");

  // Prevent clickjacking
  headers.set("X-Frame-Options", "DENY");

  // Force HTTPS (1 year, include subdomains, preload)
  headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload",
  );

  // Control referrer information leakage
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Restrict browser features
  headers.set(
    "Permissions-Policy",
    [
      "camera=()",
      "microphone=()",
      "geolocation=()",
      "interest-cohort=()",
    ].join(", "),
  );

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

const handler = async (request: Request): Promise<Response> => {
  const url = new URL(request.url);
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';

  // Log the request
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    method: request.method,
    path: url.pathname,
    ip: clientIp,
    userAgent: userAgent,
    referer: request.headers.get('referer') || 'direct'
  }));

  try {
    let response: Response;

    // Handle Pagefind search files
    if (url.pathname.startsWith('/pagefind/')) {
      response = await serveDir(request, {
        fsRoot: "./public",
        urlRoot: "",
        showDirListing: false,
        enableCors: true,
      });
    } else {
      // Serve the main application
      response = await serveDir(request, {
        fsRoot: "./dist",
        urlRoot: "",
        showDirListing: false,
        enableCors: true,
      });
    }

    return withSecurityHeaders(response);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error serving request:", error);
    return withSecurityHeaders(new Response("Internal Server Error", { status: 500 }));
  }
};

// eslint-disable-next-line no-console
console.log(`HTTP webserver running on port ${port}`);
Deno.serve({ port }, handler);
