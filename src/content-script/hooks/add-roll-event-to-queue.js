import ScriptUrls from "../../shared/script-urls.js";

const addRollEventToQueue = {
    name: "Add roll event to roll queue data",
    scriptUrls: [ScriptUrls.APP],
    find: /S.push\({maxroll:n\[i\],callback:!1}\)/,
    // language=JavaScript
    replaceWith: `
        S.push({
            maxroll: n[i],
            callback: !1,
            rollEvent: e
        });
    `,
};

export default addRollEventToQueue;