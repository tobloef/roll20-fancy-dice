const prefix = "FANCYDICE:";

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
    console.error(prefix, ...args);
}

export default {
    prefix,
    debug,
    info,
    warn,
    error
}