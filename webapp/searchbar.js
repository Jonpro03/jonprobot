(async function() {
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
})()