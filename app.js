// 放弃复杂封装，直接用最基础的写法
window.onload = function() {
  // 1. 直接获取元素（不做任何校验，获取不到就报错，不静默）
  var sendBtn = document.getElementById("sendBtn");
  var messageInput = document.getElementById("messageInput");
  var chatHistory = document.getElementById("chatHistory");

  // 2. 强制绑定点击事件（最简单的onclick）
  sendBtn.onclick = function() {
    // 3. 最简单的输入校验
    var text = messageInput.value.trim();
    if (text === "") {
      alert("别空着！输点东西");
      return;
    }

    // 4. 第一步：先显示用户消息（不管后端咋样，先让你看到反应）
    chatHistory.innerHTML += "<div style='background: #4299e1; padding: 10px; margin: 5px; border-radius: 8px; text-align: right;'>" + text + "</div>";
    messageInput.value = "";
    sendBtn.innerText = "发送中...";
    sendBtn.disabled = true;

    // 5. 第二步：调用API（本地跑会跨域报错，但按钮已经动了！）
    // 本地跑时，这步会报错，但不影响「按钮点得动、用户消息显示」
    fetch('/api/chat', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({question: text})
    }).then(function(res) {
      return res.json();
    }).then(function(data) {
      // 显示AI回复
      chatHistory.innerHTML += "<div style='background: #323250; padding: 10px; margin: 5px; border-radius: 8px;'>" + (data.answer || '没拿到回复') + "</div>";
    }).catch(function(err) {
      // 报错也显示，不静默
      chatHistory.innerHTML += "<div style='background: #e53e3e; padding: 10px; margin: 5px; border-radius: 8px;'>调用失败：" + err.message + "</div>";
    }).finally(function() {
      // 恢复按钮
      sendBtn.innerText = "发送";
      sendBtn.disabled = false;
    });
  };
};
