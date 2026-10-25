(function () {
  "use strict";

  var form = document.getElementById("driver-form");
  if (!form) return;

  var MAX_FILE_SIZE = 5 * 1024 * 1024;
  var ALLOWED_DOC_TYPES = ["application/pdf", "image/jpeg", "image/png"];
  var ALLOWED_DOC_EXTS = ["pdf", "jpg", "jpeg", "png"];
  var ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png"];
  var ALLOWED_PHOTO_EXTS = ["jpg", "jpeg", "png"];
  var MIN_YEAR = 1990;
  var MAX_YEAR = new Date().getFullYear() + 1;

  var submitBtn = document.getElementById("driver-submit");
  var successBox = document.getElementById("driver-success");
  var resetBtn = document.getElementById("driver-reset");

  var submitted = false;
  var isSubmitting = false;

  var utils = (window.Gbera && window.Gbera.utils) ? window.Gbera.utils : {};

  function setError(fieldId, message) {
    var input = document.getElementById(fieldId);
    var err = document.getElementById(fieldId + "-error");
    if (input) {
      if (message) input.classList.add("is-error");
      else input.classList.remove("is-error");
    }
    if (err) err.textContent = message || "";
  }

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  }

  function getExt(name) {
    var parts = String(name || "").split(".");
    return (parts.length > 1 ? parts.pop() : "").toLowerCase();
  }

  function validateRequiredText(id, label) {
    var input = document.getElementById(id);
    if (!input) return true;
    var val = input.value.trim();
    if (!val) {
      setError(id, (label || "This field") + " is required.");
      return false;
    }
    setError(id, "");
    return true;
  }

  function validateEmailField() {
    var id = "driver-email";
    var input = document.getElementById(id);
    var val = input.value.trim();
    if (!val) { setError(id, "Email address is required."); return false; }
    var isValid = (typeof utils.isValidEmail === "function") ? utils.isValidEmail(val) : /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(val);
    if (!isValid) { setError(id, "Please enter a valid email address."); return false; }
    setError(id, "");
    return true;
  }

  function validatePhoneField() {
    var id = "driver-phone";
    var input = document.getElementById(id);
    var val = input.value.trim();
    if (!val) { setError(id, "Phone number is required."); return false; }
    var cleaned = val.replace(/[\\s\\-()]/g, "");
    var isValid = (typeof utils.isValidPhone === "function") ? utils.isValidPhone(val) : /^0[789][01]\\d{8}$/.test(cleaned);
    if (!isValid) { setError(id, "Please enter a valid Nigerian phone number."); return false; }
    setError(id, "");
    return true;
  }

  function validateYearField() {
    var id = "driver-vehicle-year";
    var input = document.getElementById(id);
    var raw = input.value.trim();
    if (!raw) { setError(id, "Vehicle year is required."); return false; }
    if (!/^-?\\d+$/.test(raw)) { setError(id, "Vehicle year must be a whole number."); return false; }
    var year = parseInt(raw, 10);
    if (isNaN(year) || year < MIN_YEAR || year > MAX_YEAR) {
      setError(id, "Enter a year between " + MIN_YEAR + " and " + MAX_YEAR + ".");
      return false;
    }
    setError(id, "");
    return true;
  }

  function validateSelectField(id, message) {
    var input = document.getElementById(id);
    if (!input) return true;
    if (!input.value) {
      setError(id, message || "Please select an option.");
      return false;
    }
    setError(id, "");
    return true;
  }
  var fileFields = [
    { input: "driver-upload-licence", allowedTypes: ALLOWED_DOC_TYPES, allowedExts: ALLOWED_DOC_EXTS, nameId: "driver-upload-licence-name", sizeId: "driver-upload-licence-size", errorId: "driver-upload-licence-error" },
    { input: "driver-upload-registration", allowedTypes: ALLOWED_DOC_TYPES, allowedExts: ALLOWED_DOC_EXTS, nameId: "driver-upload-registration-name", sizeId: "driver-upload-registration-size", errorId: "driver-upload-registration-error" },
    { input: "driver-upload-insurance", allowedTypes: ALLOWED_DOC_TYPES, allowedExts: ALLOWED_DOC_EXTS, nameId: "driver-upload-insurance-name", sizeId: "driver-upload-insurance-size", errorId: "driver-upload-insurance-error" },
    { input: "driver-upload-photo", allowedTypes: ALLOWED_PHOTO_TYPES, allowedExts: ALLOWED_PHOTO_EXTS, nameId: "driver-upload-photo-name", sizeId: "driver-upload-photo-size", errorId: "driver-upload-photo-error" }
  ];

  function findFileField(inputId) {
    for (var i = 0; i < fileFields.length; i++) {
      if (fileFields[i].input === inputId) return fileFields[i];
    }
    return null;
  }

  function updateFileDisplay(cfg, file) {
    var nameEl = document.getElementById(cfg.nameId);
    var sizeEl = document.getElementById(cfg.sizeId);
    if (!file) {
      nameEl.textContent = "No file selected";
      sizeEl.textContent = "";
      return;
    }
    nameEl.textContent = file.name;
    sizeEl.textContent = formatSize(file.size);
  }

  function validateFileField(cfg) {
    var input = document.getElementById(cfg.input);
    var container = input ? input.closest(".driver-upload") : null;
    var errEl = document.getElementById(cfg.errorId);
    if (container) container.classList.remove("is-error", "is-success");
    if (!input || !input.files || !input.files[0]) {
      if (container) container.classList.add("is-error");
      if (errEl) errEl.textContent = "Please select a file.";
      return false;
    }
    var file = input.files[0];
    var ext = getExt(file.name);
    var typeOk = cfg.allowedTypes.indexOf(file.type) !== -1 || cfg.allowedExts.indexOf(ext) !== -1;
    if (!typeOk) {
      if (container) container.classList.add("is-error");
      if (errEl) errEl.textContent = "Unsupported format. Allowed: " + cfg.allowedExts.join(", ").toUpperCase() + ".";
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      if (container) container.classList.add("is-error");
      if (errEl) errEl.textContent = "File exceeds the 5 MB maximum.";
      return false;
    }
    if (container) container.classList.add("is-success");
    if (errEl) errEl.textContent = "";
    return true;
  }

  function validateAccuracy() {
    var cb = document.getElementById("driver-accuracy-check");
    var err = document.getElementById("driver-accuracy-error");
    if (!cb || !cb.checked) {
      if (err) err.textContent = "You must confirm that your information is accurate.";
      return false;
    }
    if (err) err.textContent = "";
    return true;
  }

  function validateForm() {
    var ok = true;
    if (!validateRequiredText("driver-full-name", "Full name")) ok = false;
    if (!validateEmailField()) ok = false;
    if (!validatePhoneField()) ok = false;
    if (!validateRequiredText("driver-licence-number", "Driver's licence number")) ok = false;
    if (!validateRequiredText("driver-address", "Residential address")) ok = false;

    if (!validateRequiredText("driver-vehicle-make", "Vehicle make")) ok = false;
    if (!validateRequiredText("driver-vehicle-model", "Vehicle model")) ok = false;
    if (!validateYearField()) ok = false;
    if (!validateRequiredText("driver-vehicle-plate", "Registration / licence plate")) ok = false;
    if (!validateRequiredText("driver-vehicle-colour", "Vehicle colour")) ok = false;
    if (!validateSelectField("driver-vehicle-type", "Please select a vehicle type.")) ok = false;

    for (var i = 0; i < fileFields.length; i++) {
      if (!validateFileField(fileFields[i])) ok = false;
    }

    if (!validateAccuracy()) ok = false;
    return ok;
  }

  // Wire file inputs
  fileFields.forEach(function (cfg) {
    var input = document.getElementById(cfg.input);
    if (!input) return;
    input.addEventListener("change", function () {
      var file = (input.files && input.files[0]) ? input.files[0] : null;
      var container = input.closest(".driver-upload");
      if (container) container.classList.remove("is-error", "is-success");
      updateFileDisplay(cfg, file);
      if (file) validateFileField(cfg);
    });
  });

  // Live validation on blur for text fields
  var textFields = [
    "driver-full-name", "driver-licence-number", "driver-address",
    "driver-vehicle-make", "driver-vehicle-model", "driver-vehicle-plate", "driver-vehicle-colour"
  ];
  textFields.forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("blur", function () {
      validateRequiredText(id, null);
    });
    el.addEventListener("input", function () {
      if (el.classList.contains("is-error")) validateRequiredText(id, null);
    });
  });

  var emailEl = document.getElementById("driver-email");
  if (emailEl) {
    emailEl.addEventListener("blur", validateEmailField);
    emailEl.addEventListener("input", function () {
      if (emailEl.classList.contains("is-error")) validateEmailField();
    });
  }
  var phoneEl = document.getElementById("driver-phone");
  if (phoneEl) {
    phoneEl.addEventListener("blur", validatePhoneField);
    phoneEl.addEventListener("input", function () {
      if (phoneEl.classList.contains("is-error")) validatePhoneField();
    });
  }
  var yearEl = document.getElementById("driver-vehicle-year");
  if (yearEl) {
    yearEl.addEventListener("blur", validateYearField);
    yearEl.addEventListener("input", function () {
      if (yearEl.classList.contains("is-error")) validateYearField();
    });
  }
  var typeEl = document.getElementById("driver-vehicle-type");
  if (typeEl) {
    typeEl.addEventListener("change", function () {
      validateSelectField("driver-vehicle-type", "Please select a vehicle type.");
    });
  }
  var accEl = document.getElementById("driver-accuracy-check");
  if (accEl) {
    accEl.addEventListener("change", validateAccuracy);
  }

  function resetFormState() {
    form.reset();
    var errNodes = form.querySelectorAll(".form-error");
    errNodes.forEach(function (n) { n.textContent = ""; });
    var inputs = form.querySelectorAll(".form-input, .form-select, .form-textarea");
    inputs.forEach(function (i) { i.classList.remove("is-error"); });
    var uploads = form.querySelectorAll(".driver-upload");
    uploads.forEach(function (u) { u.classList.remove("is-error", "is-success"); });
    fileFields.forEach(function (cfg) {
      var nameEl = document.getElementById(cfg.nameId);
      var sizeEl = document.getElementById(cfg.sizeId);
      if (nameEl) nameEl.textContent = "No file selected";
      if (sizeEl) sizeEl.textContent = "";
    });
    submitted = false;
    isSubmitting = false;
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.classList.remove("is-loading");
      submitBtn.textContent = "Submit application";
    }
    if (successBox) successBox.hidden = true;
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      resetFormState();
      var first = document.getElementById("driver-full-name");
      if (first) first.focus();
    });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (submitted || isSubmitting) return;

    if (!validateForm()) {
      var firstInvalid = form.querySelector(".is-error");
      if (firstInvalid && typeof firstInvalid.focus === "function") firstInvalid.focus();
      if (typeof utils.showToast === "function") {
        utils.showToast("Please fix the highlighted errors before submitting.", "warning");
      }
      return;
    }

    isSubmitting = true;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.classList.add("is-loading");
      submitBtn.textContent = "Validating...";
    }

    window.setTimeout(function () {
      isSubmitting = false;
      submitted = true;
      if (submitBtn) {
        submitBtn.classList.remove("is-loading");
        submitBtn.textContent = "Application validated";
      }
      if (successBox) {
        successBox.hidden = false;
        try { successBox.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) {}
      }
      if (typeof utils.showToast === "function") {
        utils.showToast("Validation passed. No data was sent to a server.", "success");
      }
    }, 700);
  });
})();

