#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_POINTER="$ROOT_DIR/.backup/LATEST_BACKUP_PATH.txt"

if [[ ! -f "$BACKUP_POINTER" ]]; then
  echo "Backup pointer not found: $BACKUP_POINTER"
  exit 1
fi

BACKUP_DIR="$(cat "$BACKUP_POINTER")"
if [[ -z "$BACKUP_DIR" || ! -d "$BACKUP_DIR" ]]; then
  echo "Backup directory not found: $BACKUP_DIR"
  exit 1
fi

echo "Restoring from backup: $BACKUP_DIR"

for file in index.html styles.css script.js vercel.json README.md; do
  if [[ -f "$BACKUP_DIR/$file" ]]; then
    cp "$BACKUP_DIR/$file" "$ROOT_DIR/$file"
  fi
done

if [[ -d "$BACKUP_DIR/assets" ]]; then
  rsync -a --delete "$BACKUP_DIR/assets/" "$ROOT_DIR/assets/"
fi

echo "Backup restore complete. Deploying to Vercel production..."
cd "$ROOT_DIR"
vercel deploy --prod -y
