import { getLavalinkStats } from './api/stats.js';

// DOM elements
const cards = {
  players: document.getElementById("players"),
  playingPlayers: document.getElementById("playingPlayers"),
  uptime: document.getElementById("uptime"),
  systemLoad: document.getElementById("systemLoad"),
  lavalinkLoad: document.getElementById("lavalinkLoad"),
  memoryFree: document.getElementById("memoryFree"),
  memoryUsed: document.getElementById("memoryUsed")
};

let cpuChart, memoryChart;

function formatUptime(ms) {
  let seconds = Math.floor(ms / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  let days = Math.floor(hours / 24);

  seconds %= 60;
  minutes %= 60;
  hours %= 24;

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

async function fetchAndUpdateStats() {
  const data = await getLavalinkStats();
  if (!data) {
    Object.values(cards).forEach(el => el.textContent = "Error");
    return;
  }

  cards.players.textContent = data.players ?? 0;
  cards.playingPlayers.textContent = data.playingPlayers ?? 0;
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
