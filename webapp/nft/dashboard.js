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
    labels.push("Insiders");
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
      plugins: {
        legend : {
          display: false
        }
      },
      responsive: true,
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
  const statSelected = "trmAvg";
  donutData.apeDrs = 0;
  if (document.getElementById("apesSwitch").checked) {
    switch (statSelected) {
      case "median":
        donutData.apeDrs = stats.median * donutData.computershare_accounts;
        break;
      case "trmAvg":
        donutData.apeDrs = stats.trimmed_average * donutData.computershare_accounts;
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
}

(async function () {
  'use strict'
  feather.replace({ 'aria-hidden': 'true' })
  Chart.defaults.color = '#EEE';
  Chart.defaults.defaultLineColor = '#AAA';
 
  const datasource = "scraper"

  let time = "all";
  // if (datasource === "drsbot") {
  //   document.getElementById("dataLearnMore").href = "https://www.reddit.com/r/Superstonk/comments/qap4je/drsbot_4x_now_online/";
  //   document.getElementById("botLabel").innerHTML = "DRSBOT Statistics"
  //   document.getElementById("avgStatLbl").innerHTML = "Average Per Ape";
  // }
  // else {
  //   document.getElementById("avgStatLbl").innerHTML = "Average Per Account";
  // }
  // document.getElementById("avgSelector").selectedIndex = 0;

  // document.getElementById("easterEgg").onclick = function () { window.location.href = "https://twitter.com/ryancohen"; }

  let statsUrl = "https://5o7q0683ig.execute-api.us-west-2.amazonaws.com/prod/computershared/dashboard/stats?time=" + time;
  statsUrl += "&bot=" + datasource;


  const stats = await fetch(statsUrl, {
    mode: 'cors'
  }).then(function (response) {
    return response.json();
  });

  if (datasource === "drsbot") {
    stats.trimmed_average = stats.trimmed_average / stats.accts_per_ape;
  }

  const donutData = await fetch("https://5o7q0683ig.execute-api.us-west-2.amazonaws.com/prod/computershared/dashboard?time=" + time, {
    mode: 'cors'
  }).then(function (response) {
    return response.json();
  });

  // Build donut
  updateDonutData(donutData, stats);
  var donut = buildDonut();
  updateDonut(donut, donutData);

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
      donutData.etfs = parseFloat(etfObj.innerHTML);
    } else {
      donutData.etfs = 0;
    }

    if (mfEnabled) {
      donutData.mfs = parseFloat(mfsObj.innerHTML);
    } else {
      donutData.mfs = 0;
    }

    if (otherEnabled) {
      donutData.inst_fuckery = parseFloat(otherObj.innerHTML);
    } else {
      donutData.inst_fuckery = 0;
    }

    if (insiderEnabled) {
      donutData.insider = parseFloat(insiderObj.innerHTML);
    } else {
      donutData.insider = 0;
    }

    if (apeEnabled) {
      donutData.apeDrs = parseFloat(apeObj.innerHTML);
    } else {
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

})()
