window.onload = function() {
  var sendBtn = document.getElementById("sendBtn");
  var messageInput = document.getElementById("messageInput");
  var chatHistory = document.getElementById("chatHistory");

  sendBtn.onclick = sendMessage;
  messageInput.onkeydown = function(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  function sendMessage() {
    var text = messageInput.value.trim();
    if (!text) {
      alert("请输入内容");
      return;
    }

    // 用户消息
    chatHistory.innerHTML += `<div class="user-message">${text}</div>`;
    messageInput.value = "";

    // 加载中
    var loadId = "load-" + Date.now();
    var loadingHtml = `
      <div id="${loadId}" class="loading">
        AI正在思考
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
    `;
    chatHistory.innerHTML += loadingHtml;
    chatHistory.scrollTop = chatHistory.scrollHeight;

    // 模拟请求
    setTimeout(() => {
      document.getElementById(loadId).remove();
      var ans = "这是AI的回答：" + text;
      chatHistory.innerHTML += `<div class="ai-message">${ans}</div>`;
      chatHistory.scrollTop = chatHistory.scrollHeight;
    }, 1200);
  }
};
