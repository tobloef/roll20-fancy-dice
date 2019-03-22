const injectScript = function (name) {
    const s = document.createElement("script");
    s.async = false;
    s.src = chrome.extension.getURL(name);
    s.onload = () => {
        s.remove();
    };
    document.head.appendChild(s);
};

export {
    injectScript
};

