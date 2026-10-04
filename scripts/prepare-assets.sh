#!/usr/bin/env bash
#
# Deriva as fontes do @capacitor/assets a partir de uma unica logo SVG.
# Fonte unica: public/images/logo.svg (viewBox 0 0 1000 1000, simbolo centrado
# em 500,500 com raio ~431). Os arquivos em assets/ sao gerados — edite a fonte.
#
#   assets/logo.svg        transparente, com margem — foreground do icone adaptativo Android
#   assets/icon-only.svg   fundo solido — icone iOS, icones Android legados e PWA
#   assets/splash.svg      fundo solido, simbolo com ~26% do lado — splash
#   assets/splash-dark.svg idem
#
# Uso: ./scripts/prepare-assets.sh   (chamado por `pnpm run assets:generate`)
#
set -euo pipefail

SRC="public/images/logo.svg"
BG="#0f172a"
OUT="assets"

# viewBox 1440: o simbolo cabe na zona segura do icone adaptativo (~61% do canvas)
ICON_VB="-220 -220 1440 1440"
# viewBox 3300: simbolo (862 un.) com ~26% do lado do splash
SPLASH_VB="-1150 -1150 3300 3300"

if ! grep -q 'viewBox="0 0 1000 1000" width="1000" height="1000"' "$SRC"; then
  echo "erro: $SRC precisa ter viewBox=\"0 0 1000 1000\" width=\"1000\" height=\"1000\"" >&2
  exit 1
fi

# $1 viewBox, $2 tamanho em px, $3 cor de fundo (vazio = transparente), $4 destino
derive() {
  local vb="$1" size="$2" bg="$3" dest="$4" rect=""
  if [ -n "$bg" ]; then
    read -r x y w h <<<"$vb"
    rect="<rect x=\"$x\" y=\"$y\" width=\"$w\" height=\"$h\" fill=\"$bg\"/>"
  fi
  VB="$vb" SIZE="$size" RECT="$rect" perl -pe \
    's|viewBox="0 0 1000 1000" width="1000" height="1000">|viewBox="$ENV{VB}" width="$ENV{SIZE}" height="$ENV{SIZE}">$ENV{RECT}|' \
    "$SRC" >"$dest"
}

mkdir -p "$OUT"
derive "$ICON_VB" 1440 "" "$OUT/logo.svg"
derive "$ICON_VB" 1440 "$BG" "$OUT/icon-only.svg"
derive "$SPLASH_VB" 2732 "$BG" "$OUT/splash.svg"
cp "$OUT/splash.svg" "$OUT/splash-dark.svg"

echo "assets/ derivado de $SRC"
