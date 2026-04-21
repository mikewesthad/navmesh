import Phaser from "phaser";
import RuntimeNavmeshLabScene from "./scenes/start";

const ui = {
  toolButtons: [...document.querySelectorAll("[data-tool]")],
  navButtons: [...document.querySelectorAll("[data-nav-mode]")],
  updateButtons: [...document.querySelectorAll("[data-update-mode]")],
  zoomButtons: [...document.querySelectorAll("[data-zoom]")],
  sidebarToggle: document.getElementById("sidebar-toggle"),
  body: document.body,
  chipToolText: document.getElementById("chip-tool-text"),
  chipToolDot: document.getElementById("chip-tool-dot"),
  chipNavText: document.getElementById("chip-nav-text"),
  chipNavDot: document.getElementById("chip-nav-dot"),
  chipUpdateText: document.getElementById("chip-update-text"),
  chipUpdateDot: document.getElementById("chip-update-dot"),
  statusSummary: document.getElementById("status-summary"),
  statusAlert: document.getElementById("status-alert"),
  lastPatchLabel: document.getElementById("last-patch-label"),
  statFastLast: document.getElementById("stat-fast-last"),
  statFastAvg: document.getElementById("stat-fast-avg"),
  statFastCount: document.getElementById("stat-fast-count"),
  statLegacyLast: document.getElementById("stat-legacy-last"),
  statLegacyAvg: document.getElementById("stat-legacy-avg"),
  statLegacyCount: document.getElementById("stat-legacy-count"),
  statPolys: document.getElementById("stat-polys"),
  statWalkable: document.getElementById("stat-walkable"),
  statLandCount: document.getElementById("stat-land-count"),
  statWaterCount: document.getElementById("stat-water-count"),
  statWallCount: document.getElementById("stat-wall-count"),
  statsNote: document.getElementById("stats-note"),
};

const setActive = (buttons, attrName, value) => {
  buttons.forEach((button) => button.classList.toggle("active", button.dataset[attrName] === value));
};

const syncSidebarButton = () => {
  const collapsed = ui.body.classList.contains("sidebar-collapsed");
  ui.sidebarToggle.textContent = collapsed ? ">" : "<";
  ui.sidebarToggle.setAttribute("aria-expanded", String(!collapsed));
};

const renderSnapshot = (snapshot) => {
  if (!snapshot) return;

  setActive(ui.toolButtons, "tool", snapshot.tool);
  setActive(ui.navButtons, "navMode", snapshot.navMode);
  setActive(ui.updateButtons, "updateMode", snapshot.updateMode);

  ui.chipToolText.textContent = snapshot.toolLabel;
  ui.chipToolDot.style.color = snapshot.toolColor;
  ui.chipNavText.textContent = snapshot.navModeLabel;
  ui.chipNavDot.style.color = snapshot.navModeColor;
  ui.chipUpdateText.textContent = snapshot.updateModeLabel;
  ui.chipUpdateDot.style.color = snapshot.updateModeColor;

  ui.statusSummary.textContent = snapshot.summary;
  ui.statusAlert.textContent = snapshot.alert?.message || "";
  ui.statusAlert.className = `screen-alert${snapshot.alert?.message ? ` visible ${snapshot.alert.level || "info"}` : ""}`;
  ui.lastPatchLabel.textContent = snapshot.lastPatchLabel;

  ui.statFastLast.textContent = snapshot.stats.accelerated.last;
  ui.statFastAvg.textContent = snapshot.stats.accelerated.avg;
  ui.statFastCount.textContent = snapshot.stats.accelerated.count;
  ui.statLegacyLast.textContent = snapshot.stats.legacy.last;
  ui.statLegacyAvg.textContent = snapshot.stats.legacy.avg;
  ui.statLegacyCount.textContent = snapshot.stats.legacy.count;
  ui.statPolys.textContent = String(snapshot.activePolygons);
  ui.statWalkable.textContent = String(snapshot.activeWalkableTiles);
  ui.statLandCount.textContent = String(snapshot.landTiles);
  ui.statWaterCount.textContent = String(snapshot.waterTiles);
  ui.statWallCount.textContent = String(snapshot.wallTiles);
  ui.statsNote.textContent = snapshot.note;
};

const scene = new RuntimeNavmeshLabScene({ renderSnapshot });

ui.toolButtons.forEach((button) => {
  button.addEventListener("click", () => scene.setTool(button.dataset.tool));
});

ui.navButtons.forEach((button) => {
  button.addEventListener("click", () => scene.setNavMode(button.dataset.navMode));
});

ui.updateButtons.forEach((button) => {
  button.addEventListener("click", () => scene.setUpdateMode(button.dataset.updateMode));
});

ui.zoomButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.zoom === "in") scene.zoomIn();
    if (button.dataset.zoom === "out") scene.zoomOut();
  });
});

syncSidebarButton();
ui.sidebarToggle.addEventListener("click", () => {
  ui.body.classList.toggle("sidebar-collapsed");
  syncSidebarButton();
});

const container = document.getElementById("game-container");

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game-container",
  width: Math.max(1, container.clientWidth),
  height: Math.max(1, container.clientHeight),
  backgroundColor: "#0b3340",
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: 0,
      debug: false,
    },
  },
  scene: [scene],
});

const resizeObserver = new ResizeObserver(() => {
  const rect = container.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) {
    game.scale.resize(rect.width, rect.height);
    scene.handleExternalResize(rect.width, rect.height);
  }
});

resizeObserver.observe(container);
