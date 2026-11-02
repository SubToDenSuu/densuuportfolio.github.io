/* DenSuu — Portfolio interactions. No libraries, no build step. */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Starfield ---------- */
  var canvas = document.getElementById("stars");
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext("2d");
    var stars = [], w, h, dpr, scrollY = 0, raf;
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.round((w * h) / 7000);
      stars = [];
      for (var i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * w, y: Math.random() * h * 1.6,
          r: Math.random() < 0.92 ? Math.random() * 0.9 + 0.2 : Math.random() * 1.3 + 0.9,
          a: Math.random() * 0.6 + 0.2, t: Math.random() * Math.PI * 2,
          s: Math.random() * 0.015 + 0.003, depth: Math.random() * 0.25 + 0.05
        });
      }
      draw(0);
    }
    function draw(time) {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        var y = (s.y - scrollY * s.depth) % (h * 1.6);
        if (y < 0) y += h * 1.6;
        if (y > h) continue;
        var alpha = reduceMotion ? s.a : s.a * (0.6 + 0.4 * Math.sin(s.t + time * s.s * 0.06));
        ctx.globalAlpha = alpha;
        ctx.fillStyle = s.r > 1 ? "#dfe5ff" : "#e9e7e1";
        ctx.beginPath(); ctx.arc(s.x, y, s.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    function loop(t) { draw(t); raf = requestAnimationFrame(loop); }
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", function () { scrollY = window.scrollY; if (reduceMotion) draw(0); }, { passive: true });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) cancelAnimationFrame(raf); else if (!reduceMotion) raf = requestAnimationFrame(loop);
    });
    resize();
    if (!reduceMotion) raf = requestAnimationFrame(loop);
  }

  /* ---------- Nav ---------- */
  var nav = document.querySelector(".nav");
  if (nav) {
    var onScroll = function () { nav.classList.toggle("scrolled", window.scrollY > 20); };
    onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
    var toggle = nav.querySelector(".nav-toggle");
    if (toggle) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open);
      });
      nav.querySelectorAll(".nav-links a").forEach(function (a) {
        a.addEventListener("click", function () { nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); });
      });
    }
    // highlight current section
    var links = nav.querySelectorAll('.nav-links a[href^="#"]');
    if (links.length && "IntersectionObserver" in window) {
      var map = {};
      links.forEach(function (l) { map[l.getAttribute("href").slice(1)] = l; });
      var so = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && map[e.target.id]) {
            links.forEach(function (l) { l.classList.remove("active"); });
            map[e.target.id].classList.add("active");
          }
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      Object.keys(map).forEach(function (id) { var el = document.getElementById(id); if (el) so.observe(el); });
    }
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); ro.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    reveals.forEach(function (el) { ro.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Videos: load + play only while visible ---------- */
  var vids = document.querySelectorAll("video[data-autoplay]");
  function ensureSrc(v) {
    if (v.dataset.src && !v.getAttribute("src")) { v.src = v.dataset.src; }
  }
  if ("IntersectionObserver" in window) {
    var vo = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) {
          ensureSrc(v);
          if (!reduceMotion) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        } else { v.pause(); }
      });
    }, { threshold: 0.25 });
    vids.forEach(function (v) { v.muted = true; vo.observe(v); });
  } else {
    vids.forEach(function (v) { ensureSrc(v); });
  }

  /* ---------- Lightbox (mp4 or YouTube) ---------- */
  var lb = document.createElement("div");
  lb.className = "lightbox"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "Video player");
  lb.innerHTML =
    '<button class="lightbox-close" aria-label="Close"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 3l10 10M13 3L3 13"/></svg></button>' +
    '<div class="lightbox-inner"><div class="lightbox-frame"></div><div class="lightbox-cap"><span class="lb-title"></span><span class="lb-meta mono"></span></div></div>';
  document.body.appendChild(lb);
  var frame = lb.querySelector(".lightbox-frame"), lastFocus;

  function openLightbox(el) {
    lastFocus = el;
    var yt = el.getAttribute("data-youtube");
    var src = el.getAttribute("data-video") || el.getAttribute("href");
    if (yt) {
      frame.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + encodeURIComponent(yt) +
        '?autoplay=1&rel=0" allow="autoplay; encrypted-media; fullscreen" allowfullscreen title="Video"></iframe>';
    } else {
      frame.innerHTML = '<video controls autoplay playsinline loop muted></video>';
      frame.querySelector("video").src = src;
    }
    lb.querySelector(".lb-title").textContent = el.getAttribute("data-title") || "";
    lb.querySelector(".lb-meta").textContent = el.getAttribute("data-meta") || "";
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
    lb.querySelector(".lightbox-close").focus();
  }
  function closeLightbox() {
    lb.classList.remove("open");
    document.body.style.overflow = "";
    setTimeout(function () { frame.innerHTML = ""; }, 300);
    if (lastFocus) lastFocus.focus();
  }
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-lightbox]");
    if (t) { e.preventDefault(); openLightbox(t); }
  });
  lb.addEventListener("click", function (e) { if (e.target === lb || e.target.closest(".lightbox-close")) closeLightbox(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && lb.classList.contains("open")) closeLightbox(); });

  /* ---------- Expertise tabs ---------- */
  document.querySelectorAll("[data-tabs]").forEach(function (root) {
    var btns = root.querySelectorAll('[role="tab"]');
    var panels = root.querySelectorAll('[role="tabpanel"]');
    function select(i, focus) {
      btns.forEach(function (b, j) {
        var on = i === j;
        b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1;
        panels[j].hidden = !on;
        if (on) { panels[j].classList.remove("anim"); void panels[j].offsetWidth; panels[j].classList.add("anim"); }
      });
      if (focus) btns[i].focus();
    }
    btns.forEach(function (b, i) {
      b.addEventListener("click", function () { select(i); });
      b.addEventListener("keydown", function (e) {
        var k = e.key, n = btns.length;
        if (k === "ArrowDown" || k === "ArrowRight") { e.preventDefault(); select((i + 1) % n, true); }
        if (k === "ArrowUp" || k === "ArrowLeft") { e.preventDefault(); select((i - 1 + n) % n, true); }
      });
    });
    select(0);
  });

  /* ---------- Copy to clipboard (Discord username) ---------- */
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    var label = btn.querySelector("[data-copy-label]");
    var original = label ? label.textContent : "";
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      var done = function () {
        if (label) { label.textContent = "Copied! Add densuu on Discord"; setTimeout(function () { label.textContent = original; }, 2200); }
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, done);
      } else {
        var ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); } catch (e) {}
        document.body.removeChild(ta); done();
      }
    });
  });

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
