/**
 * @file 檔案系統：存在檢查與防目錄遍歷的路徑解析。
 *
 * `fs_root` 由呼叫端傳入（入口以 `import.meta.dirname` 算出），
 * 本模組不直接碰 `import.meta`，路徑在任何位置引用都正確。
 */

import { join, normalize, SEPARATOR } from "@std/path";

/**
 * Checks whether a path points to an existing file on disk.
 * @param path - Absolute path to check
 * @returns True when the path is an existing regular file
 */
export function file_exists(path: string): boolean {
  try {
    return Deno.statSync(path).isFile;
  } catch {
    return false;
  }
}

/**
 * Resolves a URL pathname to an absolute file path inside fs_root,
 * preventing directory traversal. Directories fall back to index.html.
 * @param pathname - The URL pathname
 * @param fs_root - Absolute directory the site is served from
 * @returns The resolved file path, or null when the path escapes fs_root
 */
export function resolve_file(pathname: string, fs_root: string): string | null {
  const resolved = normalize(join(fs_root, pathname));

  if (resolved !== fs_root && !resolved.startsWith(fs_root + SEPARATOR)) {
    return null;
  }

  try {
    const canonical_root = Deno.realPathSync(fs_root);
    const canonical_path = Deno.realPathSync(resolved);
    if (
      canonical_path !== canonical_root &&
      !canonical_path.startsWith(canonical_root + SEPARATOR)
    ) {
      return null;
    }

    const info = Deno.statSync(canonical_path);

    if (info.isDirectory) {
      // 目錄要回傳 index.html，但這個組出來的路徑必須「再走一次」上面的
      // canonical 檢查。
      // 原因是 index.html 本身可能是指向 FS_ROOT 以外的 symlink：目錄本身在 root 內不代表它的 index.html 也在。
      // 不重複檢查的話，/dirlink/ 會把 /dirlink/index.html -> /etc/passwd
      // 這種檔案內容送出去，而同一個 symlink 直接請求時會被擋下，形成同一個控制項內部的行為不一致。
      const index_path = join(canonical_path, "index.html");
      const canonical_index = Deno.realPathSync(index_path);
      if (
        canonical_index !== canonical_root &&
        !canonical_index.startsWith(canonical_root + SEPARATOR)
      ) {
        return null;
      }
      return canonical_index;
    }

    return canonical_path;
  } catch {
    return null;
  }
}
