/* ==========================================================================
   authService.js — Small API service layer for authentication.
   Exposes `window.Gbera.authService` with register/login/requestPasswordReset.
   Swap the mock for real fetch by setting AUTH_CONFIG.useMock = false.
   ========================================================================== */

(function (global) {
  "use strict";

  global.Gbera = global.Gbera || {};

  var AUTH_CONFIG = {
    useMock: true,
    baseUrl: "",
    endpoints: {
      register: "/api/auth/register",
      login: "/api/auth/login",
      reset: "/api/auth/forgot-password"
    }
  };

  var STORAGE_KEY = "gbera_auth_session";
  var MOCK_USERS_KEY = "gbera_mock_users";

  function readMockUsers() {
    try {
      var raw = localStorage.getItem(MOCK_USERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      return [];
    }
  }

  function writeMockUsers(users) {
    try {
      localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
    } catch (err) {
      /* ignore */
    }
  }

  function delay(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  function makeToken() {
    return "mock_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  var mockAdapter = {
    register: async function register(role, data) {
      await delay(900);
      var users = readMockUsers();
      var exists = users.some(function (u) { return u.email.toLowerCase() === String(data.email).toLowerCase(); });
      if (exists) {
        var err = new Error("Email already registered");
        err.type = "validation";
        err.fields = { email: "An account with this email already exists." };
        throw err;
      }
      var user = {
        id: "u_" + Date.now().toString(36),
        role: role,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone
      };
      if (role === "driver") {
        user.licenceNumber = data.licenceNumber;
        user.vehicle = {
          make: data.vehicleMake,
          model: data.vehicleModel,
          year: data.vehicleYear,
          plateNumber: data.plateNumber,
          colour: data.vehicleColour
        };
      }
      var token = makeToken();
      users.push(Object.assign({}, user, { password: data.password }));
      writeMockUsers(users);
      return { token: token, user: user };
    },
    login: async function login(role, credentials) {
      await delay(900);
      var users = readMockUsers();
      var user = users.find(function (u) {
        return u.email.toLowerCase() === String(credentials.identifier).toLowerCase() ||
               u.phone === credentials.identifier;
      });
      if (!user || user.password !== credentials.password || user.role !== role) {
        var err = new Error("Invalid credentials");
        err.type = "auth";
        err.message = "Incorrect email/phone or password.";
        throw err;
      }
      return { token: makeToken(), user: {
        id: user.id, role: user.role, fullName: user.fullName, email: user.email, phone: user.phone
      } };
    },
    requestPasswordReset: async function requestPasswordReset(email) {
      await delay(900);
      return { message: "If an account exists for that email, a reset link has been sent." };
    }
  };

  var realAdapter = {
    register: async function register(role, data) {
      var res = await fetch(AUTH_CONFIG.baseUrl + AUTH_CONFIG.endpoints.register, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.assign({ role: role }, data))
      });
      var json = await res.json().catch(function () { return {}; });
      if (!res.ok) {
        var err = new Error(json.message || "Registration failed");
        err.type = res.status === 422 ? "validation" : "server";
        err.fields = json.fields || null;
        err.status = res.status;
        throw err;
      }
      return json;
    },
    login: async function login(role, credentials) {
      var res = await fetch(AUTH_CONFIG.baseUrl + AUTH_CONFIG.endpoints.login, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.assign({ role: role }, credentials))
      });
      var json = await res.json().catch(function () { return {}; });
      if (!res.ok) {
        var err = new Error(json.message || "Login failed");
        err.type = res.status === 401 ? "auth" : "server";
        err.status = res.status;
        throw err;
      }
      return json;
    },
    requestPasswordReset: async function requestPasswordReset(email) {
      var res = await fetch(AUTH_CONFIG.baseUrl + AUTH_CONFIG.endpoints.reset, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email })
      });
      var json = await res.json().catch(function () { return {}; });
      if (!res.ok) {
        var err = new Error(json.message || "Request failed");
        err.type = "server";
        throw err;
      }
      return json;
    }
  };

  function getAdapter() {
    return AUTH_CONFIG.useMock ? mockAdapter : realAdapter;
  }

  global.Gbera.authService = {
    config: AUTH_CONFIG,
    register: function (role, data) { return getAdapter().register(role, data); },
    login: function (role, credentials) { return getAdapter().login(role, credentials); },
    requestPasswordReset: function (email) { return getAdapter().requestPasswordReset(email); },
    storageKey: STORAGE_KEY
  };
})(window);
