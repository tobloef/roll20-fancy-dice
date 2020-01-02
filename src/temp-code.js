// language=ECMAScript 6
const tempCode = `
(function() {
    const playerDiceMap = {};
    
    function getCustomDiceByPlayerId(playerId) {
        console.log("getCustomDiceByPlayerId", playerId);
        // TODO: Do this in a way so that it works on first roll as well. Remember, no es6 in hooked code.
        if (playerDiceMap[playerId] != null) {
            console.log("playerDiceMap[playerId]:", playerDiceMap[playerId]);
            return playerDiceMap[playerId];
        } else {
            // noinspection JSIgnoredPromiseFromCall
            console.log("Have to get the custom dice data...");
            initializeCustomDice(playerId);
            return null;
        }
    }
    
    async function initializeCustomDice(playerId) {
        console.log("initializeCustomDice", playerId);
        let customDiceData = await fetchCustomDice(playerId);
        console.log("customDiceData:", customDiceData);
        if (customDiceData != null) {
            playerDiceMap[playerId] = await loadCustomDice(customDiceData);
            console.log("playerDiceMap[playerId]:", playerDiceMap[playerId]);
        }
    }
    
    async function loadCustomDice(customDiceData) {
        const fullCustomDice = {};
    
        const loader = new THREE.JSONLoader();
        loader.crossOrigin = "";
        for (const dice of customDiceData.dice) {
            try {
                await new Promise((resolve, reject) => {
                    loader.load(dice.url, function (geometry, materials) {
                        fullCustomDice[dice.type] = {
                            geometry,
                            materials
                        };
                        resolve();
                    });
                });
            } catch (error) {
                console.error("Error loading THREE.js data for dice", dice.type, "at url", dice.url, error);
            }
        }
        
        return fullCustomDice;
    }
    
    const testCustomDice = {
        dice: [
            {
                url: "/js/models/d4/d4tex2014.js?v=3",
                type: "d4",
            },
            {
                //url: "/js/models/d6/d6tex2014.js?v=7",
                url: window.fancyDice.assetsUrl + "/d6tex2014.json",
                type: "d6",
            },
            {
                url: "/js/models/d6Fate/d6fatetex2014.js?v=7",
                type: "df",
            },
            {
                url: "/js/models/d8/d8tex2014.js?v=3",
                type: "d8",
            },
            {
                url: "/js/models/d10/d10tex2014.js?v=4",
                type: "d10",
            },
            {
                url: "/js/models/d10Pct10s/d10pct10stex2014.js?v=1",
                type: "dpct10s",
            },
            {
                url: "/js/models/d10Pct1s/d10pct1stex2014.js?v=1",
                type: "dpct1s",
            },
            {
                url: "/js/models/d12/d12tex2014.js?v=3",
                type: "d12",
            },
            {
                url: "/js/models/d20/d20tex2014.js?v=3",
                type: "d20",
            },
        ]
    };
    
    async function fetchCustomDice(playerId) {
        try {
            // TODO: Check if the server has it and then set the map.
            if (playerId === "-LjCgFYxbhdFfpfdfvQ2") {
                return testCustomDice;
            }
            return null;
        } catch (error) {
            console.error("Error fetching custom data data for player", playerId, error);
            return null;
        }
    }
    
    window.fancyDice.getCustomDiceByPlayerId = getCustomDiceByPlayerId;
})();
`;

export default tempCode;