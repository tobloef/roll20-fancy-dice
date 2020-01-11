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
            // TODO
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

function handleDomLoaded(message, port) {
    const scriptsIntercepting = getScriptsIntercepting();
    port.postMessage({
        type: MessageTypes.SCRIPTS_TO_INJECT,
        scriptUrls: scriptsIntercepting,
    });
    setScriptsIntercepting([]);
}