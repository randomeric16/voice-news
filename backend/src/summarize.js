const { GoogleGenerativeAI } = require("@google/generative-ai");
const { withRetry } = require("./utils");
const dotenv = require("dotenv");

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function summarizeCluster(cluster) {
    console.log(`Summarizing cluster: ${cluster.clusterTitle}`);
    
    const context = cluster.items.map(item => `Nguồn: ${item.source}\nTiêu đề: ${item.title}\nMô tả: ${item.description}`).join('\n\n');

    const prompt = `
Bạn là một biên tập viên tin tức cho người cao tuổi. 
Dưới đây là một số bài báo về cùng một chủ đề. Hãy viết lại một bản tóm tắt duy nhất, đầy đủ và chi tiết hơn.
Yêu cầu:
1. Độ dài khoảng 200-300 chữ. TUYỆT ĐỐI KHÔNG vượt quá 300 chữ.
2. Không lặp lại thông tin giữa các nguồn.
3. Ngôn ngữ thuần Việt, giọng điệu ấm áp, gần gũi, phù hợp để đọc chậm cho người già nghe.
4. Nếu có thông tin về thời gian, địa điểm, hãy giữ nguyên để người nghe dễ nắm bắt.
5. Nội dung phải mạch lạc, có mở đầu và kết thúc bản tin một cách tự nhiên.

Nội dung các bài báo:
${context}

Chỉ trả về đoạn văn tóm tắt, không thêm bất kỳ văn bản chào hỏi hay kết thúc nào khác.
`;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const result = await withRetry(() => model.generateContent(prompt));
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error('Error in summarization:', error.message);
        return cluster.items[0].description || "Không thể tóm tắt nội dung này.";
    }
}

module.exports = { summarizeCluster };
