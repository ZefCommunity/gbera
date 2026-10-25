/* ==========================================================================
   auth.js — Page logic for Gbera authentication pages.
   ========================================================================== */

(function (global) {
  "use strict";

  global.Gbera = global.Gbera || {};
  var utils = (global.Gbera && global.Gbera.utils) || {};
  var V = (global.Gbera && global.Gbera.authValidation) || {};
  var AS = (global.Gbera && global.Gbera.authService) || {};

  var AUTH_KEY = (AS.storageKey) || "gbera_auth_session";

  function readSession() {
    var s = null;
    try { var raw = localStorage.getItem(AUTH_KEY); if (raw) s = JSON.parse(raw); } catch (e) { s = null; }
    if (!s) {
      try { var raw2 = sessionStorage.getItem(AUTH_KEY); if (raw2) s = JSON.parse(raw2); } catch (e) { s = null; }
    }
    return s;
  }

  function writeSession(session, remember) {
    var primary = remember ? localStorage : sessionStorage;
    var other = remember ? sessionStorage : localStorage;
    try { other.removeItem(AUTH_KEY); } catch (e) { }
    try { primary.setItem(AUTH_KEY, JSON.stringify(session)); } catch (e) { }
  }

  function clearSession() {
    try { localStorage.removeItem(AUTH_KEY); } catch (e) { }
    try { sessionStorage.removeItem(AUTH_KEY); } catch (e) { }
  }

  function redirectIfLoggedIn() {
    var session = readSession();
    if (session && session.user) {
      var dest = session.user.role === "driver" ? "driver-dashboard.html" : "rider-dashboard.html";
      window.location.replace(dest);
    }
  }

  function setSubmitting(btn, loading) {
    if (!btn) return;
    if (loading) {
      btn.disabled = true;
      btn.classList.add("is-loading");
      btn.setAttribute("aria-busy", "true");
    } else {
      btn.disabled = false;
      btn.classList.remove("is-loading");
      btn.removeAttribute("aria-busy");
    }
  }

  function showAlert(el, msg, type) {
    if (!el) return;
    el.textContent = msg;
    el.className = "auth-alert auth-alert--" + (type === "error" ? "error" : "success");
    el.hidden = false;
  }

  function hideAlert(el) {
    if (!el) return;
    el.hidden = true;
    el.textContent = "";
  }

  function showToast(msg, type) {
    if (utils.showToast) utils.showToast(msg, type || "info");
  }

  function trim(v) { return (V.trim ? V.trim(v) : String(v == null ? "" : v).trim()); }

  function togglePw(input, btn) {
    if (!input) return;
    var isPw = input.type === "password";
    input.type = isPw ? "text" : "password";
    if (btn) {
      btn.setAttribute("aria-label", isPw ? "Hide password" : "Show password");
      btn.textContent = isPw ? "Hide" : "Show";
    }
  }


  function initLoginPage() {
    var form = document.getElementById("login-form");
    if (!form) return;
    redirectIfLoggedIn();

    var role = "rider";
    var roleBtns = document.querySelectorAll("[data-role-btn]");
    var identifierInput = document.getElementById("login-identifier");
    var passwordInput = document.getElementById("login-password");
    var toggle = document.getElementById("login-toggle-pw");
    var remember = document.getElementById("login-remember");
    var submit = document.getElementById("login-submit");
    var alertBox = document.getElementById("login-alert");

    roleBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        role = btn.getAttribute("data-role");
        roleBtns.forEach(function (b) {
          b.setAttribute("aria-pressed", b === btn ? "true" : "false");
        });
      });
    });

    if (toggle && passwordInput) {
      toggle.addEventListener("click", function () { togglePw(passwordInput, toggle); });
    }

    var touched = { identifier: false, password: false };

    function getValues() {
      return { identifier: identifierInput.value, password: passwordInput.value };
    }

    function showError(name, msg) {
      var el = document.getElementById("login-" + name + "-error");
      if (el) el.textContent = msg;
    }
    function clearError(name) { showError(name, ""); }

    function runField(name) {
      var cfg = (V.loginFields || []).find(function (c) { return c.name === name; });
      var values = getValues();
      var err = V.validateField ? V.validateField(cfg, values[name], values) : "";
      var input = name === "identifier" ? identifierInput : passwordInput;
      if (err) {
        showError(name, err);
        if (input) { input.classList.add("auth-input-invalid"); input.setAttribute("aria-invalid", "true"); }
      } else {
        clearError(name);
        if (input) { input.classList.remove("auth-input-invalid"); input.setAttribute("aria-invalid", "false"); }
      }
      return err;
    }

    if (identifierInput) {
      identifierInput.addEventListener("blur", function () { touched.identifier = true; runField("identifier"); });
      identifierInput.addEventListener("input", function () { if (touched.identifier) runField("identifier"); });
    }
    if (passwordInput) {
      passwordInput.addEventListener("blur", function () { touched.password = true; runField("password"); });
      passwordInput.addEventListener("input", function () { if (touched.password) runField("password"); });
    }

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      touched.identifier = true;
      touched.password = true;
      var values = getValues();
      var result = V.validateForm ? V.validateForm(V.loginFields, values) : { valid: true, firstInvalid: null };
      V.loginFields.forEach(function (cfg) { runField(cfg.name); });
      if (!result.valid) {
        var firstEl = result.firstInvalid === "identifier" ? identifierInput : passwordInput;
        if (firstEl) firstEl.focus();
        return;
      }
      setSubmitting(submit, true);
      hideAlert(alertBox);
      try {
        var resp = await AS.login(role, { identifier: trim(values.identifier), password: values.password });
        writeSession({ token: resp.token, user: resp.user }, !!(remember && remember.checked));
        showToast("Welcome back, " + (resp.user.fullName || "") + "!", "success");
        var dest = (resp.user.role === "driver") ? "driver-dashboard.html" : "rider-dashboard.html";
        window.location.href = dest;
      } catch (err) {
        var msg = (err && err.message) ? err.message : "Something went wrong. Please try again.";
        if (err && err.type === "validation" && err.fields) {
          Object.keys(err.fields).forEach(function (k) {
            showError(k, err.fields[k]);
          });
        }
        showAlert(alertBox, msg, "error");
        showToast(msg, "danger");
      } finally {
        setSubmitting(submit, false);
      }
    });
  }


  function initSignupPage() {
    var tabs = document.querySelectorAll("[data-signup-tab]");
    if (!tabs.length) return;
    redirectIfLoggedIn();

    var riderPanel = document.getElementById("panel-rider");
    var driverPanel = document.getElementById("panel-driver");
    var activeRole = "rider";

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        activeRole = tab.getAttribute("data-signup-tab");
        tabs.forEach(function (t) {
          t.setAttribute("aria-selected", t === tab ? "true" : "false");
        });
        if (riderPanel) riderPanel.hidden = activeRole !== "rider";
        if (driverPanel) driverPanel.hidden = activeRole !== "driver";
      });
    });

    bindRegForm(document.getElementById("form-rider"), "rider", (V.riderFields || []));
    bindRegForm(document.getElementById("form-driver"), "driver", (V.riderFields || []).concat(V.driverExtraFields || []));
  }

  function bindRegForm(form, role, fields) {
    if (!form) return;
    var submit = form.querySelector("[type='submit']");
    var alertBox = form.querySelector(".auth-alert");
    var touched = {};
    var fileInput = form.querySelector("input[type='file']");
    var filePreview = form.querySelector(".auth-file__preview");
    var fileNameEl = form.querySelector(".auth-file__name");
    var pwInput = form.querySelector("input[name='password']");
    var strengthWrap = form.querySelector(".auth-strength");

    if (pwInput && strengthWrap) {
      pwInput.addEventListener("input", function () {
        var s = V.passwordStrength ? V.passwordStrength(pwInput.value) : "weak";
        strengthWrap.className = "auth-strength auth-strength--" + s;
        var label = strengthWrap.querySelector(".auth-strength__label");
        if (label) label.textContent = "Strength: " + s;
      });
    }

    form.querySelectorAll(".auth-toggle-pw").forEach(function (btn) {
      var target = document.getElementById(btn.getAttribute("data-target"));
      if (!target) return;
      btn.addEventListener("click", function () { togglePw(target, btn); });
    });

    function getInput(name) { return form.querySelector("[name='" + name + "']"); }
    function showError(name, msg) {
      var el = form.querySelector("[data-error-for='" + name + "']");
      if (el) el.textContent = msg;
    }
    function clearError(name) { showError(name, ""); }

    function getValues() {
      var values = {};
      fields.forEach(function (cfg) {
        var el = getInput(cfg.name);
        if (!el) { values[cfg.name] = ""; return; }
        if (el.type === "checkbox") values[cfg.name] = el.checked;
        else values[cfg.name] = el.value;
      });
      return values;
    }

    function runField(name) {
      var cfg = fields.find(function (c) { return c.name === name; });
      var values = getValues();
      var file = (name === "licenceDoc" && fileInput) ? (fileInput.files && fileInput.files[0]) : null;
      var err = V.validateField ? V.validateField(cfg, values[name], values, file) : "";
      var input = getInput(name);
      if (err) {
        showError(name, err);
        if (input && input.type !== "file") { input.classList.add("auth-input-invalid"); input.setAttribute("aria-invalid", "true"); }
      } else {
        clearError(name);
        if (input && input.type !== "file") { input.classList.remove("auth-input-invalid"); input.setAttribute("aria-invalid", "false"); }
      }
      return err;
    }

    fields.forEach(function (cfg) {
      var input = getInput(cfg.name);
      if (!input) return;
      if (cfg.name === "terms") {
        input.addEventListener("change", function () { touched[cfg.name] = true; runField(cfg.name); });
        return;
      }
      if (cfg.name === "licenceDoc") return;
      input.addEventListener("blur", function () { touched[cfg.name] = true; runField(cfg.name); });
      input.addEventListener("input", function () { if (touched[cfg.name]) runField(cfg.name); });
    });

    if (fileInput) {
      fileInput.addEventListener("change", function () {
        touched.licenceDoc = true;
        var file = fileInput.files && fileInput.files[0];
        var err = V.fileUpload ? V.fileUpload(file) : "";
        if (filePreview) {
          if (file && !err) {
            filePreview.classList.add("has-file");
            if (fileNameEl) fileNameEl.textContent = file.name + " (" + (file.size / 1024 / 1024).toFixed(2) + " MB)";
          } else {
            filePreview.classList.remove("has-file");
            if (fileNameEl) fileNameEl.textContent = file ? err : "No file selected";
          }
        }
        runField("licenceDoc");
      });
    }


    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      fields.forEach(function (cfg) { touched[cfg.name] = true; });
      var values = getValues();
      var files = {};
      if (fileInput && fileInput.files && fileInput.files[0]) files.licenceDoc = fileInput.files[0];
      var result = V.validateForm ? V.validateForm(fields, values, files) : { valid: true, firstInvalid: null };
      fields.forEach(function (cfg) { runField(cfg.name); });
      if (!result.valid) {
        var firstEl = getInput(result.firstInvalid);
        if (firstEl) firstEl.focus();
        return;
      }
      var data = {};
      fields.forEach(function (cfg) {
        if (cfg.name === "terms" || cfg.name === "confirmPassword" || cfg.name === "licenceDoc") return;
        var v = values[cfg.name];
        if (typeof v === "string") v = trim(v);
        data[cfg.name] = v;
      });
      data.password = values.password;

      setSubmitting(submit, true);
      hideAlert(alertBox);
      try {
        var resp = await AS.register(role, data);
        writeSession({ token: resp.token, user: resp.user }, false);
        showToast("Account created. Welcome, " + (resp.user.fullName || "") + "!", "success");
        var dest = (role === "driver") ? "driver-dashboard.html" : "rider-dashboard.html";
        window.location.href = dest;
      } catch (err) {
        var msg = (err && err.message) ? err.message : "Something went wrong. Please try again.";
        if (err && err.type === "validation" && err.fields) {
          Object.keys(err.fields).forEach(function (k) {
            showError(k, err.fields[k]);
            var input = getInput(k);
            if (input) { input.classList.add("auth-input-invalid"); input.setAttribute("aria-invalid", "true"); }
          });
        }
        showAlert(alertBox, msg, "error");
        showToast(msg, "danger");
      } finally {
        setSubmitting(submit, false);
      }
    });
  }

  function initForgotPage() {
    var form = document.getElementById("forgot-form");
    if (!form) return;
    redirectIfLoggedIn();

    var emailInput = document.getElementById("fp-email");
    var submit = document.getElementById("fp-submit");
    var alertBox = document.getElementById("fp-alert");
    var touched = false;

    function runField() {
      var err = V.email ? V.email(emailInput.value) : "";
      var errEl = document.getElementById("fp-email-error");
      if (err) {
        if (errEl) errEl.textContent = err;
        emailInput.classList.add("auth-input-invalid");
        emailInput.setAttribute("aria-invalid", "true");
      } else {
        if (errEl) errEl.textContent = "";
        emailInput.classList.remove("auth-input-invalid");
        emailInput.setAttribute("aria-invalid", "false");
      }
      return err;
    }

    if (emailInput) {
      emailInput.addEventListener("blur", function () { touched = true; runField(); });
      emailInput.addEventListener("input", function () { if (touched) runField(); });
    }

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      touched = true;
      if (runField()) { if (emailInput) emailInput.focus(); return; }
      setSubmitting(submit, true);
      hideAlert(alertBox);
      try {
        var resp = await AS.requestPasswordReset(trim(emailInput.value));
        var msg = (resp && resp.message) ? resp.message : "If an account exists, a reset link has been sent.";
        showAlert(alertBox, msg, "success");
        showToast(msg, "success");
      } catch (err) {
        var msg = (err && err.message) ? err.message : "Something went wrong. Please try again.";
        showAlert(alertBox, msg, "error");
        showToast(msg, "danger");
      } finally {
        setSubmitting(submit, false);
      }
    });
  }

  function initDashboardPage() {
    var card = document.getElementById("dashboard-card");
    if (!card) return;
    var session = readSession();
    if (!session || !session.user) {
      window.location.replace("auth.html");
      return;
    }
    var nameEl = document.getElementById("dash-name");
    if (nameEl) nameEl.textContent = session.user.fullName || "User";
    var roleEl = document.getElementById("dash-role");
    if (roleEl) roleEl.textContent = session.user.role || "";
    var avatar = document.getElementById("dash-avatar");
    if (avatar) avatar.textContent = (session.user.fullName || "?").charAt(0).toUpperCase();
    var emailEl = document.getElementById("dash-email");
    if (emailEl) emailEl.textContent = session.user.email || "";

    var logoutBtn = document.getElementById("dash-logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", function () {
        clearSession();
        showToast("You have been logged out.", "info");
        window.location.href = "auth.html";
      });
    }
  }

  function init() {
    initLoginPage();
    initSignupPage();
    initForgotPage();
    initDashboardPage();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window);
