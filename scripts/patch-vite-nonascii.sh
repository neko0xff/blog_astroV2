#!/bin/bash
# patch-vite-nonascii.sh
# Patches Vite's config.js to fix createRequire failing with non-ASCII paths in Deno.
# This is needed because Deno's node:module polyfill cannot parse file paths containing
# non-ASCII characters (e.g., Chinese characters) as URLs, throwing "Invalid URL" errors.
#
# Root Cause: Vite's resolveExtends() calls createRequire(from) where `from` is a plain
# file path. When the path contains non-ASCII characters (like /home/user/文件/...),
# Deno's createRequire throws "Invalid URL".
#
# Fix: Convert the `from` path to a file:// URL before passing to createRequire.
#
# Note: This only applies to Vite 7.x (dist/node/chunks/config.js). Vite 8.x moved
# the config-resolution code and no longer hits the plain-path createRequire pattern
# during Astro builds, so the patch is skipped automatically.
#
# Usage: Run after `deno install` or `deno clean && deno install`.
# This script is idempotent - safe to run multiple times.

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
VITE_DENO_DIR="$PROJECT_ROOT/node_modules/.deno"
VITE_CONFIG="$VITE_DENO_DIR/vite@7.3.3/node_modules/vite/dist/node/chunks/config.js"

if [ ! -d "$VITE_DENO_DIR" ]; then
  echo "⚠️  node_modules/.deno not found. Run 'deno install' first."
  exit 1
fi

# Vite 8.x+ does not need this patch (verified working on non-ASCII paths).
if [ ! -f "$VITE_CONFIG" ]; then
  INSTALLED_VITE="$(ls -d "$VITE_DENO_DIR"/vite@* 2>/dev/null | sed 's|.*/||' | sort -V | tail -1)"
  echo "ℹ️  No vite@7.3.3 config.js found (installed: ${INSTALLED_VITE:-none})."
  echo "   The non-ASCII createRequire patch is only needed for Vite 7.x; skipping."
  exit 0
fi

# Check if patch is already applied
if grep -q 'let fromUrl;' "$VITE_CONFIG" 2>/dev/null; then
  echo "✅ Vite non-ASCII path patch already applied."
  exit 0
fi

# Check that the original pattern exists
if ! grep -q 'const req\$4 = createRequire\$1(from);' "$VITE_CONFIG"; then
  echo "⚠️  Unexpected Vite version - patch pattern not found."
  echo "   The patch may need to be updated for this Vite version."
  exit 1
fi

# Apply the patch using sed
sed -i 's/const req\$4 = createRequire\$1(from);/let fromUrl;\n\ttry { fromUrl = new URL(`file:\/\/${from}`); } catch { fromUrl = from; }\n\tconst req\$4 = createRequire(fromUrl);/' "$VITE_CONFIG"

# Verify the patch was applied
if grep -q 'let fromUrl;' "$VITE_CONFIG"; then
  echo "✅ Vite non-ASCII path patch applied successfully."
else
  echo "❌ Failed to apply patch."
  exit 1
fi
