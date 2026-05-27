(function () {
  "use strict";

  var OPEN_CLASS = "nav-menu-open";
  var CLOSING_CLASS = "nav-menu-closing";
  var SCRIM_ID = "nav-menu-scrim";

  function getScrim() {
    var el = document.getElementById(SCRIM_ID);
    if (!el) {
      el = document.createElement("div");
      el.id = SCRIM_ID;
      el.setAttribute("aria-hidden", "true");
      el.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        closeMenu();
      });
      document.body.appendChild(el);
    }
    return el;
  }

  function isPanelOpen(panel) {
    if (!panel) return false;
    var opacity = panel.style.opacity;
    if (opacity !== "" && parseFloat(opacity) < 0.05) return false;

    var transform = panel.style.transform || "";
    if (!transform || transform === "none") {
      return parseFloat(window.getComputedStyle(panel).opacity) > 0.05;
    }

    var match = transform.match(/translateX\(([^)]+)\)/);
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

  function setOpenState(open) {
    document.body.classList.toggle(OPEN_CLASS, open);
    getScrim().classList.toggle("is-visible", open);
  }

  function syncMenuState() {
    if (document.body.classList.contains(CLOSING_CLASS)) return;
    var panel = document.querySelector(".side-menu_component");
    setOpenState(isPanelOpen(panel));
  }

  function closeMenu() {
    document.body.classList.add(CLOSING_CLASS);
    setOpenState(false);

    document.querySelectorAll(".close-button").forEach(function (btn) {
      btn.click();
    });

    window.setTimeout(function () {
      document.body.classList.remove(CLOSING_CLASS);
      syncMenuState();
    }, 450);
  }

  function observePanel() {
    var panel = document.querySelector(".side-menu_component");
    if (!panel) return;

    var observer = new MutationObserver(syncMenuState);
    observer.observe(panel, {
      attributes: true,
      attributeFilter: ["style", "class"],
    });

    syncMenuState();
  }

  function bind() {
    getScrim();
    observePanel();

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
