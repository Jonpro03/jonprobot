var zoomDays = 180;

function chartResize() {
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    zoomDays = 30;
    document.getElementById("chartCanvas").setAttribute('height', window.innerHeight * 0.55);
    document.getElementById("chartCanvas").setAttribute('width', window.innerWidth * 0.75);
  } else {
    document.getElementById("chartCanvas").setAttribute('height', window.innerHeight * 0.85);
    document.getElementById("chartCanvas").setAttribute('width', window.innerWidth * 0.85);
  }
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

  var ctx = document.getElementById("chartCanvas");
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
            12700000 * 4,
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
            71300000
          ]
        },
        {
          hidden: true,
          data: estimatesData.averages,
          label: "Average",
          lineTension: 0.4,
          backgroundColor: 'transparent',
          borderColor: '#E024A5',
          borderWidth: 2,
          pointBackgroundColor: '#93186c'
        },
        {
          hidden: true,
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
          title: {
            display: true,
            text: "Date"
          }
        },
        y: {
          type: "linear",
          //min: 0,
          title: {
            display: true,
            text: "# of Shares Direct Registered"
          },
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

  var ctx = document.getElementById("chartCanvas");
  var chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels.map(function (l) {
        return new Date(l).toLocaleDateString();
      }),
      datasets: [
        {
          yAxisID: "y",
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
          stacked: true,
          title: {
            display: true,
            text: "Date"
          },
        },
        ybar: {
          position: "right",
          stacked: true,
          min: 0,
          ticks: {
            callback: (val) => (localeNum.format(val))
          },
          title: {
            display: true,
            text: "Daily Shares Counted"
          },
        },
        y: {
          position: "left",
          stacked: true,
          ticks: {
            callback: (val) => (localeNum.format(val)),
            color: "#11979C"
          },
          title: {
            display: true,
            text: "Cumulative Shares Counted"
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

  var ctx = document.getElementById("chartCanvas");
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
          title: {
            display: true,
            text: "Date"
          },
        },
        y: {
          type: "linear",
          ticks: {
            callback: (val) => (val.toLocaleString())
          },
          title: {
            display: true,
            text: "Shares"
          },
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

async function buildPostsChart(labels) {
  let data = await fetch("https://5o7q0683ig.execute-api.us-west-2.amazonaws.com/prod/computershared/dashboard/chart?data=posts", {
    mode: 'cors'
  }).then(function (response) {
    return response.json();
  });

  var ctx = document.getElementById("chartCanvas");
  var chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels.map(function (l) {
        return new Date(l).toLocaleDateString();
      }),
      datasets: [
        {
          yAxisID: "y",
          label: "Total",
          data: data.cumulative,
          backgroundColor: '#93186c',
          borderColor: '#93186c',
          backgroundColor: 'transparent',
          type: "line"
        },
        {
          yAxisID: "ybar",
          label: "Daily",
          data: data.daily,
          backgroundColor: '#11979C'
        }
      ]
    },
    options: {
      title: {
        display: true,
        text: 'Reddit Activity'
      },
      responsive: true,
      scales: {
        x: {
          stacked: true,
          title: {
            display: true,
            text: "Date"
          },
        },
        ybar: {
          position: "right",
          stacked: true,
          min: 0,
          ticks: {
            callback: (val) => (localeNum.format(val)),
            color: "#11979C"
          },
          title: {
            display: true,
            text: "Daily Posts"
          },
        },
        y: {
          position: "left",
          stacked: true,
          ticks: {
            callback: (val) => (localeNum.format(val)),
            color: "#E024A5"
          },
          title: {
            display: true,
            text: "Total Posts"
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


async function buildGrowthChart() {
  let data = await fetch("https://5o7q0683ig.execute-api.us-west-2.amazonaws.com/prod/computershared/dashboard/chart?data=growth", {
    mode: 'cors'
  }).then(function (response) {
    return response.json();
  });

  // let power = await fetch("https://5o7q0683ig.execute-api.us-west-2.amazonaws.com/prod/computershared/dashboard/chart?data=power", {
  //   mode: 'cors'
  // }).then(function (response) {
  //   return response.json();
  // });

  var ctx = document.getElementById("chartCanvas");
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
          },
          title: {
            display: true,
            text: "Week Of"
          },
        },
        y: {
          type: "linear",
          max: 0.05,
          min: 0,
          ticks: {
            callback: (val) => Math.round(val * 1000) / 10 + "%"
          },
          title: {
            display: true,
            text: "Percent Growth"
          },
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

  var ctx = document.getElementById("chartCanvas");
  var chart = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [
        {
          data: data,
          label: "Purchasing Power (USD/wk)",
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
        text: 'Account Growth'
      },
      scales: {
        x: {
          ticks: {
            callback: (index) => new Date(Object.keys(data)[index]).toLocaleDateString()
          },
          title: {
            display: true,
            text: "Week Ending"
          },
        },
        y: {
          type: "linear",
          min: 0,
          ticks: {
            callback: (val) => "$" + Math.round(val)
          },
          title: {
            display: true,
            text: "USD per week"
          },
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

async function buildDistributionChart(labels) {
  let data = await fetch("https://5o7q0683ig.execute-api.us-west-2.amazonaws.com/prod/computershared/dashboard/chart?data=distribution", {
    mode: 'cors'
  }).then(function (response) {
    return response.json();
  });

  var ctx = document.getElementById("chartCanvas");
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
          ticks: {
            beginAtZero: false
          },
          title: {
            display: true,
            text: "Number of Accounts"
          },
          max: 2500,
        },
        x: {
          title: {
            display: true,
            text: "Minimum Shares"
          },
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

  // Add date slider
  let dists = await fetch("https://5o7q0683ig.execute-api.us-west-2.amazonaws.com/prod/computershared/dashboard/chart?data=stats", {
    mode: 'cors'
  }).then(function (response) {
    return response.json();
  });
  dists = dists.dists;
  let numDays = dists.length;
  let slider = document.getElementById("chartSlider");
  slider.setAttribute("min", 0);
  slider.setAttribute("max", numDays);
  slider.value = numDays;
  document.getElementById("sliderContainer")?.classList.remove("d-none");

  let sliderLabel = document.getElementById("dateLbl");
  sliderLabel.textContent = new Date(labels[numDays - 1]).toLocaleDateString();

  slider.onchange = (event) => {
    let index = event.target.value - 1;
    chart.data.datasets[0].data = dists[index];
    sliderLabel.textContent = new Date(labels[index]).toLocaleDateString();
    chart.update();
  };

  document.getElementById("chartCloseBtn").onclick = () => {
    document.getElementById("sliderContainer")?.classList.add("d-none");
  };

  document.getElementById("chartPlayBtn").onclick = async () => {
    var event = new Event("change");
    document.getElementById("chartPlayBtn").setAttribute("disabled", '');
    for (let i = 0; i < numDays; i++) {
      slider.value = i;
      slider.dispatchEvent(event);
      await new Promise(r => setTimeout(r, 50));
    }
    document.getElementById("chartPlayBtn").removeAttribute("disabled");
  };

  return chart;
};

async function buildHighscoreChart() {
  const hsData = await fetch("https://5o7q0683ig.execute-api.us-west-2.amazonaws.com/prod/computershared/dashboard/highscores", {
    mode: 'cors'
  }).then(function (response) {
    return response.json();
  });

  var hsScatterCtx = document.getElementById('chartCanvas');
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
            borderColor: '#93186c',
            color: '#93186c',
            type: 'scatter',
            pointRadius: 2
          },
          {
            xAxisID: "line",
            label: "Highs",
            data: hsData.high,
            pointBackgroundColor: '#F0DC46',
            lineTension: 0.4,
            borderColor: '#F0DC46',
            borderWidth: 2,
            backgroundColor: 'transparent',
            pointRadius: 0
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
          },
          title: {
            display: true,
            text: "Number of Accounts"
          },
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

(async function() {

})();

async function setupCharts() {
  Chart.defaults.color = '#EEE';
  Chart.defaults.borderColor = '#444';
  Chart.defaults.font.family = 'Courier New';
  Chart.defaults.font.size = '16';

  // Setup screen
  chartResize();

  let labels = await fetch("https://5o7q0683ig.execute-api.us-west-2.amazonaws.com/prod/computershared/dashboard/chart?data=labels", {
    mode: 'cors'
  }).then(function (response) {
    return response.json();
  });

  let chart = null;

  document.getElementById("estimatesChartBtn").onclick = async () => {
    chart?.destroy();
    chartResize();
    document.getElementById("chartModalTitle").innerHTML = "DRS Estimates";
    document.getElementById("chartType").innerText = "estimates";
    new bootstrap.Modal(document.getElementById("chartModal")).show();
    chart = await buildEstimatesChart(labels);
  };

  document.getElementById("sharesChartBtn").onclick = async () => {
    chart?.destroy();
    chartResize();
    document.getElementById("chartModalTitle").innerHTML = "Sampled Shares";
    document.getElementById("chartType").innerText = "shares";
    new bootstrap.Modal(document.getElementById("chartModal")).show();
    chart = await buildSharesChart(labels);
  };

  document.getElementById("hsScatterChartBtn").onclick = async () => {
    chart?.destroy();
    chartResize();
    document.getElementById("chartModalTitle").innerHTML = "Account Numbers";
    document.getElementById("chartType").innerText = "highscores";
    new bootstrap.Modal(document.getElementById("chartModal")).show();
    chart = await buildHighscoreChart();
  };

  document.getElementById("statsChartBtn").onclick = async () => {
    chart?.destroy();
    chartResize();
    document.getElementById("chartModalTitle").innerHTML = "Sample Statistics";
    document.getElementById("chartType").innerText = "statistics";
    new bootstrap.Modal(document.getElementById("chartModal")).show();
    chart = await buildStatsChart(labels);
  };

  document.getElementById("postsChartBtn").onclick = async () => {
    chart?.destroy();
    chartResize();
    document.getElementById("chartModalTitle").innerHTML = "Reddit Activity";
    document.getElementById("chartType").innerText = "posts";
    new bootstrap.Modal(document.getElementById("chartModal")).show();
    chart = await buildPostsChart(labels);
  };

  document.getElementById("histogramChartBtn").onclick = async () => {
    chart?.destroy();
    chartResize();
    document.getElementById("chartModalTitle").innerHTML = "Shareholders";
    document.getElementById("chartType").innerText = "distribution";
    new bootstrap.Modal(document.getElementById("chartModal")).show();
    chart = await buildDistributionChart(labels);
  };

  document.getElementById("growthChartBtn").onclick = async () => {
    chart?.destroy();
    chartResize();
    document.getElementById("chartModalTitle").innerHTML = "Account Growth";
    document.getElementById("chartType").innerText = "growth";
    new bootstrap.Modal(document.getElementById("chartModal")).show();
    chart = await buildGrowthChart();
  };

  document.getElementById("purPowChartBtn").onclick = async () => {
    chart?.destroy();
    chartResize();
    document.getElementById("chartModalTitle").innerHTML = "DRS Power";
    document.getElementById("chartType").innerText = "power";
    new bootstrap.Modal(document.getElementById("chartModal")).show();
    chart = await buildPurchasePowerChart();
  };

  document.getElementById("chartLogToggle").classList.remove("checked");
  document.getElementById("chartLogToggle").onclick = function (event) {
    chart.options.scales["y"].type = event.target.checked ? "logarithmic" : "linear";
    chart.update();
  };

};

window.onload = async () => { await setupCharts() };
