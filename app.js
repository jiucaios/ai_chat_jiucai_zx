<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>体育AI助手 - 专业体测建议系统</title>
    <style>
        /* ========================
           全局样式 & 美化 (完全适配现有类名，不侵入核心逻辑)
           ======================== */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            background: linear-gradient(145deg, #f0f4f8 0%, #d9e2ec 100%);
            font-family: 'Segoe UI', 'Roboto', 'Noto Sans', system-ui, -apple-system, 'Helvetica Neue', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
        }

        /* 聊天卡片容器 */
        .chat-container {
            width: 100%;
            max-width: 780px;
            height: 85vh;
            background-color: #ffffff;
            border-radius: 32px;
            box-shadow: 0 25px 45px rgba(0, 0, 0, 0.15), 0 2px 6px rgba(0, 0, 0, 0.05);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            transition: all 0.2s ease;
        }

        /* 头部区域 */
        .chat-header {
            background: #1e2a3e;
            color: white;
            padding: 18px 24px;
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 12px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .title-section h1 {
            font-size: 1.5rem;
            font-weight: 600;
            letter-spacing: -0.3px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .title-section h1::before {
            content: "🏃";
            font-size: 1.6rem;
        }

        .title-section p {
            font-size: 0.75rem;
            opacity: 0.8;
            margin-top: 4px;
        }

        /* 主页按钮 */
        .home-btn {
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(4px);
            border: none;
            color: white;
            font-size: 1rem;
            padding: 8px 18px;
            border-radius: 40px;
            cursor: pointer;
            font-weight: 500;
            transition: 0.2s;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .home-btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: scale(0.97);
        }

        /* 聊天历史区域 */
        .chat-history {
            flex: 1;
            overflow-y: auto;
            padding: 24px 20px;
            display: flex;
            flex-direction: column;
            gap: 16px;
            background: #f9fafc;
            scroll-behavior: smooth;
        }

        /* 自定义滚动条 */
        .chat-history::-webkit-scrollbar {
            width: 6px;
        }

        .chat-history::-webkit-scrollbar-track {
            background: #e2e8f0;
            border-radius: 8px;
        }

        .chat-history::-webkit-scrollbar-thumb {
            background: #94a3b8;
            border-radius: 8px;
        }

        /* 消息气泡通用基座 */
        .user-message, .ai-message {
            max-width: 85%;
            padding: 12px 18px;
            border-radius: 24px;
            line-height: 1.5;
            font-size: 0.95rem;
            word-break: break-word;
            white-space: pre-wrap;
            animation: fadeSlideUp 0.25s ease-out;
            box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        /* 用户消息 - 右对齐 */
        .user-message {
            background: #1e2a3e;
            color: white;
            align-self: flex-end;
            border-bottom-right-radius: 6px;
            margin-left: auto;
        }

        /* AI 消息 - 左对齐 */
        .ai-message {
            background: #ffffff;
            border: 1px solid #e2edf2;
            color: #1e2a3e;
            align-self: flex-start;
            border-bottom-left-radius: 6px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
        }

        /* 加载动画特殊样式 */
        .loading {
            background: #eef2ff;
            color: #2c3e66;
            padding: 12px 18px;
            border-radius: 24px;
            border-bottom-left-radius: 6px;
            align-self: flex-start;
            font-size: 0.9rem;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .dot {
            width: 6px;
            height: 6px;
            background-color: #3b6e9e;
            border-radius: 50%;
            display: inline-block;
            animation: pulse 1.4s infinite ease-in-out both;
        }

        .dot:nth-child(2) {
            animation-delay: 0.2s;
        }
        .dot:nth-child(3) {
            animation-delay: 0.4s;
        }

        @keyframes pulse {
            0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
            40% { transform: scale(1); opacity: 1; }
        }

        @keyframes fadeSlideUp {
            from {
                opacity: 0;
                transform: translateY(12px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* 底部输入区域 */
        .input-area {
            background: white;
            border-top: 1px solid #e2edf2;
            padding: 16px 20px;
            display: flex;
            gap: 12px;
            align-items: center;
        }

        .input-wrapper {
            flex: 1;
            background: #f1f5f9;
            border-radius: 48px;
            padding: 4px 16px;
            display: flex;
            align-items: center;
            transition: all 0.2s;
            border: 1px solid transparent;
        }

        .input-wrapper:focus-within {
            background: white;
            border-color: #1e2a3e;
            box-shadow: 0 0 0 3px rgba(30,42,62,0.1);
        }

        .message-input {
            width: 100%;
            border: none;
            background: transparent;
            padding: 12px 8px;
            font-size: 0.95rem;
            outline: none;
            font-family: inherit;
            resize: none;
        }

        .send-btn {
            background: #1e2a3e;
            border: none;
            width: 48px;
            height: 48px;
            border-radius: 48px;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            transition: 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }

        .send-btn:hover:not(:disabled) {
            background: #2c3e66;
            transform: scale(0.96);
        }

        .send-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }

        /* 小提示 */
        .info-tip {
            text-align: center;
            font-size: 0.7rem;
            color: #6c86a3;
            padding: 8px 20px;
            background: #f1f5f9;
            border-top: 1px solid #e2edf2;
        }

        /* 错误消息特殊风格 (继承ai-message，但内联style也会保留，这里兜底) */
        .ai-message[style*="background: #e53e3e"] {
            border-left: 4px solid #c53030;
        }

        /* 响应式调整 */
        @media (max-width: 550px) {
            .chat-container {
                height: 90vh;
                border-radius: 24px;
            }
            .user-message, .ai-message {
                max-width: 90%;
            }
            .title-section h1 {
                font-size: 1.2rem;
            }
        }
    </style>
</head>
<body>
<div class="chat-container">
    <div class="chat-header">
        <div class="title-section">
            <h1>体育智囊 · 体测专家</h1>
            <p>基于成绩&身体情况 | 仅输出专业体育建议</p>
        </div>
        <button class="home-btn" id="homeBtn">
            🏠 返回主页
        </button>
    </div>

    <!-- 聊天记录容器 -->
    <div class="chat-history" id="chatHistory"></div>

    <div class="input-area">
        <div class="input-wrapper">
            <input type="text" id="messageInput" class="message-input" placeholder="输入你的体育成绩、身高体重、50米、立定跳远、800/1000米等..." autocomplete="off">
        </div>
        <button class="send-btn" id="sendBtn">↑</button>
    </div>
    <div class="info-tip">
        💡 系统已预设「体育教练」指令：每次回答将严格围绕体育提升建议、训练方法、体能分析
    </div>
</div>

<script>
    // =========================================================================
    // 核心逻辑 —— 完全保留原始结构，仅扩展“预设prompt”以满足AI只返回体育建议
    // 新增【预设教练指令】确保AI仅围绕体育成绩与身体情况输出专业建议
    // 不修改任何原始流程（fetch / 错误处理 / 加载动画 / 按钮状态）
    // =========================================================================
    
    (function() {
        // ---------- 🌟 新增强制体育教练 prompt (满足需求: AI只返回学生的体育建议) ----------
        // 这是一个强引导的系统级前缀，每次发送都会拼接在用户问题之前
        // 这样后端模型无论是否有多轮记忆，单次回答都会严格遵守体育建议专家角色
        const SPORTS_COACH_PROMPT = "【你是国家级体育训练专家】你只能根据学生提供的体育成绩（50米、立定跳远、1000/800米、引体向上/仰卧起坐）、身高、体重等身体情况，给出科学、具体、鼓励性的体育训练建议、提升技巧或体能分析。禁止回答任何非体育相关的内容。请直接针对数据给出建议：";
        
        // 获取DOM元素 (与原始代码一致)
        var sendBtn = document.getElementById("sendBtn");
        var messageInput = document.getElementById("messageInput");
        var chatHistory = document.getElementById("chatHistory");

        // 页面加载后自动显示AI欢迎语 (完全保留原始)
        chatHistory.innerHTML += "<div class='ai-message'>你好呀，请输入你的各项体育成绩和身体情况（身高，体重，50米，立定跳远，1000/800米，引体向上/仰卧起坐）</div>";
        
        // 强制绑定点击事件（完全保留原始逻辑，只改动发送内容拼接）
        sendBtn.onclick = function() {
            // 3. 最简单的输入校验 (完全保留)
            var text = messageInput.value.trim();
            if (text === "") {
                alert("别空着！输点东西");
                return;
            }

            // ---------- 展示用户原始消息 (不展示prompt内容，保护用户体验) ----------
            chatHistory.innerHTML += "<div class='user-message'>" + escapeHtml(text) + "</div>";
            messageInput.value = "";
            sendBtn.innerText = "↑";
            sendBtn.disabled = true;

            // 新增：显示AI正在思考+加载动画（不影响核心逻辑）
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

            // ========== 🎯 关键改动：提前拼接预设prompt，使AI只返回体育建议 ==========
            // 完全保留API调用方式，仅将原始问题text与体育专家指令融合，确保后端返回限定内容
            // 原始逻辑未改动，只是增强了question字段的内容，实现“提前输入prompt”的效果
            var finalQuestion = SPORTS_COACH_PROMPT + "\n" + text;
            
            // 5. 调用后端 /api/chat (保留原始结构一字未改，仅替换question为finalQuestion)
            fetch('/api/chat', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({question: finalQuestion})   // ← 预设prompt + 用户输入
            }).then(function(res) {
                return res.json();
            }).then(function(data) {
                // 移除加载动画，显示AI回复（适配美化样式）
                var loadingElem = document.getElementById(loadingId);
                if (loadingElem) loadingElem.remove();
                // 获取AI回复内容（若后端返回answer字段）
                var reply = data.answer || '没拿到回复，请稍后再试。';
                chatHistory.innerHTML += "<div class='ai-message'>" + escapeHtml(reply) + "</div>";
            }).catch(function(err) {
                // 报错也显示（保留原始catch逻辑，样式美化）
                var loadingElem = document.getElementById(loadingId);
                if (loadingElem) loadingElem.remove();
                chatHistory.innerHTML += "<div class='ai-message' style='background: #e53e3e; color: white; border: none;'>⚠️ 调用失败：" + escapeHtml(err.message) + "</div>";
            }).finally(function() {
                // 恢复按钮（保留原始逻辑）
                sendBtn.innerText = "↑";
                sendBtn.disabled = false;
                // 自动滚动到底部
                chatHistory.scrollTop = chatHistory.scrollHeight;
            });
        };

        // 新增：回车发送（可选，完全保留原始逻辑）
        messageInput.onkeydown = function(e) {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendBtn.click(); // 触发原始点击事件
            }
        };
        
        // 辅助函数：防止XSS注入，但保留原有显示逻辑的同时增加安全性（不影响任何核心流程）
        function escapeHtml(str) {
            if (!str) return '';
            return str.replace(/[&<>]/g, function(m) {
                if (m === '&') return '&amp;';
                if (m === '<') return '&lt;';
                if (m === '>') return '&gt;';
                return m;
            }).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function(c) {
                return c;
            });
        }
        
        // 主页按钮跳转逻辑（保留用户原始添加的homeBtn事件，确保不受影响）
        var homeBtn = document.getElementById('homeBtn');
        if (homeBtn) {
            // 防止重复绑定，但使用新的事件（原始代码也是addEventListener，无冲突）
            homeBtn.addEventListener('click', function() {
                window.location.href = 'https://jiucaios.github.io/resume/';
            });
        }
        
        // 附加: 为了进一步满足“提前输入一个prompt，让AI只返回学生的体育建议”
        // 实际上已经在每次请求时前置了体育教练指令，相当于每次对话都提前注入了系统提示词
        // 满足严格限定回答范围，同时不改变任何原始api结构、错误处理、加载动画。
        // 并且保留了原始的全部样式适配和类名。
    })();
</script>
</body>
</html>
