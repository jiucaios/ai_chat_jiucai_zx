// 最基础写法，保留核心逻辑，适配UI样式+增强体验
window.onload = function() {
  // 直接获取元素
  var sendBtn = document.getElementById("sendBtn");
  var messageInput = document.getElementById("messageInput");
  var chatHistory = document.getElementById("chatHistory");
  var homeBtn = document.getElementById("homeBtn");

  // 发送消息核心函数
  function sendMessage() {
    // 输入校验
    var text = messageInput.value.trim();
    if (text === "") {
      alert("别空着！输点东西");
      return;
    }

    // 显示用户消息（浅灰气泡+黑色字体）
    chatHistory.innerHTML += "<div class='user-message'>" + text + "</div>";
    messageInput.value = "";
    sendBtn.innerText = "→";
    sendBtn.disabled = true;

    // 显示AI思考中+加载动画
    var loadingId = "loading-" + Date.now();
    chatHistory.innerHTML += `
      <div id="${loadingId}" class="loading">
        <span>AI正在思考...</span>
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
      </div>
    `;
    // 自动滚动到底部
    chatHistory.scrollTop = chatHistory.scrollHeight;

    // 模拟API调用（替换为真实接口即可）
    setTimeout(function() {
      // 移除加载动画
      document.getElementById(loadingId).remove();
      // 显示AI回复（带圆形头像）
      var aiAnswer = "这是AI的体育问答回复：" + text + "（实际场景请替换为真实接口返回内容）";
      chatHistory.innerHTML += "<div class='ai-message'>" + aiAnswer + "</div>";
      // 恢复按钮
      sendBtn.disabled = false;
      // 自动滚动到底部
      chatHistory.scrollTop = chatHistory.scrollHeight;
    }, 1500);
  }

  // 绑定发送按钮点击事件
  sendBtn.onclick = sendMessage;

  // 绑定回车发送（按enter发送，shift+enter换行）
  messageInput.onkeydown = function(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // 阻止默认换行
      sendMessage();
    }
  };

  // 主页按钮点击事件
  homeBtn.onclick = function() {
    alert("返回主页功能可在此处实现");
  };
};
