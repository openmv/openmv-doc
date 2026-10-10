/*
 * Reliably land on the #anchor after the page has settled.
 *
 * The Shibuya theme leaves fragment navigation to the browser, which scrolls to
 * the target once on load -- before images (many lack intrinsic dimensions),
 * web fonts, and MathJax finish, all of which add height above the target and
 * push it down. The browser already scrolled, so you land short; on repeat
 * visits the cached assets settle sooner and you land progressively closer.
 *
 * This re-applies the scroll after the layout settles (load, fonts, and a
 * couple of delayed passes), measuring the real sticky-header height so the
 * target clears the navbar. The passes are finite and it backs off the moment
 * the user scrolls, so it never fights a deliberate scroll.
 */
(function () {
  "use strict";

  function target() {
    var hash = window.location.hash;
    if (!hash || hash === "#") return null;
    var id;
    try { id = decodeURIComponent(hash.slice(1)); } catch (e) { id = hash.slice(1); }
    return document.getElementById(id) || document.getElementsByName(id)[0] || null;
  }

  var lock = true; // allowed to correct until the user takes over

  function release() { lock = false; }

  ["wheel", "touchstart", "keydown"].forEach(function (ev) {
    window.addEventListener(ev, release, { passive: true });
  });

  function settle() {
    if (!lock) return;
    var el = target();
    if (!el) return;
    var head = document.querySelector(".sy-head");
    var offset = head ? head.getBoundingClientRect().height : 56;
    var y = window.pageYOffset + el.getBoundingClientRect().top - offset - 12;
    if (y < 0) y = 0;
    try { window.scrollTo({ top: y, behavior: "auto" }); }
    catch (e) { window.scrollTo(0, y); }
  }

  function run() {
    if (!window.location.hash) return;
    lock = true;
    settle();
    window.addEventListener("load", function () { requestAnimationFrame(settle); }, { once: true });
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(settle); }
    setTimeout(settle, 250);
    setTimeout(settle, 700);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }

  // Clicking an in-page "#anchor" link restarts the correction.
  window.addEventListener("hashchange", run);
})();
