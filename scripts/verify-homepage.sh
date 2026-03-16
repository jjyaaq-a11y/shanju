#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-http://127.0.0.1:3000}"
TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

fail() {
  echo "FAIL: $1" >&2
  exit 1
}

echo "[verify-homepage] BASE_URL=$BASE_URL"

HOME_HTML="$TMP_DIR/home.html"
HOME_CODE="$(curl --noproxy '*' -sS -o "$HOME_HTML" -w '%{http_code}' "$BASE_URL/")"
[[ "$HOME_CODE" == "200" ]] || fail "Homepage HTTP status is $HOME_CODE (expected 200)"

SITE_SETTINGS_JSON="$TMP_DIR/site-settings.json"
SITE_SETTINGS_CODE="$(curl --noproxy '*' -sS -o "$SITE_SETTINGS_JSON" -w '%{http_code}' "$BASE_URL/api/globals/site-settings?locale=zh&fallbackLocale=zh&depth=2")"
[[ "$SITE_SETTINGS_CODE" == "200" ]] || fail "Site settings HTTP status is $SITE_SETTINGS_CODE (expected 200)"

ROUTES_JSON="$TMP_DIR/routes.json"
ROUTES_CODE="$(curl --noproxy '*' -sS -o "$ROUTES_JSON" -w '%{http_code}' "$BASE_URL/api/routes?locale=zh&fallbackLocale=zh&limit=1&depth=0")"
[[ "$ROUTES_CODE" == "200" ]] || fail "Routes API HTTP status is $ROUTES_CODE (expected 200)"

JOURNALS_JSON="$TMP_DIR/journals.json"
JOURNALS_CODE="$(curl --noproxy '*' -sS -o "$JOURNALS_JSON" -w '%{http_code}' "$BASE_URL/api/journals?locale=zh&fallbackLocale=zh&limit=1&depth=0&where%5Bpublished%5D%5Bequals%5D=true")"
[[ "$JOURNALS_CODE" == "200" ]] || fail "Journals API HTTP status is $JOURNALS_CODE (expected 200)"

HERO_URL="$(node -e "const fs=require('fs');const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));const u=j?.hero?.heroImage?.url||'';process.stdout.write(u);" "$SITE_SETTINGS_JSON")"
[[ -n "$HERO_URL" ]] || fail "site-settings.hero.heroImage.url is empty"
HERO_URL_ALT=""
if [[ "$HERO_URL" == /* ]]; then
  HERO_URL_ALT="${BASE_URL%/}${HERO_URL}"
fi

grep -q 'DeepChinaTrip' "$HOME_HTML" || fail "Homepage missing brand title text"
grep -q '/routes' "$HOME_HTML" || fail "Homepage missing /routes link"
grep -q '/journal' "$HOME_HTML" || fail "Homepage missing /journal link"
grep -q 'id="routes"' "$HOME_HTML" || fail "Homepage missing routes section"
grep -q 'id="journal"' "$HOME_HTML" || fail "Homepage missing journal section"
grep -q '为什么选择我们' "$HOME_HTML" || fail "Homepage missing Why section title (zh)"
if ! grep -q "$HERO_URL" "$HOME_HTML"; then
  if [[ -n "$HERO_URL_ALT" ]] && grep -q "$HERO_URL_ALT" "$HOME_HTML"; then
    true
  else
    fail "Homepage missing hero image URL from CMS ($HERO_URL)"
  fi
fi
grep -q '/routes/' "$HOME_HTML" || fail "Homepage missing route detail links"
grep -q '/journal/' "$HOME_HTML" || fail "Homepage missing journal detail links"

node -e "const fs=require('fs');const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));const docs=j?.docs||[];if(!docs.length){process.exit(2)}" "$ROUTES_JSON" \
  || fail "Routes API returned no docs"
node -e "const fs=require('fs');const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));const docs=j?.docs||[];if(!docs.length){process.exit(2)}" "$JOURNALS_JSON" \
  || fail "Journals API returned no docs"
if ! grep -q '小团限额' "$HOME_HTML" && ! grep -q 'Small Groups' "$HOME_HTML"; then
  fail "Why section card content is empty on homepage render"
fi

MAIN_JS_PATH="$(node -e "const fs=require('fs');const html=fs.readFileSync(process.argv[1],'utf8');const m=html.match(/src=\\\"([^\\\"]*main-app\\.js[^\\\"]*)\\\"/);process.stdout.write(m?m[1]:'');" "$HOME_HTML")"
[[ -n "$MAIN_JS_PATH" ]] || fail "Cannot find main-app.js script tag on homepage"
MAIN_JS_CODE="$(curl --noproxy '*' -sS -o /dev/null -w '%{http_code}' "$BASE_URL$MAIN_JS_PATH")"
[[ "$MAIN_JS_CODE" == "200" ]] || fail "main-app.js returned $MAIN_JS_CODE (expected 200)"

echo "PASS: Homepage integrity checks passed"
