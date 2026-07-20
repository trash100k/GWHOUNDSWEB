#!/usr/bin/env bash
# extract.sh — pull chaining frames off a rendered Flow leg.
# Usage: extract.sh <legN.mp4> <outdir> <N>
#   <outdir>/legN-last.png  — last frame (-sseof -0.15), starts the NEXT leg
#   <outdir>/legN-first.png — first frame (poster/QA reference)
# POSIX-safe bash 3.2.
set -eu

if [ "$#" -ne 3 ]; then
  echo "usage: extract.sh <legN.mp4> <outdir> <N>" >&2
  exit 2
fi
SRC="$1"; OUTDIR="$2"; N="$3"

if [ ! -f "$SRC" ]; then
  echo "FATAL: source not found: $SRC" >&2
  exit 1
fi
mkdir -p "$OUTDIR"

# Last frame — the next leg's start image (eyeball it before spending the next gen)
ffmpeg -hide_banner -loglevel error -y -sseof -0.15 -i "$SRC" \
  -frames:v 1 -q:v 2 "$OUTDIR/leg$N-last.png"

# First frame — honest poster / seam-QA reference
ffmpeg -hide_banner -loglevel error -y -i "$SRC" \
  -frames:v 1 -q:v 2 "$OUTDIR/leg$N-first.png"

echo "$OUTDIR/leg$N-last.png"
echo "$OUTDIR/leg$N-first.png"
