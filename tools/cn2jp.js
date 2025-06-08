import OpenAI from "openai";

const BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';

const BASE_PROMPT = '你是一名专业的中译日翻译家，你的目标是把中文翻译成日文，请翻译时不要带翻译腔，而是要翻译得自然、流畅和地道，使用优美和高雅的表达方式。';

export async function cn2jp(config, text) {
  const { apiKey, model, baseURL } = config;

  const userMessage = `请翻译下面这句话：“${text}”`;

  const client = new OpenAI({
    apiKey,
    baseURL: baseURL || BASE_URL,
  });

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: BASE_PROMPT },
      { role: 'user', content: userMessage },
    ]
  });

  return response.choices[0].message.content;
}