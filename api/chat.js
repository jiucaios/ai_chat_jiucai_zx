const API_KEY = process.env.API_KEY;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method !== 'POST') {
    return res.status(405).json({ answer: '仅支持POST请求', success: false });
  }

  const { question } = req.body;
  if (!question) return res.json({ answer: '请输入问题', success: false });
  if (!API_KEY) return res.json({ answer: '未配置API_KEY', success: false });

  try {
    console.log('调用OpenAI，问题：', question); // 日志输出问题
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // 确认模型名称正确
        messages: [{ role: "user", content: question }],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    // 打印完整返回结果（关键！看OpenAI到底返回了什么）
    const rawData = await aiResponse.text();
    console.log('OpenAI原始返回：', rawData);
    const data = JSON.parse(rawData);

    // 兼容不同返回格式的校验
    let answer = '暂无回答';
    if (data.choices && data.choices.length > 0) {
      answer = data.choices[0].message?.content || '暂无回答';
    } else if (data.error) {
      answer = `OpenAI错误：${data.error.message}`; // 显示具体错误
    }

    return res.json({ answer: answer.trim(), success: true });
  } catch (err) {
    console.error('调用失败：', err.message); // 打印错误日志
    return res.json({ answer: `服务器错误：${err.message}`, success: false });
  }
}
