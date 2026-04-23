const { GoogleGenerativeAI } = require("@google/generative-ai");

export default async function handler(req, res) {
  // הגדרות CORS - מאפשר לאתר שלך ב-GitHub Pages לגשת לשרת הזה
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // טיפול בבקשת "בדיקה" של הדפדפן (Preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { word, category } = req.body;

    if (!word || !category) {
      return res.status(400).json({ error: 'Missing word or category' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

    // שימוש ב-Gemini 1.5 Flash - המודל הכי חסכוני ומהיר למשימות כאלו
    const model = genAI.getGenerativeModel({ 
        model: "gemma-4-26b-a4b-it",
        generationConfig: {
            temperature: 1,
            maxOutputTokens: 15,
        }
    });

    const prompt = `Does the word "${word}" belong to the category "${category}"? Answer with one word only: yes or no.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const raw = response.text().trim();

    // Extract the last yes or no in the response (model may reason before answering)
    const match = [...raw.matchAll(/\byes\b|\bno\b/gi)];
    const answer = match.length > 0 ? match[match.length - 1][0].toLowerCase() : raw;

    return res.status(200).json({ answer });

  } catch (error) {
    console.error("AI Studio Error:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}