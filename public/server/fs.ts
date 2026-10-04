/**
 * @file 檔案系統工具模組
 *
 * @description
 * - What：提供存在檢查與防目錄穿越的路徑解析。
 * - Why：避免把站點根目錄外的檔案（例如 symlink 指向 /etc/passwd）誤當靜態檔送出。
 * - Who：`handler.ts.serve_inner` 與 `compression.ts` 的變體探查呼叫。
 * - When：每次決定回傳哪個檔案、檢查預壓縮檔是否存在時。
 * - Where：`public/server/fs.ts`。
 * - How：入口傳入 `fs_root`；用 `normalize` + `realPath` 雙重檢查目錄不脫離根目錄。
 */

import { join, normalize, SEPARATOR } from "@std/path";

/**
 * 檢查路徑是否為存在的一般檔案。
 *
 * @description 5W1H：
 * - What：回傳布林值，表示路徑存在且為檔案。
 * - Why：避免把目錄或不存在路徑當檔案讀。
 * - Who：`serve_inner`、`pick_variant` 呼叫。
 * - When：解析路徑後、讀檔前。
 * - Where：`Deno.statSync` 包一層 try/catch。
 * - How：statSync 失敗（不存在、無權限）一律視為 false。
 *
 * @param path - 要檢查的絕對路徑
 * @returns 是一般檔案時回傳 true
 */
export function file_exists(path: string): boolean {
  try {
    return Deno.statSync(path).isFile;
  } catch {
    return false;
  }
}

/**
 * 將 URL pathname 解析為 `fs_root` 內的絕對路徑。
 *
 * @description 5W1H：
 * - What：輸入 pathname 與根目錄，輸出安全檔案路徑；目錄會回傳其 `index.html`。
 * - Why：防止 `../../etc/passwd` 與 symlink 逃逸站點根目錄。
 * - Who：`serve_inner` 用它把網址對到實體檔案。
 * - When：每次非轉址請求要找檔案時。
 * - Where：先 `normalize(join())`，再 `realPathSync` 確認實際路徑仍在根目錄。
 * - How：若解析後不是 `fs_root` 開頭就拒絕；目錄則檢查其 `index.html` 的真實路徑也在根目錄內，才回傳。
 *
 * @param pathname - URL pathname
 * @param fs_root - 站點根目錄的絕對路徑
 * @returns 解析後的檔案路徑；若超出 fs_root 回傳 null
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
      // 目錄要回傳 index.html，但這個組出來的路徑必須「再走一次」上面的 canonical 檢查。
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
