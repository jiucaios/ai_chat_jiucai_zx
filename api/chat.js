// 完全匹配你本地PHP的豆包接入方式（API Token + 接入点ID）
// 环境变量配置：API_TOKEN = 你的718f5dba-8121-489e-aa29-e8a2af80f88c
//               ENDPOINT_ID = 你的ep-20260319214842-nn7nl
const API_TOKEN = process.env.API_TOKEN;
const ENDPOINT_ID = process.env.ENDPOINT_ID;
const API_URL = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";

export default async function handler(req, res) {
  // 跨域配置（必加）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  // 1. 只处理POST请求
  if (req.method !== 'POST') {
    return res.json({ answer: '仅支持POST请求，比如问「篮球一节多少分钟」' });
  }

  const { question } = req.body || {};
  const q = (question || '').trim();

  // 2. 基础校验（和你本地PHP一致）
  if (!q) return res.json({ answer: '请输入体育相关问题' });
  if (!API_TOKEN) return res.json({ answer: '未配置API_TOKEN（豆包的API Token）' });
  if (!ENDPOINT_ID) return res.json({ answer: '未配置ENDPOINT_ID（接入点ID）' });

  try {
    // 3. 调用你本地能跑的豆包接口（1:1复刻PHP逻辑）
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}` // 和你本地PHP的认证方式一致
      },
      body: JSON.stringify({
        endpoint_id: ENDPOINT_ID, // 必须传接入点ID（你本地PHP里的关键参数）
        model: "doubao-pro", // 豆包模型（可根据你的接入点调整）
        messages: [{ role: "user", content: q }],
        stream: false
      }),
      timeout: 10000
    });

    // 4. 解析返回（容错处理）
    const text = await response.text();
    console.log('豆包原始返回：', text); // 调试用，可看Vercel日志

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.json({ answer: `豆包返回异常：${text.slice(0, 100)}` });
    }

    // 5. 返回真实AI回复（和你本地PHP结果一致）
    const answer = data.choices?.[0]?.message?.content || 
                   `豆包提示：${data.error?.message || '暂无回答'}`;
    return res.json({ answer });

  } catch (err) {
    return res.json({ answer: `调用失败：${err.message}` });
  }
}
