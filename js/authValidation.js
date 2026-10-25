/* ==========================================================================
   authValidation.js — Shared validators and field configs for auth forms.
   Exposes `window.Gbera.authValidation`.
   ========================================================================== */

(function (global) {
  "use strict";

  global.Gbera = global.Gbera || {};
  var utils = (global.Gbera && global.Gbera.utils) || {};

  function trim(v) { return (v == null ? "" : String(v)).trim(); }

  function required(value, label) {
    label = label || "This field";
    return trim(value) ? "" : label + " is required.";
  }

  function email(value) {
    var r = required(value, "Email");
    if (r) return r;
    var v = trim(value);
    if (typeof utils.isValidEmail === "function" && !utils.isValidEmail(v)) {
      return "Enter a valid email address.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Enter a valid email address.";
    return "";
  }

  function phone(value) {
    var r = required(value, "Phone number");
    if (r) return r;
    var v = trim(value);
    if (typeof utils.isValidPhone === "function" && !utils.isValidPhone(v)) {
      return "Enter a valid Nigerian phone number.";
    }
    return "";
  }

  function password(value) {
    var r = required(value, "Password");
    if (r) return r;
    var v = String(value);
    if (v.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Za-z]/.test(v)) return "Password must contain at least one letter.";
    if (!/[0-9]/.test(v)) return "Password must contain at least one number.";
    return "";
  }

  function passwordStrength(value) {
    var v = String(value || "");
    var score = 0;
    if (v.length >= 8) score++;
    if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
    if (/[0-9]/.test(v)) score++;
    if (/[^A-Za-z0-9]/.test(v)) score++;
    if (v.length >= 12) score++;
    if (score <= 2) return "weak";
    if (score <= 3) return "medium";
    return "strong";
  }

  function confirmPassword(value, values) {
    var r = required(value, "Confirm password");
    if (r) return r;
    if (trim(value) !== trim(values && values.password)) return "Passwords do not match.";
    return "";
  }

  function identifier(value) {
    var r = required(value, "Email or phone");
    if (r) return r;
    var v = trim(value);
    var isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    var cleaned = v.replace(/[\s\-()]/g, "");
    var isPhone = (typeof utils.isValidPhone === "function") ? utils.isValidPhone(v) : /^0[789][01]\d{8}$/.test(cleaned);
    if (!isEmail && !isPhone) return "Enter a valid email or Nigerian phone number.";
    return "";
  }

  function licenceNumber(value) {
    var r = required(value, "Licence number");
    if (r) return r;
    if (!/^[A-Za-z0-9-]{5,20}$/.test(trim(value))) return "Enter a valid licence number.";
    return "";
  }

  function vehicleMake(value) { return required(value, "Vehicle make"); }
  function vehicleModel(value) { return required(value, "Vehicle model"); }

  function vehicleYear(value) {
    var r = required(value, "Vehicle year");
    if (r) return r;
    var v = trim(value);
    if (!/^\d{4}$/.test(v)) return "Enter a 4-digit year.";
    var y = parseInt(v, 10);
    var now = new Date().getFullYear();
    if (y < 1980 || y > now + 1) return "Year must be between 1980 and " + (now + 1) + ".";
    return "";
  }

  function plateNumber(value) {
    var r = required(value, "Plate number");
    if (r) return r;
    if (!/^[A-Za-z0-9-]{6,12}$/.test(trim(value))) return "Enter a valid plate number.";
    return "";
  }

  function vehicleColour(value) { return required(value, "Vehicle colour"); }
  function fullName(value) { return required(value, "Full name"); }
  function terms(value) { return value ? "" : "You must accept the terms and conditions."; }

  function fileUpload(file) {
    if (!file) return "Please upload your licence document.";
    var allowed = ["image/jpeg", "image/png", "application/pdf"];
    if (allowed.indexOf(file.type) === -1) return "Allowed types: JPG, PNG, PDF.";
    if (file.size > 5 * 1024 * 1024) return "File must be 5MB or smaller.";
    return "";
  }




  var loginFields = [
    { name: "identifier", label: "Email or phone", validate: identifier },
    { name: "password", label: "Password", validate: password }
  ];

  var riderFields = [
    { name: "fullName", label: "Full name", validate: fullName },
    { name: "email", label: "Email", validate: email },
    { name: "phone", label: "Phone number", validate: phone },
    { name: "password", label: "Password", validate: password },
    { name: "confirmPassword", label: "Confirm password", validate: confirmPassword },
    { name: "terms", label: "Terms", validate: terms }
  ];

  var driverExtraFields = [
    { name: "licenceNumber", label: "Driver's licence number", validate: licenceNumber },
    { name: "vehicleMake", label: "Vehicle make", validate: vehicleMake },
    { name: "vehicleModel", label: "Vehicle model", validate: vehicleModel },
    { name: "vehicleYear", label: "Vehicle year", validate: vehicleYear },
    { name: "plateNumber", label: "Plate number", validate: plateNumber },
    { name: "vehicleColour", label: "Vehicle colour", validate: vehicleColour },
    { name: "licenceDoc", label: "Licence document", validate: function (v, values, file) { return fileUpload(file); } }
  ];

  function validateField(cfg, value, values, file) {
    if (!cfg || !cfg.validate) return "";
    return cfg.validate(value, values, file);
  }

  function validateForm(configs, values, files) {
    files = files || {};
    var errors = {};
    var firstInvalid = null;
    (configs || []).forEach(function (cfg) {
      var val = (values && (cfg.name in values)) ? values[cfg.name] : "";
      var err = validateField(cfg, val, values, files[cfg.name]);
      if (err) {
        errors[cfg.name] = err;
        if (!firstInvalid) firstInvalid = cfg.name;
      }
    });
    return { errors: errors, firstInvalid: firstInvalid, valid: Object.keys(errors).length === 0 };
  }

  global.Gbera.authValidation = {
    trim: trim,
    required: required,
    email: email,
    phone: phone,
    password: password,
    passwordStrength: passwordStrength,
    confirmPassword: confirmPassword,
    identifier: identifier,
    licenceNumber: licenceNumber,
    vehicleMake: vehicleMake,
    vehicleModel: vehicleModel,
    vehicleYear: vehicleYear,
    plateNumber: plateNumber,
    vehicleColour: vehicleColour,
    fullName: fullName,
    terms: terms,
    fileUpload: fileUpload,
    loginFields: loginFields,
    riderFields: riderFields,
    driverExtraFields: driverExtraFields,
    validateField: validateField,
    validateForm: validateForm
  };
})(window);
