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

HERO_URL="$(node -e "const fs=require('fs');const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));const arr=j?.hero?.heroImages||[];const fromArr=Array.isArray(arr)?(arr.find((item)=>item?.image?.url)?.image?.url||''):'';const legacy=j?.hero?.heroImage?.url||'';process.stdout.write(fromArr||legacy);" "$SITE_SETTINGS_JSON")"
[[ -n "$HERO_URL" ]] || fail "site-settings hero image URL is empty"
HERO_URL_ALT=""
if [[ "$HERO_URL" == /* ]]; then
  HERO_URL_ALT="${BASE_URL%/}${HERO_URL}"
fi
HERO_URL_ENCODED="$(node -e "process.stdout.write(encodeURIComponent(process.argv[1]||''));" "$HERO_URL")"

grep -q 'DeepChinaTrip' "$HOME_HTML" || fail "Homepage missing brand title text"
grep -q '/routes' "$HOME_HTML" || fail "Homepage missing /routes link"
grep -q '/journal' "$HOME_HTML" || fail "Homepage missing /journal link"
grep -q 'id="routes"' "$HOME_HTML" || fail "Homepage missing routes section"
grep -q 'id="journal"' "$HOME_HTML" || fail "Homepage missing journal section"
grep -q '为什么选择我们' "$HOME_HTML" || fail "Homepage missing Why section title (zh)"
if ! grep -q "$HERO_URL" "$HOME_HTML" \
  && ! { [[ -n "$HERO_URL_ALT" ]] && grep -q "$HERO_URL_ALT" "$HOME_HTML"; } \
  && ! grep -q "$HERO_URL_ENCODED" "$HOME_HTML"
then
  fail "Homepage missing hero image URL from CMS ($HERO_URL)"
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

MAIN_JS_PATH="$(node -e "const fs=require('fs');const html=fs.readFileSync(process.argv[1],'utf8');const matches=[...html.matchAll(/src=\\\"([^\\\"]*\\/_next\\/static\\/chunks\\/[^\\\"]+\\.js)\\\"/g)].map(m=>m[1]);const target=matches.find(p=>p.includes('main-app'))||matches[0]||'';process.stdout.write(target);" "$HOME_HTML")"
[[ -n "$MAIN_JS_PATH" ]] || fail "Cannot find Next.js chunk script tag on homepage"
MAIN_JS_CODE="$(curl --noproxy '*' -sS -o /dev/null -w '%{http_code}' "$BASE_URL$MAIN_JS_PATH")"
[[ "$MAIN_JS_CODE" == "200" ]] || fail "Next.js chunk returned $MAIN_JS_CODE (expected 200): $MAIN_JS_PATH"

echo "PASS: Homepage integrity checks passed"
