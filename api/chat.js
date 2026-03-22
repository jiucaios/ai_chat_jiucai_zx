// 精准适配你新增的 Doubao-1.5-pro-32k 模型（纯文本问答，32k上下文）
const API_TOKEN = process.env.API_TOKEN;
// 豆包通用问答接口（固定不变）
const API_URL = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";

export default async function handler(req, res) {
  // 跨域配置（保证前端正常调用）
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

  // 3. 校验API Token（仅这一个核心密钥）
  if (!API_TOKEN) {
    return res.json({ answer: '未配置豆包API Token（Vercel环境变量填API_TOKEN）' });
  }

  try {
    // 4. 调用 Doubao-1.5-pro-32k 模型（核心适配）
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify({
        model: "Doubao-1.5-pro-32k", // 完全匹配你新增的模型名（大小写一致）
        messages: [{ role: "user", content: q }], // 纯文本问答用messages参数
        stream: false,
        max_tokens: 2048, // 32k模型可支持更大的输出，默认2048即可
        temperature: 0.7 // 回答灵活度，0-1之间
      }),
      timeout: 15000 // 32k模型响应稍慢，延长超时时间
    });

    // 5. 容错解析返回结果
    const text = await response.text();
    console.log('豆包原始返回：', text); // 调试用，可看Vercel日志

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.json({ answer: `豆包返回异常：${text.slice(0, 100)}` });
    }

    // 6. 返回真实的AI问答回复
    const answer = data.choices?.[0]?.message?.content || 
                   `豆包提示：${data.error?.message || '暂无回答'}`;
    return res.json({ answer });

  } catch (err) {
    return res.json({ answer: `调用豆包失败：${err.message}` });
  }
}
