# Hướng dẫn chi tiết cài đặt Backend (Dành cho người mới)

Chào bạn! Nếu bạn là người mới bắt đầu, đừng lo lắng. Hãy làm theo từng bước cực kỳ chi tiết dưới đây để thiết lập "bộ não" cho ứng dụng Voice News.

---

### Bước 1: Mở Terminal và Di chuyển vào thư mục dự án

1. **Mở Terminal**:
   - Trên Mac: Nhấn `Command + Space`, gõ "Terminal" và nhấn Enter.
2. **Di chuyển vào thư mục dự án**: 
   - Bạn cần đi tới thư mục `backend` nằm trong thư mục `voice-news`.
   - Gõ lệnh sau và nhấn Enter:
     ```bash
     cd "/Users/mac/eric demo/voice-news/backend"
     ```

### Bước 2: Cài đặt các thư viện cần thiết

Lệnh này sẽ tải toàn bộ các gói phần mềm (như Gemini SDK, Supabase SDK) về máy bạn.
- Gõ lệnh sau và nhấn Enter:
  ```bash
  npm install
  ```
- Đợi khoảng 1-2 phút cho đến khi lệnh chạy xong.

---

### Bước 3: Lấy khóa Gemini API (Miễn phí)

1. Truy cập: [aistudio.google.com](https://aistudio.google.com).
2. Đăng nhập bằng tài khoản Google của bạn.
3. Ở cột bên trái, nhấn vào nút **"Get API key"**.
4. Nhấn vào nút xanh **"Create API key in new project"**.
5. **Copy** dãy ký tự hiện ra. Đây chính là `GEMINI_API_KEY` của bạn.

---

### Bước 4: Lấy thông tin Supabase (Miễn phí)

1. Truy cập: [supabase.com](https://supabase.com) và đăng nhập.
2. Nhấn **"New Project"** (Nếu chưa có dự án nào).
3. Đặt tên (ví dụ: `VoiceNews`) và mật khẩu cho Database, rồi nhấn **"Create new project"**. Đợi khoảng 2-3 phút để dự án tạo xong.
4. Sau khi dự án sẵn sàng:
   - Nhìn xuống cột bên trái, tìm biểu tượng **Bánh răng (Project Settings)**.
   - Nhấn vào menu **"API"**.
   - Tại đây bạn sẽ thấy 2 mục quan trọng:
     - **Project URL**: Đây là `SUPABASE_URL`.
     - **anon (public)**: Đây là `SUPABASE_ANON_KEY`.
5. **Copy** cả hai thông tin này lại.

---

### Bước 5: Cấu hình file `.env`

File `.env` là nơi lưu trữ bí mật các chìa khóa bạn vừa lấy được.

> [!IMPORTANT]
> **Lưu ý quan trọng**: Trên máy Mac, các file bắt đầu bằng dấu chấm (như `.env.example`) thường bị **ẩn** trong Finder.
> - **Cách 1**: Nhấn tổ hợp phím `Command + Shift + .` (dấu chấm) để hiện các file ẩn.
> - **Cách 2**: Tôi đã tạo sẵn một file tên là **`env_example_txt`** (không có dấu chấm ở đầu) để bạn dễ nhìn thấy hơn.

1. Trong thư mục `backend`, hãy tìm file **`env_example_txt`** (hoặc `.env.example` nếu bạn đã hiện file ẩn).
2. Hãy **đổi tên** nó thành `.env` (phải có dấu chấm ở đầu, xóa hết các chữ khác).
3. Nếu máy hỏi bạn có chắc chắn muốn bắt đầu bằng dấu chấm không, hãy chọn **"Use ."**.
4. Mở file `.env` bằng phần mềm sửa văn bản (TextEdit, VS Code, v.v.).
5. Dán các khóa bạn đã copy vào sau dấu `=`:
   ```env
   GEMINI_API_KEY=dán_khóa_gemini_vào_đây
   SUPABASE_URL=dán_url_supabase_vào_đây
   SUPABASE_ANON_KEY=dán_key_anon_vào_đây
   ```
6. **Lưu file lại**.

---

### Bước 6: Chạy thử hệ thống lần đầu

Bây giờ chúng ta sẽ ra lệnh cho hệ thống đi cào tin và tóm tắt.
- Quay lại Terminal (phải đang ở thư mục `backend`) và gõ:
  ```bash
  node src/pipeline.js
  ```
- Nếu thấy hiện lên dòng chữ `--- PIPELINE COMPLETED SUCCESSFULLY ---` là bạn đã thành công!

---

### Một số lỗi thường gặp:
- **"command not found: npm"**: Bạn chưa cài Node.js. Hãy tải tại [nodejs.org](https://nodejs.org).
- **"Error: Cannot find module..."**: Có thể bạn quên chưa chạy `npm install` ở Bước 2.
- **"Invalid API Key"**: Hãy kiểm tra lại xem bạn đã dán đúng khóa vào file `.env` chưa và đã lưu file chưa.
