const API_KEY = process.env.API_KEY;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method !== 'POST') {
    return res.json({ answer: '仅支持POST请求', success: false });
  }

  const { question } = req.body || {};
  if (!question || question.trim() === '') {
    return res.json({ answer: '请输入体育相关问题', success: false });
  }
  if (!API_KEY) {
    return res.json({ answer: '未配置API密钥', success: false });
  }

  try {
    // ========== 重点改这里：替换为火山千问正确接口 ==========
    const response = await fetch('https://ark.cn-beijing.volces.com/v3/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}` // 单密钥Bearer认证
      },
      body: JSON.stringify({
        model: "qianwen-turbo", // 火山通用模型，无需替换
        messages: [{ role: "user", content: question.trim() }],
        stream: false
      })
    });

    // 容错处理：先读文本，再解析JSON
    const text = await response.text();
    // 打印返回内容，方便排查（Vercel日志里能看到）
    console.log('火山返回内容：', text);
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.json({ 
        answer: `火山返回非JSON：${text.slice(0, 100)}`, 
        success: false 
      });
    }

    // 解析回复
    let answer = '暂无回答';
    if (data.choices && data.choices.length > 0) {
      answer = data.choices[0].message?.content || '暂无回答';
    } else if (data.error) {
      answer = `火山千问错误：${data.error.message}`;
    }

    return res.json({ answer: answer.trim(), success: true });
  } catch (err) {
    return res.json({ 
      answer: `调用火山引擎失败：${err.message}`, 
      success: false 
    });
  }
}
