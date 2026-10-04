/**
 * @file Access log：單行文字或 JSON 結構化輸出。
 */

import type { LogFormat } from "./config.ts";

/**
 * 單行 access log 所需的結構化欄位。
 */
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
 * 將 Date 格式化為 access log 用的本地時間 `YYYY-MM-DD HH:mm:ss`。
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
 * 從 Deno serve handler info 取出客戶端 IP，取不到時回傳 "-"。
 * @param info - Deno.serve 傳入的連線資訊
 * @returns 客戶端 IP；unix/vsock 連線回傳 transport 名稱
 */
export function client_ip(info: Deno.ServeHandlerInfo | undefined): string {
  const addr = info?.remoteAddr;
  if (!addr) return "-";
  if ("hostname" in addr) return addr.hostname || "-";
  return addr.transport;
}

/**
 * 清理 log 欄位：換行壓成空白、雙引號換成單引號，避免撐破單行格式。
 * @param value - 原始標頭值
 * @returns 清理後的單行字串
 */
export function sanitize_log_value(value: string): string {
  return value.replaceAll('"', "'").replace(/\s+/g, " ");
}

/**
 * 組出單行 access log，開頭固定為 `[時間] [METHOD] path status`。
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
 * 依格式輸出 access log：text 單行、json 結構化（給日誌收集器）。
 * @param timestamp - 呼叫端產生的時間字串
 * @param entry - 請求與回應的結構化欄位
 * @param format - 輸出格式
 */
export function log_access(
  timestamp: string,
  entry: AccessEntry,
  format: LogFormat
): void {
  // eslint-disable-next-line no-console
  if (format === "json") {
    console.log(JSON.stringify({ timestamp, ...entry }));
  } else {
    console.log(format_access_log(timestamp, entry));
  }
}
