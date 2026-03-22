// 终极修复版：兼容非JSON返回 + 调试真实错误信息
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

// 核心配置（匹配你的精准模型名）
const API_TOKEN = process.env.API_TOKEN;
const ENDPOINT_ID = process.env.ENDPOINT_ID;
const MODEL_NAME = 'doubao-1-5-pro-32k-250115'; // 你的精准模型名
const API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';

// 接口路径：/api/chat（小写api目录）
app.post('/api/chat', async (req, res) => {
  try {
    // 基础校验
    if (!API_TOKEN) return res.json({ error: '缺少API_TOKEN环境变量' });
    if (!ENDPOINT_ID) return res.json({ error: '缺少ENDPOINT_ID环境变量' });
    
    const { question } = req.body;
    if (!question || !question.trim()) return res.json({ error: '请输入问题' });

    // 构造请求体
    const requestBody = {
      endpoint_id: ENDPOINT_ID,
      model: MODEL_NAME,
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

    // 核心修复：先获取状态码 + 原始响应文本（不管是否JSON）
    const statusCode = response.status;
    const responseText = await response.text();

    // 打印调试信息（Vercel日志中可查看）
    console.log('火山响应状态码：', statusCode);
    console.log('火山原始响应：', responseText);

    // 兼容处理：尝试解析JSON，失败则返回原始文本
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (jsonErr) {
      // 非JSON返回时，直接返回原始错误信息
      return res.json({
        error: '火山返回非JSON响应',
        statusCode: statusCode,
        rawResponse: responseText // 关键：查看真实错误
      });
    }

    // 正常JSON返回的处理
    if (responseData.choices && responseData.choices.length > 0) {
      res.json({ answer: responseData.choices[0].message.content });
    } else {
      res.json({
        error: `火山报错：${responseData.error?.message || '未知错误'}`,
        requestId: responseData.request_id,
        statusCode: statusCode
      });
    }

  } catch (err) {
    // 捕获所有其他错误（如网络超时、请求异常）
    res.json({
      error: `调用失败：${err.message}`,
      rawError: err.toString() // 调试用：显示完整错误
    });
  }
});

export default app;
