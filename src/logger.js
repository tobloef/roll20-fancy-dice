const prefix = "FANCY:";

function debug(...args) {
    console.debug(prefix, ...args);
}

function info(...args) {
    console.info(prefix, ...args);
}

function warn(...args) {
    console.warn(prefix, ...args);
}

function error(...args) {
    console.warn(prefix, ...args);
}

export default {
    debug,
    info,
    warn,
    error
}