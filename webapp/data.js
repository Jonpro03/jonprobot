var subs = [
  "GME",
  "Superstonk",
  "GMEJungle",
  "DDintoGME",
  "GME_Computershare",
  "infinitypool",
  "Spielstopp",
  "DRSyourGME",
  "GMECanada",
  "GMEOrphans"
];

async function getPostsData(startTime) {
  var baseUrl = "https://5o7q0683ig.execute-api.us-west-2.amazonaws.com/prod/computershared/posts?startTime=" + startTime;

  var data = [];

  for await (const sub of subs) {
    let resume
    do {
      let url =
        baseUrl
        + "&sub="+sub
        + (resume ? `&resumeUser=${resume.user}&resumeId=${resume.id}` : '' );

      let rawResponse = await fetch(url, {
        mode: 'cors'
      });
      let response = await rawResponse.json();

      data = data.concat(response.Items);

      resume = response.LastEvaluatedKey && {
        user: response.LastEvaluatedKey.u.S,
        id: response.LastEvaluatedKey.id.S
      };
    } while (resume)
  };
  return data;
}

async function build24Table() {
  document.getElementById('tableModalTitle').innerText = "Recently Scraped Reddit Posts";
  var columns = ['SubReddit', 'Link', 'Image Type', 'Shares', 'Portfolio Delta', '# of Accounts', 'Acct Number'];
  var columnIndexes = ['sub', 'url', 'post_type', 'shares', 'delta', 'num_accounts', 'acct_num'];
  var header = document.getElementById('tableHeaderRows');
  columns.forEach(column => {
    var c = document.createElement('th');
    c.setAttribute('scope', "col");
    c.innerText = column;
    header.appendChild(c);
  });

  // const yesterday = new Date();
  // var startTime = new Date(Date.UTC(yesterday.getYear() + 1900, yesterday.getMonth(), yesterday.getDate()-1)).getTime() / 1000;
  // ^ the above looks like it might not work on the first of the month?
  const startTime = parseInt(Date.now() / 1000) - 24*60*60;
  // ^ Date.now returns the current epoch in milliseconds, so we can just take that, convert to seconds, and subtract 24 hours worth of seconds from it

  var postData = await getPostsData(startTime);
  console.log(startTime);

  var body = document.getElementById("tableBody");
  postData.forEach(rowData => {
    var row = document.createElement("tr");
    columnIndexes.forEach(ci => {
      var cell = document.createElement('td');
      var dat = rowData[ci] ?? {'S': ""};
      if (ci === 'url') {
        cell.innerHTML = `<a target="_blank" href="${dat['S']}">${dat['S']}</a>`
      } else {
        cell.innerText = dat['S'] ?? Math.round(dat['N']*100)/100 ?? "";
      }
      row.appendChild(cell);
    });
    body.appendChild(row);
    //^ Note: appending one-by-one to an element that is currently in the document may be slower than building up a DOM fragment
    // outside of the document then adding it into the document in a single step. If there are a lot of rows or this is slow, could be an
    // opportunity to speed it up
  });
}

document.getElementById('postsTableBtn').addEventListener('click', async () => {
  document.getElementById("tableBody").innerHTML = "";
  document.getElementById('tableHeaderRows').innerHTML = "";

  new bootstrap.Modal(document.getElementById('tableModal')).show();
  await build24Table();
});
