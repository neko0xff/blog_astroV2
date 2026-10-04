/**
 * @file Access log 輸出模組
 *
 * @description
 * - What：把一次請求的結果格式化後輸出到 stdout/stderr。
 * - Why：容器與 K8s 收集日誌時，需要可 grep/可 JSON 解析的單行記錄。
 * - Who：外層 `create_handler` 呼叫；錯誤路徑也會寫一行。
 * - When：每次請求結束（含 400/301/404/500），healthz 除外。
 * - Where：`public/server/logging.ts`。
 * - How：
 *   1. text 用人讀單行格式
 *   2. json 用 `JSON.stringify` 結構化欄位輸出
 */

import type { LogFormat } from "./config.ts";

/** 單行 access log 的結構化欄位。 */
export type AccessEntry = {
  method: string;
  path: string;
  status: number;
  duration_ms: number;
  bytes: string;
  ip: string;
  user_agent: string;
  referer: string;
};

/**
 * 把 Date 格式化為本地時間 `YYYY-MM-DD HH:mm:ss`
 *
 * @description
 * - 給使用者讀的時間戳
 * - 與 log 行開頭 `[時間]` 對齊
 * @param date - 要格式化的日期
 * @returns 格式化後的時間字串
 */
export function format_timestamp(date: Date): string {
  const pad = (n: number): string => String(n).padStart(2, "0");
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
}

/**
 * 從 Deno serve handler info 取出客戶端 IP。
 *
 * @description
 * - 取不到時回傳 `"-"`，讓 log 欄位永遠有佔位符
 * - unix/vsock 回傳 transport 名稱
 * @param info - Deno.serve 傳入的連線資訊
 * @returns 客戶端 IP 字串
 */
export function client_ip(info: Deno.ServeHandlerInfo | undefined): string {
  const addr = info?.remoteAddr;
  if (!addr) return "-";
  if ("hostname" in addr) return addr.hostname || "-";
  return addr.transport;
}

/**
 * 清理標頭值，避免換行/引號撐破單行 log。
 * @param value - 原始標頭值
 * @returns 單行字串
 */
export function sanitize_log_value(value: string): string {
  return value.replaceAll('"', "'").replace(/\s+/g, " ");
}

/**
 * 組出單行 access log。
 *
 * @description
 * 1. 開頭固定 `[時間] [METHOD] path status`
 * 2. 後面接耗時、bytes、ip、ua、ref。
 * @param timestamp - 呼叫端產生的時間字串
 * @param entry - 請求與回應的結構化欄位
 * @returns 單行 log 字串
 */
export function format_access_log(
  timestamp: string,
  entry: AccessEntry
): string {
  return (
    `[${timestamp}] [${entry.method}] ${entry.path} ${entry.status} ` +
    `${entry.duration_ms}ms ${entry.bytes} ip=${entry.ip} ` +
    `ua="${entry.user_agent}" ref="${entry.referer}"`
  );
}

/**
 * 依格式輸出 access log
 *
 * @description
 * ## 目標對像(Who)
 * 1. text ：給使用者讀
 * 2. JSON ：日誌收集器
 *
 * ## 格式(How)
 * - 由 `ctx.log_format`決定

 * @param timestamp - 呼叫端產生的時間字串
 * @param entry - 請求與回應的結構化欄位
 * @param format - 輸出格式
 */
export function log_access(
  timestamp: string,
  entry: AccessEntry,
  format: LogFormat
): void {
  if (format === "json") {
    console.log(JSON.stringify({ timestamp, ...entry }));
  } else {
    console.log(format_access_log(timestamp, entry));
  }
}
