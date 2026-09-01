(function () {
  "use strict";

  var EMAIL = "fernando.casas@ingenieriacasas.cl";

  /* ============================================================ HEADER == */
  var header = document.getElementById("siteHeader");
  var backToTop = document.getElementById("backToTop");

  function onScroll() {
    header.classList.toggle("scrolled", window.scrollY > 40);
    backToTop.classList.toggle("show", window.scrollY > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  backToTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ======================================================== MOBILE NAV == */
  var navToggle = document.getElementById("navToggle");
  var mainNav = document.getElementById("mainNav");
  var navScrim = document.getElementById("navScrim");

  function closeNav() {
    navToggle.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    mainNav.classList.remove("mobile-open");
    navScrim.classList.remove("show");
    document.body.style.overflow = "";
  }

  navToggle.addEventListener("click", function () {
    var isOpen = mainNav.classList.toggle("mobile-open");
    navToggle.classList.toggle("open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navScrim.classList.toggle("show", isOpen);
    document.body.style.overflow = isOpen ? "hidden" : "";
  });

  navScrim.addEventListener("click", closeNav);
  mainNav.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", closeNav);
  });

  /* ========================================================= SCROLL SPY == */
  var navAnchors = document.querySelectorAll("[data-nav]");
  var spySections = [];
  navAnchors.forEach(function (a) {
    var el = document.querySelector(a.getAttribute("href"));
    if (el) spySections.push(el);
  });

  if ("IntersectionObserver" in window && spySections.length) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          navAnchors.forEach(function (a) {
            a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id);
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    spySections.forEach(function (s) { spy.observe(s); });
  }

  /* ============================================================ REVEAL == */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var revealObs = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(function (el) { revealObs.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* ================================================== CONTADORES DEL HERO */
  function formatNumber(value, format) {
    if (format === "thousand") return value.toLocaleString("es-CL");
    return String(value);
  }

  function animateCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    var format = el.getAttribute("data-format");
    var duration = 1600;
    var start = null;

    function step(ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      // easeOutCubic
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = formatNumber(Math.round(target * eased), format) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window && counters.length) {
    var counterObs = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (c) { counterObs.observe(c); });
  } else {
    counters.forEach(function (c) {
      c.textContent =
        formatNumber(parseInt(c.getAttribute("data-count"), 10), c.getAttribute("data-format")) +
        (c.getAttribute("data-suffix") || "");
    });
  }

  /* ==================================================== FILTROS DE OBRAS */
  var filtros = document.querySelectorAll(".filtro");
  var obras = Array.prototype.slice.call(document.querySelectorAll(".obra"));

  filtros.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var filter = btn.getAttribute("data-filter");

      filtros.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");

      obras.forEach(function (obra) {
        var cats = obra.getAttribute("data-cat") || "";
        var match = filter === "todas" || cats.split(/\s+/).indexOf(filter) !== -1;
        obra.classList.toggle("hide", !match);
      });
    });
  });

  /* ========================================================== LIGHTBOX == */
  var lightbox = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbTitle = document.getElementById("lbTitle");
  var lbDesc = document.getElementById("lbDesc");
  var lbClose = document.getElementById("lbClose");
  var lbPrev = document.getElementById("lbPrev");
  var lbNext = document.getElementById("lbNext");
  var currentIndex = 0;

  function visibleObras() {
    return obras.filter(function (o) { return !o.classList.contains("hide"); });
  }

  function showObra(index) {
    var list = visibleObras();
    if (!list.length) return;
    currentIndex = (index + list.length) % list.length;
    var obra = list[currentIndex];

    lbImg.src = obra.getAttribute("data-full");
    lbImg.alt = obra.getAttribute("data-title") || "";
    lbTitle.textContent = obra.getAttribute("data-title") || "";
    lbDesc.textContent = obra.getAttribute("data-desc") || "";
  }

  function openLightbox(obra) {
    var list = visibleObras();
    showObra(list.indexOf(obra));
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  obras.forEach(function (obra) {
    obra.addEventListener("click", function () { openLightbox(obra); });
  });

  lbClose.addEventListener("click", closeLightbox);
  lbPrev.addEventListener("click", function () { showObra(currentIndex - 1); });
  lbNext.addEventListener("click", function () { showObra(currentIndex + 1); });

  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", function (e) {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showObra(currentIndex - 1);
    if (e.key === "ArrowRight") showObra(currentIndex + 1);
  });

  /* ============================================ FORMULARIO DE COTIZACIÓN */
  var form = document.getElementById("quoteForm");
  var status = document.getElementById("quoteStatus");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var fields = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      city: form.city.value.trim(),
      service: form.service.value,
      message: form.message.value.trim()
    };

    // Validación
    var required = ["name", "email", "service", "message"];
    var firstInvalid = null;

    required.forEach(function (key) {
      var input = form[key];
      var empty = !fields[key];
      input.classList.toggle("invalid", empty);
      if (empty && !firstInvalid) firstInvalid = input;
    });

    var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email);
    if (fields.email && !emailOk) {
      form.email.classList.add("invalid");
      if (!firstInvalid) firstInvalid = form.email;
    }

    if (firstInvalid) {
      status.textContent = !emailOk && fields.email
        ? "Revise el formato del email."
        : "Por favor complete los campos obligatorios (*).";
      status.classList.add("error");
      firstInvalid.focus();
      return;
    }

    // Componer el correo
    var subject = "Solicitud de cotización — " + fields.service + " — " + fields.name;
    var body = [
      "Nombre: " + fields.name,
      "Email: " + fields.email,
      "Teléfono: " + (fields.phone || "No indicado"),
      "Ciudad / Comuna: " + (fields.city || "No indicada"),
      "Tipo de servicio: " + fields.service,
      "",
      "Detalles del proyecto:",
      fields.message
    ].join("\n");

    window.location.href =
      "mailto:" + EMAIL +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);

    status.classList.remove("error");
    status.textContent = "Abriendo su cliente de correo con la solicitud lista para enviar…";
  });

  // Limpiar el estado de error al escribir
  form.querySelectorAll("input, select, textarea").forEach(function (el) {
    el.addEventListener("input", function () {
      el.classList.remove("invalid");
      status.textContent = "";
      status.classList.remove("error");
    });
  });

  /* ============================================================== AÑO == */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
