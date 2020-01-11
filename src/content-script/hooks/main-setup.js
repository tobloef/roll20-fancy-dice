import ScriptUrls from "../../shared/script-urls.js";
import CustomDiceTypes from "../../shared/custom-dice-types.js";
import DiceTypes from "../../shared/dice-types.js";

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
            fancyDice.assetsUrl = "${chrome.runtime.getURL("assets")}";
            fancyDice.playersCustomDiceChoice = {};
            fancyDice.customDiceCache = {};
            fancyDice.getCustomDice = function(playerId, diceType) {
                const customDiceChoice = fancyDice.playersCustomDiceChoice[playerId];
                if (customDiceChoice == null) {
                    return null;
                }
                return fancyDice.customDiceCache[customDiceChoice];
            };
            fancyDice.updateCustomDiceChoices = (newChoices) => {
                if (newChoices == null) {
                    return;
                }
                for (const [playerId, choice] of Object.entries(newChoices)) {
                    fancyDice.playersCustomDiceChoice[playerId] = choice;
                }
            };
            fancyDice.fetchCustomDiceChoices = (playerIds, callback) => {
                // TODO: Fetch
                const playersCustomDiceChoice = {
                    "-LjCgFYxbhdFfpfdfvQ2": "${CustomDiceTypes.PEARLESCENT.key}",
                    "-LjDGvUKjsDkMPjUZkxj": "${CustomDiceTypes.FANCY.key}",
                };
                callback(playersCustomDiceChoice);
            };
            const getNewPlayers = function() {
                if (fancyDice.d20 == null) {
                    return;
                }
                if (fancyDice.d20.Campaign == null) {
                    return;
                }
                const playerIds = fancyDice.d20.Campaign.players.models.map(p => p.id);
                const newPlayerIds = playerIds.filter(id => !Object.keys(fancyDice.playersCustomDiceChoice).includes(id));
                if (newPlayerIds) {
                    fancyDice.fetchCustomDiceChoices(newPlayerIds, fancyDice.updateCustomDiceChoices);
                } 
            };
            getNewPlayers();
            setInterval(getNewPlayers, 1000);
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
                            //fancyDice.logger.error("Error fetching dice texture info.", error);
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