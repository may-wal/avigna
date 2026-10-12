/* Frontend interactions. No personal details are transmitted. */
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let savedProducts = new Set();
try {
  const stored = JSON.parse(localStorage.getItem("avigna-saved") || "[]");
  if (Array.isArray(stored))
    savedProducts = new Set(
      stored.filter((id) => products.some((p) => p.id === id)),
    );
} catch {}
let savedOnly = false;
const compareProducts = new Set();
const productDescriptions = {
  soil: "A sample soil conditioner concept for a soil-first nutrition conversation. Begin with a soil profile to understand the right next step for your farm.",
  grow: "A sample balanced water-soluble nutrition concept. Explore its place in a crop plan with a qualified advisor and your farm’s soil and crop information.",
  root: "A sample phosphorus-focused water-soluble nutrition concept. A starting point for discussing establishment and root-stage crop nutrition.",
  micro:
    "A sample micronutrient blend concept. Soil and crop observations should guide the conversation about the smaller details of nutrition.",
  bloom:
    "A sample potassium-focused water-soluble nutrition concept. Explore crop-stage needs with farm-specific advice before choosing an input.",
  earth:
    "A sample soil care blend concept designed for the illustrative Avigna catalog. Discuss soil condition and crop history before selecting a product.",
};
function packMarkup(p) {
  return `<div class="pack" style="--pack-color:${p.color}" aria-label="Illustrative ${p.name} packaging"><img src="assets/logo.svg" alt="Avigna"><div class="pack-band"><small>CROP NUTRITION</small><strong>${p.name.replace(" ", "<br>")}</strong><span>${p.formula}</span><span class="pack-leaf">❧</span></div><span class="pack-weight">NET WEIGHT ${p.weight.toUpperCase()}</span></div>`;
}
renderProducts = function () {
  let list = products.filter(
    (p) =>
      (currentFilter === "all" || p.category === currentFilter) &&
      (!savedOnly || savedProducts.has(p.id)) &&
      `${p.name} ${p.detail} ${p.label}`
        .toLowerCase()
        .includes($("#search-input").value.toLowerCase().trim()),
  );
  if ($("#sort").value === "low") list.sort((a, b) => a.price - b.price);
  if ($("#sort").value === "high") list.sort((a, b) => b.price - a.price);
  $("#results-count").textContent =
    `${String(list.length).padStart(2, "0")} products${savedOnly ? " in your saved collection" : ""} · Illustrative collection`;
  $("#product-grid").innerHTML =
    list
      .map(
        (p, index) =>
          `<article class="product-card" style="animation-delay:${index * 45}ms"><div class="product-image" data-tilt><span class="product-badge">${p.badge}</span><button class="save-product ${savedProducts.has(p.id) ? "saved" : ""}" data-save="${p.id}" aria-label="${savedProducts.has(p.id) ? "Unsave" : "Save"} ${p.name}" aria-pressed="${savedProducts.has(p.id)}">${savedProducts.has(p.id) ? "♥" : "♡"}</button>${packMarkup(p)}<button class="quick-view" data-view="${p.id}">A closer look ↗</button></div><div class="product-info"><span class="product-category">${p.label} / ${p.weight}</span><h3><button class="product-title" data-view="${p.id}">${p.name}</button></h3><p class="product-detail">${p.detail}</p><div class="product-bottom"><span>${money(p.price)} <small>/ pack</small></span><button class="add-button" data-add="${p.id}" aria-label="Add ${p.name} to bag">+</button></div><label class="compare-check"><input type="checkbox" data-compare="${p.id}" ${compareProducts.has(p.id) ? "checked" : ""}> Compare product</label></div></article>`,
      )
      .join("") ||
    `<p class="no-products">${savedOnly ? "Your saved collection is waiting to grow. Tap a heart on a product to save it." : "No products found. Try another search or category."}</p>`;
  $("#saved-count").textContent = savedProducts.size;
  initProductTilt();
};
function initProductTilt() {
  if (reducedMotion.matches || !window.matchMedia("(pointer:fine)").matches)
    return;
  document.querySelectorAll("[data-tilt]").forEach((surface) => {
    const pack = surface.querySelector(".pack");
    surface.addEventListener("pointermove", (event) => {
      const r = surface.getBoundingClientRect();
      const x = (event.clientX - r.left) / r.width - 0.5;
      const y = (event.clientY - r.top) / r.height - 0.5;
      pack.style.transform = `rotateX(${-y * 14}deg) rotateY(${x * 22}deg) rotateZ(${x * 5}deg) translateY(-5px)`;
    });
    surface.addEventListener("pointerleave", () => {
      pack.style.transform = "";
    });
  });
}
function updateComparison() {
  const count = compareProducts.size;
  $("#compare-tray").hidden = count === 0;
  $("#compare-count").textContent = `${count} of 3 products selected`;
  $("#compare-open").disabled = count < 2;
  $("#compare-open").textContent =
    count < 2 ? "Select one more product" : "Compare selected ↗";
}
function openProduct(id) {
  const p = products.find((p) => p.id === id);
  if (!p) return;
  $("#product-dialog-content").innerHTML =
    `<div class="quick-layout"><div class="quick-art">${packMarkup(p)}<span>ILLUSTRATIVE AVIGNA PACKAGING</span></div><div class="quick-copy"><p class="eyebrow">${p.label.toUpperCase()}</p><h2>${p.name}</h2><p>${productDescriptions[p.id]}</p><div class="quick-specs"><div><span>Formulation</span><strong>${p.formula}</strong></div><div><span>Pack size</span><strong>${p.weight}</strong></div><div><span>Collection</span><strong>${p.label}</strong></div></div><div class="quick-price"><strong>${money(p.price)}</strong><span>Sample price / pack</span></div><button class="button green" data-add="${p.id}">Add to growth bag <span>+</span></button><small>Sample product concept. Final specifications, availability, and application guidance require confirmation.</small></div></div>`;
  $("#product-dialog").showModal();
}
function openComparison() {
  if (compareProducts.size < 2) return;
  const selected = products.filter((p) => compareProducts.has(p.id));
  const rows = [
    ["Collection", (p) => p.label],
    ["Formulation", (p) => p.formula],
    ["Pack size", (p) => p.weight],
    ["Sample price", (p) => money(p.price)],
    ["Explore", (p) => `<button data-add="${p.id}">Add to bag +</button>`],
  ];
  $("#comparison-content").innerHTML =
    `<div class="comparison-scroll"><table class="comparison-table"><thead><tr><th scope="col">At a glance</th>${selected.map((p) => `<th scope="col">${p.name}</th>`).join("")}</tr></thead><tbody>${rows.map(([label, value]) => `<tr><td>${label}</td>${selected.map((p) => `<td>${value(p)}</td>`).join("")}</tr>`).join("")}</tbody></table></div><p class="form-disclaimer">Illustrative products and prices. This comparison does not prescribe a product or application rate.</p>`;
  $("#compare-dialog").showModal();
}
$("#saved-filter").addEventListener("click", () => {
  savedOnly = !savedOnly;
  $("#saved-filter").setAttribute("aria-pressed", String(savedOnly));
  renderProducts();
});
$("#compare-open").addEventListener("click", openComparison);
$("#compare-clear").addEventListener("click", () => {
  compareProducts.clear();
  updateComparison();
  renderProducts();
});
document.addEventListener("change", (event) => {
  if (!event.target.matches("[data-compare]")) return;
  const id = event.target.dataset.compare;
  if (event.target.checked) {
    if (compareProducts.size >= 3) {
      event.target.checked = false;
      showToast("Compare up to three products at a time.");
      return;
    }
    compareProducts.add(id);
  } else compareProducts.delete(id);
  updateComparison();
});
document.addEventListener("click", (event) => {
  const save = event.target.closest("[data-save]");
  if (save) {
    const id = save.dataset.save;
    savedProducts.has(id) ? savedProducts.delete(id) : savedProducts.add(id);
    try {
      localStorage.setItem("avigna-saved", JSON.stringify([...savedProducts]));
    } catch {}
    renderProducts();
    (document.querySelector(`[data-save="${id}"]`) || $("#saved-filter")).focus(
      { preventScroll: true },
    );
  }
  const view = event.target.closest("[data-view]");
  if (view) openProduct(view.dataset.view);
  const close = event.target.closest("[data-close-dialog]");
  if (close) close.closest("dialog").close();
  if (event.target.closest("[data-film]")) {
    $("#film-dialog").showModal();
    $("#brand-film")
      .play()
      .catch(() => {});
  }
  if (event.target.closest("#checkout")) openCheckout();
  const article = event.target.closest("[data-article]");
  if (article) openArticle(article.dataset.article);
  const service = event.target.closest("[data-service]");
  if (service && service.closest("#article-dialog"))
    $("#article-dialog").close();
});
$("#film-dialog").addEventListener("close", () => $("#brand-film").pause());
document.querySelectorAll("dialog").forEach((dialog) =>
  dialog.addEventListener("click", (e) => {
    if (e.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      dialog.close();
  }),
);
function openCheckout() {
  const selected = products.filter((p) => cart[p.id]);
  if (!selected.length) return;
  closeCart();
  $("#checkout-lines").innerHTML =
    selected
      .map(
        (p) =>
          `<div class="checkout-line"><span>${p.name}<small>${p.weight} × ${cart[p.id]}</small></span><strong>${money(p.price * cart[p.id])}</strong></div>`,
      )
      .join("") +
    `<div class="checkout-line total"><span>Sample subtotal</span><span>${money(selected.reduce((sum, p) => sum + p.price * cart[p.id], 0))}</span></div>`;
  $("#checkout-result").hidden = true;
  $("#checkout-dialog").showModal();
}
$("#checkout-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(event.target);
  const result = $("#checkout-result");
  result.replaceChildren();
  const title = document.createElement("strong");
  title.textContent = "Your demo order summary";
  const name = document.createElement("p");
  name.textContent = `Prepared for ${form.get("name")} · ${form.get("email")}`;
  const address = document.createElement("p");
  address.textContent = `Delivery preview: ${form.get("address")}`;
  const items = document.createElement("p");
  items.textContent = products
    .filter((p) => cart[p.id])
    .map((p) => `${p.name} × ${cart[p.id]}`)
    .join(" / ");
  const notice = document.createElement("p");
  notice.textContent =
    "Preview complete. No order has been placed, no payment has been taken, and your details have not been sent.";
  result.append(title, name, address, items, notice);
  result.hidden = false;
  result.scrollIntoView({ block: "nearest" });
});
const plans = {
  establishment: {
    title: "Begin below the surface.",
    copy: "Start your season with a conversation about soil conditions and crop establishment. A soil profile can help define the questions to ask before choosing nutrition.",
    products: ["soil", "root"],
    step: 1,
  },
  vegetative: {
    title: "Make room for good growth.",
    copy: "During vegetative growth, bring crop observations and soil findings together. Explore balanced nutrition as part of a farm-specific plan.",
    products: ["grow", "micro"],
    step: 2,
  },
  flowering: {
    title: "Look closely at the next chapter.",
    copy: "Discuss crop condition as the season moves toward flowering and fruiting. Explore stage-specific nutrition needs with an advisor before selecting an input.",
    products: ["bloom", "micro"],
    step: 3,
  },
  harvest: {
    title: "Finish with a fuller picture.",
    copy: "Use crop observations and yield estimates to plan harvest conversations. Review the season and prepare soil and post-harvest questions for the next cycle.",
    products: ["earth"],
    step: 4,
  },
};
function buildPlan(animate = false) {
  const plan = plans[$("#plan-stage").value];
  const crop = $("#plan-crop").value;
  $("#plan-card").innerHTML =
    `<div class="plan-card-top"><span>YOUR SAMPLE GROWTH PATH</span><i>❧</i></div><div class="plan-card-body"><p class="plan-kicker">${crop.toUpperCase()} / ${$("#plan-stage").selectedOptions[0].text.toUpperCase()}</p><h3>${plan.title}</h3><p>${plan.copy}</p><div class="plan-progress" aria-label="Stage ${plan.step} of 4">${[1, 2, 3, 4].map((n) => `<span class="${n <= plan.step ? "filled" : ""}"></span>`).join("")}</div><div class="plan-products"><small>SAMPLE PRODUCTS TO EXPLORE</small>${plan.products
      .map((id) => {
        const p = products.find((p) => p.id === id);
        return `<div class="plan-product"><span class="plan-product-icon" style="--color:${p.color}">❧</span><div><h4><button data-view="${p.id}" style="padding:0">${p.name}</button></h4><p>${p.detail}</p></div><button data-add="${p.id}" aria-label="Add ${p.name} to bag">+</button></div>`;
      })
      .join(
        "",
      )}</div><p class="plan-note">An exploration tool, not an application recommendation. Soil tests and farm-specific advice should guide your decisions.</p></div>`;
  if (animate) {
    $("#plan-card").classList.remove("updated");
    void $("#plan-card").offsetWidth;
    $("#plan-card").classList.add("updated");
  }
}
$("#build-plan").addEventListener("click", () => buildPlan(true));
$("#plan-crop").addEventListener("change", () => buildPlan(true));
$("#plan-stage").addEventListener("change", () => buildPlan(true));
buildPlan();
const weatherSamples = {
  pune: {
    temp: 28,
    high: 30,
    low: 21,
    humidity: 64,
    wind: 9,
    condition: "Partly cloudy",
    days: [28, 29, 27, 26, 28],
    rain: [10, 15, 55, 65, 20],
    icons: ["☀", "☀", "☂", "☂", "☀"],
  },
  nashik: {
    temp: 26,
    high: 29,
    low: 19,
    humidity: 58,
    wind: 12,
    condition: "Clear intervals",
    days: [26, 27, 28, 26, 25],
    rain: [5, 10, 15, 30, 20],
    icons: ["☀", "☀", "☀", "☁", "☁"],
  },
  nagpur: {
    temp: 31,
    high: 33,
    low: 23,
    humidity: 70,
    wind: 7,
    condition: "Warm & cloudy",
    days: [31, 32, 30, 29, 30],
    rain: [20, 25, 60, 75, 35],
    icons: ["☁", "☀", "☂", "☂", "☁"],
  },
};
function renderWeather() {
  const data = weatherSamples[$("#weather-region").value];
  $("#weather-temp").textContent = `${data.temp}°`;
  $("#weather-condition").textContent = data.condition;
  $("#weather-range").textContent = `High ${data.high}° / Low ${data.low}°`;
  $("#weather-detail").textContent =
    `Humidity ${data.humidity}% · Wind ${data.wind} km/h`;
  $("#forecast-days").innerHTML = data.days
    .map(
      (temp, i) =>
        `<div class="forecast-day"><span>Day ${i + 1}</span><i aria-hidden="true">${data.icons[i]}</i><strong>${temp}°</strong><small>${data.rain[i]}% rain chance</small><span class="rain-bar" style="--rain:${data.rain[i]}%" aria-hidden="true"></span></div>`,
    )
    .join("");
  $("#weather-insight").textContent = data.rain.some((n) => n > 50)
    ? "This sample scenario includes wetter days. A real forecast could help you discuss field access and crop care timing."
    : "This sample scenario has relatively dry intervals. Check a current local forecast when planning real field activity.";
}
$("#weather-region").addEventListener("change", renderWeather);
renderWeather();
const articles = {
  soil: {
    title: "Get to know what’s beneath your feet.",
    image: "growing.jpg",
    category: "THE FOUNDATION / SOIL",
    intro:
      "Before the next input comes the next question: what does your soil tell you? A useful soil conversation begins with observations, sampling, and the history of the field.",
    sections: [
      [
        "Begin with the field",
        "Note your crop history, visible changes across the field, irrigation conditions, and previous nutrition practices. A consistent record gives an advisor context that a single number cannot.",
      ],
      [
        "Bring the right questions",
        "Ask which soil measurements are relevant to your crop and how to collect a representative sample. Sampling location and depth should follow guidance from your testing provider.",
      ],
      [
        "Connect the findings",
        "Use the results alongside crop observations and local advice. The aim is a farm-specific plan, with a clearer reason for each next step.",
      ],
    ],
    service: "Soil & farm analysis",
  },
  season: {
    title: "Good growth starts with a good question.",
    image: "harvest.jpg",
    category: "THE SEASON AHEAD / PLANNING",
    intro:
      "A season plan is a set of informed conversations. Start with your crop, field conditions, available resources, and the observations you want to collect.",
    sections: [
      [
        "Map the season",
        "Outline establishment, vegetative growth, flowering, and harvest windows for your crop. Local conditions can move these stages, so use the timeline as a guide to review.",
      ],
      [
        "Make room for observation",
        "Build in moments to check crop condition, soil moisture, and visible changes. Keep notes that can be discussed with an advisor.",
      ],
      [
        "Look beyond harvest",
        "Post-harvest observations can help frame the next season. Record what changed and what you want to understand before planting again.",
      ],
    ],
    service: "Crop planning & advisory",
  },
  perspective: {
    title: "Step back. See your farm differently.",
    image: "landscape.jpg",
    category: "A CONNECTED VIEW / FIELD INSIGHTS",
    intro:
      "A wider view can reveal questions that are hard to spot from one place. Field imagery complements the observations made on the ground.",
    sections: [
      [
        "A view from above",
        "Drone imagery can provide a record of field patterns. Those patterns are starting points for closer inspection, rather than a diagnosis by themselves.",
      ],
      [
        "Connect image and observation",
        "Review areas of interest alongside crop details, soil conditions, weather, and a ground visit. A connected interpretation is more useful than an isolated image.",
      ],
      [
        "Keep the story together",
        "Organize imagery and field notes over time so changes can be discussed with the people supporting your farm.",
      ],
    ],
    service: "Drone & field insights",
  },
};
function openArticle(id) {
  const article = articles[id];
  if (!article) return;
  $("#article-content").innerHTML =
    `<img class="article-cover" src="assets/${article.image}" alt="Agricultural field note"><div class="article-body"><p class="eyebrow">${article.category}</p><h2>${article.title}</h2><p>${article.intro}</p>${article.sections.map(([heading, copy]) => `<h3>${heading}</h3><p>${copy}</p>`).join("")}<button class="button green" data-service="${article.service}">Explore the conversation <span>↗</span></button><p class="form-disclaimer">General educational field note. Seek local, farm-specific advice for decisions.</p></div>`;
  $("#article-dialog").showModal();
}
// Motion is progressive: page content remains visible if scripting is unavailable.
const progress = document.createElement("div");
progress.className = "scroll-progress";
document.body.append(progress);
function updateScroll() {
  const distance = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${distance > 0 ? (window.scrollY / distance) * 100 : 0}%`;
  $("#back-top").hidden = window.scrollY < 700;
  $("header").classList.toggle("scrolled", window.scrollY > 30);
}
let scrollQueued = false;
window.addEventListener(
  "scroll",
  () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => {
      updateScroll();
      scrollQueued = false;
    });
  },
  { passive: true },
);
$("#back-top").addEventListener("click", () =>
  window.scrollTo({
    top: 0,
    behavior: reducedMotion.matches ? "instant" : "smooth",
  }),
);
updateScroll();
if ("IntersectionObserver" in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      }),
    { threshold: 0.1 },
  );
  document
    .querySelectorAll(
      ".section-heading,.service-layout,.approach-copy,.journal-card,.faq-list,.lab-heading,.planner-intro,.weather-intro",
    )
    .forEach((el) => {
      el.classList.add("reveal-ready");
      observer.observe(el);
    });
}
renderProducts();
updateComparison();

// Small dependency-free 3D terrain renderer. All vertices are projected from world coordinates.
(() => {
  const canvas = $("#farm-canvas");
  const context = canvas.getContext("2d");
  if (!context) return;
  let width = 600,
    height = 475,
    rotation = -0.5,
    stage = 0.55,
    layer = "growth",
    visible = true,
    frame = 0,
    lastTime = 0,
    phase = 0,
    drag = null;
  const layers = {
    growth: {
      title: "A fuller picture<br>of your crops.",
      copy: "Explore a sample crop canopy. Field observations can help bring growth patterns and areas for closer inspection into focus.",
      label: "Crop growth layer",
      legend: [
        ["#d2e69a", "Canopy"],
        ["#729953", "Growth"],
        ["#aa8559", "Soil"],
      ],
    },
    soil: {
      title: "The foundation<br>of every season.",
      copy: "Look beneath the canopy at an illustrative soil layer. A real soil profile can inform the questions to bring into your nutrition plan.",
      label: "Illustrative soil profile",
      legend: [
        ["#bca071", "Surface"],
        ["#907349", "Profile"],
        ["#675640", "Foundation"],
      ],
    },
    drone: {
      title: "A different view.<br>A better question.",
      copy: "Explore an illustrative flight above the field. Drone imagery can help identify patterns to investigate alongside ground observations.",
      label: "Sample flight visualization",
      legend: [
        ["#91bca0", "Field"],
        ["#cfebae", "Flight path"],
        ["#d7e6c7", "Drone"],
      ],
    },
  };
  const ground = (x, y) =>
    0.07 * Math.sin(x * 2 + y * 0.6) + 0.04 * Math.cos(y * 2.5);
  const scale = () => Math.min(width / 4.9, height / 3.35);
  function project(x, y, z) {
    const c = Math.cos(rotation),
      s = Math.sin(rotation);
    const rx = x * c - y * s,
      ry = x * s + y * c;
    const zoom = scale();
    return [
      width * 0.5 + rx * zoom,
      height * 0.58 + ry * zoom * 0.49 - z * zoom + Math.sin(phase) * 3,
    ];
  }
  function polygon(points, fill, stroke) {
    context.beginPath();
    points.forEach((p, i) => {
      const [x, y] = project(...p);
      i ? context.lineTo(x, y) : context.moveTo(x, y);
    });
    context.closePath();
    context.fillStyle = fill;
    context.fill();
    if (stroke) {
      context.strokeStyle = stroke;
      context.lineWidth = 0.7;
      context.stroke();
    }
  }
  function line(points, color, lineWidth = 1, dash = []) {
    context.beginPath();
    points.forEach((p, i) => {
      const [x, y] = project(...p);
      i ? context.lineTo(x, y) : context.moveTo(x, y);
    });
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.setLineDash(dash);
    context.stroke();
    context.setLineDash([]);
  }
  function draw() {
    context.clearRect(0, 0, width, height);
    const center = project(0, 0, -0.6);
    const shadow = context.createRadialGradient(
      center[0],
      center[1],
      1,
      center[0],
      center[1],
      scale() * 2,
    );
    shadow.addColorStop(0, "#071b1660");
    shadow.addColorStop(1, "#071b1600");
    context.fillStyle = shadow;
    context.fillRect(0, 0, width, height);
    const ring = [];
    for (let i = 0; i <= 80; i++) {
      const a = (i / 80) * Math.PI * 2;
      ring.push([Math.cos(a) * 2.23, Math.sin(a) * 2.23, -0.35]);
    }
    line(ring, "#c5d7a01b", 1, [4, 6]);
    const extent = 1.6,
      n = 12,
      unit = (extent * 2) / n;
    const faces = [];
    for (let k = 0; k < 4; k++) {
      let a, b;
      if (k === 0) {
        a = [-extent, -extent];
        b = [extent, -extent];
      }
      if (k === 1) {
        a = [extent, -extent];
        b = [extent, extent];
      }
      if (k === 2) {
        a = [extent, extent];
        b = [-extent, extent];
      }
      if (k === 3) {
        a = [-extent, extent];
        b = [-extent, -extent];
      }
      const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      faces.push({
        a,
        b,
        depth: mid[0] * Math.sin(rotation) + mid[1] * Math.cos(rotation),
      });
    }
    faces
      .sort((a, b) => a.depth - b.depth)
      .forEach((face) => {
        const a = face.a,
          b = face.b;
        const top = [];
        for (let i = 0; i <= 12; i++) {
          const x = a[0] + ((b[0] - a[0]) * i) / 12,
            y = a[1] + ((b[1] - a[1]) * i) / 12;
          top.push([x, y, ground(x, y)]);
        }
        polygon(
          [...top, [b[0], b[1], -0.47], [a[0], a[1], -0.47]],
          face.depth > 0 ? "#755d3f" : "#51452f",
          "#a4895544",
        );
        line(
          [
            [a[0], a[1], -0.16],
            [b[0], b[1], -0.16],
          ],
          "#bb95654d",
          2,
        );
        line(
          [
            [a[0], a[1], -0.34],
            [b[0], b[1], -0.34],
          ],
          "#3c352660",
          4,
        );
      });
    const tiles = [];
    for (let row = 0; row < n; row++)
      for (let col = 0; col < n; col++) {
        const x = -extent + col * unit,
          y = -extent + row * unit;
        tiles.push({
          x,
          y,
          row,
          col,
          depth:
            (x + unit / 2) * Math.sin(rotation) +
            (y + unit / 2) * Math.cos(rotation),
        });
      }
    tiles.sort((a, b) => a.depth - b.depth);
    tiles.forEach(({ x, y, row, col }) => {
      const colors =
        layer === "soil"
          ? ["#b49a67", "#aa8a58", "#947347", "#b69a6a"]
          : layer === "drone"
            ? ["#608762", "#779978", "#567d60", "#8ba57a"]
            : stage > 0.8
              ? ["#a8b26b", "#a5a564", "#8f9c59", "#bec783"]
              : ["#759b4f", "#8aa75e", "#5e884a", "#9bb670"];
      const color =
        colors[
          (Math.floor(col / 3) +
            Math.floor(row / 4) +
            (row % 3 === 0 ? 1 : 0)) %
            4
        ];
      polygon(
        [
          [x, y, ground(x, y)],
          [x + unit, y, ground(x + unit, y)],
          [x + unit, y + unit, ground(x + unit, y + unit)],
          [x, y + unit, ground(x, y + unit)],
        ],
        color,
        "#d9df9630",
      );
    });
    for (let row = 0; row <= n; row += 3) {
      const pts = [];
      for (let col = 0; col <= n; col++) {
        const x = -extent + col * unit,
          y = -extent + row * unit;
        pts.push([x, y, ground(x, y) + 0.004]);
      }
      line(pts, layer === "soil" ? "#e7d6a253" : "#cedaac55", 1);
    }
    if (layer !== "soil") {
      const plants = [];
      for (let row = 0; row < 11; row++)
        for (let col = 0; col < 11; col++) {
          const x = -1.42 + col * 0.28,
            y = -1.42 + row * 0.28;
          plants.push({
            x,
            y,
            depth: x * Math.sin(rotation) + y * Math.cos(rotation),
          });
        }
      plants.sort((a, b) => a.depth - b.depth);
      plants.forEach(({ x, y }) => {
        const z = ground(x, y),
          size = 0.08 + stage * 0.27;
        const sway = reducedMotion.matches
          ? 0
          : Math.sin(phase * 1.5 + x * 3 + y) * 0.015;
        line(
          [
            [x, y, z],
            [x + sway, y, z + size],
          ],
          stage > 0.8 ? "#d7cf84" : "#c2db81",
          1.1,
        );
        const leafColor = stage > 0.8 ? "#d7d092" : "#b6d980";
        polygon(
          [
            [x, y, z + size * 0.45],
            [x - 0.065, y - 0.02, z + size * 0.8],
            [x - 0.1, y - 0.03, z + size * 0.66],
            [x, y, z + size * 0.35],
          ],
          leafColor,
        );
        polygon(
          [
            [x, y, z + size * 0.62],
            [x + 0.07, y + 0.03, z + size * 1.02],
            [x + 0.105, y + 0.04, z + size * 0.87],
            [x, y, z + size * 0.48],
          ],
          stage > 0.8 ? "#ece2a4" : "#d3e8a0",
        );
      });
    }
    if (layer === "soil") {
      for (const [x, y] of [
        [-0.8, -0.7],
        [0.9, 0.4],
        [-0.7, 1],
      ]) {
        const p = project(x, y, ground(x, y) + 0.01);
        context.strokeStyle = "#f2debdaa";
        context.lineWidth = 1;
        context.beginPath();
        context.ellipse(p[0], p[1], 16, 8, 0, 0, Math.PI * 2);
        context.stroke();
        context.beginPath();
        context.arc(p[0], p[1], 3, 0, Math.PI * 2);
        context.fillStyle = "#f5e7be";
        context.fill();
      }
    }
    if (layer === "drone") {
      const flight = [];
      for (let i = 0; i < 5; i++) {
        const y = -1.3 + i * 0.65;
        flight.push(
          [i % 2 ? -1.25 : 1.25, y, 0.65],
          [i % 2 ? 1.25 : -1.25, y, 0.65],
        );
      }
      line(flight, "#cfebae77", 1.2, [5, 5]);
      const t = (phase * 0.12) % 1;
      const segment = Math.floor(t * (flight.length - 1));
      const mix = t * (flight.length - 1) - segment;
      const a = flight[segment],
        b = flight[Math.min(segment + 1, flight.length - 1)];
      const dx = a[0] + (b[0] - a[0]) * mix,
        dy = a[1] + (b[1] - a[1]) * mix;
      line(
        [
          [dx, dy, 0.63],
          [dx, dy, ground(dx, dy)],
        ],
        "#d0e8a955",
        1,
        [3, 5],
      );
      polygon(
        [
          [dx - 0.1, dy - 0.06, 0.65],
          [dx + 0.1, dy - 0.06, 0.65],
          [dx + 0.1, dy + 0.06, 0.65],
          [dx - 0.1, dy + 0.06, 0.65],
        ],
        "#e0e9cd",
      );
      for (const [ox, oy] of [
        [-0.2, -0.15],
        [0.2, -0.15],
        [0.2, 0.15],
        [-0.2, 0.15],
      ]) {
        line(
          [
            [dx, dy, 0.65],
            [dx + ox, dy + oy, 0.65],
          ],
          "#d5e4c7",
          2,
        );
        const p = project(dx + ox, dy + oy, 0.65);
        context.strokeStyle = "#d2e8b9";
        context.lineWidth = 1.5;
        context.beginPath();
        context.ellipse(p[0], p[1], 9, 4.5, 0, 0, Math.PI * 2);
        context.stroke();
      }
    }
    const p = project(-1.6, 1.6, -0.47);
    context.fillStyle = "#9ab67c";
    context.font = "8px Arial";
    context.fillText("AVIGNA / FIELD STUDY", p[0] - 40, p[1] + 23);
  }
  function animate(time) {
    frame = 0;
    if (!visible || reducedMotion.matches) return;
    if (time - lastTime > 33) {
      phase += 0.018;
      draw();
      lastTime = time;
    }
    frame = requestAnimationFrame(animate);
  }
  function start() {
    if (!frame && visible && !reducedMotion.matches)
      frame = requestAnimationFrame(animate);
    draw();
  }
  function resize() {
    const r = canvas.getBoundingClientRect();
    width = r.width;
    height = r.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }
  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(canvas);
  else window.addEventListener("resize", resize);
  if ("IntersectionObserver" in window)
    new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
        if (visible) start();
        else {
          cancelAnimationFrame(frame);
          frame = 0;
        }
      },
      { rootMargin: "150px" },
    ).observe(canvas);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else if (visible) start();
  });
  canvas.addEventListener("pointerdown", (e) => {
    drag = { x: e.clientX, y: e.clientY, rotation };
    if (e.pointerType === "mouse") canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!drag) return;
    if (Math.abs(e.clientX - drag.x) > Math.abs(e.clientY - drag.y)) {
      rotation = drag.rotation + (e.clientX - drag.x) * 0.008;
      draw();
    }
  });
  const stop = () => (drag = null);
  canvas.addEventListener("pointerup", stop);
  canvas.addEventListener("pointercancel", stop);
  canvas.addEventListener("pointerleave", (e) => {
    if (e.buttons === 0) stop();
  });
  $("#rotate-left").addEventListener("click", () => {
    rotation -= 0.3;
    draw();
  });
  $("#rotate-right").addEventListener("click", () => {
    rotation += 0.3;
    draw();
  });
  $("#reset-view").addEventListener("click", () => {
    rotation = -0.5;
    draw();
  });
  $("#growth-slider").addEventListener("input", (e) => {
    stage = Number(e.target.value) / 100;
    $("#growth-label").textContent =
      stage < 0.3 ? "Establishment" : stage < 0.8 ? "Vegetative" : "Maturity";
    draw();
  });
  document.querySelectorAll("[data-layer]").forEach((button) =>
    button.addEventListener("click", () => {
      layer = button.dataset.layer;
      const data = layers[layer];
      document.querySelectorAll("[data-layer]").forEach((el) => {
        el.classList.toggle("active", el === button);
        el.setAttribute("aria-pressed", String(el === button));
      });
      $("#layer-title").innerHTML = data.title;
      $("#layer-copy").textContent = data.copy;
      $("#terrain-overlay-label").textContent = data.label;
      $("#layer-legend").innerHTML = data.legend
        .map(
          ([color, label]) =>
            `<span><i style="background:${color}"></i> ${label}</span>`,
        )
        .join("");
      draw();
    }),
  );
  reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches) {
      cancelAnimationFrame(frame);
      frame = 0;
      draw();
    } else start();
  });
  resize();
  start();
})();
