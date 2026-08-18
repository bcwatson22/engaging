#!/usr/bin/env bash
# Builds the simulation to WebAssembly and drops it in public/.
#
# The artifact is committed, so Vercel needs no Rust toolchain and a deploy
# never builds it. Rerun this whenever src/lib.rs changes, and commit the
# result alongside the source.
set -euo pipefail

cd "$(dirname "$0")"

cargo build --release --target wasm32-unknown-unknown
cp target/wasm32-unknown-unknown/release/particles.wasm ../../public/particles.wasm

printf 'public/particles.wasm  %s bytes (%s gzipped)\n' \
  "$(wc -c < ../../public/particles.wasm | tr -d ' ')" \
  "$(gzip -9c ../../public/particles.wasm | wc -c | tr -d ' ')"
