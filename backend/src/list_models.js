const fetch = require('node-fetch');
const dotenv = require('dotenv');
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

async function listAllModels() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
    
    console.log("Listing all available models from REST API...");
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (response.status === 200) {
            console.log("Available Models:");
            data.models.forEach(m => {
                console.log(`- ${m.name} (${m.displayName})`);
            });
        } else {
            console.log("Error listing models:", JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error("Fetch failed:", e.message);
    }
}

listAllModels();
