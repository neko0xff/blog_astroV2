/**
 * @file Unit tests for serverUtils
 *
 * ## 功能 (who)
 * - 自託管伺服器純函式：
 * 1. log 格式
 * 2. 快取策略
 * 3. 壓縮協商
 * 4. 安全標頭
 *
 * ## 範圍（what)
 * - `parse_log_format`：大小寫與未知值
 * - `cache_control_for`：_astro 不可變、assets/pagefind、HTML 預設
 * - `acceptable_codings`：RFC 9110 q 值、萬用字元、大小寫
 * - `with_security_headers`：保留原狀態並附加 CSP 等標頭
 *
 * ## 可能遇到的情況條件 (Where)
 * - 空字串
 * - q=0 明確拒絕
 * - `*;q=0`
 * - 非 ASCII 路徑
 *
 * ## 執行(how)
 * ```bash
 * deno test --allow-read --allow-env tests/serverUtils.test.ts
 * ```
 */

import { assertEquals } from "@std/assert";
import {
  ASSET_CACHE,
  IMMUTABLE_CACHE,
  NO_CACHE,
  parse_log_format,
} from "../public/server/config.ts";
import { cache_control_for } from "../public/server/cache.ts";
import { acceptable_codings } from "../public/server/compression.ts";
import { with_security_headers } from "../public/server/security.ts";

Deno.test("[serverUtils] parse_log_format handles case and fallback", () => {
  assertEquals(parse_log_format("json"), "json");
  assertEquals(parse_log_format("JSON"), "json");
  assertEquals(parse_log_format(undefined), "text");
  assertEquals(parse_log_format(""), "text");
  assertEquals(parse_log_format("yaml"), "text");
});

Deno.test("[serverUtils] cache_control_for routes by path", () => {
  assertEquals(cache_control_for("/_astro/client.js"), IMMUTABLE_CACHE);
  assertEquals(cache_control_for("/assets/img.webp"), ASSET_CACHE);
  assertEquals(cache_control_for("/pagefind/pagefind.js"), ASSET_CACHE);
  assertEquals(cache_control_for("/logo.svg"), ASSET_CACHE);
  assertEquals(cache_control_for("/posts/my-post/"), NO_CACHE);
  assertEquals(cache_control_for("/"), NO_CACHE);
});

Deno.test("[serverUtils] acceptable_codings respects q=0", () => {
  assertEquals(acceptable_codings("gzip, br").has("br"), true);
  // 明確拒絕 gzip：舊子字串比對會誤判，這裡必須為 false
  assertEquals(acceptable_codings("gzip;q=0, br").has("gzip"), false);
  assertEquals(acceptable_codings("gzip;q=0, br").has("br"), true);
  // 子字串陷阱：xbr 不等於 br
  assertEquals(acceptable_codings("xbr").has("br"), false);
  // 大小寫不敏感
  assertEquals(acceptable_codings("GZip, BR").has("br"), true);
  // 萬用字元補上未明列者，但不明列 gzip 時不應誤收 deflate 以外
  const wildcard = acceptable_codings("br, *;q=0");
  assertEquals(wildcard.has("br"), true);
  assertEquals(wildcard.has("gzip"), false);
  const star = acceptable_codings("*");
  assertEquals(star.has("br"), true);
  assertEquals(star.has("gzip"), true);
});

Deno.test("[serverUtils] with_security_headers keeps status and adds CSP", () => {
  const res = with_security_headers(new Response("ok", { status: 200 }));
  assertEquals(res.status, 200);
  assertEquals(
    res.headers.get("X-Content-Type-Options"),
    "nosniff",
  );
  assertEquals(res.headers.get("X-Frame-Options"), "DENY");
  assertEquals(
    res.headers.get("Content-Security-Policy")?.includes("default-src"),
    true,
  );
});
