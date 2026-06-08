#!/usr/bin/env bash
set -euo pipefail

WASM_DIR="packages/core/wasm"
PACKAGE="@graphrs/igraph-wasm"
VERSION="0.1.4"

if [ -f "$WASM_DIR/igraph_wasm_bg.wasm" ]; then
  echo "WASM binary already present, skipping fetch."
  exit 0
fi

echo "Fetching $PACKAGE@$VERSION..."

TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

npm pack "$PACKAGE@$VERSION" --pack-destination "$TMPDIR" > /dev/null 2>&1

tar -xzf "$TMPDIR"/*.tgz -C "$TMPDIR"

cp "$TMPDIR/package/igraph_wasm_bg.wasm" "$WASM_DIR/"
cp "$TMPDIR/package/igraph_wasm.js" "$WASM_DIR/"
cp "$TMPDIR/package/igraph_wasm.d.ts" "$WASM_DIR/"
cp "$TMPDIR/package/igraph_wasm_bg.wasm.d.ts" "$WASM_DIR/"

echo "WASM binary fetched to $WASM_DIR/"
