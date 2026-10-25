/* ==========================================================================
   book-ride.js — Page logic for the Book a Ride page.
   Uses shared Gbera.utils. No frameworks.
   ========================================================================== */

(function (global) {
  "use strict";

  var RIDE_TYPES = {
    bike: { name: "Bike", base: 300, rate: 80 },
    economy: { name: "Economy", base: 500, rate: 120 },
    comfort: { name: "Comfort", base: 800, rate: 180 }
  };

  function $(id) { return document.getElementById(id); }

  function hashString(str) {
    var hash = 0;
    if (!str) return hash;
    for (var i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  function estimateDistance(pickup, destination) {
    var combined = (pickup || "") + "|" + (destination || "");
    var h = hashString(combined.toLowerCase().trim());
    return 5 + (h % 21);
  }

  function roundToNearest(value, step) {
    step = step || 50;
    return Math.round(value / step) * step;
  }

  function getSelectedRideType() {
    var radios = document.querySelectorAll('input[name="rideType"]');
    for (var i = 0; i < radios.length; i++) {
      if (radios[i].checked) return radios[i].value;
    }
    return "economy";
  }

  function computeFare() {
    var pickup = $("pickup").value.trim();
    var destination = $("destination").value.trim();
    var type = getSelectedRideType();
    var info = RIDE_TYPES[type] || RIDE_TYPES.economy;

    if (!pickup || !destination) {
      return null;
    }

    var distance = estimateDistance(pickup, destination);
    var eta = Math.round(distance * 3);
    var fare = roundToNearest(info.base + info.rate * distance, 50);

    return {
      type: type,
      name: info.name,
      base: info.base,
      rate: info.rate,
      distance: distance,
      eta: eta,
      fare: fare
    };
  }
  function renderFare(result) {
    var empty = $("fare-empty");
    var details = $("fare-details");
    var badge = $("fare-badge");
    var amount = $("fare-amount");
    var typeLabel = $("fare-type-label");
    var distance = $("fare-distance");
    var eta = $("fare-eta");
    var base = $("fare-base");
    var rate = $("fare-rate");
    var bookBtn = $("book-btn");
    var status = $("form-status");

    if (!result) {
      if (empty) empty.hidden = false;
      if (details) details.hidden = true;
      if (badge) { badge.textContent = "Awaiting details"; badge.className = "badge badge-neutral"; }
      if (bookBtn) bookBtn.disabled = true;
      if (status) status.textContent = "";
      return;
    }

    var utils = (global.Gbera && global.Gbera.utils) || {};
    var formatCurrency = utils.formatCurrency || function (v) { return "₦" + v; };

    if (empty) empty.hidden = true;
    if (details) details.hidden = false;
    if (badge) { badge.textContent = "Estimated"; badge.className = "badge badge-success"; }
    if (amount) amount.textContent = formatCurrency(result.fare);
    if (typeLabel) typeLabel.textContent = result.name + " ride";
    if (distance) distance.textContent = result.distance + " km";
    if (eta) eta.textContent = result.eta + " min";
    if (base) base.textContent = formatCurrency(result.base);
    if (rate) rate.textContent = formatCurrency(result.rate) + " / km";
    if (bookBtn) bookBtn.disabled = false;
    if (status) status.textContent = "Estimate ready. Review and book when ready.";
  }

  function getEstimate() {
    var result = computeFare();
    renderFare(result);
    if (result) {
      var status = $("form-status");
      if (status) status.textContent = "Fare estimated for " + result.name + ".";
    } else {
      var s = $("form-status");
      if (s) s.textContent = "Please enter both pickup and destination.";
      var utils = (global.Gbera && global.Gbera.utils) || {};
      if (typeof utils.showToast === "function") {
        utils.showToast("Please enter both pickup and destination.", "warning");
      }
    }
    return result;
  }

  function bookRide() {
    var result = computeFare();
    if (!result) {
      getEstimate();
      return;
    }
    var pickup = $("pickup").value.trim();
    var destination = $("destination").value.trim();
    var notes = ($("notes") && $("notes").value.trim()) || "";

    var booking = {
      pickup: pickup,
      destination: destination,
      rideType: result.type,
      fare: result.fare,
      distance: result.distance,
      eta: result.eta,
      notes: notes,
      createdAt: new Date().toISOString()
    };

    try {
      var utils = (global.Gbera && global.Gbera.utils) || {};
      if (utils.storage && typeof utils.storage.save === "function") {
        utils.storage.save("gbera_last_booking", booking);
      }
    } catch (e) { /* ignore */ }

    var confirmType = $("confirm-type");
    var confirmDetails = $("confirm-details");
    if (confirmType) confirmType.textContent = result.name;
    if (confirmDetails) {
      var utils2 = (global.Gbera && global.Gbera.utils) || {};
      var fc = utils2.formatCurrency || function (v) { return "₦" + v; };
      confirmDetails.textContent = "From " + pickup + " to " + destination + " · " + result.distance + " km · " + fc(result.fare);
    }

    if (typeof global.openModal === "function") {
      global.openModal("booking-modal");
    } else {
      var modal = $("booking-modal");
      if (modal) {
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        var backdrop = document.querySelector('.modal-backdrop[data-modal-backdrop="booking-modal"]');
        if (backdrop) backdrop.classList.add("is-open");
      }
    }

    var utils3 = (global.Gbera && global.Gbera.utils) || {};
    if (typeof utils3.showToast === "function") {
      utils3.showToast("Ride booked! A driver will be assigned shortly.", "success");
    }
  }

  function swapLocations() {
    var pickup = $("pickup");
    var destination = $("destination");
    if (!pickup || !destination) return;
    var tmp = pickup.value;
    pickup.value = destination.value;
    destination.value = tmp;
    getEstimate();
  }

  function init() {
    var estimateBtn = $("estimate-btn");
    var bookBtn = $("book-btn");
    var pickup = $("pickup");
    var destination = $("destination");
    var form = $("book-ride-form");

    if (estimateBtn) estimateBtn.addEventListener("click", getEstimate);
    if (bookBtn) bookBtn.addEventListener("click", bookRide);

    var swap = document.createElement("button");
    swap.type = "button";
    swap.className = "br-swap";
    swap.setAttribute("aria-label", "Swap pickup and destination");
    swap.innerHTML = "⇄";
    var connector = document.querySelector(".br-connector");
    if (connector && connector.parentNode) {
      connector.appendChild(swap);
    }
    swap.addEventListener("click", swapLocations);

    function autoEstimate() {
      if (pickup.value.trim() && destination.value.trim()) {
        getEstimate();
      } else {
        renderFare(null);
      }
    }

    var autoDebounced = (global.Gbera && global.Gbera.utils && global.Gbera.utils.debounce)
      ? global.Gbera.utils.debounce(autoEstimate, 700)
      : autoEstimate;

    if (pickup) pickup.addEventListener("input", autoDebounced);
    if (destination) destination.addEventListener("input", autoDebounced);

    var radios = document.querySelectorAll('input[name="rideType"]');
    for (var i = 0; i < radios.length; i++) {
      radios[i].addEventListener("change", function () {
        if (pickup.value.trim() && destination.value.trim()) {
          getEstimate();
        }
      });
    }

    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        bookRide();
      });
    }

    renderFare(null);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window);

