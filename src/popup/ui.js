import CustomDiceTypes from "../shared/custom-dice-types.js";
import DiceTypes from "../shared/dice-types.js";
import {getState, setState} from "./state.js";
import {getCustomDiceTypeByKey, getFirstNotNull} from "../shared/utils.js";
import {
    selectCampaignToUseGlobally,
    selectDiceChoices, selectDiceOverrideColor, selectUseDiceColorOverride, selectUseIndividualDice,
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
        document.querySelector("#main-selected-dice").classList.add("hidden");
    } else {
        document.querySelector("#individual-selected-dice").classList.add("hidden");
        document.querySelector("#main-selected-dice").classList.remove("hidden");
    }
    updateSelectedDiceButtons();
}

export function updateSelectedDiceButtons() {
    const {diceChoices} = getState();
    if (document.querySelector("#use-individual-dice").checked) {
        document.querySelectorAll(".individual-dice-selector").forEach(element => {
            const choice = diceChoices[element.dataset.diceType];
            const button = element.querySelector(".dice");
            setDiceChoiceButton(button, choice);
        });
    } else {
        const choice = getFirstNotNull(Object.values(diceChoices)) || CustomDiceTypes.ORIGINAL.key;
        setDiceChoiceButton(document.querySelector("#main-selected-dice"), choice);
    }
}

export function setDiceChoiceButton(button, choice) {
    const image = button.querySelector("img");
    const title = button.querySelector("span");
    const customDiceType = getCustomDiceTypeByKey(choice);
    image.src = `../assets/custom-dice/${customDiceType.key}/thumbnail.png`;
    image.alt = customDiceType.name;
    title.textContent = customDiceType.name;
}


export function createDiceButton(classes) {
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
        setDiceChoiceButton(button, choice);

        div.appendChild(span);
        div.appendChild(button);
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
}

export function initializeValues(data) {
    const campaignToUseGlobally = selectCampaignToUseGlobally(data);
    const {campaignInfo} = getState();
    const campaignToUse = campaignToUseGlobally || campaignInfo.id;

    const diceChoices = selectDiceChoices(data, campaignToUse);
    const useDiceColorOverride = selectUseDiceColorOverride(data, campaignToUse);
    const diceOverrideColor = selectDiceOverrideColor(data, campaignToUse);
    const useIndividualDice = selectUseIndividualDice(data, campaignToUse);

    if (diceChoices != null) {
        setState({diceChoices: JSON.parse(diceChoices)});
    }
    updateSelectedDiceButtons();
    document.querySelector("#use-selected-dice-globally").checked = campaignToUseGlobally != null;
    if (useDiceColorOverride != null) {
        document.querySelector("#use-dice-color-override").checked = useDiceColorOverride;
    }
    if (diceOverrideColor != null) {
        document.querySelector("#dice-color-override").value = diceOverrideColor;
    }
    if (useIndividualDice != null) {
        document.querySelector("#use-individual-dice").checked = useIndividualDice;
        updateDiceSelectors();
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
    });

    document.querySelector("#dice-color-override").addEventListener("input", (e) => {
        setDiceOverrideColor(e.target.value);
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