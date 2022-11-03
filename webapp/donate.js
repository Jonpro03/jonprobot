(async function() {
  const f = document.getElementById("footerRow");

  const donateTitle = document.createElement('p');
  donateTitle.classList.add('text-muted');
  donateTitle.textContent = "Want to buy me a coffee on Ethereum Layer2?"
  f.appendChild(donateTitle);
  
  
  const lrw = document.createElement('p');
  lrw.classList.add('text-muted');
  lrw.textContent = "Loopring Wallet: ";
  const lrwl = document.createElement('span');
  lrwl.setAttribute('data-bs-toggle', 'popover');
  lrwl.setAttribute('data-bs-content', 'Copied!');
  lrwl.id = 'lrWallet';
  const lrwlt = document.createElement('b');
  lrwlt.textContent = "jonpro03.loopring.eth"
  lrwl.appendChild(lrwlt);
  lrw.appendChild(lrwl);
  f.appendChild(lrw);
  
  const gsw = document.createElement('p');
  gsw.classList.add('text-muted');
  gsw.textContent = "Gamestop Wallet: ";
  const gswl = document.createElement('span');
  gswl.setAttribute('data-bs-toggle', 'popover');
  gswl.setAttribute('data-bs-content', 'Copied!');
  gswl.id = 'gsWallet';
  const gswlt = document.createElement('b');
  gswlt.textContent = "jonpro03.eth"
  gswl.appendChild(gswlt);
  gsw.appendChild(gswl);
  f.appendChild(gsw);

  document.getElementById("gsWallet").onclick = function () { 
    navigator.clipboard.writeText("jonpro03.eth");
  };

  document.getElementById("lrWallet").onclick = function () { 
    navigator.clipboard.writeText("jonpro03.loopring.eth");
  };

  var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
  var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl)
  });
})();

// document.getElementById("easterEgg").onclick = function () { window.location.href = "https://www.reddit.com/user/jonpro03/comments/xdq22u/happy_birthday_computersharednet_it_was_1_year/"; }