/**
 * Utility function to sleep for a given duration
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Robust retry wrapper for Gemini API calls
 * Handles 429 Too Many Requests by waiting for the suggested duration or using exponential backoff
 */
async function withRetry(fn, maxRetries = 5) {
    let attempt = 0;
    
    while (attempt < maxRetries) {
        try {
            return await fn();
        } catch (error) {
            attempt++;
            
            // Check for 429 Too Many Requests
            const isRateLimit = error.message && (error.message.includes('429') || error.message.toLowerCase().includes('quota'));
            
            if (isRateLimit && attempt < maxRetries) {
                // Try to extract retry delay from error message (Gemini often provides it)
                let waitTime = 30000; // Default 30s
                const match = error.message.match(/retry in ([\d.]+)s/);
                if (match) {
                    waitTime = (parseFloat(match[1]) + 1) * 1000; // Add 1s buffer
                } else {
                    // Exponential backoff if no suggested time
                    waitTime = Math.min(waitTime * Math.pow(2, attempt - 1), 60000);
                }
                
                console.warn(`[Gemini Rate Limit] Attempt ${attempt} failed. Waiting ${Math.round(waitTime/1000)}s before retry...`);
                await sleep(waitTime);
            } else {
                // If not a rate limit or we've hit max retries, throw
                throw error;
            }
        }
    }
}

module.exports = { sleep, withRetry };
