import ScriptUrls from "../../shared/script-urls.js";

const addRollEventToCreateShapeCall = {
    name: "Add roll event to createShape call",
    scriptUrls: [ScriptUrls.APP],
    find: `createShape("d"+S[a].maxroll,`,
    // language=JavaScript
    replaceWith: `createShape(S[a].rollEvent, "d" + S[a].maxroll,`,
};

export default addRollEventToCreateShapeCall;