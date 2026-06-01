(function () {
  "use strict";

  var WHATSAPP_URL = "https://wa.me/16043003435";

  var wrapper = document.querySelector(".live-chat-wrapper---brix");
  if (!wrapper) return;

  var bubble = wrapper.querySelector(".live-chat-bubbble---brix");
  var panel = wrapper.querySelector(".live-chat-content-left---brix");
  var chatBtn = wrapper.querySelector(".live-chat-button---brix.whatsapp");
  var checkbox = wrapper.querySelector("#checkbox");

  if (chatBtn) {
    chatBtn.setAttribute("href", WHATSAPP_URL);
    chatBtn.setAttribute("target", "_blank");
    chatBtn.setAttribute("rel", "noopener noreferrer");
  }

  function panelIsOpen() {
    if (!panel) return false;
    return parseFloat(window.getComputedStyle(panel).opacity) > 0.4;
  }

  function revealChatButton() {
    if (!chatBtn) return;
    chatBtn.style.setProperty("display", "flex", "important");
    chatBtn.style.setProperty("opacity", "1", "important");
    chatBtn.style.setProperty("visibility", "visible", "important");
    chatBtn.style.setProperty("pointer-events", "auto", "important");
  }

  function hideChatButton() {
    if (!chatBtn) return;
    chatBtn.style.removeProperty("display");
    chatBtn.style.removeProperty("opacity");
    chatBtn.style.removeProperty("visibility");
    chatBtn.style.removeProperty("pointer-events");
  }

  function onPanelStateChange() {
    if (panelIsOpen()) {
      if (checkbox) {
        checkbox.checked = true;
        checkbox.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      }
      revealChatButton();
    } else {
      hideChatButton();
    }
  }

  if (panel) {
    var observer = new MutationObserver(onPanelStateChange);
    observer.observe(panel, {
      attributes: true,
      attributeFilter: ["style", "class"],
    });
    onPanelStateChange();
  }

  if (bubble) {
    bubble.addEventListener("click", function () {
      window.setTimeout(onPanelStateChange, 550);
      window.setTimeout(onPanelStateChange, 1100);
    });
  }
})();
