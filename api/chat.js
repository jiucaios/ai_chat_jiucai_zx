// 火山引擎密钥（替换为你的火山API Key和Secret）
const VOLC_ACCESS_KEY = process.env.VOLC_ACCESS_KEY; // 火山Access Key
const VOLC_SECRET_KEY = process.env.VOLC_SECRET_KEY; // 火山Secret Key
const VOLC_ENDPOINT = "https://maas-api.ml-platform-cn-beijing.volces.com/api/v1/chat/completions"; // 火山接口地址

// 生成火山API签名（简化版，满足基础调用）
function getVolcHeaders() {
  const timestamp = Date.now().toString();
  const signStr = `${VOLC_ACCESS_KEY}${timestamp}`;
  const crypto = require('crypto');
  const signature = crypto.createHmac('sha256', VOLC_SECRET_KEY)
    .update(signStr)
    .digest('hex');

  return {
    'Content-Type': 'application/json',
    'Authorization': `VOLC-HMAC-SHA256 Credential=${VOLC_ACCESS_KEY}, SignedHeaders=content-type;host, Signature=${signature}`,
    'X-Volc-Timestamp': timestamp,
    'Host': 'maas-api.ml-platform-cn-beijing.volces.com'
  };
}

export default async function handler(req, res) {
  // 跨域配置
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 仅允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ answer: '仅支持POST请求', success: false });
  }

  const { question } = req.body;
  // 校验输入
  if (!question || question.trim() === '') {
    return res.status(400).json({ answer: '请输入有效的体育问题', success: false });
  }
  // 校验火山密钥
  if (!VOLC_ACCESS_KEY || !VOLC_SECRET_KEY) {
    return res.status(500).json({ answer: '未配置火山引擎密钥', success: false });
  }

  try {
    console.log('调用火山引擎，问题：', question);
    // 调用火山引擎API
    const response = await fetch(VOLC_ENDPOINT, {
      method: 'POST',
      headers: getVolcHeaders(),
      body: JSON.stringify({
        model: "doubao-pro", // 火山模型名称（可换为doubao-lite/doubao-max）
        messages: [
          { role: "system", content: "你是专业的体育问答助手，只回答体育相关问题，回答简洁易懂。" },
          { role: "user", content: question.trim() }
        ],
        temperature: 0.5,
        max_tokens: 1000
      })
    });

    const data = await response.json();
    // 解析火山返回结果
    let answer = '暂无回答';
    if (data.choices && data.choices.length > 0) {
      answer = data.choices[0].message?.content || '暂无回答';
    } else if (data.error) {
      answer = `火山引擎错误：${data.error.message}`;
    }

    return res.json({
      answer: answer.trim(),
      success: true
    });
  } catch (err) {
    console.error('调用火山引擎失败：', err.message);
    return res.json({
      answer: `服务器错误：${err.message}`,
      success: false
    });
  }
}
