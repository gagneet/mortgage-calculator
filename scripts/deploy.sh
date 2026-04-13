#!/usr/bin/env bash
set -euo pipefail

APP_NAME="mortgage-calculator"
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="${1:-/var/www/${APP_NAME}}"

find_project_root() {
  local start_dir="$1"
  local current="$start_dir"

  while [[ "$current" != "/" ]]; do
    if [[ -f "$current/package.json" ]]; then
      printf '%s\n' "$current"
      return 0
    fi
    current="$(dirname "$current")"
  done

  return 1
}

command -v npm >/dev/null 2>&1 || { echo "npm is required"; exit 1; }

PROJECT_ROOT=""

# Prefer Git top-level when available.
if command -v git >/dev/null 2>&1; then
  if GIT_TOPLEVEL="$(git -C "$SCRIPT_DIR" rev-parse --show-toplevel 2>/dev/null)"; then
    if [[ -f "$GIT_TOPLEVEL/package.json" ]]; then
      PROJECT_ROOT="$GIT_TOPLEVEL"
    fi
  fi
fi

# Fallback: walk upward from script directory.
if [[ -z "$PROJECT_ROOT" ]]; then
  if FOUND_ROOT="$(find_project_root "$SCRIPT_DIR")"; then
    PROJECT_ROOT="$FOUND_ROOT"
  fi
fi

# Final fallback: walk upward from current working directory.
if [[ -z "$PROJECT_ROOT" ]]; then
  if FOUND_ROOT="$(find_project_root "$PWD")"; then
    PROJECT_ROOT="$FOUND_ROOT"
  fi
fi

if [[ -z "$PROJECT_ROOT" ]]; then
  echo "Could not find package.json from script path ($SCRIPT_DIR) or current path ($PWD)."
  echo "This usually means the full project repository is not present on the server."
  echo "Please deploy from a complete checkout that contains package.json and src/."
  exit 1
fi

BUILD_DIR="${PROJECT_ROOT}/build"

cd "$PROJECT_ROOT"

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
