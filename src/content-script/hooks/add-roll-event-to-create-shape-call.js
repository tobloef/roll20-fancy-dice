import ScriptUrls from "../../shared/script-urls.js";

const addRollEventToCreateShapeCall = {
    name: "Add roll event to createShape call",
    scriptUrls: [ScriptUrls.APP],
    find: /createShape\("d"\+(.+?).maxroll,/,
    // language=JavaScript
    replaceWith: `createShape($1.rollEvent, "d" + $1.maxroll,`,
};

export default addRollEventToCreateShapeCall;