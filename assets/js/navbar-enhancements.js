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

  var TRANSITION = "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s cubic-bezier(0.22, 1, 0.36, 1), visibility 0.2s cubic-bezier(0.22, 1, 0.36, 1)";

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
      bg.style.setProperty("inset", "0 0 auto auto", "important");
      bg.style.setProperty("transform", "translateY(-20%)", "important");
      bg.style.setProperty("opacity", "0", "important");
      bg.style.setProperty("visibility", "hidden", "important");
      bg.style.setProperty("pointer-events", "none", "important");
      bg.style.setProperty("transition", TRANSITION, "important");

      // Prevent the “box across the window” artifact on small screens.
      bg.style.setProperty("width", "22rem", "important");
      bg.style.setProperty("max-width", "92vw", "important");
    }

    if (panel) {
      panel.style.setProperty("inset", "0 0 0 auto", "important");
      panel.style.setProperty("transform", "translateY(-20rem)", "important");
      panel.style.setProperty("opacity", "0", "important");
      panel.style.setProperty("visibility", "hidden", "important");
      panel.style.setProperty("pointer-events", "none", "important");
      panel.style.setProperty("transition", TRANSITION, "important");
    }
  }

  function applyOpen() {
    var panel = getPanel();
    var bg = getBg();

    if (bg) {
      bg.style.setProperty("inset", "0 0 auto auto", "important");
      bg.style.setProperty("transform", "translateY(0)", "important");
      bg.style.setProperty("opacity", "1", "important");
      bg.style.setProperty("visibility", "visible", "important");
      bg.style.setProperty("pointer-events", "auto", "important");
      bg.style.setProperty("transition", TRANSITION, "important");
    }

    if (panel) {
      panel.style.setProperty("inset", "0 0 0 auto", "important");
      panel.style.setProperty("transform", "translateY(0)", "important");
      panel.style.setProperty("opacity", "1", "important");
      panel.style.setProperty("visibility", "visible", "important");
      panel.style.setProperty("pointer-events", "auto", "important");
      panel.style.setProperty("transition", TRANSITION, "important");
    }
  }

  function openMenu() {
    if (document.body.classList.contains(OPEN_CLASS)) return;

    document.body.classList.add(OPEN_CLASS);
    document.body.style.overflow = "hidden";

    applyOpen();

    // Ensure scrim is above page content.
    var scrim = getScrim();
    scrim.classList.add("is-visible");
  }

  function closeMenu() {
    if (!document.body.classList.contains(OPEN_CLASS)) return;

    document.body.classList.remove(OPEN_CLASS);
    // Force scroll back on close even if Webflow changed it.
    document.body.style.overflow = "";

    getScrim().classList.remove("is-visible");
    applyClosed();
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
