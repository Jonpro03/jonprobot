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
  var resume = null;

  for await (const sub of subs) {
    var sub_url = baseUrl + "&sub=" + sub;
    while (true) {
      if (resume !== null) {
        var url = sub_url + "&resumeUser=" + resume['user'] + "&resumeId=" + resume['id'];
      } else {
        url = sub_url;
      }

      let response = await fetch(url, {
        mode: 'cors'
      }).then(function (response) {
        return response.json();
      });

      data = data.concat(response['Items']);
      if ("LastEvaluatedKey" in response) {
        resume = {
          'user': response['LastEvaluatedKey']['u']['S'],
          'id': response['LastEvaluatedKey']['id']['S']
        };
      } else {
        resume = null;
        break;
      }
    }

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

  const yesterday = new Date();
  var startTime = new Date(Date.UTC(yesterday.getYear() + 1900, yesterday.getMonth(), yesterday.getDate()-1)).getTime() / 1000;
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
  });
}

document.getElementById('postsTableBtn').addEventListener('click', async () => {
  new bootstrap.Modal(document.getElementById('tableModal')).show();
  await build24Table();
  
});