#!/usr/bin/env bash
set -euo pipefail

# Build the WASM binary from rust-igraph.
# Usage: ./tools/build-wasm.sh [path-to-rust-igraph]
#
# Requires: rustup, wasm-pack, wasm-opt (binaryen)

RUST_IGRAPH_DIR="${1:-../rust-igraph}"
OUT_DIR="packages/core/wasm"

if [ ! -d "$RUST_IGRAPH_DIR/crates/igraph-wasm" ]; then
  echo "Error: $RUST_IGRAPH_DIR/crates/igraph-wasm not found"
  echo "Usage: $0 [path-to-rust-igraph]"
  exit 1
fi

echo "==> Building WASM from $RUST_IGRAPH_DIR/crates/igraph-wasm"

cd "$RUST_IGRAPH_DIR"

wasm-pack build crates/igraph-wasm \
  --target web \
  --out-dir pkg \
  --release

if command -v wasm-opt &> /dev/null; then
  echo "==> Optimizing WASM binary with wasm-opt"
  wasm-opt -O3 crates/igraph-wasm/pkg/igraph_wasm_bg.wasm \
    -o crates/igraph-wasm/pkg/igraph_wasm_bg.wasm
fi

cd -

echo "==> Copying WASM artifacts to $OUT_DIR"
cp "$RUST_IGRAPH_DIR/crates/igraph-wasm/pkg/igraph_wasm_bg.wasm" "$OUT_DIR/"
cp "$RUST_IGRAPH_DIR/crates/igraph-wasm/pkg/igraph_wasm.js" "$OUT_DIR/"
cp "$RUST_IGRAPH_DIR/crates/igraph-wasm/pkg/igraph_wasm.d.ts" "$OUT_DIR/" 2>/dev/null || true
cp "$RUST_IGRAPH_DIR/crates/igraph-wasm/pkg/igraph_wasm_bg.wasm.d.ts" "$OUT_DIR/" 2>/dev/null || true

echo "==> WASM build complete"
ls -lh "$OUT_DIR"/*.wasm
