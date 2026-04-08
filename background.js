// TTD Auto Fill Pro - Background Service Worker

chrome.runtime.onInstalled.addListener(() => {
  console.log('TTD Auto Fill Pro: Extension installed');
  
  // Initialize default storage if needed
  chrome.storage.local.get(['pilgrims'], (result) => {
    if (!result.pilgrims) {
      chrome.storage.local.set({ pilgrims: [] });
    }
  });
});

// Optional: Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'LOG') {
    console.log('From Content Script:', request.message);
  }

  if (request.type === 'TTD_UPDATE_LITE_MODE') {
    updateLiteModeRules(request.enabled);
  }
});

// Lite Mode: Block non-essential images and tracking scripts on TTD domains
async function updateLiteModeRules(enabled) {
  const ruleId = 1;
  const ttdDomains = [
    "ttdevasthanams.ap.gov.in",
    "tirupatibalaji.ap.gov.in"
  ];

  if (enabled) {
    // Define rules to block images and scripts that are not essential for booking
    // We keep essential scripts by not blocking everything, or specifically excluding them
    // For TTD, blocking large images and common tracking/analytics is usually safe
    const rules = [
      {
        id: ruleId,
        priority: 1,
        action: { type: "block" },
        condition: {
          urlFilter: "*",
          resourceTypes: ["image", "media"],
          initiatorDomains: ttdDomains,
          // Exclude essential icons or small UI elements if needed
          // For now, block all images to maximize speed
        }
      },
      {
        id: ruleId + 1,
        priority: 1,
        action: { type: "block" },
        condition: {
          urlFilter: "google-analytics.com",
          initiatorDomains: ttdDomains
        }
      },
      {
        id: ruleId + 2,
        priority: 1,
        action: { type: "block" },
        condition: {
          urlFilter: "facebook.net",
          initiatorDomains: ttdDomains
        }
      }
    ];

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [ruleId, ruleId + 1, ruleId + 2],
      addRules: rules
    });
    console.log('TTD Auto Fill Pro: Lite Mode rules enabled');
  } else {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [ruleId, ruleId + 1, ruleId + 2]
    });
    console.log('TTD Auto Fill Pro: Lite Mode rules disabled');
  }
}

// Ensure rules are synced on startup
chrome.storage.local.get(['liteMode'], (result) => {
  if (result.liteMode) {
    updateLiteModeRules(true);
  }
});
