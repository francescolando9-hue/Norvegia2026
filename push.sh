#!/usr/bin/env bash
# Prepara e pubblica. Al primo giro crea il repo locale, poi basta rilanciarlo.
#
#   ./push.sh                          commit e push delle modifiche
#   ./push.sh "messaggio"              con un messaggio tuo
#
# Il remote va impostato una volta sola:
#   git remote add origin git@github.com:<utente>/norvegia2026.git

set -euo pipefail
cd "$(dirname "$0")"

MSG="${1:-Aggiornamento itinerario $(date +%d/%m/%Y)}"

echo "→ Allineo la cache del service worker e rigenero il file singolo"
python3 build.py

if command -v node >/dev/null 2>&1; then
  echo "→ Controllo la sintassi dei moduli"
  for f in data.js store.js ui.js weather.js views.js app.js sw.js; do
    node --check "$f" || { echo "   errore di sintassi in $f"; exit 1; }
  done
else
  echo "→ Node non installato: il controllo di sintassi lo fa la GitHub Action"
fi

if [ ! -d .git ]; then
  echo "→ Primo avvio: inizializzo il repository"
  git init -b main
  echo "   ora imposta il remote e rilancia:"
  echo "   git remote add origin git@github.com:<utente>/norvegia2026.git"
fi

git add -A
if git diff --cached --quiet; then
  echo "→ Niente da committare"
else
  git commit -m "$MSG"
  echo "→ Commit fatto: $MSG"
fi

if git remote get-url origin >/dev/null 2>&1; then
  git push -u origin main
  echo "→ Pubblicato. Pages aggiorna in un minuto circa."
else
  echo "→ Nessun remote impostato: push saltato"
fi
