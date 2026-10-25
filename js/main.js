/* ==========================================================================
   main.js — Initialization and shared interactions for Gbera.
   ========================================================================== */

(function (global) {
  "use strict";

  global.Gbera = global.Gbera || {};

  /**
   * Open a modal by id.
   * @param {string} id
   */
  function openModal(id) {
    var modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    var backdrop = getBackdrop(modal);
    if (backdrop) backdrop.classList.add("is-open");
  }

  /**
   * Close a modal element.
   * @param {Element} modal
   */
  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    var backdrop = getBackdrop(modal);
    if (backdrop) backdrop.classList.remove("is-open");
  }

  /**
   * Resolve the backdrop associated with a modal.
   * @param {Element} modal
   * @returns {Element|null}
   */
  function getBackdrop(modal) {
    if (!modal) return null;
    var inner = modal.querySelector(".modal-backdrop");
    if (inner) return inner;
    if (modal.previousElementSibling && modal.previousElementSibling.classList &&
        modal.previousElementSibling.classList.contains("modal-backdrop")) {
      return modal.previousElementSibling;
    }
    if (modal.id) {
      return document.querySelector('.modal-backdrop[data-modal-backdrop="' + modal.id + '"]');
    }
    return null;
  }

  /**
   * Wire all shared interactions.
   */
  function init() {
    var components = (global.Gbera && global.Gbera.components) || {};

    if (document.getElementById("gbera-navbar") && typeof components.renderNavbar === "function") {
      components.renderNavbar();
    }
    if (document.getElementById("gbera-footer") && typeof components.renderFooter === "function") {
      components.renderFooter();
    }

    // Mobile menu toggle (event delegation).
    document.addEventListener("click", function (event) {
      var toggle = event.target.closest ? event.target.closest("[data-navbar-toggle]") : null;
      if (toggle) {
        var menu = document.querySelector(".navbar-menu");
        if (menu) {
          var isOpen = menu.classList.toggle("is-open");
          toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        }
        return;
      }

      // Modal open triggers.
      var openTrigger = event.target.closest ? event.target.closest("[data-modal-open]") : null;
      if (openTrigger) {
        event.preventDefault();
        openModal(openTrigger.getAttribute("data-modal-open"));
        return;
      }

      // Modal close triggers.
      var closeTrigger = event.target.closest ? event.target.closest("[data-modal-close]") : null;
      if (closeTrigger) {
        event.preventDefault();
        var modal = closeTrigger.closest ? closeTrigger.closest(".modal") : null;
        if (modal) {
          closeModal(modal);
        } else {
          document.querySelectorAll(".modal.is-open").forEach(closeModal);
        }
        return;
      }

      // Backdrop click closes modal.
      var backdrop = event.target.classList && event.target.classList.contains("modal-backdrop")
        ? event.target
        : null;
      if (backdrop) {
        var id = backdrop.getAttribute("data-modal-backdrop");
        var targetModal = id ? document.getElementById(id) : backdrop.nextElementSibling;
        if (targetModal && targetModal.classList.contains("modal")) {
          closeModal(targetModal);
        } else {
          document.querySelectorAll(".modal.is-open").forEach(closeModal);
        }
      }
    });

    // Escape key closes modals.
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" || event.keyCode === 27) {
        document.querySelectorAll(".modal.is-open").forEach(closeModal);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window);
