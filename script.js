const apiURL = '/api/stats'; // Vercel API route

let memoryChart, cpuChart, playerChart;

async function fetchStats() {
  try {
    const res = await fetch(apiURL);
    const data = await res.json();

    if (!data || !data.memory) throw new Error('Invalid response');

    // Update stat boxes
    document.getElementById("players").textContent = data.players;
    document.getElementById("playing").textContent = data.playingPlayers;
    document.getElementById("uptime").textContent = formatUptime(data.uptime);
    document.getElementById("memUsed").textContent = formatMB(data.memory.used);
    document.getElementById("memFree").textContent = formatMB(data.memory.free);
    document.getElementById("memAlloc").textContent = formatMB(data.memory.allocated);
    document.getElementById("cores").textContent = data.cpu.cores;
    document.getElementById("sysLoad").textContent = (data.cpu.systemLoad * 100).toFixed(2) + "%";
    document.getElementById("lavaLoad").textContent = (data.cpu.lavalinkLoad * 100).toFixed(2) + "%";

    // Push to charts
    updateCharts(data);

  } catch (e) {
    console.error("Failed to load stats", e);
  }
}

function formatMB(bytes) {
  return (bytes / 1024 / 1024).toFixed(1) + " MB";
}

function formatUptime(ms) {
  const sec = Math.floor(ms / 1000);
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
}

// Init charts
function initCharts() {
  const memCtx = document.getElementById("memoryChart").getContext("2d");
  const cpuCtx = document.getElementById("cpuChart").getContext("2d");
  const playerCtx = document.getElementById("playerChart").getContext("2d");

  memoryChart = new Chart(memCtx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Used",
          data: [],
          borderColor: "#ff4d4d",
          fill: false,
        },
        {
          label: "Free",
          data: [],
          borderColor: "#66ff66",
          fill: false,
        },
      ],
    },
    options: { animation: false, responsive: true },
  });

  cpuChart = new Chart(cpuCtx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "System Load",
          data: [],
          borderColor: "#ffcc00",
          fill: false,
        },
        {
          label: "Lavalink Load",
          data: [],
          borderColor: "#33ccff",
          fill: false,
        },
      ],
    },
    options: { animation: false, responsive: true },
  });

  playerChart = new Chart(playerCtx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Players",
          data: [],
          borderColor: "#ff4dff",
          fill: false,
        },
        {
          label: "Playing",
          data: [],
          borderColor: "#66ccff",
          fill: false,
        },
      ],
    },
    options: { animation: false, responsive: true },
  });
}

function updateCharts(data) {
  const now = new Date().toLocaleTimeString();

  // Memory
  memoryChart.data.labels.push(now);
  memoryChart.data.datasets[0].data.push((data.memory.used / 1024 / 1024).toFixed(1));
  memoryChart.data.datasets[1].data.push((data.memory.free / 1024 / 1024).toFixed(1));
  trimData(memoryChart);

  // CPU
  cpuChart.data.labels.push(now);
  cpuChart.data.datasets[0].data.push((data.cpu.systemLoad * 100).toFixed(2));
  cpuChart.data.datasets[1].data.push((data.cpu.lavalinkLoad * 100).toFixed(2));
  trimData(cpuChart);

  // Players
  playerChart.data.labels.push(now);
  playerChart.data.datasets[0].data.push(data.players);
  playerChart.data.datasets[1].data.push(data.playingPlayers);
  trimData(playerChart);

  memoryChart.update();
  cpuChart.update();
  playerChart.update();
}

function trimData(chart, max = 20) {
  chart.data.labels = chart.data.labels.slice(-max);
  chart.data.datasets.forEach(ds => {
    ds.data = ds.data.slice(-max);
  });
}

// Auto refresh
setInterval(fetchStats, 60000);

// Init
document.addEventListener("DOMContentLoaded", () => {
  initCharts();
  fetchStats();
  AOS.init(); // animate on scroll lib
});
