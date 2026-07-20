#!/usr/bin/env bash
# placeholders.sh — THE RELIGHTING scroll-world placeholder legs.
# Generates six 8s placeholder clips (desktop 1920x1080 + native portrait 720x1280)
# plus first-frame webp posters, so the page runs before any real render lands.
# Env: LIMIT=<n> caps how many legs are generated (smoke tests).
# POSIX-safe bash 3.2: no associative arrays, no mapfile.
set -eu

ROOT="/home/isaacsonzach13/gwhoundsweb/world"
VID="$ROOT/assets/vid"
POSTERS="$ROOT/assets"
mkdir -p "$VID" "$POSTERS"

# --- Font: DejaVu Sans Bold, fail loudly if absent -------------------------
FONT=""
if command -v fc-match >/dev/null 2>&1; then
  FONT="$(fc-match -f '%{file}' 'DejaVu Sans:bold' 2>/dev/null || true)"
fi
case "$FONT" in
  *DejaVuSans-Bold*) : ;;
  *) FONT="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" ;;
esac
if [ ! -f "$FONT" ]; then
  echo "FATAL: DejaVu Sans Bold not found (fc-match failed and $FONT missing). Install fonts-dejavu." >&2
  exit 1
fi

# Beat names, in order (leg 1..6)
BEATS_1="The Cold Open"
BEATS_2="First Spark"
BEATS_3="The Flood"
BEATS_4="The Wiring"
BEATS_5="The Proving"
BEATS_6="Full Heat"

beat_name() {
  eval "printf '%s' \"\$BEATS_$1\""
}

DUR=8
FPS=24
BG="0x100E0B"
AMBER="0xE9A94F"

# make_leg <N> <W> <H> <sweepW> <crf> <gop> <label_size> <beat_size> <out.mp4>
# Near-black base + a horizontal amber->bg gradient bar whose x position is a
# linear function of t, so scrubbing visibly moves the sweep.
make_leg() {
  n="$1"; w="$2"; h="$3"; sw="$4"; crf="$5"; gop="$6"; ls="$7"; bs="$8"; out="$9"
  beat="$(beat_name "$n")"
  ffmpeg -hide_banner -loglevel error -y \
    -f lavfi -i "color=c=$BG:s=${w}x${h}:r=$FPS:d=$DUR" \
    -f lavfi -i "gradients=s=${sw}x${h}:c0=$AMBER:c1=$BG:x0=0:y0=$((h / 2)):x1=$((sw - 1)):y1=$((h / 2)):d=$DUR:r=$FPS:speed=0" \
    -filter_complex "\
[0:v][1:v]overlay=x='-w+(W+2*w)*t/$DUR':y=0:shortest=1,\
drawtext=fontfile=$FONT:text='PLACEHOLDER — LEG $n':fontsize=$ls:fontcolor=0xE7CFAE:x=(w-text_w)/2:y=(h-text_h)/2-$((ls / 2 + 20)),\
drawtext=fontfile=$FONT:text='$beat':fontsize=$bs:fontcolor=$AMBER:x=(w-text_w)/2:y=(h)/2+$((bs / 2)),\
format=yuv420p" \
    -an -c:v libx264 -crf "$crf" -pix_fmt yuv420p \
    -g "$gop" -keyint_min "$gop" -sc_threshold 0 \
    -movflags +faststart "$out"
}

# poster <in.mp4> <out.webp> — first frame as webp
poster() {
  ffmpeg -hide_banner -loglevel error -y -i "$1" -frames:v 1 -q:v 80 "$2"
}

LIMIT="${LIMIT:-6}"
N=1
while [ "$N" -le 6 ] && [ "$N" -le "$LIMIT" ]; do
  echo "== leg $N: $(beat_name "$N")"
  make_leg "$N" 1920 1080 640 20 8 96 56 "$VID/leg$N.mp4"
  make_leg "$N" 720 1280 240 23 4 52 34 "$VID/leg$N-m.mp4"
  poster "$VID/leg$N.mp4"   "$POSTERS/leg$N-first.webp"
  poster "$VID/leg$N-m.mp4" "$POSTERS/leg$N-m-first.webp"
  N=$((N + 1))
done
echo "placeholders done ($((N - 1)) legs)"
