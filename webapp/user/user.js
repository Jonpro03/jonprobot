/* globals Chart:false, feather:false */

function handleApeNotFound(ape) {

}

function getPostHTML(posts) {
  let postsDiv = document.createElement('div');
  for (const post of posts) {
    let imgFile = post.image_path.S.split('/').slice(-1)[0];
    const docTemplate = document.getElementById("postTemplate");
    const postDiv = document.importNode(docTemplate.content, true);
    postDiv.querySelector('.postImage').textContent = "https://s3-us-west-2.amazonaws.com/computershared-reddit-images/" + imgFile;
    postDiv.querySelector('.postImage').textContent = "https://s3-us-west-2.amazonaws.com/computershared-reddit-images/" + imgFile;
    postsDiv.appendChild(postDiv); 
  }
  return postsDiv;
}

(async function () {
  'use strict'
  feather.replace({ 'aria-hidden': 'true' })

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
  const displayName = redditData.data.subreddit.title;
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

