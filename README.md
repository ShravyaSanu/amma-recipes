# Amma & Muddu's Recipes

An offline recipe book for Android, built from our family WhatsApp recipe chat.

**Open / install:** https://shravyasanu.github.io/amma-recipes/

## Install on Android (one time, needs internet)
1. Open the link above in **Chrome**.
2. Tap **Install app** on the home screen, or Chrome menu **⋮ → Add to Home screen → Install**.
3. Open it once from the home screen icon. From then on it works with no internet.

## Using it
- **Add / Edit** recipes and links right in the app – saved on the phone.
- **Settings → Share backup** now and then (to WhatsApp / Drive). Use **Restore from backup** on a new phone.
- Text size, dark mode and high contrast are in **Settings**.

## Changing the built-in recipes (on a laptop)
1. Edit `recipes.js` (recipes, links and categories).
2. In `sw.js`, bump `CACHE` (e.g. `amma-recipes-v1` → `amma-recipes-v2`) so phones pick up the change.
3. Commit and push to `main`. The phone shows "A new version is ready – Refresh" next time it opens with internet.

Recipes added on the phone are never overwritten by an update.
