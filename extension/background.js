// TailorFlow Background Service Worker (Manifest V3)

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "capture-to-tailorflow",
    title: "Capture Look to TailorFlow Dashboard",
    contexts: ["page", "image", "video", "link"]
  });
  console.log("TailorFlow extension installed & context menu initialized.");
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "capture-to-tailorflow" && tab.id) {
    chrome.tabs.sendMessage(tab.id, { action: "EXTRACT_PAGE_DATA" }, (response) => {
      if (chrome.runtime.lastError) {
        console.warn("Could not inject script or talk to tab:", chrome.runtime.lastError.message);
        return;
      }
      if (response && response.data) {
        // Save to staging in chrome.storage
        chrome.storage.local.get({ staged_posts: [] }, (res) => {
          const list = res.staged_posts;
          list.unshift({
            ...response.data,
            captured_at: new Date().toISOString()
          });
          chrome.storage.local.set({ staged_posts: list.slice(0, 50) }, () => {
            console.log("Look saved to TailorFlow staging.");
          });
        });
      }
    });
  }
});
