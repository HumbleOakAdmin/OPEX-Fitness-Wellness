(function () {
  "use strict";

  var WHATSAPP_URL = "https://wa.me/16043003435";
  var OPEN_DELAY_MS = 900;

  var wrapper = document.querySelector(".live-chat-wrapper---brix");
  if (!wrapper) return;

  var bubble = wrapper.querySelector(".live-chat-bubbble---brix");
  var panel = wrapper.querySelector(".live-chat-content-left---brix");
  var chatBtn = wrapper.querySelector(".live-chat-button---brix.whatsapp");
  var pendingTimer = null;

  if (chatBtn) {
    chatBtn.setAttribute("href", WHATSAPP_URL);
    chatBtn.setAttribute("target", "_blank");
    chatBtn.setAttribute("rel", "noopener noreferrer");
  }

  function panelIsOpen() {
    if (!panel) return false;
    return parseFloat(window.getComputedStyle(panel).opacity) > 0.4;
  }

  function hideChatButton() {
    wrapper.classList.remove("whatsapp-chat-open");
  }

  function showChatButtonIfOpen() {
    if (panelIsOpen()) {
      wrapper.classList.add("whatsapp-chat-open");
    } else {
      hideChatButton();
    }
  }

  if (bubble) {
    bubble.addEventListener("click", function () {
      hideChatButton();

      if (pendingTimer) {
        window.clearTimeout(pendingTimer);
      }

      pendingTimer = window.setTimeout(function () {
        pendingTimer = null;
        showChatButtonIfOpen();
      }, OPEN_DELAY_MS);
    });
  }
})();
