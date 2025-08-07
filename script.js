import Chart from "https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js";

const statusEl = document.getElementById("status");
const uptimeEl = document.getElementById("uptime");
const playersEl = document.getElementById("players");
const playingPlayersEl = document.getElementById("playingPlayers");
const cpuLoadEl = document.getElementById("cpuLoad");
const memoryUsedEl = document.getElementById("memoryUsed");

let memoryChart, cpuChart;

async function fetchStats() {
  try {
    const res = await fetch("/api/stats.js");
    const data = await res.json();

    statusEl.textContent = "Online ✅";
    playersEl.textContent = data.players;
    playingPlayersEl.textContent = data.playingPlayers;
    uptimeEl.textContent = formatUptime(data.uptime);
    cpuLoadEl.textContent = (data.cpu.systemLoad * 100).toFixed(2) + "%";
    memoryUsedEl.textContent = (data.memory.used / 1024 / 1024).toFixed(1) + " MB";

    updateCharts(data);
  } catch {
    statusEl.textContent = "Offline ❌";
  }
}

function formatUptime(ms) {
  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / (1000 * 60)) % 60;
  const hours = Math.floor(ms / (1000 * 60 * 60)) % 24;
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

function initCharts() {
  const memoryCtx = document.getElementById("memoryChart").getContext("2d");
  const cpuCtx = document.getElementById("cpuChart").getContext("2d");

  memoryChart = new Chart(memoryCtx, {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "Memory Used (MB)",
        data: [],
        borderColor: "red",
        borderWidth: 2,
        fill: false
      }]
    },
    options: { responsive: true }
  });

  cpuChart = new Chart(cpuCtx, {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "CPU Load (%)",
        data: [],
        borderColor: "orange",
        borderWidth: 2,
        fill: false
      }]
    },
    options: { responsive: true }
  });
}

function updateCharts(data) {
  const time = new Date().toLocaleTimeString();

  if (memoryChart && cpuChart) {
    memoryChart.data.labels.push(time);
    memoryChart.data.datasets[0].data.push((data.memory.used / 1024 / 1024).toFixed(2));
    if (memoryChart.data.labels.length > 10) {
      memoryChart.data.labels.shift();
      memoryChart.data.datasets[0].data.shift();
    }
    memoryChart.update();

    cpuChart.data.labels.push(time);
    cpuChart.data.datasets[0].data.push((data.cpu.systemLoad * 100).toFixed(2));
    if (cpuChart.data.labels.length > 10) {
      cpuChart.data.labels.shift();
      cpuChart.data.datasets[0].data.shift();
    }
    cpuChart.update();
  }
}

initCharts();
fetchStats();
setInterval(fetchStats, 60000);
