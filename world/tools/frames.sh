#!/usr/bin/env bash
# frames.sh — extract the mobile canvas-scrub frame sequence for one leg.
# Usage: frames.sh <raw.mp4> <N>
#   -> world/assets/seq/legN/f000.webp .. f095.webp  (12fps, 540px, q55)
# The phone film scrubs these on a <canvas> (engine "frames" mode): painting an
# image is instant, so scrub smoothness is decoder-independent — the fix for
# seek-bound video chop that no encode ladder could fully deliver. 12fps is
# ample cadence for the film's slow camera glides; frame 0 and the last frame
# are the same chain frames the video encodes use, so seams stay frame-locked.
# POSIX-safe bash 3.2.
set -eu

if [ "$#" -ne 2 ]; then
  echo "usage: frames.sh <raw.mp4> <N>" >&2
  exit 2
fi
SRC="$1"; N="$2"

if [ ! -f "$SRC" ]; then
  echo "FATAL: source not found: $SRC" >&2
  exit 1
fi

OUT="/home/isaacsonzach13/gwhoundsweb/world/assets/seq/leg$N"
mkdir -p "$OUT"
rm -f "$OUT"/f*.webp

ffmpeg -hide_banner -loglevel error -y -i "$SRC" \
  -vf "fps=12,scale=540:-2" -c:v libwebp -quality 55 \
  -start_number 0 "$OUT/f%03d.webp"

COUNT=$(ls "$OUT"/f*.webp | wc -l | tr -d ' ')
echo "$OUT: $COUNT frames, $(du -sh "$OUT" | cut -f1)"
