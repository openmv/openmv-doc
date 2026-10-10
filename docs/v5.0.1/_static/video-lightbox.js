// Click-to-enlarge lightbox for the decorative looping demo videos (.. video::
// with :nocontrols:). The page shows them at column width, far below their
// native resolution, so fine text in them is unreadable -- clicking pops an
// enlarged copy out over a dimmed backdrop (near-native size, capped to the
// viewport). Click anywhere or press Esc to dismiss. The zoom-in cursor
// (custom.css) is the affordance; styling lives in custom.css
// (.video-lightbox).
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("video:not([controls])").forEach(function (v) {
        v.addEventListener("click", function () {
            var overlay = document.createElement("div");
            overlay.className = "video-lightbox";

            // An independent copy keeps the in-page video untouched; picking
            // up currentTime keeps the loop visually continuous. Drop the
            // in-page classes and sizing attributes: "framed" carries a
            // width:100% rule that would override the lightbox sizing, plus
            // the border that frames the in-page copy.
            var big = v.cloneNode(true);
            big.removeAttribute("class");
            big.removeAttribute("width");
            big.removeAttribute("height");
            big.muted = true;
            big.autoplay = true;
            big.currentTime = v.currentTime;
            overlay.appendChild(big);

            function close() {
                document.removeEventListener("keydown", onKey);
                overlay.remove();
            }
            function onKey(e) {
                if (e.key === "Escape") {
                    close();
                }
            }
            overlay.addEventListener("click", close);
            document.addEventListener("keydown", onKey);

            document.body.appendChild(overlay);
            big.play();
            requestAnimationFrame(function () {
                overlay.classList.add("open");
            });
        });
    });
});
