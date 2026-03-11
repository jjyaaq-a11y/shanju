#!/usr/bin/env bash
# 一键打包：build + 拷 static/public + 打 zip，在项目根目录得到 shanju-standalone.zip
set -e
cd "$(dirname "$0")/.."

echo "→ Unsetting proxy for build..."
unset HTTP_PROXY HTTPS_PROXY http_proxy https_proxy 2>/dev/null || true

echo "→ Running npm run build..."
npm run build

echo "→ Copying .next/static and public into standalone..."
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public

echo "→ Creating shanju-standalone.zip..."
cd .next/standalone
zip -r ../../shanju-standalone.zip .
cd ../..

echo ""
echo "✓ Done. Upload this file to your server:"
echo "  $(pwd)/shanju-standalone.zip"
echo ""
