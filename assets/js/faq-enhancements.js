(function () {
  "use strict";

  var items = document.querySelectorAll(".faq-item-wrapper");
  if (!items.length) return;

  items.forEach(function (item, index) {
    var question = item.querySelector(".faq-question");
    var answer = item.querySelector(".faq-answer");
    if (!question || !answer) return;

    var answerId = "faq-answer-" + index;
    answer.id = answerId;
    question.setAttribute("role", "button");
    question.setAttribute("tabindex", "0");
    question.setAttribute("aria-expanded", "false");
    question.setAttribute("aria-controls", answerId);

    function setOpen(open) {
      item.classList.toggle("is-open", open);
      question.setAttribute("aria-expanded", open ? "true" : "false");
    }

    setOpen(false);

    question.addEventListener("click", function () {
      setOpen(!item.classList.contains("is-open"));
    });

    question.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setOpen(!item.classList.contains("is-open"));
      }
    });
  });

  var menuLinks = document.querySelectorAll(".faq-menu-item[href^='#']");
  var sections = document.querySelectorAll(".faq-group-row[id]");

  menuLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
      var targetId = link.getAttribute("href").slice(1);
      var target = document.getElementById(targetId);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      menuLinks.forEach(function (other) {
        other.classList.remove("w--current");
      });
      link.classList.add("w--current");
    });
  });

  if (!sections.length || !menuLinks.length || !("IntersectionObserver" in window)) {
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        menuLinks.forEach(function (link) {
          var active = link.getAttribute("href") === "#" + id;
          link.classList.toggle("w--current", active);
        });
      });
    },
    { rootMargin: "-20% 0px -55% 0px", threshold: 0 }
  );

  sections.forEach(function (section) {
    observer.observe(section);
  });
})();
