showHelpModal = function (articleName) {
  let helpModalTitle = document.getElementById("helpModalTitle");
  let helpModalBody = document.getElementById("helpModalBody");

  switch (articleName) {
    case "estimates":
      helpModalTitle.innerHTML = "DRS Estimate Line Chart";
      helpModalBody.innerHTML = `<p>
      This chart shows how many shares are estimated to have been direct-registered over time.
      <img src="site-images/estimates.png?a=204" class="card-img-top" alt="estimates chart">
      <strong>X-Axis:</strong> Date
      </br>
      <strong>Y-Axis:</strong> Share Count
      </p>
      <p>
      By default, estimates using the Sampled Data 
      <a target="_blank" href="https://en.wikipedia.org/wiki/Arithmetic_mean">Average</a> (Purple),  
      as well as actual progress as reported by Gamestop (White).
      </br>
      Not shown is Sampled Data 
      <a target="_blank" href="https://en.wikipedia.org/wiki/Average#Mode">Mode</a> (Dark Cyan), 
      <a target="_blank" href="https://en.wikipedia.org/wiki/Truncated_mean">Trimmed Average</a> (Cyan) 
      and <a target="_blank" href="https://en.wikipedia.org/wiki/Average#Median">Median</a> (Yellow) are shown,
      but can be enabled by clicking it in the top legend.
      <div class="ratio ratio-4x3">
        <video autoplay playsinline webkit-playsinline loop class="embed-responsive-item" src="site-images/estimates.mp4?a=204" type="video/mp4"></video>
      </div>
      </p>
      <p>
      This chart is zoomed in to fit your device's screen. Zoom with mousewheel or pinching. Scroll by dragging left or right.
      </p>
      `;
      break;

    case "shares":
      helpModalTitle.innerHTML = "Sampled Shares Line/Bar Chart";
      helpModalBody.innerHTML = `<p>
      This chart illustrates data collected from the Reddit Sample Set. Keep in mind that this only shows
      data that has been sampled from Reddit, and does not represent all Computershare Accounts.
      <img src="site-images/shares.png?a=204" class="card-img-top" alt="shares chart">
      <strong>X-Axis:</strong> Date
      </br>
      <strong>Left Y-Axis:</strong> Cumulative Share Count
      </br>
      <strong>Right Y-Axis:</strong> Daily Share Count
      </p>
      <p>
      The Cyan Line tracks the total number of Shares sampled over time, and it's axis values are on the left of the chart.
      </br>
      The Purple Lines illustrate the number of Shares sampled from new Computershare Accounts.
      </br>
      The Yellow Lines (stacked on top) illustrate the number of Shares that have been added to existing Computershare Accounts.
      </br>
      These data points can be viewed individually by toggling them in the chart's top legend.
      <img src="site-images/shares2.png?a=204" class="card-img-top" alt="shares chart">
      </p>
      <p>
      This chart is zoomed in to fit your device's screen. Zoom with mousewheel or pinching. Scroll by dragging left or right.
      </p>
      `;
      break;

    case "highscores":
      helpModalTitle.innerHTML = "Computershare Account Numbers Line/Scatter Chart";
      helpModalBody.innerHTML = `<p>
      This chart illustrates data collected from the Reddit Sample Set. Keep in mind that this only shows
      data that has been sampled from Reddit, and does not represent all Computershare Accounts.
      <img src="site-images/highscores.png?a=204" class="card-img-top" alt="highscores chart">
      <strong>X-Axis:</strong> Date
      </br>
      <strong>Y-Axis:</strong> Number of Accounts Derived from Account Number
      </p>
      <p>
      The Yellow Line tracks the highest Computershare Account Number over time. 
      On days which the data is unavailable, the previous day's number is used.
      </p>
      <p>
      The Purple Dots illustrate Computershare Account Numbers seen by the Reddit Scraper over time.
      </p>
      These data points can be viewed individually by toggling them in the chart's top legend.
      </p>
      `;
      break;

    case "statistics":
      helpModalTitle.innerHTML = "Statistics Line Chart";
      helpModalBody.innerHTML = `<p>
      This chart shows various statistics of the Reddit Sample Set over time.
      
      <img src="site-images/stats.png?a=204" class="card-img-top" alt="statistics chart">
      <strong>X-Axis:</strong> Date
      </br>
      <strong>Y-Axis:</strong> Share Count
      </p>
      <p>
      By default, the chart shows
      <a target="_blank" href="https://en.wikipedia.org/wiki/Arithmetic_mean">Average</a> (Purple), 
      <a target="_blank" href="https://en.wikipedia.org/wiki/Truncated_mean">Trimmed Average</a> (Cyan) 
      and <a target="_blank" href="https://en.wikipedia.org/wiki/Average#Median">Median</a> (Yellow) are shown, 
      as well as actual progress as reported by Gamestop (White).
      </p>
      <p>
      Statistics utilize a 
      <a target="_blank" href="https://www.mathworks.com/help/econ/rolling-window-estimation-of-state-space-models.html">rolling window</a> 
      of 180 days. Accounts which have not shared an update to Reddit in the last
      180 days are no longer utilized to make estimations as the data is considered stale.
      </p>
      <p>
      Not shown is Sample Set
      <a target="_blank" href="https://en.wikipedia.org/wiki/Average#Mode">Mode</a> (Dark Cyan), 
      <a target="_blank" href="https://en.wikipedia.org/wiki/Standard_deviation">Standard Deviation of the Whole Sample</a> (Dark Green), 
      <a target="_blank" href="https://en.wikipedia.org/wiki/Standard_deviation">Standard Deviation of the Trimmed Sample</a> (Green), 
      </br>These can be enabled by clicking it in the top legend.
      </p>
      <p>
      This chart is zoomed in to fit your device's screen. Zoom with mousewheel or pinching. Scroll by dragging left or right.
      </p>
      `;
      break;

    case "distribution":
      helpModalTitle.innerHTML = "Distribution Histogram Chart";
      helpModalBody.innerHTML = `<p>
      This chart plots a 
      <a target="_blank" href="https://en.wikipedia.org/wiki/Histogram">histogram</a> 
      of individual account balances over a 
      <a target="_blank" href="https://en.wikipedia.org/wiki/Geometric_progression">geometric progression</a> distribution.
      <img src="site-images/distribution.png?a=204" class="card-img-top" alt="histogram chart">
      <strong>X-Axis:</strong> Number of Shares
      </br>
      <strong>Y-Axis:</strong> Number of Accounts
      </p>
      <p>
      A given sample on the chart indicates the number of sampled accounts that have a minimum of <strong>X</strong> number of shares,
      but have no more than <strong>X&times;2</strong> shares.
      </p>
      <p>
      <h3>Example</h3>
      <p>In the following image, there are 2205 accounts with at least 128 shares, but fewer than 256 shares.
      <img src="site-images/distribution2.png?a=204" class="card-img-top" alt="histogram chart">
      </p>
      `;
      break;

    case "growth":
      helpModalTitle.innerHTML = "Account Growth Line Chart";
      helpModalBody.innerHTML = `<p>
      This chart plots how existing (sampled) Computershare Accounts have changed over time.
      <img src="site-images/growth.png?a=204" class="card-img-top" alt="growth chart">
      <strong>X-Axis:</strong> Week Beginning Date
      </br>
      <strong>Y-Axis:</strong> Percent Accounts Grew
      </p>
      <p>
      The percentages represent all computershare accounts that have been sampled on Reddit, 
      even those that have had no change in a given week, or have fallen outside of the 180-day rolling window.
      </p>
      `;
      break;

    case "power":
      helpModalTitle.innerHTML = "Purchase Power USD/Week Line Chart";
      helpModalBody.innerHTML = `<p>
      This chart estimates the ability of the sample to register new shares.
      <img src="site-images/power.png?a=204" class="card-img-top" alt="purchase power chart">
      <strong>X-Axis:</strong> Week Beginning Date
      </br>
      <strong>Y-Axis:</strong> Median Purchasing Power in USD/week.
      </p>
      <p>
      Purchase Power is derived from median number of shares in sampled Computershare Accounts, 
      multiplied by a standard cost basis of $37.50 and divided by the age of that account.
      </br>
      <strong>Example:</strong> If an account purchased $1000 worth of stock, and after 4 weeks
      have made no additional purchases, the purchase power is $250/week. After 5 weeks, it becomes $200/week.
      </br>
      The cost basis of Computershare Accounts is largely unknown, so results are calculated with a arbitrary
      cost basis of $37.50.
      </p>
      <p>
      Only accounts that fall inside the 180-day
      <a target="_blank" href="https://www.mathworks.com/help/econ/rolling-window-estimation-of-state-space-models.html">rolling window</a>
      are used in this calculation.
      Top and Bottom 5% of accounts are 
      <a target="_blank" href="https://en.wikipedia.org/wiki/Truncated_mean">trimmed</a>,
      and the median result is computed at the end of every week.
      </p>
      At a later date, this graph may update with purchase power in units of stock.
      `;
      break;

    case "calculator":
      helpModalTitle.innerHTML = "Calculator and Shares Donut";
      helpModalBody.innerHTML = `<p>
      Fundamentally, computershared.net is a calculator that can be used to estimate retail's progress in direct-registering Gamestop shares with the company's registrar, Computershare.
      </p>
      <h3>Estimating</h3>
      <p>
      Every 15 minutes, Computershared.net's Reddit Scraper downloads every post from a variety of subreddits. It uses computervision to extract the text from the image,
      identifies images that are screenshots of Computershare portfolios, and extracts the number of shares in that account.
      </br>
      Only accounts that have been updated in the last 180 days are used by computershared.net, collectively called the <strong>Sample Set</strong>.
      </br>
      </p>
      <p>
      Additionally, the scraper looks for computershare account numbers, which are incremental and can be multiplied with metrics of the sample set
      to estimate total shares registered, as illustrated in the <strong>DRS Estimation</strong> section:
      <div class="ratio ratio-4x3">
        <video autoplay playsinline webkit-playsinline loop class="embed-responsive-item" src="site-images/metric.mp4?a=204" type="video/mp4"></video>
      </div>
      Computershared.net enables you to estimate the total using <strong>Average</strong> (Mean), <strong>Median</strong>, <strong>Mode</strong>, and <strong>Trimmed Average</strong>.
      </br>
      <strong>Trimmed Average</strong> is the default and most accurate metric. It is fitted to follow Actual DRS Progress released by Gamestop.
      </p>
      </br>
      <h3>Share Allocation, Progress and Completion</h3>
      <p>
      <strong>Computershared.net and its author no claims and takes no stance on which allocations, or how many of the issued share balance need to be direct-registered to affect any outcome nor what those outcomes may be.</strong>
      There is no reliable precendence, and there is no community concensus on the matter (and honestly ya'll, it's not really the point of computershared.net).
      </br>
      As such, the site was designed from the very beginning to be very flexible and suit a variety of opinions.
      <p>
      In the <strong>Share Ownership</strong> section, the issued shares are broken down by known ownership allocations (see cited source). Each allocation shows both number of shares
      and percent of the total issued shares.
      </br>
      These ownership allocations can be toggled to customize the progress calculation, and share allocation donut.
      The following example illustrates how to setup the site for one who believes that all shares except ones owned by Insiders need to be direct registered:
      <div class="ratio ratio-4x3">
        <video autoplay playsinline webkit-playsinline loop class="embed-responsive-item" src="site-images/calculator.mp4?a=204" type="video/mp4"></video>
      </div>
      As a user of the site, you can select any combination of allocations you desire.
      </p>
      <p>
      The donut can also be used to compare allocations to each other. The following example can be used to compare retail to insiders.
      <div class="ratio ratio-4x3">
        <video autoplay playsinline webkit-playsinline loop class="embed-responsive-item" src="site-images/calculator3.mp4?a=204" type="video/mp4"></video>
      </div>
      </p>
      <p>
      Another useful comparison is retail to remaining...
      <div class="ratio ratio-4x3">
        <video autoplay playsinline webkit-playsinline loop class="embed-responsive-item" src="site-images/calculator2.mp4?a=204" type="video/mp4"></video>
      </div>
      </p>
      `;
      break;

    case "metrics":
      helpModalTitle.innerText = "Metrics";
      helpModalBody.innerHTML = `
      <strong>Average:</strong> Sum of all account balances, divided by the number of accounts.
      </br>
      <strong>Median:</strong> Value at which half of all accounts have a higher balance, and half of all accounts have a lower.
      </br>
      <strong>Mode:</strong> Of all account balances, this value is the most common.
      </br>
      <strong>Trimmed Average:</strong> Same as <strong>Average</strong>, except that the largest 4% of accounts and the smallest 4% of accounts are excluded from the average.
      </br>
      `;
      break;

  }

  var modal = new bootstrap.Modal(document.getElementById('helpModal'));
  modal.show();
}

document.getElementById('learnCalc').onclick = () => { showHelpModal("calculator") };
document.getElementById('learnMetrics').onclick = () => { showHelpModal("metrics") };
document.getElementById('learnDataset').onclick = () => {
  new bootstrap.Modal(document.getElementById('stats')).show();
};

document.getElementById('learnChart').addEventListener('click', () => {
  var chart = document.getElementById('chartType').innerText;
  showHelpModal(chart);
});

// Sneaky easter egg
var pattern = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
var chars = ['⬆️', '⬆️', '⬇️', '⬇️', '⬅️', '➡️', '⬅️', '➡️', '🅱️', '🅰️']
var phrases = ['the', 'matrix', 'has', 'you', ' ', 'follow', 'the', 'white', 'rabbit', 'enter the matrix']

var letters = '▒╠⬆⬇⬅畐畅畆畇畈畉畊畋界畍畎畏畐DRSDRSDRSDRSDRSDRSDRSDRSDRS';
letters = letters.split('');
var fontSize = 10;

var canvas = document.getElementById('shareLocker');
var ctx = canvas.getContext('2d');
var columns = canvas.width / fontSize;
var drops = [];
for (var i = 0; i < columns; i++) {
  drops[i] = 1;
}
var current = 0;

function draw() {
  ctx.fillStyle = 'rgba(0, 0, 0, .1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (var i = 0; i < drops.length; i++) {
    var text = letters[Math.floor(Math.random() * letters.length)];
    ctx.fillStyle = '#0f0';
    ctx.fillText(text, i * fontSize, drops[i] * fontSize);
    drops[i]++;
    if (drops[i] * fontSize > canvas.height && Math.random() > .95) {
      drops[i] = 0;
    }
  }
}

var konamiHandler = async function (event) {
  if (!pattern.includes(event.key)) {
    return;
  }
  if (pattern.indexOf(event.key) < 0 || event.key !== pattern[current]) {
    current = 0;
    document.getElementById('apeDrs').innerText = "❌ 🍦AHmE";
    return;
  }
  document.getElementById('apeDrsPct').innerText = chars[current];
  document.getElementById('apeDrs').innerText = `Lives: ${current}`;
  document.getElementById('apesSwitchLbl').innerText = phrases[current];
  current++;
  if (pattern.length === current) {
    setInterval(draw, 45);
    current = 0;
    canvas.addEventListener('click', ()=>{window.location.href = "https://www.computershared.net/supermonkeyo/"});
    
  }

};
document.addEventListener('keydown', konamiHandler, false);