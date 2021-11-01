/* globals Chart:false, feather:false */
function convertUTCDateToLocalDate(date) {
  var newDate = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
  var offset = date.getTimezoneOffset() / 60;
  var hours = date.getHours();
  newDate.setHours(hours - offset);
  return newDate;
}


(async function () {
  'use strict'
  feather.replace({ 'aria-hidden': 'true' })
  var resultSet = await fetch("https://5o7q0683ig.execute-api.us-west-2.amazonaws.com/prod/computershared/results", {
    mode: 'cors'
  }).then(function (response) {
    return response.json();
  });

  let records = resultSet.Items;

  records.sort(function(a, b) {
    var keyA = new Date(a["ts"]["S"]),
    keyB = new Date(b["ts"]["S"]);
    if (keyA < keyB) return 1;
    else return -1;
  });

  records.sort(function (a, b) {
    var keyA = parseFloat(a["shares"]["N"]),
      keyB = parseFloat(b["shares"]["N"]);
    if (keyA < keyB) return 1;
    else return -1;
  });

  var tableBody = document.getElementById("resultsTableBody");
  generateTable(tableBody, records);

  var table = document.getElementById("resultsTable");
  table.setAttribute("data-toggle","table");

})()

