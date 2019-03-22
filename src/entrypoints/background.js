import {MESSAGE_KEY_DOM_LOADED} from "../constants";

const shouldAllowCORS = (request) => {
    const url = request.url;
    if (url.startsWith("https://app.roll20.net/editor/setcampaign/")) {
        return true;
    }
    if (url === "https://app.roll20.net/editor/") {
        return true;
    }
    if (url === "https://app.roll20.net/editor") {
        return true;
    }
    if (url.startsWith("https://app.roll20.net/editor?")) {
        return true;
    }
    if (url.startsWith("https://app.roll20.net/editor#")) {
        return true;
    }
    return false;
};

const targetScripts = [
    "https://app.roll20.net/v2/js/jquery",
    "https://app.roll20.net/v2/js/jquery.migrate.js",
    "https://app.roll20.net/js/featuredetect.js",
    "https://app.roll20.net/v2/js/patience.js",
    "https://app.roll20.net/editor/startjs",
    "https://app.roll20.net/js/jquery-ui",
    "https://app.roll20.net/js/d20/loading.js",
    "https://app.roll20.net/assets/firebase",
    "https://app.roll20.net/assets/base.js",
    "https://app.roll20.net/assets/app.js",
    "https://app.roll20.net/js/tutorial_tips.js"
];

let alreadyRedirected = {};
let redirectQueue = [];
let isRedirecting = false;

function beginRedirectQueue() {
    if (isRedirecting) {
        return;
    }
    isRedirecting = true;
    alreadyRedirected = {};
    redirectQueue = [];
}

function endRedirectQueue() {
    isRedirecting = false;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg[MESSAGE_KEY_DOM_LOADED]) {
        endRedirectQueue();
        sendResponse(redirectQueue);
    }
});

function handleBeforeRequest(req) {
    if (req.type !== "script") {
        return;
    }
    for (const url of targetScripts) {
        if (!req.url.startsWith(url)) {
            continue;
        }
        beginRedirectQueue();
        if (!alreadyRedirected[req.url]) {
            redirectQueue.push(req.url);
            alreadyRedirected[req.url] = true;
            return {
                cancel: true
            };
        }
        break;
    }
}

function handleHeadersReceived(req) {
    if (!shouldAllowCORS(req)) {
        return;
    }
    beginRedirectQueue();
    for (let i = 0; i < req.responseHeaders.length; i++) {
        const header = req.responseHeaders[i];
        const name = header.name.toLowerCase();
        if (name !== "content-security-policy") {
            continue;
        }
        header.value += " blob:";
    }
    return req;
}

chrome.webRequest.onHeadersReceived.addListener(
    handleHeadersReceived,
    {urls: ["*://app.roll20.net/*"]},
    ["blocking", "responseHeaders"]
);

chrome.webRequest.onBeforeRequest.addListener(
    handleBeforeRequest,
    {urls: ["*://app.roll20.net/*"]},
    ["blocking"]
);