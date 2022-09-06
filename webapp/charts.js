var zoomDays = 180;
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
  zoomDays = 30;
}

var localeNum = Intl.NumberFormat(navigator.language, {
  notation: 'compact',
  maximumFractionDigits: 2
});

async function buildEstimatesChart(labels) {
  let estimatesData = await fetch("https://5o7q0683ig.execute-api.us-west-2.amazonaws.com/prod/computershared/dashboard/chart?data=estimates", {
    mode: 'cors'
  }).then(function (response) {
    return response.json();
  });

  var ctx = document.getElementById("estimatesChart");
  var chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels.map(function (l) {
        return new Date(l).toLocaleDateString();
      }),
      datasets: [
        {
          label: "Released DRS",
          lineTension: 0.4,
          backgroundColor: 'transparent',
          borderColor: '#FFF',
          borderWidth: 4,
          pointBackgroundColor: '#FFF',
          data: [
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            5200000 * 4,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            8900000 * 4,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            12700000 * 4
          ]
        },
        {
          data: estimatesData.averages,
          label: "Average",
          lineTension: 0.4,
          backgroundColor: 'transparent',
          borderColor: '#E024A5',
          borderWidth: 2,
          pointBackgroundColor: '#93186c'
        },
        {
          data: estimatesData.medians,
          label: "Median",
          lineTension: 0.4,
          backgroundColor: 'transparent',
          borderColor: '#F0DC46',
          borderWidth: 2,
          pointBackgroundColor: '#F0DC46'
        },
        {
          data: estimatesData.trimmed_means,
          label: "Trimmed Average",
          lineTension: 0.4,
          backgroundColor: 'transparent',
          borderColor: '#11979C',
          borderWidth: 2,
          pointBackgroundColor: '#11979C'
        },
        {
          hidden: true,
          data: estimatesData.modes,
          label: "Mode",
          lineTension: 0.4,
          backgroundColor: 'transparent',
          borderColor: '#094D4F',
          borderWidth: 2,
          pointBackgroundColor: '#094D4F'
        },
      ]
    },
    options: {
      title: {
        display: true,
        text: 'Total DRS Estimates'
      },
      scales: {
        x: {
          stacked: true,
        },
        y: {
          type: "linear",
          ticks: {
            callback: (val) => (localeNum.format(val))
          }
        },
      },
      legend: {
        display: true
      },
      plugins: {
        tooltip: {
          callbacks: {
            title: function (tooltipItem) {
              return new Date(tooltipItem[0].label).toLocaleDateString();
            },
            label: function (tooltipItem) {
              var label = tooltipItem.dataset.label;
              return label + ": " + tooltipItem.formattedValue;
            }
          }
        }
      },
      tooltips: {
        callbacks: {
          title: function (tooltipItem, data) {
            return new Date(tooltipItem[0].label).toLocaleDateString();
          },
          label: function (tooltipItem, data) {
            var value = parseInt(tooltipItem.value);
            var label = data.datasets[tooltipItem.datasetIndex].label;
            return label + ": " + value.toLocaleString();
          }
        }
      },
      plugins: {
        zoom: {
          pan: {
            mode: "x",
            enabled: true
          },
          zoom: {
            mode: "x",
            wheel: {
              enabled: true,
            },
            pinch: {
              enabled: true,
            },
          }
        }
      }
    }
  });
  chart.zoomScale('x', { min: labels.length - zoomDays, max: labels.length }, "easeOutSine");
  chart.update();
  return chart;
};

async function buildSharesChart(labels) {
  let data = await fetch("https://5o7q0683ig.execute-api.us-west-2.amazonaws.com/prod/computershared/dashboard/chart?data=shares", {
    mode: 'cors'
  }).then(function (response) {
    return response.json();
  });

  var ctx = document.getElementById("sharesChart");
  var chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels.map(function (l) {
        return new Date(l).toLocaleDateString();
      }),
      datasets: [
        {
          yAxisID: "yline",
          label: "Total",
          data: data.cumulative,
          backgroundColor: '#11979C',
          borderColor: '#11979C',
          backgroundColor: 'transparent',
          type: "line"
        },
        {
          yAxisID: "ybar",
          label: "New Accounts",
          data: data.daily.from_new,
          backgroundColor: '#93186c'
        },
        {
          yAxisID: "ybar",
          label: "Existing Accounts",
          data: data.daily.from_growth,
          backgroundColor: '#F0DC46',
          borderColor: '#F0DC46'
        },
      ]
    },
    options: {
      title: {
        display: true,
        text: 'Shares Counted from'
      },
      responsive: true,
      scales: {
        x: {
          stacked: true
        },
        ybar: {
          position: "right",
          stacked: true,
          min: 0,
          ticks: {
            callback: (val) => (localeNum.format(val))
          }
        },
        yline: {
          position: "left",
          stacked: true,
          ticks: {
            callback: (val) => (localeNum.format(val)),
            color: "#11979C"
          },
        },
      },
      tooltips: {
        callbacks: {
          title: function (tooltipItem, data) {
            return new Date(tooltipItem[0].label).toLocaleDateString();
          },
          label: function (tooltipItem, data) {
            var value = parseInt(tooltipItem.value);
            var label = data.datasets[tooltipItem.datasetIndex].label;
            return label + ": " + value.toLocaleString();
          }
        }
      },
      plugins: {
        zoom: {
          pan: {
            mode: "x",
            enabled: true
          },
          zoom: {
            mode: "x",
            wheel: {
              enabled: true,
            },
            pinch: {
              enabled: true,
            },
          }
        }
      }
    }
  });
  chart.zoomScale('x', { min: labels.length - zoomDays, max: labels.length }, "easeOutSine");
  chart.update();
  return chart;
};

async function buildStatsChart(labels) {
  let data = await fetch("https://5o7q0683ig.execute-api.us-west-2.amazonaws.com/prod/computershared/dashboard/chart?data=stats", {
    mode: 'cors'
  }).then(function (response) {
    return response.json();
  });

  var ctx = document.getElementById("statsChart");
  var chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels.map(function (l) {
        return new Date(l).toLocaleDateString();
      }),
      datasets: [
        {
          data: data.trimmed_means,
          label: "Trimmed Average",
          lineTension: 0.4,
          backgroundColor: 'transparent',
          borderColor: '#11979C',
          borderWidth: 2,
          pointBackgroundColor: '#11979C'
        },
        {
          label: "Average",
          data: data.averages,
          lineTension: 0.4,
          backgroundColor: 'transparent',
          borderColor: '#E024A5',
          borderWidth: 4,
          pointBackgroundColor: '#93186c',
        },
        {
          data: data.medians,
          label: "Median",
          lineTension: 0.4,
          backgroundColor: 'transparent',
          borderColor: '#F0DC46',
          borderWidth: 2,
          pointBackgroundColor: '#F0DC46'
        },
        {
          hidden: true,
          data: data.modes,
          label: "Mode",
          lineTension: 0.4,
          backgroundColor: 'transparent',
          borderColor: '#094D4F',
          borderWidth: 2,
          pointBackgroundColor: '#094D4F'
        },
        {
          hidden: true,
          data: data.std_devs,
          label: "Avg Std Dev",
          lineTension: 0.4,
          backgroundColor: 'transparent',
          borderColor: '#094700',
          borderWidth: 2,
          pointBackgroundColor: '#094700'
        },
        {
          hidden: true,
          data: data.trm_std_devs,
          label: "Trimmed Avg Std Dev",
          lineTension: 0.4,
          backgroundColor: 'transparent',
          borderColor: '#289418',
          borderWidth: 2,
          pointBackgroundColor: '#289418'
        },
      ]
    },
    options: {
      title: {
        display: true,
        text: 'Sample Statistics'
      },
      scales: {
        x: {
          stacked: true,
        },
        y: {
          type: "linear",
          ticks: {
            callback: (val) => (val.toLocaleString())
          }
        },
      },
      legend: {
        display: true
      },
      plugins: {
        tooltip: {
          callbacks: {
            title: function (tooltipItem) {
              return new Date(tooltipItem[0].label).toLocaleDateString();
            },
            label: function (tooltipItem) {
              var label = tooltipItem.dataset.label;
              return label + ": " + tooltipItem.formattedValue;
            }
          }
        }
      },
      tooltips: {
        callbacks: {
          title: function (tooltipItem, data) {
            return new Date(tooltipItem[0].label).toLocaleDateString();
          },
          label: function (tooltipItem, data) {
            var value = parseInt(tooltipItem.value);
            var label = data.datasets[tooltipItem.datasetIndex].label;
            return label + ": " + value.toLocaleString();
          }
        }
      },
      plugins: {
        zoom: {
          pan: {
            mode: "x",
            enabled: true
          },
          zoom: {
            mode: "x",
            wheel: {
              enabled: true,
            },
            pinch: {
              enabled: true,
            },
          }
        }
      }
    }
  });
  chart.zoomScale('x', { min: labels.length - zoomDays, max: labels.length }, "easeOutSine");
  chart.update();
  return chart;
};

async function buildGrowthChart() {
  let data = await fetch("https://5o7q0683ig.execute-api.us-west-2.amazonaws.com/prod/computershared/dashboard/chart?data=growth", {
    mode: 'cors'
  }).then(function (response) {
    return response.json();
  });

  var ctx = document.getElementById("growthChart");
  var chart = new Chart(ctx, {
    type: 'line',
    data: {
      // labels: chartData.growth.labels.map(function (l) {
      //   return new Date(l).toLocaleDateString();
      // }),
      datasets: [
        {
          data: data.weekly_total_account_growth_pct,
          label: "Percentage Accounts Grew",
          lineTension: 0.4,
          backgroundColor: 'transparent',
          borderColor: '#E024A5',
          borderWidth: 2,
          pointBackgroundColor: '#93186C'
        },
      ]
    },
    options: {
      title: {
        display: true,
        text: 'Account Growth'
      },
      scales: {
        x: {
          ticks: {
            callback: (index) => new Date(Object.keys(data.weekly_total_account_growth_pct)[index]).toLocaleDateString()
          }
        },
        y: {
          type: "linear",
          max: 0.05,
          min: 0,
          ticks: {
            callback: (val) => Math.round(val * 1000) / 10 + "%"
          }
        },
      },
      legend: {
        display: true
      },
      plugins: {
        tooltip: {
          callbacks: {
            title: function (tooltipItem) {
              return "Week of " + new Date(tooltipItem[0].label).toLocaleDateString();
            },
            label: function (tooltipItem) {
              var label = tooltipItem.dataset.label;
              var val = Object.values(tooltipItem.dataset.data)[tooltipItem.dataIndex];
              return label + ": " + (parseFloat(val) * 100).toFixed(2) + "%";
            }
          }
        }
      }
    }
  });
  return chart;
};

async function buildPurchasePowerChart() {
  let data = await fetch("https://5o7q0683ig.execute-api.us-west-2.amazonaws.com/prod/computershared/dashboard/chart?data=power", {
    mode: 'cors'
  }).then(function (response) {
    return response.json();
  });

  var ctx = document.getElementById("powerChart");
  var chart = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [
        {
          data: data,
          label: "Purchasing Power (USD)",
          lineTension: 0.4,
          backgroundColor: 'transparent',
          borderColor: '#E024A5',
          borderWidth: 2,
          pointBackgroundColor: '#93186C'
        },
      ]
    },
    options: {
      title: {
        display: true,
        text: 'Account Growth'
      },
      scales: {
        x: {
          ticks: {
            callback: (index) => new Date(Object.keys(data)[index]).toLocaleDateString()
          }
        },
        y: {
          type: "linear",
          min: 0,
          ticks: {
            callback: (val) => "$" + Math.round(val)
          }
        },
      },
      legend: {
        display: true
      },
      plugins: {
        tooltip: {
          callbacks: {
            title: function (tooltipItem) {
              return "Week ending " + new Date(tooltipItem[0].label).toLocaleDateString();
            },
            label: function (tooltipItem) {
              var label = tooltipItem.dataset.label;
              var val = Object.values(tooltipItem.dataset.data)[tooltipItem.dataIndex];
              return label + ": $" + Math.round(val);
            }
          }
        }
      }
    }
  });
  return chart;
};

async function buildDistributionChart() {
  let data = await fetch("https://5o7q0683ig.execute-api.us-west-2.amazonaws.com/prod/computershared/dashboard/chart?data=distribution", {
    mode: 'cors'
  }).then(function (response) {
    return response.json();
  });

  var ctx = document.getElementById("distributionChart");
  var chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [{
        data: data.values,
        label: "Sampled Accounts",
        lineTension: 0.4,
        color: '#93186c',
        borderColor: '#E024A5',
        borderWidth: 4,
        pointBackgroundColor: '#93186c'
      }]
    },
    options: {
      title: {
        display: true,
        text: 'Distribution'
      },
      scales: {
        y: {
          scaleLabel: {
            display: true,
            labelString: "Number of Accounts"
          },
          ticks: {
            beginAtZero: false
          }
        },
        x: {
          scaleLabel: {
            display: true,
            labelString: "Shares >="
          }
        }
      },
      legend: {
        display: true
      },
      tooltips: {
        callbacks: {
          title: function (tooltipItem, data) {
            return "Shares >= " + tooltipItem[0].label;
          },
          label: function (tooltipItem, data) {
            var value = parseInt(tooltipItem.value);
            var label = data.datasets[tooltipItem.datasetIndex].label;
            return label + ": " + value.toLocaleString();
          }
        }
      }
    }
  });
  return chart;
};

async function buildHighscoreChart() {
  const hsData = await fetch("https://5o7q0683ig.execute-api.us-west-2.amazonaws.com/prod/computershared/dashboard/highscores", {
    mode: 'cors'
  }).then(function (response) {
    return response.json();
  });

  var hsScatterCtx = document.getElementById('highScoreChart');
  var hsScatterChart = new Chart(hsScatterCtx, {
    type: 'line',
    data: {
      labels: hsData.high_labels.map(function (l) {
        return new Date(l).toLocaleDateString();
      }),
      datasets:
        [
          {
            xAxisID: "scatter",
            label: "Scatter",
            data: hsData.scatter,
            pointBackgroundColor: '#E024A5',
            color: '#93186c',
            type: 'scatter'
          },
          {
            xAxisID: "line",
            label: "Highs",
            data: hsData.high,
            pointBackgroundColor: '#F0DC46',
            lineTension: 0.4,
            borderColor: '#F0DC46',
            borderWidth: 2,
            backgroundColor: 'transparent'
          }
        ]
    },
    options: {
      title: {
        display: true,
        text: 'CS Acct Numbers'
      },
      scales: {
        y: {
          ticks: {
            beginAtZero: true,
            callback: (val) => (localeNum.format(val))
          }
        },
        line: {
          position: 'bottom',
          suggestedMin: Math.min(...hsData.high_labels),
          suggestedMax: Math.max(...hsData.high_labels)
        },
        scatter: {
          id: "scatter",
          display: false,
          type: 'linear',
          position: 'bottom',
          min: Math.min(...hsData.high_labels),
          max: Math.max(...hsData.high_labels)
        }
      }
    },
    tooltips: {
      callbacks: {
        title: function (tooltipItem, data) {
          return new Date(parseFloat(tooltipItem[0].label)).toLocaleDateString();
        },
        label: function (tooltipItem, data) {
          var value = parseInt(tooltipItem.value);
          var label = data.datasets[tooltipItem.datasetIndex].label;
          return label + ": " + value.toLocaleString();
        }
      }
    }
  });
  return hsScatterChart;
};

async function loadCharts() {
  'use strict'

  Chart.defaults.color = '#EEE';
  Chart.defaults.borderColor = '#444';

  let datasource = document.getElementById("botSelector").value;
  if (datasource === "drsbot") {
    document.getElementById("chartsRow").remove();
    return;
  }

  let labels = await fetch("https://5o7q0683ig.execute-api.us-west-2.amazonaws.com/prod/computershared/dashboard/chart?data=labels", {
    mode: 'cors'
  }).then(function (response) {
    return response.json();
  });

  var estimatesChart = await buildEstimatesChart(labels);
  var sharesChart = await buildSharesChart(labels);
  var statsChart = await buildStatsChart(labels);
  await buildGrowthChart();
  var histogramChart = await buildDistributionChart();
  var hsScatterChart = await buildHighscoreChart();
  var purPowChart = await buildPurchasePowerChart();


  document.getElementById("avgChartLogToggle").classList.remove("checked");
  document.getElementById("avgChartLogToggle").onclick = function (event) {
    estimatesChart.options.scales["y"].type = event.target.checked ? "logarithmic" : "linear";
    estimatesChart.update();
    statsChart.options.scales["y"].type = event.target.checked ? "logarithmic" : "linear";
    statsChart.update();
    sharesChart.options.scales["yline"].type = event.target.checked ? "logarithmic" : "linear";
    sharesChart.update();
    histogramChart.options.scales["y"].type = event.target.checked ? "logarithmic" : "linear";
    histogramChart.update();
    hsScatterChart.options.scales["y"].type = event.target.checked ? "logarithmic" : "linear";
    hsScatterChart.update();
    purPowChart.options.scales["y"].type = event.target.checked ? "logarithmic" : "linear";
    purPowChart.update();
  };
};

setTimeout(async () => { await loadCharts(); }, 2000);
