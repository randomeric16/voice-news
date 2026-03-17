const { GoogleGenerativeAI } = require("@google/generative-ai");
const { withRetry } = require("./utils");
const dotenv = require("dotenv");

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function clusterNews(items) {
    if (!items || items.length === 0) return [];

    console.log('Starting clustering with Gemini...');
    
    // We only need titles and indices for clustering to save tokens
    const titles = items.map((item, index) => `${index}. ${item.title}`).join('\n');

    const prompt = `
Tôi sẽ cung cấp danh sách các tiêu đề tin tức từ nhiều báo khác nhau.
Nhiệm vụ của bạn là:
1. Gom nhóm (cluster) các bài viết nói về cùng một sự kiện hoặc chủ đề thực tế.
2. Với mỗi nhóm, chọn một tiêu đề chung đại diện nhất.
3. Xác định mức độ ưu tiên: "hot" nếu có bài từ 3 nguồn khác nhau trở lên, "normal" nếu ít hơn.
4. Trả về kết quả dưới dạng JSON mảng các đối tượng: 
   [{"clusterTitle": "...", "indices": [0, 2, ...], "priority": "hot"|"normal"}]

Danh sách tin:
${titles}

Chỉ trả về JSON, không giải thích thêm.
`;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const result = await withRetry(() => model.generateContent(prompt));
        const response = await result.response;
        let text = response.text();
        
        // Clean up markdown code blocks if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        const clusters = JSON.parse(text);
        
        // Map back to original items
        return clusters.map(c => ({
            clusterTitle: c.clusterTitle,
            priority: c.priority,
            items: c.indices.map(i => items[i])
        }));
    } catch (error) {
        console.error('Error in clustering:', error.message);
        // Fallback: Each item is its own cluster
        return items.map(item => ({
            clusterTitle: item.title,
            priority: 'normal',
            items: [item]
        }));
    }
}

module.exports = { clusterNews };
