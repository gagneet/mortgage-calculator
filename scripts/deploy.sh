#!/usr/bin/env bash
set -euo pipefail

APP_NAME="mortgage-calculator"
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd)"
BUILD_DIR="${PROJECT_ROOT}/build"
TARGET_DIR="${1:-/var/www/${APP_NAME}}"

command -v npm >/dev/null 2>&1 || { echo "npm is required"; exit 1; }

if [[ ! -f "${PROJECT_ROOT}/package.json" ]]; then
  echo "Could not find package.json at ${PROJECT_ROOT}."
  echo "Make sure scripts/deploy.sh is inside the project repository."
  exit 1
fi

cd "${PROJECT_ROOT}"

echo "Deploying from project root: ${PROJECT_ROOT}"
echo "[1/4] Installing dependencies with npm ci"
npm ci

echo "[2/4] Running test suite"
CI=true npm test -- --watchAll=false

echo "[3/4] Building production bundle"
npm run build

echo "[4/4] Deploying to ${TARGET_DIR}"
mkdir -p "${TARGET_DIR}"
rm -rf "${TARGET_DIR:?}"/*
cp -R "${BUILD_DIR}"/* "${TARGET_DIR}"

echo "Deployment complete: ${TARGET_DIR}"
