export function sync() {
    chrome.storage.sync.get(null, (data) => {
        // TODO: Sync with content script and web socket
        console.log(data);
    });
}