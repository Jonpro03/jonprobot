var localeFormat = Intl.NumberFormat(navigator.language, {
  notation: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? 'compact' : 'standard',
  maximumFractionDigits: 2
});

let showOutstanding = false;

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
    colors.push("#F0DC46");
    labels.push("Insiders");
  }

  if (donutData.stagnant != 0) {
    data.push(donutData.stagnant);
    colors.push("#E0A63A");
    labels.push("Stagnant");
  }


  if (donutData.apeDrs != 0) {
    data.push(donutData.apeDrs);
    colors.push("#93186c");
    labels.push("Retail DRS");
  }

  if (showOutstanding) {
    data.push(donutData.remaining);
    colors.push("#212529");
    labels.push("Remaining");
  }

  if (donutData.inst_fuckery != 0) {
    data.push(donutData.inst_fuckery);
    colors.push("#094D4F");
    labels.push("Institutions");
  }

  donut.data.labels.pop();
  donut.data.datasets.forEach((dataset) => { dataset.data.pop() });

  donut.data.datasets[0].data = data;// data.reverse();
  donut.data.labels = labels;// labels.reverse();
  donut.data.datasets[0].backgroundColor = colors;// colors.reverse();
  donut.options.animation.animateScale = false;

  //donut.reset();
  donut.update();
}

function buildDonut() {

  var lockerCtx = document.getElementById('shareLocker');

  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    lockerCtx.parentElement.style.maxHeight = "380px";
  } else {
    lockerCtx.parentElement.style.maxHeight = "800px";
  }

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
      maintainAspectRatio: false,
      animation: {
        animateRotate: false,
        animateScale: false
      },
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


  donutData.float = donutData.total_outstanding - donutData.insider - donutData.stagnant - donutData.etfs - donutData.mfs - donutData.inst_fuckery;
  donutData.remaining = donutData.float - donutData.apeDrs;
  donutData.pctComplete = (donutData.apeDrs / donutData.float) * 100;
  document.getElementById("remainingValue").innerHTML = localeFormat.format(donutData.remaining);
  document.getElementById("remainingValuePct").innerHTML = Math.round(donutData.remaining / donutData.total_outstanding * 100) + '%';
  document.getElementById("floatLocked").innerHTML = Math.round(donutData.pctComplete * 100) / 100 + "%";
  document.getElementById("apeDrs").innerHTML = '- ' + localeFormat.format(donutData.apeDrs);
  document.getElementById("apeDrsPct").innerHTML = '- ' + Math.round(donutData.apeDrs / donutData.total_outstanding * 100) + '%';
}

(async function () {
  'use strict'
  feather.replace({ 'aria-hidden': 'true' })

  document.getElementById("etfSwitch").checked = false;
  document.getElementById("mfSwitch").checked = false;
  document.getElementById("instOtherBtn").checked = false;
  document.getElementById("insiderSwitch").checked = false;
  document.getElementById("stagnantSwitch").checked = false;
  document.getElementById("apesSwitch").checked = false;

  Chart.defaults.color = '#EEE';
  Chart.defaults.defaultLineColor = '#AAA';
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  let datasource = urlParams.get("bot");
  datasource = datasource === null ? "scraper" : datasource
  document.getElementById("botSelector").value = datasource;

  let time = "all";
  if (datasource === "drsbot") {
    document.getElementById("dataLearnMore").href = "https://www.reddit.com/r/Superstonk/comments/qap4je/drsbot_4x_now_online/";
    document.getElementById("botLabel").innerHTML = "DRSBOT Statistics"
    document.getElementById("avgStatLbl").innerHTML = "Average Per Ape";
  }
  else {
    document.getElementById("avgStatLbl").innerHTML = "Average Per Account";
  }
  document.getElementById("avgSelector").selectedIndex = 0;

  // document.getElementById("easterEgg").onclick = function () { window.location.href = "https://twitter.com/ryancohen"; }

  document.getElementById("botSelector").onchange = function () {
    var url = window.location.href.replace("#", "");
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

  // Handle mobile site diff
  if (/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    document.getElementById('dataBtn').classList.add('d-none');
    document.getElementById('instOtherBtnLbl').innerText = 'Inst:';
    document.getElementById('mfSwitchLbl').innerText = 'MFs:';
    document.getElementById('stagnantSwitchLbl').innerText = 'Stagnant:';
    document.getElementById('apesSwitchLbl').innerText = 'DRS:';
    document.getElementById('remainingLbl').innerText = 'Remaining:';
    document.getElementById('registeredLbl').innerText = 'Registered:';
  }
  
  // Handle diff b/w drsbot and scraper
  if (datasource === "drsbot") {
    stats.trimmed_average = stats.trimmed_average / stats.accts_per_ape;
    document.getElementById("acctsPerApe").innerHTML = stats.accts_per_ape.toLocaleString();
    document.getElementById('rollingWindow').classList.add("d-none");
    document.getElementById('chartsBtn').classList.add('d-none');
    document.getElementById('dataBtn').classList.add('d-none');
  } else {
    document.getElementById("acctsPerApe").remove();
    document.getElementById("acctsPerApeLabel").remove();
    document.getElementById('rollingWindow').classList.remove("d-none");
  }

  const donutData = await fetch("https://5o7q0683ig.execute-api.us-west-2.amazonaws.com/prod/computershared/dashboard?time=" + time, {
    mode: 'cors'
  }).then(function (response) {
    return response.json();
  });
  //subtract stagnant insiders
  donutData.insider -= donutData.stagnant;

  document.getElementById("asof").innerHTML = "Last Updated " + new Date(donutData.last_update).toDateString().toLocaleString();

  // Build donut
  updateDonutData(donutData, stats);
  var donut = buildDonut();

  function handleHoldingToggle() {
    let etfEnabled = document.getElementById("etfSwitch").checked;
    let mfEnabled = document.getElementById("mfSwitch").checked;
    let otherEnabled = document.getElementById("instOtherBtn").checked;
    let insiderEnabled = document.getElementById("insiderSwitch").checked;
    let stagnantEnabled = document.getElementById("stagnantSwitch").checked;
    let apeEnabled = document.getElementById("apesSwitch").checked;

    let etfObj = document.getElementById("donutDataEtfs");
    let mfsObj = document.getElementById("donutDataMfs");
    let otherObj = document.getElementById("donutDataInst");
    let insiderObj = document.getElementById("donutDataInsider");
    let stagnantObj = document.getElementById("donutDataStagnant");
    let apeObj = document.getElementById("donutDataApe");

    if (etfEnabled) {
      document.getElementById("ETF").classList.remove("text-muted");
      donutData.etfs = parseFloat(etfObj.innerHTML);
    } else {
      document.getElementById("ETF").classList.add("text-muted");
      donutData.etfs = 0;
    }

    if (mfEnabled) {
      document.getElementById("MF").classList.remove("text-muted");
      donutData.mfs = parseFloat(mfsObj.innerHTML);
    } else {
      document.getElementById("MF").classList.add("text-muted");
      donutData.mfs = 0;
    }

    if (otherEnabled) {
      document.getElementById("IO").classList.remove("text-muted");
      donutData.inst_fuckery = parseFloat(otherObj.innerHTML);
    } else {
      document.getElementById("IO").classList.add("text-muted");
      donutData.inst_fuckery = 0;
    }

    if (insiderEnabled) {
      document.getElementById("I").classList.remove("text-muted");
      donutData.insider = parseFloat(insiderObj.innerHTML);
    } else {
      document.getElementById("I").classList.add("text-muted");
      donutData.insider = 0;
      document.getElementById("IS").classList.add("text-muted");
      donutData.stagnant = 0;
    }

    if (stagnantEnabled) {
      document.getElementById("IS").classList.remove("text-muted");
      donutData.stagnant = parseFloat(stagnantObj.innerHTML);
    } else {
      document.getElementById("IS").classList.add("text-muted");
      donutData.stagnant = 0;
    }

    if (apeEnabled) {
      updateDonutData(donutData, stats);
      document.getElementById("R").classList.remove("text-muted");
      donutData.apeDrs = parseFloat(apeObj.innerHTML);
    } else {
      document.getElementById("R").classList.add("text-muted");
      donutData.apeDrs = 0;
    }

    updateDonutData(donutData, stats);
    updateDonut(donut, donutData);
  }

  document.getElementById("etfSwitch").addEventListener("change", handleHoldingToggle);
  document.getElementById("mfSwitch").addEventListener("change", handleHoldingToggle);
  document.getElementById("instOtherBtn").addEventListener("change", handleHoldingToggle);
  document.getElementById("insiderSwitch").addEventListener("change", handleHoldingToggle);
  document.getElementById("stagnantSwitch").addEventListener("change", handleHoldingToggle);
  document.getElementById("apesSwitch").addEventListener("change", handleHoldingToggle);

  // Setup the page
  document.getElementById("sampledAccounts").innerHTML = stats.sampled_accounts.toLocaleString() + " accounts";
  document.getElementById("identifiedShares").innerHTML = stats.sampled_shares.toLocaleString() + " shares";
  let sampleSize = (stats.sampled_accounts / donutData.computershare_accounts) * 100;
  document.getElementById("sampleSize").innerHTML = sampleSize.toLocaleString() + '%';
  document.getElementById("average").innerHTML = stats.average.toLocaleString() + " shares (" +
    stats.std_dev.toLocaleString() + " stdev)";

  document.getElementById("trimAvg").innerHTML = stats.trimmed_average.toLocaleString() + " shares";
  if ("trm_std_dev" in stats) {
    document.getElementById("trimAvg").innerHTML += " (" + stats.trm_std_dev.toLocaleString() + " stdev)";
  }
  document.getElementById("metricVal").innerHTML = 'x ' + stats.trimmed_average.toLocaleString();

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
        document.getElementById("metricLabel").innerHTML = 'Trimmed Average: ';
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
  
  document.getElementById("outstandingValue").innerHTML = localeFormat.format(donutData.total_outstanding);
  document.getElementById("insiderHolding").innerHTML = '- ' + localeFormat.format(donutData.insider);
  document.getElementById("insiderHoldingPct").innerHTML = '- ' + Math.round(donutData.insider / donutData.total_outstanding * 100) + '%';
  document.getElementById("stagnantHolding").innerHTML = '- ' + localeFormat.format(donutData.stagnant);
  document.getElementById("stagnantHoldingPct").innerHTML = '- ' + Math.round(donutData.stagnant / donutData.total_outstanding * 100) + '%';
  document.getElementById("institutionalETFs").innerHTML = '- ' + localeFormat.format(donutData.etfs);
  document.getElementById("institutionalETFsPct").innerHTML = '- ' + Math.round(donutData.etfs / donutData.total_outstanding * 100) + '%';
  document.getElementById("institutionalMFs").innerHTML = '- ' + localeFormat.format(donutData.mfs);
  document.getElementById("institutionalMFsPct").innerHTML = '- ' + Math.round(donutData.mfs / donutData.total_outstanding * 100) + '%';
  document.getElementById("institutionalOther").innerHTML = '- ' + localeFormat.format(donutData.inst_fuckery);
  document.getElementById("institutionalOtherPct").innerHTML = '- ' + Math.round(donutData.inst_fuckery / donutData.total_outstanding * 100) + '%';
  document.getElementById("apeDrs").innerHTML = '- ' + localeFormat.format(donutData.apeDrs);
  document.getElementById("apeDrsPct").innerHTML = '- ' + Math.round(donutData.apeDrs / donutData.total_outstanding * 100) + '%';
  document.getElementById("apeDrsTotal").innerHTML = donutData.apeDrs.toLocaleString();
  document.getElementById("remainingValue").innerHTML = localeFormat.format(donutData.remaining);
  document.getElementById("remainingValuePct").innerHTML = Math.round(donutData.remaining / donutData.total_outstanding * 100) + '%';

  document.getElementById("donutDataEtfs").innerHTML = donutData.etfs;
  document.getElementById("donutDataMfs").innerHTML = donutData.mfs;
  document.getElementById("donutDataInst").innerHTML = donutData.inst_fuckery;
  document.getElementById("donutDataInsider").innerHTML = donutData.insider;
  document.getElementById("donutDataStagnant").innerHTML = donutData.stagnant;
  document.getElementById("donutDataApe").innerHTML = donutData.apeDrs;

  // Animate the site
  document.getElementById("avgSelector").dispatchEvent(new Event('change'));
  await new Promise(r => setTimeout(r, 600));
  document.getElementById("mfSwitch").checked = true;
  document.getElementById("mfSwitch").dispatchEvent(new Event('change'));
  await new Promise(r => setTimeout(r, 600));
  document.getElementById("etfSwitch").checked = true;
  document.getElementById("etfSwitch").dispatchEvent(new Event('change'));
  await new Promise(r => setTimeout(r, 600));
  document.getElementById("insiderSwitch").checked = true;
  document.getElementById("insiderSwitch").dispatchEvent(new Event('change'));
  await new Promise(r => setTimeout(r, 600));
  document.getElementById("stagnantSwitch").checked = true;
  document.getElementById("stagnantSwitch").dispatchEvent(new Event('change'));
  await new Promise(r => setTimeout(r, 600));
  document.getElementById("apesSwitch").checked = true;
  document.getElementById("apesSwitch").dispatchEvent(new Event('change'));
  await new Promise(r => setTimeout(r, 600));
  showOutstanding = true;
  document.getElementById("instOtherBtn").checked = true;
  document.getElementById("instOtherBtn").dispatchEvent(new Event('change'));  
  await new Promise(r => setTimeout(r, 600));


  // let t = new bootstrap.Toast(document.getElementById("alertToast"));
  // var alerted = localStorage.getItem('hiring') || '';
  // if (alerted != "alerted") {
  //   t.show();
  //   localStorage.setItem("hiring", "alerted");

  // }
})()