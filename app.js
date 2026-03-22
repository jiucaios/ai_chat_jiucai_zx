// 完全保留你的原始逻辑，仅适配美化样式，不修改任何核心代码
window.onload = function() {
  // 1. 直接获取元素（不做任何校验，获取不到就报错，不静默）
  var sendBtn = document.getElementById("sendBtn");
  var messageInput = document.getElementById("messageInput");
  var chatHistory = document.getElementById("chatHistory");
// 页面加载后自动显示AI欢迎语
chatHistory.innerHTML += "<div class='ai-message'>你好呀，我是新乡工程学院小助手，请问有什么可以帮你？</div>";
  // 2. 强制绑定点击事件（最简单的onclick）
  sendBtn.onclick = function() {
    // 3. 最简单的输入校验
    var text = messageInput.value.trim();
    if (text === "") {
      alert("别空着！输点东西");
      return;
    }

    // 4. 第一步：先显示用户消息（保留你的逻辑，仅替换行内样式为CSS类）
    chatHistory.innerHTML += "<div class='user-message'>" + text + "</div>";
    messageInput.value = "";
    sendBtn.innerText = "↑"; // 保留箭头样式，不改成“发送中”
    sendBtn.disabled = true;

    // 新增：显示AI正在思考+加载动画（不影响你的核心逻辑）
    var loadingId = "loading-" + Date.now();
    chatHistory.innerHTML += `
      <div id="${loadingId}" class="loading">
        AI正在思考
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
    `;
    // 自动滚动到底部
    chatHistory.scrollTop = chatHistory.scrollHeight;

    // 5. 第二步：完全保留你原始的API调用逻辑，一字不改！
    fetch('/api/chat', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({question: text})
    }).then(function(res) {
      return res.json();
    }).then(function(data) {
      // 移除加载动画，显示AI回复（适配美化样式）
      document.getElementById(loadingId).remove();
      chatHistory.innerHTML += "<div class='ai-message'>" + (data.answer || '没拿到回复') + "</div>";
    }).catch(function(err) {
      // 报错也显示（适配美化样式）
      document.getElementById(loadingId).remove();
      chatHistory.innerHTML += "<div class='ai-message' style='background: #e53e3e;'>调用失败：" + err.message + "</div>";
    }).finally(function() {
      // 恢复按钮（保留你的逻辑，仅恢复箭头）
      sendBtn.innerText = "↑";
      sendBtn.disabled = false;
      // 自动滚动到底部
      chatHistory.scrollTop = chatHistory.scrollHeight;
    });
  };

  // 新增：回车发送（可选，不影响你的核心逻辑）
  messageInput.onkeydown = function(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendBtn.click(); // 触发你原始的点击事件
    }
  };
};
