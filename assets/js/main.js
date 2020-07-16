var messageConnection;

chrome.browserAction.onClicked.addListener(function(evt) {
  chrome.runtime.openOptionsPage();
});

chrome.runtime.onConnect.addListener(onMessageConnectHandler);


function onMessageConnectHandler(connectionObj) {
  messageConnection = connectionObj;

  if (messageConnection.name == "SecureHeadersCheck") {
    messageConnection.onMessage.addListener(onReceivedMessageHandler);

    messageConnection.onDisconnect.addListener(function() {
      messageConnection.onMessage.removeListener(onReceivedMessageHandler);
      chrome.webRequest.onHeadersReceived.removeListener(onReceivedHeadersHandler);
    });
  }
}

function onReceivedMessageHandler(message) {
  if (message.isStart) {
    chrome.webRequest.onHeadersReceived.addListener(onReceivedHeadersHandler, {
      urls: ["<all_urls>"],
      types: message.requestTypes
    }, ["responseHeaders"]);
  } else {
    chrome.webRequest.onHeadersReceived.removeListener(onReceivedHeadersHandler);
  }
}

function onReceivedHeadersHandler(requestDetail) {
  messageConnection.postMessage({requestDetail: requestDetail});
}
