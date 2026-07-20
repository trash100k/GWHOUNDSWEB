#!/usr/bin/env bash
# encode.sh — web-encode a raw Flow leg for smooth blob scrubbing (beatsheet §3).
# Usage: encode.sh <raw.mp4> <N> [mobile]
#   desktop: native res, crf 21, all-intra -> assets/vid/legN.mp4   + legN-first.webp
#   mobile:  scale=720:-2, crf 23, GOP 4   -> assets/vid/legN-m.mp4 + legN-m-first.webp
# All-intra desktop (2026-07-19): at 1080p, GOP 8 seeks decode up to 8 frames and the
# engine's seek-coalescing visibly quantizes the scrub — worst during crossfades where
# two legs decode at once. Every-frame keyframes fixed it (A/B verified); ~+4 MB/leg.
# Banding note (beatsheet): crf 19 because near-black gradients band first; if
# banding shows on the darkest legs (tunnel/vault), add light grain —
# insert `noise=alls=6:allf=t` into -vf — rather than raising bitrate blindly.
# POSIX-safe bash 3.2.
set -eu

if [ "$#" -lt 2 ] || [ "$#" -gt 3 ]; then
  echo "usage: encode.sh <raw.mp4> <N> [mobile]" >&2
  exit 2
fi
SRC="$1"; N="$2"; MODE="${3:-desktop}"

if [ ! -f "$SRC" ]; then
  echo "FATAL: source not found: $SRC" >&2
  exit 1
fi

ROOT="/home/isaacsonzach13/gwhoundsweb/world"
VID="$ROOT/assets/vid"
POSTERS="$ROOT/assets"
mkdir -p "$VID" "$POSTERS"

if [ "$MODE" = "mobile" ]; then
  OUT="$VID/leg$N-m.mp4"
  POSTER="$POSTERS/leg$N-m-first.webp"
  VF="scale=720:-2,unsharp=5:5:0.8:5:5:0.0"
  CRF=23; GOP=4
else
  OUT="$VID/leg$N.mp4"
  POSTER="$POSTERS/leg$N-first.webp"
  VF="unsharp=5:5:0.8:5:5:0.0"
  CRF=21; GOP=1
fi

ffmpeg -hide_banner -loglevel error -y -i "$SRC" -an -vf "$VF" \
  -c:v libx264 -preset slow -crf "$CRF" -pix_fmt yuv420p \
  -g "$GOP" -keyint_min "$GOP" -sc_threshold 0 \
  -color_range tv -colorspace bt709 -color_trc bt709 -color_primaries bt709 \
  -movflags +faststart "$OUT"

# Refresh the poster from the encoded file (the honest first frame)
ffmpeg -hide_banner -loglevel error -y -i "$OUT" -frames:v 1 -q:v 80 "$POSTER"

echo "$OUT"
echo "$POSTER"
