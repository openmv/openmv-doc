/*
 * Keep sticky offsets correct when the top navbar wraps to multiple lines.
 *
 * The Shibuya theme assumes a fixed-height navbar (--sy-s-navbar-height: 56px)
 * and derives --sy-s-offset-top (used for the sticky left sidebar, breadcrumbs,
 * and "on this page" panel) from it. custom.css lets the navbar wrap when the
 * translated menu labels are too long for one line (e.g. French), which makes
 * the real header taller than 56px. This measures the actual header height and
 * republishes --sy-s-offset-top so those sticky elements still line up under
 * the header instead of sliding beneath it.
 *
 * English and other short languages keep a one-line, 56px header, so this is a
 * no-op for them.
 */
(function () {
  "use strict";

  function sync() {
    var head = document.querySelector(".sy-head");
    if (!head) return;
    var rootStyles = getComputedStyle(document.documentElement);
    var banner = rootStyles.getPropertyValue("--sy-s-banner-height").trim() || "0px";
    var h = Math.round(head.getBoundingClientRect().height);
    // offset-top = real header height + banner height
    document.documentElement.style.setProperty(
      "--sy-s-offset-top",
      "calc(" + h + "px + " + banner + ")"
    );
  }

  function init() {
    sync();
    window.addEventListener("resize", sync);
    var head = document.querySelector(".sy-head");
    if (head && window.ResizeObserver) {
      new ResizeObserver(sync).observe(head);
    }
    // Fonts can load after first layout and change wrap points.
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(sync);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
