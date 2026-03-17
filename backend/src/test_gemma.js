const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function testGemma() {
    const variants = ["gemma-3-1b", "gemma-3-4b", "gemma-3-12b", "gemma-3-27b"];
    console.log("--- TESTING GEMMA MODELS ---");
    
    for (const v of variants) {
        try {
            const model = genAI.getGenerativeModel({ model: v });
            const result = await model.generateContent("Hãy trả lời: Xin chào");
            console.log(`[OK] Model "${v}" worked correctly!`);
            console.log("Response:", result.response.text());
        } catch (e) {
            console.log(`[FAIL] Model "${v}": ${e.message}`);
        }
    }
}

testGemma();
