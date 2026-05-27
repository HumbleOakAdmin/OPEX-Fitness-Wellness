(function () {
  "use strict";

  // Custom navbar controller for the GitHub-hosted site.
  // Does NOT rely on Webflow behavior.
  var OPEN_CLASS = "nav-menu-open";

  function openMenu() {
    document.body.classList.add(OPEN_CLASS);
  }

  function closeMenu() {
    document.body.classList.remove(OPEN_CLASS);
  }

  function bind() {
    // Force our open/close behavior (X closes; no click-off required).
    document.addEventListener(
      "click",
      function (e) {
        var menuBtn = e.target.closest(".menu-button");
        if (menuBtn) {
          e.preventDefault();
          e.stopPropagation();
          openMenu();
          return;
        }

        var closeBtn = e.target.closest(".close-button");
        if (closeBtn) {
          e.preventDefault();
          e.stopPropagation();
          closeMenu();
          return;
        }
      },
      true
    );

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains(OPEN_CLASS)) {
        closeMenu();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();
