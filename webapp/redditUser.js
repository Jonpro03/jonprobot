function authReddit() {
  // dev window.location.href = "https://www.reddit.com/api/v1/authorize?client_id=mqzxaOP_1APeh86Mke_WWg&response_type=code&state=d14m0nDhAnD5&redirect_uri=http://localhost:8000/auth/&duration=temporary&scope=identity";
  window.location.href = "https://www.reddit.com/api/v1/authorize?client_id=LrM_myAk3YroaMWFpCFWhA&response_type=code&state=d14m0nDhAnD5&redirect_uri=https://www.computershared.net/auth/&duration=temporary&scope=identity";
}

function activateLoginBtn() {
  document.getElementById('authRedditBtn').classList.remove('d-none');
  localStorage.removeItem('redditUser');
  localStorage.removeItem('redditBearer');
}

function deactivateLoginBtn() {
  document.getElementById('authRedditBtn').classList.add('d-none');
}

function showHideLoginBtn() {
  const exp = localStorage.getItem('authExpiry');
  if (exp !== null) {
    const msToExpiry = parseInt(exp) - new Date().getTime();
    if (msToExpiry <= 0) {
      activateLoginBtn();
    } else {
      deactivateLoginBtn();
      setTimeout(activateLoginBtn, msToExpiry);
    }
  } else {
    activateLoginBtn();
  }
}

(function () {
  // if (localStorage.getItem("mintTest") === null)
  // {
  //   return;
  // }
  const h = document.getElementById("pageHeader");
  const btnElm = document.createElement("button");
  btnElm.classList.add('btn', 'btn-outline-secondary', 'd-none');
  btnElm.id = 'authRedditBtn';
  btnElm.type = 'button';
  btnElm.onclick = function() {
    authReddit();
  }
  const node = document.createElement("i")
  node.classList.add('fas', 'fa-lock');
  node.innerText = " Login";
  btnElm.appendChild(node);
  h.appendChild(btnElm);
  showHideLoginBtn();
})();
