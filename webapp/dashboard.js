/* globals Chart:false, feather:false */
function convertUTCDateToLocalDate(date) {
  var newDate = new Date(date.getTime()+date.getTimezoneOffset()*60*1000);
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
    let timestamp = element["ts"]["S"].replace("T", " ")+" UTC";
    //let timestamp = convertUTCDateToLocalDate(new Date(element["ts"]["S"])).toLocaleString();
    //let timestamp = new Date(element["ts"]["S"]).toLocaleTimeString('en-US', {timeZone: 'UTC'}) + " " + new Date(element["ts"]["S"]).toLocaleDateString();
    row.insertCell().appendChild(document.createTextNode(timestamp));
    let url = element["urls"]["L"][0]["S"];
    row.insertCell().appendChild(document.createTextNode(url));
  }
}

const outstandingFloat = 75900000;
const insiderOwnership = 12700000;
const institutional = 23160000;

(async function () {
  'use strict'

  feather.replace({ 'aria-hidden': 'true' })

  var status = await fetch("https://5o7q0683ig.execute-api.us-west-2.amazonaws.com/prod/computershared/status", {
    mode: 'cors'
  }).then(function(response) {
    return response.json();
  });
  let registered = status.average * status.total_accounts;
  let unregistered = outstandingFloat - insiderOwnership - institutional - registered;

  // Graphs
  var lockerCtx = document.getElementById('shareLocker');
  var shareLockerChart = new Chart(lockerCtx, {
    type: 'doughnut',
    data: {
      labels: ['Institutional Shares', 'Insider Owned', 'Ape DRS', 'Fuckery, probably'],
      datasets: [{
        label: "shares",
        data: [institutional, insiderOwnership, registered, unregistered],
        backgroundColor: ["#13A9AD", "#A3962F", "#93186c", "#000000"]
      }]
    },
  });

  var ctx = document.getElementById('myChart')
  var myChart = new Chart(ctx, {
    type: 'line',
    label: "ohai",
    data: {
      labels: Object.keys(status.account_avg_over_time),
      datasets: [{
        data: Object.values(status.account_avg_over_time),
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
  })

  var totalAcctsCtx = document.getElementById('totalAcctsChart')
  var totalAcctsChart = new Chart(totalAcctsCtx, {
    type: 'line',
    label: "ohai",
    data: {
      labels: Object.keys(status.total_samples_over_time),
      datasets: [{
        data: Object.values(status.total_samples_over_time),
        label: "Total Sampled Computershare Account",
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
  })

  var resultSet = await fetch("https://5o7q0683ig.execute-api.us-west-2.amazonaws.com/prod/computershared/results", {
    mode: 'cors'
  }).then(function(response) {
    return response.json();
  });

  let records = resultSet.Items;

  // records.sort(function(a, b) {
  //   var keyA = new Date(a["ts"]["S"]),
  //   keyB = new Date(b["ts"]["S"]);
  //   if (keyA < keyB) return 1;
  //   else return -1;
  // });

  records.sort(function(a, b) {
    var keyA = parseFloat(a["shares"]["N"]),
    keyB = parseFloat(b["shares"]["N"]);
    if (keyA < keyB) return 1;
    else return -1;
  });

  var tableBody = document.getElementById("resultsTableBody");
  generateTable(tableBody, records);

  document.getElementById("sampledAccounts").innerHTML = status.sampled_accounts.toLocaleString();
  document.getElementById("identifiedShares").innerHTML = status.sampled_shares.toLocaleString();
  let sampleSize = (status.sampled_accounts / status.total_accounts) * 100;
  document.getElementById("sampleSize").innerHTML = sampleSize.toLocaleString() + '%';
  document.getElementById("average").innerHTML = status.average.toLocaleString();
  let floatPercent = (registered / (outstandingFloat - insiderOwnership - institutional)) * 100;
  document.getElementById("floatLocker").innerHTML = floatPercent.toLocaleString() + '%';
  document.getElementById("stdDev").innerHTML = status.std_dev.toLocaleString();
  document.getElementById("highScore").innerHTML = status.total_accounts.toLocaleString();
  
})()
