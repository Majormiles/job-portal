export const initPlugins = async () => {
  return new Promise((resolve) => {
    // Initialize Feather Icons
    if (window.feather) {
      window.feather.replace();
    }

    // Initialize ApexCharts
    if (window.ApexCharts) {
      // Charts will be initialized in their respective components
    }

    // Initialize jQuery plugins if jQuery is available
    if (window.jQuery) {
      window.jQuery(document).ready(function() {
        // Initialize any jQuery plugins here
        if (window.jQuery.fn.tooltip) {
          window.jQuery('[data-toggle="tooltip"]').tooltip();
        }
        if (window.jQuery.fn.popover) {
          window.jQuery('[data-toggle="popover"]').popover();
        }
        if (window.jQuery.fn.dropdown) {
          window.jQuery('.dropdown-toggle').dropdown();
        }
      });
    }

    // Initialize PerfectScrollbar if available
    if (window.PerfectScrollbar) {
      const scrollables = document.querySelectorAll('.scroll-container');
      scrollables.forEach(scrollable => {
        new window.PerfectScrollbar(scrollable);
      });
    }

    // Resolve after a short delay to ensure all plugins are initialized
    setTimeout(resolve, 100);
  });
}; 