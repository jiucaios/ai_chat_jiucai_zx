// 精准适配Doubao-1.5-pro-32k模型：模型名/接入点/地域全匹配
const API_TOKEN = process.env.API_TOKEN;
const ENDPOINT_ID = process.env.ENDPOINT_ID;
// 务必确认：这里的地域要和你的接入点地域一致（北京/上海/广州）
const API_URL = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";

export default async function handler(req, res) {
  // 完整CORS配置，避免跨域干扰调用
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  // 处理OPTIONS预检请求（前端调用必加）
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.json({ answer: '仅支持POST请求' });
  }

  // 提取并校验用户问题
  const { question } = req.body || {};
  const q = (question || '').trim();
  if (!q) return res.json({ answer: '请输入问题' });
  
  // 校验核心环境变量
  if (!API_TOKEN) return res.json({ answer: '错误：未配置API_TOKEN环境变量' });
  if (!ENDPOINT_ID) return res.json({ answer: '错误：未配置ENDPOINT_ID环境变量' });

  try {
    // 构建请求体：精准匹配你的模型名
    const requestBody = {
      endpoint_id: ENDPOINT_ID, // 必须是绑定了Doubao-1.5-pro-32k的接入点ID
      model: "Doubao-1.5-pro-32k", // 完全匹配你确认的模型名（大小写/32k后缀都不能错）
      messages: [{ role: "user", content: q }],
      stream: false,
      max_tokens: 2048,
      temperature: 0.7
    };

    // 发起API调用
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}` // Bearer后必须有空格，不要漏
      },
      body: JSON.stringify(requestBody),
      timeout: 30000 // 延长超时，避免网络问题
    });

    // 读取响应内容
    const text = await response.text();
    
    // 调试用：打印响应（上线前可删除）
    console.log("API响应内容：", text);

    // 解析JSON响应
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.json({ answer: `响应格式错误：${text.slice(0, 100)}` });
    }

    // 处理结果/错误
    if (data.error) {
      return res.json({ answer: `调用失败：${data.error.message}（Request ID：${data.error.request_id || '无'}）` });
    }
    const answer = data.choices?.[0]?.message?.content || '暂无回答';
    return res.json({ answer });

  } catch (err) {
    return res.json({ answer: `网络/系统错误：${err.message}` });
  }
}
