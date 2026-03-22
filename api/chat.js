// 精准适配你的模型名：doubao-1-5-pro-32k-250115
import express from 'express';
const app = express();
app.use(express.json());

// 跨域配置
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// 核心配置（100%匹配你的实际信息）
const API_TOKEN = process.env.API_TOKEN;
const ENDPOINT_ID = process.env.ENDPOINT_ID;
const MODEL_NAME = 'doubao-1-5-pro-32k-250115'; // 你的精准模型名
const API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

// 接口路径：/api/chat（适配你小写的api目录）
app.post('/api/chat', async (req, res) => {
  try {
    // 基础校验
    if (!API_TOKEN) return res.json({ error: '缺少API_TOKEN环境变量' });
    if (!ENDPOINT_ID) return res.json({ error: '缺少ENDPOINT_ID环境变量' });
    
    const { question } = req.body;
    if (!question || !question.trim()) return res.json({ error: '请输入问题' });

    // 构造请求体（模型名100%匹配）
    const requestBody = {
      endpoint_id: ENDPOINT_ID,
      model: MODEL_NAME, // 核心：用你的精准模型名
      messages: [{ role: 'user', content: question.trim() }],
      stream: false,
      temperature: 0.7,
      max_tokens: 2048
    };

    // 发送请求
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify(requestBody),
      timeout: 30000
    });

    // 解析结果
    const responseText = await response.text();
    const responseData = JSON.parse(responseText);

    // 返回结果
    if (responseData.choices && responseData.choices.length > 0) {
      res.json({ answer: responseData.choices[0].message.content });
    } else {
      res.json({
        error: `火山报错：${responseData.error?.message || '未知错误'}`,
        requestId: responseData.request_id
      });
    }

  } catch (err) {
    res.json({ error: `调用失败：${err.message}`, requestId: '无' });
  }
});

export default app;
