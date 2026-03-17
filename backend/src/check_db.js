const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load .env from backend folder
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Lỗi: Thiếu SUPABASE_URL hoặc SUPABASE_ANON_KEY trong file .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
    console.log('--- ĐANG KIỂM TRA DỮ LIỆU TRÊN SUPABASE ---');
    console.log(`URL: ${supabaseUrl}`);
    
    try {
        const { data, error } = await supabase
            .from('news_clusters')
            .select('*')
            .order('priority', { ascending: true })
            .order('created_at', { ascending: false })
            .limit(30);

        if (error) throw error;

        if (!data || data.length === 0) {
            console.log('Thông báo: Bảng news_clusters hiện đang trống.');
        } else {
            console.log(`Tìm thấy ${data.length} bản tin gần nhất:\n`);
            data.forEach((row, index) => {
                console.log(`${index + 1}. TIÊU ĐỀ: ${row.cluster_title}`);
                console.log(`   NGÀY TẠO: ${row.created_at}`);
                console.log(`   ĐỘ DÀI TÓM TẮT: ${row.summary?.split(' ').length || 0} từ`);
                console.log(`   HÌNH ẢNH: ${row.images?.length || 0} ảnh`);
                if (row.images && row.images.length > 0) {
                    console.log(`   URL ẢNH 1: ${row.images[0]}`);
                }
                console.log(`   NỘI DUNG: ${row.summary?.substring(0, 100)}...\n`);
                console.log('---');
            });
        }
    } catch (err) {
        console.error('Lỗi khi truy vấn Database:', err.message);
    }
}

checkDatabase();
