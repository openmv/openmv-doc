/*
 * Automatic language selection for the OpenMV docs.
 *
 * Each translation is deployed under its own top-level subdirectory
 * (/zh_CN/, /de/, ...) with English at the site root. On first visit this
 * script sends the reader to the build that best matches their browser
 * locale, falling back to English when nothing matches.
 *
 * A reader's explicit choice from the navbar "Translations" switcher is
 * remembered (localStorage) and always wins over browser detection, so the
 * switcher is never fought by the auto-redirect. Runs synchronously from
 * <head> so the swap happens before paint, and uses location.replace so it
 * never pollutes history (no back-button trap / redirect loop).
 */
(function () {
  "use strict";

  // Language subdirectories that actually exist (mirror conf.py languages).
  // he/ar are translated and selectable in the switcher; their layout ships
  // left-to-right for now (the theme has no RTL chrome) but the text reads
  // correctly, so they are auto-routed like every other locale.
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

  function langOfPath(pathname) {
    var parts = pathname.split("/");
    // parts[0] is "" (leading slash); first real segment is parts[1].
    if (parts.length > 1 && SUBDIRS.indexOf(parts[1]) !== -1) return parts[1];
    return "en";
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

  function stripLang(pathname, cur) {
    if (cur === "en") return pathname;
    var rest = pathname.replace(new RegExp("^/" + cur + "(?=/|$)"), "");
    return rest === "" ? "/" : rest;
  }

  function withLang(pathname, target) {
    if (target === "en") return pathname;
    return "/" + target + pathname;
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
  // plain <a> links; capture clicks on anything pointing at a known build.
  document.addEventListener("click", function (ev) {
    var a = ev.target && ev.target.closest ? ev.target.closest("a[href]") : null;
    if (!a) return;
    var href = a.getAttribute("href") || "";
    var path;
    try { path = new URL(href, window.location.href).pathname; }
    catch (e) { return; }
    var chosen = langOfPath(path);
    // Only treat it as a language choice if it targets the current page in
    // another build (the switcher links do exactly this).
    if (chosen !== current) safeSet(chosen);
  }, true);

  var pref = safeGet();
  var target = pref ? pref : detectFromBrowser();
  if (SUBDIRS.indexOf(target) === -1 && target !== "en") target = "en";

  if (target !== current) {
    var newPath = withLang(stripLang(window.location.pathname, current), target);
    if (newPath !== window.location.pathname) {
      window.location.replace(newPath + window.location.search + window.location.hash);
    }
  }
})();
