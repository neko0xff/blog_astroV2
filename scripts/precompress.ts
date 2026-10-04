import { join } from "@std/path";

const DIST_ROOT = "dist";

/** Text-like extensions worth precompressing (mirrors public/server.ts). */
export const COMPRESSIBLE_EXT_RE =
  /\.(html?|js|mjs|cjs|css|json|xml|txt|webmanifest|map|svg|ics)$/i;

/**
 * Recursively collects all regular file paths under a directory.
 * @param dir - The directory to walk
 * @returns An array of absolute file paths
 */
export function collect_files(dir: string): string[] {
  const files: string[] = [];

  for (const entry of Deno.readDirSync(dir)) {
    const path = join(dir, entry.name);
    if (entry.isDirectory) {
      files.push(...collect_files(path));
    } else if (entry.isFile) {
      files.push(path);
    }
  }

  return files;
}

/**
 * Gzip-compresses a file and writes it to `<path>.gz`.
 * Skips when an up-to-date `.gz` sibling already exists.
 * @param file_path - Absolute path of the source file
 * @returns True when a fresh variant was written, false when skipped
 */
export async function compress_file(file_path: string): Promise<boolean> {
  const gz_path = `${file_path}.gz`;

  try {
    const gz_stat = Deno.statSync(gz_path);
    const source_stat = Deno.statSync(file_path);
    if (
      gz_stat.isFile && gz_stat.mtime && source_stat.mtime &&
      gz_stat.mtime >= source_stat.mtime
    ) {
      return false;
    }
  } catch {
    // No existing variant — compress below.
  }

  const source = await Deno.readFile(file_path);
  const stream = new Blob([source]).stream().pipeThrough(
    new CompressionStream("gzip"),
  );
  const compressed = new Uint8Array(await new Response(stream).arrayBuffer());
  await Deno.writeFile(gz_path, compressed, { mode: 0o644 });

  return true;
}

/**
 * 對 DIST_ROOT 下的可壓縮檔產生 `.gz` 變體（已是最新者略過）。
 *
 * 包成函式並以 `import.meta.main` 守門：直接 `deno run` 時執行，
 * 被測試 import 時只取用函式而不觸碰磁碟。
 */
export async function run_precompress(): Promise<void> {
  const files = collect_files(DIST_ROOT).filter((path) =>
    COMPRESSIBLE_EXT_RE.test(path)
  );

  let compressed = 0;
  let skipped = 0;
  for (const file of files) {
    if (await compress_file(file)) {
      compressed++;
    } else {
      skipped++;
    }
  }

  console.log(
    `[precompress] ${compressed} compressed, ${skipped} skipped (${files.length} total)`,
  );
}

if (import.meta.main) {
  await run_precompress();
}
