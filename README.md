# Voice News — Hướng dẫn cài đặt (Setup Guide)

Ứng dụng nghe tin tức tự động cho người cao tuổi Việt Nam.

## 1. Yêu cầu hệ thống
- **Backend:** Node.js (v18+)
- **Frontend:** Trình duyệt web hiện đại (Chrome, Edge, Safari) có hỗ trợ tiếng Việt.
- **Database:** Supabase account.
- **AI:** Gemini API Key.

## 2. Cài đặt Backend
> [!TIP]
> **Dành cho người mới:** Xem [Hướng dẫn chi tiết từng bước tại đây](file:///Users/mac/eric%20demo/voice-news/backend_setup_guide.md) để biết cách lấy API Key và cài đặt từ A-Z.

1. Truy cập thư mục `backend`:
   ```bash
   cd backend
   npm install
   ```
2. Tạo file `.env` từ `.env.example` và điền các thông tin:
   - `GEMINI_API_KEY`: Lấy tại [AI Studio](https://aistudio.google.com).
   - `SUPABASE_URL` & `SUPABASE_ANON_KEY`: Lấy tại Project Settings -> API của [Supabase](https://supabase.com).

3. Chạy pipeline lần đầu:
   ```bash
   node src/pipeline.js
   ```

## 3. Thiết lập Database (Supabase)
Trong giao diện Supabase SQL Editor, chạy câu lệnh sau để tạo bảng:

```sql
create table news_clusters (
  id uuid default gen_random_uuid() primary key,
  cluster_title text unique,
  summary text,
  images text[],
  sources text[],
  priority text,
  created_at timestamptz default now()
);

-- Bật Row Level Security (RLS) để cho phép đọc công khai (Read-only)
alter table news_clusters enable row level security;
create policy "Cho phép mọi người đọc tin" on news_clusters for select using (true);
```

## 4. Cài đặt Frontend
1. Mở file `frontend/app.js`.
2. Điền `SUPABASE_URL` và `SUPABASE_ANON_KEY` vào phần CONFIGURATION ở đầu file.
3. Mở file `frontend/index.html` bằng trình duyệt để bắt đầu nghe.

## 5. Tự động hóa với GitHub Actions
1. Đưa toàn bộ code lên một repository GitHub.
2. Vào Settings -> Secrets and variables -> Actions.
3. Thêm 3 secret: `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`.
4. Hệ thống sẽ tự động cào tin và tóm tắt mỗi 2 tiếng một lần.
