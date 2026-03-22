// 读取你配置的火山双密钥（doubao模型必须用AK/SK）
const VOLC_ACCESS_KEY = process.env.VOLC_ACCESS_KEY;
const VOLC_SECRET_KEY = process.env.VOLC_SECRET_KEY;
const crypto = require('crypto'); // 签名必备

// doubao模型专属配置（不用改）
const VOLC_CONFIG = {
  apiUrl: "https://maas-api.ml-platform-cn-beijing.volces.com/api/v1/chat/completions",
  model: "doubao-pro", // 若你是doubao-lite，改成这个即可
  timeout: 10000
};

// doubao模型必须的AK/SK签名（不用改）
function getSignHeaders() {
  const timestamp = Date.now().toString();
  const signStr = `${VOLC_ACCESS_KEY}${timestamp}`;
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
  // 跨域配置（必加）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  // 1. 只处理POST请求
  if (req.method !== 'POST') {
    return res.json({ answer: '仅支持POST请求' });
  }

  const { question } = req.body || {};
  const q = (question || '').trim();

  // 2. 校验输入和双密钥（doubao必须用双密钥）
  if (!q) return res.json({ answer: '请输入体育相关问题' });
  if (!VOLC_ACCESS_KEY || !VOLC_SECRET_KEY) {
    return res.json({ answer: '未配置doubao模型双密钥（VOLC_ACCESS_KEY/VOLC_SECRET_KEY）' });
  }

  try {
    // 3. 调用doubao模型真实API（核心）
    const response = await fetch(VOLC_CONFIG.apiUrl, {
      method: 'POST',
      headers: getSignHeaders(), // doubao必须用签名
      body: JSON.stringify({
        model: VOLC_CONFIG.model,
        messages: [{ role: "user", content: q }],
        stream: false
      }),
      timeout: VOLC_CONFIG.timeout
    });

    // 4. 解析真实回复（容错）
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.json({ answer: `doubao返回非JSON：${text.slice(0, 50)}` });
    }

    // 5. 返回真实结果
    const answer = data.choices?.[0]?.message?.content || 
                   `doubao提示：${data.error?.message || '暂无回答'}`;
    return res.json({ answer });

  } catch (err) {
    return res.json({ answer: `调用doubao失败：${err.message}` });
  }
}
