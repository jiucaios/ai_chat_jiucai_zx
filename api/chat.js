// 精准适配你授权的 Doubao-1.5-vision-pro 模型
const API_TOKEN = process.env.API_TOKEN;
const API_URL = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";

export default async function handler(req, res) {
  // 跨域配置（必加）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  // 1. 仅处理POST请求
  if (req.method !== 'POST') {
    return res.json({ answer: '仅支持POST请求，比如问「篮球一节多少分钟」' });
  }

  // 2. 校验前端传入的问题
  const { question } = req.body || {};
  const q = (question || '').trim();
  if (!q) return res.json({ answer: '请输入体育相关问题' });

  // 3. 校验API Token
  if (!API_TOKEN) {
    return res.json({ answer: '未配置豆包API Token（Vercel环境变量填API_TOKEN）' });
  }

  try {
    // 4. 调用你授权的 Doubao-1.5-vision-pro 模型（核心修改）
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify({
        model: "Doubao-1.5-vision-pro", // 完全匹配你授权的模型名（大小写一致）
        messages: [{ role: "user", content: q }],
        stream: false,
        // 可选：vision模型可加额外参数，纯文本问答无需配置
        temperature: 0.7 // 问答流畅度，可保留
      }),
      timeout: 10000
    });

    // 5. 容错解析返回结果
    const text = await response.text();
    console.log('豆包原始返回：', text); // 调试用

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.json({ answer: `豆包返回异常：${text.slice(0, 100)}` });
    }

    // 6. 返回真实AI回复
    const answer = data.choices?.[0]?.message?.content || 
                   `豆包提示：${data.error?.message || '暂无回答'}`;
    return res.json({ answer });

  } catch (err) {
    return res.json({ answer: `调用豆包失败：${err.message}` });
  }
}
