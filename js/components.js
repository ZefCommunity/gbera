/* ==========================================================================
   components.js — Shared component injection (navbar + footer).
   Exposes `Gbera.components.renderNavbar()` and `Gbera.components.renderFooter()`.
   ========================================================================== */

(function (global) {
  "use strict";

  global.Gbera = global.Gbera || {};
  global.Gbera.components = global.Gbera.components || {};

  var components = global.Gbera.components;

  /* -----------------------------------------------------------------------
     LINK CONFIG — update filenames/labels here only.
     Paths are relative to the project root; resolved for /pages/ automatically.
     ----------------------------------------------------------------------- */
  var NAV_CONFIG = {
    brand: "Gbera",
    brandTagline: "Ride with trust",
    links: [
      { label: "Home", href: "index.html" },
      { label: "Book a Ride", href: "pages/book-ride.html" },
      { label: "Drive with Us", href: "pages/driver-onboarding.html" },
      { label: "Ride History", href: "pages/ride-history.html" },
      { label: "Profile", href: "pages/profile.html" }
    ],
    auth: { label: "Login / Sign Up", href: "pages/auth.html" }
  };

  var FOOTER_LINKS = {
    company: [
      { label: "About Us", href: "index.html" },
      { label: "Drive with Us", href: "pages/driver-onboarding.html" },
      { label: "Careers", href: "index.html" }
    ],
    riders: [
      { label: "Book a Ride", href: "pages/book-ride.html" },
      { label: "Ride Tracking", href: "pages/ride-tracking.html" },
      { label: "Ride History", href: "pages/ride-history.html" }
    ],
    support: [
      { label: "Help Center", href: "index.html" },
      { label: "Safety", href: "index.html" },
      { label: "Contact", href: "index.html" }
    ]
  };

  function isPagesDir() {
    var path = (global.location && global.location.pathname) || "";
    return path.indexOf("/pages/") !== -1 || path.indexOf("\\pages\\") !== -1;
  }

  function resolveHref(href) {
    if (isPagesDir()) {
      return "../" + href;
    }
    return href;
  }

  function currentPageName() {
    var path = (global.location && global.location.pathname) || "";
    var parts = path.split(/[\\/]/);
    var last = parts[parts.length - 1] || "";
    if (!last || last.indexOf(".") === -1) {
      return "index.html";
    }
    return last.toLowerCase();
  }

  function isActive(href) {
    var linkName = (href.split("/").pop() || "").toLowerCase();
    return linkName === currentPageName();
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
  /**
   * Render the shared navbar into #gbera-navbar.
   */
  components.renderNavbar = function renderNavbar() {
    var mount = document.getElementById("gbera-navbar");
    if (!mount) return;

    var linksHtml = NAV_CONFIG.links.map(function (link) {
      var activeClass = isActive(link.href) ? " active" : "";
      return (
        '<li><a href="' + resolveHref(link.href) + '" class="' + activeClass.trim() + '">' +
        escapeHtml(link.label) + "</a></li>"
      );
    }).join("");

    var authHref = resolveHref(NAV_CONFIG.auth.href);
    var authActive = isActive(NAV_CONFIG.auth.href) ? " active" : "";

    mount.innerHTML =
      '<nav class="navbar" role="navigation" aria-label="Main navigation">' +
        '<div class="container">' +
          '<div class="navbar-inner">' +
            '<a class="navbar-brand" href="' + resolveHref("index.html") + '">' +
              '<span class="navbar-brand__logo" aria-hidden="true">G</span>' +
              '<span>' + escapeHtml(NAV_CONFIG.brand) + '</span>' +
            '</a>' +
            '<button class="navbar-toggle" type="button" aria-label="Toggle menu" aria-expanded="false" data-navbar-toggle>' +
              '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
                '<line x1="3" y1="6" x2="21" y2="6"></line>' +
                '<line x1="3" y1="12" x2="21" y2="12"></line>' +
                '<line x1="3" y1="18" x2="21" y2="18"></line>' +
              '</svg>' +
            '</button>' +
            '<div class="navbar-menu">' +
              '<ul class="navbar-links">' + linksHtml + '</ul>' +
              '<div class="navbar-actions">' +
                '<a class="btn btn-primary btn-sm' + authActive + '" href="' + authHref + '">' +
                  escapeHtml(NAV_CONFIG.auth.label) +
                '</a>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</nav>';
  };

  /**
   * Render the shared footer into #gbera-footer.
   */
  components.renderFooter = function renderFooter() {
    var mount = document.getElementById("gbera-footer");
    if (!mount) return;

    function column(title, items) {
      var itemsHtml = items.map(function (item) {
        return '<li><a href="' + resolveHref(item.href) + '">' + escapeHtml(item.label) + '</a></li>';
      }).join("");
      return (
        '<div class="footer-col">' +
          '<h4>' + escapeHtml(title) + '</h4>' +
          '<ul>' + itemsHtml + '</ul>' +
        '</div>'
      );
    }

    var year = new Date().getFullYear();

    mount.innerHTML =
      '<footer class="footer">' +
        '<div class="container">' +
          '<div class="footer-grid">' +
            '<div class="footer-col">' +
              '<h4>' + escapeHtml(NAV_CONFIG.brand) + '</h4>' +
              '<p style="color:var(--color-neutral-400);">' +
                'A modern, friendly ride-hailing service. Book rides, track trips, and travel with confidence.' +
              '</p>' +
            '</div>' +
            column("Company", FOOTER_LINKS.company) +
            column("Riders", FOOTER_LINKS.riders) +
            column("Support", FOOTER_LINKS.support) +
          '</div>' +
          '<div class="footer-bottom">' +
            '<span>&copy; ' + year + ' ' + escapeHtml(NAV_CONFIG.brand) + '. All rights reserved.</span>' +
            '<span>Built with care in Nigeria.</span>' +
          '</div>' +
        '</div>' +
      '</footer>';
  };
})(window);

