// 从环境变量读取密钥（安全！）
const API_KEY = process.env.API_KEY;

export default async function handler(req, res) {
  // 只允许POST
  if (req.method !== 'POST') {
    return res.status(405).json({ answer: '请求方法不允许', success: false });
  }

  const { question } = req.body;

  if (!question) {
    return res.json({ answer: '请输入问题', success: false });
  }

  try {

    // ==============================
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "你是专业体育问答助手，只回答体育相关问题。" },
          { role: "user", content: question }
        ]
      })
    });

    const data = await aiResponse.json();
    const answer = data.choices?.[0]?.message?.content || '暂无回答';

    res.json({
      answer,
      success: true
    });

  } catch (err) {
    res.json({
      answer: '服务器错误：' + err.message,
      success: false
    });
  }
}