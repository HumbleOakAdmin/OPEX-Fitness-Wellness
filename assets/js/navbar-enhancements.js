(function () {
  "use strict";

  var OPEN_CLASS = "nav-menu-open";

  function isPanelOpen(panel) {
    if (!panel) return false;
    var opacity = panel.style.opacity;
    if (opacity !== "" && parseFloat(opacity) < 0.05) return false;

    var transform = panel.style.transform || "";
    if (!transform || transform === "none") {
      return parseFloat(window.getComputedStyle(panel).opacity) > 0.05;
    }

    var match = transform.match(/translate(?:3d)?\([^,]+,\s*([^,)]+)/);
    if (match) {
      var y = match[1].trim();
      if (y.endsWith("%") && Math.abs(parseFloat(y)) > 20) return false;
    }

    match = transform.match(/translateX\(([^)]+)\)/);
    if (match) {
      var x = match[1].trim();
      if (x.endsWith("%") && parseFloat(x) > 20) return false;
      if (x.endsWith("px") && parseFloat(x) > 40) return false;
    }

    match = transform.match(/matrix\([^,]+,\s*[^,]+,\s*[^,]+,\s*[^,]+,\s*([^,]+)/);
    if (match) {
      var tx = parseFloat(match[1]);
      if (!isNaN(tx) && tx > 80) return false;
    }

    return true;
  }

  function syncMenuState() {
    var panel = document.querySelector(".side-menu_component");
    var open = isPanelOpen(panel);
    document.body.classList.toggle(OPEN_CLASS, open);
  }

  function closeMenu() {
    document.querySelectorAll(".close-button").forEach(function (btn) {
      btn.click();
    });
    window.setTimeout(syncMenuState, 50);
  }

  function observePanel() {
    var panel = document.querySelector(".side-menu_component");
    if (!panel) return;

    var observer = new MutationObserver(function () {
      syncMenuState();
    });

    observer.observe(panel, {
      attributes: true,
      attributeFilter: ["style", "class"],
    });

    syncMenuState();
  }

  function bind() {
    observePanel();

    document.addEventListener("click", function (e) {
      if (!document.body.classList.contains(OPEN_CLASS)) return;
      if (e.target.closest(".side-menu_component")) return;
      if (e.target.closest(".side-menu-background")) return;
      if (e.target.closest(".menu-button")) return;
      closeMenu();
    });

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
