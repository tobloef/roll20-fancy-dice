import ScriptUrls from "../../shared/script-urls.js";
import CustomDiceTypes from "../../shared/custom-dice-types.js";
import DiceTypes from "../../shared/dice-types.js";
import MessageTypes from "../../shared/message-types.js";

const mainSetup = {
    name: "Main app setup",
    scriptUrls: [ScriptUrls.APP],
    find: "function(){function cParticle(){",
    // language=JavaScript
    replaceWith: `
            function() {
            fancyDice.logger.info("Setting up...");
            fancyDice.customDiceTypes = JSON.parse('${JSON.stringify(CustomDiceTypes)}');
            fancyDice.diceTypes = JSON.parse('${JSON.stringify(DiceTypes)}');
            fancyDice.messageTypes = JSON.parse('${JSON.stringify(MessageTypes)}');
            fancyDice.assetsUrl = "${chrome.runtime.getURL("assets")}";
            fancyDice.playersCustomDiceSettings = {};
            fancyDice.customDiceCache = {};
            fancyDice.getCustomDice = function(diceSettings, diceType) {
                if (diceSettings == null) {
                    return null;
                }
                const customDiceChoices = diceSettings.diceChoices;
                if (customDiceChoices == null) {
                    return null;
                }
                const customDiceChoice = customDiceChoices[diceType];
                return fancyDice.customDiceCache[customDiceChoice];
            };
            fancyDice.getDiceSettings = function(playerId) {
                return fancyDice.playersCustomDiceSettings[playerId];
            };
            fancyDice.updateCustomDiceSettings = (settingsList) => {
                if (settingsList == null) {
                    return;
                }
                for (const [playerId, settings] of Object.entries(settingsList)) {
                    fancyDice.playersCustomDiceSettings[playerId] = settings;
                }
            };
            
            // To background process
            const port = chrome.runtime.connect(fancyDice.extensionId);
            port.onMessage.addListener((message) => {
                fancyDice.logger.debug("Hook got message:", message);
                if (message.type === fancyDice.messageTypes.DICE_SETTINGS) {
                    fancyDice.updateCustomDiceSettings(message.diceSettings);
                }
            });
            port.postMessage({
                type: fancyDice.messageTypes.ROLL20_READY
            });
            port.postMessage({
                type: fancyDice.messageTypes.CAMPAIGN_ID,
                campaignId: window.campaign_id,
            });
            port.postMessage({
                type: fancyDice.messageTypes.PLAYER_ID,
                playerId: window.d20_player_id,
            });
            port.postMessage({
                type: fancyDice.messageTypes.GET_DICE_SETTINGS,
            });

            // Load custom dice cache
            const cacheCustomDice = async () => {
                const loader = new THREE.JSONLoader();
                loader.crossOrigin = "";
                for (const customDiceType of Object.values(fancyDice.customDiceTypes)) {
                    const customDice = {
                        ...customDiceType
                    };
                    for (const diceType of Object.keys(fancyDice.diceTypes)) {
                        const url = fancyDice.assetsUrl + "/custom-dice/" + customDiceType.key + "/" + diceType + "/" + diceType + "tex.json";
                        try {
                            const response = await fetch(url);
                            if (!response.ok) {
                                throw new Error("Response not OK.");
                            }
                            customDice[diceType] = await new Promise((resolve, reject) => {
                                setTimeout(() => reject(new Error("Loading model timed out (" + url + ").")), 1000);
                                loader.load(url, (geometry, materials) => resolve({geometry, materials}));
                            });
                        } catch (error) {
                            fancyDice.logger.error("Error fetching dice texture info.", error);
                        }
                    }
                    fancyDice.customDiceCache[customDiceType.key] = customDice;
                }
            };
            cacheCustomDice();
            function cParticle() {
        `
};

export default mainSetup;