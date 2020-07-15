var portConnect;

chrome.browserAction.onClicked.addListener(function(evt) {
  chrome.runtime.openOptionsPage();
});

chrome.runtime.onConnect.addListener(onMessageConnectHandler);

function onHeadersReceivedHandler(requestDetail) {
  if (["main_frame", "sub_frame", "xmlhttprequest"].indexOf(requestDetail.type) >= 0) {
    portConnect.postMessage({content: requestDetail});
  }
}

function onPortMessageHandler(msg) {
  if (msg.isRecordRequest) {
    chrome.webRequest.onHeadersReceived.addListener(onHeadersReceivedHandler, {
      urls: ["<all_urls>"]
    }, ["responseHeaders"]);
  } else {
    chrome.webRequest.onHeadersReceived.removeListener(onHeadersReceivedHandler);
  }
}

function onMessageConnectHandler(port) {
  portConnect = port;


  if (portConnect.name == "SecureHeadersCheck") {
    portConnect.onMessage.addListener(onPortMessageHandler);
    portConnect.onDisconnect.addListener(function(port) {
      portConnect.onMessage.removeListener(onPortMessageHandler);
      chrome.webRequest.onHeadersReceived.removeListener(onHeadersReceivedHandler);
    });
  }
}
