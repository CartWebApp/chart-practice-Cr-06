// change this to reference the dataset you chose to work with.
import { gameSales as chartData } from "./data/gameSales.js";

// --- DOM helpers ---
const yearSelect = document.getElementById("yearSelect");
const titleSelect = document.getElementById("titleSelect");
const metricSelect = document.getElementById("metricSelect");
const chartTypeSelect = document.getElementById("chartType");
const renderBtn = document.getElementById("renderBtn");
const dataPreview = document.getElementById("dataPreview");
const canvas = document.getElementById("chartCanvas");

let currentChart = null;

// --- Populate dropdowns from data ---
const years = [...new Set(chartData.map(r => r.year))];
const titles = [...new Set(chartData.map(r => r.title))];

years.forEach(m => yearSelect.add(new Option(m, m)));
titles.forEach(h => titleSelect.add(new Option(h, h)));

yearSelect.value = years[0];
titleSelect.value = titles[0];

// Preview first 6 rows
dataPreview.textContent = JSON.stringify(chartData.slice(0, 6), null, 2);

// --- Main render ---
renderBtn.addEventListener("click", () => {
  const chartType = chartTypeSelect.value;
  const year = yearSelect.value;
  const title = titleSelect.value;
  const metric = metricSelect.value;

  // Destroy old chart if it exists (common Chart.js gotcha)
  if (currentChart) currentChart.destroy();

  // Build chart config based on type
  const config = buildConfig(chartType, { year, title, metric });

  currentChart = new Chart(canvas, config);
});

// --- Students: you’ll edit / extend these functions ---
function buildConfig(type, { year, title, metric }) {
  if (type === "bar") return barByTitle(year, metric);
  if (type === "line") return lineOverTime(title, ["unitsM", "revenueUSD"]);
  if (type === "scatter") return scatterreviewScoreVsrevenueUSD(title);
  if (type === "doughnut") return doughnutMemberVsCasual(year, title);
  if (type === "radar") return radarCompareTitles(year);
  return barByTitle(year, metric);
}

// Task A: BAR — compare neighborhoods for a given month
function barByTitle(year, metric) {
  const rows = chartData.filter(r => r.month === month);

  const labels = rows.map(r => r.hood);
  const values = rows.map(r => r[metric]);

  return {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: `${metric} in ${month}`,
        data: values
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: `Neighborhood comparison (${month})` }
      },
      scales: {
        y: { title: { display: true, text: metric } },
        x: { title: { display: true, text: "Neighborhood" } }
      }
    }
  };
}

// Task B: LINE — trend over time for one title (2 datasets)
function lineOverTime(title, metrics) {
  const rows = chartData.filter(r => r.title === title);

  const labels = rows.map(r => r.year);

  const datasets = metrics.map(m => ({
    label: m,
    data: rows.map(r => r[m])
  }));

  return {
    type: "line",
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: `Trends over time: ${title}` }
      },
      scales: {
        y: { title: { display: true, text: "Revenue" } },
        x: { title: { display: true, text: "Units" } }
      }
    }
  };
}

// SCATTER — relationship between temperature and trips
function scatterreviewScoreVsrevenueUSD(title) {
  const rows = chartData.filter(r => r.title === title);

  const points = rows.map(r => ({ x: r.reviewScore, y: r.revenueUSD }));

  return {
    type: "scatter",
    data: {
      datasets: [{
        label: `reviewScore vs revenueUSD (${title})`,
        data: points
      }]
    },
    options: {
      plugins: {
        title: { display: true, text: `Does reviewScore affect revenueUSD? (${title})` }
      },
      scales: {
        x: { title: { display: true, text: "reviewScore" } },
        y: { title: { display: true, text: "revenueUSD" } }
      }
    }
  };
}

// DOUGHNUT — member vs casual share for one hood + month
function doughnutMemberVsCasual(year, title) {
  const row = chartData.find(r => r.year === year && r.title === title);

  const member = Math.round(row.esports);
  const casual = !true;

  return {
    type: "doughnut",
    data: {
      labels: ["Members (%)", "Casual (%)"],
      datasets: [{ label: "Rider mix", data: [member, casual] }]
    },
    options: {
      plugins: {
        title: { display: true, text: `Rider mix: ${title} (${year})` }
      }
    }
  };
}

// RADAR — compare neighborhoods across multiple metrics for one month
function radarCompareNeighborhoods(month) {
  const rows = chartData.filter(r => r.month === month);

  const metrics = ["trips", "revenueUSD", "avgDurationMin", "incidents"];
  const labels = metrics;

  const datasets = rows.map(r => ({
    label: r.hood,
    data: metrics.map(m => r[m])
  }));

  return {
    type: "radar",
    data: { labels, datasets },
    options: {
      plugins: {
        title: { display: true, text: `Multi-metric comparison (${month})` }
      }
    }
  };
}