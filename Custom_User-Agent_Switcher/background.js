// 监听 storage 变化，并更新规则
chrome.storage.onChanged.addListener(function(changes, area) {
  if (area === "sync" && changes.rules) {
    updateRules(changes.rules.newValue);
  }
});

// 更新 declarativeNetRequest 规则的函数
function updateRules(rules) {
  let declarativeRules = rules.map((rule, index) => ({
    "id": index + 1,
    "priority": 1,
    "action": {
      "type": "modifyHeaders",
      "requestHeaders": [
        {
          "header": "User-Agent",
          "operation": "set",
          "value": rule.userAgent
        }
      ]
    },
    "condition": {
      "urlFilter": rule.domain,
      "resourceTypes": ["main_frame"]
    }
  }));

  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: declarativeRules.map(rule => rule.id),
    addRules: declarativeRules
  }, () => {
    console.log('规则已更新');
  });
}

// 从存储加载初始规则
chrome.storage.sync.get(["rules"], function(result) {
  if (result.rules) {
    updateRules(result.rules);
  }
});
