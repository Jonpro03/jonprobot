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
    //let timestamp = element["ts"]["S"].replace("T", " ")+" UTC";
    let timestamp = convertUTCDateToLocalDate(new Date(element["ts"]["S"])).toLocaleString();
    //let timestamp = new Date(element["ts"]["S"]).toLocaleTimeString('en-US', {timeZone: 'UTC'}) + " " + new Date(element["ts"]["S"]).toLocaleDateString();
    row.insertCell().appendChild(document.createTextNode(timestamp));
    let url = element["urls"]["L"][0]["S"];
    row.insertCell().appendChild(document.createTextNode(url));
  }
}

const outstandingFloat = 75900000;
const insiderOwnership = 12700000;

(async function () {
  'use strict'

  var resultSet = await fetch("https://5o7q0683ig.execute-api.us-west-2.amazonaws.com/prod/computershared/results", {
    mode: 'cors'
  }).then(function(response) {
    return response.json();
  });

  let records = resultSet.Items;

  records.sort(function(a, b) {
    var keyA = new Date(a["ts"]["S"]),
    keyB = new Date(b["ts"]["S"]);
    if (keyA < keyB) return 1;
    else return -1;
  });

  var tableBody = document.getElementById("resultsTableBody");
  generateTable(tableBody, records);

})()

$('#resultsTable').dynatable();
