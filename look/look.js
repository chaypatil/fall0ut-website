/* FallØut design preview switcher.
   Runs only on the preview hosts below. On fall0ut.in (or any host not listed) it
   returns immediately and changes nothing. It applies the direction-board options
   to the real site through html[data-look-*] attributes, and adds a small panel to
   switch them. Choices persist in the URL (?look=bg-head-hero-art-btn-tex-lab, for
   example ?look=aaaaacb) and for the rest of the browser session.
   Add ?look=off to see the site without any preview changes. */
(function () {
  "use strict";

  var host = location.hostname;
  var previewHost =
    host === "fall0ut.xyz" ||
    host === "www.fall0ut.xyz" ||
    host === "localhost" ||
    host === "127.0.0.1" ||
    /^(10|192\.168|192\.0\.2|172\.(1[6-9]|2\d|3[01]))\./.test(host) ||
    /^fall0ut-website-git-.+\.vercel\.app$/.test(host);
  if (!previewHost) return;

  var ROWS = [
    { key: "bg", title: "Background", names: { a: "Frost", b: "Overexposed", c: "Night frost" } },
    { key: "head", title: "Headings", names: { a: "Wide lowercase", b: "Condensed caps", c: "Clean lowercase" } },
    { key: "hero", title: "Hero", names: { a: "Light leak", b: "Wired", c: "Sigil bloom" } },
    { key: "art", title: "Event posters", names: { a: "Ice duotone", b: "Frosted frame", c: "Photocopy slices" } },
    { key: "btn", title: "Buttons", names: { a: "Frosted glass", b: "Chrome", c: "Hairline glow" } },
    { key: "tex", title: "Texture", names: { a: "Scanlines + dust", b: "Fractal wisps", c: "Clean" } },
    { key: "lab", title: "System labels", names: { a: "On", b: "Off" } },
  ];
  var PRESETS = { "Soft Club": "aaaaacb", Wired: "bcbcaaa", Sigil: "aacbabb", "Night club": "cbaacbb" };
  var DEFAULT = PRESETS["Soft Club"];
  var STORE = "f0-look";
  var root = document.documentElement;

  function valid(code) {
    return typeof code === "string" && code.length === ROWS.length &&
      ROWS.every(function (row, i) { return Object.prototype.hasOwnProperty.call(row.names, code[i]); });
  }

  function readCode() {
    var q = new URLSearchParams(location.search).get("look");
    if (q === "off") return null;
    if (valid(q)) return q;
    try {
      var s = sessionStorage.getItem(STORE);
      if (valid(s)) return s;
    } catch (e) { /* storage blocked: fall back to default */ }
    return DEFAULT;
  }

  var code = readCode();
  if (!code) return;

  function apply(next) {
    code = next;
    root.setAttribute("data-look", code);
    ROWS.forEach(function (row, i) { root.setAttribute("data-look-" + row.key, code[i]); });
    try { sessionStorage.setItem(STORE, code); } catch (e) { /* ignore */ }
    var url = new URL(location.href);
    url.searchParams.set("look", code);
    history.replaceState(history.state, "", url.pathname + url.search + url.hash);
    refreshPanel();
    decorateArt();
  }

  // Attributes go on before first paint so there is no flash of the dark site.
  root.setAttribute("data-look", code);
  ROWS.forEach(function (row, i) { root.setAttribute("data-look-" + row.key, code[i]); });

  var base = (function () {
    var s = document.currentScript && document.currentScript.src;
    return s ? s.replace(/look\.js(\?.*)?$/, "") : "/look/";
  })();

  function addHead(tag, attrs) {
    var el = document.createElement(tag);
    Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    document.head.appendChild(el);
  }
  addHead("link", { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,300..900&display=swap" });
  addHead("link", { rel: "stylesheet", href: base + "look.css" });

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function art(name) {
    var dark = code[0] === "c";
    var files = {
      streaks: "streaks.svg",
      wires: "wires.svg",
      sigil: dark ? "sigil-ice.svg" : "sigil-ink.svg",
      wisps: dark ? "wisps-ice.svg" : "wisps-blue.svg",
    };
    return base + "art/" + files[name];
  }

  function img(cls, name) {
    var i = el("img", "look-art " + cls);
    i.alt = "";
    i.setAttribute("aria-hidden", "true");
    i.decoding = "async";
    i.loading = "lazy"; // hidden options never download their artwork
    i.dataset.lookArt = name;
    i.src = art(name);
    return i;
  }

  function decorateArt() {
    document.querySelectorAll("img[data-look-art]").forEach(function (i) {
      var want = art(i.dataset.lookArt);
      if (i.src !== new URL(want, location.href).href) i.src = want;
    });
  }

  // Real event data for the system labels, never invented copy.
  function eventCode(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || "");
    return m ? "EVT-" + m[3] + m[2] : "EVT";
  }

  function cityCode(text) {
    var city = (text || "").split("/").pop().trim().toUpperCase();
    return city.replace(/\s+/g, "-") || "INDIA";
  }

  function heroLabels(hero) {
    var focus = document.querySelector("[data-focus-event]");
    var lines = [];
    if (focus) {
      var title = (focus.querySelector("h3") || {}).textContent || "";
      var date = (focus.getAttribute("data-event-start") || "").slice(0, 10).split("-");
      var place = (focus.querySelector(".event-date") || {}).textContent || "";
      lines.push("+ NEXT: " + title.trim().toUpperCase() + (date.length === 3 ? " // " + date[2] + "." + date[1] + "." + date[0].slice(2) : ""));
      lines.push("+ LINE: " + (place.split("/").pop() || "").trim().toUpperCase());
    }
    lines.push("+ [tickets through whatsapp]");
    var term = el("pre", "look-sys look-term");
    term.textContent = lines.join("\n");
    hero.appendChild(term);
    var foot = el("p", "look-sys look-hero-code");
    foot.textContent = "© " + new Date().getFullYear() + " FALLØUT INDIA // RAVE CALENDAR ONLINE";
    hero.appendChild(foot);
  }

  function decorateHero() {
    document.querySelectorAll(".hero, .discovery-hero, .editorial-hero").forEach(function (hero) {
      if (hero.dataset.look) return;
      hero.dataset.look = "1";
      var host = hero.querySelector(".hero-media") || hero;
      host.appendChild(img("look-streaks", "streaks"));
      host.appendChild(img("look-wires", "wires"));
      host.appendChild(img("look-sigil", "sigil"));
      if (hero.classList.contains("hero")) heroLabels(hero);
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) {
          root.setAttribute("data-look-top", entries[0].intersectionRatio > 0.35 ? "1" : "0");
        }, { threshold: [0, 0.35, 1] }).observe(hero);
      }
    });
  }

  function sectionLabels() {
    var labels = {
      focus: "+ F0 / HOT-01",
      events: "+ F0 / FEATURED",
      calendar: "CAL " + new Date().getFullYear() + " // " + document.querySelectorAll(".calendar-event.is-upcoming").length + " UPCOMING",
      join: "+ FØ MOB // WHATSAPP",
      contact: "+ LINES OPEN",
    };
    Object.keys(labels).forEach(function (id) {
      var heading = document.querySelector("#" + id + " .section-heading");
      if (!heading || heading.querySelector(".look-sys")) return;
      var tag = el("span", "look-sys");
      tag.textContent = labels[id];
      heading.appendChild(tag);
    });
    document.querySelectorAll("[data-focus-event]").forEach(function (focus) {
      var copy = focus.querySelector(".focus-copy");
      if (!copy || copy.querySelector(".look-sys")) return;
      var tag = el("p", "look-sys");
      tag.textContent = eventCode(focus.getAttribute("data-event-start")) + " // " +
        cityCode((focus.querySelector(".event-date") || {}).textContent) + " // TICKETS OPEN";
      copy.appendChild(tag);
    });
    var footer = document.querySelector(".site-footer");
    if (footer && !footer.querySelector(".look-sys")) {
      var f = el("span", "look-sys");
      f.textContent = "+ FALLØUT // INDIA // ONLINE";
      footer.appendChild(f);
    }
  }

  function decoratePosters() {
    var targets = [];
    document.querySelectorAll(".focus-art, .event-art").forEach(function (box) { targets.push(box); });
    document.querySelectorAll(".event-detail-poster").forEach(function (poster) {
      if (poster.parentElement.classList.contains("look-poster-wrap")) return;
      var wrap = el("span", "look-poster-wrap");
      poster.parentNode.insertBefore(wrap, poster);
      wrap.appendChild(poster);
    });
    document.querySelectorAll(".look-poster-wrap").forEach(function (box) { targets.push(box); });
    targets.forEach(function (box) {
      if (box.dataset.look) return;
      var main = box.querySelector("img:not(.look-slice)");
      if (!main) return;
      box.dataset.look = "1";
      box.style.setProperty("--look-poster", "url(\"" + main.currentSrc + "\")");
      if (!box.style.position && getComputedStyle(box).position === "static") box.style.position = "relative";
      ["s1", "s2", "s3"].forEach(function (s) {
        var slice = el("img", "look-slice " + s);
        slice.alt = "";
        slice.setAttribute("aria-hidden", "true");
        slice.src = main.currentSrc || main.src;
        box.appendChild(slice);
      });
      var owner = box.closest("[data-event-start], [data-event-slug]");
      var start = owner ? owner.getAttribute("data-event-start") : "";
      var place = owner && owner.querySelector(".event-date, .event-location");
      [["k1", "COPY"], ["k2", eventCode(start)], ["k3", place ? cityCode(place.textContent) : "CENTER"]].forEach(function (k) {
        var tag = el("span", "look-code " + k[0]);
        tag.textContent = k[1];
        box.appendChild(tag);
      });
      box.appendChild(el("span", "look-scanbar"));
    });
  }

  function decorateWisps() {
    [["#calendar", "w-left"], ["#focus", "w-right"], ["#moments-preview", "w-right"], [".event-detail", "w-right"]].forEach(function (pair) {
      var host = document.querySelector(pair[0]);
      if (!host || host.querySelector(".look-wisp")) return;
      host.classList.add("look-wisp-host");
      host.appendChild(img("look-wisp " + pair[1], "wisps"));
    });
  }

  function filters() {
    if (document.getElementById("look-filters")) return;
    var wrap = el("div");
    wrap.innerHTML =
      '<svg id="look-filters" width="0" height="0" style="position:absolute" aria-hidden="true">' +
      '<filter id="look-duo-a" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=".33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 1 0"/><feComponentTransfer><feFuncR type="table" tableValues=".03 .55 .95"/><feFuncG type="table" tableValues=".09 .7 .97"/><feFuncB type="table" tableValues=".2 .9 1"/></feComponentTransfer></filter>' +
      '<filter id="look-duo-b" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=".33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 1 0"/><feComponentTransfer><feFuncR type="table" tableValues=".02 .35 .98"/><feFuncG type="table" tableValues=".07 .52 .99"/><feFuncB type="table" tableValues=".16 .78 1"/></feComponentTransfer></filter>' +
      '<filter id="look-duo-c" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values=".33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 1 0"/><feComponentTransfer><feFuncR type="table" tableValues=".01 .2 .75"/><feFuncG type="table" tableValues=".03 .34 .88"/><feFuncB type="table" tableValues=".07 .55 1"/></feComponentTransfer></filter>' +
      "</svg>";
    document.body.appendChild(wrap.firstChild);
  }

  var panel, toggle;
  function refreshPanel() {
    if (!panel) return;
    ROWS.forEach(function (row, i) {
      panel.querySelectorAll('[data-row="' + row.key + '"] button').forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.dataset.v === code[i]));
      });
    });
    var line = panel.querySelector(".look-code-line");
    if (line) line.textContent = ROWS.map(function (row, i) { return row.title + " " + code[i].toUpperCase(); }).join(" / ");
  }

  function buildPanel() {
    toggle = el("button", "look-toggle", "Design");
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", "false");
    panel = el("div", "look-panel");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Design preview options");
    var rows = ROWS.map(function (row) {
      var buttons = Object.keys(row.names).map(function (v) {
        return '<button type="button" data-v="' + v + '" title="' + row.names[v] + '">' + v.toUpperCase() + "</button>";
      }).join("");
      return '<div class="look-row" data-row="' + row.key + '"><span>' + row.title + '<small data-name></small></span><div class="look-choices">' + buttons + "</div></div>";
    }).join("");
    var presets = Object.keys(PRESETS).map(function (n) {
      return '<button type="button" data-preset="' + PRESETS[n] + '">' + n + "</button>";
    }).join("");
    panel.innerHTML =
      "<h4>Design preview</h4><p>Only visible on fall0ut.xyz. Same letters as the direction board.</p>" +
      '<div class="look-presets">' + presets + "</div>" + rows +
      '<div class="look-code-line"></div><div class="look-actions"><button type="button" data-copy>Copy pick</button><button type="button" data-off>View current site</button></div>';
    document.body.appendChild(panel);
    document.body.appendChild(toggle);
    toggle.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    panel.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.preset) return apply(b.dataset.preset);
      if (b.dataset.v) {
        var i = ROWS.findIndex(function (r) { return r.key === b.closest("[data-row]").dataset.row; });
        return apply(code.slice(0, i) + b.dataset.v + code.slice(i + 1));
      }
      if (b.hasAttribute("data-copy") && navigator.clipboard) {
        navigator.clipboard.writeText(panel.querySelector(".look-code-line").textContent).then(function () {
          b.textContent = "Copied";
          setTimeout(function () { b.textContent = "Copy pick"; }, 1600);
        });
      }
      if (b.hasAttribute("data-off")) {
        var url = new URL(location.href);
        url.searchParams.set("look", "off");
        location.href = url.pathname + url.search;
      }
    });
    panel.addEventListener("mouseover", function (e) {
      var b = e.target.closest(".look-choices button");
      if (!b) return;
      var row = ROWS.find(function (r) { return r.key === b.closest("[data-row]").dataset.row; });
      b.closest(".look-row").querySelector("[data-name]").textContent = row.names[b.dataset.v];
    });
    ROWS.forEach(function (row, i) {
      panel.querySelector('[data-row="' + row.key + '"] [data-name]').textContent = row.names[code[i]];
    });
    refreshPanel();
  }

  function decorate() {
    decorateHero();
    decoratePosters();
    sectionLabels();
    decorateWisps();
    decorateArt();
  }

  function start() {
    filters();
    var tex = el("div", "look-tex");
    tex.setAttribute("aria-hidden", "true");
    document.body.appendChild(tex);
    buildPanel();
    decorate();
    // Event pages render after load and on client-side navigation.
    var pending = false;
    new MutationObserver(function () {
      if (pending) return;
      pending = true;
      requestAnimationFrame(function () { pending = false; decorate(); });
    }).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
