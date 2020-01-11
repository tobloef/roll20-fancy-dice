import ScriptUrls from "../../shared/script-urls.js";

const exposeD20 = {
    name: `Expose D20 globally`,
        scriptUrls: [ScriptUrls.APP],
    find: `getPointer,degreesToRadians;`,
    // language=JavaScript
    replaceWith: `getPointer,degreesToRadians;window.fancyDice.d20=d20;`,
};

export default exposeD20;