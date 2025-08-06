// aiFeedback.js
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateFeedback(question, answer) {
  const prompt = `
以下の質問とその回答について、プロの面接官・キャリアアドバイザーとしての立場から、非常に精密で具体的なフィードバックを作成してください。

【質問】
${question}

【回答】
${answer}

【評価項目】
以下の観点で、詳細に分析・評価してください。
1. 質問の意図の解釈（なぜこの質問がされるのか？何を見たいのか？）
2. 回答の具体性（エピソードや事実を伴っているか、抽象的すぎないか）
3. 出来る要約して回答してください
4. 優しく回答してください


【出力フォーマット】200文字以内に要約
1. 質問の意図
（質問の目的や、見ようとしている評価軸を詳細に述べてください）

2. 回答の評価 200文字以内に要約
良い点：


3. 総合フィードバックと改善アドバイス 200文字以内に要約
回答の良い点
改善点


`;

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text(); // プレーンテキストで返す
  } catch (err) {
    console.error("Gemini API error:", err);
    throw err;
  }
}

module.exports = { generateFeedback };