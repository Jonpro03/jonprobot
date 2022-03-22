(async function () {
  'use strict'

  Chart.defaults.color = '#EEE';
  Chart.defaults.borderColor = '#444';

  // Charts
  let datasource = document.getElementById("botSelector").value;
  if (datasource === "drsbot") {
    document.getElementById("chartsRow").remove();
    return;
  }

  const chartData = await fetch("https://5o7q0683ig.execute-api.us-west-2.amazonaws.com/prod/computershared/dashboard/charts", {
    mode: 'cors'
  }).then(function (response) {
    return response.json();
  });

  var estimatesChartCtx = document.getElementById('estimatesChart')
  var estimatesChart = new Chart(estimatesChartCtx, {
    type: 'line',
    data: {
      labels: chartData.labels.map(function (l) {
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
            5200000,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            8900000
          ]
        },
        {
          data: chartData.estimates.averages,
          label: "Average",
          lineTension: 0.4,
          backgroundColor: 'transparent',
          borderColor: '#E024A5',
          borderWidth: 2,
          pointBackgroundColor: '#93186c'
        },
        {
          data: chartData.estimates.medians,
          label: "Median",
          lineTension: 0.4,
          backgroundColor: 'transparent',
          borderColor: '#A3962F',
          borderWidth: 2,
          pointBackgroundColor: '#A3962F'
        },
        {
          data: chartData.estimates.trimmed_means,
          label: "Trimmed Average",
          lineTension: 0.4,
          backgroundColor: 'transparent',
          borderColor: '#11979C',
          borderWidth: 2,
          pointBackgroundColor: '#11979C'
        },
        {
          hidden: true,
          data: chartData.estimates.modes,
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

  var sharesChartCtx = document.getElementById('sharesChart');
  var sharesChart = new Chart(sharesChartCtx, {
    type: 'bar',
    data: {
      labels: chartData.labels.map(function (l) {
        return new Date(l).toLocaleDateString();
      }),
      datasets: [
        {
          yAxisID: "yline",
          label: "Total",
          data: chartData.shares.cumulative,
          backgroundColor: '#11979C',
          borderColor: '#11979C',
          backgroundColor: 'transparent',
          type: "line"
        },
        {
          yAxisID: "ybar",
          label: "New Accounts",
          data: chartData.shares.daily.from_new,
          backgroundColor: '#93186c'
        },
        {
          yAxisID: "ybar",
          label: "Existing Accounts",
          data: chartData.shares.daily.from_growth,
          backgroundColor: '#A3962F',
          borderColor: '#A3962F'
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
        },
        yline: {
          position: "left",
          stacked: true,
          ticks: {
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

  var histogramCtx = document.getElementById('distributionChart');
  var histogramChart = new Chart(histogramCtx, {
    type: 'line',
    data: {
      labels: chartData.distribution.labels,
      datasets: [{
        data: chartData.distribution.values,
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
            borderColor: '#A3962F',
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
            beginAtZero: true
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
      },
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

  document.getElementById("avgChartLogToggle").classList.remove("checked");
  document.getElementById("avgChartLogToggle").onclick = function (event) {
    estimatesChart.options.scales["y"].type = event.target.checked ? "logarithmic" : "linear";
    estimatesChart.update();
    sharesChart.options.scales["yline"].type = event.target.checked ? "logarithmic" : "linear";
    sharesChart.update();
    histogramChart.options.scales["y"].type = event.target.checked ? "logarithmic" : "linear";
    histogramChart.update();
    hsScatterChart.options.scales["y"].type = event.target.checked ? "logarithmic" : "linear";
    hsScatterChart.update();
  };

})()