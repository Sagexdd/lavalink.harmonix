const API_URL = "/api/stats.js";
const refreshRate = 60000; // 60 seconds

let memoryChart, cpuChart;

async function fetchStats() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Failed to fetch");

    const data = await response.json();

    updateStatus(true);
    updateStats(data);
    updateCharts(data);
  } catch {
    updateStatus(false);
    updateStats(null);
    updateCharts(null);
  }
}

function updateStatus(online) {
  const statusSpan = document.getElementById("status");
  statusSpan.className = online ? "online" : "offline";
  statusSpan.textContent = online ? "Online" : "Offline";
}

function formatBytes(bytes) {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  if (!bytes) return "0 B";
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

function formatUptime(ms) {
  const seconds = Math.floor(ms / 1000);
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${d}d ${h}h ${m}m ${s}s`;
}

function updateStats(data) {
  document.getElementById("players").textContent = data?.players ?? 0;
  document.getElementById("playingPlayers").textContent = data?.playingPlayers ?? 0;
  document.getElementById("uptime").textContent = data?.uptime ? formatUptime(data.uptime) : "N/A";

  const mem = data?.memory ?? {};
  document.getElementById("memFree").textContent = formatBytes(mem.free);
  document.getElementById("memUsed").textContent = formatBytes(mem.used);
  document.getElementById("memAllocated").textContent = formatBytes(mem.allocated);
  document.getElementById("memReservable").textContent = formatBytes(mem.reservable);

  const cpu = data?.cpu ?? {};
  document.getElementById("cpuCores").textContent = cpu.cores ?? "N/A";
  document.getElementById("cpuSystem").textContent = cpu.systemLoad?.toFixed(2) ?? "N/A";
  document.getElementById("cpuLavalink").textContent = cpu.lavalinkLoad?.toFixed(2) ?? "N/A";
}

function updateCharts(data) {
  const mem = data?.memory ?? {};
  const cpu = data?.cpu ?? {};

  memoryChart.data.datasets[0].data = [
    mem.used ?? 0,
    mem.free ?? 0,
    (mem.reservable ?? 0) - (mem.allocated ?? 0)
  ];
  memoryChart.update();

  cpuChart.data.datasets[0].data = [
    cpu.lavalinkLoad ?? 0,
    cpu.systemLoad ?? 0,
    1 - ((cpu.lavalinkLoad ?? 0) + (cpu.systemLoad ?? 0))
  ];
  cpuChart.update();
}

function initCharts() {
  const memCtx = document.getElementById("memoryChart").getContext("2d");
  const cpuCtx = document.getElementById("cpuChart").getContext("2d");

  memoryChart = new Chart(memCtx, {
    type: "doughnut",
    data: {
      labels: ["Used", "Free", "Available"],
      datasets: [{
        data: [0, 0, 0],
        backgroundColor: ["#ff4d4d", "#66ff66", "#999"]
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } }
    }
  });

  cpuChart = new Chart(cpuCtx, {
    type: "doughnut",
    data: {
      labels: ["Lavalink Load", "System Load", "Idle"],
      datasets: [{
        data: [0, 0, 1],
        backgroundColor: ["#ff6666", "#ffcc66", "#999"]
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } }
    }
  });
}

// Initial
initCharts();
fetchStats();

// Auto refresh every 60s
setInterval(fetchStats, refreshRate);  cards.playingPlayers.textContent = data.playingPlayers ?? 0;
  cards.uptime.textContent = formatUptime(data.uptime ?? 0);
  cards.systemLoad.textContent = (data.cpu?.systemLoad * 100).toFixed(2) + "%";
  cards.lavalinkLoad.textContent = (data.cpu?.lavalinkLoad * 100).toFixed(2) + "%";
  cards.memoryFree.textContent = (data.memory?.free / 1024 / 1024).toFixed(1) + " MB";
  cards.memoryUsed.textContent = (data.memory?.used / 1024 / 1024).toFixed(1) + " MB";

  const timestamp = new Date().toLocaleTimeString();
  updateChart(cpuChart, timestamp, [
    (data.cpu?.systemLoad * 100).toFixed(2),
    (data.cpu?.lavalinkLoad * 100).toFixed(2)
  ]);

  updateChart(memoryChart, timestamp, [
    (data.memory?.free / 1024 / 1024).toFixed(1),
    (data.memory?.used / 1024 / 1024).toFixed(1)
  ]);
}

function createChart(ctx, label, labels, colors) {
  return new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: labels.map((l, i) => ({
        label: l,
        data: [],
        borderColor: colors[i],
        tension: 0.4,
        fill: false
      }))
    },
    options: {
      responsive: true,
      animation: false,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

function updateChart(chart, label, values) {
  chart.data.labels.push(label);
  chart.data.datasets.forEach((ds, i) => {
    ds.data.push(values[i]);
    if (ds.data.length > 10) ds.data.shift();
  });
  if (chart.data.labels.length > 10) chart.data.labels.shift();
  chart.update();
}

window.onload = () => {
  cpuChart = createChart(document.getElementById("cpuChart"), "CPU Load", ["System", "Lavalink"], ["red", "orange"]);
  memoryChart = createChart(document.getElementById("memoryChart"), "Memory", ["Free", "Used"], ["green", "red"]);

  AOS.init({ once: true, duration: 800 });

  fetchAndUpdateStats();
  setInterval(fetchAndUpdateStats, 60000);
};
