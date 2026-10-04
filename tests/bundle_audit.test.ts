/**
 * @file Unit tests for bundle audit
 *
 * ## 功能 (who)
 * bundle_audit.test.ts 中的 Bundle 大小報告與基準測試
 *
 * ## 範圍（what)
 * - `list_bundle_items()`：掃描 dist/_astro 下的 JS bundle，取得大小資訊
 * - `print_top_items()`：格式化並打印前 N 大的 bundle
 *
 * ## 可能遇到的情況條件 (Where)
 * - .gz 預壓縮檔案可能不存在（返回 null）
 * - 非 .js 檔案會被跳過
 *
 * ## 執行(how)
 * ```bash
 * deno test --allow-read --allow-env --allow-net tests/bundle_audit.test.ts
 * ```
 */

/**
 * 代表單一 Bundle 檔案的資源體積數據。
 *
 * @property {string} name - 檔案名稱或路徑
 * @property {number} bytes - 未壓縮前的大小（Bytes）
 * @property {number | null} gzipBytes - 經過 Gzip 壓縮後的大小（Bytes），無資料時為 null
 */
type BundleItem = {
  name: string;
  bytes: number;
  gzipBytes: number | null;
};

/**
 * 列出所有 bundle 中的項目，並按大小排序
 * @param items 要列出的 bundle 項目
 * @returns 排序後的 bundle 項目列表
 */
function list_bundle_items(): BundleItem[] {
  const items: BundleItem[] = [];

  for (const entry of Deno.readDirSync("dist/_astro")) {
    if (!entry.isFile || !entry.name.endsWith(".js")) continue;

    const file_path = `dist/_astro/${entry.name}`;
    const gzip_path = `${file_path}.gz`;
    const bytes = Deno.statSync(file_path).size;
    const gzipBytes = (() => {
      try {
        return Deno.statSync(gzip_path).size;
      } catch {
        return null;
      }
    })();

    items.push({ name: entry.name, bytes, gzipBytes });
  }

  return items.sort((a, b) => b.bytes - a.bytes);
}

/**
 * 打印前 N 個 bundle 項目
 * @param items 要打印的 bundle 項目列表
 * @param limit 要打印的項目數量
 */
function print_top_items(items: BundleItem[], limit = 10): void {
  console.table(
    items.slice(0, limit).map((item) => ({
      file: item.name,
      size_kb: (item.bytes / 1024).toFixed(2),
      gzip_kb: item.gzipBytes === null
        ? "-"
        : (item.gzipBytes / 1024).toFixed(2),
    })),
  );
}

Deno.test({
  name: "[Report] bundle size",
  ignore: (() => {
    // dist/ 不存在（CI 在 build 前跑 test、或 clean 後）時略過，
    // 否則 Deno.readDirSync 會 NotFound 而非有效的測試失敗。
    try {
      Deno.statSync("dist/_astro");
      return false;
    } catch {
      return true;
    }
  })(),
  fn: () => {
    const items = list_bundle_items();
    print_top_items(items, 10);
  },
});

Deno.bench("[Scan] dist/_astro client chunks", () => {
  list_bundle_items();
});
