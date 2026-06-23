#!/bin/bash

cd /tmp && git clone "$URL" "$BRANCH" && cd "$BRANCH" && git checkout "$BRANCH" && cp -r . /opt/fumadocs && cd /opt/fumadocs && rm -rf "/tmp/$BRANCH"
#if test x$EMBEDURL != x; then
#  ./scripts/embed.py
#else
  echo "Skipping embed sync"
#fi
if test -d /opt/fumadocs/docs-local; then
  rm -rf /opt/fumadocs/content/docs
  ln -s /opt/fumadocs/docs-local /opt/fumadocs/content/docs
  pnpm dev
else
  pnpm build
  pnpm start
fi