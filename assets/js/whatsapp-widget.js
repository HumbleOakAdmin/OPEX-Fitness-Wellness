(function () {
  "use strict";

  var WHATSAPP_URL = "https://wa.me/16043003435";

  var wrapper = document.querySelector(".live-chat-wrapper---brix");
  if (!wrapper) return;

  var bubble = wrapper.querySelector(".live-chat-bubbble---brix");
  var panel = wrapper.querySelector(".live-chat-content-left---brix");
  var chatBtn = wrapper.querySelector(".live-chat-button---brix.whatsapp");

  if (chatBtn) {
    chatBtn.setAttribute("href", WHATSAPP_URL);
    chatBtn.setAttribute("target", "_blank");
    chatBtn.setAttribute("rel", "noopener noreferrer");
  }

  function syncOpenState() {
    if (!panel) return;
    var open = parseFloat(window.getComputedStyle(panel).opacity) > 0.4;
    wrapper.classList.toggle("whatsapp-chat-open", open);
  }

  if (bubble) {
    bubble.addEventListener("click", function () {
      window.setTimeout(syncOpenState, 700);
    });
  }
})();
