let handleError = function (msg, url, lineNo, columnNo, error) {
    let messageText = `${msg} - ${url} ${lineNo}/${columnNo} ${error}`;
    let errorModalHtml = `
    <div id="errorModal" class="modal fade" tabindex="-1">
      <div class="modal-dialog modal-lg modal-fullscreen-md-down text-dark fs-4" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h2 id="errorModalTitle" class="modal-title">ERROR</h2>
          </div>
          <div id="errorModalBody" class="modal-body">
            <p>
                Bad things have happened and Jonpro03 needs to fix them.
                Please please please send the report to me so that I can fix it.
            </p>
            </br>
            <blockquote class="blockquote">
                <strong id="errorText">
                    ${messageText}
                </strong>
            </blockquote>
          </div>
          <div class="modal-footer">
            <a href="https://www.reddit.com/message/compose/?to=jonpro03&subject=Computershared%20Crash%20Report&message=${encodeURIComponent(messageText)}" target="_blank">
                <button class="btn btn-success">SEND REPORT</button>
            </a>
            <button type="button" class="btn btn-danger" data-bs-dismiss="modal">CLOSE</button>
          </div>
        </div>
      </div>
    </div>
    `;
    let d = document.createElement('div');
    d.innerHTML = errorModalHtml;
    document.getElementById('pageContent').appendChild(d);
    let modal = new bootstrap.Modal(document.getElementById('errorModal'));
    modal.show();
    return false;
}

let handleRejection = function (event) {
    let messageText = event.reason;
    let errorModalHtml = `
    <div id="errorModal" class="modal fade" tabindex="-1">
      <div class="modal-dialog modal-lg modal-fullscreen-md-down text-dark fs-4" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h2 id="errorModalTitle" class="modal-title">ERROR</h2>
          </div>
          <div id="errorModalBody" class="modal-body">
            <p>
                Bad things have happened and Jonpro03 needs to fix them.
                Please please please send the report to me so that I can fix it.
            </p>
            </br>
            <blockquote class="blockquote">
                <strong id="errorText">
                    ${messageText}
                </strong>
            </blockquote>
          </div>
          <div class="modal-footer">
            <a href="https://www.reddit.com/message/compose/?to=jonpro03&subject=Computershared%20Crash%20Report&message=${encodeURIComponent(messageText)}" target="_blank">
                <button class="btn btn-success">SEND REPORT</button>
            </a>
            <button type="button" class="btn btn-danger" data-bs-dismiss="modal">CLOSE</button>
          </div>
        </div>
      </div>
    </div>
    `;
    let d = document.createElement('div');
    d.innerHTML = errorModalHtml;
    document.getElementById('pageContent').appendChild(d);
    let modal = new bootstrap.Modal(document.getElementById('errorModal'));
    modal.show();
    return false;
}

window.onerror = handleError;
window.onunhandledrejection = handleRejection;
