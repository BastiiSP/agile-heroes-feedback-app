#!/usr/bin/env bash
# PostToolUse-Hook: läuft nach Edit/Write/MultiEdit auf *.ts/*.tsx.
# Das Projekt hat strict:true in tsconfig.json, aber keine CI und keine Tests –
# dieser Hook ist das einzige automatisierte Sicherheitsnetz gegen kaputte Typen.
set -euo pipefail

input="$(cat)"
file_path="$(echo "$input" | jq -r '.tool_input.file_path // empty' 2>/dev/null || true)"

case "$file_path" in
  *.ts | *.tsx)
    cd "${CLAUDE_PROJECT_DIR:-.}"
    if ! npx tsc --noEmit; then
      echo "tsc --noEmit ist nach der Änderung an $file_path fehlgeschlagen – bitte Typfehler beheben." >&2
      exit 2
    fi
    ;;
  *)
    exit 0
    ;;
esac
