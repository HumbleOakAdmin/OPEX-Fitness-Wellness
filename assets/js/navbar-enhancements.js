(function () {
  "use strict";

  // We don't rely on Webflow's internal nav overlay state.
  // Instead, we toggle a class and ensure the hidden menu can't block clicks.
  var OPEN_CLASS = "nav-menu-open";
  var DURATION_MS = 520;

  function setDisplay(open) {
    var panel = document.querySelector(".side-menu_component");
    var bg = document.querySelector(".side-menu-background");
    if (!panel || !bg) return;

    if (open) {
      // Make visible immediately so Webflow animation can run.
      bg.style.display = "flex";
      panel.style.display = "flex";
      bg.style.visibility = "visible";
      panel.style.visibility = "visible";
      bg.style.pointerEvents = "auto";
      panel.style.pointerEvents = "auto";
    } else {
      // Disable hit-testing immediately; remove from layout after animation.
      bg.style.pointerEvents = "none";
      panel.style.pointerEvents = "none";
      window.setTimeout(function () {
        bg.style.display = "none";
        panel.style.display = "none";
      }, DURATION_MS);
    }
  }

  function openMenu() {
    document.body.classList.add(OPEN_CLASS);
    setDisplay(true);
  }

  function closeMenu() {
    document.body.classList.remove(OPEN_CLASS);
    setDisplay(false);
    document.querySelectorAll(".close-button").forEach(function (btn) {
      btn.click();
    });
  }

  function bind() {
    // Initialize as closed: prevent invisible panel from blocking clicks.
    setDisplay(false);

    // Force our open/close behavior (X closes; no click-off required).
    document.addEventListener(
      "click",
      function (e) {
        var menuBtn = e.target.closest(".menu-button");
        if (menuBtn) {
          // Do NOT prevent default/stop propagation — Webflow uses this click to animate.
          // We only ensure the panel exists (display != none) before Webflow runs.
          setDisplay(true);
          document.body.classList.add(OPEN_CLASS);
          return;
        }

        var closeBtn = e.target.closest(".close-button");
        if (closeBtn) {
          // Let Webflow handle its close animation, then hide the layers.
          document.body.classList.remove(OPEN_CLASS);
          setDisplay(false);
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
