
const API_TOKEN = process.env.API_TOKEN;
// 你本地验证过的豆包固定接口地址
const API_URL = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";

export default async function handler(req, res) {
  // 跨域配置（必加，保证前端能调用）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  // 1. 只处理POST请求
  if (req.method !== 'POST') {
    return res.json({ answer: '仅支持POST请求，比如问「篮球一节多少分钟」' });
  }

  // 2. 获取并校验前端传入的问题
  const { question } = req.body || {};
  const q = (question || '').trim();
  if (!q) return res.json({ answer: '请输入体育相关问题' });

  // 3. 校验Token（仅这1个密钥，无其他）
  if (!API_TOKEN) {
    return res.json({ answer: '未配置豆包API Token（Vercel环境变量填API_TOKEN）' });
  }

  try {
    // 4. 调用豆包接口（仅核心参数，删除endpoint_id）
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}` // 仅用Token认证，和你本地一致
      },
      body: JSON.stringify({
        model: "doubao-pro", // 若你是lite版，改成doubao-lite即可
        messages: [{ role: "user", content: q }],
        stream: false
      }),
      timeout: 10000
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

    // 6. 返回真实AI回复
    const answer = data.choices?.[0]?.message?.content || 
                   `豆包提示：${data.error?.message || '暂无回答'}`;
    return res.json({ answer });

  } catch (err) {
    return res.json({ answer: `调用豆包失败：${err.message}` });
  }
}
