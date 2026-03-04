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
  if (type === "doughnut") return doughnutMemberVsCasual(year);
  if (type === "radar") return radarComparePub(year);
  return barByTitle(year, metric);
}

// Task A: BAR — compare platforms for a given month
function barByTitle(year, metric) {
  let rows = chartData.filter(r => r.year === +year);
  if (year === "all") rows = chartData;

  const totals = {};
  rows.forEach(r => { totals[r.platform] = (totals[r.platform] || 0) + r[metric]; });
  const labels = Object.keys(totals);
  const values = Object.values(totals);

  return {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: `${metric} (${year})`,
        data: values
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: { display: true, text: `Sales by platform (${year})` }
      },
      scales: {
        y: { title: { display: true, text: metric } },
        x: { title: { display: true, text: "Platform" } }
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
        y: { title: { display: true, text: "Revenue / Units" } },
        x: { title: { display: true, text: "Year" } }
      }
    }
  };
}

// SCATTER — relationship between review scores and revenue
function scatterreviewScoreVsrevenueUSD(title) {
  const rows = chartData.filter(r => r.title === title);

  const points = rows.map(r => ({ x: r.reviewScore, y: r.revenueUSD }));

  return {
    type: "scatter",
    data: {
      datasets: [{
        label: `reviewScore vs revenueUSD`,
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

// DOUGHNUT — units vs region share
function doughnutMemberVsCasual(year) {
  const rows = chartData.filter(r => r.year === +year);
  const regionTotals = {};
  rows.forEach(r => { regionTotals[r.region] = (regionTotals[r.region] || 0) + r.unitsM; });
  const labels = Object.keys(regionTotals);
  const values = Object.values(regionTotals);

  return {
    type: "doughnut",
    data: {
      labels,
      datasets: [{ label: "Units sold (M)", data: values }]
    },
    options: {
      plugins: {
        title: { display: true, text: `Region share by units sold (${year})` }
      }
    }
  };
}

// RADAR — compare titles across multiple metrics for one month
function radarComparePub(year) {
  const rows = chartData.filter(r => r.year === +year);

  const metrics = ["unitsM", "revenueUSD", "priceUSD", "reviewScore"];
  const labels = metrics;

  const datasets = rows.map(r => ({
    label: r.title,
    data: metrics.map(m => r[m])
  }));

  return {
    type: "radar",
    data: { labels, datasets },
    options: {
      plugins: {
        title: { display: true, text: `Multi-metric comparison (${year})` }
      }
    }
  };
}