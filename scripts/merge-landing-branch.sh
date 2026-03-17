#!/usr/bin/env bash
set -euo pipefail

TARGET_BRANCH="${1:-codex/build-payslipiq-landing-page}"
BASE_BRANCH="${2:-work}"

current_branch="$(git branch --show-current)"

if git show-ref --verify --quiet "refs/heads/${TARGET_BRANCH}"; then
  echo "Found local branch: ${TARGET_BRANCH}"
else
  echo "Local branch not found. Trying to fetch from origin..."
  if git remote get-url origin >/dev/null 2>&1; then
    git fetch origin "${TARGET_BRANCH}:${TARGET_BRANCH}"
  else
    echo "No origin remote configured. Add a remote or create branch locally first." >&2
    exit 1
  fi
fi

git checkout "${BASE_BRANCH}"
git merge "${TARGET_BRANCH}"

echo "Merged ${TARGET_BRANCH} into ${BASE_BRANCH}."
echo "Run: npm run lint && npm run build"

if [[ "${current_branch}" != "${BASE_BRANCH}" ]]; then
  echo "Note: previous branch was ${current_branch}."
fi
