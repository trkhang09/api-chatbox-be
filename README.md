# 🚀 AI Chatbox Backend (Personal Refactored Version)

## 📌 Giới thiệu

Đây là phiên bản backend được mình tách và phát triển lại từ một project nhóm, tập trung giữ lại các module chính mà mình trực tiếp tham gia xây dựng.

Project hướng đến việc xây dựng một hệ thống AI Chatbox API, có khả năng xử lý hội thoại và tích hợp với các mô hình AI như OpenAI và Gemini.

---

## 🧩 Những phần mình thực hiện

Trong project gốc, mình chịu trách nhiệm chính ở các phần sau:

- Thiết kế và xây dựng RESTful API
- Xử lý logic backend theo mô hình Controller → Service → Repository
- Tích hợp AI APIs:
  - OpenAI (chat completion)
  - Gemini (text generation)
- Thiết kế và thao tác với database (PostgreSQL)
- Xử lý dữ liệu hội thoại và luồng message
- Tối ưu và refactor code backend

---

## ⚙️ Công nghệ sử dụng

- Node.js / Express
- PostgreSQL
- RESTful API
- OpenAI API
- Google Gemini API
- LangChain (community modules)

---

## 📁 Cấu trúc project

src/
│── controllers/ # Xử lý request/response
│── services/ # Business logic
│── repositories/ # Data access layer
│── models/ # Định nghĩa entity
│── routes/ # Định tuyến API
│── config/ # Cấu hình (DB, env)

---

## 🚀 Cài đặt và chạy project

### 1. Clone project

git clone <your-repo-url>
cd ai-chatbox-be

### 2. Cài dependencies

npm install

### 3. Tạo file .env

copy từ file .env-example và thay biến môi trường

### 4. Chạy server

npm run dev
hoặc nest start

## ⚠️ Lưu ý

Đây là phiên bản refactor cá nhân từ project nhóm, chỉ giữ lại các phần mình phụ trách.
Một số module không liên quan đã được lược bỏ hoặc đơn giản hóa.
