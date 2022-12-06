function authReddit() {
  window.location.href = "https://www.reddit.com/api/v1/authorize?client_id=mqzxaOP_1APeh86Mke_WWg&response_type=code&state=d14m0nDhAnD5&redirect_uri=http://localhost:8000/auth/&duration=temporary&scope=identity";
  //window.location.href = "https://www.reddit.com/api/v1/authorize?client_id=LrM_myAk3YroaMWFpCFWhA&response_type=code&state=d14m0nDhAnD5&redirect_uri=https://www.computershared.net/auth/&duration=temporary&scope=identity";
}

function activateLoginBtn() {
  localStorage.removeItem('redditUser');
  localStorage.removeItem('redditBearer');
}

function deactivateLoginBtn() {
  document.getElementById('authRedditBtn').setAttribute('disabled', "");
  document.getElementById('authRedditBtn').childNodes[0].innerHTML = " &nbsp; Authenticated successfully!";
}

function showHideLoginBtn() {
  const exp = localStorage.getItem('authExpiry');
  if (exp !== null) {
    const msToExpiry = parseInt(exp) - new Date().getTime();
    if (msToExpiry <= 0) {
      activateLoginBtn();
      return false;
    } else {
      deactivateLoginBtn();
      setTimeout(activateLoginBtn, msToExpiry);
      return true;
    }
  } else {
    activateLoginBtn();
    return false;
  }
}

// (function () {

//   const h = document.getElementById("pageContent");
//   const btnElm = document.createElement("button");
//   btnElm.classList.add('btn', 'btn-success', 'btn-lg');
//   btnElm.id = 'authRedditBtn';
//   btnElm.type = 'button';
//   btnElm.onclick = function() {
//     authReddit();
//   }
//   const node = document.createElement("i")
//   node.classList.add('fab', 'fa-reddit-alien');
//   node.innerHTML = " &nbsp; Authenticate with Reddit";
//   btnElm.appendChild(node);
//   h.appendChild(btnElm);
//   let loggedIn = showHideLoginBtn();
//   if (loggedIn) {window.location.href = "/profile/"}
// })();
