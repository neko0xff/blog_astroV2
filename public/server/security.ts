/**
 * @file 安全標頭：把 SECURITY_HEADERS 附加到每個回應。
 */

import { SECURITY_HEADERS } from "./config.ts";

/**
 * Appends security headers to an HTTP response.
 * @param response - The original Response object
 * @returns A new Response with security headers attached
 */
export function with_security_headers(response: Response): Response {
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
