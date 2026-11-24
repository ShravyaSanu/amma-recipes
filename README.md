# Amma & Muddu's Recipes

An offline recipe book for Android, built from our family WhatsApp recipe chat.

**Open / install:** https://shravyasanu.github.io/amma-recipes/

## Install on Android (one time, needs internet)
1. Open the link above in **Chrome**.
2. Tap **Install app** on the home screen, or Chrome menu **⋮ → Add to Home screen → Install**.
3. Open it once from the home screen icon. From then on it works with no internet.

## Using it
- **Add / Edit** recipes and links right in the app – saved on the phone first.
- **Cloud sync (Settings → Cloud sync):** turn on once with a GitHub key (the app shows the steps). After that every add, edit,
  delete and favourite uploads automatically to `my-recipes.json` on the
  [`recipes-data` branch](https://github.com/ShravyaSanu/amma-recipes/blob/recipes-data/my-recipes.json).
  Offline changes upload when internet is back. On a new phone, turn on sync and everything comes back.
  The label at the top right shows the state: ☁️ Synced, Waiting to sync, Offline · will sync, or ⚠️ Sync stopped (make a new key).
- **Settings → Share backup** still makes an extra backup file if you want one.
- Text size, dark mode and high contrast are in **Settings**.

## Changing the built-in recipes (on a laptop)
1. Edit `recipes.js` (recipes, links and categories).
2. In `sw.js`, bump `CACHE` (e.g. `amma-recipes-v1` → `amma-recipes-v2`) so phones pick up the change.
3. Commit and push to `main`. The phone shows "A new version is ready – Refresh" next time it opens with internet.

Recipes added on the phone are never overwritten by an update.
