import {setCorsPolicy} from "./cors.js";
import {handleMessage} from "./handle-message.js";
import {interceptScripts} from "./intercept.js";
import logger from "../shared/logger.js";

/**
 * Urls that the web request listeners should be active on.
 */
const urlsToListenOn = [
    "*://app.roll20.net/*"
];

// Intercept headers to allow CORS if needed.
chrome.webRequest.onHeadersReceived.addListener(
    setCorsPolicy,
    {urls: urlsToListenOn},
    ["blocking", "responseHeaders"]
);
// Intercept scripts to instead load hooked ones.
chrome.webRequest.onBeforeRequest.addListener(
    interceptScripts,
    {urls: urlsToListenOn},
    ["blocking"]
);

chrome.runtime.onMessage.addListener(handleMessage);

// hooking.js
chrome.runtime.onConnectExternal.addListener((port) => {
    port.onMessage.addListener((message) => {
        logger.debug("background.js 1", message);
        if (message.content === "ping") {
            port.postMessage({
                content: "pong",
                from: "background.js 1",
            });
        }
    });
    port.postMessage({
        content: "ping",
        from: "background.js 1",
    });
});

// content-script.js
chrome.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener((message) => {
        logger.debug("background.js 2", message);
        if (message.content === "ping") {
            port.postMessage({
                content: "pong",
                from: "background.js 2",
            });
        }
    });
    port.postMessage({
        content: "ping",
        from: "background.js 2",
    });
});

chrome.runtime.onInstalled.addListener((details) => {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [
                new chrome.declarativeContent.PageStateMatcher({
                    pageUrl: {
                        urlMatches: "https?://app.roll20.net/.*"
                    },
                })
            ],
            actions: [
                new chrome.declarativeContent.ShowPageAction()
            ]
        }]);
    });
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        chrome.tabs.create({
            url: chrome.extension.getURL("welcome/welcome.html")
        });
    }
});