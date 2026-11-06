/* ==========================================================================
   ride-tracking.js — Page logic for the Ride Tracking (Live Trip) page.
   Uses shared Gbera.utils. No frameworks. Mock data only.
   ========================================================================== */

(function (global) {
  "use strict";

  // ------------------------------------------------------------------
  // MOCK DATA — replace this object with real API responses later.
  // ------------------------------------------------------------------
  var MOCK_RIDE_DATA = {
    rideId: "ride-001",
    driver: {
      name: "James Daniel",
      initials: "JD",
      rating: 4.9,
      trips: 124,
      phone: "+2348012345678"
    },
    vehicle: {
      model: "Toyota Corolla",
      colour: "White",
      plate: "LAG · 789 XYZ"
    },
    status: "Driver is on the way", // human-readable status text
    statusKey: "on-the-way",        // "on-the-way" | "arrived" | "in-progress"
    etaMinutes: 4                   // estimated minutes until arrival
  };

  // ETA countdown ticks once per real minute (60s). Adjust the interval for
  // demos/tests; in production the ETA would come from live location updates.
  var ETA_TICK_INTERVAL = 60 * 1000;

  var etaRemaining = MOCK_RIDE_DATA.etaMinutes;
  var etaIntervalId = null;

  // ------------------------------------------------------------------
  // DOM helpers
  // ------------------------------------------------------------------
  function $(id) {
    return document.getElementById(id);
  }

  function setText(id, text) {
    var el = $(id);
    if (el) el.textContent = text;
  }

  // ------------------------------------------------------------------
  // Rendering
  // ------------------------------------------------------------------
  function applyStatusColour() {
    var dot = $("rt-status-dot");
    if (!dot) return;
    dot.className = "rt-status-dot";
    if (MOCK_RIDE_DATA.statusKey === "arrived") {
      dot.classList.add("rt-status-dot--arrived");
    } else if (MOCK_RIDE_DATA.statusKey === "in-progress") {
      dot.classList.add("rt-status-dot--in-progress");
    }
    // "on-the-way" keeps the default green dot.
  }

  function render() {
    setText("driver-name", MOCK_RIDE_DATA.driver.name);
    var avatar = $("rt-driver-avatar");
    if (avatar) avatar.textContent = MOCK_RIDE_DATA.driver.initials;

    setText("driver-vehicle", MOCK_RIDE_DATA.vehicle.model);
    setText("driver-colour", MOCK_RIDE_DATA.vehicle.colour);
    setText("driver-plate", MOCK_RIDE_DATA.vehicle.plate);
    setText("trip-status", MOCK_RIDE_DATA.status);

    var callLink = $("rt-call-driver");
    if (callLink) {
      callLink.href = "tel:" + MOCK_RIDE_DATA.driver.phone;
      callLink.setAttribute("aria-label", "Call driver " + MOCK_RIDE_DATA.driver.name);
    }

    applyStatusColour();
    updateEtaDisplay();
  }

  function updateEtaDisplay() {
    var el = $("eta-display");
    if (!el) return;
    if (etaRemaining > 0) {
      el.textContent = etaRemaining + " min";
    } else {
      el.textContent = "Arriving now";
    }
  }

  // ------------------------------------------------------------------
  // ETA countdown
  // ------------------------------------------------------------------
  function startEtaCountdown() {
    stopEtaCountdown();
    updateEtaDisplay();
    etaIntervalId = setInterval(function () {
      if (etaRemaining > 0) {
        etaRemaining -= 1;
        updateEtaDisplay();
        if (etaRemaining === 0) {
          stopEtaCountdown();
        }
      }
    }, ETA_TICK_INTERVAL);
  }

  function stopEtaCountdown() {
    if (etaIntervalId) {
      clearInterval(etaIntervalId);
      etaIntervalId = null;
    }
  }

  // ------------------------------------------------------------------
  // Cancel ride flow
  // ------------------------------------------------------------------
  function showCancelledState() {
    stopEtaCountdown();

    var actions = $("rt-actions");
    var cancelled = $("rt-cancelled-state");
    var eta = $("eta-display");
    var status = $("trip-status");

    if (actions) actions.classList.add("hide");
    if (cancelled) cancelled.classList.remove("hide");
    if (eta) eta.textContent = "—";
    if (status) status.textContent = "Ride cancelled";

    // TODO: Call the backend ride cancellation API here.
    // Example:
    //   await Gbera.utils.api.cancelRide(MOCK_RIDE_DATA.rideId);
    //   Gbera.utils.showToast("Ride cancelled.", "info");

    var utils = (global.Gbera && global.Gbera.utils) || {};
    if (typeof utils.showToast === "function") {
      utils.showToast("Ride cancelled.", "info");
    }
  }

  // ------------------------------------------------------------------
  // Initialisation
  // ------------------------------------------------------------------
  function init() {
    render();
    startEtaCountdown();

    var confirmCancelBtn = $("confirm-cancel-btn");
    if (confirmCancelBtn) {
      confirmCancelBtn.addEventListener("click", function () {
        // The button also has data-modal-close, so main.js closes the modal.
        showCancelledState();
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window);