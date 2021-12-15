/* globals Chart:false, feather:false */

function handleApeNotFound(ape) {

}

function getPostHTML(posts) {
  let sadApes = ["sadape.jpg", "sadape2.jpg", "sadape3.jpg", "sadape4.jpg"]
  let postsDiv = document.createElement('div');
  for (const post of posts) {
    let randApeImg = sadApes[Math.floor(Math.random() * 4)];
    let imgFile = post.image_path.S.split('/').slice(-1)[0];
    const docTemplate = document.getElementById("postTemplate");
    const postDiv = document.importNode(docTemplate.content, true);
    imgFile = imgFile === "" ? randApeImg : imgFile;
    postDiv.querySelector('.postImage').src = "https://s3-us-west-2.amazonaws.com/computershared-reddit-images/" + imgFile;
    postDiv.querySelector('.link').href = post.url.S;
    postDiv.querySelector('.imgText').textContent = post.image_text.S;
    postDiv.querySelector('.shares').textContent = parseFloat(post.shares.N).toFixed(2).toLocaleString() + " shares";
    postDiv.querySelector('.timestamp').textContent = new Date(parseInt(post.timestamp.N)*1000).toDateString().toLocaleString();
    postsDiv.appendChild(postDiv); 
  }
  return postsDiv;
}

function handleApeNotFound() {
  window.alert("Not Found.");
  window.history.back();
}

(async function () {
  'use strict'
  feather.replace({ 'aria-hidden': 'true' })

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
        window.location.href = "https://www.computershared.net/user/index.html?ape=" + redditData.data.name;
      }
    }
  }

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  let ape = urlParams.get("ape");
  if (ape === null) {
    handleApeNotFound(ape);
    return;
  }

  var redditData = await fetch("https://www.reddit.com/user/"+ ape + "/about.json", {
    mode: 'cors'
  }).then(function (response) {
    return response.json();
  });

  if ('error' in redditData){
    handleApeNotFound(ape);
    return;
  }

  const u = redditData.data.name;
  const displayName = redditData.data.subreddit.title === "" ? redditData.data.subreddit.display_name_prefixed : redditData.data.subreddit.title;
  document.getElementById('usernameTitle').innerHTML = "Reddit Username: " + displayName;

  var userData = await fetch("https://5o7q0683ig.execute-api.us-west-2.amazonaws.com/prod/computershared/posts/"+ u, {
    mode: 'cors'
  }).then(function (response) {
    return response.json();
  });

  if (userData.Count === 0) {
    handleApeNotFound(ape);
    return;
  }

  let records = [];
  if (userData.Count == 1){
    records.push(userData.Items[0]);
  } else {
    records = userData.Items;
  }

  let posts = getPostHTML(records);

  document.getElementById('postsContainer').appendChild(posts);

})()

