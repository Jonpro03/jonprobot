showHelpModal = function (articleName) {
  let helpModalTitle = document.getElementById("helpModalTitle");
  let helpModalBody = document.getElementById("helpModalBody");

  switch (articleName) {
    case "estimates":
      helpModalTitle.innerHTML = "DRS Estimate Line Chart";
      helpModalBody.innerHTML = `<p>
      This chart shows how many shares are estimated to have been direct-registered over time.
      <img src="site-images/estimates.png?a=201" class="card-img-top" alt="estimates chart">
      <strong>X-Axis:</strong> Date
      </br>
      <strong>Y-Axis:</strong> Share Count
      </p>
      <p>
      By default, estimates using the Sampled Data 
      <a target="_blank" href="https://en.wikipedia.org/wiki/Arithmetic_mean">Average</a> (Purple), 
      <a target="_blank" href="https://en.wikipedia.org/wiki/Truncated_mean">Trimmed Average</a> (Cyan) 
      and <a target="_blank" href="https://en.wikipedia.org/wiki/Average#Median">Median</a> (Yellow) are shown, 
      as well as actual progress as reported by Gamestop (White).
      </br>
      Not shown is Sampled Data 
      <a target="_blank" href="https://en.wikipedia.org/wiki/Average#Mode">Mode</a> (Dark Cyan), 
      but can be enabled by clicking it in the top legend.
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
      <img src="site-images/shares.png?a=201" class="card-img-top" alt="shares chart">
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
      <img src="site-images/shares2.png?a=201" class="card-img-top" alt="shares chart">
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
      <img src="site-images/highscores.png?a=201" class="card-img-top" alt="highscores chart">
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
      
      <img src="site-images/stats.png?a=201" class="card-img-top" alt="statistics chart">
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
      <img src="site-images/distribution.png?a=201" class="card-img-top" alt="histogram chart">
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
      <p>In the following image, there are 2179 accounts with at least 128 shares, but fewer than 256 shares.
      <img src="site-images/distribution2.png?a=201" class="card-img-top" alt="histogram chart">
      </p>
      `;
      break;

    case "growth":
      helpModalTitle.innerHTML = "Account Growth Line Chart";
      helpModalBody.innerHTML = `<p>
      This chart plots how existing (sampled) Computershare Accounts have changed over time.
      <img src="site-images/growth.png?a=201" class="card-img-top" alt="growth chart">
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
      <img src="site-images/power.png?a=201" class="card-img-top" alt="purchase power chart">
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
      The cost basis of Computershare Accounts is largely unknown, so results are calculated with a proprietary
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

  }

  var modal = new bootstrap.Modal(document.getElementById('helpModal'));
  modal.show();
}

document.getElementById('learnEstimates').onclick = () => { showHelpModal("estimates") };
document.getElementById('learnShares').onclick = () => { showHelpModal("shares") };
document.getElementById('learnHighscore').onclick = () => { showHelpModal("highscores") };
document.getElementById('learnStats').onclick = () => { showHelpModal("statistics") };
document.getElementById('learnDistribution').onclick = () => { showHelpModal("distribution") };
document.getElementById('learnGrowth').onclick = () => { showHelpModal("growth") };
document.getElementById('learnPower').onclick = () => { showHelpModal("power") };