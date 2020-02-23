import {setCorsPolicy} from "./cors.js";
import {getScriptsIntercepting, interceptScripts, setScriptsIntercepting} from "./intercept.js";
import {useMessageHandlers} from "../shared/handle-messages.js";
import MessageTypes from "../shared/message-types.js";

const ENABLE_WELCOME_PAGE = false;

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
                            urlMatches: "https?://app.roll20.net/editor.*"
                        },
                    })
                ],
                actions: [
                    new chrome.declarativeContent.ShowPageAction()
                ]
            }]);
        });
        if (ENABLE_WELCOME_PAGE && details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
            chrome.tabs.create({
                url: chrome.extension.getURL("welcome/welcome.html")
            });
        }
    });
}

function setupHookingConnection() {
    chrome.runtime.onConnectExternal.addListener((port) => {
        hookingPort = port;
        hookingPort.onDisconnect.addListener(() => {
            hookingPort = null;
        });
        hookingPort.onMessage.addListener(useMessageHandlers(hookingPort, {
            [MessageTypes.ROLL20_READY]: handleRoll20Ready,
            [MessageTypes.CAMPAIGN_ID]: handleCampaignId,
            [MessageTypes.GET_DICE_SETTINGS]: handleGetDiceSettings,
            [MessageTypes.PLAYER_ID]: handlePlayerId,
        }));
    });
}

function setupContentScriptConnection() {
    chrome.runtime.onConnect.addListener((port) => {
        contentScriptPort = port;
        contentScriptPort.onDisconnect.addListener(() => {
            contentScriptPort = null;
        });
        contentScriptPort.onMessage.addListener(useMessageHandlers(contentScriptPort, {
            [MessageTypes.DOM_READY]: handleDomLoaded,
            [MessageTypes.DICE_SETTINGS]: handleDiceSettings,
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
    contentScriptPort.postMessage({
        type: MessageTypes.SCRIPTS_TO_INJECT,
        scriptUrls: scriptsIntercepting,
    });
    setScriptsIntercepting([]);
}

function handleGetDiceSettings(message, port) {
    contentScriptPort.postMessage(message);
}

function handleDiceSettings(message, port) {
    hookingPort.postMessage(message);
}

function handlePlayerId(message, port) {
    contentScriptPort.postMessage(message);
}