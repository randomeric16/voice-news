const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function listModels() {
    try {
        // Note: The JavaScript SDK doesn't have a direct listModels at the top level in some versions
        // but we can try the REST API or see if it's in the genAI object
        console.log("Checking available models...");
        // Actually, let's just try to call a few variants to see which works
        const variants = [
            "gemini-1.5-flash", 
            "gemma-3-1b", 
            "gemma-3-4b", 
            "gemma-3-12b", 
            "gemini-2.0-flash-lite"
        ];
        
        for (const v of variants) {
            try {
                const model = genAI.getGenerativeModel({ model: v });
                const result = await model.generateContent("test");
                console.log(`[OK] Model "${v}" is working.`);
                return;
            } catch (e) {
                console.log(`[FAIL] Model "${v}": ${e.message}`);
            }
        }
    } catch (error) {
        console.error("List tools failed:", error.message);
    }
}

listModels();
