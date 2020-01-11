import CustomDiceTypes from "./custom-dice-types.js";

export function testString(pattern, str) {
    if (typeof pattern === "string") {
        return str.includes(pattern);
    } else {
        return pattern.test(str);
    }
}

export function getCustomDiceTypeByKey(key) {
    return Object.values(CustomDiceTypes)
        .find(t => t.key === key);
}

export function getFirstNotNull(array) {
    return array.find(x => x != null);
}