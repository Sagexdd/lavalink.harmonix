AOS.init();

const cpuChartCtx = document.getElementById("cpuChart").getContext("2d");
const memoryChartCtx = document.getElementById("memoryChart").getContext("2d");

let cpuChart, memoryChart;

document.getElementById("darkToggle").onclick = () => {
  document.body.classList.toggle("light");
};

function formatDuration(ms) {
  const sec = Math.floor(ms / 1000);
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${d}d ${h}h ${m}m ${s}s`;
}

async function fetchStats() {
  const res = await fetch("/api/stats");
  if (!res.ok) throw new Error("Failed to load stats");
  return res.json();
}

function updateCharts(cpu, mem) {
  const cpuLoad = [cpu.systemLoad, cpu.lavalinkLoad];
  const memUsage = [mem.used / 1024 / 1024, mem.free / 1024 / 1024];

  if (!cpuChart) {
    cpuChart = new Chart(cpuChartCtx, {
      type: "doughnut",
      data: {
        labels: ["System Load", "Lavalink Load"],
        datasets: [{ data: cpuLoad }],
      },
    });
  } else {
    cpuChart.data.datasets[0].data = cpuLoad;
    cpuChart.update();
  }

  if (!memoryChart) {
    memoryChart = new Chart(memoryChartCtx, {
      type: "bar",
      data: {
        labels: ["Used MB", "Free MB"],
        datasets: [
          {
            label: "Memory",
            data: memUsage,
            backgroundColor: ["red", "gray"],
          },
        ],
      },
    });
  } else {
    memoryChart.data.datasets[0].data = memUsage;
    memoryChart.update();
  }
}

async function updateStats() {
  try {
    const data = await fetchStats();

    document.getElementById("players").textContent = data.players;
    document.getElementById("playingPlayers").textContent = data.playingPlayers;
    document.getElementById("uptime").textContent = formatDuration(data.uptime);

    updateCharts(data.cpu, data.memory);
  } catch (err) {
    document.getElementById("players").textContent = "Error";
    document.getElementById("playingPlayers").textContent = "Error";
    document.getElementById("uptime").textContent = "Error";
    console.error(err);
  }
}

updateStats();
setInterval(updateStats, 60000);
