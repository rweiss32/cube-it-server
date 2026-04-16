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
            temperature: 0,
            maxOutputTokens: 10,
        }
    });

    const prompt = `Answer with only one word: "yes" or "no". Does the word "${word}" belong to the category "${category}"? (Answer in Hebrew: "כן" or "לא")`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const answer = response.text().trim().replace(/[.,!]/g, "");

    return res.status(200).json({ answer });

  } catch (error) {
    console.error("AI Studio Error:", error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}