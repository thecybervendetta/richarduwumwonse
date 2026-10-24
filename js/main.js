// ===== Richard Uwumwonse - Main Site Logic =====

document.addEventListener("DOMContentLoaded", function () {
  // --- 1. Theme Toggle (Editorial Paper vs Midnight Terminal) ---
  var themeToggle = document.getElementById("theme-toggle");
  var storedTheme = localStorage.getItem("portfolio-theme");
  var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  var currentTheme = storedTheme || (prefersDark ? "terminal" : "paper");

  function applyTheme(theme) {
    if (theme === "terminal") {
      document.documentElement.setAttribute("data-theme", "terminal");
      if (themeToggle) {
        themeToggle.innerHTML = '<span class="theme-icon" aria-hidden="true">&#9788;</span> <span class="theme-label">Paper</span>';
        themeToggle.setAttribute("aria-label", "Switch to paper theme");
      }
    } else {
      document.documentElement.removeAttribute("data-theme");
      if (themeToggle) {
        themeToggle.innerHTML = '<span class="theme-icon" aria-hidden="true">&#9680;</span> <span class="theme-label">Terminal</span>';
        themeToggle.setAttribute("aria-label", "Switch to terminal theme");
      }
    }
    localStorage.setItem("portfolio-theme", theme);
  }

  applyTheme(currentTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var activeTheme = document.documentElement.getAttribute("data-theme") === "terminal" ? "paper" : "terminal";
      applyTheme(activeTheme);
    });
  }

  // --- 2. Benin City Live Time Indicator (WAT: UTC+1) ---
  function updateBeninTime() {
    var clocks = document.querySelectorAll(".city-clock");
    if (!clocks.length) return;
    try {
      var formatter = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Africa/Lagos",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
      var timeStr = formatter.format(new Date());
      clocks.forEach(function (clock) {
        clock.textContent = timeStr + " WAT";
      });
    } catch (e) {
      // Fallback
      var now = new Date();
      var utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      var wat = new Date(utc + (3600000 * 1));
      var h = wat.getHours();
      var m = wat.getMinutes();
      var ampm = h >= 12 ? "pm" : "am";
      h = h % 12;
      h = h ? h : 12;
      var str = h + ":" + (m < 10 ? "0" + m : m) + " " + ampm + " WAT";
      clocks.forEach(function (clock) { clock.textContent = str; });
    }
  }
  updateBeninTime();
  setInterval(updateBeninTime, 30000);

  // --- 3. Mobile Navigation Menu Toggle ---
  var menuToggle = document.querySelector(".menu-toggle");
  var navCluster = document.querySelector(".nav-cluster");
  if (menuToggle && navCluster) {
    menuToggle.addEventListener("click", function () {
      navCluster.classList.toggle("open");
      var isOpen = navCluster.classList.contains("open");
      menuToggle.setAttribute("aria-expanded", isOpen);
      menuToggle.innerHTML = isOpen ? "&times;" : "&#9776;";
    });
  }

  // --- 4. Footer Year ---
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // --- 5. Global Copy to Clipboard Buttons ---
  document.querySelectorAll(".copy-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var textToCopy = btn.getAttribute("data-copy") || "";
      if (!textToCopy) return;

      navigator.clipboard.writeText(textToCopy).then(function () {
        var originalText = btn.textContent;
        btn.textContent = "Copied!";
        btn.classList.add("copied");
        setTimeout(function () {
          btn.textContent = originalText;
          btn.classList.remove("copied");
        }, 2000);
      }).catch(function () {
        // Fallback prompt
        window.prompt("Copy to clipboard:", textToCopy);
      });
    });
  });

  // --- 6. Lightbox Modal for Project Images (HTML5 Dialog Top Layer) ---
  var lightbox = document.getElementById("lightbox-modal");
  var lightboxImg = document.getElementById("lightbox-img");
  var lightboxCaption = document.getElementById("lightbox-caption");
  var lightboxClose = document.getElementById("lightbox-close");

  if (lightbox && lightboxImg) {
    function openLightbox(img) {
      if (!img || !img.src) return;
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || "Project screenshot preview";
      if (lightboxCaption) {
        lightboxCaption.textContent = img.alt || "";
      }
      try {
        if (typeof lightbox.showModal === "function") {
          lightbox.showModal();
        } else {
          lightbox.setAttribute("open", "");
        }
      } catch (err) {
        lightbox.setAttribute("open", "");
      }
    }

    function closeLightbox() {
      try {
        if (typeof lightbox.close === "function") {
          lightbox.close();
        } else {
          lightbox.removeAttribute("open");
        }
      } catch (err) {
        lightbox.removeAttribute("open");
      }
    }

    // Attach to all project image containers
    document.querySelectorAll(".shot, .photo").forEach(function (shot) {
      var img = shot.querySelector("img");
      if (!img) return;

      shot.addEventListener("click", function (e) {
        if (e.target.tagName === "A") return;
        openLightbox(img);
      });
    });

    if (lightboxClose) {
      lightboxClose.addEventListener("click", function (e) {
        e.stopPropagation();
        closeLightbox();
      });
    }

    // When clicking on the backdrop outside the dialog contents
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    // Native cancel event on <dialog>
    lightbox.addEventListener("cancel", function () {
      closeLightbox();
    });
  }

  // --- 7. Intersection Observer for Scroll Reveals ---
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.08 });
    reveals.forEach(function (el) { obs.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("visible"); });
  }

  // --- 8. Project Filter Controls ---
  var filterButtons = document.querySelectorAll(".filter-btn");
  var projects = document.querySelectorAll(".project");
  if (filterButtons.length && projects.length) {
    filterButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var category = btn.getAttribute("data-category");
        filterButtons.forEach(function (b) {
          b.classList.remove("active");
          b.setAttribute("aria-selected", "false");
        });
        btn.classList.add("active");
        btn.setAttribute("aria-selected", "true");

        projects.forEach(function (proj) {
          var projCategory = proj.getAttribute("data-category");
          if (category === "all" || projCategory === category) {
            proj.classList.remove("hidden");
          } else {
            proj.classList.add("hidden");
          }
        });
      });
    });
  }
});
