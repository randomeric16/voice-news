const fetch = require('node-fetch');
const dotenv = require('dotenv');
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

async function testDirectRest() {
    const model = "gemini-1.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;
    
    console.log(`Testing REST API for: ${model}`);
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Xin chào" }] }]
            })
        });
        
        const data = await response.json();
        console.log("Status Code:", response.status);
        if (response.status === 200) {
            console.log("[OK] Model worked via REST!");
        } else {
            console.log("[FAIL] REST API Error:", JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error("Fetch failed:", e.message);
    }
}

testDirectRest();
