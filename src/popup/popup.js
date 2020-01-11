import CustomDiceTypes from "../shared/custom-dice-types.js";
import {useMessageHandlers} from "../shared/handle-messages.js";
import {initializeValues, insertDiceChoices, insertIndividualDiceSelectors, setupUiListeners} from "./ui.js";

let connectionScriptPort;

function setupContentScriptConnection() {
    chrome.tabs.query({url: "*://app.roll20.net/editor*"}, (tabs) => {
        connectionScriptPort = chrome.tabs.connect(tabs[0].id);
        connectionScriptPort.onMessage.addListener(useMessageHandlers(connectionScriptPort, {
            // TODO
        }));
    });
}

document.body.onload = () => {
    insertIndividualDiceSelectors();
    insertDiceChoices(Object.values(CustomDiceTypes));
    chrome.storage.sync.get(null, initializeValues);
    setupContentScriptConnection();
    setupUiListeners();
};
