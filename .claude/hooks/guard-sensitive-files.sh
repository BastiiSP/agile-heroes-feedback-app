#!/usr/bin/env bash
# PreToolUse-Hook: warnt vor riskanten Änderungen an
# - .env.local (enthält GOOGLE_APPS_SCRIPT_URL – laut CLAUDE.md nie ändern,
#   sonst bricht die Datenanbindung zum Google Apps Script Backend)
# - gas/appsscript.json (GAS-Manifest: Webapp access/executeAs) beim
#   Überschreiben (Write) oder Löschen per Bash
#
# Blockiert nicht hart, sondern gibt eine "ask"-Rückfrage an den Nutzer,
# damit versehentliche Änderungen nicht durchrutschen.
set -euo pipefail

input="$(cat)"
tool_name="$(echo "$input" | jq -r '.tool_name // empty' 2>/dev/null || true)"

reason=""

if [[ "$tool_name" == "Edit" || "$tool_name" == "Write" || "$tool_name" == "MultiEdit" ]]; then
  file_path="$(echo "$input" | jq -r '.tool_input.file_path // empty' 2>/dev/null || true)"
  case "$file_path" in
    *.env.local)
      reason="$file_path enthält GOOGLE_APPS_SCRIPT_URL. Laut Projekt-CLAUDE.md niemals ändern, sonst bricht die gesamte Backend-Anbindung. Wirklich fortfahren?"
      ;;
    */gas/appsscript.json | gas/appsscript.json)
      if [[ "$tool_name" == "Write" ]]; then
        reason="gas/appsscript.json (GAS-Manifest: webapp access/executeAs) wird komplett überschrieben. Prüfen, ob das beabsichtigt ist – ein falscher Wert bei 'access' oder 'executeAs' kann die Web-App-URL unbrauchbar machen."
      fi
      ;;
  esac
elif [[ "$tool_name" == "Bash" ]]; then
  command="$(echo "$input" | jq -r '.tool_input.command // empty' 2>/dev/null || true)"
  if echo "$command" | grep -Eq '\.env\.local'; then
    reason="Bash-Befehl referenziert .env.local (enthält GOOGLE_APPS_SCRIPT_URL). Laut Projekt-CLAUDE.md nie ändern, sonst bricht die Datenanbindung. Wirklich fortfahren?"
  elif echo "$command" | grep -Eq 'gas/appsscript\.json' && echo "$command" | grep -Eq 'rm[[:space:]]|>[[:space:]]*gas/appsscript\.json|mv[[:space:]]'; then
    reason="Bash-Befehl scheint gas/appsscript.json (GAS-Manifest) zu löschen oder zu überschreiben. Wirklich fortfahren?"
  fi
fi

if [[ -n "$reason" ]]; then
  jq -n --arg reason "$reason" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "ask",
      permissionDecisionReason: $reason
    }
  }'
fi

exit 0
