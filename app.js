/* Amma's Recipes – offline recipe book.
   Built-in recipes come from recipes.js. Anything you add or edit is saved on this phone
   (localStorage) and, once cloud sync is turned on, uploaded to GitHub automatically. */
(() => {
  "use strict";

  const APP_VERSION = "1.1.0";
  const STORE_KEY = "amma-recipes-data";
  const SETTINGS_KEY = "amma-recipes-settings";
  const DRAFT_KEY = "amma-recipes-draft";
  const APP_NAME = "Amma's Recipes";

  const $main = document.getElementById("main");
  const $back = document.getElementById("backBtn");
  const $toast = document.getElementById("toast");
  const $net = document.getElementById("netStatus");

  const CAT = new Map(CATEGORIES.map((c) => [c.id, c]));
  const BUILTIN = new Map(RECIPES.map((r) => [r.id, r]));
  const BUILTIN_LINKS = new Map(LINKS.map((l) => [l.id, l]));

  /* ---------------- Helpers ---------------- */
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const lines = (s) => String(s || "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const today = () => new Date().toISOString().slice(0, 10);
  const fmtDate = (d) => {
    if (!d) return "";
    const dt = new Date(d.length === 10 ? d + "T00:00:00" : d);
    return isNaN(dt) ? "" : dt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };
  const fmtDateTime = (d) => {
    const dt = new Date(d);
    return isNaN(dt) ? "" : dt.toLocaleString("en-GB", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
  };
  const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "recipe";
  const byLabel = (by) => (by === "Me" ? "From me" : by ? `From ${by}` : "");
  const domainOf = (url) => { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; } };
  const isYouTube = (url) => /(^|\.)youtu(\.be|be\.com)$/.test(domainOf(url)) || domainOf(url) === "youtube.com";
  const byTitle = (a, b) => a.title.localeCompare(b.title, "en", { sensitivity: "base" });

  function toast(msg, action) {
    $toast.innerHTML = `<span>${esc(msg)}</span>`;
    if (action) {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = action.label;
      b.addEventListener("click", () => { $toast.hidden = true; action.run(); });
      $toast.appendChild(b);
    }
    $toast.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { $toast.hidden = true; }, action ? 9000 : 3500);
  }

  /* ---------------- Storage ----------------
     store.recipes / store.links   id -> item (each has an "updated" time)
     store.deleted / deletedLinks  id -> time it was deleted
     store.favs                    id -> { v: true|false, t: time }
     Times let the phone and the cloud copy be merged: the newest change wins. */
  const EPOCH = "1970-01-01T00:00:00.000Z";
  const now = () => new Date().toISOString();
  const tsOf = (x) => Date.parse(x) || 0;
  const isObj = (x) => x && typeof x === "object" && !Array.isArray(x);
  const toTombs = (x) => (Array.isArray(x) ? Object.fromEntries(x.map((id) => [id, EPOCH])) : isObj(x) ? x : {});

  function normalize(d) {
    d = isObj(d) ? d : {};
    let favs = {};
    if (Array.isArray(d.favs)) d.favs.forEach((id) => { favs[id] = { v: true, t: EPOCH }; });
    else if (isObj(d.favs)) favs = d.favs;
    return {
      v: 2,
      recipes: isObj(d.recipes) ? d.recipes : {},
      deleted: toTombs(d.deleted),
      links: isObj(d.links) ? d.links : {},
      deletedLinks: toTombs(d.deletedLinks),
      favs,
      updatedAt: d.updatedAt || null,
    };
  }
  function loadStore() {
    try { return normalize(JSON.parse(localStorage.getItem(STORE_KEY))); } catch { return normalize({}); }
  }
  let store = loadStore();

  function writeLocal() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(store));
      return true;
    } catch (e) {
      toast("Couldn't save on this phone. Please download a backup from Settings.");
      return false;
    }
  }

  function save() {
    store.updatedAt = now();
    if (!writeLocal()) return false;
    requestPersist();
    Sync.changed();
    return true;
  }

  /* Merge two copies of the data (phone + cloud, or phone + backup). Newest change per item wins. */
  function mergeItems(aItems, aDel, bItems, bDel) {
    const items = {}, del = {};
    const ids = new Set([...Object.keys(aItems), ...Object.keys(aDel), ...Object.keys(bItems), ...Object.keys(bDel)]);
    for (const id of ids) {
      let best = null, bestDel = null, bestT = -1;
      for (const [it, d] of [[aItems[id], aDel[id]], [bItems[id], bDel[id]]]) {
        if (it) { const t = tsOf(it.updated || it.date); if (t > bestT) { bestT = t; best = it; bestDel = null; } }
        if (d) { const t = tsOf(d); if (t >= bestT) { bestT = t; best = null; bestDel = d; } }
      }
      if (best) items[id] = best; else if (bestDel) del[id] = bestDel;
    }
    return { items, del };
  }
  function mergeStores(a, b) {
    a = normalize(a); b = normalize(b);
    const r = mergeItems(a.recipes, a.deleted, b.recipes, b.deleted);
    const l = mergeItems(a.links, a.deletedLinks, b.links, b.deletedLinks);
    const favs = { ...a.favs };
    for (const [id, f] of Object.entries(b.favs)) if (!favs[id] || tsOf(f.t) > tsOf(favs[id].t)) favs[id] = f;
    const updatedAt = tsOf(a.updatedAt) >= tsOf(b.updatedAt) ? a.updatedAt : b.updatedAt;
    return { v: 2, recipes: r.items, deleted: r.del, links: l.items, deletedLinks: l.del, favs, updatedAt };
  }
  /* Stable JSON (sorted keys) so two copies with the same content compare equal. */
  function stable(x) {
    if (Array.isArray(x)) return `[${x.map(stable).join(",")}]`;
    if (isObj(x)) return `{${Object.keys(x).sort().filter((k) => x[k] !== undefined).map((k) => `${JSON.stringify(k)}:${stable(x[k])}`).join(",")}}`;
    return JSON.stringify(x);
  }
  const contentKey = (s) => stable({ recipes: s.recipes, deleted: s.deleted, links: s.links, deletedLinks: s.deletedLinks, favs: s.favs });

  async function requestPersist() {
    try {
      if (navigator.storage && navigator.storage.persist && !(await navigator.storage.persisted())) {
        await navigator.storage.persist();
      }
    } catch { /* not supported */ }
  }

  function loadSettings() {
    try { return Object.assign({ scale: 1, theme: "system", contrast: false }, JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}")); }
    catch { return { scale: 1, theme: "system", contrast: false }; }
  }
  let settings = loadSettings();
  function applySettings() {
    const r = document.documentElement;
    r.style.setProperty("--scale", settings.scale);
    if (settings.theme === "system") r.removeAttribute("data-theme"); else r.setAttribute("data-theme", settings.theme);
    if (settings.contrast) r.setAttribute("data-contrast", "high"); else r.removeAttribute("data-contrast");
    const dark = settings.contrast || settings.theme === "dark" ||
      (settings.theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
    document.querySelector('meta[name="theme-color"]').setAttribute("content", settings.contrast ? "#000000" : dark ? "#17130f" : "#a34a00");
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch { /* ignore */ }
  }

  /* ---------------- Data access ---------------- */
  /* An override with reverted:true means "back to Amma's original". */
  const override = (id) => { const o = store.recipes[id]; return o && !o.reverted ? o : null; };
  function allRecipes() {
    const out = [];
    for (const r of RECIPES) if (!store.deleted[r.id]) out.push(override(r.id) || r);
    for (const id in store.recipes) if (!BUILTIN.has(id) && !store.deleted[id] && override(id)) out.push(store.recipes[id]);
    return out;
  }
  const getRecipe = (id) => (store.deleted[id] ? null : override(id) || BUILTIN.get(id) || null);

  function allLinks() {
    const out = [];
    for (const l of LINKS) if (!store.deletedLinks[l.id]) out.push(store.links[l.id] || l);
    for (const id in store.links) if (!BUILTIN_LINKS.has(id) && !store.deletedLinks[id]) out.push(store.links[id]);
    return out;
  }
  const getLink = (id) => (store.deletedLinks[id] ? null : store.links[id] || BUILTIN_LINKS.get(id) || null);

  const isFav = (id) => !!(store.favs[id] && store.favs[id].v);
  const setFav = (id, v) => { store.favs[id] = { v, t: now() }; };

  const searchCache = new WeakMap();
  function searchText(r) {
    let s = searchCache.get(r);
    if (!s) {
      const c = CAT.get(r.cat);
      s = [r.title, c && c.name, r.sub, r.by, r.tips,
        ...(r.parts || []).flatMap((p) => [p.h, p.ing, p.steps, p.note])].join(" \n ").toLowerCase();
      searchCache.set(r, s);
    }
    return s;
  }
  function search(q) {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    const results = [];
    for (const r of allRecipes()) {
      const hay = searchText(r);
      if (!terms.every((t) => hay.includes(t))) continue;
      const title = r.title.toLowerCase();
      const score = terms.reduce((s, t) => s + (title.includes(t) ? 10 : 1), 0) + (title.startsWith(terms[0]) ? 5 : 0);
      results.push({ r, score });
    }
    return results.sort((a, b) => b.score - a.score || byTitle(a.r, b.r)).map((x) => x.r);
  }

  /* ---------------- Rendering helpers ---------------- */
  function recipeItem(r, showCat) {
    const c = CAT.get(r.cat);
    const where = showCat ? [c && c.name, r.sub].filter(Boolean).join(" › ") : "";
    const meta = [where, byLabel(r.by), r.custom ? "Added by you" : r.edited ? "Edited" : ""].filter(Boolean).join(" · ");
    return `<li><a class="item" href="#/r/${encodeURIComponent(r.id)}">
      <span class="grow"><span class="title">${isFav(r.id) ? '<span aria-label="Favourite">⭐</span> ' : ""}${esc(r.title)}</span>
      ${meta ? `<span class="meta">${esc(meta)}</span>` : ""}</span>
      <span class="chev" aria-hidden="true">›</span></a></li>`;
  }

  function setView(html, { title, back, nav, focus = true } = {}) {
    stopWake();
    $main.innerHTML = html;
    document.title = title ? `${title} – ${APP_NAME}` : APP_NAME;
    $back.hidden = !back;
    $back.dataset.parent = back || "";
    document.querySelectorAll(".bottom-nav a").forEach((a) => {
      if (a.dataset.nav === nav) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    if (quietRender) return; // background refresh after a sync: keep scroll position and focus
    window.scrollTo(0, 0);
    if (focus && !firstRender) {
      const h = $main.querySelector("h1");
      if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
    }
    firstRender = false;
  }
  let firstRender = true;
  let quietRender = false;

  /* ---------------- Views ---------------- */
  function viewHome(q) {
    const all = allRecipes();
    const counts = {};
    for (const r of all) counts[r.cat] = (counts[r.cat] || 0) + 1;
    const favs = all.filter((r) => isFav(r.id)).sort(byTitle);
    const mine = all.filter((r) => r.custom).sort((a, b) => String(b.updated || b.date).localeCompare(String(a.updated || a.date))).slice(0, 8);
    const linkCount = allLinks().length;

    const tiles = CATEGORIES.map((c) => `
      <a class="tile" href="#/c/${c.id}">
        <span class="ico" aria-hidden="true">${c.icon}</span>
        <span class="name">${esc(c.name)}</span>
        <span class="desc">${esc(c.desc)}</span>
        <span class="count">${counts[c.id] || 0} recipes</span>
      </a>`).join("");

    setView(`
      <h1 class="visually-hidden">Amma & Muddu's Recipes</h1>
      <form class="search" role="search" id="searchForm">
        <label for="q" class="visually-hidden">Search recipes</label>
        <input id="q" type="search" placeholder="Search dish or ingredient…" autocomplete="off" enterkeyhint="search" value="${esc(q)}">
        <button class="clear" type="button" id="clearSearch" aria-label="Clear search" ${q ? "" : "hidden"}>✕</button>
      </form>
      <div id="results" aria-live="polite"></div>
      <div id="homeBody">
        ${installTile()}
        <h2 class="section-title">Categories</h2>
        <div class="tiles">
          ${tiles}
          <a class="tile wide" href="#/links">
            <span class="ico" aria-hidden="true">🔗</span>
            <span><span class="name">Online Links</span><br><span class="desc">YouTube & website recipes · ${linkCount} links · needs internet</span></span>
          </a>
        </div>
        ${favs.length ? `<h2 class="section-title">⭐ Favourites</h2><ul class="list">${favs.map((r) => recipeItem(r, true)).join("")}</ul>` : ""}
        ${mine.length ? `<h2 class="section-title">Recently added by you</h2><ul class="list">${mine.map((r) => recipeItem(r, true)).join("")}</ul>` : ""}
      </div>`, { nav: "home", focus: false });

    const input = document.getElementById("q");
    const clear = document.getElementById("clearSearch");
    const run = () => {
      const v = input.value.trim();
      clear.hidden = !v;
      history.replaceState(null, "", v ? `#/?q=${encodeURIComponent(v)}` : "#/");
      renderResults(v);
    };
    input.addEventListener("input", run);
    document.getElementById("searchForm").addEventListener("submit", (e) => { e.preventDefault(); input.blur(); });
    clear.addEventListener("click", () => { input.value = ""; run(); input.focus(); });
    if (q) renderResults(q);
  }

  function renderResults(q) {
    const res = document.getElementById("results");
    const body = document.getElementById("homeBody");
    if (!q) { res.innerHTML = ""; body.hidden = false; return; }
    const found = search(q);
    body.hidden = true;
    res.innerHTML = `<h2 class="section-title">${found.length} result${found.length === 1 ? "" : "s"} for “${esc(q)}”</h2>` +
      (found.length ? `<ul class="list">${found.map((r) => recipeItem(r, true)).join("")}</ul>`
        : `<p class="empty">No recipes found. Try a shorter word, or <a href="#/add">add a new recipe</a>.</p>`);
  }

  function installTile() {
    if (!deferredInstall) return "";
    return `<button type="button" class="btn primary block" data-action="install" style="margin-bottom:1rem">📲 Install app on this phone</button>`;
  }

  function viewCategory(catId, sub) {
    const c = CAT.get(catId);
    if (!c) return viewNotFound();
    if (sub && !(c.subs || []).includes(sub)) sub = undefined;
    const recipes = allRecipes().filter((r) => r.cat === catId).sort(byTitle);
    const chips = c.subs ? `<nav class="chips" aria-label="${esc(c.name)} sections">
        <a class="chip" href="#/c/${c.id}" ${!sub ? 'aria-current="true"' : ""}>All</a>
        ${c.subs.map((s) => `<a class="chip" href="#/c/${c.id}/${encodeURIComponent(s)}" ${sub === s ? 'aria-current="true"' : ""}>${esc(s)} <span class="visually-hidden">(${recipes.filter((r) => r.sub === s).length})</span></a>`).join("")}
      </nav>` : "";

    let body;
    if (c.subs && !sub) {
      const groups = [...c.subs, ""].map((s) => {
        const items = recipes.filter((r) => (s ? r.sub === s : !c.subs.includes(r.sub)));
        if (!items.length) return "";
        return `<h2 class="section-title">${esc(s || "Other")} <span class="muted">(${items.length})</span></h2>
          <ul class="list">${items.map((r) => recipeItem(r)).join("")}</ul>`;
      });
      body = groups.join("");
    } else {
      const items = sub ? recipes.filter((r) => r.sub === sub) : recipes;
      body = items.length ? `<ul class="list">${items.map((r) => recipeItem(r)).join("")}</ul>`
        : `<p class="empty">No recipes here yet.</p>`;
    }
    const addHref = `#/add?cat=${c.id}${sub ? `&sub=${encodeURIComponent(sub)}` : ""}`;
    setView(`
      <h1><span aria-hidden="true">${c.icon}</span> ${esc(sub || c.name)}</h1>
      ${sub ? `<p class="crumbs"><a href="#/c/${c.id}">${esc(c.name)}</a></p>` : ""}
      ${chips}
      ${body || `<p class="empty">No recipes here yet.</p>`}
      <p style="margin-top:1.5rem"><a class="btn" href="${addHref}">➕ Add a recipe to ${esc(sub || c.name)}</a></p>`,
      { title: sub || c.name, back: sub ? `#/c/${c.id}` : "#/", nav: "home" });
  }

  const ticked = new Map(); // recipe id -> Set of ticked item keys (kept while app is open)

  function viewRecipe(id) {
    const r = getRecipe(id);
    if (!r) return viewNotFound("This recipe isn't here any more.");
    const c = CAT.get(r.cat);
    const t = ticked.get(id) || new Set();
    const multi = (r.parts || []).length > 1;

    const parts = (r.parts || []).map((p, i) => {
      const ing = lines(p.ing);
      const steps = lines(p.steps);
      const hid = `part-${i}`;
      return `<section class="part" ${p.h || multi ? `aria-labelledby="${hid}"` : 'aria-label="Recipe"'}>
        ${p.h || multi ? `<h2 id="${hid}">${esc(p.h || `Version ${i + 1}`)}</h2>` : ""}
        ${ing.length ? `<h3>Ingredients</h3><ul class="check-list">${ing.map((l, j) => {
          const k = `${i}-i-${j}`;
          return `<li><button type="button" data-tick="${k}" aria-pressed="${t.has(k)}"><span class="box" aria-hidden="true">${t.has(k) ? "✓" : ""}</span><span>${esc(l)}</span></button></li>`;
        }).join("")}</ul>` : ""}
        ${steps.length ? `<h3>Method</h3><ol class="check-list steps">${steps.map((l, j) => {
          const k = `${i}-s-${j}`;
          return `<li><button type="button" data-tick="${k}" aria-pressed="${t.has(k)}"><span class="num" aria-hidden="true">${j + 1}</span><span><span class="visually-hidden">Step ${j + 1}: </span>${esc(l)}</span></button></li>`;
        }).join("")}</ol>` : ""}
        ${p.note ? `<div class="tip"><h3>📝 Note</h3><p>${esc(p.note)}</p></div>` : ""}
      </section>`;
    }).join("");

    const tips = lines(r.tips);
    const fav = isFav(id);
    const canWake = "wakeLock" in navigator;
    setView(`
      <p class="crumbs"><a href="#/c/${esc(r.cat)}">${esc(c ? c.name : "Recipes")}</a>${r.sub ? ` › <a href="#/c/${esc(r.cat)}/${encodeURIComponent(r.sub)}">${esc(r.sub)}</a>` : ""}</p>
      <h1>${esc(r.title)}</h1>
      <p class="recipe-meta">${esc([byLabel(r.by), fmtDate(r.date), r.custom ? "Added by you" : r.edited ? "Edited by you" : ""].filter(Boolean).join(" · "))}</p>
      <div class="toolbar">
        <button type="button" class="btn small" data-action="fav" aria-pressed="${fav}">${fav ? "⭐ Favourite" : "☆ Favourite"}</button>
        ${canWake ? `<button type="button" class="btn small" data-action="wake" aria-pressed="false">💡 Keep screen on</button>` : ""}
        <a class="btn small" href="#/edit/${encodeURIComponent(id)}">✏️ Edit</a>
      </div>
      <p class="muted" style="font-size:.9rem">Tip: tap an ingredient or step to tick it off while you cook.</p>
      ${parts || `<p class="empty">No ingredients or steps yet. Tap Edit to add them.</p>`}
      ${tips.length ? `<div class="tip"><h2>💡 Tips</h2><ul>${tips.map((l) => `<li>${esc(l)}</li>`).join("")}</ul></div>` : ""}
      ${r.link ? `<p><a class="btn" href="${esc(r.link)}" target="_blank" rel="noopener">🔗 Open online version <span class="visually-hidden">(opens in browser, needs internet)</span></a></p>` : ""}
      <div class="toolbar" style="margin-top:2rem">
        ${t.size ? `<button type="button" class="btn small" data-action="untick">↺ Clear ticks</button>` : ""}
        ${r.edited && BUILTIN.has(id) ? `<button type="button" class="btn small" data-action="restore">↩️ Restore Amma's original</button>` : ""}
        <button type="button" class="btn small danger" data-action="delete">🗑️ Delete recipe</button>
      </div>`,
      { title: r.title, back: r.sub ? `#/c/${r.cat}/${encodeURIComponent(r.sub)}` : `#/c/${r.cat}`, nav: "home" });

    $main.onclick = async (e) => {
      const tick = e.target.closest("[data-tick]");
      if (tick) {
        const k = tick.dataset.tick;
        const set = ticked.get(id) || new Set();
        set.has(k) ? set.delete(k) : set.add(k);
        ticked.set(id, set);
        const on = set.has(k);
        tick.setAttribute("aria-pressed", on);
        const box = tick.querySelector(".box");
        if (box) box.textContent = on ? "✓" : "";
        return;
      }
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      const a = btn.dataset.action;
      if (a === "fav") {
        setFav(id, !isFav(id));
        save();
        const on = isFav(id);
        btn.setAttribute("aria-pressed", on);
        btn.textContent = on ? "⭐ Favourite" : "☆ Favourite";
        toast(on ? "Added to favourites" : "Removed from favourites");
      } else if (a === "wake") {
        if (wakeWanted) stopWake(); else await startWake();
      } else if (a === "untick") {
        ticked.delete(id);
        viewRecipe(id);
      } else if (a === "restore") {
        if (!confirm("Undo your edits and go back to Amma's original recipe?")) return;
        store.recipes[id] = { id, reverted: true, updated: now() };
        save();
        toast("Original recipe restored");
        viewRecipe(id);
      } else if (a === "delete") {
        if (!confirm(`Delete “${r.title}”? You can't undo this (unless you have a backup).`)) return;
        delete store.recipes[id];
        store.deleted[id] = now();
        if (isFav(id)) setFav(id, false);
        save();
        toast("Recipe deleted");
        location.hash = `#/c/${r.cat}`;
      }
    };
  }

  /* Keep screen on (Wake Lock) */
  let wakeLock = null;
  let wakeWanted = false;
  async function startWake() {
    try {
      wakeLock = await navigator.wakeLock.request("screen");
      wakeWanted = true;
      wakeLock.addEventListener("release", () => { wakeLock = null; });
      toast("Screen will stay on while this recipe is open");
    } catch {
      wakeWanted = false;
      toast("Couldn't keep the screen on");
    }
    updateWakeBtn();
  }
  function stopWake() {
    wakeWanted = false;
    if (wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; }
    updateWakeBtn();
  }
  function updateWakeBtn() {
    const b = $main.querySelector('[data-action="wake"]');
    if (b) b.setAttribute("aria-pressed", wakeWanted);
  }
  document.addEventListener("visibilitychange", () => {
    if (wakeWanted && document.visibilityState === "visible" && !wakeLock) {
      navigator.wakeLock.request("screen").then((l) => { wakeLock = l; }).catch(() => {});
    }
  });

  /* ---------------- Recipe form ---------------- */
  let formDirty = false;

  function versionFieldset(p, i, total) {
    const n = i + 1;
    return `<fieldset class="version" data-version>
      <legend>${total > 1 ? `Version ${n}` : "Recipe"}</legend>
      <div class="field">
        <label for="v${n}h">Version name <span class="hint">Optional – e.g. “Amma's version”, “My notes”</span></label>
        <input type="text" id="v${n}h" name="h" value="${esc(p.h)}">
      </div>
      <div class="field">
        <label for="v${n}ing">Ingredients <span class="hint">One per line</span></label>
        <textarea id="v${n}ing" name="ing" rows="6">${esc(p.ing)}</textarea>
      </div>
      <div class="field">
        <label for="v${n}steps">Method <span class="hint">One step per line – each line becomes a numbered step</span></label>
        <textarea id="v${n}steps" name="steps" rows="8">${esc(p.steps)}</textarea>
      </div>
      <div class="field">
        <label for="v${n}note">Note for this version <span class="hint">Optional</span></label>
        <textarea id="v${n}note" name="note" rows="2" style="min-height:80px">${esc(p.note)}</textarea>
      </div>
      ${total > 1 ? `<button type="button" class="btn small danger" data-action="remove-version">Remove version ${n}</button>` : ""}
    </fieldset>`;
  }

  function viewForm(id, presetCat, presetSub) {
    const existing = id ? getRecipe(id) : null;
    if (id && !existing) return viewNotFound();
    const draftKey = `${DRAFT_KEY}:${id || "new"}`;
    let draft = null;
    try { draft = JSON.parse(localStorage.getItem(draftKey) || "null"); } catch { /* ignore */ }

    const r = draft || existing || { title: "", cat: presetCat || "", sub: presetSub || "", by: "Amma", parts: [{}], tips: "", link: "" };
    const parts = r.parts && r.parts.length ? r.parts : [{}];
    const byOther = r.by && r.by !== "Amma" && r.by !== "Me";

    setView(`
      <h1>${existing ? "Edit recipe" : "Add a recipe"}</h1>
      ${draft ? `<p class="tip">You had unsaved changes – they've been restored. <button type="button" class="btn small" data-action="discard-draft">Discard them</button></p>` : ""}
      <form id="recipeForm" novalidate>
        <div class="field">
          <label for="title">Dish name <span class="hint">Required</span></label>
          <input type="text" id="title" name="title" required value="${esc(r.title)}" autocomplete="off" aria-describedby="titleErr">
          <p class="error" id="titleErr" hidden>Please enter the dish name.</p>
        </div>
        <div class="field">
          <label for="cat">Category</label>
          <select id="cat" name="cat" aria-describedby="catErr">
            <option value="">Choose a category…</option>
            ${CATEGORIES.map((c) => `<option value="${c.id}" ${r.cat === c.id ? "selected" : ""}>${esc(c.name)}</option>`).join("")}
          </select>
          <p class="error" id="catErr" hidden>Please choose a category.</p>
        </div>
        <div class="field" id="subField" hidden>
          <label for="sub">Section</label>
          <select id="sub" name="sub"></select>
        </div>
        <div class="field">
          <fieldset style="border:0;padding:0;margin:0">
            <legend>Who shared it?</legend>
            <div class="seg">
              <label><input type="radio" name="by" value="Amma" ${!byOther && r.by !== "Me" ? "checked" : ""}> Amma</label>
              <label><input type="radio" name="by" value="Me" ${r.by === "Me" ? "checked" : ""}> Me</label>
              <label><input type="radio" name="by" value="__other" ${byOther ? "checked" : ""}> Someone else</label>
            </div>
          </fieldset>
          <div id="otherWrap" ${byOther ? "" : "hidden"} style="margin-top:.5rem">
            <label for="byOther" class="visually-hidden">Name of the person</label>
            <input type="text" id="byOther" placeholder="Their name" value="${byOther ? esc(r.by) : ""}">
          </div>
        </div>
        <div id="versions">${parts.map((p, i) => versionFieldset(p, i, parts.length)).join("")}</div>
        <p class="error" id="bodyErr" hidden>Please add at least some ingredients or steps.</p>
        <button type="button" class="btn small" data-action="add-version">➕ Add another version</button>
        <div class="field" style="margin-top:1.25rem">
          <label for="tips">Tips <span class="hint">Optional – one per line</span></label>
          <textarea id="tips" name="tips" rows="3" style="min-height:90px">${esc(r.tips)}</textarea>
        </div>
        <div class="field">
          <label for="link">Online link <span class="hint">Optional – YouTube or website</span></label>
          <input type="url" id="link" name="link" inputmode="url" placeholder="https://…" value="${esc(r.link)}">
        </div>
        <div class="form-actions">
          <button type="submit" class="btn primary">💾 Save recipe</button>
          <a class="btn" href="${existing ? `#/r/${encodeURIComponent(id)}` : "#/"}" data-action="cancel">Cancel</a>
        </div>
      </form>`,
      { title: existing ? "Edit recipe" : "Add a recipe", back: existing ? `#/r/${encodeURIComponent(id)}` : "#/", nav: existing ? "home" : "add" });

    formDirty = !!draft;
    const form = document.getElementById("recipeForm");
    const catSel = document.getElementById("cat");
    const subSel = document.getElementById("sub");
    const subField = document.getElementById("subField");
    const versions = document.getElementById("versions");

    const fillSubs = (keep) => {
      const c = CAT.get(catSel.value);
      if (c && c.subs) {
        subSel.innerHTML = c.subs.map((s) => `<option ${keep === s ? "selected" : ""}>${esc(s)}</option>`).join("");
        subField.hidden = false;
      } else {
        subSel.innerHTML = "";
        subField.hidden = true;
      }
    };
    fillSubs(r.sub);
    catSel.addEventListener("change", () => fillSubs());

    form.addEventListener("change", (e) => {
      if (e.target.name === "by") document.getElementById("otherWrap").hidden = e.target.value !== "__other";
    });

    const collectParts = () => [...versions.querySelectorAll("[data-version]")].map((fs) => {
      const g = (n) => fs.querySelector(`[name="${n}"]`).value.trim();
      const p = { h: g("h"), ing: g("ing"), steps: g("steps"), note: g("note") };
      Object.keys(p).forEach((k) => { if (!p[k]) delete p[k]; });
      return p;
    });
    const collect = () => {
      const byVal = form.querySelector('[name="by"]:checked')?.value || "Amma";
      return {
        title: document.getElementById("title").value.trim(),
        cat: catSel.value,
        sub: subField.hidden ? "" : subSel.value,
        by: byVal === "__other" ? (document.getElementById("byOther").value.trim() || "Someone else") : byVal,
        parts: collectParts(),
        tips: document.getElementById("tips").value.trim(),
        link: document.getElementById("link").value.trim(),
      };
    };
    const renumber = (focusLast) => {
      const ps = collectParts();
      if (!ps.length) ps.push({});
      versions.innerHTML = ps.map((p, i) => versionFieldset(p, i, ps.length)).join("");
      if (focusLast) versions.querySelector("[data-version]:last-child input")?.focus();
    };

    const saveDraft = () => {
      formDirty = true;
      try { localStorage.setItem(draftKey, JSON.stringify(collect())); } catch { /* ignore */ }
    };
    form.addEventListener("input", saveDraft);
    form.addEventListener("change", saveDraft);

    $main.onclick = (e) => {
      const b = e.target.closest("[data-action]");
      if (!b) return;
      const a = b.dataset.action;
      if (a === "add-version") {
        const ps = collectParts();
        ps.push({});
        versions.innerHTML = ps.map((p, i) => versionFieldset(p, i, ps.length)).join("");
        versions.querySelector("[data-version]:last-child input").focus();
        saveDraft();
      } else if (a === "remove-version") {
        b.closest("[data-version]").remove();
        renumber(false);
        saveDraft();
        toast("Version removed");
      } else if (a === "discard-draft") {
        localStorage.removeItem(draftKey);
        formDirty = false;
        viewForm(id, presetCat, presetSub);
      } else if (a === "cancel") {
        localStorage.removeItem(draftKey);
        formDirty = false;
      }
    };

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const d = collect();
      d.parts = d.parts.filter((p) => p.ing || p.steps || p.note);
      const errs = {
        titleErr: !d.title,
        catErr: !d.cat,
        bodyErr: !d.parts.length,
      };
      let first = null;
      for (const [k, bad] of Object.entries(errs)) {
        document.getElementById(k).hidden = !bad;
        if (bad && !first) first = k;
      }
      document.getElementById("title").setAttribute("aria-invalid", errs.titleErr);
      catSel.setAttribute("aria-invalid", errs.catErr);
      if (first) {
        const target = first === "titleErr" ? document.getElementById("title") : first === "catErr" ? catSel : versions.querySelector("textarea");
        target.focus();
        toast("Please fix the highlighted fields");
        return;
      }
      if (d.link && !/^https?:\/\//i.test(d.link)) d.link = "https://" + d.link;

      const newId = id || `${slug(d.title)}-${Date.now().toString(36)}`;
      const rec = Object.assign({}, d, {
        id: newId,
        date: existing ? existing.date : today(),
        updated: new Date().toISOString(),
      });
      if (!rec.sub) delete rec.sub;
      if (!rec.tips) delete rec.tips;
      if (!rec.link) delete rec.link;
      if (BUILTIN.has(newId)) rec.edited = true; else rec.custom = true;
      store.recipes[newId] = rec;
      delete store.deleted[newId];
      if (save()) {
        localStorage.removeItem(draftKey);
        formDirty = false;
        toast(`${existing ? "Recipe updated" : "Recipe saved"}${Sync.connected() ? (navigator.onLine ? " – syncing to cloud" : " – will sync when online") : " on this phone"}`);
        location.hash = `#/r/${encodeURIComponent(newId)}`;
      }
    });
  }

  /* ---------------- Links ---------------- */
  function viewLinks() {
    const links = allLinks().sort((a, b) => String(b.date).localeCompare(String(a.date)));
    const yt = links.filter((l) => isYouTube(l.url));
    const web = links.filter((l) => !isYouTube(l.url));
    const row = (l) => `<li class="row">
        <a class="grow link-main" href="${esc(l.url)}" target="_blank" rel="noopener">
          <span><span class="title">${esc(l.title)}</span>
          <span class="meta">${esc([domainOf(l.url), byLabel(l.by), fmtDate(l.date)].filter(Boolean).join(" · "))}</span>
          ${l.note ? `<span class="meta">📝 ${esc(l.note)}</span>` : ""}
          <span class="visually-hidden">(opens in browser)</span></span>
        </a>
        <a class="btn small" href="#/edit-link/${encodeURIComponent(l.id)}" aria-label="Edit ${esc(l.title)}">Edit</a>
      </li>`;
    setView(`
      <h1><span aria-hidden="true">🔗</span> Online Links</h1>
      <p class="muted">YouTube videos and website recipes from the chat. <strong>These need internet</strong> to open.</p>
      <p><a class="btn primary" href="#/add-link">➕ Add a link</a></p>
      ${yt.length ? `<h2 class="section-title">▶️ YouTube (${yt.length})</h2><ul class="list">${yt.map(row).join("")}</ul>` : ""}
      ${web.length ? `<h2 class="section-title">🌐 Websites (${web.length})</h2><ul class="list">${web.map(row).join("")}</ul>` : ""}
      ${!links.length ? `<p class="empty">No links yet.</p>` : ""}`,
      { title: "Online Links", back: "#/", nav: "links" });
  }

  function viewLinkForm(id) {
    const existing = id ? getLink(id) : null;
    if (id && !existing) return viewNotFound();
    const l = existing || { title: "", url: "", note: "", by: "Amma" };
    setView(`
      <h1>${existing ? "Edit link" : "Add a link"}</h1>
      <form id="linkForm" novalidate>
        <div class="field">
          <label for="lurl">Link <span class="hint">Paste the YouTube or website address</span></label>
          <input type="url" id="lurl" inputmode="url" placeholder="https://…" value="${esc(l.url)}" aria-describedby="urlErr">
          <p class="error" id="urlErr" hidden>Please paste a link.</p>
        </div>
        <div class="field">
          <label for="ltitle">Name <span class="hint">What dish is it?</span></label>
          <input type="text" id="ltitle" value="${esc(l.title)}" aria-describedby="ltitleErr">
          <p class="error" id="ltitleErr" hidden>Please give it a name.</p>
        </div>
        <div class="field">
          <fieldset style="border:0;padding:0;margin:0">
            <legend>Who shared it?</legend>
            <div class="seg">
              <label><input type="radio" name="lby" value="Amma" ${l.by !== "Me" ? "checked" : ""}> Amma</label>
              <label><input type="radio" name="lby" value="Me" ${l.by === "Me" ? "checked" : ""}> Me</label>
            </div>
          </fieldset>
        </div>
        <div class="field">
          <label for="lnote">Note <span class="hint">Optional</span></label>
          <textarea id="lnote" rows="2" style="min-height:80px">${esc(l.note)}</textarea>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn primary">💾 Save link</button>
          <a class="btn" href="#/links">Cancel</a>
          ${existing ? `<button type="button" class="btn danger" data-action="delete-link">🗑️ Delete</button>` : ""}
        </div>
      </form>`,
      { title: existing ? "Edit link" : "Add a link", back: "#/links", nav: "links" });

    const form = document.getElementById("linkForm");
    $main.onclick = (e) => {
      if (!e.target.closest('[data-action="delete-link"]')) return;
      if (!confirm(`Delete the link “${l.title}”?`)) return;
      delete store.links[id];
      store.deletedLinks[id] = now();
      save();
      toast("Link deleted");
      location.hash = "#/links";
    };
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let url = document.getElementById("lurl").value.trim();
      const title = document.getElementById("ltitle").value.trim();
      document.getElementById("urlErr").hidden = !!url;
      document.getElementById("ltitleErr").hidden = !!title;
      if (!url) return document.getElementById("lurl").focus();
      if (!title) return document.getElementById("ltitle").focus();
      if (!/^https?:\/\//i.test(url)) url = "https://" + url;
      const newId = id || `l-${Date.now().toString(36)}`;
      const rec = {
        id: newId, title, url,
        by: form.querySelector('[name="lby"]:checked').value,
        date: existing ? existing.date : today(),
        note: document.getElementById("lnote").value.trim() || undefined,
        updated: new Date().toISOString(),
      };
      if (!BUILTIN_LINKS.has(newId)) rec.custom = true;
      store.links[newId] = rec;
      delete store.deletedLinks[newId];
      if (save()) { toast("Link saved"); location.hash = "#/links"; }
    });
  }

  /* ---------------- Settings & backup ---------------- */
  async function viewSettings() {
    const changed = Object.values(store.recipes).filter((r) => !r.reverted).length;
    const added = Object.values(store.recipes).filter((r) => r.custom).length;
    const linkChanges = Object.keys(store.links).length;
    const sizes = [[1, "Normal"], [1.15, "Large"], [1.3, "Larger"], [1.5, "Largest"]];
    const canShareFiles = !!(navigator.canShare && window.File && navigator.canShare({ files: [new File(["x"], "x.json", { type: "application/json" })] }));
    const standalone = matchMedia("(display-mode: standalone)").matches;

    setView(`
      <h1>Settings</h1>

      <section class="card" aria-labelledby="dispH">
        <h2 id="dispH">Display</h2>
        <fieldset class="field" style="border:0;padding:0">
          <legend>Text size</legend>
          <div class="seg">${sizes.map(([v, n]) => `<label><input type="radio" name="scale" value="${v}" ${Number(settings.scale) === v ? "checked" : ""}> ${n}</label>`).join("")}</div>
        </fieldset>
        <fieldset class="field" style="border:0;padding:0">
          <legend>Theme</legend>
          <div class="seg">${[["system", "Same as phone"], ["light", "Light"], ["dark", "Dark"]].map(([v, n]) => `<label><input type="radio" name="theme" value="${v}" ${settings.theme === v ? "checked" : ""}> ${n}</label>`).join("")}</div>
        </fieldset>
        <div class="switch-row">
          <label for="contrast"><strong>High contrast</strong><br><span class="muted">Black background, bright yellow highlights</span></label>
          <input type="checkbox" id="contrast" ${settings.contrast ? "checked" : ""}>
        </div>
      </section>

      ${Sync.cardHtml()}

      <section class="card" aria-labelledby="bkH">
        <h2 id="bkH">Backup file</h2>
        ${Sync.connected()
          ? `<p>Cloud sync is on, so you don't need this – but a backup file is a handy extra copy.</p>`
          : `<p>Without cloud sync, recipes you add or edit are saved <strong>only on this phone</strong>. Make a backup now and then (for example to WhatsApp or Drive).</p>`}
        <p class="muted">You have added ${added} recipe${added === 1 ? "" : "s"}, edited ${changed - added}, and changed ${linkChanges} link${linkChanges === 1 ? "" : "s"}.${store.updatedAt ? ` Last change: ${fmtDate(store.updatedAt)}.` : ""}</p>
        <div class="form-actions" style="margin-top:.5rem">
          ${canShareFiles ? `<button type="button" class="btn primary" data-action="share-backup">📤 Share backup</button>` : ""}
          <button type="button" class="btn ${canShareFiles ? "" : "primary"}" data-action="download-backup">⬇️ Download backup</button>
          <label class="btn" for="restoreFile" style="cursor:pointer">📂 Restore from backup</label>
          <input type="file" id="restoreFile" accept=".json,application/json" class="visually-hidden">
        </div>
      </section>

      <section class="card" aria-labelledby="appH">
        <h2 id="appH">App</h2>
        ${deferredInstall ? `<p><button type="button" class="btn primary" data-action="install">📲 Install app on this phone</button></p>` : ""}
        <p>${standalone ? "✅ Installed – works without internet." : "To install: open the Chrome menu <strong>⋮</strong> and tap <strong>Add to Home screen</strong> or <strong>Install app</strong>."}</p>
        <p id="offlineState" class="muted">Checking offline readiness…</p>
        <p id="persistState" class="muted"></p>
        <p class="muted">${RECIPES.length} recipes and ${LINKS.length} links from the chat · version ${APP_VERSION}</p>
      </section>`,
      { title: "Settings", back: "#/", nav: "settings" });

    $main.addEventListener("change", onSettingsChange);
    $main.onclick = async (e) => {
      const b = e.target.closest("[data-action]");
      if (!b) return;
      if (b.dataset.action === "download-backup") downloadBackup();
      if (b.dataset.action === "share-backup") shareBackup();
      if (b.dataset.action === "install") runInstall();
      if (b.dataset.action === "sync-connect") {
        const input = document.getElementById("syncToken");
        const err = document.getElementById("syncTokenErr");
        const token = input.value.trim();
        if (!token) { err.textContent = "Please paste the key first."; err.hidden = false; input.focus(); return; }
        err.hidden = true;
        b.disabled = true;
        b.textContent = "Connecting…";
        const msg = await Sync.connect(token);
        if (msg) {
          b.disabled = false;
          b.textContent = "Turn on cloud sync";
          err.textContent = msg;
          err.hidden = false;
          input.focus();
        } else {
          toast("Cloud sync is on ✓");
          viewSettings();
        }
      }
      if (b.dataset.action === "sync-now") Sync.run(true);
      if (b.dataset.action === "sync-off") {
        if (!confirm("Turn off cloud sync on this phone? Your recipes stay on the phone and in GitHub; new changes just won't upload.")) return;
        Sync.disconnect();
        viewSettings();
      }
    };

    // Offline / storage status
    const off = document.getElementById("offlineState");
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then(() => { off.textContent = "✅ Ready to use offline – all recipes are saved on this phone."; });
      setTimeout(() => { if (off.textContent.startsWith("Checking")) off.textContent = "⏳ Offline mode is still setting up. Open the app once with internet."; }, 4000);
    } else {
      off.textContent = "This browser can't work offline. Please use Chrome.";
    }
    try {
      if (navigator.storage && navigator.storage.persisted) {
        const p = await navigator.storage.persisted();
        document.getElementById("persistState").textContent = p
          ? "🔒 Storage is protected – Android won't clear your recipes to free space."
          : "Storage protection turns on after you install the app and save a recipe.";
      }
    } catch { /* ignore */ }
  }

  function onSettingsChange(e) {
    const t = e.target;
    if (!$main.querySelector("#contrast")) { $main.removeEventListener("change", onSettingsChange); return; }
    if (t.name === "scale") settings.scale = Number(t.value);
    else if (t.name === "theme") settings.theme = t.value;
    else if (t.id === "contrast") settings.contrast = t.checked;
    else if (t.id === "restoreFile") { restoreBackup(t.files[0]); t.value = ""; return; }
    else return;
    applySettings();
    toast("Saved");
  }

  function backupBlob() {
    const data = { app: "amma-recipes", version: APP_VERSION, exportedAt: new Date().toISOString(), data: store };
    return new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  }
  const backupName = () => `amma-recipes-backup-${today()}.json`;

  function downloadBackup() {
    const url = URL.createObjectURL(backupBlob());
    const a = document.createElement("a");
    a.href = url;
    a.download = backupName();
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    toast("Backup saved to Downloads");
  }
  async function shareBackup() {
    const file = new File([backupBlob()], backupName(), { type: "application/json" });
    try {
      await navigator.share({ files: [file], title: "Amma's Recipes backup" });
    } catch (e) {
      if (e && e.name !== "AbortError") downloadBackup();
    }
  }
  function restoreBackup(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      let incoming;
      try {
        const parsed = JSON.parse(reader.result);
        incoming = normalize(parsed && parsed.app === "amma-recipes" ? parsed.data : parsed);
      } catch {
        return toast("That file isn't a recipe backup");
      }
      const n = Object.keys(incoming.recipes).length;
      const ln = Object.keys(incoming.links).length;
      if (!confirm(`Restore ${n} recipe${n === 1 ? "" : "s"} and ${ln} link${ln === 1 ? "" : "s"} from this backup?\n\nThey will be merged with what's on this phone. If the same recipe is in both, the newer version is kept.`)) return;
      store = mergeStores(store, incoming);
      if (save()) { toast("Backup restored"); viewSettings(); }
    };
    reader.readAsText(file);
  }

  function viewNotFound(msg) {
    setView(`<h1>Not found</h1><p class="empty">${esc(msg || "This page doesn't exist.")}</p><p><a class="btn" href="#/">Go home</a></p>`,
      { title: "Not found", back: "#/", nav: "" });
  }

  /* ---------------- Router ---------------- */
  let lastHash = location.hash;
  let ignoreHash = false;

  function route() {
    $main.onclick = null;
    const h = location.hash.replace(/^#\/?/, "");
    const [path, qs] = h.split("?");
    const parts = path.split("/").filter(Boolean).map((p) => { try { return decodeURIComponent(p); } catch { return p; } });
    const q = new URLSearchParams(qs || "");
    const [a, b, c] = parts;
    switch (a) {
      case undefined: return viewHome(q.get("q") || "");
      case "c": return viewCategory(b, c);
      case "r": return viewRecipe(b);
      case "add": return viewForm(null, q.get("cat"), q.get("sub"));
      case "edit": return viewForm(b);
      case "links": return viewLinks();
      case "add-link": return viewLinkForm(null);
      case "edit-link": return viewLinkForm(b);
      case "settings": return viewSettings();
      default: return viewNotFound();
    }
  }

  window.addEventListener("hashchange", () => {
    if (ignoreHash) { ignoreHash = false; return; }
    if (formDirty) {
      if (!confirm("Leave without saving? Your changes are kept as a draft and will come back next time you open this form.")) {
        ignoreHash = true;
        location.hash = lastHash;
        return;
      }
      formDirty = false;
    }
    lastHash = location.hash;
    route();
  });

  $back.addEventListener("click", () => {
    location.hash = $back.dataset.parent || "#/";
  });

  /* ---------------- Cloud sync (GitHub) ----------------
     Your added/edited recipes, links, deletions and favourites are kept in
     my-recipes.json on the "recipes-data" branch of the GitHub repo (so the website
     itself isn't rebuilt on every change). Every change is saved on the phone first and
     uploaded when there is internet. Phone and cloud copies are merged: newest change wins. */
  const Sync = (() => {
    const KEY = "amma-recipes-sync";
    const OWNER = "ShravyaSanu", REPO = "amma-recipes", BRANCH = "recipes-data", PATH = "my-recipes.json";
    const API = `https://api.github.com/repos/${OWNER}/${REPO}`;
    const FILE_URL = `https://github.com/${OWNER}/${REPO}/blob/${BRANCH}/${PATH}`;
    const TOKEN_URL = `https://github.com/settings/personal-access-tokens/new?name=${encodeURIComponent("Recipe app")}` +
      `&description=${encodeURIComponent("Cloud sync for Amma's Recipes")}&target_name=${OWNER}&expires_in=366&contents=write`;

    const blank = () => ({ token: "", pending: false, lastSync: null, error: "", errorKind: "" });
    let cfg = (() => { try { return Object.assign(blank(), JSON.parse(localStorage.getItem(KEY) || "{}")); } catch { return blank(); } })();
    let busy = false, again = false, timer = null, retryTimer = null, changeSeq = 0;

    const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch { /* ignore */ } };
    const connected = () => !!cfg.token;

    class SyncError extends Error { constructor(msg, kind) { super(msg); this.kind = kind; } }

    const b64encode = (str) => {
      const bytes = new TextEncoder().encode(str);
      let bin = "";
      for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
      return btoa(bin);
    };
    const b64decode = (b64) => {
      const bin = atob(b64.replace(/\s/g, ""));
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return new TextDecoder().decode(bytes);
    };

    async function api(path, opts = {}) {
      let res;
      try {
        res = await fetch(`${API}${path}`, {
          method: opts.method || "GET",
          body: opts.body,
          cache: "no-store",
          headers: Object.assign({
            Authorization: `Bearer ${cfg.token}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
          }, opts.headers || {}),
        });
      } catch {
        throw new SyncError("No internet right now – will sync later.", "network");
      }
      if (res.status === 401) throw new SyncError("The GitHub key has expired or is wrong.", "auth");
      if (res.status === 403 || res.status === 429) {
        if (res.headers.get("x-ratelimit-remaining") === "0" || res.status === 429) throw new SyncError("GitHub is busy – will try again soon.", "network");
        throw new SyncError("This GitHub key isn't allowed to change the amma-recipes repository. Make a new key with Contents: Read and write.", "auth");
      }
      return res;
    }

    async function createBranch() {
      const m = await api("/git/ref/heads/main");
      if (!m.ok) throw new SyncError(`Couldn't reach the repository (error ${m.status}).`, m.status === 404 ? "auth" : "network");
      const sha = (await m.json()).object.sha;
      const r = await api("/git/refs", { method: "POST", body: JSON.stringify({ ref: `refs/heads/${BRANCH}`, sha }) });
      if (!r.ok && r.status !== 422) throw new SyncError(`Couldn't set up cloud storage (error ${r.status}).`, "network");
    }

    async function readRemote() {
      const res = await api(`/contents/${PATH}?ref=${BRANCH}`);
      if (res.status === 404) {
        const b = await api(`/branches/${BRANCH}`);
        if (b.status === 404) await createBranch();
        return { data: normalize({}), sha: null };
      }
      if (!res.ok) throw new SyncError(`GitHub error ${res.status} – will try again.`, "network");
      const j = await res.json();
      let text;
      if (j.content && j.encoding === "base64") text = b64decode(j.content);
      else text = await (await api(`/contents/${PATH}?ref=${BRANCH}`, { headers: { Accept: "application/vnd.github.raw+json" } })).text();
      let parsed;
      try { parsed = JSON.parse(text); } catch { throw new SyncError("The cloud copy can't be read, so it was left untouched. Your recipes are safe on this phone.", "data"); }
      return { data: normalize(parsed && parsed.app === "amma-recipes" ? parsed.data : parsed), sha: j.sha };
    }

    async function writeRemote(data, sha) {
      const file = JSON.stringify({ app: "amma-recipes", version: APP_VERSION, savedAt: now(), data }, null, 1);
      const body = { message: `Recipes updated from phone – ${new Date().toLocaleString("en-GB")}`, content: b64encode(file), branch: BRANCH };
      if (sha) body.sha = sha;
      const res = await api(`/contents/${PATH}`, { method: "PUT", body: JSON.stringify(body) });
      if (res.status === 409 || res.status === 422) return false; // cloud copy changed meanwhile – read again and retry
      if (!res.ok) throw new SyncError(`GitHub error ${res.status} while saving – will try again.`, "network");
      return true;
    }

    async function run(manual) {
      if (!connected()) return;
      if (!navigator.onLine) { render(); if (manual) toast("You're offline – changes will sync when you're back online"); return; }
      if (busy) { again = true; return; }
      busy = true;
      clearTimeout(retryTimer);
      const seq = changeSeq;
      let pulled = false;
      render(true);
      try {
        const empty = contentKey(normalize({}));
        let done = false;
        for (let attempt = 0; attempt < 3 && !done; attempt++) {
          const remote = await readRemote();
          const merged = mergeStores(store, remote.data);
          if (contentKey(merged) !== contentKey(store)) { store = merged; writeLocal(); pulled = true; }
          const mk = contentKey(merged);
          if (remote.sha ? mk === contentKey(remote.data) : mk === empty) { done = true; break; }
          done = await writeRemote(merged, remote.sha);
        }
        if (!done) throw new SyncError("Couldn't save to GitHub – will try again.", "network");
        cfg.lastSync = now();
        cfg.error = ""; cfg.errorKind = "";
        if (changeSeq === seq) cfg.pending = false;
        if (manual) toast("All recipes are saved in the cloud ✓");
      } catch (e) {
        cfg.error = e.message || "Sync failed – will try again.";
        cfg.errorKind = e.kind || "network";
        if (cfg.errorKind === "auth") cfg.token = ""; // key no longer works – show the "add key" box again
        if (cfg.errorKind === "network") retryTimer = setTimeout(() => run(), 2 * 60 * 1000);
        if (manual || cfg.errorKind !== "network") toast(cfg.error);
      } finally {
        busy = false;
        persist();
        render();
        if (pulled) refreshView();
        if (again) { again = false; schedule(500); }
      }
    }

    function schedule(ms) { clearTimeout(timer); timer = setTimeout(() => run(), ms); }

    function changed() {
      changeSeq++;
      if (!connected()) return;
      cfg.pending = true;
      persist();
      render();
      schedule(1500);
    }

    async function connect(token) {
      cfg.token = token;
      cfg.pending = true;
      cfg.error = ""; cfg.errorKind = "";
      if (!navigator.onLine) { cfg.token = ""; return "You need internet to turn on cloud sync."; }
      try {
        const r = await api("");
        if (r.status === 404) throw new SyncError("This key can't see the amma-recipes repository. Under “Repository access” choose amma-recipes.", "auth");
        if (!r.ok) throw new SyncError(`GitHub error ${r.status}. Please try again.`, "network");
      } catch (e) {
        cfg.token = "";
        persist();
        return e.message;
      }
      persist();
      await run();
      if (cfg.errorKind === "auth" || cfg.errorKind === "data") {
        const msg = cfg.error;
        if (cfg.errorKind === "auth") { cfg.token = ""; persist(); }
        return msg;
      }
      return "";
    }

    function disconnect() {
      cfg = Object.assign(blank(), { lastSync: cfg.lastSync });
      persist();
      render();
    }

    /* Header pill + settings status text */
    function pillText(syncing) {
      const off = !navigator.onLine;
      if (!connected()) return cfg.errorKind === "auth" ? "⚠️ Sync stopped" : off ? "Offline" : "";
      if (syncing) return "☁️ Syncing…";
      if (cfg.errorKind === "auth" || cfg.errorKind === "data") return "⚠️ Sync stopped";
      if (cfg.pending) return off ? "Offline · will sync" : "☁️ Waiting to sync";
      return off ? "Offline · ✓ synced" : "☁️ Synced";
    }
    function statusText(syncing) {
      if (syncing) return "☁️ Syncing with GitHub…";
      if (cfg.errorKind === "auth" || cfg.errorKind === "data") return `⚠️ ${cfg.error}`;
      if (cfg.pending) {
        return navigator.onLine
          ? `⏳ Changes waiting to upload.${cfg.error ? ` ${cfg.error}` : ""}`
          : "⏳ You're offline. Your changes are safe on this phone and will upload when you're back online.";
      }
      return cfg.lastSync ? `✅ Everything is saved in the cloud. Last synced ${fmtDateTime(cfg.lastSync)}.` : "✅ Connected.";
    }
    function render(syncing) {
      const t = pillText(syncing);
      $net.textContent = t;
      $net.hidden = !t;
      $net.setAttribute("aria-label", t ? `${t}. Open cloud sync settings` : "");
      const s = document.getElementById("syncStatus");
      if (s) s.textContent = statusText(syncing);
    }

    function cardHtml() {
      if (!connected()) {
        return `<section class="card" aria-labelledby="syncH">
          <h2 id="syncH">☁️ Cloud sync</h2>
          ${cfg.errorKind === "auth" ? `<p class="error" role="alert">⚠️ Cloud sync stopped: ${esc(cfg.error)} Your recipes are safe on this phone – follow the steps below to make a new key.</p>` : ""}
          <p>Turn this on once, and every recipe you add, edit or delete is saved to your GitHub repository automatically. Changes made offline upload the next time you have internet.</p>
          <h3>One-time setup</h3>
          <ol class="steps-plain">
            <li>Tap <a href="${TOKEN_URL}" target="_blank" rel="noopener"><strong>Create a GitHub key</strong></a> and sign in to GitHub if asked.</li>
            <li><strong>Token name:</strong> Recipe app. <strong>Expiration:</strong> pick the longest offered.</li>
            <li><strong>Repository access:</strong> “Only select repositories” → <strong>amma-recipes</strong>.</li>
            <li><strong>Permissions:</strong> Add permission → <strong>Contents</strong> → <strong>Read and write</strong>.</li>
            <li>Tap <strong>Generate token</strong>, then <strong>copy</strong> the key (starts with <code>github_pat_</code>).</li>
            <li>Come back here, paste it below and tap <strong>Turn on cloud sync</strong>.</li>
          </ol>
          <div class="field">
            <label for="syncToken">GitHub key</label>
            <input type="password" id="syncToken" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="github_pat_…" aria-describedby="syncTokenErr syncTokenHint">
            <span class="hint" id="syncTokenHint">The key is kept only on this phone.</span>
            <p class="error" id="syncTokenErr" role="alert" hidden></p>
          </div>
          <button type="button" class="btn primary" data-action="sync-connect">Turn on cloud sync</button>
        </section>`;
      }
      return `<section class="card" aria-labelledby="syncH">
        <h2 id="syncH">☁️ Cloud sync is on</h2>
        <p id="syncStatus" role="status">${esc(statusText(busy))}</p>
        <p class="muted">Every change uploads automatically to
          <a href="${FILE_URL}" target="_blank" rel="noopener">my-recipes.json</a> in your GitHub repository.
          On a new phone: install the app, turn on cloud sync with a key, and all your recipes come back.</p>
        <div class="form-actions" style="margin-top:.5rem">
          <button type="button" class="btn primary" data-action="sync-now">🔄 Sync now</button>
          <button type="button" class="btn small danger" data-action="sync-off">Turn off on this phone</button>
        </div>
      </section>`;
    }

    // Sync when the app opens, comes back to the screen, or gets internet back.
    window.addEventListener("online", () => { render(); if (connected()) run(); });
    window.addEventListener("offline", () => render());
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState !== "visible" || !connected()) return;
      if (cfg.pending || !cfg.lastSync || Date.now() - tsOf(cfg.lastSync) > 2 * 60 * 1000) run();
    });

    return { run, changed, connect, disconnect, connected, cardHtml, render };
  })();

  /* Re-draw the current page after the cloud brought in changes (not while typing in a form). */
  function refreshView() {
    if (formDirty || /^#\/(add|edit)/.test(location.hash)) return;
    quietRender = true;
    try { route(); } finally { quietRender = false; }
    toast("Recipes updated from the cloud");
  }

  /* ---------------- Install & offline ---------------- */
  let deferredInstall = null;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredInstall = e;
    if (!location.hash || location.hash === "#/") route();
  });
  window.addEventListener("appinstalled", () => { deferredInstall = null; toast("Installed! Find “Amma's Recipes” on your home screen."); });
  async function runInstall() {
    if (!deferredInstall) return;
    deferredInstall.prompt();
    await deferredInstall.userChoice.catch(() => {});
    deferredInstall = null;
    route();
  }

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").then((reg) => {
        reg.addEventListener("updatefound", () => {
          const nw = reg.installing;
          nw && nw.addEventListener("statechange", () => {
            if (nw.state === "installed" && navigator.serviceWorker.controller) {
              toast("A new version of the app is ready", { label: "Refresh", run: () => location.reload() });
            }
          });
        });
      }).catch(() => {});
    });
  }

  /* ---------------- Start ---------------- */
  applySettings();
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applySettings);
  Sync.render();
  route();
  if (Sync.connected()) setTimeout(() => Sync.run(), 800);
})();
