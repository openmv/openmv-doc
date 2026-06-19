/*
 * Automatic language selection for the OpenMV docs.
 *
 * The site is versioned: every page lives under a top-level version channel,
 * docs.openmv.io/<channel>/... ("dev" = rolling master build, "vX.Y.Z" = frozen
 * release snapshots). Within a channel, English is at the channel root and each
 * translation lives under <channel>/<lang>/. On first visit this script sends
 * the reader to the build matching their browser locale -- keeping the current
 * version channel -- falling back to English when nothing matches.
 *
 * A reader's explicit choice from the navbar "Translations" switcher is
 * remembered (localStorage) and always wins over browser detection. Runs
 * synchronously from <head> so the swap happens before paint, and uses
 * location.replace so it never pollutes history (no back-button trap / loop).
 */
(function () {
  "use strict";

  // Language subdirectories that actually exist (mirror conf.py languages).
  var SUBDIRS = ["zh_CN", "zh_TW", "de", "ja", "es", "ru", "fr", "ko", "it", "pt_BR", "nl",
                 "ro", "hr", "cs", "pl", "fi", "sv", "hu", "tr", "ar", "he",
                 "vi", "id", "th", "uk", "pt_PT"];

  // Browser locale prefix (lowercased BCP-47) -> subdirectory.
  // Ordered most-specific first so e.g. "zh-tw" beats the generic "zh".
  var MAP = [
    ["zh-hant", "zh_TW"], ["zh-tw", "zh_TW"], ["zh-hk", "zh_TW"], ["zh-mo", "zh_TW"],
    ["zh-hans", "zh_CN"], ["zh-cn", "zh_CN"], ["zh-sg", "zh_CN"], ["zh", "zh_CN"],
    ["pt-br", "pt_BR"], ["pt-pt", "pt_PT"], ["pt", "pt_BR"],
    ["de", "de"], ["ja", "ja"], ["es", "es"], ["ru", "ru"],
    ["fr", "fr"], ["ko", "ko"], ["it", "it"], ["nl", "nl"],
    ["ro", "ro"], ["hr", "hr"], ["cs", "cs"], ["pl", "pl"],
    ["fi", "fi"], ["sv", "sv"], ["hu", "hu"], ["tr", "tr"],
    ["ar", "ar"], ["he", "he"],
    ["id", "id"], ["th", "th"], ["uk", "uk"], ["vi", "vi"]
  ];

  var STORE_KEY = "omvLangPref"; // "en" or a subdir; set on manual switch.

  // Path layout: ["", <channel>, <lang?>, ...page]. The language, if any, is the
  // segment right after the channel.
  function langOfPath(pathname) {
    var p = pathname.split("/");
    if (p.length > 2 && SUBDIRS.indexOf(p[2]) !== -1) return p[2];
    return "en";
  }

  function channelOf(pathname) {
    var p = pathname.split("/");
    return p.length > 1 ? p[1] : "";
  }

  // Rebuild the path for `target` language, keeping the version channel + page.
  function pathForLang(pathname, target) {
    var p = pathname.split("/");
    var channel = p[1] || "";
    var inner = p.slice(2);                                  // [<lang?>, ...page]
    var curLang = (inner.length && SUBDIRS.indexOf(inner[0]) !== -1) ? inner[0] : "en";
    var page = (curLang === "en") ? inner : inner.slice(1);  // page segments only
    var langSeg = (target === "en") ? [] : [target];
    return "/" + [channel].concat(langSeg, page).join("/");
  }

  function detectFromBrowser() {
    var langs = (navigator.languages && navigator.languages.length)
      ? navigator.languages
      : [navigator.language || navigator.userLanguage || ""];
    for (var i = 0; i < langs.length; i++) {
      var l = String(langs[i] || "").toLowerCase();
      if (!l) continue;
      for (var j = 0; j < MAP.length; j++) {
        var key = MAP[j][0];
        if (l === key || l.indexOf(key + "-") === 0) return MAP[j][1];
      }
      if (l === "en" || l.indexOf("en-") === 0) return "en";
    }
    return "en"; // fallback
  }

  function safeGet() {
    try { return localStorage.getItem(STORE_KEY); } catch (e) { return null; }
  }
  function safeSet(v) {
    try { localStorage.setItem(STORE_KEY, v); } catch (e) {}
  }

  var current = langOfPath(window.location.pathname);

  // Remember the reader's explicit choice when they use the switcher, so it
  // overrides browser detection on later visits. The Shibuya switcher renders
  // plain <a> links; capture clicks on anything pointing at another language
  // build of the current page.
  document.addEventListener("click", function (ev) {
    var a = ev.target && ev.target.closest ? ev.target.closest("a[href]") : null;
    if (!a) return;
    var href = a.getAttribute("href") || "";
    var path;
    try { path = new URL(href, window.location.href).pathname; }
    catch (e) { return; }
    var chosen = langOfPath(path);
    if (chosen !== current) safeSet(chosen);
  }, true);

  // Only auto-route when we are actually under a version channel.
  if (channelOf(window.location.pathname)) {
    var pref = safeGet();
    var target = pref ? pref : detectFromBrowser();
    if (SUBDIRS.indexOf(target) === -1 && target !== "en") target = "en";

    if (target !== current) {
      var newPath = pathForLang(window.location.pathname, target);
      if (newPath !== window.location.pathname) {
        window.location.replace(newPath + window.location.search + window.location.hash);
      }
    }
  }
})();
