/**
 * Urls where CORS should be allowed on.
 */

import {testString} from "../shared/utils.js";

const corsUrls = [
    /https:\/\/app\.roll20\.net\/editor\/?/
];

/**
 * Set the CORS policy of a request, depending on it's destination.
 */
export function setCorsPolicy(req) {
    if (!checkShouldAllowCors(req)) {
        return;
    }
    allowBlobCors(req);
    delete req.frameId;
    return req;
}

/**
 * Check whether CORS should be allowed for a given request.
 */
function checkShouldAllowCors(request) {
    return corsUrls.some(url => testString(url, request.url));
}

/**
 * Allow blob url CORS.
 */
function allowBlobCors(req) {
    if (req.responseHeaders == null) {
        return;
    }
    for (let i = 0; i < req.responseHeaders.length; i++) {
        const header = req.responseHeaders[i];
        const name = header.name.toLowerCase();
        if (name !== "content-security-policy") {
            continue;
        }
        header.value += " blob:";
    }
}