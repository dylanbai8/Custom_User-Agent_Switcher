document.addEventListener("DOMContentLoaded", function() {
  let rulesContainer = document.getElementById("rules");
  let addRuleButton = document.getElementById("addRule");
  let saveButton = document.getElementById("save");

  // 从存储加载现有规则
  chrome.storage.sync.get(["rules"], function(result) {
    if (result.rules) {
      for (let rule of result.rules) {
        addRule(rule.domain, rule.userAgent);
      }
    }
  });

  // 在UI中添加一个新规则
  addRuleButton.addEventListener("click", function() {
    addRule("", "");
  });

  // 保存规则到存储
  saveButton.addEventListener("click", function() {
    let rules = [];
    let ruleElements = document.querySelectorAll(".rule");
    for (let ruleElement of ruleElements) {
      let domain = ruleElement.querySelector(".domain").value;
      let userAgent = ruleElement.querySelector(".userAgent").value;
      if (domain && userAgent) {
        rules.push({domain, userAgent});
      }
    }
    chrome.storage.sync.set({rules}, function() {
      alert("规则已保存！");
    });
  });

  // 在UI中添加一个规则元素的函数
  function addRule(domain, userAgent) {
    let ruleElement = document.createElement("div");
    ruleElement.className = "rule";
    ruleElement.innerHTML = `
      <label>域名关键词:</label>
      <input type="text" class="domain" value="${domain}">
      <label>User-Agent:</label>
      <input type="text" class="userAgent" value="${userAgent}">
      <button class="removeRule">移除</button>
    `;
    ruleElement.querySelector(".removeRule").addEventListener("click", function() {
      ruleElement.remove();
    });
    rulesContainer.appendChild(ruleElement);
  }
});
