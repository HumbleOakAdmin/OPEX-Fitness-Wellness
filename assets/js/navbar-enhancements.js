(function () {
  "use strict";

  var OPEN_CLASS = "nav-menu-open";
  var panel = document.querySelector(".side-menu_component");
  var backdrop = document.querySelector(".navbar.div-block");

  function setOpen(isOpen) {
    document.body.classList.toggle(OPEN_CLASS, isOpen);
  }

  function closeMenu() {
    setOpen(false);
    document.querySelectorAll(".close-button").forEach(function (btn) {
      btn.click();
    });
  }

  function bind() {
    document.querySelectorAll(".menu-button").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        setOpen(true);
      });
    });

    document.querySelectorAll(".close-button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setOpen(false);
      });
    });

    document.addEventListener("click", function (e) {
      if (!document.body.classList.contains(OPEN_CLASS)) return;
      if (e.target.closest(".side-menu_component")) return;
      if (e.target.closest(".side-menu-background")) return;
      if (e.target.closest(".menu-button")) return;
      closeMenu();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
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
