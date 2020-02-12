import CustomDiceTypes from "../shared/custom-dice-types.js";
import DiceTypes from "../shared/dice-types.js";
import {getState, setState} from "./state.js";
import {getCustomDiceTypeByKey, getFirstNotNull} from "../shared/utils.js";
import {
    selectCampaignToUseGlobally,
    selectDiceChoices,
    selectDiceOverrideColor,
    selectUseDiceColorOverride,
    selectUseIndividualDice,
    setCampaignToUseGlobally,
    setDiceChoices,
    setDiceOverrideColor,
    setUseDiceColorOverride,
    setUseIndividualDice,
} from "../shared/storage.js";

export function updateCampaignInfoText() {
    const {campaignInfo} = getState();
    if (campaignInfo == null || document.querySelector("#use-selected-dice-globally").checked) {
        document.querySelector("#campaign-info").textContent = "(for all campaigns)";
    } else {
        document.querySelector("#campaign-info").textContent = `(for ${campaignInfo.title})`;
    }
}

export function goToDiceSelector() {
    document.querySelector("#main-page").classList.add("hidden");
    document.querySelector("#dice-selection-page").classList.remove("hidden");
    document.querySelector("header h1").textContent = "Select dice";
    document.querySelector("#back").classList.remove("hidden");
}

export function goToMainPage() {
    document.querySelector("#main-page").classList.remove("hidden");
    document.querySelector("#dice-selection-page").classList.add("hidden");
    document.querySelector("header h1").textContent = "Settings";
    document.querySelector("#back").classList.add("hidden");
}

export function updateDiceSelectors() {
    if (document.querySelector("#use-individual-dice").checked) {
        document.querySelector("#individual-selected-dice").classList.remove("hidden");
        document.querySelector("#main-dice-selection").classList.add("hidden");
    } else {
        document.querySelector("#individual-selected-dice").classList.add("hidden");
        document.querySelector("#main-dice-selection").classList.remove("hidden");
    }
    updateSelectedDiceButtons();
}

export function updateSelectedDiceButtons() {
    const {diceChoices} = getState();
    if (document.querySelector("#use-individual-dice").checked) {
        document.querySelectorAll(".individual-dice-selector").forEach(element => {
            const choice = diceChoices[element.dataset.diceType];
            const button = element.querySelector(".dice");
            const customDice = getCustomDiceTypeByKey(choice);
            setDiceChoiceButton(button, customDice);
        });
    } else {
        const choice = getFirstNotNull(Object.values(diceChoices)) || CustomDiceTypes.ORIGINAL.key;
        const customDice = getCustomDiceTypeByKey(choice);
        setDiceChoiceButton(document.querySelector("#main-selected-dice"), customDice);
    }
}

export function setDiceChoiceButton(button, customDice) {
    const image = button.querySelector(".thumbnail");
    const colorSupport = button.querySelector(".color-support");
    if (customDice.useColor) {
        colorSupport.classList.remove("hidden");
    } else {
        colorSupport.classList.add("hidden");
    }
    const title = button.querySelector("span");
    image.src = `../assets/custom-dice/${customDice.key}/thumbnail.png`;
    image.alt = customDice.name;
    title.textContent = customDice.name;
}


export function createDiceButton(classes) {
    const button = document.createElement("div");
    button.classList.add("dice");
    for (const cssClass of classes) {
        button.classList.add(cssClass);
    }
    const thumbnail = document.createElement("img");
    thumbnail.classList.add("thumbnail");
    const span = document.createElement("span");
    const colorSupport = document.createElement("img");
    colorSupport.classList.add("hidden");
    colorSupport.classList.add("color-support");
    colorSupport.src = "../assets/icons/color.png";
    button.appendChild(thumbnail);
    button.appendChild(span);
    button.appendChild(colorSupport);
    return button;
}

export function insertIndividualDiceSelectors() {
    for (const [diceType, diceTypeName] of Object.entries(DiceTypes)) {
        const div = document.createElement("div");
        div.classList.add("individual-dice-selector");
        div.dataset.diceType = diceType;

        const span = document.createElement("span");
        span.textContent = diceTypeName;
        span.classList.add("dice-type");

        const button = createDiceButton(["horizontal", "smaller"]);
        button.addEventListener("click", () => {
            setState({currentDiceTypeToSelect: diceType});
            goToDiceSelector();
        });
        const {diceChoices} = getState();
        const choice = diceChoices[diceType] || CustomDiceTypes.ORIGINAL.key;
        const customDice = getCustomDiceTypeByKey(choice);
        setDiceChoiceButton(button, customDice);

        const colorInput = document.createElement("input");
        colorInput.classList.add("dice-color-override");
        colorInput.type = "color";
        colorInput.dataset.diceType = diceType;
        colorInput.addEventListener("input", (e) => {
            setDiceOverrideColor(e.target.value, diceType);
        });

        div.appendChild(span);
        div.appendChild(button);
        div.appendChild(colorInput);
        document.querySelector("#individual-selected-dice").appendChild(div);
    }
}

export function insertDiceChoices(customDiceTypesToUse) {
    for (const customDice of customDiceTypesToUse) {
        const button = createDiceButton(["box"]);
        button.addEventListener("click", () => {
            const {currentDiceTypeToSelect, diceChoices} = getState();
            if (currentDiceTypeToSelect === "all") {
                for (const diceType of Object.keys(DiceTypes)) {
                    diceChoices[diceType] = customDice.key;
                }
            } else {
                diceChoices[currentDiceTypeToSelect] = customDice.key;
            }
            updateSelectedDiceButtons();
            goToMainPage();
            setDiceChoices(diceChoices);
            updateDiceColorInputs();
        });
        setDiceChoiceButton(button, customDice);
        document.querySelector("#dice-list").appendChild(button);
    }
    const spacersNeeded = 4 - (Object.keys(customDiceTypesToUse).length % 4);
    for (let i = 0; i < spacersNeeded; i++) {
        const spacer = document.createElement("div");
        spacer.classList.add("spacer");
        document.querySelector("#dice-list").appendChild(spacer);
    }
}

export function initializeValues(data) {
    const campaignToUseGlobally = selectCampaignToUseGlobally(data);
    const {campaignInfo} = getState();
    const campaignToUse = campaignToUseGlobally || campaignInfo.id;

    const diceChoices = selectDiceChoices(data, campaignToUse);
    const useDiceColorOverride = selectUseDiceColorOverride(data, campaignToUse);
    const useIndividualDice = selectUseIndividualDice(data, campaignToUse);

    if (diceChoices != null) {
        setState({diceChoices: JSON.parse(diceChoices)});
    }
    updateSelectedDiceButtons();
    document.querySelector("#use-selected-dice-globally").checked = campaignToUseGlobally != null;
    if (useDiceColorOverride != null) {
        document.querySelector("#use-dice-color-override").checked = useDiceColorOverride;
        updateDiceColorInputs();
    }
    if (useIndividualDice != null) {
        document.querySelector("#use-individual-dice").checked = useIndividualDice;
        updateDiceSelectors();
    }
    const diceOverrideColor = selectDiceOverrideColor(data, campaignToUse, "all");
    if (diceOverrideColor != null) {
        document.querySelector("#main-selected-dice-color-override").value = diceOverrideColor;
    }
    for (const diceType of Object.keys(DiceTypes)) {
        const diceOverrideColor = selectDiceOverrideColor(data, campaignToUse, diceType);
        document.querySelector(`.dice-color-override[data-dice-type="${diceType}"]`).value = diceOverrideColor;
    }
}

export function setupUiListeners() {
    document.querySelector("#back").addEventListener("click", (e) => {
        goToMainPage();
    });

    document.querySelector("#main-selected-dice").addEventListener("click", (e) => {
        setState({currentDiceTypeToSelect: "all"});
        goToDiceSelector();
    });

    document.querySelector("#use-selected-dice-globally").addEventListener("input", (e) => {
        if (e.target.checked) {
            const {campaignInfo} = getState();
            setCampaignToUseGlobally(campaignInfo.id);
        } else {
            setCampaignToUseGlobally(null);
        }
    });

    document.querySelector("#use-dice-color-override").addEventListener("input", (e) => {
        setUseDiceColorOverride(e.target.checked);
        updateDiceColorInputs();
    });

    document.querySelector("#main-selected-dice-color-override").addEventListener("input", (e) => {
        setDiceOverrideColor(e.target.value, "all");
    });

    document.querySelectorAll(".dice-color-override").forEach(element => {
        element.addEventListener("input", (e) => {
            setDiceOverrideColor(e.target.value, e.target.data.diceType);
        });
    });

    document.querySelector("#use-individual-dice").addEventListener("input", (e) => {
        const {diceChoices} = getState();
        const choice = getFirstNotNull(Object.values(diceChoices)) || CustomDiceTypes.ORIGINAL.key;
        for (const diceType of Object.keys(DiceTypes)) {
            diceChoices[diceType] = choice;
        }
        updateDiceSelectors();
        setUseIndividualDice(e.target.checked);
    });

    document.querySelector("#only-color-support-dice").addEventListener("input", (e) => {
        document.querySelector("#dice-list").innerHTML = "";
        const customDiceTypesToUse = Object.values(CustomDiceTypes)
            .filter(d => !e.target.checked || d.useColor);
        insertDiceChoices(customDiceTypesToUse);
    });
}

export function updateWaitingForRoll20() {
    const {roll20Ready} = getState();
    if (roll20Ready) {
        document.querySelector("#main-page").classList.remove("invisible");
        document.querySelector("#waiting-for-roll20").classList.add("hidden");
    } else {
        document.querySelector("#main-page").classList.add("invisible");
        document.querySelector("#waiting-for-roll20").classList.remove("hidden");
    }
}

export function updateDiceColorInputs() {
    const f = (colorInput, customDice, useIndividual) => {
        console.log("f", colorInput, customDice, useIndividual);
        colorInput.disabled = !customDice.useColor;
        if (useIndividual) {
            colorInput.classList.remove("hidden");
        } else {
            colorInput.classList.add("hidden");
        }
    };
    const useIndividual = document.querySelector("#use-dice-color-override").checked;
    const {diceChoices} = getState();
    for (const diceType of Object.keys(DiceTypes)) {
        const customDice = getCustomDiceTypeByKey(diceChoices[diceType]);
        const colorInput = document.querySelector(`.dice-color-override[data-dice-type="${diceType}"]`);
        f(colorInput, customDice, useIndividual);
    }
    const mainChoice = getFirstNotNull(Object.values(diceChoices));
    const customDice = getCustomDiceTypeByKey(mainChoice) || getCustomDiceTypeByKey(CustomDiceTypes.ORIGINAL.key);
    const colorInput = document.querySelector("#main-selected-dice-color-override");
    f(colorInput, customDice, useIndividual);
}