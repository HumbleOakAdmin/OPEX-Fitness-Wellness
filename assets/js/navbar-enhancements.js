(function () {
  "use strict";

  var cssLink = document.querySelector('link[href*="navbar-enhancements.css"]');
  if (cssLink && cssLink.href.indexOf("v=") === -1) {
    cssLink.href += (cssLink.href.indexOf("?") === -1 ? "?" : "&") + "v=2";
  }

  // Custom navbar controller for the GitHub-hosted site.
  // Does NOT rely on Webflow behavior.
  var OPEN_CLASS = "nav-menu-open";
  var CONTENT_SELECTORS =
    ".side-menu-wrapper, .side-menu-item-wrapper, .side-menu-text-wrap, .text-size-large, .text-size-tiny, .hero-container-banner, .banner-heading, .banner-cta, .logo.small, .close-button";

  function setDrawerPosition(open) {
    var panel = document.querySelector(".side-menu_component");
    var bg = document.querySelector(".side-menu-background");
    var transform = open ? "translate3d(0, 0, 0)" : "translate3d(100%, 0, 0)";

    if (panel) {
      panel.style.setProperty("right", "0", "important");
      panel.style.setProperty("left", "auto", "important");
      panel.style.setProperty("transform", transform, "important");
    }
    if (bg) {
      bg.style.setProperty("right", "0", "important");
      bg.style.setProperty("left", "auto", "important");
      bg.style.setProperty("transform", transform, "important");
    }
  }

  function openMenu() {
    document.body.classList.add(OPEN_CLASS);
    setDrawerPosition(true);

    // Hard force show menu content (override any Webflow inline/CSS hiding).
    function revealNow() {
      var panel = document.querySelector(".side-menu_component");
      var bg = document.querySelector(".side-menu-background");
      if (panel) {
        panel.style.setProperty("opacity", "1", "important");
        panel.style.setProperty("visibility", "visible", "important");
        panel.style.setProperty("pointer-events", "auto", "important");
        panel.style.setProperty("display", "flex", "important");
      }
      if (bg) {
        bg.style.setProperty("opacity", "1", "important");
        bg.style.setProperty("visibility", "visible", "important");
        bg.style.setProperty("pointer-events", "auto", "important");
      }

      if (!panel) return;

      panel.querySelectorAll("*").forEach(function (el) {
        if (!el || !el.style) return;

        el.style.setProperty("opacity", "1", "important");
        el.style.setProperty("visibility", "visible", "important");
        el.style.setProperty("transform", "none", "important");
        el.style.setProperty("pointer-events", "auto", "important");

        // Ensure nothing is clipped/zero-height by leftover inline styles.
        el.style.setProperty("display", "block", "important");
        el.style.setProperty("height", "auto", "important");
        el.style.setProperty("max-height", "none", "important");
        el.style.setProperty("overflow", "visible", "important");
        el.style.setProperty("clip-path", "none", "important");

        if (el.getAttribute && el.getAttribute("aria-hidden") === "true") {
          el.setAttribute("aria-hidden", "false");
        }
      });
    }

    window.requestAnimationFrame(revealNow);
    window.setTimeout(revealNow, 120);
  }

  function closeMenu() {
    document.body.classList.remove(OPEN_CLASS);
    setDrawerPosition(false);
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
