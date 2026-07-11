#!/usr/bin/env bash
# ============================================================
# apply-to-repo.sh
# Run this from inside your cloned batmenu repository root.
# It copies all Capacitor + Android + GitHub Actions files
# into your existing project and commits everything.
# ============================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PATCH_ROOT="$(dirname "$SCRIPT_DIR")"
REPO_ROOT="$(pwd)"

echo "==> Copying files to $REPO_ROOT ..."

# Config files
cp "$PATCH_ROOT/capacitor.config.ts"  "$REPO_ROOT/capacitor.config.ts"
cp "$PATCH_ROOT/.gitignore"           "$REPO_ROOT/.gitignore"

# Merge package.json deps (manual step shown below)

# GitHub Actions
mkdir -p "$REPO_ROOT/.github/workflows"
cp "$PATCH_ROOT/.github/workflows/build-apk.yml" "$REPO_ROOT/.github/workflows/build-apk.yml"

# Android project
cp -r "$PATCH_ROOT/android" "$REPO_ROOT/"

echo "==> Files copied."
echo ""
echo "==> Now run:"
echo "    npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/splash-screen"
echo "    git add -A"
echo "    git commit -m 'feat: add Capacitor Android + GitHub Actions APK build'"
echo "    git push"
echo ""
echo "Done!"
