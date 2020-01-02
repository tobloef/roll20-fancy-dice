import { setCorsPolicy } from "./cors.js";
import { handleMessage } from "./handle-message.js";
import { interceptScripts } from "./intercept.js";

/**
 * Urls that the web request listeners should be active on.
 */
const urlsToListenOn = [
    "*://app.roll20.net/*"
];

// Listen for messages from the foreground thread.
chrome.runtime.onMessage.addListener(handleMessage);
// Intercept headers to allow CORS if needed.
chrome.webRequest.onHeadersReceived.addListener(
    setCorsPolicy,
    { urls: urlsToListenOn },
    ["blocking", "responseHeaders"]
);
// Intercept scripts to instead load hooked ones.
chrome.webRequest.onBeforeRequest.addListener(
    interceptScripts,
    { urls: urlsToListenOn },
    ["blocking"]
);