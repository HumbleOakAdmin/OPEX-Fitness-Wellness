(function () {
  "use strict";

  var wrapper = document.querySelector(".live-chat-wrapper---brix");
  if (!wrapper) return;

  var bubble = wrapper.querySelector(".live-chat-bubbble---brix");
  var panel = wrapper.querySelector(".live-chat-content---brix");
  var panelBody = wrapper.querySelector(".live-chat-content-left---brix");
  var logo = wrapper.querySelector(".live-chat-logo---brix");
  var closeIcon = wrapper.querySelector(".live-chat-close-icon---brix");

  if (!bubble || !panel) return;

  function isOpen() {
    return wrapper.classList.contains("whatsapp-open");
  }

  function setOpen(open) {
    wrapper.classList.toggle("whatsapp-open", open);
    bubble.setAttribute("aria-expanded", open ? "true" : "false");
    bubble.setAttribute("aria-label", open ? "Close WhatsApp chat" : "Open WhatsApp chat");

    if (logo) logo.style.opacity = open ? "0" : "1";
    if (closeIcon) closeIcon.style.opacity = open ? "1" : "0";
    if (panelBody) {
      panelBody.style.opacity = open ? "1" : "0";
      panelBody.style.transform = open ? "none" : "translateY(12px) scale(0.96)";
    }
  }

  setOpen(false);

  bubble.setAttribute("role", "button");
  bubble.setAttribute("tabindex", "0");

  bubble.addEventListener(
    "click",
    function (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
      setOpen(!isOpen());
    },
    true
  );

  bubble.addEventListener("keydown", function (event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(!isOpen());
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && isOpen()) setOpen(false);
  });
})();
