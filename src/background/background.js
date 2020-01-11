import {setCorsPolicy} from "./cors.js";
import {getScriptsIntercepting, interceptScripts, setScriptsIntercepting} from "./intercept.js";
import {useMessageHandlers} from "../shared/handle-messages.js";
import MessageTypes from "../shared/message-types.js";

let hookingPort;
let contentScriptPort;

setupWebRequestListeners();
setupHookingConnection();
setupContentScriptConnection();
setupPostInstall();

chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (var key in changes) {
        var storageChange = changes[key];
        console.log('Storage key "%s" in namespace "%s" changed. ' +
            'Old value was "%s", new value is "%s".',
            key,
            namespace,
            storageChange.oldValue,
            storageChange.newValue);
    }
});

function setupWebRequestListeners() {
    chrome.webRequest.onHeadersReceived.addListener(
        setCorsPolicy,
        {urls: ["*://app.roll20.net/*"]},
    );

    chrome.webRequest.onBeforeRequest.addListener(
        interceptScripts,
        {urls: ["*://app.roll20.net/*"]},
        ["blocking"]
    );
}

function setupPostInstall() {
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
}

function setupHookingConnection() {
    chrome.runtime.onConnectExternal.addListener((port) => {
        hookingPort = port;
        hookingPort.onMessage.addListener(useMessageHandlers(hookingPort, {
            [MessageTypes.ROLL20_READY]: handleRoll20Ready,
            [MessageTypes.CAMPAIGN_ID]: handleCampaignId,
        }));
    });
}

function setupContentScriptConnection() {
    chrome.runtime.onConnect.addListener((port) => {
        contentScriptPort = port;
        contentScriptPort.onMessage.addListener(useMessageHandlers(contentScriptPort, {
            [MessageTypes.DOM_READY]: handleDomLoaded
        }));
    });
}

function handleCampaignId(message, port) {
    contentScriptPort.postMessage(message);
}

function handleRoll20Ready(message, port) {
    contentScriptPort.postMessage(message);
}

function handleDomLoaded(message, port) {
    const scriptsIntercepting = getScriptsIntercepting();
    port.postMessage({
        type: MessageTypes.SCRIPTS_TO_INJECT,
        scriptUrls: scriptsIntercepting,
    });
    setScriptsIntercepting([]);
}