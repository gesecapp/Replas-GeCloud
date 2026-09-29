#!/usr/bin/env bash
#
# Aplica a identidade do novo cliente sobre o clone do FBV-GeCloud.
# Idempotente na pratica: so age se ainda houver resquicios do FBV.
#
# Uso:
#   ./scripts/rebrand.sh <APP_ID> <APP_NAME> [CORE_URL] [INVITE_DOMAIN]
#
# Exemplo:
#   ./scripts/rebrand.sh br.com.gecloud.acme "ACME-G" \
#       https://acme-edge.ngrok-free.dev www.acme.gecloud.com.br/new-user
#
set -euo pipefail

OLD_ID="br.com.gecloud.fbv"
OLD_NAME="FBV-G"

APP_ID="${1:-}"
APP_NAME="${2:-}"
CORE_URL="${3:-}"
INVITE_DOMAIN="${4:-}"

die() { printf '\033[31mERRO:\033[0m %s\n' "$1" >&2; exit 1; }
ok()  { printf '  \033[32mok\033[0m  %s\n' "$1"; }

[ -n "$APP_ID" ] && [ -n "$APP_NAME" ] || die "uso: $0 <APP_ID> <APP_NAME> [CORE_URL] [INVITE_DOMAIN]"

# --- validacoes -------------------------------------------------------------
echo "$APP_ID" | grep -qE '^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$' \
  || die "APP_ID invalido: '$APP_ID'. Use reverse-DNS minusculo, ex: br.com.gecloud.acme"
case "$APP_ID" in
  *.fbv|*fbv*) die "APP_ID ainda contem 'fbv': '$APP_ID'" ;;
esac
printf '%s' "$APP_NAME" | grep -qE '^[A-Za-z0-9 ._-]{1,30}$' \
  || die "APP_NAME invalido: '$APP_NAME'. Use apenas letras, numeros, espaco, ponto, hifen ou underscore (max 30)."

[ -f capacitor.config.ts ] || die "rode a partir da raiz do projeto"

OLD_PATH="$(printf '%s' "$OLD_ID" | tr '.' '/')"
NEW_PATH="$(printf '%s' "$APP_ID" | tr '.' '/')"
# nome valido para o campo "name" do package.json (npm exige minusculo, sem espaco)
PKG_NAME="$(printf '%s' "$APP_NAME" | tr '[:upper:]' '[:lower:]' | tr ' ' '-')"

# sed -i portatil (BSD/macOS x GNU)
if sed --version >/dev/null 2>&1; then sedi() { sed -i "$@"; }
else sedi() { sed -i '' "$@"; }; fi

ESC_OLD_ID="${OLD_ID//./\\.}"

echo ""
echo "Rebranding:"
echo "  appId     $OLD_ID  ->  $APP_ID"
echo "  appName   $OLD_NAME  ->  $APP_NAME"
echo "  pkg name  ->  $PKG_NAME"
[ -n "$CORE_URL" ]      && echo "  CORE_URL  ->  $CORE_URL"
[ -n "$INVITE_DOMAIN" ] && echo "  convites  ->  $INVITE_DOMAIN"
echo ""

# --- 1. applicationId / bundle identifier -----------------------------------
echo "[1/5] identificadores do app"
for f in capacitor.config.ts package.json \
         android/app/build.gradle \
         android/app/src/main/res/values/strings.xml \
         ios/App/App.xcodeproj/project.pbxproj \
         android/app/src/main/assets/capacitor.config.json \
         ios/App/App/capacitor.config.json \
         APP_COMMANDS.md; do
  [ -f "$f" ] && sedi "s/$ESC_OLD_ID/$APP_ID/g" "$f" && ok "$f"
done

# --- 2. arvore de pacotes Java ----------------------------------------------
echo "[2/5] arvore Java"
JAVA_ROOT="android/app/src/main/java"
if [ -f "$JAVA_ROOT/$OLD_PATH/MainActivity.java" ]; then
  mkdir -p "$JAVA_ROOT/$NEW_PATH"
  git mv "$JAVA_ROOT/$OLD_PATH/MainActivity.java" "$JAVA_ROOT/$NEW_PATH/MainActivity.java" 2>/dev/null \
    || mv "$JAVA_ROOT/$OLD_PATH/MainActivity.java" "$JAVA_ROOT/$NEW_PATH/MainActivity.java"
  sedi "s/^package $ESC_OLD_ID;/package $APP_ID;/" "$JAVA_ROOT/$NEW_PATH/MainActivity.java"
  # limpa diretorios antigos que ficaram vazios
  ( cd "$JAVA_ROOT" && find . -type d -empty -delete ) 2>/dev/null || true
  ok "$JAVA_ROOT/$NEW_PATH/MainActivity.java"
else
  ok "ja movida (nada a fazer)"
fi

# --- 3. nome exibido ---------------------------------------------------------
echo "[3/5] nome exibido"
for f in capacitor.config.ts index.html public/manifest.json \
         android/app/src/main/res/values/strings.xml \
         android/app/src/main/assets/capacitor.config.json \
         ios/App/App/capacitor.config.json; do
  [ -f "$f" ] && sedi "s/$OLD_NAME/$APP_NAME/g" "$f" && ok "$f"
done
sedi "s/\"name\": \"$OLD_NAME\"/\"name\": \"$PKG_NAME\"/" package.json && ok "package.json (name)"

# CFBundleDisplayName: so o <string> que segue a key, nunca por posicao de linha
if [ -x /usr/libexec/PlistBuddy ]; then
  /usr/libexec/PlistBuddy -c "Set :CFBundleDisplayName $APP_NAME" ios/App/App/Info.plist
else
  sedi "/<key>CFBundleDisplayName<\/key>/{n;s|<string>.*</string>|<string>$APP_NAME</string>|;}" ios/App/App/Info.plist
fi
ok "ios/App/App/Info.plist (CFBundleDisplayName)"

# --- 4. URL do edge ----------------------------------------------------------
echo "[4/5] URL do edge"
if [ -n "$CORE_URL" ]; then
  printf 'VITE_CORE_URL=%s\n' "$CORE_URL" > .env
  ok ".env -> $CORE_URL"
else
  ok "pulado (CORE_URL nao informado) - editar .env manualmente"
fi

CONSTS="src/routes/_private/visitors/add/@consts/add-visitor.consts.ts"
if [ -n "$INVITE_DOMAIN" ] && [ -f "$CONSTS" ]; then
  sedi "s|INVITATION_URL_BASE = '.*'|INVITATION_URL_BASE = '$INVITE_DOMAIN'|" "$CONSTS"
  ok "$CONSTS"
else
  ok "convites: pulado (INVITE_DOMAIN nao informado)"
fi

# --- 5. docs ------------------------------------------------------------------
echo "[5/5] docs"
[ -f CLAUDE.md ] && sedi "1s/# FBV Front-End/# $APP_NAME Front-End/" CLAUDE.md && ok "CLAUDE.md"
[ -f docs/backend-reference.md ] && sedi "s/Back-end do FBV\./Back-end do $APP_NAME./" docs/backend-reference.md && ok "docs/backend-reference.md"

# --- verificacao --------------------------------------------------------------
echo ""
echo "Resquicios de FBV (fora de artefatos de build):"
if grep -rniI 'fbv' . \
     --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=.git \
     --exclude-dir=build --exclude-dir=.gradle --exclude-dir=Pods \
     --exclude-dir=public --exclude=pnpm-lock.yaml --exclude=rebrand.sh 2>/dev/null; then
  echo ""
  echo "  ^ revisar os pontos acima antes de commitar"
else
  echo "  nenhum."
fi

echo ""
echo "Proximos passos:"
echo "  pnpm install && pnpm run build && npx cap sync"
echo "  (assets de marca: ver REBRANDING.md)"
