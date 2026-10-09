(() => {
  const $ = (selector) => document.querySelector(selector);
  const icon = (name) => `<i data-lucide="${name}" aria-hidden="true"></i>`;
  const tool = (id, name, label, extra = "") => `<button id="${id}" class="workspace-tool" type="button" aria-label="${label}" title="${label}" ${extra}>${icon(name)}</button>`;
  const shell = document.createElement("div");
  shell.className = "workspace-shell";
  shell.innerHTML = `
    <header class="workspace-header">
      <div class="workspace-brand">TEST 2</div>
      <div class="workspace-title"><h1>Accessibilité</h1><span>Wiesbaden · Allemagne</span></div>
      <div class="workspace-header-actions"><span class="local-status"><span></span>Local</span></div>
    </header>
    <div class="workspace-body">
      <aside class="workspace-sidebar left-sidebar" aria-label="Trajets et réseau">
        <div class="sidebar-heading"><span>${icon("layers")}<strong>Exploration</strong></span>${tool("toggleLeft", "panel-left-close", "Replier le panneau de trajet", 'aria-expanded="true" aria-controls="leftContent"')}</div>
        <div id="leftContent" class="sidebar-content">
          <section class="sidebar-section origin-section"><h2>${icon("map-pin")}Trajet</h2><div id="searchSlot"></div><div id="tripSlot"></div><div id="tripActions" class="trip-actions"></div></section>
          <section class="sidebar-section"><h2>${icon("bus")}Réseau</h2><div id="networkSlot"></div></section>
          <section class="sidebar-section"><h2>${icon("scan-line")}Courbes isochrones</h2><div id="isoSlot"></div></section>
          <div class="sidebar-bottom"><a href="../local-notice.html" target="_blank" rel="noopener">${icon("info")}Données et méthode${icon("arrow-up-right")}</a></div>
        </div>
      </aside>
      <main class="workspace-map" aria-label="Carte d'accessibilité">
        <div class="map-heading"><span>${icon("map")}Carte des temps de trajet</span><span class="map-heading-detail">Marche + bus</span></div>
        <div id="canvasSlot"></div>
        <footer class="workspace-credit">Camille Roux / MIT · GTFS.de / DELFI · © OpenStreetMap</footer>
      </main>
      <aside class="workspace-sidebar right-sidebar" aria-label="Paramètres et indicateurs">
        <div class="sidebar-heading"><span>${icon("sliders-horizontal")}<strong>Paramètres</strong></span>${tool("toggleRight", "panel-right-close", "Replier le panneau de paramètres", 'aria-expanded="true" aria-controls="rightContent"')}</div>
        <div id="rightContent" class="sidebar-content">
          <section class="sidebar-section"><h2>${icon("clock-3")}Temps de trajet</h2><div id="durationSlot"></div></section>
          <section class="sidebar-section appearance-section"><h2>${icon("sliders-horizontal")}Affichage</h2><div id="appearanceSliders"></div><button type="button" id="resetAppearance" class="reset-appearance">${icon("rotate-ccw")}Rétablir l'affichage</button></section>
          <section class="sidebar-section accessibility-section"><h2>${icon("chart-no-axes-combined")}Accessibilité</h2><div class="reach-heading"><strong id="reachNumber">—</strong><span>en moins de 30 min</span></div><div id="reachSlot"></div><span class="metric-note">Arrêts de bus · estimation</span></section>
        </div>
      </aside>
    </div>`;
  document.body.append(shell);
  const stage = $("#mapStage");
  $("#canvasSlot").append(stage);
  $("#searchSlot").append($("#searchForm"));
  $("#tripSlot").append($("#tripPanel"));
  $("#networkSlot").append($("#busToggle").closest(".control-group"));
  $("#isoSlot").append($("#isoToggles"));
  $("#durationSlot").append($("#maxRange").closest(".control-group"));
  $("#reachSlot").append($("#reach"));
  const networkDetails = document.createElement("details");
  networkDetails.className = "sidebar-section network-details";
  networkDetails.innerHTML = `<summary>Réseau en chiffres</summary><p class="metric-note">Référence : Wiesbaden Hauptbahnhof</p>`;
  const statistics = $(".stat-grid");
  statistics.querySelector(".stat").remove();
  networkDetails.append(statistics);
  const linesDetails = document.createElement("details");
  linesDetails.className = "network-lines";
  linesDetails.innerHTML = "<summary>Lignes et fréquences</summary>";
  linesDetails.append($(".lines-table"));
  networkDetails.append(linesDetails);
  $("#rightContent").append(networkDetails);
  $("#tripActions").append($("#locate"), $("#swap"));
  $(".workspace-header-actions").append($("#share"));
  $("#searchInput").placeholder = "Rechercher une adresse";
  $("#searchForm button").innerHTML = icon("search");
  $("#searchForm button").setAttribute("aria-label", "Rechercher une adresse");
  $("#searchForm button").title = "Rechercher une adresse";
  $("#tripHint").hidden = true;
  $(".map-bus").hidden = true;
  $("#networkSlot .control-label").hidden = true;
  $("#networkSlot input:disabled").closest("label").hidden = true;
  $("#isoSlot .control-label").hidden = true;
  $("#durationSlot .control-label").textContent = "Durée maximale";
  for (const [id, name, label] of [["locate", "locate-fixed", "Ma position"], ["swap", "arrow-down-up", "Inverser le trajet"], ["share", "share-2", "Partager"], ["zoomIn", "plus", "Zoomer"], ["zoomOut", "minus", "Dézoomer"], ["recenter", "scan", "Recentrer"], ["fullscreen", "maximize", "Plein écran"]]) {
    const button = $(`#${id}`);
    button.innerHTML = icon(name) + (id === "share" ? "<span>Partager</span>" : "");
    button.title = label;
    button.setAttribute("aria-label", label);
  }
  const sliders = [
    {key: "opacity", label: "Opacité du dégradé", min: 0, max: 100, step: 1, value: 78, unit: "%", factor: 0.01},
    {key: "fade", label: "Fondu extérieur", min: 2, max: 40, step: 1, value: 15, unit: "%", factor: 0.01},
    {key: "networkWidth", label: "Épaisseur du réseau", min: 0.5, max: 5, step: 0.5, value: 3, unit: "px", factor: 1},
    {key: "contourScale", label: "Épaisseur des isochrones", min: 40, max: 200, step: 10, value: 100, unit: "%", factor: 0.01},
  ];
  for (const setting of sliders) {
    const row = document.createElement("div");
    row.className = "appearance-control";
    row.innerHTML = `<label for="setting-${setting.key}">${setting.label}</label><output for="setting-${setting.key}">${setting.value} ${setting.unit}</output><input id="setting-${setting.key}" type="range" min="${setting.min}" max="${setting.max}" step="${setting.step}" value="${setting.value}">`;
    row.querySelector("input").addEventListener("input", (event) => {
      row.querySelector("output").textContent = `${event.target.value} ${setting.unit}`;
      window.dispatchEvent(new CustomEvent("map-appearance", {detail: {[setting.key]: Number(event.target.value) * setting.factor}}));
    });
    $("#appearanceSliders").append(row);
  }
  $("#resetAppearance").addEventListener("click", () => {
    for (const setting of sliders) {
      const input = $(`#setting-${setting.key}`);
      input.value = setting.value;
      input.dispatchEvent(new Event("input", {bubbles: true}));
    }
  });
  const legend = $(".legend");
  legend.removeAttribute("aria-hidden");
  legend.id = "mapLegend";
  const legendBody = document.createElement("div");
  legendBody.id = "legendContent";
  legendBody.className = "legend-content";
  legendBody.append(...legend.childNodes);
  const legendToggle = document.createElement("button");
  legendToggle.type = "button";
  legendToggle.id = "toggleLegend";
  legendToggle.setAttribute("aria-expanded", "true");
  legendToggle.setAttribute("aria-controls", "legendContent");
  legendToggle.innerHTML = `<span>${icon("list-filter")}Temps de trajet</span>${icon("chevron-down")}`;
  legendToggle.title = "Replier la légende";
  legend.append(legendToggle, legendBody);
  legendToggle.addEventListener("click", () => {
    legendBody.hidden = !legendBody.hidden;
    legendToggle.setAttribute("aria-expanded", String(!legendBody.hidden));
    legendToggle.title = legendBody.hidden ? "Déplier la légende" : "Replier la légende";
  });
  const smallScreen = matchMedia("(max-width: 900px)");
  function setPanel(side, open, focusToggle = false) {
    if (open && smallScreen.matches) setPanel(side === "left" ? "right" : "left", false);
    const button = $(`#toggle${side === "left" ? "Left" : "Right"}`);
    const content = $(`#${side}Content`);
    shell.classList.toggle(`${side}-collapsed`, !open);
    content.hidden = !open;
    button.setAttribute("aria-expanded", String(open));
    const label = `${open ? "Replier" : "Déplier"} le panneau ${side === "left" ? "de trajet" : "de paramètres"}`;
    button.setAttribute("aria-label", label);
    button.title = label;
    if (focusToggle) button.focus();
  }
  for (const side of ["left", "right"]) {
    const button = $(`#toggle${side === "left" ? "Left" : "Right"}`);
    button.addEventListener("click", () => setPanel(side, button.getAttribute("aria-expanded") !== "true"));
  }
  function applyScreenMode() {
    setPanel("left", !smallScreen.matches);
    setPanel("right", !smallScreen.matches);
  }
  smallScreen.addEventListener("change", applyScreenMode);
  applyScreenMode();
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !smallScreen.matches) return;
    for (const side of ["left", "right"]) {
      if (!shell.classList.contains(`${side}-collapsed`)) setPanel(side, false, true);
    }
  });
  const syncReach = () => { $("#reachNumber").textContent = $("#reach").textContent.match(/^\d+\s*%/)?.[0] ?? "—"; };
  new MutationObserver(syncReach).observe($("#reach"), {childList: true, characterData: true, subtree: true});
  syncReach();
  for (const input of shell.querySelectorAll('input[type="range"]')) {
    const updateTrack = () => input.style.setProperty("--range-fill", `${100 * (input.value - input.min) / (input.max - input.min)}%`);
    input.addEventListener("input", updateTrack);
    if (input.id === "maxRange") new MutationObserver(updateTrack).observe($("#maxValue"), {childList:true});
    updateTrack();
  }
  window.lucide.createIcons({attrs: {"stroke-width": 1.7}});
})();
