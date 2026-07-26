#!/bin/bash
DEST_NAME="stockhub-app-public"

SRC="."
DEST="../${DEST_NAME}/"

# Prevent running from within the destination directory
if [[ "$PWD" == *"${DEST_NAME}"* ]]; then
  echo "Incorrect folder to execute this script" >&2
  exit 1
fi

rsync -av \
  --delete \
  --exclude='node_modules/' \
  --exclude='build/' \
  --exclude='.git/' \
  --exclude='.gitignore' \
  "$SRC" "$DEST"
  
cp -f "$DEST/src/auth/firebase.example.ts" "$DEST/src/auth/firebase.ts"

# Navigate to destination directory
cd "$DEST" || exit 1

git status

# Prompt to run git log
read -p "Run git diff? [y/N]: " show_diff
if [[ "$show_diff" =~ ^[Yy]$ ]]; then
  git diff
fi

# Prompt to confirm commit & push
read -p "Continue to commit? [y/N]: " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
  echo "Operation aborted."
  exit 0
fi

git add .
git commit --amend -m "Snapshot"
git push -f
