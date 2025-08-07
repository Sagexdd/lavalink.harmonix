import Chart from "https://cdn.jsdelivr.net/npm/chart.js";

let playersChart, memoryChart, cpuChart;

async function fetchStats() {
  try {
    const res = await fetch('/api/stats.js');
    const data = await res.json();

    const { players, playingPlayers, uptime, memory, cpu } = data;

    document.getElementById('players').querySelector('span').textContent = players;
    document.getElementById('playingPlayers').querySelector('span').textContent = playingPlayers;
    document.getElementById('uptime').querySelector('span').textContent = formatUptime(uptime);
    document.getElementById('memory').querySelector('span').textContent = `${(memory.used / 1024 / 1024).toFixed(2)} MB / ${(memory.allocated / 1024 / 1024).toFixed(2)} MB`;
    document.getElementById('cpu').querySelector('span').textContent = `Load: ${(cpu.systemLoad * 100).toFixed(2)}%`;

    updateCharts(players, memory.used, cpu.systemLoad);
  } catch (e) {
    console.error("Failed to load stats:", e);
  }
}

function formatUptime(ms) {
  const sec = Math.floor(ms / 1000) % 60;
  const min = Math.floor(ms / (1000 * 60)) % 60;
  const hr = Math.floor(ms / (1000 * 60 * 60)) % 24;
  const day = Math.floor(ms / (1000 * 60 * 60 * 24));
  return `${day}d ${hr}h ${min}m ${sec}s`;
}

function updateCharts(players, memUsed, cpuLoad) {
  const now = new Date().toLocaleTimeString();
  if (playersChart.data.labels.length > 20) {
    playersChart.data.labels.shift();
    playersChart.data.datasets[0].data.shift();
    memoryChart.data.datasets[0].data.shift();
    cpuChart.data.datasets[0].data.shift();
  }
  playersChart.data.labels.push(now);
  memoryChart.data.labels.push(now);
  cpuChart.data.labels.push(now);

  playersChart.data.datasets[0].data.push(players);
  memoryChart.data.datasets[0].data.push(memUsed / 1024 / 1024);
  cpuChart.data.datasets[0].data.push(cpuLoad * 100);

  playersChart.update();
  memoryChart.update();
  cpuChart.update();
}

function initCharts() {
  const ctx1 = document.getElementById("playersChart").getContext("2d");
  playersChart = new Chart(ctx1, {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "Players",
        data: [],
        borderColor: "red",
        borderWidth: 2,
        fill: false
      }]
    }
  });

  const ctx2 = document.getElementById("memoryChart").getContext("2d");
  memoryChart = new Chart(ctx2, {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "Memory (MB)",
        data: [],
        borderColor: "orange",
        borderWidth: 2,
        fill: false
      }]
    }
  });

  const ctx3 = document.getElementById("cpuChart").getContext("2d");
  cpuChart = new Chart(ctx3, {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "CPU Load (%)",
        data: [],
        borderColor: "yellow",
        borderWidth: 2,
        fill: false
      }]
    }
  });
}

initCharts();
fetchStats();
setInterval(fetchStats, 60000);
