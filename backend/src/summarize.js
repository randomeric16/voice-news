const llmService = require("./llm_service");

async function summarizeCluster(cluster) {
    console.log(`Summarizing cluster with Multi-LLM Service: ${cluster.clusterTitle}`);
    
    const context = cluster.items.map(item => `Nguồn: ${item.source}\nTiêu đề: ${item.title}\nMô tả: ${item.description}`).join('\n\n');

    const prompt = `
Bạn là một biên tập viên tin tức phát thanh chuyên nghiệp cho người cao tuổi. 
Dưới đây là thông tin từ các báo về cùng một sự kiện. Hãy viết một bản tin tóm tắt ĐẦY ĐỦ, CHI TIẾT và GIÀU THÔNG TIN.

Yêu cầu QUAN TRỌNG:
1. ĐỘ DÀI: Phải viết dài và chi tiết, khoảng 300 - 450 chữ. Hãy phân tích kỹ các khía cạnh của sự việc.
2. PHONG CÁCH: Ngôn ngữ thuần Việt, giọng điệu ấm áp, chậm rãi, dễ hiểu cho người già. Hãy dùng những từ ngữ gần gũi như "ông bà ạ", "thưa quý vị".
3. NỘI DUNG: 
   - Đừng chỉ liệt kê tiêu đề. Hãy kể lại câu chuyện một cách mạch lạc.
   - Nếu có thông tin về thời gian, địa điểm, các đối tượng liên quan, hãy mô tả kỹ hơn để ông bà dễ hình dung.
   - Kết hợp thông tin từ tất cả các nguồn bài báo cung cấp dưới đây.
4. CẤU TRÚC: Có lời chào mở đầu bản tin và lời kết thúc nhẹ nhàng.

Nội dung các bài báo:
${context}

Chỉ trả về nội dung bản tin, không thêm phần phân tích hay lời dẫn của AI.
`;

    try {
        const summary = await llmService.generateSummary(prompt);
        if (!summary) throw new Error("LLM Service returned empty result.");
        return summary;
    } catch (error) {
        console.error('Error in summarization:', error.message);
        return cluster.items[0].description || "Không thể tóm tắt nội dung này.";
    }
}

module.exports = { summarizeCluster };
