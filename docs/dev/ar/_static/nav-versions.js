/*
 * Populate the documentation version switcher (Shibuya's .nav-versions) from a
 * site-root /versions.json, with per-page links that keep the current language.
 *
 * Why client-side: every version is hosted under its own top-level path
 * (docs.openmv.io/<channel>/...) -- "dev" is the rolling master build, each
 * "vX.Y.Z" is a frozen HTML snapshot that is never rebuilt. A frozen snapshot's
 * server-rendered switcher could only list versions that existed when it was
 * built; fetching the always-current /versions.json at load time means even old
 * snapshots show the full, current list.
 *
 * versions.json format (kept stable so old frozen snapshots can read new files):
 *   { "versions": [ {"id": "dev", "label": "dev"},
 *                   {"id": "v5.0.0", "label": "v5.0.0 (latest)"} ],
 *     "latest": "v5.0.0" }
 *
 * Switching version keeps the rest of the path (language subdir + page), so you
 * stay on the same page in the same language. If that page does not exist in the
 * target version, that version's 404 shim handles the redirect.
 */
(function () {
  "use strict";

  function channelOf(pathname) {
    var p = pathname.split("/");           // ["", "<channel>", ...rest]
    return p.length > 1 ? p[1] : "";
  }

  // Everything after the leading /<channel> segment, e.g. "/de/library/index.html".
  function tailOf(pathname) {
    var p = pathname.split("/");
    return "/" + p.slice(2).join("/");
  }

  function populate(data) {
    var box = document.querySelector(".nav-versions");
    if (!box || !data || !Array.isArray(data.versions)) return;
    var choices = box.querySelector(".nav-versions-choices");
    if (!choices) return;

    var cur = channelOf(window.location.pathname);
    var tail = tailOf(window.location.pathname);

    var ul = document.createElement("ul");
    data.versions.forEach(function (v) {
      var id = typeof v === "string" ? v : v.id;
      var label = (typeof v === "object" && v.label) ? v.label : id;
      // Alias versions (no folder of their own) link to their snapshot folder.
      var target = (typeof v === "object" && v.snapshot) ? v.snapshot : id;
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "/" + target + tail;
      a.textContent = label;
      if (id === cur) a.setAttribute("aria-current", "true");
      li.appendChild(a);
      ul.appendChild(li);
    });

    var existing = choices.querySelector("ul");
    if (existing) existing.replaceWith(ul);
    else choices.appendChild(ul);
  }

  function load() {
    fetch("/versions.json", { cache: "no-cache" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) { if (data) populate(data); })
      .catch(function () { /* offline / local build: keep the server bootstrap */ });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", load);
  } else {
    load();
  }
})();
