require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.post('/api/recommendation', async (req, res) => {
    const { testName, result, category } = req.body;

    if (!testName || !result || !category) {
        return res.status(400).json({ error: 'Missing required fields: testName, result, category' });
    }

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const prompt = `You are a fitness coach. Today is ${today}. A student just finished the ${testName} test and got a result of ${result}, which is classified as "${category}".

Write exactly 2-3 sentences of specific things they should do TODAY to improve their ${testName} performance. Base your advice directly on their actual result (${result}) and their classification (${category}). Only give advice that can be done today, right now. No markdown, no preamble, no greetings. Start directly with the action.`;

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
                })
            });

            if (response.status === 429) {
                const waitTime = 3000 * attempt;
                if (attempt < maxRetries) {
                    await new Promise(r => setTimeout(r, waitTime));
                    continue;
                }
                return res.status(429).json({ error: 'Rate limit exceeded. Please try again.' });
            }

            if (!response.ok) {
                const errText = await response.text();
                return res.status(response.status).json({ error: `Gemini API error: ${errText}` });
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) return res.status(500).json({ error: 'Empty response from Gemini' });

            const recommendation = text.trim()
                .replace(/\*\*/g, '')
                .replace(/\*/g, '')
                .replace(/#{1,6}\s/g, '');

            return res.json({ recommendation });

        } catch (error) {
            if (attempt === maxRetries) {
                return res.status(500).json({ error: error.message });
            }
            await new Promise(r => setTimeout(r, 3000 * attempt));
        }
    }
});
    
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`✅ UMakFit Recommendation Server running on http://localhost:${PORT}`);
});