# BÁO CÁO PHÂN BIỆT & TÀI LIỆU VẬN HÀNH CHI TIẾT HỆ THỐNG FIGURE STORE
*Tài liệu hỗ trợ phản biện khóa luận tốt nghiệp / Báo cáo thực tập*

---

## PHẦN I: TỔNG QUAN KIẾN TRÚC HỆ THỐNG (SYSTEM ARCHITECTURE)

Hệ thống được xây dựng theo mô hình **Decoupled Architecture** (Kiến trúc tách rời giữa Frontend và Backend) giao tiếp hoàn toàn qua giao thức **RESTful API**:

### 1. Kiến trúc Frontend (React.js SPA)
- **Công nghệ chính**: React.js (v18+), React Router DOM (Điều hướng trang), Axios (HTTP Client giao tiếp API).
- **Quản lý trạng thái (State Management)**: Sử dụng **Context API** (ví dụ `CategoryContext`) để chia sẻ trạng thái danh mục sản phẩm toàn cục và các hooks cục bộ (`useState`, `useEffect`).
- **Xác thực người dùng**: JWT (JSON Web Token) được lưu trữ tại `localStorage`. Token tự động được gắn vào Header (`Authorization: Bearer <token>`) thông qua **Axios Interceptors** tại [axiosClient.js](file:///d:/file_mon_hoc/TTTN/bao_cao/figure-frontend/src/api/axiosClient.js) trong mỗi yêu cầu gửi đi.
- **Phân quyền Route (Route Guards)**:
  - `PublicRoute`: Chặn người dùng đã đăng nhập truy cập trang Login/Register.
  - `ProtectedRoute`: Yêu cầu đăng nhập trước khi truy cập trang thanh toán, giỏ hàng, hồ sơ cá nhân.
  - `AdminRoute`: Kiểm tra người dùng có quyền `ROLE_ADMIN` để cho phép vào trang quản trị `/admin/*`.

### 2. Kiến trúc Backend (Spring Boot REST API)
- **Công nghệ chính**: Java, Spring Boot, Spring Security (Xác thực phân quyền), Hibernate / JPA (Ánh xạ thực thể cơ sở dữ liệu), MySQL (Cơ sở dữ liệu quan hệ).
- **Luồng xử lý yêu cầu (Request Flow)**:
  1. `Client Yêu cầu HTTP` -> 2. `JwtAuthenticationFilter` (Giải mã, kiểm tra tính hợp lệ của Token) -> 3. `Controller` (Tiếp nhận và validate dữ liệu đầu vào) -> 4. `Service` (Thực thi logic nghiệp vụ) -> 5. `Repository` (Giao tiếp database thông qua Spring Data JPA) -> 6. Trả về kết quả JSON.

### 3. Tích hợp Trí tuệ nhân tạo (Gemini LLM Integration)
- Hệ thống tích hợp Trợ lý AI hội thoại thông minh hỗ trợ khách hàng, được kết nối động trực tiếp với dữ liệu thời gian thực trong Database (bao gồm sản phẩm, khuyến mãi, flash sale) giúp trả lời thông tin chính xác thay vì phản hồi tĩnh.

---

## PHẦN II: CHI TIẾT CÁCH HOẠT ĐỘNG CỦA TỪNG TRANG NGƯỜI DÙNG (STOREFRONT)

### 1. Trang chủ (`Home.jsx` / `/`)
- **Cách hoạt động**:
  - Giao diện gồm Banner băng chuyền (Carousel), danh sách danh mục nổi bật, các khu vực sản phẩm mới nhất, sản phẩm bán chạy, và phần Blog tin tức tóm tắt.
  - Khi tải trang, Frontend kích hoạt các yêu cầu GET đồng thời để lấy dữ liệu banner, danh mục, và sản phẩm từ backend.
- **API Backend tương ứng**:
  - `GET /api/banners` (Lấy danh sách các ảnh slide quảng cáo đang hoạt động).
  - `GET /api/categories` (Lấy danh sách danh mục).
  - `GET /api/figures?page=0&size=8&sortBy=createdAt` (Sản phẩm mới).

### 2. Trang danh sách sản phẩm (`FigureList.jsx` / `/figures`)
- **Cách hoạt động**:
  - Hiển thị toàn bộ mô hình (Figures) có phân trang.
  - Cung cấp thanh lọc đa năng bên trái: Lọc theo Danh mục (Category), Hãng sản xuất (Manufacturer), Series truyện, Tầm giá tiền, và ô tìm kiếm theo tên sản phẩm.
  - Khi người dùng thay đổi bộ lọc, các tham số truy vấn (`?category=...&price=...`) sẽ được cập nhật lên URL, kích hoạt `useEffect` gọi lại API để làm mới danh sách mà không cần tải lại trang.
- **API Backend tương ứng**:
  - `GET /api/figures` (Hỗ trợ lọc động bằng JPQL/Specification qua các tham số: `keyword`, `categoryId`, `minPrice`, `maxPrice`, `page`, `size`, `sort`).

### 3. Trang chi tiết sản phẩm (`ProductDetail.jsx` / `/product/:id`)
- **Cách hoạt động**:
  - Hiển thị chi tiết thông tin một mô hình: Tên, Hãng, Tỷ lệ (Scale), Giá bán, Số lượng kho, Mô tả chi tiết, hình ảnh bổ sung (Gallery) và Video giới thiệu sản phẩm.
  - Tích hợp tính năng thêm sản phẩm vào giỏ hàng, mua ngay, và thêm vào danh sách yêu thích (Wishlist).
  - Hiển thị các đánh giá (Reviews) kèm số sao của khách hàng đã mua trước đó.
- **API Backend tương ứng**:
  - `GET /api/figures/{id}` (Lấy thông tin chi tiết sản phẩm).
  - `GET /api/figures/{id}/related` (Đề xuất sản phẩm cùng danh mục).
  - `GET /api/reviews/product/{id}` (Lấy đánh giá của sản phẩm).

### 4. Trang giỏ hàng (`Cart.jsx` / `/cart`)
- **Cách hoạt động**:
  - Hiển thị danh sách sản phẩm người dùng đã thêm vào giỏ kèm số lượng.
  - Người dùng có thể tăng/giảm số lượng trực tiếp (gọi API cập nhật và kiểm tra hàng tồn kho thực tế ở backend) hoặc xóa sản phẩm khỏi giỏ.
  - Tính toán tổng tiền tạm tính thời gian thực.
- **API Backend tương ứng**:
  - `GET /api/cart` (Lấy giỏ hàng của user hiện tại, yêu cầu Token).
  - `PUT /api/cart/items/{itemId}` (Cập nhật số lượng mặt hàng).
  - `DELETE /api/cart/items/{itemId}` (Xóa mặt hàng khỏi giỏ).

### 5. Trang thanh toán (`Checkout.jsx` / `/checkout`)
- **Cách hoạt động**:
  - Thu thập thông tin giao hàng: Họ tên, Số điện thoại, Địa chỉ nhận hàng.
  - Cho phép chọn phương thức thanh toán: COD (Thanh toán khi nhận hàng) hoặc Chuyển khoản ngân hàng.
  - Nhập mã giảm giá (Voucher) - gọi API áp dụng voucher để trừ tiền trực tiếp vào hóa đơn.
  - Khi nhấn đặt hàng, Frontend gửi toàn bộ thông tin lên backend. Nếu đặt hàng thành công, giỏ hàng sẽ được xóa và chuyển hướng đến trang lịch sử đơn hàng.
- **API Backend tương ứng**:
  - `POST /api/orders` (Tạo đơn hàng mới từ giỏ hàng hiện tại, kiểm tra số lượng tồn kho và giảm số lượng sản phẩm tương ứng trong DB).
  - `GET /api/promotions/check?code={code}` (Kiểm tra và áp dụng mã giảm giá).

### 6. Trang thông tin cá nhân (`Profile.jsx` / `/profile`)
- **Cách hoạt động**:
  - Quản lý thông tin tài khoản của khách hàng: Tên, Email, Số điện thoại, Địa chỉ mặc định.
  - Cho phép người dùng bật/tắt nhận thông báo hệ thống qua email (Bài viết mới, Flash Sale, Cập nhật trạng thái đơn hàng, và Phản hồi từ trợ lý AI).
- **API Backend tương ứng**:
  - `GET /api/auth/profile` (Lấy thông tin tài khoản đang đăng nhập).
  - `PUT /api/auth/profile` (Cập nhật thông tin cá nhân và cấu hình nhận thông báo).

### 7. Trang chương trình Flash Sale (`FlashSale.jsx` / `/flash-sale`)
- **Cách hoạt động**:
  - Hiển thị các sản phẩm đang được giảm giá cực sốc theo các mốc thời gian quy định sẵn.
  - Tích hợp bộ đếm ngược (Countdown Timer) thời gian thực.
  - Hiển thị thanh tiến trình (Progress Bar) mô tả trực quan tỷ lệ sản phẩm đã bán / còn lại trong kho của chiến dịch Flash Sale đó.
  - Chia làm các danh mục nhỏ: Flash Sale sản phẩm, Vouchers giảm giá, Mã miễn phí vận chuyển (Freeship) và Ưu đãi khác.
- **API Backend tương ứng**:
  - `GET /api/flash-sales/active` (Lấy các chương trình Flash Sale đang diễn ra).
  - `GET /api/promotions/active` (Lấy danh sách mã giảm giá đang chạy).

### 8. Trang khuyến mãi tổng hợp (`Promotions.jsx` / `/promotions`)
- **Cách hoạt động**:
  - Nơi tập hợp tất cả các voucher, chương trình tặng quà, freeship của cửa hàng.
  - Người dùng có thể nhấn nút "Sao chép" (Copy) mã giảm giá nhanh hoặc nhấn "Áp dụng" để chuyển trực tiếp đến giỏ hàng áp dụng ưu đãi.
- **API Backend tương ứng**:
  - `GET /api/promotions/vouchers` (Lấy danh sách Voucher active).
  - `GET /api/promotions/freeship` (Lấy danh sách mã giảm phí vận chuyển).

### 9. Trang Blog tin tức (`Blog.jsx` & `BlogDetail.jsx` / `/blog`)
- **Cách hoạt động**:
  - Trang tin tức hiển thị các bài viết chia sẻ về thế giới figure, hướng dẫn chơi mô hình, tin tức phát hành sản phẩm mới và thông tin khuyến mãi.
  - Có các chuyên mục bài viết nổi bật (Featured), bài viết nhiều người xem nhất (Hot Posts) và công cụ tìm kiếm bài viết theo từ khóa/tag.
  - Chi tiết bài viết (`BlogDetail.jsx`) hiển thị đầy đủ văn bản nội dung bài viết, ảnh, tác giả và phần bình luận thảo luận bên dưới của người dùng.
- **API Backend tương ứng**:
  - `GET /api/posts` (Lấy danh sách bài viết phân trang).
  - `GET /api/posts/{id}` (Chi tiết bài viết và tăng lượt xem - view count).
  - `POST /api/comments/post/{postId}` (Gửi bình luận mới).

### 10. Các trang chức năng bổ trợ khác
- **Tra cứu đơn hàng (`TrackOrder.jsx` / `/track-order`)**: Cho phép khách hàng vãng lai hoặc khách hàng đã đăng nhập nhập Mã đơn hàng để kiểm tra trực tiếp trạng thái vận chuyển (Chờ xác nhận, Đang giao, Đã giao...) mà không cần đăng nhập tài khoản.
- **Sản phẩm yêu thích (`Wishlist.jsx` / `/wishlist`)**: Lưu trữ danh sách mô hình người dùng yêu thích để theo dõi giá và dễ dàng mua sau này.
- **So sánh sản phẩm (`Compare.jsx` / `/compare`)**: Cho phép đưa tối đa 3 mô hình lên bàn cân để so sánh trực quan về kích thước, tỷ lệ, giá cả, hãng sản xuất.
- **Thông báo (`Notifications.jsx` / `/notifications`)**: Xem danh sách các thông báo cá nhân hóa gửi từ hệ thống (xác nhận đơn hàng, khuyến mãi mới...).

### 11. Widget Chatbot AI hỗ trợ thông minh (`AiChatWidget.jsx`)
- **Cách hoạt động**:
  - Xuất hiện dưới góc màn hình toàn trang.
  - Khi người dùng gửi câu hỏi, Frontend gọi API backend. Backend nhận tin nhắn, truy vấn thông tin sản phẩm hoặc các chương trình khuyến mãi/Flash Sale đang chạy trong DB để chèn vào ngữ cảnh (context), sau đó gọi API Gemini để tạo ra phản hồi thông minh, chính xác nhất bằng ngôn ngữ tự nhiên.
- **API Backend tương ứng**:
  - `POST /api/ai/chat` (Nhận câu hỏi của user, xử lý hội thoại dựa trên dữ liệu database thực tế và trả về tin nhắn AI).

---

## PHẦN III: CHI TIẾT CÁCH HOẠT ĐỘNG CỦA CÁC TRANG QUẢN TRỊ (ADMIN PANEL)

### 1. Trang chủ thống kê (`DashboardStats.jsx` / `/admin/dashboard`)
- **Cách hoạt động**:
  - Trung tâm hiển thị báo cáo số liệu kinh doanh: Tổng doanh thu, Số đơn hàng mới, Số khách hàng đăng ký mới, Tổng sản phẩm đã bán.
  - Vẽ biểu đồ cột/đường xu hướng doanh thu theo các ngày trong tháng, biểu đồ cơ cấu danh mục sản phẩm bán chạy nhất.
- **API Backend tương ứng**:
  - `GET /api/admin/dashboard/stats` (Trả về các con số thống kê tổng hợp).
  - `GET /api/admin/dashboard/revenue-chart` (Trả về dữ liệu vẽ biểu đồ doanh thu theo thời gian).

### 2. Quản lý sản phẩm (`ProductManagement.jsx` / `/admin/products`)
- **Cách hoạt động**:
  - Giao diện bảng (Table) hiển thị danh sách tất cả sản phẩm mô hình, hỗ trợ tìm kiếm, lọc nhanh.
  - Cung cấp form modal Thêm mới / Chỉnh sửa sản phẩm: Nhập tên, giá, số lượng, chọn danh mục, tải ảnh chính, danh sách ảnh gallery, đường dẫn video review.
  - Tích hợp tải ảnh trực tiếp từ máy tính lên server thông qua API upload trung gian.
- **API Backend tương ứng**:
  - `GET/POST/PUT/DELETE /api/admin/products` (Các phương thức CRUD sản phẩm).
  - `POST /api/upload` (Upload hình ảnh lên thư mục lưu trữ của server).

### 3. Quản lý danh mục (`CategoryManagement.jsx` / `/admin/categories`)
- **Cách hoạt động**:
  - Quản lý các phân loại mô hình (ví dụ: Scale Figure, Chibi, Nendoroid, Action Figure...).
  - Thêm, sửa tên danh mục, mô tả, và biểu tượng đại diện.
- **API Backend tương ứng**:
  - `GET/POST/PUT/DELETE /api/admin/categories` (CRUD danh mục).

### 4. Quản lý khuyến mãi (`PromotionManagement.jsx` / `/admin/promotions`)
- **Cách hoạt động**:
  - Nơi Admin thiết lập mã giảm giá (Vouchers), mã miễn phí vận chuyển.
  - Nhập tiêu đề, mã code, % giảm giá, mô tả, điều kiện áp dụng, sản phẩm áp dụng và khoảng thời gian hiệu lực.
  - Cho phép tải ảnh banner khuyến mãi trực tiếp lên server để hiển thị ngoài trang chủ người dùng.
- **API Backend tương ứng**:
  - `GET/POST/PUT/DELETE /api/admin/promotions` (CRUD khuyến mãi).

### 5. Quản lý Flash Sale (`FlashSaleManagement.jsx` / `/admin/flash-sale`)
- **Cách hoạt động**:
  - Quản lý các chiến dịch giảm giá chớp nhoáng cho các sản phẩm cụ thể.
  - Admin chọn sản phẩm trong hệ thống, thiết lập giá Flash Sale đặc biệt, giới hạn số lượng bán ra tối đa trong đợt sale đó, và đặt thời gian bắt đầu - kết thúc cụ thể.
- **API Backend tương ứng**:
  - `GET/POST/PUT/DELETE /api/admin/flash-sales` (CRUD sự kiện Flash Sale).

### 6. Quản lý đơn hàng (`OrderManagement.jsx` / `/admin/orders`)
- **Cách hoạt động**:
  - Hiển thị danh sách tất cả đơn đặt hàng của toàn bộ hệ thống.
  - Admin kiểm tra chi tiết đơn hàng (thông tin người mua, danh sách sản phẩm mua, phương thức thanh toán) và cập nhật trạng thái đơn hàng (từ Chờ xác nhận -> Đã xác nhận -> Đang giao -> Đã giao).
- **API Backend tương ứng**:
  - `GET /api/admin/orders` (Danh sách đơn hàng).
  - `PUT /api/admin/orders/{id}/status` (Cập nhật trạng thái đơn hàng).

### 7. Quản lý người dùng (`UserManagement.jsx` / `/admin/users`)
- **Cách hoạt động**:
  - Quản lý tài khoản khách hàng và nhân viên trong hệ thống.
  - Cho phép kích hoạt hoặc tạm khóa tài khoản người dùng, thay đổi phân quyền (Role) giữa Admin và User.
- **API Backend tương ứng**:
  - `GET/PUT /api/admin/users` (Xem danh sách và khóa/mở khóa tài khoản).

### 8. Lịch sử hội thoại AI (`AdminAiChat.jsx` / `/admin/ai-chat`)
- **Cách hoạt động**:
  - Hiển thị danh sách các phiên trò chuyện giữa khách hàng và Trợ lý AI.
  - Admin có thể đọc lại lịch sử chat để nắm bắt nhu cầu khách hàng, hỗ trợ trực tiếp khi AI chưa giải quyết được triệt để thắc mắc của khách.
- **API Backend tương ứng**:
  - `GET /api/admin/ai-chat/sessions` (Lấy danh sách hội thoại).
  - `GET /api/admin/ai-chat/sessions/{sessionId}/messages` (Chi tiết tin nhắn trong cuộc trò chuyện).
---

## PHẦN IV: BỘ CÂU HỎI PHẢN BIỆN VÀ ĐÁP ÁN TRẢ LỜI CHI TIẾT (ĐỊNH HƯỚNG BẢO VỆ CHO SINH VIÊN)

Dưới đây là bộ câu hỏi thường gặp khi bảo vệ trước Hội đồng và các câu trả lời mẫu được biên soạn theo phong cách hội thoại lễ phép, khiêm tốn nhưng tự tin của sinh viên, kèm theo giải thích ngắn gọn các thuật ngữ viết tắt để tránh bị thầy cô hỏi xoáy:

### 🌟 BẢNG GIẢI THÍCH NHANH CÁC THUẬT NGỮ VIẾT TẮT TRONG BÁO CÁO:
- **SPA (Single Page Application - Ứng dụng trang đơn):** Trang web chỉ tải một trang HTML duy nhất, dữ liệu chuyển đổi được cập nhật động bằng Javascript mà không cần tải lại toàn bộ trang.
- **REST / RESTful API (Representational State Transfer):** Chuẩn thiết kế API web sử dụng các phương thức HTTP (GET, POST, PUT, DELETE) để trao đổi dữ liệu.
- **JWT (JSON Web Token):** Một chuỗi mã hóa nhỏ chứa thông tin định danh người dùng dưới dạng JSON, được gửi kèm trong Header để xác thực người dùng.
- **RDBMS (Relational Database Management System - Hệ quản trị CSDL quan hệ):** Hệ thống quản lý dữ liệu dưới dạng các bảng có quan hệ ràng buộc chéo (như MySQL).
- **NoSQL (Not Only SQL):** CSDL phi quan hệ, lưu trữ dữ liệu dạng tài liệu linh hoạt (như MongoDB) thay vì chia bảng.
- **ACID (Atomicity - Consistency - Isolation - Durability):** Tập hợp 4 thuộc tính đảm bảo giao dịch CSDL diễn ra an toàn (Nguyên tố - Nhất quán - Độc lập - Bền vững).
- **RAG (Retrieval-Augmented Generation):** Kỹ thuật cải tiến AI bằng cách truy xuất thêm dữ liệu thực tế ngoài CSDL để ghép vào prompt trước khi gửi đi.
- **3NF (Third Normal Form - Dạng chuẩn 3):** Quy chuẩn thiết kế CSDL nhằm loại bỏ tối đa sự trùng lặp và dư thừa thông tin giữa các bảng.
- **DTO (Data Transfer Object):** Đối tượng dùng để đóng gói và vận chuyển dữ liệu qua lại giữa các tầng của ứng dụng (Frontend -> Backend).
- **RBAC (Role-Based Access Control):** Cơ chế quản lý quyền truy cập của người dùng dựa trên vai trò được cấp (ADMIN hoặc USER).
- **CORS (Cross-Origin Resource Sharing):** Cơ chế bảo mật của trình duyệt ngăn chặn các request từ domain này gọi API sang domain khác khi chưa được cho phép.
- **DAO (Data Access Object / Repository):** Lớp mã nguồn chuyên phụ trách giao tiếp, truy vấn dữ liệu trực tiếp trong Database.
- **CRUD (Create - Read - Update - Delete):** 4 thao tác cơ bản với dữ liệu (Thêm, Đọc, Sửa, Xóa).
- **LLM (Large Language Model - Mô hình ngôn ngữ lớn):** Mô hình AI được huấn luyện trên lượng dữ liệu khổng lồ để hiểu và tạo ngôn ngữ tự nhiên (như Gemini).

---

### 1. NHÓM CÂU HỎI TỔNG QUAN VỀ ĐỀ TÀI

#### HỎI: Đề tài của bạn giải quyết vấn đề gì?
**TRẢ LỜI:** Dạ thưa thầy/cô, đề tài của em tập trung giải quyết bài toán mua sắm mô hình nhân vật trực tuyến. Em tập trung giải quyết việc tự động hóa quản lý kho hàng, tối ưu hóa quy trình thanh toán đặt hàng nhanh của khách, và đặc biệt là giải quyết khó khăn trong việc tư vấn khách hàng 24/7. Thay vì cần nhân sự trực tuyến liên tục, em đã tích hợp Trợ lý ảo AI có khả năng đọc hiểu dữ liệu sản phẩm và khuyến mãi thực tế từ CSDL để phản hồi ngay cho khách hàng ạ.

#### HỎI: Lý do bạn chọn đề tài này là gì?
**TRẢ LỜI:** Dạ, em chọn đề tài này xuất phát từ hai lý do chính ạ. Thứ nhất, phong trào sưu tầm mô hình (figure) ở nước ta đang phát triển rất mạnh mẽ và khách hàng có nhu cầu tra cứu thông số rất tỉ mỉ (như hãng sản xuất, tỷ lệ sản phẩm). Thứ hai, em nhận thấy các trang web thương mại điện tử hiện nay hầu như chưa ứng dụng Trí tuệ nhân tạo **LLM** (Large Language Model - Mô hình ngôn ngữ lớn) kết nối trực tiếp với dữ liệu động. Vì vậy, em muốn áp dụng các kiến thức đã học về Java Spring Boot và ReactJS kết hợp với API Gemini của Google để tạo ra giải pháp mua sắm thông minh hơn ạ.

#### HỎI: Mục tiêu chính của dự án là gì?
**TRẢ LỜI:** Dạ thưa thầy/cô, mục tiêu chính của em khi thực hiện đồ án này là: Thiết kế và lập trình hoàn chỉnh một trang web bán hàng **SPA** (Single Page Application - Ứng dụng trang đơn) tải nhanh, giao diện đẹp; xây dựng hệ thống quản trị dữ liệu (Admin Panel) chuẩn hóa để quản lý sản phẩm và xử lý đơn hàng; đồng thời huấn luyện và cấu hình chatbot AI trả lời đúng các thông tin về kho hàng và khuyến mãi thực tế ạ.

#### HỎI: Đối tượng sử dụng hệ thống là ai?
**TRẢ LỜI:** Dạ, đối tượng sử dụng hệ thống của em gồm hai nhóm:
1. **Khách hàng**: Những người yêu thích mô hình muốn lên web tìm kiếm, so sánh sản phẩm, chat hỏi đáp thông tin và thực hiện mua hàng.
2. **Quản trị viên (Admin)**: Chủ cửa hàng hoặc nhân viên quản lý kho, phụ trách cập nhật mô hình mới, duyệt đơn hàng, tạo mã giảm giá và theo dõi doanh thu hàng ngày ạ.

#### HỎI: Điểm mới hoặc ưu điểm của dự án so với các hệ thống hiện có là gì?
**TRẢ LỜI:** Dạ, điểm mới nổi bật nhất trong đồ án của em là **Chatbot AI tư vấn dữ liệu thực tế**. Chatbot của em không trả lời theo kịch bản soạn sẵn mà hoạt động theo cơ chế **RAG** (Retrieval-Augmented Generation - Tạo câu trả lời tăng cường bằng cách truy xuất dữ liệu). Khi khách hỏi về khuyến mãi hay sản phẩm, AI sẽ tự tìm thông tin đang có trong CSDL MySQL rồi mới tạo câu trả lời chính xác kèm link click dẫn tới sản phẩm đó ạ. Ngoài ra, giao diện của trang web được em chăm chút thiết kế theo phong cách hiện đại, chuyển cảnh mượt mà và tối ưu hóa tốt trên thiết bị di động ạ.

#### HỎI: Dự án của bạn đã hoàn thành bao nhiêu phần trăm?
**TRẢ LỜI:** Dạ thưa thầy/cô, tính đến thời điểm hiện tại, dự án của em đã hoàn thành **100%** các chức năng được đề ra trong đề cương thực tập và chạy thử nghiệm thành công trên môi trường cục bộ ạ.

---

### 2. NHÓM CÂU HỎI VỀ CÔNG NGHỆ

#### HỎI: Vì sao bạn chọn ngôn ngữ lập trình và framework này?
**TRẢ LỜI:** Dạ thưa thầy/cô, em chọn **Java/Spring Boot** cho backend vì Java là ngôn ngữ có tính an toàn cao, gõ tĩnh giúp em kiểm soát lỗi chặt chẽ. Spring Boot hỗ trợ Auto-Configuration giúp em khởi tạo API **REST** (Representational State Transfer - Giao thức truyền tải trạng thái đại diện) nhanh chóng và tích hợp sẵn các giải pháp bảo mật mạnh mẽ của Spring Security. Còn đối với frontend, em chọn **ReactJS** vì đây là thư viện tối ưu hóa hiển thị giao diện qua DOM ảo rất tốt, cơ chế chia nhỏ thành các Component giúp em dễ quản lý và mang lại trải nghiệm ứng dụng trang đơn tải rất mượt mà cho người dùng ạ.

#### HỎI: Tại sao chọn MySQL thay vì SQL Server hoặc MongoDB?
**TRẢ LỜI:** Dạ, em chọn **MySQL** vì hệ thống của em là website bán hàng, các thao tác thanh toán và trừ kho đòi hỏi tính toàn vẹn dữ liệu cực kỳ khắt khe (tuân thủ tính chất **ACID** - đảm bảo giao dịch diễn ra an toàn không lỗi nửa chừng), nên em bắt buộc phải sử dụng cơ sở dữ liệu quan hệ **RDBMS** (Relational Database Management System). Em chọn MySQL thay vì SQL Server vì MySQL là mã nguồn mở, hoàn toàn miễn phí, rất nhẹ và phổ biến trong giảng dạy nhà trường. Còn **MongoDB** là **NoSQL** (Cơ sở dữ liệu phi quan hệ), cấu trúc dạng tài liệu của nó không đảm bảo an toàn cho các giao dịch liên kết phức tạp như giỏ hàng và đơn hàng ạ.

#### HỎI: Ưu điểm và nhược điểm của Spring Boot là gì?
**TRẢ LỜI:** Dạ, theo trải nghiệm của em khi code dự án này:
- **Ưu điểm**: Giúp em tiết kiệm rất nhiều thời gian cấu hình xml nhờ cơ chế tự động cài đặt; nhúng sẵn Tomcat nên em chỉ cần chạy file JAR; quản lý dependencies qua Maven rất khoa học.
- **Nhược điểm**: Thời gian khởi chạy ban đầu hơi lâu; dung lượng tệp JAR khi build ra khá nặng và ứng dụng Spring Boot tiêu tốn khá nhiều dung lượng bộ nhớ RAM khi chạy ạ.

#### HỎI: Tại sao sử dụng React cho phần frontend?
**TRẢ LỜI:** Dạ, em dùng ReactJS vì muốn tách biệt hoàn toàn vai trò của Frontend và Backend. Frontend sẽ chỉ lo hiển thị và tương tác người dùng, nhận dữ liệu qua API JSON từ backend. Việc này giúp giảm tải cho server và tạo ra giao diện ứng dụng mượt mà hơn ạ.

#### HỎI: Vì sao dự án được xây dựng theo kiến trúc Monolithic REST API thay vì Microservices?
**TRẢ LỜI:** Dạ thưa thầy/cô, trong phạm vi của một đồ án tốt nghiệp/thực tập tốt nghiệp, em lựa chọn kiến trúc **Monolithic** (Kiến trúc khối đồng nhất) vì:
1. Giúp em tập trung tối đa thời gian vào việc hoàn thiện các nghiệp vụ phức tạp của cửa hàng (như giỏ hàng, thanh toán, xử lý AI) mà không bị phân tán vào việc cấu hình hạ tầng mạng phức tạp của Microservices.
2. Tránh độ trễ mạng phát sinh khi các dịch vụ phải gọi chéo nhau qua mạng.
3. Việc quản lý Transaction (giao dịch đặt hàng và trừ kho sản phẩm) trên một Database duy nhất diễn ra an toàn và dễ kiểm soát lỗi hơn rất nhiều ạ. Tuy nhiên, em đã viết mã nguồn phân chia package rõ ràng để sau này dễ dàng bóc tách lên Microservices khi cần thiết ạ.

#### HỎI: Hãy giải thích cách hoạt động của OpenFeign, Kafka/RabbitMQ, Eureka Server, API Gateway (nếu hệ thống chuyển đổi lên Microservices)?
**TRẢ LỜI:** Dạ, theo tìm hiểu lý thuyết của em:
- **Eureka Server**: Là trung tâm đăng ký dịch vụ (Service Registry), giúp các microservices khai báo địa chỉ IP/Port và tìm thấy nhau trong hệ thống.
- **API Gateway**: Là cửa ngõ duy nhất tiếp nhận mọi request từ Client, thực hiện điều hướng request đến đúng microservice và xử lý xác thực tập trung.
- **OpenFeign**: Giúp em viết code gọi REST API giữa các microservices một cách ngắn gọn dưới dạng khai báo Interface.
- **Kafka / RabbitMQ**: Là các Message Broker (Hệ thống trung chuyển hàng đợi tin nhắn) giúp truyền tải tin nhắn bất đồng bộ, giải quyết bài toán giao tiếp không đồng bộ giữa các dịch vụ để giảm tải nghẽn hệ thống.
- **Docker**: Giúp em đóng gói ứng dụng thành các Container độc lập, chạy được ở mọi máy tính mà không sợ lỗi xung đột môi trường ạ.

---

### 3. NHÓM CÂU HỎI VỀ CƠ SỞ DỮ LIỆU

#### HỎI: Hệ thống của bạn có những bảng nào?
**TRẢ LỜI:** Dạ, cơ sở dữ liệu của em gồm các bảng chính: bảng `users` lưu tài khoản; `roles` và `user_roles` để phân quyền; bảng `figures` lưu sản phẩm mô hình; `categories` lưu danh mục; `orders` và `order_items` để quản lý đơn hàng; `promotions` lưu mã giảm giá; `flash_sales` cho giảm giá giờ vàng; `chat_messages` lưu lịch sử tin nhắn AI; cùng một số bảng phụ như `comments`, `reviews`, `branches`, `banners` ạ.

#### HỎI: Mối quan hệ giữa các bảng được thiết kế như thế nào?
**TRẢ LỜI:** Dạ thưa thầy/cô, em thiết kế các bảng có mối quan hệ ràng buộc chặt chẽ với nhau:
- **Quan hệ 1 - Nhiều (1-n)**: Một danh mục chứa nhiều mô hình; một người dùng có thể đặt nhiều đơn hàng; một đơn hàng chứa nhiều chi tiết sản phẩm (`order_items`).
- **Quan hệ Nhiều - Nhiều (n-n)**: Thiết lập giữa tài khoản người dùng và quyền truy cập thông qua bảng trung gian `user_roles` ạ.

#### HỎI: Tại sao bạn lại thiết kế cơ sở dữ liệu như vậy?
**TRẢ LỜI:** Dạ, em đã tiến hành thiết kế và phân tích các bảng CSDL tuân thủ theo dạng chuẩn hóa **3NF** (Third Normal Form - Dạng chuẩn hóa CSDL cấp độ 3). Việc này giúp cơ sở dữ liệu của em giảm thiểu tối đa sự trùng lặp thông tin (như không cần lặp lại thông tin cá nhân khách hàng ở mỗi dòng chi tiết sản phẩm) và loại bỏ được các lỗi dị thường khi thêm mới hoặc cập nhật dữ liệu ạ.

#### HỎI: Khóa chính và khóa ngoại có vai trò gì?
**TRẢ LỜI:** Dạ, **Khóa chính** giúp định danh duy nhất cho một dòng dữ liệu (ví dụ mã sản phẩm), đảm bảo dữ liệu không bị lặp. Còn **Khóa ngoại** giúp tạo mối liên kết logic giữa các bảng và duy trì tính toàn vẹn dữ liệu, không cho phép lưu sản phẩm thuộc về một danh mục không tồn tại trong hệ thống ạ.

#### HỎI: Chuẩn hóa dữ liệu là gì?
**TRẢ LỜI:** Dạ, chuẩn hóa dữ liệu là việc phân tích và tổ chức lại các bảng dữ liệu theo các quy tắc toán học quan hệ (các dạng chuẩn 1NF, 2NF, 3NF...) nhằm loại bỏ sự dư thừa thông tin và ngăn ngừa các lỗi sai lệch dữ liệu trong quá trình cập nhật dữ liệu ạ.

#### HỎI: Nếu dữ liệu tăng lên hàng triệu bản ghi, bạn sẽ tối ưu như thế nào?
**TRẢ LỜI:** Dạ thưa thầy/cô, nếu dữ liệu tăng lên quy mô lớn, em sẽ áp dụng các giải pháp tối ưu sau:
1. Thực hiện đánh chỉ mục (**Database Indexing**) ở các trường thường xuyên dùng để tìm kiếm (như tên mô hình, mã đơn hàng).
2. Thiết lập cơ chế phân trang (**Pagination**) bắt buộc ở mọi API trả về danh sách để không làm nghẽn ram.
3. Sử dụng giải pháp lưu trữ bộ đệm (**Caching** với Redis) cho các dữ liệu tĩnh ít thay đổi.
4. Nghiên cứu phân chia bảng (**Partitioning**) hoặc áp dụng mô hình sao chép CSDL **Master-Slave** để phân tán tải truy vấn ạ.

#### HỎI: Index trong cơ sở dữ liệu dùng để làm gì?
**TRẢ LỜI:** Dạ, Index giúp tăng tốc độ tìm kiếm bản ghi trong bảng. Thay vì phải quét qua từng dòng từ đầu đến cuối bảng (Table Scan) rất tốn thời gian, cơ chế Index tạo ra một cây tìm kiếm nhanh (thường là cấu trúc B-Tree) giúp hệ thống trỏ thẳng đến bản ghi cần tìm chỉ trong vài mili-giây ạ.

---

### 4. NHÓM CÂU HỎI VỀ CHỨC NĂNG

#### HỎI: Chức năng quan trọng nhất của hệ thống là gì?
**TRẢ LỜI:** Dạ thưa thầy/cô, theo em chức năng quan trọng nhất của hệ thống là **Quy trình đặt hàng và thanh toán trực tuyến** (yêu cầu trừ kho chính xác, tính toán tổng tiền chuẩn) và **Trợ lý ảo AI hỗ trợ tự động** (nhận diện câu hỏi để gợi ý sản phẩm, chi nhánh và voucher phù hợp từ database) ạ.

#### HỎI: Quy trình người dùng đặt hàng diễn ra như thế nào?
**TRẢ LỜI:** Dạ, quy trình bắt đầu từ việc người dùng thêm sản phẩm vào giỏ hàng -> Chuyển sang trang thanh toán nhập địa chỉ -> Nhập mã voucher (hệ thống gọi API kiểm tra điều kiện áp dụng) -> Chọn phương thức thanh toán -> Nhấn đặt hàng. Lúc này, Backend sẽ tiếp nhận yêu cầu, kiểm tra số lượng tồn kho thực tế, tiến hành trừ kho trong DB, tạo đơn hàng mới và gửi tín hiệu thông báo thời gian thực về màn hình Admin qua WebSocket ạ.

#### HỎI: Hệ thống xử lý lỗi khi người dùng nhập sai dữ liệu ra sao?
**TRẢ LỜI:** Dạ, em xử lý lỗi ở cả hai đầu:
- Ở **Frontend**: Em kiểm tra tính hợp lệ của dữ liệu đầu vào bằng các hàm logic và báo lỗi đỏ ngay trên giao diện.
- Ở **Backend**: Em dùng các thẻ validation của Spring Boot trong lớp **DTO** (Data Transfer Object - Đối tượng truyền tải dữ liệu) để chặn request lại và trả về thông tin lỗi rõ ràng dưới dạng JSON nếu dữ liệu vượt qua được frontend ạ.

#### HỎI: Nếu một dịch vụ bị lỗi thì toàn bộ hệ thống có hoạt động được không?
**TRẢ LỜI:** Dạ thưa thầy/cô, vì hệ thống của em xây dựng theo mô hình Monolith nên nếu server Spring Boot bị sập thì toàn bộ trang web sẽ tạm thời ngưng hoạt động. Tuy nhiên, em đã đóng gói server trong Docker Container với thuộc tính tự động khởi động lại giúp ứng dụng tự phục hồi chạy lại ngay lập tức khi phát hiện có sự cố crash hệ thống ạ.

#### HỎI: Hệ thống phân quyền người dùng như thế nào?
**TRẢ LỜI:** Dạ, em phân quyền dựa trên cơ chế JWT kết hợp Spring Security. Tài khoản đăng nhập thành công sẽ nhận được một Token JWT chứa danh sách quyền của mình (ADMIN hoặc USER). Backend sẽ cấu hình chặn các đường dẫn admin `/api/admin/**` chỉ dành cho ROLE_ADMIN. Phía Frontend em cũng viết bộ định tuyến bảo vệ (`AdminRoute`) để ngăn chặn tài khoản thường cố tình truy cập vào trang quản trị ạ.

#### HỎI: API nào được sử dụng nhiều nhất?
**TRẢ LỜI:** Dạ, đó là API lấy danh sách sản phẩm `GET /api/figures` (vì được gọi mỗi khi người dùng tải trang chủ, tìm kiếm, chuyển phân trang hoặc lọc danh mục) và API lấy thông tin tài khoản đang đăng nhập `GET /api/auth/profile` để hiển thị menu cá nhân hóa ạ.

---

### 5. NHÓM CÂU HỎI VỀ KIẾN TRÚC VÀ THUẬT TOÁN

#### HỎI: Hãy mô tả kiến trúc tổng thể của hệ thống.
**TRẢ LỜI:** Dạ thưa thầy/cô, hệ thống của em được thiết kế theo kiến trúc phân tầng truyền thống (**Layered Architecture**):
- **Controller**: Tiếp nhận request từ client, validate dữ liệu đầu vào.
- **Service**: Xử lý logic nghiệp vụ và tính toán chính của hệ thống.
- **Repository** (hay **DAO - Data Access Object**): Thực hiện truy vấn dữ liệu từ MySQL Database qua Spring Data JPA.
- **Entity**: Lớp ánh xạ trực tiếp các bảng CSDL thành các đối tượng Java ạ.

#### HỎI: Luồng dữ liệu từ frontend đến backend diễn ra như thế nào?
**TRẢ LỜI:** Dạ, luồng đi từ thao tác click chuột của người dùng trên giao diện React -> React gọi API thông qua thư viện Axios kèm Token JWT -> Request truyền đến Backend Spring Boot -> Bộ lọc Spring Security giải mã Token và xác thực -> Controller tiếp nhận request -> Gọi Service thực thi nghiệp vụ -> Service gọi Repository truy vấn MySQL CSDL -> Dữ liệu trả về Service xử lý -> Trả về Client dưới dạng JSON -> Giao diện React nhận dữ liệu cập nhật lại giao diện người dùng ạ.

#### HỎI: JWT là gì và hoạt động ra sao?
**TRẢ LỜI:** Dạ, **JWT (JSON Web Token - Chuỗi mã hóa dữ liệu xác thực)** là một chuỗi mã hóa gồm 3 phần chính cách nhau bởi dấu chấm: Header (Khai báo thuật toán), Payload (Chứa thông tin user như username, roles) và Signature (Chữ ký số xác thực).
- **Cách hoạt động**: Khi người dùng đăng nhập thành công, Server dùng Secret Key của mình ký và tạo ra chuỗi JWT gửi về lưu ở trình duyệt khách hàng. Ở những yêu cầu tiếp theo, Frontend tự động đính chuỗi này vào Header. Server nhận được sẽ giải mã Signature, nếu trùng khớp chữ ký thì chấp nhận người dùng đã xác thực thành công và cho phép truy cập tài nguyên ạ.

#### HỎI: RESTful API là gì?
**TRẢ LỜI:** Dạ thưa thầy/cô, RESTful API là một tiêu chuẩn thiết kế API web sử dụng các phương thức HTTP tiêu chuẩn (GET, POST, PUT, DELETE) để quản lý tài nguyên. Tài nguyên trong hệ thống của em được đại diện bằng các đường dẫn danh từ (ví dụ: `/api/figures`, `/api/orders`) giúp việc gọi và thiết kế hệ thống trở nên tường minh, dễ hiểu ạ.

---

### 6. NHÓM CÂU HỎI TÌNH HUỐNG PHẢN BIỆN

#### HỎI: Nếu có 10.000 người dùng truy cập cùng lúc, hệ thống sẽ xử lý thế nào?
**TRẢ LỜI:** Dạ thưa thầy/cô, nếu hệ thống có tải lớn đột biến 10.000 người dùng cùng lúc, với cấu hình hiện tại sẽ dễ xảy ra tình trạng nghẽn cổ chai. Để giải quyết, em đề xuất các phương án tối ưu:
1. Sử dụng **Nginx** làm Load Balancer để chia tải đến các cụm Docker chứa nhiều server Spring Boot chạy song song.
2. Tối ưu hóa **HikariCP** (Database Connection Pool) trong Spring Boot để tăng khả năng xử lý truy vấn đồng thời.
3. Kích hoạt bộ nhớ đệm **Redis Cache** cho các dữ liệu trang chủ nhằm giảm tải tối đa số lần đọc trực tiếp từ MySQL.
4. Đưa các tác vụ nặng (như gửi email xác nhận đơn hàng) vào hàng đợi tin nhắn **RabbitMQ** để xử lý bất đồng bộ.

#### HỎI: Nếu cơ sở dữ liệu bị mất kết nối thì hệ thống sẽ làm gì?
**TRẢ LỜI:** Dạ, khi mất kết nối database, các truy vấn Hibernate sẽ sinh ra ngoại lệ `JDBCConnectionException`. Em đã viết bộ xử lý ngoại lệ tập trung (`Global Exception Handler`) bằng anotation `@ControllerAdvice` để bắt tất cả các lỗi này. Hệ thống sẽ ghi nhận chi tiết lỗi vào file log để lập trình viên kiểm tra, đồng thời trả về Client mã lỗi `HTTP 500` kèm thông báo thân thiện: "Hệ thống đang bảo trì dữ liệu, quý khách vui lòng thử lại sau" để trang web không bị sập hoàn toàn và giữ trải nghiệm người dùng tốt nhất ạ.

#### HỎI: Nếu API trả về dữ liệu sai thì bạn xử lý ra sao?
**TRẢ LỜI:** Dạ, đầu tiên em sẽ mở công cụ DevTools trên trình duyệt (tab Network) hoặc dùng Postman gọi trực tiếp vào API đó để xem dữ liệu JSON trả về có đúng định dạng và dữ liệu mong muốn không. Từ đó em sẽ khoanh vùng lỗi: nếu dữ liệu JSON từ API trả về đúng nhưng hiển thị sai thì lỗi ở Frontend React; còn nếu dữ liệu JSON trả về đã bị sai lệch thì em sẽ tiến hành debug lại mã nguồn trong lớp Service của Backend để tìm và sửa lỗi logic ạ.

#### HỎI: Nếu được làm lại từ đầu, bạn sẽ thay đổi điều gì?
**TRẢ LỜI:** Dạ, nếu được làm lại từ đầu, em sẽ thiết kế hệ thống theo mô hình **Clean Architecture** để các tầng nghiệp vụ độc lập hoàn toàn với framework, giúp dễ bảo trì và viết Unit Test hơn. Ngoài ra, em sẽ tích hợp cổng thanh toán trực tuyến thực tế (như VNPay hoặc MoMo) thay vì sử dụng cơ chế hiển thị mã QR chuyển khoản thủ công như hiện tại ạ.

#### HỎI: Chức năng nào khó thực hiện nhất? Vì sao?
**TRẢ LỜI:** Dạ thưa thầy/cô, đối với em chức năng khó nhất là **Tích hợp hội thoại động cho Trợ lý AI**. Khó khăn lớn nhất là làm thế nào để AI có thể hiểu được người dùng đang hỏi về sản phẩm hay khuyến mãi nào, và tự động gọi API lấy đúng thông tin từ database để ghép vào ngữ cảnh (Prompt Context) trước khi truyền sang Gemini API, nhằm tạo ra câu trả lời chứa link liên kết sản phẩm chính xác mà không làm trễ tốc độ phản hồi tin nhắn ạ.

#### HỎI: Trong quá trình thực hiện, bạn gặp những khó khăn gì?
**TRẢ LỜI:** Dạ, em gặp khó khăn lớn nhất ở việc cấu hình phân quyền và phân cấp **CORS** (Cross-Origin Resource Sharing - Chia sẻ tài nguyên nguồn chéo) trên **Spring Security 6** do phiên bản này đã loại bỏ hoàn toàn các cú pháp cũ của Spring Security 5 mà em từng học. Thêm vào đó, việc đồng bộ hóa dữ liệu giỏ hàng thời gian thực của người dùng trên nhiều tab trình duyệt khác nhau cũng khiến em mất khá nhiều thời gian xử lý bất đồng bộ ạ.

#### HỎI: Bạn học được gì từ dự án này?
**TRẢ LỜI:** Dạ thưa thầy/cô, qua đồ án thực tập này, em đã nâng cao rất nhiều tư duy thiết kế CSDL thực tế chuẩn 3NF, thành thạo lập trình các RESTful API bảo mật bằng Spring Boot và làm chủ việc thiết kế giao diện ứng dụng SPA mượt mà bằng ReactJS. Đặc biệt, em đã có cơ hội tìm hiểu sâu hơn về cách tích hợp và tối ưu ngữ cảnh (prompt engineering) để huấn luyện trợ lý AI hỗ trợ tự động phục vụ người dùng ạ.
