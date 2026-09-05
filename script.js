(function () {
  "use strict";

  /* =========================================================== CONFIGURACIÓN
     Lo único que hay que editar a mano está en este bloque.
     ====================================================================== */
  var CONFIG = {
    // URL /exec de Google Apps Script (ver GUIA-FORMULARIO.md).
    // Si se deja vacía, el formulario vuelve al modo antiguo (abre el correo).
    ENDPOINT_FORMULARIO: "https://script.google.com/macros/s/AKfycbwjqVhrtVMJ00OOISE6jsr45z3nWHjlv6rWWk5vcsH1DxM7GzuXA7cRXDT7zwZwSLeM/exec",

    // Correo de respaldo, usado solo si el endpoint de arriba está vacío.
    EMAIL: "fernando.casas@ingenieriacasas.cl"
  };

  /* Ejecuta cada bloque de la página por separado. Así, si uno falla,
     los demás (formulario incluido) siguen funcionando. */
  function bloque(nombre, fn) {
    try {
      fn();
    } catch (err) {
      if (window.console && console.error) {
        console.error("[CM] Error en el bloque '" + nombre + "':", err);
      }
    }
  }

  /* ============================================================ HEADER == */
  bloque("header", function () {
    var header = document.getElementById("siteHeader");
    var backToTop = document.getElementById("backToTop");
    if (!header || !backToTop) return;

    function onScroll() {
      header.classList.toggle("scrolled", window.scrollY > 40);
      backToTop.classList.toggle("show", window.scrollY > 600);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  /* ======================================================== MOBILE NAV == */
  bloque("nav", function () {
    var navToggle = document.getElementById("navToggle");
    var mainNav = document.getElementById("mainNav");
    var navScrim = document.getElementById("navScrim");
    if (!navToggle || !mainNav || !navScrim) return;

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
  });

  /* ========================================================= SCROLL SPY == */
  bloque("scroll-spy", function () {
    var navAnchors = document.querySelectorAll("[data-nav]");
    var spySections = [];
    navAnchors.forEach(function (a) {
      var el = document.querySelector(a.getAttribute("href"));
      if (el) spySections.push(el);
    });

    if (!("IntersectionObserver" in window) || !spySections.length) return;

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
  });

  /* ============================================================ REVEAL == */
  bloque("reveal", function () {
    var revealEls = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) { el.classList.add("in-view"); });
      return;
    }
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
  });

  /* ================================================== CONTADORES DEL HERO
     El HTML ya trae el número final escrito (30+, 500+, 32.000+). Este bloque
     solo agrega la animación; si falla o no se ejecuta, los números correctos
     quedan igual a la vista.
     ====================================================================== */
  bloque("contadores", function () {
    var counters = document.querySelectorAll("[data-count]");
    if (!counters.length) return;

    function valorFinal(el) {
      var target = parseInt(el.getAttribute("data-count"), 10);
      if (isNaN(target)) return el.textContent;
      var texto = el.getAttribute("data-format") === "thousand"
        ? target.toLocaleString("es-CL")
        : String(target);
      return texto + (el.getAttribute("data-suffix") || "");
    }

    function fijarFinal(el) {
      el.textContent = valorFinal(el);
    }

    var sinAnimacion =
      !("IntersectionObserver" in window) ||
      !("requestAnimationFrame" in window) ||
      (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

    if (sinAnimacion) {
      counters.forEach(fijarFinal);
      return;
    }

    function animar(el) {
      var target = parseInt(el.getAttribute("data-count"), 10);
      if (isNaN(target)) return;
      var suffix = el.getAttribute("data-suffix") || "";
      var miles = el.getAttribute("data-format") === "thousand";
      var duration = 1600;
      var start = null;

      // Red de seguridad: pase lo que pase, a los 3 s el número final está puesto.
      var seguro = setTimeout(function () { fijarFinal(el); }, 3000);

      function step(ts) {
        if (start === null) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        var n = Math.round(target * eased);
        el.textContent = (miles ? n.toLocaleString("es-CL") : String(n)) + suffix;
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          clearTimeout(seguro);
          fijarFinal(el);
        }
      }
      requestAnimationFrame(step);
    }

    var counterObs = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animar(entry.target);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (c) { counterObs.observe(c); });
  });

  /* ==================================================== FILTROS DE OBRAS */
  var obras = Array.prototype.slice.call(document.querySelectorAll(".obra"));

  bloque("filtros", function () {
    var filtros = document.querySelectorAll(".filtro");

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
  });

  /* ========================================================== LIGHTBOX == */
  bloque("lightbox", function () {
    var lightbox = document.getElementById("lightbox");
    var lbImg = document.getElementById("lbImg");
    var lbTitle = document.getElementById("lbTitle");
    var lbDesc = document.getElementById("lbDesc");
    var lbClose = document.getElementById("lbClose");
    var lbPrev = document.getElementById("lbPrev");
    var lbNext = document.getElementById("lbNext");
    if (!lightbox || !lbImg) return;

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
  });

  /* ============================================ FORMULARIO DE COTIZACIÓN */
  bloque("formulario", function () {
    var form = document.getElementById("quoteForm");
    var status = document.getElementById("quoteStatus");
    if (!form || !status) return;

    var boton = form.querySelector("button[type=submit]");
    var textoBoton = boton ? boton.textContent : "";
    var enviando = false;

    function setStatus(texto, tipo) {
      status.textContent = texto;
      status.classList.toggle("error", tipo === "error");
      status.classList.toggle("success", tipo === "success");
    }

    /* De dónde viene la visita: sirve para saber qué anuncio trae los leads. */
    function origen() {
      var partes = [];
      try {
        var params = new URLSearchParams(window.location.search);
        ["utm_source", "utm_medium", "utm_campaign", "utm_content", "fbclid"]
          .forEach(function (k) {
            if (params.get(k)) partes.push(k + "=" + params.get(k));
          });
        if (!partes.length && document.referrer) partes.push("ref=" + document.referrer);
      } catch (e) { /* sin datos de origen */ }
      return partes.join(" · ");
    }

    /* Respaldo: si aún no se ha pegado la URL de Google, se usa el correo. */
    function enviarPorCorreo(datos) {
      var subject = "Solicitud de cotización — " + datos.service + " — " + datos.name;
      var body = [
        "Nombre: " + datos.name,
        "Email: " + datos.email,
        "Teléfono: " + (datos.phone || "No indicado"),
        "Ciudad / Comuna: " + (datos.city || "No indicada"),
        "Tipo de servicio: " + datos.service,
        "",
        "Detalles del proyecto:",
        datos.message
      ].join("\n");

      window.location.href =
        "mailto:" + CONFIG.EMAIL +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      setStatus("Abriendo su correo con la solicitud lista para enviar…", "");
    }

    function exito() {
      setStatus("¡Gracias, te contactamos en 24h!", "success");
      form.reset();

      // Meta Pixel: se avisa que este visitante se convirtió en contacto.
      try {
        if (typeof window.fbq === "function") {
          window.fbq("track", "Lead", { content_name: "Formulario de cotización" });
        }
      } catch (e) { /* el píxel nunca debe romper el envío */ }
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (enviando) return;

      var datos = {
        name: form.name.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        city: form.city.value.trim(),
        service: form.service.value,
        message: form.message.value.trim()
      };

      /* --- Validación --- */
      var required = ["name", "email", "service", "message"];
      var firstInvalid = null;

      required.forEach(function (key) {
        var input = form[key];
        var empty = !datos[key];
        input.classList.toggle("invalid", empty);
        if (empty && !firstInvalid) firstInvalid = input;
      });

      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email);
      if (datos.email && !emailOk) {
        form.email.classList.add("invalid");
        if (!firstInvalid) firstInvalid = form.email;
      }

      if (firstInvalid) {
        setStatus(
          !emailOk && datos.email
            ? "Revise el formato del email."
            : "Por favor complete los campos obligatorios (*).",
          "error"
        );
        firstInvalid.focus();
        return;
      }

      /* --- Sin endpoint configurado: respaldo por correo --- */
      if (!CONFIG.ENDPOINT_FORMULARIO) {
        if (window.console && console.warn) {
          console.warn("[CM] Falta CONFIG.ENDPOINT_FORMULARIO. Ver GUIA-FORMULARIO.md.");
        }
        enviarPorCorreo(datos);
        return;
      }

      /* --- Envío al Google Sheet --- */
      enviando = true;
      if (boton) {
        boton.disabled = true;
        boton.textContent = "Enviando…";
      }
      setStatus("Enviando su solicitud…", "");

      function terminar() {
        enviando = false;
        if (boton) {
          boton.disabled = false;
          boton.textContent = textoBoton;
        }
      }

      var cuerpo = new URLSearchParams();
      Object.keys(datos).forEach(function (k) { cuerpo.append(k, datos[k]); });
      cuerpo.append("origen", origen());

      // Sin cabeceras propias: así el navegador lo trata como envío simple
      // y Google lo acepta sin bloqueos de CORS.
      fetch(CONFIG.ENDPOINT_FORMULARIO, {
        method: "POST",
        body: cuerpo
      })
        .then(function () {
          terminar();
          exito();
        })
        .catch(function () {
          // Segundo intento "a ciegas": el dato igual llega a Google, aunque el
          // navegador no nos deje leer la respuesta.
          fetch(CONFIG.ENDPOINT_FORMULARIO, {
            method: "POST",
            mode: "no-cors",
            body: cuerpo
          })
            .then(function () {
              terminar();
              exito();
            })
            .catch(function () {
              terminar();
              setStatus(
                "No pudimos enviar su solicitud. Llámenos al +56 9 8228 2774 " +
                "o escríbanos a " + CONFIG.EMAIL,
                "error"
              );
            });
        });
    });

    // Limpiar el estado de error al escribir
    form.querySelectorAll("input, select, textarea").forEach(function (el) {
      el.addEventListener("input", function () {
        el.classList.remove("invalid");
        if (!status.classList.contains("success")) setStatus("", "");
      });
    });
  });

  /* ============================================================== AÑO == */
  bloque("año", function () {
    var yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  });
})();
