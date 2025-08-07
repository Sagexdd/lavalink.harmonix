const STATS_URL = "http://pnode1.danbot.host:1186/v4/stats";
const AUTH = "Yuvraj.apk#001";

const statsDiv = document.getElementById("stats");
const cpuCtx = document.getElementById("cpuChart").getContext("2d");
const memCtx = document.getElementById("memChart").getContext("2d");

let cpuChart, memChart;

async function fetchStats() {
  try {
    const res = await fetch(STATS_URL, {
      headers: { Authorization: AUTH },
    });
    const data = await res.json();

    updateStatsUI(data);
    updateCharts(data);

  } catch (err) {
    statsDiv.innerHTML = "<p>Failed to load stats.</p>";
  }
}

function updateStatsUI(data) {
  statsDiv.innerHTML = `
    <div><strong>Players:</strong> ${data.players}</div>
    <div><strong>Playing:</strong> ${data.playingPlayers}</div>
    <div><strong>Uptime:</strong> ${(data.uptime / 3600000).toFixed(1)} hrs</div>
    <div><strong>CPU Load:</strong> ${(data.cpu.lavalinkLoad * 100).toFixed(2)}%</div>
    <div><strong>System Load:</strong> ${(data.cpu.systemLoad * 100).toFixed(2)}%</div>
    <div><strong>Memory Used:</strong> ${(data.memory.used / 1024 / 1024).toFixed(1)} MB</div>
  `;
}

function updateCharts(data) {
  const cpuLoad = (data.cpu.lavalinkLoad * 100).toFixed(2);
  const memUsed = (data.memory.used / 1024 / 1024).toFixed(1);

  if (!cpuChart) {
    cpuChart = new Chart(cpuCtx, {
      type: "line",
      data: {
        labels: ["Now"],
        datasets: [{
          label: "CPU Load (%)",
          data: [cpuLoad],
          borderWidth: 2,
        }],
      },
    });
  } else {
    cpuChart.data.labels.push(new Date().toLocaleTimeString());
    cpuChart.data.datasets[0].data.push(cpuLoad);
    if (cpuChart.data.labels.length > 10) {
      cpuChart.data.labels.shift();
      cpuChart.data.datasets[0].data.shift();
    }
    cpuChart.update();
  }

  if (!memChart) {
    memChart = new Chart(memCtx, {
      type: "line",
      data: {
        labels: ["Now"],
        datasets: [{
          label: "Memory Used (MB)",
          data: [memUsed],
          borderWidth: 2,
        }],
      },
    });
  } else {
    memChart.data.labels.push(new Date().toLocaleTimeString());
    memChart.data.datasets[0].data.push(memUsed);
    if (memChart.data.labels.length > 10) {
      memChart.data.labels.shift();
      memChart.data.datasets[0].data.shift();
    }
    memChart.update();
  }
}

// Theme toggle
document.getElementById("themeToggle").onclick = () => {
  const body = document.body;
  body.dataset.theme = body.dataset.theme === "light" ? "dark" : "light";
};

fetchStats();
setInterval(fetchStats, 60000); // Refresh every 60s
