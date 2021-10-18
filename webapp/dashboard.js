/* globals Chart:false, feather:false */
function generateTable(table, data) {
  for (let element of data) {
    let row = table.insertRow();
    let shares = element["shares"]["N"];
    row.insertCell().appendChild(document.createTextNode(shares.toLocaleString()));
    let u = element["u"]["S"];
    row.insertCell().appendChild(document.createTextNode(u));
    let timestamp = element["ts"]["S"].replace("T", " ")+" UTC";
    row.insertCell().appendChild(document.createTextNode(timestamp));
    let url = element["urls"]["L"][0]["S"];
    row.insertCell().appendChild(document.createTextNode(url));
  }
}

const outstandingFloat = 75900000;
const insiderOwnership = 12700000;

(async function () {
  'use strict'

  feather.replace({ 'aria-hidden': 'true' })

  var status = await fetch("https://5o7q0683ig.execute-api.us-west-2.amazonaws.com/prod/computershared/status", {
    mode: 'cors'
  }).then(function(response) {
    return response.json();
  });
  let registered = status.average * status.total_accounts;
  let unregistered = outstandingFloat - insiderOwnership - registered;

  // Graphs
  var lockerCtx = document.getElementById('shareLocker');
  var shareLockerChart = new Chart(lockerCtx, {
    type: 'doughnut',
    data: {
      labels: ['Insider Owned', 'Ape DRS', 'Fuckery, probably'],
      datasets: [{
        label: "shares",
        data: [insiderOwnership, registered, unregistered],
        backgroundColor: ["#A3962F", "#93186c", "#000000"]
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

  var tableBody = document.getElementById("resultsTableBody");
  generateTable(tableBody, resultSet.Items);

  document.getElementById("sampledAccounts").innerHTML = status.sampled_accounts.toLocaleString();
  document.getElementById("identifiedShares").innerHTML = status.sampled_shares.toLocaleString();
  let sampleSize = (status.sampled_accounts / outstandingFloat) * 100;
  document.getElementById("sampleSize").innerHTML = sampleSize.toLocaleString() + '%';
  document.getElementById("average").innerHTML = status.average.toLocaleString();
  let floatPercent = (registered / unregistered) * 100;
  document.getElementById("floatLocker").innerHTML = floatPercent.toLocaleString() + '%';
  document.getElementById("stdDev").innerHTML = status.std_dev.toLocaleString();
  document.getElementById("highScore").innerHTML = status.total_accounts.toLocaleString();
  
})()
