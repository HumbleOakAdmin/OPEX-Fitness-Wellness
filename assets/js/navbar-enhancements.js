(function () {
  "use strict";

  // Custom navbar controller for the GitHub-hosted site.
  // Does NOT rely on Webflow behavior.
  var OPEN_CLASS = "nav-menu-open";
  var CONTENT_SELECTORS =
    ".side-menu-wrapper, .side-menu-item-wrapper, .side-menu-text-wrap, .text-size-large, .text-size-tiny, .hero-container-banner, .banner-heading, .banner-cta, .logo.small, .close-button";

  function openMenu() {
    document.body.classList.add(OPEN_CLASS);

    // Webflow interactions can leave inline opacity/visibility/transform styles
    // on menu children. Clear them so content always appears.
    function revealNow() {
      var panel = document.querySelector(".side-menu_component");
      if (!panel) return;

      // Broad reset: clear inline styles that commonly hide Webflow elements.
      panel.querySelectorAll("*").forEach(function (el) {
        if (!el) return;
        if (el.style) {
          el.style.display = "";
          el.style.opacity = "";
          el.style.visibility = "";
          el.style.pointerEvents = "";
          el.style.transform = "";
        }

        // If Webflow set aria-hidden=true, clear it.
        if (el.getAttribute && el.getAttribute("aria-hidden") === "true") {
          el.setAttribute("aria-hidden", "false");
        }
      });
    }

    window.requestAnimationFrame(revealNow);
    window.setTimeout(revealNow, 160);
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
