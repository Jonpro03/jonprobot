(async function() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const code = urlParams.get('code');
  if (code === null || code === '') {
    window.location.href = "../";
    return;
  }

  const authUrl = "https://www.reddit.com/api/v1/access_token";
  const authData = {
    grant_type: 'authorization_code',
    code: code,
    //redirect_uri: 'https://www.computershared.net/auth/'
    redirect_uri: 'http://localhost:8000/auth/'
  };

  await fetch(authUrl, {
    mode: 'cors',
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      //"Authorization": "Basic " + btoa("LrM_myAk3YroaMWFpCFWhA:")
      "Authorization": "Basic " + btoa("mqzxaOP_1APeh86Mke_WWg:BKNr14VM9sLmG0VOLjHAnACKSRJ5Aw")
    }, 
    body: new URLSearchParams(authData)
  }).then( async res => {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1);
    const token = await res.json();
    localStorage.setItem('redditBearer', token['access_token']);
    localStorage.setItem('authExpiry', expiry.getTime())
    window.location.href = "../profile/";
  }).catch((error) => 
  {
    window.location.href = "../";
  });

})()