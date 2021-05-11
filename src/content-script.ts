// import PostMessageStream from "post-message-stream";

// const s = document.createElement("script");
//
// s.src = browser.runtime.getURL("js/injection.js");
// s.onload = function() {
//
//   this.remove();
// };
// (document.head || document.documentElement).appendChild(s);
// const injectionStream = new PostMessageStream({ name: "content-script", target: "injection" });

// injectionStream.on("data", (data) => {
//
//   browser.runtime.sendMessage(data).then(function(response) {
//     injectionStream.write({ type: "response", data: response });
//   });
// });
//
// browser.runtime.onMessage.addListener(function(message, sender) {
//
//   if (browser.runtime.id === sender.id) {
//     injectionStream.write({ type: "event", data: message });
//   }
// });
