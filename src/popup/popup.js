document.body.onload = () => {
    let currentDiceTypeToSelect;
    let currentCampaign;
    let diceChoices = {};

    const goToDiceSelector = () => {
        document.querySelector("#main-page").classList.add("hidden");
        document.querySelector("#dice-selection-page").classList.remove("hidden");
    };

    const goToMainPage = () => {
        document.querySelector("#main-page").classList.remove("hidden");
        document.querySelector("#dice-selection-page").classList.add("hidden");
    };

    const sync = () => {
        chrome.storage.sync.get([
            "dice-choices",
            "use-selected-dice-globally",
            "use-dice-color-override",
            "dice-color-override",
            "use-individual-dice",
        ], (data) => {
            // TODO
            console.log(data);
        });
    };

    const setDiceChoicesUI = (value) => {
        diceChoices = value;
        updateSelectedDiceButtons();
    };

    const setUseSelectedDiceGloballyUI = (value) => {
        document.querySelector("#use-selected-dice-globally").checked = value;
    };

    const setUseDiceColorOverrideUI = (value) => {
        document.querySelector("#use-dice-color-override").checked = value;
    };

    const setDiceColorOverrideUI = (value) => {
        document.querySelector("#dice-color-override").value = value;
    };

    const setUseIndividualDiceUI = (value) => {
        document.querySelector("#use-individual-dice").checked = value;
        if (value) {
            document.querySelector("#individual-selected-dice").classList.remove("hidden");
            document.querySelector("#main-selected-dice").classList.add("hidden");
        } else {
            document.querySelector("#individual-selected-dice").classList.add("hidden");
            document.querySelector("#main-selected-dice").classList.remove("hidden");
        }
        updateSelectedDiceButtons();
    };

    const updateSelectedDiceButtons = () => {
        if (document.querySelector("#use-individual-dice").checked) {
            document.querySelectorAll(".individual-dice-selector").forEach(element => {
                const choice = diceChoices[element.dataset.diceType];
                const button = element.querySelector(".dice");
                setDiceChoiceButton(button, choice);
            });
        } else {
            const choice = getFirstDiceChoiceNotNull() || window.customDiceTypes.ORIGINAL.key;
            setDiceChoiceButton(document.querySelector("#main-selected-dice"), choice);
        }
    };

    const setDiceChoiceButton = (button, choice) => {
        const image = button.querySelector("img");
        const title = button.querySelector("span");
        const customDiceType = getCustomDiceTypeByKey(choice);
        image.src = `../assets/custom-dice/${customDiceType.key}/thumbnail.png`;
        image.alt = customDiceType.name;
        title.textContent = customDiceType.name;
    };

    const getFirstDiceChoiceNotNull = () => {
        return Object.values(diceChoices)
            .find(c => c != null);
    };

    const getCustomDiceTypeByKey = (key) => {
        return Object.values(window.customDiceTypes)
            .find(t => t.key === key);
    };

    const createDiceButton = (classes) => {
        const button = document.createElement("div");
        button.classList.add("dice");
        for (const cssClass of classes) {
            button.classList.add(cssClass);
        }
        const img = document.createElement("img");
        const span = document.createElement("span");
        button.appendChild(img);
        button.appendChild(span);
        return button;
    };

    const insertIndividualDiceSelectors = () => {
        for (const [diceType, diceTypeName] of Object.entries(window.diceTypes)) {
            const div = document.createElement("div");
            div.classList.add("individual-dice-selector");
            div.dataset.diceType = diceType;

            const span = document.createElement("span");
            span.textContent = diceTypeName;
            span.classList.add("dice-type");

            const button = createDiceButton(["horizontal", "smaller"]);
            button.addEventListener("click", () => {
                currentDiceTypeToSelect = diceType;
                goToDiceSelector();
            });
            const choice = diceChoices[diceType] || window.customDiceTypes.ORIGINAL.key;
            setDiceChoiceButton(button, choice);

            div.appendChild(span);
            div.appendChild(button);
            document.querySelector("#individual-selected-dice").appendChild(div);
        }
    };

    const insertDiceChoices = (customDiceTypesToUse) => {
        for (const customDice of customDiceTypesToUse) {
            const button = createDiceButton(["box"]);
            button.addEventListener("click", () => {
                if (currentDiceTypeToSelect === "all") {
                    for (const diceType of Object.keys(window.diceTypes)) {
                        diceChoices[diceType] = customDice.key;
                    }
                } else {
                    diceChoices[currentDiceTypeToSelect] = customDice.key;
                }
                setDiceChoicesUI(diceChoices);
                chrome.storage.sync.set({
                    ["dice-choices"]: JSON.stringify(diceChoices)
                }, sync);
                goToMainPage();
            });
            setDiceChoiceButton(button, customDice.key);
            document.querySelector("#dice-list").appendChild(button);
        }
        const spacersNeeded = 4 - (Object.keys(customDiceTypesToUse).length % 4);
        for (let i = 0; i < spacersNeeded; i++) {
            const spacer = document.createElement("div");
            spacer.classList.add("spacer");
            document.querySelector("#dice-list").appendChild(spacer);
        }
    };

    const initializeValues = () => {
        chrome.storage.sync.get([
            "dice-choices",
            "use-selected-dice-globally",
            "use-dice-color-override",
            "dice-color-override",
            "use-individual-dice",
        ], (result) => {
            if (result["dice-choices"] != null) {
                setDiceChoicesUI(JSON.parse(result["dice-choices"]));
            }
            if (result["use-selected-dice-globally"] != null) {
                setUseSelectedDiceGloballyUI(result["use-selected-dice-globally"]);
            }
            if (result["use-dice-color-override"] != null) {
                setUseDiceColorOverrideUI(result["use-dice-color-override"]);
            }
            if (result["dice-color-override"] != null) {
                setDiceColorOverrideUI(result["dice-color-override"]);
            }
            if (result["use-individual-dice"] != null) {
                setUseIndividualDiceUI(result["use-individual-dice"]);
            }
        });
    };

    insertIndividualDiceSelectors();
    insertDiceChoices(Object.values(window.customDiceTypes));
    initializeValues();

    document.querySelector("#back").addEventListener("click", (e) => {
        goToMainPage();
    });

    document.querySelector("#main-selected-dice").addEventListener("click", (e) => {
        currentDiceTypeToSelect = "all";
        goToDiceSelector();
    });

    document.querySelector("#use-selected-dice-globally").addEventListener("input", (e) => {
        setUseSelectedDiceGloballyUI(e.target.checked);
        chrome.storage.sync.set({
            ["use-selected-dice-globally"]: e.target.checked
        }, sync);
    });

    document.querySelector("#use-dice-color-override").addEventListener("input", (e) => {
        setUseDiceColorOverrideUI(e.target.checked);
        chrome.storage.sync.set({
            ["use-dice-color-override"]: e.target.checked
        }, sync);
    });

    document.querySelector("#dice-color-override").addEventListener("input", (e) => {
        setDiceColorOverrideUI(e.target.value);
        chrome.storage.sync.set({
            ["dice-color-override"]: e.target.value
        }, sync);
    });

    document.querySelector("#use-individual-dice").addEventListener("input", (e) => {
        setUseIndividualDiceUI(e.target.checked);
        chrome.storage.sync.set({
            ["use-individual-dice"]: e.target.checked
        }, sync);
    });

    document.querySelector("#only-color-support-dice").addEventListener("input", (e) => {
        document.querySelector("#dice-list").innerHTML = "";
        const customDiceTypesToUse = Object.values(window.customDiceTypes)
            .filter(d => !e.target.checked || d.useColor);
        console.log("input", customDiceTypesToUse);
        insertDiceChoices(customDiceTypesToUse);
    });
};
