// 零依赖版：适配Vercel Serverless，无需express，兼容非JSON返回
export default async function handler(req, res) {
  // 跨域配置（原生写法）
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 只处理POST请求
  if (req.method !== 'POST') {
    return res.status(200).json({ error: '仅支持POST请求' });
  }

  try {
    // 核心配置（你的精准信息）
    const API_TOKEN = process.env.API_TOKEN;
    const ENDPOINT_ID = process.env.ENDPOINT_ID;
    const MODEL_NAME = 'doubao-1-5-pro-32k-250115';
    const API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

    // 基础校验
    if (!API_TOKEN) {
      return res.status(200).json({ error: '缺少API_TOKEN环境变量' });
    }
    if (!ENDPOINT_ID) {
      return res.status(200).json({ error: '缺少ENDPOINT_ID环境变量' });
    }

    // 解析前端请求体（原生写法，无需express.json()）
    const { question } = req.body || {};
    if (!question || !question.trim()) {
      return res.status(200).json({ error: '请输入问题内容' });
    }

    // 构造火山请求体
    const requestBody = {
      endpoint_id: ENDPOINT_ID,
      model: MODEL_NAME,
      messages: [{ role: 'user', content: question.trim() }],
      stream: false,
      temperature: 0.7,
      max_tokens: 2048
    };

    // 发送请求到火山
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify(requestBody),
      timeout: 30000
    });

    // 获取火山响应信息（兼容非JSON）
    const statusCode = response.status;
    const responseText = await response.text();

    // 打印调试日志（Vercel中可查看）
    console.log('火山状态码：', statusCode);
    console.log('火山原始响应：', responseText);

    // 兼容解析JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (jsonErr) {
      return res.status(200).json({
        error: '火山返回非JSON响应',
        statusCode: statusCode,
        rawResponse: responseText
      });
    }

    // 返回正常结果
    if (responseData.choices && responseData.choices.length > 0) {
      return res.status(200).json({
        answer: responseData.choices[0].message.content
      });
    } else {
      return res.status(200).json({
        error: `火山报错：${responseData.error?.message || '未知错误'}`,
        requestId: responseData.request_id,
        statusCode: statusCode
      });
    }

  } catch (err) {
    // 捕获所有错误
    return res.status(200).json({
      error: `调用失败：${err.message}`,
      rawError: err.toString()
    });
  }
}
