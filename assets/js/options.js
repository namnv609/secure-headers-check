var $startRecordBtn = document.getElementById("start-record");
var $resultTbody = document.getElementById("result");
var $headerNames = document.getElementById("header-names");
var isRecordingRequest = false;
var portConnect;

$startRecordBtn.addEventListener("click", function(evt) {
  var btnText = isRecordingRequest ? "Start record" : "Stop record";
  var headerNames = $headerNames.value.toLowerCase().split(/\,\s+/);

  this.innerText = btnText;
  isRecordingRequest = !isRecordingRequest;

  if (isRecordingRequest) {
    $headerNames.setAttribute("disabled", "true");
  } else {
    $headerNames.removeAttribute("disabled");
  }

  var portConnect = chrome.runtime.connect({name: "SecureHeadersCheck"});

   portConnect.postMessage({isRecordRequest: isRecordingRequest});
   portConnect.onMessage.addListener(function(msg) {
     var messageObj = msg.content;
     console.log(messageObj);
     if (messageObj) {
       var resultContent = "\
         <tr>\
           <td class=\"text-ellipsis\" title=\" " + messageObj.url + "\">" + messageObj.url + "</td>\
           <td>" + messageObj.method + "</td>\
           <td>" + messageObj.statusCode + "</td>\
           <td>" + messageObj.type + "</td>\
           <td>" + extractHeaders(headerNames, messageObj.responseHeaders) + "</td>\
         </tr>\
       ";

       // $resultTbody.innerHTML += resultContent;
       $resultTbody.insertAdjacentHTML('afterbegin', resultContent);
     }
   });
});

function extractHeaders(headerNames, headerObj) {
  console.log(headerNames, headerObj);
  return headerObj.map(function(header, idx) {
    if (headerNames.indexOf(header.name.toLowerCase()) >= 0) {
      return "- " + header.name + ": " + header.value;
    }
  }).filter(Boolean).join("<br />");
}
