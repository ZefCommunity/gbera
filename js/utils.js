/* ==========================================================================
   utils.js — Small helper functions for the Gbera front-end.
   Exposes helpers on the global `Gbera.utils` object.
   ========================================================================== */

(function (global) {
  "use strict";

  global.Gbera = global.Gbera || {};
  global.Gbera.utils = global.Gbera.utils || {};

  var utils = global.Gbera.utils;

  /**
   * Format a number as Nigerian Naira currency.
   * @param {number|string} amount
   * @returns {string}
   */
  utils.formatCurrency = function formatCurrency(amount) {
    var value = Number(amount);
    if (isNaN(value)) value = 0;
    return "₦" + value.toLocaleString("en-NG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  /**
   * Format a date value as a readable date string.
   * @param {Date|string|number} date
   * @returns {string}
   */
  utils.formatDate = function formatDate(date) {
    var d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  /**
   * Format a date value as a readable time string.
   * @param {Date|string|number} date
   * @returns {string}
   */
  utils.formatTime = function formatTime(date) {
    var d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  /**
   * Debounce a function call.
   * @param {Function} fn
   * @param {number} delay
   * @returns {Function}
   */
  utils.debounce = function debounce(fn, delay) {
    var timer = null;
    return function debounced() {
      var context = this;
      var args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(context, args);
      }, delay || 0);
    };
  };

  /**
   * Get a query parameter value from the current URL.
   * @param {string} name
   * @returns {string|null}
   */
  utils.getQueryParam = function getQueryParam(name) {
    try {
      var params = new URLSearchParams(window.location.search);
      var value = params.get(name);
      return value === null ? null : value;
    } catch (err) {
      var match = new RegExp("[?&]" + name + "=([^&]*)").exec(window.location.search);
      return match ? decodeURIComponent(match[1].replace(/\+/g, " ")) : null;
    }
  };
})(window);

(function (global) {
  "use strict";
  global.Gbera = global.Gbera || {};
  global.Gbera.utils = global.Gbera.utils || {};
  var utils = global.Gbera.utils;

  /**
   * Storage helpers (localStorage) with try/catch safety.
   */
  utils.storage = {
    save: function save(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (err) {
        return false;
      }
    },
    load: function load(key) {
      try {
        var raw = localStorage.getItem(key);
        if (raw === null) return null;
        return JSON.parse(raw);
      } catch (err) {
        return null;
      }
    },
    remove: function remove(key) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (err) {
        return false;
      }
    }
  };

  utils.save = utils.storage.save;
  utils.load = utils.storage.load;
  utils.remove = utils.storage.remove;

  /**
   * Validate an email address.
   * @param {string} email
   * @returns {boolean}
   */
  utils.isValidEmail = function isValidEmail(email) {
    if (typeof email !== "string") return false;
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email.trim());
  };

  /**
   * Validate a Nigerian phone number.
   * @param {string} phone
   * @returns {boolean}
   */
  utils.isValidPhone = function isValidPhone(phone) {
    if (typeof phone !== "string") return false;
    var cleaned = phone.replace(/[\s\-()]/g, "");
    var intl = /^\+?234[789][01]\d{8}$/;
    var local = /^0[789][01]\d{8}$/;
    return intl.test(cleaned) || local.test(cleaned);
  };

  /**
   * Show a small auto-dismissing toast notification styled with .alert classes.
   * @param {string} message
   * @param {string} [type="info"]
   * @param {number} [duration=3500]
   */
  utils.showToast = function showToast(message, type, duration) {
    type = type || "info";
    duration = typeof duration === "number" ? duration : 3500;

    var container = document.getElementById("gbera-toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "gbera-toast-container";
      container.style.position = "fixed";
      container.style.top = "16px";
      container.style.right = "16px";
      container.style.zIndex = "800";
      container.style.display = "flex";
      container.style.flexDirection = "column";
      container.style.gap = "8px";
      container.style.maxWidth = "360px";
      document.body.appendChild(container);
    }

    var toast = document.createElement("div");
    toast.className = "alert alert-" + type;
    toast.setAttribute("role", "alert");
    toast.style.boxShadow = "0 4px 6px rgba(15,23,42,0.08)";

    var msg = document.createElement("span");
    msg.textContent = message;
    msg.style.flex = "1";
    toast.appendChild(msg);

    var closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", "Close notification");
    closeBtn.textContent = "\u00D7";
    closeBtn.style.background = "none";
    closeBtn.style.border = "none";
    closeBtn.style.cursor = "pointer";
    closeBtn.style.fontSize = "18px";
    closeBtn.style.lineHeight = "1";
    closeBtn.style.color = "inherit";
    closeBtn.addEventListener("click", function () {
      removeToast(toast);
    });
    toast.appendChild(closeBtn);

    container.appendChild(toast);

    var timeoutId = setTimeout(function () {
      removeToast(toast);
    }, duration);

    toast._timeoutId = timeoutId;

    function removeToast(el) {
      clearTimeout(el._timeoutId);
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    }
  };
})(window);

