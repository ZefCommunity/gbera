/* ==========================================================================
   landing.js — Page-specific interactions for the Gbera landing page.
   - Adds a subtle shadow to the navbar once the user scrolls.
   - Closes the mobile nav menu on link click and on Escape.
   - Keeps the hamburger toggle's aria-expanded in sync.
   Vanilla JS, no dependencies.
   ========================================================================== */

(function (global) {
  "use strict";

  var navbar = null;
  var toggle = null;
  var menu = null;

  function closeMenu() {
    if (!menu || !toggle) return;
    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }

  function openMenu() {
    if (!menu || !toggle) return;
    menu.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
  }

  function init() {
    navbar = document.getElementById("landing-navbar");
    toggle = document.querySelector("[data-navbar-toggle]");
    menu = document.querySelector(".navbar-menu");

    // --- Navbar shadow on scroll ---
    function updateShadow() {
      if (!navbar) return;
      if (window.scrollY > 8) {
        navbar.classList.add("landing-navbar--scrolled");
      } else {
        navbar.classList.remove("landing-navbar--scrolled");
      }
    }
    updateShadow();
    window.addEventListener("scroll", updateShadow, { passive: true });

    // --- Close mobile menu when a nav link is clicked ---
    if (menu) {
      menu.addEventListener("click", function (event) {
        var link = event.target && event.target.closest ? event.target.closest("a") : null;
        if (link) {
          closeMenu();
        }
      });
    }

    // --- Close mobile menu on Escape ---
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" || event.keyCode === 27) {
        if (menu && menu.classList.contains("is-open")) {
          closeMenu();
          if (toggle) toggle.focus();
        }
      }
    });

    // --- Close mobile menu when clicking outside of it (mobile only) ---
    document.addEventListener("click", function (event) {
      if (!menu || !menu.classList.contains("is-open")) return;
      var insideNav = event.target && event.target.closest
        ? event.target.closest(".navbar")
        : null;
      if (!insideNav) {
        closeMenu();
      }
    });

    // --- Keep aria-expanded in sync when toggled via shared main.js ---
    if (toggle) {
      // Observe class changes on the menu to mirror state (fallback safety).
      if (typeof MutationObserver !== "undefined" && menu) {
        var observer = new MutationObserver(function () {
          var isOpen = menu.classList.contains("is-open");
          toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
        observer.observe(menu, { attributes: true, attributeFilter: ["class"] });
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window);
