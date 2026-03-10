require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.post('/api/recommendation', async (req, res) => {
    try {
        const { testName, result, category } = req.body;

        if (!testName || !result || !category) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const today = new Date().toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });

        const prompt = `You are a fitness coach. Today is ${today}. A student just finished the ${testName} test and got a result of ${result}, which is classified as "${category}".

Write exactly 2-3 sentences of specific things they should do TODAY to improve their ${testName} performance. Base your advice directly on their actual result (${result}) and their classification (${category}). Only give advice that can be done today, right now. No markdown, no preamble, no greetings. Start directly with the action.`;

        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

        const geminiResponse = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
            })
        });

        if (geminiResponse.status === 429) {
            return res.status(429).json({ error: 'Rate limit exceeded. Please try again.' });
        }

        if (!geminiResponse.ok) {
            const errText = await geminiResponse.text();
            return res.status(500).json({ error: `Gemini API error: ${errText}` });
        }

        const data = await geminiResponse.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            return res.status(500).json({ error: 'Empty response from Gemini' });
        }

        const recommendation = text.trim()
            .replace(/\*\*/g, '')
            .replace(/\*/g, '')
            .replace(/#{1,6}\s/g, '');

        return res.status(200).json({ recommendation });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
});