(async function () {
  'use strict'

  Chart.defaults.global.defaultFontColor = '#EEE';
  Chart.defaults.global.defaultLineColor = '#AAA';

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
      labels: chartData.labels,
      datasets: [
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
            5200000
        ]
        }
      ]
    },
    options: {
      title: {
        display: true,
        text: 'Total DRS Estimates'
      },
      scales: {
        xAxes: [{
          stacked: true, color: "#AAA",
          ticks: {
            callback: (val) => (new Date(val).toLocaleDateString())
          }
        }],
        yAxes: [{
          type: "linear",
          ticks: {
            beginAtZero: false,
            min: 0,
            callback: (val) => (val.toLocaleString())
          }
        }],
      },
      legend: {
        display: true
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
      }
    }
  });

  var postsChartCtx = document.getElementById('postsAcctsChart');
  var postsChart = new Chart(postsChartCtx, {
    type: 'bar',
    data: {
      labels: chartData.labels,
      datasets: [
        {
          yAxisID: "line",
          label: "Total Posts",
          data: chartData.posts.cumulative,
          borderColor: '#E024A5',
          backgroundColor: 'transparent',
          type: "line"
        },
        {
          yAxisID: "line",
          label: "Total Accts",
          data: chartData.accounts.cumulative,
          backgroundColor: '#F0DC46',
          borderColor: '#F0DC46',
          backgroundColor: 'transparent',
          type: "line"
        },
        {
          label: "Daily Posts",
          data: chartData.posts.daily,
          backgroundColor: '#93186c'
        },
        {
          label: "Daily Accts",
          data: chartData.accounts.daily,
          backgroundColor: '#A3962F'
        }
      ]
    },
    options: {
      title: {
        display: true,
        text: 'Reddit DRS Images'
      },
      responsive: true,
      scales: {
        xAxes: [{
          ticks: {
            callback: (val) => (new Date(val).toLocaleDateString())
          }
        }],
        yAxes: [
          {
            id: "bar",
            position: "right",
            ticks: {
              callback: (val) => (val.toLocaleString())
            }
          },
          {
            id: "line",
            position: "left",
            ticks: {
              fontColor: "#11979C",
              callback: (val) => (val.toLocaleString())
            }
          }
        ]
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
      }
    }
  });

  var sharesChartCtx = document.getElementById('sharesChart');
  var sharesChart = new Chart(sharesChartCtx, {
    type: 'bar',
    data: {
      labels: chartData.labels,
      datasets: [
        {
          yAxisID: "line",
          label: "Total",
          data: chartData.shares.cumulative,
          backgroundColor: '#11979C',
          borderColor: '#11979C',
          backgroundColor: 'transparent',
          type: "line"
        },
        {
          label: "New Accounts",
          data: chartData.shares.daily.from_new,
          backgroundColor: '#93186c'
        },
        {
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
        xAxes: [{
          stacked: true, color: "#AAA",
          ticks: {
            callback: (val) => (new Date(val).toLocaleDateString())
          }
        }],
        yAxes:
          [
            {
              id: "bar",
              position: "right",
              stacked: true,
              ticks: {
                callback: (val) => (val.toLocaleString())
              }
            },
            {
              id: "line",
              position: "left",
              stacked: true,
              ticks: {
                fontColor: "#11979C",
                callback: (val) => (val.toLocaleString())
              }
            }
          ]
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
      }
    }
  });

  var statsChartCtx = document.getElementById('statsChart')
  var statsChart = new Chart(statsChartCtx, {
    type: 'line',
    data: {
      labels: chartData.labels,
      datasets: [
        {
          data: chartData.stats.averages,
          label: "Average",
          lineTension: 0.4,
          backgroundColor: 'transparent',
          borderColor: '#E024A5',
          borderWidth: 2,
          pointBackgroundColor: '#93186c'
        },
        {
          data: chartData.stats.medians,
          label: "Median",
          lineTension: 0.4,
          backgroundColor: 'transparent',
          borderColor: '#A3962F',
          borderWidth: 2,
          pointBackgroundColor: '#A3962F'
        },
        {
          data: chartData.stats.trimmed_means,
          label: "Trimmed Average",
          lineTension: 0.4,
          backgroundColor: 'transparent',
          borderColor: '#11979C',
          borderWidth: 2,
          pointBackgroundColor: '#11979C'
        },
        {
          data: chartData.stats.trm_std_devs,
          label: "Trimmed Std Dev",
          lineTension: 0.4,
          backgroundColor: 'transparent',
          borderColor: '#942A1F',
          borderWidth: 2,
          pointBackgroundColor: '#942A1F'
        },
        {
          hidden: true,
          data: chartData.stats.modes,
          label: "Mode",
          lineTension: 0.4,
          backgroundColor: 'transparent',
          borderColor: '#094D4F',
          borderWidth: 2,
          pointBackgroundColor: '#094D4F'
        },
        {
          hidden: true,
          data: chartData.stats.std_devs,
          label: "Std Deviation",
          lineTension: 0.4,
          backgroundColor: 'transparent',
          borderColor: '#6FA142',
          borderWidth: 2,
          pointBackgroundColor: '#6FA142'
        },
      ]
    },
    options: {
      title: {
        display: true,
        text: 'Sample Statistics'
      },
      scales: {
        xAxes: [{
          stacked: true, color: "#AAA",
          ticks: {
            callback: (val) => (new Date(val).toLocaleDateString())
          }
        }],
        yAxes: [{
          type: "linear",
          ticks: {
            beginAtZero: false,
            min: 0,
            callback: (val) => (val.toLocaleString())
          }
        }],
      },
      legend: {
        display: true
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
        backgroundColor: '#93186c',
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
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: "Number of Accounts"
          },
          ticks: {
            beginAtZero: false
          }
        }],
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: "Shares >="
          }
        }]
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
      labels: hsData.high_labels,
      datasets:
        [
          {
            xAxisID: "scatter",
            label: "Scatter",
            data: hsData.scatter,
            pointBackgroundColor: '#E024A5',
            backgroundColor: '#93186c',
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
        yAxes: [{
          ticks: {
            beginAtZero: true
          }
        }],
        xAxes: [
          {
            id: "scatter",
            display: false,
            type: 'linear',
            position: 'bottom',
            ticks: {
              min: Math.min(...hsData.high_labels),
              max: Math.max(...hsData.high_labels),
              callback: function (val) {
                let d = new Date(val);
                return d.toLocaleDateString();
              }
            }
          },
          {
            id: "line",
            position: 'bottom',
            ticks: {
              min: Math.min(...hsData.high_labels),
              max: Math.max(...hsData.high_labels),
              callback: function (val) {
                let d = new Date(val);
                return d.toLocaleDateString();
              }
            }
          }
        ]
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
    }
  });

  document.getElementById("avgChartLogToggle").classList.remove("checked");
  document.getElementById("avgChartLogToggle").onclick = function (event) {
    postsChart.options.scales.yAxes[1].type = event.target.checked ? "logarithmic" : "linear";
    postsChart.update();
    estimatesChart.options.scales.yAxes[0].type = event.target.checked ? "logarithmic" : "linear";
    estimatesChart.update();
    sharesChart.options.scales.yAxes[1].type = event.target.checked ? "logarithmic" : "linear";
    sharesChart.update();
    statsChart.options.scales.yAxes[0].type = event.target.checked ? "logarithmic" : "linear";
    statsChart.update();
    histogramChart.options.scales.yAxes[0].type = event.target.checked ? "logarithmic" : "linear";
    histogramChart.update();
    hsScatterChart.options.scales.yAxes[0].type = event.target.checked ? "logarithmic" : "linear";
    hsScatterChart.update();
  };

})()