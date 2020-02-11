import CustomDiceTypes from "../shared/custom-dice-types.js";
import {useMessageHandlers} from "../shared/handle-messages.js";
import {
    initializeValues,
    insertDiceChoices,
    insertIndividualDiceSelectors,
    setupUiListeners,
    updateCampaignInfoText,
    updateWaitingForRoll20
} from "./ui.js";
import MessageTypes from "../shared/message-types.js";
import {setState} from "./state.js";

let contentScriptPort;
let roll20ReadyInterval;

function setupContentScriptConnection() {
    chrome.tabs.query({url: "*://app.roll20.net/editor*"}, (tabs) => {
        contentScriptPort = chrome.tabs.connect(tabs[0].id);
        contentScriptPort.onDisconnect.addListener(() => {
            setTimeout(setupContentScriptConnection, 100);
        });
        contentScriptPort.onMessage.addListener(useMessageHandlers(contentScriptPort, {
            [MessageTypes.CAMPAIGN_INFO]: handleCampaignInfo,
            [MessageTypes.ROLL20_READY]: handleRoll20Ready,
        }));
    });
}

function handleCampaignInfo(message, port) {
    setState({
        campaignInfo: message.campaignInfo,
    });
    chrome.storage.sync.get(null, initializeValues);
    updateCampaignInfoText();
}

function handleRoll20Ready(message, port) {
    setState({
        roll20Ready: message.roll20Ready
    });
    updateWaitingForRoll20();
    if (message.roll20Ready) {
        if (roll20ReadyInterval != null) {
            clearInterval(roll20ReadyInterval);
            roll20ReadyInterval = null;
        }
    }
}

function checkRoll20Ready() {
    if (contentScriptPort == null) {
        return;
    }
    contentScriptPort.postMessage({
        type: MessageTypes.GET_ROLL20_READY
    });
}

function getCampaignInfo() {
    if (contentScriptPort == null) {
        return;
    }
    contentScriptPort.postMessage({
        type: MessageTypes.GET_CAMPAIGN_INFO
    });
}

document.body.onload = () => {
    insertIndividualDiceSelectors();
    insertDiceChoices(Object.values(CustomDiceTypes));
    setupContentScriptConnection();
    setupUiListeners();
    roll20ReadyInterval = setInterval(() => {
        checkRoll20Ready();
        getCampaignInfo();
    }, 100);
};
