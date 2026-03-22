// 最终修复版：同时传接入点ID + 全小写模型名（适配火山所有版本接口）
const API_TOKEN = process.env.API_TOKEN;
const ENDPOINT_ID = process.env.ENDPOINT_ID;
const API_URL = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.json({ answer: '仅支持POST请求' });
  }

  const { question } = req.body || {};
  const q = (question || '').trim();
  if (!q) return res.json({ answer: '请输入问题' });
  if (!API_TOKEN) return res.json({ answer: '未配置API_TOKEN' });
  if (!ENDPOINT_ID) return res.json({ answer: '未配置ENDPOINT_ID' });

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify({
        endpoint_id: ENDPOINT_ID, // 必须传接入点ID
        model: "doubao-1.5-pro-32k", // 必须传全小写模型名（火山规范）
        messages: [{ role: "user", content: q }],
        stream: false,
        max_tokens: 2048,
        temperature: 0.7
      }),
      timeout: 15000
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.json({ answer: `返回异常：${text.slice(0, 100)}` });
    }

    const answer = data.choices?.[0]?.message?.content || 
                   `豆包提示：${data.error?.message || '暂无回答'}`;
    return res.json({ answer });

  } catch (err) {
    return res.json({ answer: `调用失败：${err.message}` });
  }
}
