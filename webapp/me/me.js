/* globals Chart:false, feather:false */

function getPostHTML(posts) {
  let sadApes = ["sadape.jpg", "sadape2.jpg", "sadape3.jpg", "sadape4.jpg"]
  let postsDiv = document.createElement('div');
  postsDiv.classList.add("row");
  for (const post of posts) {
    let randApeImg = sadApes[Math.floor(Math.random() * 4)];
    let imgFile = post.image_path.S.split('/').slice(-1)[0];
    const docTemplate = document.getElementById("postTemplate");
    const postDiv = document.importNode(docTemplate.content, true);
    imgFile = imgFile === "" ? randApeImg : imgFile;
    postDiv.querySelector('.postImage').src = "https://s3-us-west-2.amazonaws.com/computershared-reddit-images/" + imgFile;
    postDiv.querySelector('.link').href = post.url.S;
    postDiv.querySelector('.link').textContent = post.url.S;
    postDiv.querySelector('.imgText').textContent = post.image_text.S;
    postDiv.querySelector('.shares').textContent = parseFloat(post.shares.N).toFixed(2).toLocaleString() + " shares";
    postDiv.querySelector('.timestamp').textContent = new Date(parseInt(post.timestamp.N)*1000).toDateString().toLocaleString();
    postDiv.querySelector('#mintBtn').setAttribute('href',"../mint/?postId=" + post.id.S);
    postsDiv.appendChild(postDiv); 
  }
  return postsDiv;
}

async function getUserFromReddit() {
  const meUrl = "https://oauth.reddit.com/api/v1/me";
  const bearer = localStorage.getItem("redditBearer");
  if (bearer === "undefined")
  {
    localStorage.removeItem('redditBearer');
    localStorage.removeItem('authExpiry');
    window.location.href = "../";
    return;
  }
  const headers = {
    "Authorization": "bearer " + localStorage.getItem("redditBearer")
  };
  var name = await fetch(meUrl, {
    mode: 'cors',
    headers: headers
  }).then(async function (response) {
    const resJson = await response.json();
    localStorage.setItem('redditUser', resJson['name']);
    return resJson['name'];
  }).catch((error) => window.location.href = "../");

  return name;
}



(async function () {
  'use strict'
  feather.replace({ 'aria-hidden': 'true' })
  
  localStorage.removeItem('redditUser');
  const ape = await getUserFromReddit();
  if (localStorage.getItem('redditUser') === null) {
    window.location.href = "../";
  }

  document.getElementById("gsWallet").onclick = function () { 
    navigator.clipboard.writeText("0x82E62Ad9EC7186299059C65194FF0B817CeD2e33");
  };

  document.getElementById("lrWallet").onclick = function () { 
    navigator.clipboard.writeText("jonpro03.loopring.eth");
  };
  

  var redditData = await fetch("https://www.reddit.com/user/"+ ape + "/about.json", {
    mode: 'cors'
  }).then(function (response) {
    return response.json();
  });

  const u = redditData.data.name;
  const displayName = redditData.data.subreddit.title === "" ? redditData.data.subreddit.display_name_prefixed : redditData.data.subreddit.title;
  document.getElementById('usernameTitle').innerHTML = "Welcome " + ape + "!";

  var userData = await fetch("https://5o7q0683ig.execute-api.us-west-2.amazonaws.com/prod/computershared/posts/"+ u, {
    mode: 'cors'
  }).then(function (response) {
    return response.json();
  });

  let records = [];
  if (userData.Count == 1){
    records.push(userData.Items[0]);
  } else {
    records = userData.Items;
  }

  let posts = getPostHTML(records);

  document.getElementById('postsContainer').appendChild(posts);

})()

