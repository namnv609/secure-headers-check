var $startRecordBtn = document.querySelector("#start-record");
var $requestResultTbody = document.querySelector("#request-result");
var $headerNamesInput = document.querySelector("#header-names");
var $requestTypesSelect = document.querySelector("#request-types");
var isStartRecordRequest = false;

$startRecordBtn.addEventListener("click", function(evt) {
  var recordingStateText = isStartRecordRequest ? "Start record" : "Stop record";
  var headerNames = $headerNamesInput.value.toLowerCase().split(/\,\s*/).filter(Boolean);
  var requestTypes = getSelectedRequestTypes();
  var messageConnection = chrome.runtime.connect({name: "SecureHeadersCheck"});

  this.innerText = recordingStateText;
  isStartRecordRequest = !isStartRecordRequest;

  toggleDisableElements(isStartRecordRequest);

  messageConnection.postMessage({isStart: isStartRecordRequest, requestTypes: requestTypes});
  messageConnection.onMessage.addListener(onMessageHandler.bind(this, headerNames));
});

function getSelectedRequestTypes() {
  var selectedOptions = $requestTypesSelect.querySelectorAll("option:checked");

  return Array.from(selectedOptions).map(function(option, idx) {
    return option.value;
  });
}

function toggleDisableElements(toggleState) {
  [$headerNamesInput, $requestTypesSelect].forEach(function(elm) {
    toggleState ? elm.setAttribute("disabled", "disabled") : elm.removeAttribute("disabled");
  });
}

function onMessageHandler(headerNames, message) {
  var requestDetail = message.requestDetail;

  if (requestDetail) {
    var headersContent = extractHeadersContent(headerNames, requestDetail.responseHeaders);
    var resultContent = "\
      <tr>\
        <td class=\"text-ellipsis\" title=\" " + requestDetail.url + "\">" + requestDetail.url + "</td>\
        <td>" + requestDetail.method + "</td>\
        <td>" + requestDetail.statusCode + "</td>\
        <td>" + requestDetail.type + "</td>\
        <td>" + headersContent.content.join("<br />") + "</td>\
        <td>" + headersContent.status + "</td>\
      </tr>\
    ";

    $requestResultTbody.insertAdjacentHTML('afterbegin', resultContent);
  }
}

function extractHeadersContent(headerNames, headerObj) {
  var statusText = "OK";
  var statusClasses = ["green-color"];
  var headerContentObj = {
    content: []
  };

  headerNames.forEach(function(headerName) {
    var headerObjVal = headerObj.find(function(header) {
      return header.name.toLowerCase() == headerName;
    });
    var textColor = "green-color";
    var textWeight = "";
    var headerValue = (headerObjVal ? headerObjVal.value : "");

    if (typeof headerObjVal == "undefined") {
      textColor = "red-color";
      textWeight = "bold";
      statusText = "NG";
      statusClasses = [textColor, textWeight];
    }

    var content = "\
      <span class=\"" + [textColor, textWeight].join(" ") + "\">\
        - " + headerName + ": " + headerValue + "\
      </span>\
    ";

    headerContentObj.content.push(content);
  });

  headerContentObj["status"] = "<span class=\"" + statusClasses.join(" ") + "\"> " + statusText + "</span>";

  return headerContentObj;
}
