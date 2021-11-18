function updateDonut(donut, donutData) {
  var data = [];
  var colors = [];
  var labels = [];

  if (donutData.mfs != 0) {
    data.push(donutData.mfs);
    colors.push("#6FA142");
    labels.push("Mutual Funds");
  }

  if (donutData.etfs != 0) {
    data.push(donutData.etfs);
    colors.push("#11979C");
    labels.push("ETFs");
  }

  if (donutData.insider != 0) {
    data.push(donutData.insider);
    colors.push("#A3962F");
    labels.push("Insider");
  }

  if (donutData.apeDrs != 0) {
    data.push(donutData.apeDrs);
    colors.push("#93186c");
    labels.push("Apes");
  }

  if (donutData.remaining != 0) {
    data.push(donutData.remaining);
    colors.push("#212529");
    labels.push("Held in Brokerages");
  }

  if (donutData.inst_fuckery != 0) {
    data.push(donutData.inst_fuckery);
    colors.push("#094D4F");
    labels.push("Inst Unknown");
  }

  donut.data.labels.pop();
  donut.data.datasets.forEach((dataset) => { dataset.data.pop() });

  donut.data.datasets[0].data = data;
  donut.data.labels = labels;
  donut.data.datasets[0].backgroundColor = colors;

  donut.reset();
  donut.update();
}

function buildDonut() {
  var lockerCtx = document.getElementById('shareLocker');

  var shareLockerChart = new Chart(lockerCtx, {
    type: 'doughnut',
    data: {
      labels: [],
      datasets: [{
        label: "",
        data: [],
        backgroundColor: []
      }]
    },
    options: {
      tooltips: {
        callbacks: {
          label: function (tooltipItem, data) {
            var value = data.datasets[0].data[tooltipItem.index];
            var label = data.labels[tooltipItem.index];
            return label + ": " + value.toLocaleString() + " shares";
          }
        }
      }
    }
  });
  return shareLockerChart;
}

function updateDonutData(donutData, stats) {
  let statSelected = document.getElementById("avgSelector").value
  donutData.apeDrs = 0;
  if (document.getElementById("apesSwitch").checked) {
    switch (statSelected) {
      case "median":
        donutData.apeDrs = stats.median * donutData.computershare_accounts;
        break;
      case "mode":
        donutData.apeDrs = stats.mode * donutData.computershare_accounts;
        break;
      default:
        donutData.apeDrs = stats.average * donutData.computershare_accounts;
        break;
    }
  }

  donutData.float = donutData.total_outstanding - donutData.insider - donutData.etfs - donutData.mfs - donutData.inst_fuckery;
  donutData.remaining = donutData.float - donutData.apeDrs;
  donutData.pctComplete = (donutData.apeDrs / donutData.float) * 100;
  document.getElementById("remainingValue").innerHTML = donutData.remaining.toLocaleString();
  document.getElementById("floatTotal").innerHTML = donutData.float.toLocaleString();
  document.getElementById("floatTotal2").innerHTML = donutData.float.toLocaleString();
  document.getElementById("floatLocked").innerHTML = donutData.pctComplete.toLocaleString() + "%";
}

(async function () {
  'use strict'
  feather.replace({ 'aria-hidden': 'true' })
  Chart.defaults.global.defaultFontColor = '#EEE';
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);


  let datasource = urlParams.get("bot");
  datasource = datasource === null ? "scraper" : datasource
  document.getElementById("botSelector").value = datasource;

  let time = urlParams.get("time");
  time = time === null ? "all" : time;
  document.getElementById("timeSelector").value = time;
  if (datasource === "drsbot") {
    document.getElementById("dataLearnMore").href = "https://www.reddit.com/r/Superstonk/comments/qap4je/drsbot_4x_now_online/";
    document.getElementById("timeSelector").setAttribute("disabled", "");
    document.getElementById("botLabel").innerHTML = "DRS Bot";
  }
  document.getElementById("easterEgg").onclick = function () { window.location.replace("https://nft.gamestop.com/runner.html"); }

  document.getElementById("timeSelector").onchange = function () {
    var url = window.location.href;
    if (url.indexOf("?") > 0) {
      url = url.substring(0, url.indexOf("?"));
    }
    switch (this.value) {
      case "month":
        url += "?time=month";
        break;
      case "week":
        url += "?time=week";
        break;
      case "day":
        url += "?time=day";
        break;
      default:
        url += "?time=all";
        break;
    }
    window.location.replace(url);
  }

  document.getElementById("botSelector").onchange = function () {
    var url = window.location.href;
    if (url.indexOf("?") > 0) {
      url = url.substring(0, url.indexOf("?"));
    }
    switch (this.value) {
      case "drsbot":
        url += "?bot=drsbot";
        break;
      default:
        url += "?bot=scraper";
        break;
    }
    window.location.replace(url);
  }

  let statsUrl = "https://5o7q0683ig.execute-api.us-west-2.amazonaws.com/prod/computershared/dashboard/stats?time=" + time;
  statsUrl += "&bot=" + datasource;


  const stats = await fetch(statsUrl, {
    mode: 'cors'
  }).then(function (response) {
    return response.json();
  });


  const donutData = await fetch("https://5o7q0683ig.execute-api.us-west-2.amazonaws.com/prod/computershared/dashboard?time=" + time, {
    mode: 'cors'
  }).then(function (response) {
    return response.json();
  });

  document.getElementById("asof").innerHTML = "As of " + new Date(donutData.last_update).toDateString().toLocaleString();

  // Build donut
  updateDonutData(donutData, stats);
  var donut = buildDonut();
  updateDonut(donut, donutData);

  document.getElementById("outstandingValue").innerHTML = donutData.total_outstanding.toLocaleString();
  document.getElementById("insiderHolding").innerHTML = '-' + donutData.insider.toLocaleString();
  document.getElementById("institutionalETFs").innerHTML = '-' + donutData.etfs.toLocaleString();
  document.getElementById("institutionalMFs").innerHTML = '-' + donutData.mfs.toLocaleString();
  document.getElementById("institutionalOther").innerHTML = '-' + donutData.inst_fuckery.toLocaleString();
  document.getElementById("apeDrs").innerHTML = '-' + donutData.apeDrs.toLocaleString();
  document.getElementById("apeDrsTotal").innerHTML = donutData.apeDrs.toLocaleString();
  document.getElementById("remainingValue").innerHTML = donutData.remaining.toLocaleString();

  document.getElementById("donutDataEtfs").innerHTML = donutData.etfs;
  document.getElementById("donutDataMfs").innerHTML = donutData.mfs;
  document.getElementById("donutDataInst").innerHTML = donutData.inst_fuckery;
  document.getElementById("donutDataInsider").innerHTML = donutData.insider;
  document.getElementById("donutDataApe").innerHTML = donutData.apeDrs;


  function handleHoldingToggle() {
    let etfEnabled = document.getElementById("etfSwitch").checked;
    let mfEnabled = document.getElementById("mfSwitch").checked;
    let otherEnabled = document.getElementById("instOtherBtn").checked;
    let insiderEnabled = document.getElementById("insiderSwitch").checked;
    let apeEnabled = document.getElementById("apesSwitch").checked;

    let etfObj = document.getElementById("donutDataEtfs");
    let mfsObj = document.getElementById("donutDataMfs");
    let otherObj = document.getElementById("donutDataInst");
    let insiderObj = document.getElementById("donutDataInsider");
    let apeObj = document.getElementById("donutDataApe");

    if (etfEnabled) {
      document.getElementById("institutionalETFs").classList.remove("text-muted");
      donutData.etfs = parseFloat(etfObj.innerHTML);
    } else {
      document.getElementById("institutionalETFs").classList.add("text-muted");
      donutData.etfs = 0;
    }

    if (mfEnabled) {
      document.getElementById("institutionalMFs").classList.remove("text-muted");
      donutData.mfs = parseFloat(mfsObj.innerHTML);
    } else {
      document.getElementById("institutionalMFs").classList.add("text-muted");
      donutData.mfs = 0;
    }

    if (otherEnabled) {
      document.getElementById("institutionalOther").classList.remove("text-muted");
      donutData.inst_fuckery = parseFloat(otherObj.innerHTML);
    } else {
      document.getElementById("institutionalOther").classList.add("text-muted");
      donutData.inst_fuckery = 0;
    }

    if (insiderEnabled) {
      document.getElementById("insiderHolding").classList.remove("text-muted");
      donutData.insider = parseFloat(insiderObj.innerHTML);
    } else {
      document.getElementById("insiderHolding").classList.add("text-muted");
      donutData.insider = 0;
    }

    if (apeEnabled) {
      document.getElementById("apeDrs").classList.remove("text-muted");
      donutData.apeDrs = parseFloat(apeObj.innerHTML);
    } else {
      document.getElementById("apeDrs").classList.add("text-muted");
      donutData.apeDrs = 0;
    }

    updateDonutData(donutData, stats);
    updateDonut(donut, donutData);
  }

  handleHoldingToggle();

  document.getElementById("etfSwitch").addEventListener("click", handleHoldingToggle);
  document.getElementById("mfSwitch").addEventListener("click", handleHoldingToggle);
  document.getElementById("instOtherBtn").addEventListener("click", handleHoldingToggle);
  document.getElementById("insiderSwitch").addEventListener("click", handleHoldingToggle);
  document.getElementById("apesSwitch").addEventListener("click", handleHoldingToggle);


  // Statistics
  document.getElementById("sampledAccounts").innerHTML = stats.sampled_accounts.toLocaleString() + " accounts";
  document.getElementById("identifiedShares").innerHTML = stats.sampled_shares.toLocaleString() + " shares";
  let sampleSize = (stats.sampled_accounts / donutData.computershare_accounts) * 100;
  document.getElementById("sampleSize").innerHTML = sampleSize.toLocaleString() + '%';
  document.getElementById("average").innerHTML = stats.average.toLocaleString();
  document.getElementById("metricVal").innerHTML = 'x ' + stats.average.toLocaleString();
  document.getElementById("stdDev").innerHTML = stats.std_dev.toLocaleString();
  document.getElementById("highScore").innerHTML = donutData.computershare_accounts.toLocaleString();
  document.getElementById("median").innerHTML = stats.median.toLocaleString();
  document.getElementById("mode").innerHTML = stats.mode.toLocaleString();

  document.getElementById("avgSelector").onchange = function () {
    switch (this.value) {
      case "median":
        document.getElementById("metricLabel").innerHTML = 'Median: ';
        document.getElementById("metricVal").innerHTML = 'x ' + stats.median.toLocaleString();
        donutData.apeDrs = stats.median * donutData.computershare_accounts;
        break;
      case "mode":
        document.getElementById("metricLabel").innerHTML = 'Mode: ';
        document.getElementById("metricVal").innerHTML = 'x ' + stats.mode.toLocaleString();
        donutData.apeDrs = stats.mode * donutData.computershare_accounts;
        break;
      default:
        document.getElementById("metricLabel").innerHTML = 'Average: ';
        document.getElementById("metricVal").innerHTML = 'x ' + stats.average.toLocaleString();
        donutData.apeDrs = stats.average * donutData.computershare_accounts;
        break;
    }
    document.getElementById("apeDrsTotal").innerHTML = donutData.apeDrs.toLocaleString();
    document.getElementById("apeDrs").innerHTML = '- ' + donutData.apeDrs.toLocaleString();
    updateDonutData(donutData, stats);
    updateDonut(donut, donutData);
  };

  // Charts
  if (datasource === "drsbot") {
    document.getElementById("chartsRow").remove();
    return;
  }

  const chartData = await fetch("https://5o7q0683ig.execute-api.us-west-2.amazonaws.com/prod/computershared/dashboard/charts?time=" + time, {
    mode: 'cors'
  }).then(function (response) {
    return response.json();
  });


  var ctx = document.getElementById('myChart')
  var myChart = new Chart(ctx, {
    type: 'line',
    label: "ohai",
    data: {
      labels: chartData.labels,
      datasets: [{
        data: chartData.averages,
        label: "Average Shares per Sampled Computershare Account",
        lineTension: 0,
        backgroundColor: 'transparent',
        borderColor: '#93186c',
        borderWidth: 4,
        pointBackgroundColor: '#93186c'
      }]
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: false,
            min: 0
          }
        }]
      },
      legend: {
        display: true
      }
    }
  });

  var totalAcctsCtx = document.getElementById('totalAcctsChart');
  var totalAcctsChart = new Chart(totalAcctsCtx, {
    type: 'line',
    label: "ohai",
    data: {
      labels: chartData.labels,
      datasets: [{
        data: chartData.accounts,
        label: "Accounts Discovered",
        lineTension: 0,
        backgroundColor: 'transparent',
        borderColor: '#93186c',
        borderWidth: 4,
        pointBackgroundColor: '#93186c'
      },
      {
        data: chartData.posts,
        label: "Posts Discovered",
        lineTension: 0,
        backgroundColor: 'transparent',
        borderColor: '#A3962F',
        borderWidth: 4,
        pointBackgroundColor: '#A3962F'
      }]
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: false
          }
        }]
      },
      legend: {
        display: true
      }
    }
  });

  var histogramCtx = document.getElementById('histogramChart');
  var histogramChart = new Chart(histogramCtx, {
    type: 'line',
    label: "ohai",
    data: {
      labels: chartData.dist_labels,
      datasets: [{
        data: chartData.dist_values,
        label: "Distribution of Shareholder Accounts",
        lineTension: 0,
        backgroundColor: 'transparent',
        borderColor: '#93186c',
        borderWidth: 4,
        pointBackgroundColor: '#E024A5'
      }]
    },
    options: {
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
            labelString: "shares"
          }
        }]
      },
      legend: {
        display: true
      }
    }
  });

  var regCtx = document.getElementById('regChart');
  var registeredChart = new Chart(regCtx, {
    type: 'bar',
    label: "ohai",
    data: {
      labels: chartData.labels,
      datasets: [{
        yAxisID: "shares",
        data: chartData.daily_shares,
        label: "Shares Added",
        lineTension: 0,
        backgroundColor: 'transparent',
        borderColor: '#93186c',
        borderWidth: 4,
        pointBackgroundColor: '#93186c'
      },
      {
        yAxisID: "accts",
        data: chartData.daily_accts,
        stack: "",
        label: "Accounts Added",
        lineTension: 0,
        backgroundColor: 'transparent',
        borderColor: '#A3962F',
        borderWidth: 4,
        pointBackgroundColor: '#A3962F'
      }]
    },
    options: {
      scales: {
        yAxes: [{
          id: "shares",
          position: "left",
          type: "linear",
          ticks: {
            fontColor: "#E024A5",
            beginAtZero: true,
            max: time === "day" ? 10000 : 100000
          }
        },
        {
          id: "accts",
          position: "right",
          type: "linear",
          ticks: {
            fontColor: "#F0DC46",
            beginAtZero: true,
            min: 0,
            max: time === "day" ? 65 : 650
          }
        }]
      },
      legend: {
        display: true
      }
    }
  });



})()

