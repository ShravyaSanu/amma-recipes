/* Amma's Recipes – offline recipe book.
   Built-in recipes come from recipes.js. Anything you add or edit is saved on this phone
   (localStorage) and can be backed up from Settings. */
(() => {
  "use strict";

  const APP_VERSION = "1.0.0";
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

  /* ---------------- Storage ---------------- */
  function normalize(d) {
    d = d && typeof d === "object" ? d : {};
    return {
      v: 1,
      recipes: d.recipes && typeof d.recipes === "object" ? d.recipes : {},
      deleted: Array.isArray(d.deleted) ? d.deleted : [],
      links: d.links && typeof d.links === "object" ? d.links : {},
      deletedLinks: Array.isArray(d.deletedLinks) ? d.deletedLinks : [],
      favs: Array.isArray(d.favs) ? d.favs : [],
      updatedAt: d.updatedAt || null,
    };
  }
  function loadStore() {
    try { return normalize(JSON.parse(localStorage.getItem(STORE_KEY))); } catch { return normalize({}); }
  }
  let store = loadStore();

  function save() {
    store.updatedAt = new Date().toISOString();
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(store));
    } catch (e) {
      toast("Couldn't save on this phone. Please download a backup from Settings.");
      return false;
    }
    requestPersist();
    return true;
  }

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
  function allRecipes() {
    const del = new Set(store.deleted);
    const out = [];
    for (const r of RECIPES) if (!del.has(r.id)) out.push(store.recipes[r.id] || r);
    for (const id in store.recipes) if (!BUILTIN.has(id) && !del.has(id)) out.push(store.recipes[id]);
    return out;
  }
  const getRecipe = (id) => (store.deleted.includes(id) ? null : store.recipes[id] || BUILTIN.get(id) || null);

  function allLinks() {
    const del = new Set(store.deletedLinks);
    const out = [];
    for (const l of LINKS) if (!del.has(l.id)) out.push(store.links[l.id] || l);
    for (const id in store.links) if (!BUILTIN_LINKS.has(id) && !del.has(id)) out.push(store.links[id]);
    return out;
  }
  const getLink = (id) => (store.deletedLinks.includes(id) ? null : store.links[id] || BUILTIN_LINKS.get(id) || null);

  const isFav = (id) => store.favs.includes(id);

  function searchText(r) {
    if (!r._s) {
      const c = CAT.get(r.cat);
      r._s = [r.title, c && c.name, r.sub, r.by, r.tips,
        ...(r.parts || []).flatMap((p) => [p.h, p.ing, p.steps, p.note])].join(" \n ").toLowerCase();
    }
    return r._s;
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
    window.scrollTo(0, 0);
    if (focus && !firstRender) {
      const h = $main.querySelector("h1");
      if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
    }
    firstRender = false;
  }
  let firstRender = true;

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
        store.favs = isFav(id) ? store.favs.filter((x) => x !== id) : [...store.favs, id];
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
        delete store.recipes[id];
        save();
        toast("Original recipe restored");
        viewRecipe(id);
      } else if (a === "delete") {
        if (!confirm(`Delete “${r.title}”? You can't undo this (unless you have a backup).`)) return;
        delete store.recipes[id];
        if (BUILTIN.has(id)) store.deleted.push(id);
        store.favs = store.favs.filter((x) => x !== id);
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
      if (save()) {
        localStorage.removeItem(draftKey);
        formDirty = false;
        toast(existing ? "Recipe updated" : "Recipe saved on this phone");
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
      if (BUILTIN_LINKS.has(id)) store.deletedLinks.push(id);
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
      if (save()) { toast("Link saved"); location.hash = "#/links"; }
    });
  }

  /* ---------------- Settings & backup ---------------- */
  async function viewSettings() {
    const changed = Object.keys(store.recipes).length;
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

      <section class="card" aria-labelledby="bkH">
        <h2 id="bkH">Backup your recipes</h2>
        <p>Recipes you add or edit are saved <strong>only on this phone</strong>. Make a backup now and then (for example to WhatsApp, Drive or OneDrive), so nothing is lost if you change phones.</p>
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
      if (!confirm(`Restore ${n} recipe${n === 1 ? "" : "s"} and ${ln} link${ln === 1 ? "" : "s"} from this backup?\n\nThey will be merged with what's on this phone. If the same recipe is in both, the backup version is kept.`)) return;
      Object.assign(store.recipes, incoming.recipes);
      Object.assign(store.links, incoming.links);
      store.deleted = [...new Set([...store.deleted, ...incoming.deleted])].filter((id) => !incoming.recipes[id]);
      store.deletedLinks = [...new Set([...store.deletedLinks, ...incoming.deletedLinks])].filter((id) => !incoming.links[id]);
      store.favs = [...new Set([...store.favs, ...incoming.favs])];
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

  function updateNet() {
    $net.textContent = navigator.onLine ? "" : "Offline";
    $net.hidden = navigator.onLine;
  }
  window.addEventListener("online", updateNet);
  window.addEventListener("offline", updateNet);

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
  updateNet();
  route();
})();
