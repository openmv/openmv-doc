// Flag the document on the legacy (CMUcam) pages so custom.css can round the
// corners of their images and videos, matching the framed look used elsewhere.
// Scoped by URL path so it needs no per-page markup and is a no-op everywhere
// else. Runs immediately -- documentElement exists before the body renders.
if (location.pathname.indexOf("/legacy/") !== -1) {
  var el = document.documentElement;
  el.classList.add("legacy-pages");

  // A handful of pages (board photos and header image rows) read better
  // without the frame -- flag them so custom.css can opt them back out.
  var noFrame = [
    "/legacy/cmucam1/index.html",
    "/legacy/cmucam1/",
    "/legacy/cmucam2/index.html",
    "/legacy/cmucam2/",
    "/legacy/cmucam2/wiki.html",
    "/legacy/cmucam3/index.html",
    "/legacy/cmucam3/",
    "/legacy/cmucam3/wiki.html",
    "/legacy/cmucam4/index.html",
    "/legacy/cmucam4/",
    "/legacy/cmucam4/wiki.html",
    "/legacy/cmucam4/lextronic-camera.html",
    "/legacy/cmucam4/sparkfun-camera.html",
    "/legacy/cmucam4/firmware-source-code-and-binaries.html",
  ];
  var path = location.pathname;
  for (var i = 0; i < noFrame.length; i++) {
    if (path.slice(-noFrame[i].length) === noFrame[i]) {
      el.classList.add("legacy-noframe");
      break;
    }
  }
}
