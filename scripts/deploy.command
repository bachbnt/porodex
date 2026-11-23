#!/bin/zsh
# Double-click (or `npm run deploy:local`) to check and deploy porodex by hand. It does what the two
# GitHub workflows did: tests, type check, sync the newest patch data, prerender every page, deploy.
# A new patch ships every two weeks, so run this after one lands.
#
#   scripts/deploy.command            check, build and deploy
#   scripts/deploy.command --no-deploy  check and build only, deploy nothing
cd "$(dirname "$0")/.." || exit 1
export PATH="$(ls -d "$HOME"/.nvm/versions/node/*/bin 2>/dev/null | sort -V | tail -1):/opt/homebrew/bin:/usr/local/bin:$PATH"

# The Firebase project belongs to this account; --account does not change the one the CLI uses by default.
FIREBASE_ACCOUNT="bachbntdev@gmail.com"
FIREBASE_PROJECT="porodex"

deploy=1
[ "$1" = "--no-deploy" ] && deploy=0

run() {
  echo "\n▶ $*"
  "$@"
}

{
  [ -d node_modules ] || run npm ci
} && run npm test \
  && run npm run typecheck \
  && run npm run generate \
  && {
    if [ $deploy -eq 1 ]; then
      run firebase deploy --only hosting --project "$FIREBASE_PROJECT" --account "$FIREBASE_ACCOUNT"
    else
      echo "\nBuilt, not deployed (--no-deploy)."
    fi
  }
code=$?

if [ $code -ne 0 ]; then
  read -k 1 "?It failed (see above). Press any key to close."
elif [ $deploy -eq 1 ]; then
  echo "\nDone: https://porodex.web.app"
fi
exit $code
