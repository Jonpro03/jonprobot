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
  let statSelected = document.getElementById("avgSelector").value
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
  document.getElementById("remainingValue").innerHTML = donutData.remaining.toLocaleString();
  document.getElementById("floatTotal").innerHTML = donutData.float.toLocaleString();
  document.getElementById("floatTotal2").innerHTML = donutData.float.toLocaleString();
  document.getElementById("floatLocked").innerHTML = donutData.pctComplete.toLocaleString() + "%";
}

(async function () {
  'use strict'
  feather.replace({ 'aria-hidden': 'true' })
  Chart.defaults.global.defaultFontColor = '#EEE';
  Chart.defaults.global.defaultLineColor = '#AAA';
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  document.getElementById("searchbar").value = "";
  document.getElementById("searchbar").onkeydown = async function (event) {
    let keyPressed = event.key;
    if (keyPressed === "Enter") {
      if (event.target.value === "") {
        return;
      } else if (["dfv", "deepfuckingvalue", "rc", "ryancohen", "jonpro03", "jonpro"].includes(event.target.value.toLowerCase())) {
        window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ?autoplay=1"
      }
      var redditData = await fetch("https://www.reddit.com/user/" + event.target.value + "/about.json", {
        mode: 'cors'
      }).then(function (response) {
        return response.json();
      });

      if ('error' in redditData) {
        window.alert(event.target.value + " not found.");
        return;
      } else {
        window.location.href = "user/index.html" + "?ape=" + redditData.data.name;
      }
    }
  }

  let datasource = urlParams.get("bot");
  datasource = datasource === null ? "scraper" : datasource
  document.getElementById("botSelector").value = datasource;

  let time = "all";
  if (datasource === "drsbot") {
    document.getElementById("dataLearnMore").href = "https://www.reddit.com/r/Superstonk/comments/qap4je/drsbot_4x_now_online/";
    document.getElementById("botLabel").innerHTML = "DRSBOT"
    document.getElementById("trimAvgLabel").innerHTML = "Multi-Account Average";
    document.getElementById("trmAvgSlt").innerHTML = "Multi-Account Average";
  }
  document.getElementById("avgSelector").selectedIndex = 0;

  // document.getElementById("easterEgg").onclick = function () { window.location.href = "https://twitter.com/ryancohen"; }

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

  if (datasource === "drsbot") {
    stats.trimmed_average = stats.average / stats.accts_per_ape;
  }

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
  document.getElementById("insiderHolding").innerHTML = '- ' + donutData.insider.toLocaleString();
  document.getElementById("institutionalETFs").innerHTML = '- ' + donutData.etfs.toLocaleString();
  document.getElementById("institutionalMFs").innerHTML = '- ' + donutData.mfs.toLocaleString();
  document.getElementById("institutionalOther").innerHTML = '- ' + donutData.inst_fuckery.toLocaleString();
  document.getElementById("apeDrs").innerHTML = '- ' + donutData.apeDrs.toLocaleString();
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
  document.getElementById("average").innerHTML = stats.average.toLocaleString() + " shares";
  if ("trimmed_average" in stats) {
    document.getElementById("trimAvg").innerHTML = stats.trimmed_average.toLocaleString() + " shares";
    document.getElementById("metricVal").innerHTML = 'x ' + stats.trimmed_average.toLocaleString();
  } else {
    document.getElementById("metricVal").innerHTML = 'x ' + stats.average.toLocaleString();
    document.getElementById("metricLabel").innerHTML = 'Average:';
  }
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
      case "trmAvg":
        if(datasource === "drsbot") {
          document.getElementById("metricLabel").innerHTML = 'Multi-account Average: ';
        } else {
          document.getElementById("metricLabel").innerHTML = 'Trimmed Average: ';
        }
        document.getElementById("metricVal").innerHTML = 'x ' + stats.trimmed_average.toLocaleString();
        donutData.apeDrs = stats.trimmed_average * donutData.computershare_accounts;   
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

  if (datasource === "drsbot") {
    document.getElementById("acctsPerApe").innerHTML = stats.accts_per_ape.toLocaleString();
  } else {
    document.getElementById("acctsPerApe").remove();
    document.getElementById("acctsPerApeLabel").remove();
  }



  let t = new bootstrap.Toast(document.getElementById("alertToast"));
  if (datasource === "drsbot") {
    var alerted = localStorage.getItem('drsbotAcctAvgFeature') || '';
    if (alerted != "alerted") {
      t.show();
      localStorage.setItem("drsbotAcctAvgFeature", "alerted");
    }
  }
})()

