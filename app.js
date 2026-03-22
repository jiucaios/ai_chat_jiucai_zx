// 环境变量配置（本地开发用.env，Vercel部署时在平台配置）
const API_BASE_URL = process.env.VITE_API_URL || "https://your-backend-api.vercel.app"; // 后端Java API地址
const API_ENDPOINT = `${API_BASE_URL}/api/chat`; // 问答接口路径

// DOM元素获取
const chatHistory = document.getElementById("chatHistory");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const homeBtn = document.getElementById("homeBtn");

// 初始化页面
document.addEventListener("DOMContentLoaded", () => {
  // 主页跳转预留（后期替换为实际地址）
  homeBtn.addEventListener("click", () => {
    // 示例：跳转到主页（可替换为你的主页URL）
    // window.location.href = "https://your-homepage.com";
    alert("预留跳转：点击后将跳转到我的主页（后期配置URL）");
  });

  // 发送按钮点击事件
  sendBtn.addEventListener("click", sendMessage);

  // 回车发送（Shift+回车换行）
  messageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
});

/**
 * 发送消息到后端API
 */
async function sendMessage() {
  const message = messageInput.value.trim();
  if (!message) return;

  // 1. 添加用户消息到聊天记录
  addMessageToHistory(message, "user");
  // 2. 清空输入框
  messageInput.value = "";
  // 3. 禁用发送按钮防止重复提交
  sendBtn.disabled = true;
  sendBtn.textContent = "发送中...";

  try {
    // 4. 调用后端Java API（预留接口，适配环境变量）
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // 如需鉴权，可添加Token（后期扩展）
        // "Authorization": `Bearer ${process.env.VITE_API_TOKEN}`
      },
      body: JSON.stringify({
        question: message, // 传递给后端的问题参数
        timestamp: new Date().getTime()
      })
    });

    // 5. 处理响应
    if (!response.ok) {
      throw new Error(`API请求失败：${response.status}`);
    }

    const data = await response.json();
    // 6. 添加AI回复到聊天记录（假设后端返回的字段是answer）
    addMessageToHistory(data.answer || "暂无回复，请稍后再试", "ai");

  } catch (error) {
    console.error("消息发送失败：", error);
    // 错误提示
    addMessageToHistory(`请求失败：${error.message}`, "ai");
  } finally {
    // 7. 恢复发送按钮
    sendBtn.disabled = false;
    sendBtn.textContent = "发送";
    // 8. 滚动到最新消息
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }
}

/**
 * 添加消息到聊天记录
 * @param {string} content 消息内容
 * @param {string} type 消息类型：user/ai
 */
function addMessageToHistory(content, type) {
  const messageDiv = document.createElement("div");
  messageDiv.className = `${type}-message`;
  // 处理换行符
  messageDiv.innerHTML = content.replace(/\n/g, "<br>");
  chatHistory.appendChild(messageDiv);
}