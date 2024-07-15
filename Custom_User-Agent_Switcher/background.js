// 监听 storage 变化，并更新规则
chrome.storage.onChanged.addListener(function(changes, area) {
  if (area === "sync" && changes.rules) {
    // console.log(changes.rules.newValue);
    updateRules(changes.rules.newValue);
  }
});

// 更新 declarativeNetRequest 规则的函数
function updateRules(rules) {

  // 移除所有规则
  chrome.declarativeNetRequest.getDynamicRules(function(rules) {
    let ruleIdsToRemove = rules.map(rule => rule.id);
    console.log(ruleIdsToRemove);
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: ruleIdsToRemove
    }, function() {
      if (chrome.runtime.lastError) {
        console.log('Dynamic rules removed error!');
      } else {
        console.log('All dynamic rules removed successfully.');
      }
    });
  });

  // 生成id防止重复冲突
  function getNextAvailableId(existingIds) {
    let maxId = Math.max(...existingIds, 0);
    return maxId + 1;
  }

  // 导入所有规则
  chrome.declarativeNetRequest.getDynamicRules((existingRules) => {
    let existingIds = existingRules.map(rule => rule.id);
    let nextId = getNextAvailableId(existingIds);
    let declarativeRules = rules.map((rule) => {
      let newRule = {
        "id": nextId,
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
      };
      nextId++;
      return newRule;
    });

    console.log(declarativeRules);
    chrome.declarativeNetRequest.updateDynamicRules({
      addRules: declarativeRules
    }, function() {
      if (chrome.runtime.lastError) {
        console.log('Dynamic rules add error!');
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icon.png',
          title: 'Error !',
          message: '错误：数据异常 请尝试清除规则后重新添加 !'
        });
      } else {
        console.log('All dynamic rules add successfully.');
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icon.png',
          title: 'Success !',
          message: '成功：规则已生效 !'
        });
      }
    });
  });

}

// 从存储加载初始规则
chrome.storage.sync.get(["rules"], function(result) {
  if (result.rules) {
    updateRules(result.rules);
  }
});
