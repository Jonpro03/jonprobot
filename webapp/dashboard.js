/* globals Chart:false, feather:false */
function convertUTCDateToLocalDate(date) {
  var newDate = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
  var offset = date.getTimezoneOffset() / 60;
  var hours = date.getHours();
  newDate.setHours(hours - offset);
  return newDate;
}

function generateTable(table, data) {
  for (let element of data) {
    let row = table.insertRow();
    let shares = parseFloat(element["shares"]["N"]).toFixed(2);
    row.insertCell().appendChild(document.createTextNode(shares));
    let u = element["u"]["S"];
    row.insertCell().appendChild(document.createTextNode(u));
    let timestamp = element["ts"]["S"].replace("T", " ") + " UTC";
    //let timestamp = convertUTCDateToLocalDate(new Date(element["ts"]["S"])).toLocaleString();
    //let timestamp = new Date(element["ts"]["S"]).toLocaleTimeString('en-US', {timeZone: 'UTC'}) + " " + new Date(element["ts"]["S"]).toLocaleDateString();
    row.insertCell().appendChild(document.createTextNode(timestamp));
    let url = element["urls"]["L"][0]["S"];
    row.insertCell().appendChild(document.createTextNode(url));
  }
}

function updateRegistered(status) {
  document.getElementById("floatLockedEstimate").innerHTML = status.registered.toLocaleString() + " shares";
  let floatPercent = (status.registered / (status.outstanding_float - status.etfs - status.mfs - status.insider - ((status.use_institution) ? status.institutional_unknown : 0))) * 100;
  document.getElementById("floatLocker").innerHTML = floatPercent.toLocaleString() + '%';
}

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
    labels.push("Fuckery, probably");
  }

  if (donutData.inst_fuckery != 0) {
    data.push(donutData.inst_fuckery);
    colors.push("#094D4F");
    labels.push("Inst fuckery, probably");
  }

  donut.data.labels.pop();
  donut.data.datasets.forEach((dataset) => { dataset.data.pop() });

  donut.data.datasets[0].data = data;
  donut.data.labels = labels;
  donut.data.datasets[0].backgroundColor = colors;

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
    }
    // options: {
    //   tooltips: {
    //     callbacks: {
    //       label: function (tooltipItem, data) {
    //         var value = data.datasets[0].data[tooltipItem.index];
    //         return value.toLocaleString() + " shares";
    //       }
    //     }
    //   }
    // }
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

  donutData.remaining = donutData.total_outstanding - donutData.insider - donutData.etfs - donutData.mfs - donutData.inst_fuckery - donutData.apeDrs;
  donutData.pctComplete = (donutData.apeDrs / (donutData.remaining + donutData.apeDrs)) * 100;
  document.getElementById("remainingValue").innerHTML = donutData.remaining.toLocaleString();
  document.getElementById("floatLocked").innerHTML = donutData.pctComplete.toLocaleString() + "%";
}

(async function () {
  'use strict'
  feather.replace({ 'aria-hidden': 'true' })

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  let time = urlParams.get("time");
  time = time === null ? "all" : time;
  document.getElementById("timeSelector").value = time;
  document.getElementById("easterEgg").onclick = function() {window.location.replace("https://nft.gamestop.com/runner.html");}
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

  const stats = await fetch("https://5o7q0683ig.execute-api.us-west-2.amazonaws.com/prod/computershared/dashboard/stats?time=" + time, {
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
  document.getElementById("insiderHolding").innerHTML = donutData.insider.toLocaleString();
  document.getElementById("institutionalETFs").innerHTML = donutData.etfs.toLocaleString();
  document.getElementById("institutionalMFs").innerHTML = donutData.mfs.toLocaleString();
  document.getElementById("institutionalOther").innerHTML = donutData.inst_fuckery.toLocaleString();
  document.getElementById("apeDrs").innerHTML = donutData.apeDrs.toLocaleString();
  document.getElementById("remainingValue").innerHTML = donutData.remaining.toLocaleString();


  function handleHoldingToggle() {
    let etfEnabled = document.getElementById("etfSwitch").checked;
    let mfEnabled = document.getElementById("mfSwitch").checked;
    let otherEnabled = document.getElementById("instOtherBtn").checked;
    let insiderEnabled = document.getElementById("insiderSwitch").checked;
    let apeEnabled = document.getElementById("apesSwitch").checked;

    let etfObj = document.getElementById("institutionalETFs");
    let mfsObj = document.getElementById("institutionalMFs");
    let otherObj = document.getElementById("institutionalOther");
    let insiderObj = document.getElementById("insiderHolding");
    let apeObj = document.getElementById("apeDrs");

    if (etfEnabled) {
      etfObj.classList.remove("text-muted");
      donutData.etfs = parseFloat(etfObj.innerHTML.replaceAll(",", ""));
    } else {
      etfObj.classList.add("text-muted");
      donutData.etfs = 0;
    }

    if (mfEnabled) {
      mfsObj.classList.remove("text-muted");
      donutData.mfs = parseFloat(mfsObj.innerHTML.replaceAll(",", ""));
    } else {
      mfsObj.classList.add("text-muted");
      donutData.mfs = 0;
    }

    if (otherEnabled) {
      otherObj.classList.remove("text-muted");
      donutData.inst_fuckery = parseFloat(otherObj.innerHTML.replaceAll(",", ""));
    } else {
      otherObj.classList.add("text-muted");
      donutData.inst_fuckery = 0;
    }

    if (insiderEnabled) {
      insiderObj.classList.remove("text-muted");
      donutData.insider = parseFloat(insiderObj.innerHTML.replaceAll(",", ""));
    } else {
      insiderObj.classList.add("text-muted");
      donutData.insider = 0;
    }

    if (apeEnabled) {
      apeObj.classList.remove("text-muted");
      donutData.apeDrs = parseFloat(apeObj.innerHTML.replaceAll(",", ""));
    } else {
      apeObj.classList.add("text-muted");
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

  // Charts
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
            beginAtZero: false
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
        data: chartData.accounts,
        label: "Shares Discovered",
        lineTension: 0,
        backgroundColor: 'transparent',
        borderColor: '#93186c',
        borderWidth: 4,
        pointBackgroundColor: '#93186c'
      },
      {
        yAxisID: "posts",
        data: chartData.posts,
        stack: "",
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
          id: "shares",
          position: "left",
          type: "linear",
          ticks: {
            fontColor: "#93186c",
            beginAtZero: true
          }
        },
        {
          id: "posts",
          position: "right",
          type: "linear",
          ticks: {
            fontColor: "#A3962F",
            beginAtZero: true,
            min: 0,
            max: 500
          }
        }]
      },
      legend: {
        display: true
      }
    }
  });

  // Statistics
  document.getElementById("sampledAccounts").innerHTML = stats.sampled_accounts.toLocaleString() + " accounts";
  document.getElementById("identifiedShares").innerHTML = stats.sampled_shares.toLocaleString() + " shares";
  let sampleSize = (stats.sampled_accounts / donutData.computershare_accounts) * 100;
  document.getElementById("sampleSize").innerHTML = sampleSize.toLocaleString() + '%';
  document.getElementById("average").innerHTML = stats.average.toLocaleString();
  document.getElementById("stdDev").innerHTML = stats.std_dev.toLocaleString();
  document.getElementById("highScore").innerHTML = donutData.computershare_accounts.toLocaleString();
  document.getElementById("median").innerHTML = stats.median.toLocaleString();
  document.getElementById("mode").innerHTML = stats.mode.toLocaleString();

  document.getElementById("avgSelector").onchange = function () {
    switch (this.value) {
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
    document.getElementById("apeDrs").innerHTML = donutData.apeDrs.toLocaleString();
    updateDonutData(donutData, stats);
    updateDonut(donut, donutData);
  };

  // var resultSet = await fetch("https://5o7q0683ig.execute-api.us-west-2.amazonaws.com/prod/computershared/results", {
  //   mode: 'cors'
  // }).then(function (response) {
  //   return response.json();
  // });

  // let records = resultSet.Items;

  // records.sort(function(a, b) {
  //   var keyA = new Date(a["ts"]["S"]),
  //   keyB = new Date(b["ts"]["S"]);
  //   if (keyA < keyB) return 1;
  //   else return -1;
  // });

  // records.sort(function (a, b) {
  //   var keyA = parseFloat(a["shares"]["N"]),
  //     keyB = parseFloat(b["shares"]["N"]);
  //   if (keyA < keyB) return 1;
  //   else return -1;
  // });

  // var tableBody = document.getElementById("resultsTableBody");
  // generateTable(tableBody, records);

  // var table = document.getElementById("resultsTable");
  // table.setAttribute("data-toggle","table");

})()

