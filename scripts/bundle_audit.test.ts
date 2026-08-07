type BundleItem = {
  name: string;
  bytes: number;
  gzipBytes: number | null;
};

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

function print_top_items(items: BundleItem[], limit = 10): void {
  console.table(
    items.slice(0, limit).map((item) => ({
      file: item.name,
      size_kb: (item.bytes / 1024).toFixed(2),
      gzip_kb: item.gzipBytes === null ? "-" : (item.gzipBytes / 1024).toFixed(2),
    })),
  );
}

Deno.test("bundle size report", () => {
  const items = list_bundle_items();
  print_top_items(items, 10);
});

Deno.bench("scan dist/_astro client chunks", () => {
  list_bundle_items();
});
