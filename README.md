# Figure Store - Website Bán Mô Hình Chính Hãng & Tích Hợp Trợ Lý AI
*Đề tài Thực tập Tốt nghiệp / Khóa luận tốt nghiệp khoa Công nghệ thông tin*

---

## 🎯 Giới thiệu dự án
Dự án **Figure Store** là một website thương mại điện tử chuyên cung cấp mô hình nhân vật (figures, gundam, nendoroid...) chính hãng. Hệ thống được phát triển tách biệt thành hai phần chính: **Frontend (React.js SPA)** và **Backend (Spring Boot RESTful APIs)**.
Điểm nhấn công nghệ của dự án là việc tích hợp **Trợ lý ảo AI (Gemini API)** có khả năng trò chuyện thông minh và truy vấn dữ liệu database thời gian thực để hỗ trợ khách hàng (đặc điểm sản phẩm, chương trình flash sale, mã giảm giá...).

---

## 🛠️ Công nghệ sử dụng

### 1. Backend:
- **Ngôn ngữ**: Java 17
- **Framework**: Spring Boot (v3.x)
- **Bảo mật**: Spring Security & JWT Token Authentication
- **Cơ sở dữ liệu**: MySQL
- **ORM**: Hibernate & Spring Data JPA
- **Trí tuệ nhân tạo**: Google Gemini AI (chạy qua RestTemplate / Gemini API client)
- **Websockets**: Tích hợp thông báo thời gian thực

### 2. Frontend:
- **Thư viện chính**: React.js (v18+)
- **Quản lý Routing**: React Router DOM (v6)
- **HTTP Client**: Axios (Giao tiếp API với Header JWT tự động qua Interceptor)
- **Biểu đồ**: Chart.js / React-chartjs-2 (Vẽ biểu đồ thống kê doanh thu admin)
- **Biểu tượng**: React Icons (Fa, Md, Io...)
- **Giao diện**: CSS Vanilla với hiệu ứng chuyển động, thiết kế tối ưu trải nghiệm người dùng (UX/UI Premium)

---

## 📁 Cấu trúc thư mục dự án
```text
TTTN/
├── figure-frontend/      # Mã nguồn giao diện ReactJS
│   ├── public/           # Tài nguyên tĩnh (ảnh, icons)
│   ├── src/
│   │   ├── api/          # Cấu hình gọi API (Axios client)
│   │   ├── components/   # Các component giao diện dùng chung & Admin
│   │   ├── contexts/     # Category Context quản lý trạng thái danh mục
│   │   ├── pages/        # Các trang giao diện chính
│   │   ├── styles/       # Stylesheet CSS cho từng trang
│   │   └── App.jsx       # Quản lý Routing toàn hệ thống
│   └── package.json
│
├── figure_backend/       # Mã nguồn Spring Boot RESTful API
│   ├── src/main/java/com/example/figure/
│   │   ├── config/       # Cấu hình Security, WebSocket, CORS
│   │   ├── controller/   # Tiếp nhận và xử lý REST endpoints (Auth, Products, Orders, AI...)
│   │   ├── dto/          # Data Transfer Objects
│   │   ├── entity/       # Lớp mapping Database (User, Figure, Order, Promotion...)
│   │   ├── jwt/          # Cấu hình JWT Token Generator & Filter
│   │   ├── repository/   # JPA Repositories truy vấn CSDL
│   │   └── service/      # Chứa các Business Logic
│   ├── pom.xml           # File quản lý thư viện Maven
│   └── application.properties # File cấu hình kết nối DB, Server Port, API Key
│
├── tai_lieu_phan_bien_do_an.doc # Tài liệu báo cáo phản biện chi tiết (file Word)
└── README.md
```

---

## ⚙️ Hướng dẫn cài đặt & Chạy ứng dụng

### 1. Chuẩn bị môi trường
Hãy đảm bảo bạn đã cài đặt các công cụ sau:
- **JDK 17** hoặc cao hơn.
- **Node.js** (v18+).
- **MySQL Server** (đã khởi tạo sẵn database có tên `figure_store` hoặc tương tự).

### 2. Khởi tạo Cơ sở dữ liệu (Database)
- Khởi động MySQL Server của bạn.
- Tạo một cơ sở dữ liệu mới:
```sql
CREATE DATABASE figure_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Cấu hình & Chạy Backend
1. Di chuyển vào thư mục backend:
```bash
cd figure_backend
```
2. Mở file [application.properties](file:///d:/file_mon_hoc/TTTN/bao_cao/figure_backend/src/main/resources/application.properties) (nằm ở `src/main/resources/`) và điều chỉnh các cấu hình:
```properties
# Cấu hình CSDL MySQL
spring.datasource.url=jdbc:mysql://localhost:3306/figure_store?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=YOUR_MYSQL_USERNAME
spring.datasource.password=YOUR_MYSQL_PASSWORD

# Khởi tạo bảng tự động
spring.jpa.hibernate.ddl-auto=update

# Cấu hình Server Port
server.port=8080

# Cấu hình API Key Gemini AI Chatbot
gemini.api.key=YOUR_GEMINI_API_KEY
```
3. Chạy ứng dụng Spring Boot bằng lệnh:
- **Windows**:
```cmd
.\mvnw.cmd spring-boot:run
```
- **macOS/Linux**:
```bash
./mvnw spring-boot:run
```

### 4. Cấu hình & Chạy Frontend
1. Di chuyển vào thư mục frontend:
```bash
cd figure-frontend
```
2. Cài đặt các thư viện cần thiết:
```bash
npm install
```
3. Khởi chạy máy chủ phát triển (Development Server):
```bash
npm run dev
```
4. Truy cập giao diện người dùng qua trình duyệt tại địa chỉ mặc định: `http://localhost:5173`.

---

## 👑 Tài khoản Quản trị mặc định (Admin Credentials)
Sau khi chạy ứng dụng và đăng ký/chạy dữ liệu mẫu, bạn có thể tạo tài khoản admin hoặc cấp quyền `ROLE_ADMIN` trực tiếp trong Database ở bảng `user_roles` để truy cập trang quản trị `/admin` quản lý sản phẩm, danh mục, đơn hàng và xem thống kê doanh thu.
