(function () {
  "use strict";

  // This script deliberately bypasses Webflow's nav-open/close behavior.
  // We manage open/close by directly setting inline styles on the menu panel.

  var OPEN_CLASS = "nav-menu-open";
  var SCRIM_ID = "nav-menu-scrim";

  var PANEL_SELECTOR = ".side-menu_component";
  var BG_SELECTOR = ".side-menu-background";
  var MENU_BUTTON_SELECTOR = ".menu-button";
  var CLOSE_BUTTON_SELECTOR = ".close-button";

  var TRANSITION =
    "top var(--nav-duration, 0.45s) cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s cubic-bezier(0.22, 1, 0.36, 1), visibility 0.2s cubic-bezier(0.22, 1, 0.36, 1)";

  function getPanel() {
    return document.querySelector(PANEL_SELECTOR);
  }

  function getBg() {
    return document.querySelector(BG_SELECTOR);
  }

  function getScrim() {
    var el = document.getElementById(SCRIM_ID);
    if (!el) {
      el = document.createElement("div");
      el.id = SCRIM_ID;
      el.setAttribute("aria-hidden", "true");
      document.body.appendChild(el);

      // Close only when the scrim itself was clicked.
      el.addEventListener(
        "click",
        function (e) {
          e.preventDefault();
          e.stopPropagation();
          closeMenu();
        },
        true
      );
    }
    return el;
  }

  function applyClosed() {
    var panel = getPanel();
    var bg = getBg();

    if (bg) {
      bg.style.setProperty("top", "-20%", "important");
      bg.style.setProperty("right", "0", "important");
      bg.style.setProperty("opacity", "0", "important");
      bg.style.setProperty("visibility", "hidden", "important");
      bg.style.setProperty("pointer-events", "none", "important");
      bg.style.setProperty("transition", TRANSITION, "important");
    }

    if (panel) {
      // Side menu base uses `inset: -20rem 0 0 auto;` (top=-20rem, right=0, bottom=0)
      panel.style.setProperty("top", "-20rem", "important");
      panel.style.setProperty("right", "0", "important");
      panel.style.setProperty("bottom", "0", "important");
      panel.style.setProperty("opacity", "0", "important");
      panel.style.setProperty("visibility", "hidden", "important");
      panel.style.setProperty("pointer-events", "none", "important");
      panel.style.setProperty("transition", TRANSITION, "important");
      // Ensure any Webflow inline opacity/visibility on descendants is reset.
      panel.querySelectorAll("*").forEach(function (el) {
        if (el && el.style) {
          if (el.style.opacity) el.style.opacity = "1";
          if (el.style.visibility) el.style.visibility = "visible";
        }
      });
    }
  }

  function applyOpen() {
    var panel = getPanel();
    var bg = getBg();

    if (bg) {
      bg.style.setProperty("top", "0", "important");
      bg.style.setProperty("right", "0", "important");
      bg.style.setProperty("opacity", "1", "important");
      bg.style.setProperty("visibility", "visible", "important");
      bg.style.setProperty("pointer-events", "auto", "important");
      bg.style.setProperty("transition", TRANSITION, "important");
    }

    if (panel) {
      panel.style.setProperty("top", "0", "important");
      panel.style.setProperty("right", "0", "important");
      panel.style.setProperty("bottom", "0", "important");
      panel.style.setProperty("opacity", "1", "important");
      panel.style.setProperty("visibility", "visible", "important");
      panel.style.setProperty("pointer-events", "auto", "important");
      panel.style.setProperty("transition", TRANSITION, "important");
      panel.querySelectorAll("*").forEach(function (el) {
        if (el && el.style) {
          if (el.style.opacity) el.style.opacity = "1";
          if (el.style.visibility) el.style.visibility = "visible";
        }
      });
    }
  }

  function openMenu() {
    if (document.body.classList.contains(OPEN_CLASS)) return;

    document.body.classList.add(OPEN_CLASS);
    // Lock scroll while the menu is open.
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.position = "relative";

    applyOpen();

    // Ensure scrim is above page content.
    var scrim = getScrim();
    scrim.classList.add("is-visible");
  }

  function closeMenu() {
    if (!document.body.classList.contains(OPEN_CLASS)) return;

    document.body.classList.remove(OPEN_CLASS);
    // Force scroll back on close even if Webflow changed it.
    restoreScroll();
    // Webflow sometimes re-applies scroll locks on the same tick.
    window.setTimeout(restoreScroll, 50);
    window.setTimeout(restoreScroll, 300);

    getScrim().classList.remove("is-visible");
    applyClosed();
  }

  function restoreScroll() {
    // Use explicit `auto` so any lingering inline `hidden` from Webflow is overridden.
    document.body.style.overflow = "auto";
    document.documentElement.style.overflow = "auto";
    // Reset any common “lock scroll” patterns.
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    document.body.style.height = "";
  }

  function bind() {
    var scrim = getScrim();
    // Put initial state immediately.
    applyClosed();
    scrim.classList.remove("is-visible");

    // Menu open triggers (bypass Webflow by stopping propagation).
    document.addEventListener(
      "click",
      function (e) {
        var menuBtn = e.target.closest(MENU_BUTTON_SELECTOR);
        if (menuBtn) {
          e.preventDefault();
          e.stopPropagation();
          openMenu();
          return;
        }

        var closeBtn = e.target.closest(CLOSE_BUTTON_SELECTOR);
        if (closeBtn) {
          e.preventDefault();
          e.stopPropagation();
          closeMenu();
          return;
        }

        // Click outside closes.
        if (document.body.classList.contains(OPEN_CLASS)) {
          var panel = getPanel();
          if (panel && !e.target.closest(PANEL_SELECTOR)) {
            closeMenu();
          }
        }
      },
      true
    );

    document.addEventListener(
      "keydown",
      function (e) {
        if (e.key === "Escape" && document.body.classList.contains(OPEN_CLASS)) {
          closeMenu();
        }
      },
      true
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
})();
