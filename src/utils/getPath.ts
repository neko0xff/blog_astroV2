import { BLOG_PATH } from "../config.ts";
import { slugifyStr } from "./slugify.ts";

/**
 * Get full path of a blog post
 *
 * 目錄名與文件名（取自 `id`）都會經過 `slugifyStr` 處理，讓 URL 與檔名
 * 的大小寫、底線、數字分組無關。例如 `windows-16bit` 會變成
 * `windows-16-bit`。注意：這代表檔名改名後文章網址也可能跟著改變。
 *
 * @param id - id of the blog post (aka slug)
 * @param filePath - the blog post full file location
 * @param includeBase - whether to include `/posts` in return value
 * @returns blog post path
 */
export function getPath(
  id: string,
  filePath: string | undefined,
  includeBase = true
) {
  const pathSegments = filePath
    ?.replace(BLOG_PATH, "")
    .split("/")
    .filter(path => path !== "") // remove empty string in the segments ["", "other-path"] <- empty string will be removed
    .filter(path => !path.startsWith("_")) // exclude directories start with underscore "_"
    .slice(0, -1) // remove the last segment_ file name_ since it's unnecessary
    .map(segment => slugifyStr(segment)); // slugify each segment path

  const basePath = includeBase ? "/posts" : "";

  // Making sure `id` does not contain the directory
  // 取「最後一個非空段」而非單純的最後一段：id 若帶前導或尾端斜線
  // （例如 "/my-post" 或 "my-post/"），才不會讓整個 slug 消失而退化成 /posts
  const blogId = id.split("/").filter(seg => seg !== "");
  const slug = slugifyStr(blogId.pop() ?? id);

  // If not inside the sub-dir, simply return the file path
  if (!pathSegments || pathSegments.length < 1) {
    return join_path([basePath, slug]);
  }

  return join_path([basePath, ...pathSegments, slug]);
}

/**
 * 把路徑片段接起來，並去掉多餘的 `/`。
 *
 * `includeBase` 為 false 時 `basePath` 是空字串，若直接用 `join("/")`，
 * 結果會變成 `/category/my-post`（開頭多一個斜線）。這個值會被當成
 * Astro `[...slug]` 路由的 `params.slug` 使用，多餘的前導斜線會讓
 * 產生錯誤的路由，所以這裡先濾掉空片段再拼接。
 */
function join_path(parts: (string | string[])[]): string {
  return parts
    .flat()
    .filter(part => part !== "")
    .join("/");
}
