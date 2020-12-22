import ScriptUrls from "../../shared/script-urls.js";

const addRollEventToQueue = {
    name: "Add roll event to roll queue data",
    scriptUrls: [ScriptUrls.APP],
    find: /doRemoteRoll=function\((.),(.)\)(.*?)(.)\.push\(\{maxroll:(.\[.\]),callback:!1\}\)/,
    // language=JavaScript
    replaceWith: `doRemoteRoll=function($1,$2)$3$4.push({maxroll:$5,callback:!1,rollEvent:$1})`,
};

export default addRollEventToQueue;