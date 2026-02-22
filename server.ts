// @ts-ignore
import { serve } from "jsr:@std/http@1.0.25";
// @ts-ignore
import { serveDir } from "jsr:@std/http@1.0.25";

// @ts-ignore
const port = parseInt(Deno.env.get("PORT") || "8085");
const handler = async (request: Request): Promise<Response> => {
  const url = new URL(request.url);
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  // Log the request
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    method: request.method,
    path: url.pathname,
    ip: clientIp,
    userAgent: userAgent,
    referer: request.headers.get('referer') || 'direct'
  }));

  try {
    // Handle Pagefind search files
    if (url.pathname.startsWith('/pagefind/')) {
      return await serveDir(request, {
        fsRoot: "./public",
        urlRoot: "",
        showDirListing: false,
        enableCors: true,
      });
    }

    // Serve the main application
    return await serveDir(request, {
      fsRoot: "./dist/client",
      urlRoot: "",
      showDirListing: false,
      enableCors: true,
    });
  } catch (error) {
    console.error("Error serving request:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};

console.log(`HTTP webserver running on port ${port}`);
await serve(handler, { port });
