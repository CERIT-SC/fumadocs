#!/bin/bash
set -euo pipefail

DEST=/opt/fumadocs

if [ -n "${URL:-}" ] && [ -n "${BRANCH:-}" ]; then
  SRC="$(mktemp -d)"

  # Shallow, single-branch checkout of exactly the branch requested.
  git clone --branch "$BRANCH" --single-branch --depth 1 "$URL" "$SRC"

  # Export only tracked files into DEST — no .git metadata, and this
  # overlays without disturbing DEST/node_modules baked into the image.
  git -C "$SRC" archive HEAD | tar -x -C "$DEST"
  rm -rf "$SRC"

  cd "$DEST"

  # Remove every .gitignore so Tailwind v4 scans all source for classes.
  find . -type f -name .gitignore -delete

  pnpm build
  exec pnpm start
else
  cd "$DEST"
  exec pnpm dev
fi
