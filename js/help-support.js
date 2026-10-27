/* ==========================================================================
   help-support.js — Interactions for Help & Support page
   ========================================================================== */

(function (global) {
  "use strict";

  global.Gbera = global.Gbera || {};

  function initAccordion() {
    var accordion = document.getElementById("faq-accordion");
    if (!accordion) return;

    accordion.addEventListener("click", function (event) {
      var header = event.target.closest ? event.target.closest(".accordion-header") : null;
      if (!header || !accordion.contains(header)) return;

      var item = header.parentElement;
      var panel = item.querySelector(".accordion-panel");
      if (!panel) return;

      var isOpen = item.classList.contains("is-open");

      // Close all items in this accordion
      accordion.querySelectorAll(".accordion-item").forEach(function (el) {
        el.classList.remove("is-open");
        var p = el.querySelector(".accordion-panel");
        if (p) {
          p.setAttribute("hidden", "");
          el.querySelector(".accordion-header").setAttribute("aria-expanded", "false");
        }
      });

      if (!isOpen) {
        item.classList.add("is-open");
        panel.removeAttribute("hidden");
        header.setAttribute("aria-expanded", "true");
      }
    });
  }

  function setError(inputName, message) {
    var errorEl = document.querySelector('[data-error-for="' + inputName + '"]');
    if (errorEl) {
      errorEl.textContent = message || "";
    }
    var input = document.querySelector('[name="' + inputName + '"]');
    if (input) {
      if (message) {
        input.classList.add("is-error");
      } else {
        input.classList.remove("is-error");
      }
    }
  }

  function clearErrors(form) {
    form.querySelectorAll(".form-error").forEach(function (el) {
      el.textContent = "";
    });
    form.querySelectorAll(".form-input, .form-select, .form-textarea").forEach(function (el) {
      el.classList.remove("is-error");
    });
  }

  function initContactForm() {
    var form = document.getElementById("support-contact-form");
    if (!form) return;

    var successEl = document.getElementById("contact-form-success");

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      clearErrors(form);
      if (successEl) {
        successEl.hidden = true;
      }

      var fullname = (form.fullname.value || "").trim();
      var email = (form.email.value || "").trim();
      var subject = (form.subject.value || "").trim();
      var message = (form.message.value || "").trim();

      var utils = (global.Gbera && global.Gbera.utils) || {};
      var hasError = false;

      if (!fullname) {
        setError("fullname", "Please enter your full name.");
        hasError = true;
      }
      if (!email) {
        setError("email", "Please enter your email address.");
        hasError = true;
      } else if (typeof utils.isValidEmail === "function" && !utils.isValidEmail(email)) {
        setError("email", "Please enter a valid email address.");
        hasError = true;
      }
      if (!subject) {
        setError("subject", "Please enter a subject.");
        hasError = true;
      }
      if (!message) {
        setError("message", "Please enter your message.");
        hasError = true;
      }

      if (hasError) {
        return;
      }

      // Simulate successful submission
      form.reset();
      if (successEl) {
        successEl.hidden = false;
        successEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });
  }

  function initTripReportForm() {
    var form = document.getElementById("trip-report-form");
    if (!form) return;

    var successEl = document.getElementById("trip-report-form-success");

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      clearErrors(form);
      if (successEl) {
        successEl.hidden = true;
      }

      var tripId = (form.tripId.value || "").trim();
      var tripDate = form.tripDate.value || "";
      var reportType = form.reportType.value || "";
      var description = (form.description.value || "").trim();
      var contactEmail = (form.contactEmail.value || "").trim();
      var contactPhone = (form.contactPhone.value || "").trim();

      var utils = (global.Gbera && global.Gbera.utils) || {};
      var hasError = false;

      if (!tripId) {
        setError("tripId", "Please enter your trip ID.");
        hasError = true;
      }
      if (!tripDate) {
        setError("tripDate", "Please select the trip date.");
        hasError = true;
      }
      if (!reportType) {
        setError("reportType", "Please select a problem type.");
        hasError = true;
      }
      if (!description) {
        setError("description", "Please provide a description of the issue.");
        hasError = true;
      }
      if (contactEmail && typeof utils.isValidEmail === "function" && !utils.isValidEmail(contactEmail)) {
        setError("contactEmail", "Please enter a valid email address.");
        hasError = true;
      }
      if (contactPhone && typeof utils.isValidPhone === "function" && !utils.isValidPhone(contactPhone)) {
        setError("contactPhone", "Please enter a valid Nigerian phone number.");
        hasError = true;
      }

      if (hasError) {
        return;
      }

      // Simulate successful submission
      form.reset();
      if (successEl) {
        successEl.hidden = false;
        successEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });
  }

  function init() {
    initAccordion();
    initContactForm();
    initTripReportForm();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window);
