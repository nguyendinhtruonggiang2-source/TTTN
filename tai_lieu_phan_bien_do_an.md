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

## PHẦN IV: BỘ CÂU HỎI PHẢN BIỆN VÀ ĐÁP ÁN TRẢ LỜI CHI TIẾT

Dưới đây là bộ câu hỏi thường gặp khi bảo vệ khóa luận / thực tập tốt nghiệp trước hội đồng và gợi ý trả lời cụ thể cho dự án Figure Store:

### 1. NHÓM CÂU HỎI TỔNG QUAN VỀ ĐỀ TÀI

#### HỎI: Đề tài của bạn giải quyết vấn đề gì?
**TRẢ LỜI:** Đề tài giải quyết vấn đề tối ưu hóa quy trình kinh doanh và nâng cao trải nghiệm mua sắm mô hình chính hãng trực tuyến. Dự án giải quyết các vấn đề cốt lõi như: Quản lý hàng tồn kho, quản lý khuyến mãi/Flash Sale, tự động hóa quy trình đặt hàng, và đặc biệt là giải quyết bài toán tư vấn trực tuyến 24/7 cho khách hàng thông qua Trợ lý ảo AI có khả năng đọc dữ liệu thực tế từ cơ sở dữ liệu.

#### HỎI: Lý do bạn chọn đề tài này là gì?
**TRẢ LỜI:** Thứ nhất, thị trường mô hình nhân vật (figure) tại Việt Nam đang phát triển mạnh mẽ và có tệp khách hàng rất đặc thù, yêu cầu thông tin chi tiết về tỷ lệ, hãng sản xuất. Thứ hai, các trang web thương mại điện tử hiện tại thường thiếu đi sự tư vấn trực quan theo thời gian thực về sản phẩm hoặc khuyến mãi. Em chọn đề tài này nhằm ứng dụng công nghệ Spring Boot và ReactJS kết hợp mô hình ngôn ngữ lớn để tạo ra một hệ thống thương mại điện tử hiện đại, mang tính tương tác cao.

#### HỎI: Mục tiêu chính của dự án là gì?
**TRẢ LỜI:** Xây dựng thành công một web app thương mại điện tử hoàn chỉnh, vận hành mượt mà, tải nhanh (SPA); thiết lập hệ thống trang quản trị (Admin Panel) trực quan để quản lý sản phẩm, đơn hàng, người dùng; và tích hợp chatbot AI thông minh trả lời dựa trên dữ liệu sản phẩm, coupon và flash sale thực tế.

#### HỎI: Đối tượng sử dụng hệ thống là ai?
**TRẢ LỜI:** 
1. **Khách hàng**: Người đam mê mô hình, cần tìm kiếm thông tin, so sánh sản phẩm, nhận tư vấn và đặt mua hàng nhanh chóng.
2. **Quản trị viên (Admin)**: Người quản lý cửa hàng, phụ trách duyệt đơn, quản lý kho hàng, tạo chiến dịch khuyến mãi/Flash Sale và theo dõi biểu đồ doanh thu.

#### HỎI: Điểm mới hoặc ưu điểm của dự án so với các hệ thống hiện có là gì?
**TRẢ LỜI:** Điểm mới lớn nhất là **Chatbot AI tích hợp dữ liệu động**. Thay vì chỉ trả lời các câu hỏi chung chung dựa trên kịch bản tĩnh, Chatbot AI của hệ thống sử dụng RAG (Retrieval-Augmented Generation) thu nhỏ để đọc dữ liệu sản phẩm, coupon giảm giá và Flash Sale đang chạy từ MySQL để tư vấn chính xác tên sản phẩm, đường dẫn link sản phẩm và các mã giảm giá có hiệu lực. Ngoài ra, giao diện của trang được thiết kế với độ thẩm mỹ cao, chuyển cảnh mượt mà và tối ưu trên di động.

#### HỎI: Dự án của bạn đã hoàn thành bao nhiêu phần trăm?
**TRẢ LỜI:** Dự án đã hoàn thành **100%** các chức năng cốt lõi theo đề cương thực tập/khóa luận, bao gồm toàn bộ luồng mua hàng, hệ thống thanh toán, quản lý admin, thông báo đẩy thời gian thực qua Websocket và tích hợp thành công Gemini API cho chatbot hỗ trợ khách hàng.

---

### 2. NHÓM CÂU HỎI VỀ CÔNG NGHỆ

#### HỎI: Vì sao bạn chọn ngôn ngữ lập trình và framework này?
**TRẢ LỜI:** 
- **Java / Spring Boot**: Java là ngôn ngữ hướng đối tượng mạnh mẽ, có tính an toàn cao, gõ tĩnh (statically typed) giúp giảm thiểu lỗi runtime. Spring Boot cung cấp hệ sinh thái phong phú, cơ chế Auto-Configuration giúp xây dựng RESTful API cực nhanh và Spring Security bảo mật bảo vệ ứng dụng hiệu quả.
- **ReactJS**: Sử dụng DOM ảo (Virtual DOM) giúp tăng tốc độ hiển thị giao diện, cơ chế chia nhỏ Component giúp tái sử dụng mã nguồn tốt, mang lại trải nghiệm ứng dụng mượt mà không bị tải lại trang (SPA).

#### HỎI: Tại sao chọn MySQL thay vì SQL Server hoặc MongoDB?
**TRẢ LỜI:** 
- Đối với website thương mại điện tử, các giao dịch tài chính, đặt hàng và số lượng tồn kho yêu cầu tính nhất quán dữ liệu rất cao (đảm bảo tính chất **ACID**). Do đó, CSDL quan hệ (RDBMS) là lựa chọn bắt buộc.
- **MySQL** là mã nguồn mở, miễn phí, hiệu năng cao, nhẹ và dễ triển khai hơn SQL Server (vốn tốn tài nguyên và mất phí bản quyền).
- **MongoDB** (NoSQL) không hỗ trợ tốt các mối quan hệ phức tạp và các giao dịch ràng buộc nhiều bảng (như Order - OrderItem - Product), dễ dẫn đến mất mát hoặc sai lệch dữ liệu kho hàng.

#### HỎI: Ưu điểm và nhược điểm của Spring Boot là gì?
**TRẢ LỜI:** 
- **Ưu điểm**: Khởi tạo dự án cực nhanh với Spring Initializr; nhúng sẵn máy chủ (Tomcat) nên chạy được ngay bằng tệp JAR; quản lý thư viện dễ dàng qua Maven; tích hợp Spring Data JPA giúp giảm thiểu viết mã SQL thủ công.
- **Nhược điểm**: Dung lượng tệp build lớn; khởi động ban đầu tốn thời gian hơn các framework nhẹ (như Node.js Express); chiếm dụng RAM lớn khi chạy.

#### HỎI: Tại sao sử dụng React cho phần frontend?
**TRẢ LỜI:** ReactJS giúp tách biệt hoàn toàn phần giao diện và dữ liệu (giao tiếp qua JSON API). Nhờ cơ chế **Single Page Application (SPA)**, người dùng chuyển trang ngay lập tức mà không bị chớp màn hình tải lại, đem lại cảm giác mượt mà như ứng dụng di động.

#### HỎI: Vì sao dự án được xây dựng theo kiến trúc Monolithic REST API thay vì Microservices?
**TRẢ LỜI:** Hệ thống được xây dựng theo kiến trúc **Monolithic REST API** vì:
1. Quy mô dự án phù hợp với mô hình Monolith, giúp tập trung phát triển nghiệp vụ nhanh chóng mà không bị quá tải bởi việc quản lý hạ tầng mạng.
2. Giảm thiểu độ trễ mạng phát sinh do giao tiếp giữa các service trong Microservices.
3. Việc quản lý Transaction (Giao dịch đặt hàng, trừ kho) trên một database duy nhất diễn ra an toàn và dễ dàng hơn nhiều so với việc phân tán Transaction (Saga Pattern) trên nhiều CSDL riêng lẻ.
*Lưu ý: Mặc dù là Monolithic, mã nguồn backend đã được phân chia rõ ràng theo các tầng (Layered Architecture) và các package nghiệp vụ độc lập, giúp dễ dàng chia tách thành Microservices khi quy mô hệ thống mở rộng trong tương lai.*

#### HỎI: Hãy giải thích cách hoạt động của OpenFeign, Kafka/RabbitMQ, Eureka Server, API Gateway (nếu hệ thống chuyển đổi lên Microservices)?
**TRẢ LỜI:** 
- **Eureka Server**: Là Service Registry đóng vai trò làm danh bạ, quản lý địa chỉ IP và cổng của tất cả các microservices đăng ký vào hệ thống.
- **API Gateway**: Là chốt chặn đầu tiên tiếp nhận mọi yêu cầu từ Client, thực hiện định tuyến (routing) đến các service tương ứng, đồng thời xử lý xác thực (Authentication) tập trung.
- **OpenFeign**: Là một thư viện declarative REST client trong Spring Cloud giúp các microservices gọi API của nhau một cách dễ dàng như gọi một hàm local.
- **Kafka / RabbitMQ**: Là các Message Broker (Hệ thống hàng đợi tin nhắn) giúp truyền thông tin bất đồng bộ giữa các microservices, giảm tải cho hệ thống và đảm bảo tính kết nối lỏng (loose coupling).
- **Docker**: Giúp đóng gói toàn bộ mã nguồn cùng môi trường chạy (OS, thư viện) vào một Container duy nhất, đảm bảo ứng dụng chạy đồng nhất từ máy lập trình cá nhân lên server deploy mà không gặp lỗi cấu hình.

---

### 3. NHÓM CÂU HỎI VỀ CƠ SỞ DỮ LIỆU

#### HỎI: Hệ thống của bạn có những bảng nào?
**TRẢ LỜI:** Hệ thống gồm các bảng chính:
- `users`: Lưu tài khoản khách hàng và admin.
- `roles` & `user_roles`: Phân quyền người dùng (ADMIN, USER).
- `figures`: Danh sách mô hình sản phẩm.
- `categories`: Danh mục sản phẩm.
- `orders` & `order_items`: Lưu thông tin đơn hàng và chi tiết các sản phẩm trong đơn.
- `promotions`: Lưu thông tin mã giảm giá, voucher.
- `flash_sales`: Quản lý các chiến dịch giảm giá giờ vàng.
- `chat_messages`: Lưu lịch sử hội thoại hỗ trợ của AI.
- `comments` & `reviews`: Bình luận tin tức và đánh giá sản phẩm.
- `branches`: Hệ thống các cửa hàng/chi nhánh.
- `banners`: Slide ảnh quảng cáo ngoài trang chủ.

#### HỎI: Mối quan hệ giữa các bảng được thiết kế như thế nào?
**TRẢ LỜI:** 
- Quan hệ **Một - Nhiều (1-n)**: Một danh mục (`Category`) có nhiều sản phẩm (`Figure`). Một đơn hàng (`Order`) chứa nhiều chi tiết sản phẩm (`OrderItem`). Một người dùng (`User`) có nhiều đơn hàng (`Order`).
- Quan hệ **Nhiều - Nhiều (n-n)**: Thiết lập giữa `User` và `Role` thông qua bảng trung gian `user_roles`.

#### HỎI: Tại sao bạn lại thiết kế cơ sở dữ liệu như vậy?
**TRẢ LỜI:** CSDL được thiết kế tuân thủ theo các dạng chuẩn hóa (chủ yếu là **3NF - Dạng chuẩn 3**). Việc này giúp:
1. Triệt tiêu tối đa việc dư thừa dữ liệu (tránh lặp lại thông tin địa chỉ khách hàng hay tên sản phẩm trong từng chi tiết đơn hàng).
2. Tránh các dị thường trong thao tác thêm, sửa, xóa dữ liệu (ví dụ: khi xóa một sản phẩm không làm ảnh hưởng đến lịch sử đơn hàng cũ nhờ việc lưu giá bán cố định tại bảng OrderItem).

#### HỎI: Khóa chính và khóa ngoại có vai trò gì?
**TRẢ LỜI:** 
- **Khóa chính (Primary Key)**: Định danh duy nhất cho một bản ghi trong bảng (ví dụ `id` của User hay Product), đảm bảo dữ liệu không bị trùng lặp.
- **Khóa ngoại (Foreign Key)**: Ràng buộc mối quan hệ giữa hai bảng (ví dụ: `category_id` trong bảng `figures` liên kết đến khóa chính `id` của bảng `categories`), giúp duy trì tính toàn vẹn dữ liệu, không cho phép tạo sản phẩm thuộc danh mục không tồn tại.

#### HỎI: Chuẩn hóa dữ liệu là gì?
**TRẢ LỜI:** Là quá trình phân tích và tổ chức lại cấu trúc dữ liệu trong CSDL nhằm loại bỏ sự dư thừa dữ liệu, ngăn ngừa các dị thường khi cập nhật và bảo vệ tính toàn vẹn của dữ liệu trong hệ thống.

#### HỎI: Nếu dữ liệu tăng lên hàng triệu bản ghi, bạn sẽ tối ưu như thế nào?
**TRẢ LỜI:** Em sẽ áp dụng các giải pháp sau:
1. **Database Indexing**: Đánh chỉ mục cho các cột thường xuyên dùng để tìm kiếm hoặc lọc (như tên sản phẩm, mã đơn hàng).
2. **Database Partitioning**: Phân vùng bảng (ví dụ chia nhỏ bảng đơn hàng theo năm hoặc tháng để tìm kiếm nhanh hơn).
3. **Caching**: Sử dụng Redis để lưu trữ các dữ liệu đọc nhiều nhưng ít thay đổi (danh mục, banner, sản phẩm nổi bật).
4. **Pagination**: Bắt buộc phân trang ở mọi API lấy danh sách.
5. **Read/Write Splitting**: Cấu hình mô hình Database Replication (Master-Slave) - Master chuyên xử lý ghi (Insert/Update/Delete), các Slave chuyên xử lý đọc (Select) để chia tải.

#### HỎI: Index trong cơ sở dữ liệu dùng để làm gì?
**TRẢ LỜI:** Index hoạt động tương tự như mục lục của một cuốn sách. Nó tạo ra một cấu trúc dữ liệu tìm kiếm nhanh (thường là cấu trúc cây B-Tree) giúp hệ quản trị CSDL nhanh chóng tìm thấy dòng dữ liệu cần thiết mà không phải quét toàn bộ bảng (Table Scan).

---

### 4. NHÓM CÂU HỎI VỀ CHỨC NĂNG

#### HỎI: Chức năng quan trọng nhất của hệ thống là gì?
**TRẢ LỜI:** Có hai chức năng quan trọng nhất:
1. **Quy trình đặt hàng thanh toán trực tuyến**: Đảm bảo trừ kho chính xác, tính toán tổng tiền chuẩn và chuyển đổi trạng thái đơn hàng mượt mà.
2. **Hệ thống tư vấn tự động bằng AI**: Chatbot tự nhận diện ngữ cảnh sản phẩm/khuyến mãi thực tế để hỗ trợ khách hàng ngay tức thì.

#### HỎI: Quy trình người dùng đặt hàng diễn ra như thế nào?
**TRẢ LỜI:** 
1. Khách hàng thêm sản phẩm vào giỏ hàng -> Hệ thống kiểm tra số lượng tồn kho.
2. Tại trang thanh toán, khách hàng nhập thông tin nhận hàng, chọn phương thức COD hoặc chuyển khoản qua QR code ngân hàng.
3. Người dùng áp dụng mã giảm giá (nếu có) -> Gọi API kiểm tra điều kiện của mã giảm giá.
4. Nhấn đặt hàng -> Backend lưu thông tin đơn hàng, trừ trực tiếp số lượng tồn kho của sản phẩm trong database, gửi thông báo đẩy thời gian thực về trang Admin thông qua WebSocket.

#### HỎI: Hệ thống xử lý lỗi khi người dùng nhập sai dữ liệu ra sao?
**TRẢ LỜI:** 
- Phía **Frontend**: Validate trực tiếp trên giao diện bằng Regex hoặc Javascript (kiểm tra độ dài mật khẩu, định dạng email, số điện thoại) và hiển thị thông báo đỏ cảnh báo người dùng trước khi gửi form.
- Phía **Backend**: Sử dụng thư viện validation (`@Valid`, `@NotNull`, `@Size`...) trong các DTO. Nếu dữ liệu không hợp lệ, Controller sẽ chặn lại và trả về mã lỗi `HTTP 400 (Bad Request)` kèm thông điệp lỗi chi tiết dưới dạng JSON để frontend hiển thị lên màn hình.

#### HỎI: Nếu một dịch vụ bị lỗi thì toàn bộ hệ thống có hoạt động được không?
**TRẢ LỜI:** Vì hệ thống hiện tại chạy theo kiến trúc Monolith nên nếu ứng dụng Spring Boot bị dừng (crash), toàn bộ website sẽ không thể tương tác với cơ sở dữ liệu. Tuy nhiên, hệ thống đã được triển khai bên trong môi trường Docker Container với cấu hình `restart: always`, giúp tự động khởi động lại dịch vụ ngay lập tức khi phát hiện ứng dụng bị sập.

#### HỎI: Hệ thống phân quyền người dùng như thế nào?
**TRẢ LỜI:** Hệ thống sử dụng cơ chế **Role-Based Access Control (RBAC)** thông qua Spring Security:
- Mỗi khi người dùng đăng nhập thành công, Server sẽ trả về JWT Token chứa danh sách các quyền của họ (ví dụ: `ROLE_USER`, `ROLE_ADMIN`).
- Ở **Backend**: Sử dụng `@PreAuthorize` trên các phương thức hoặc cấu hình trong SecurityConfig để chặn các API admin `/api/admin/**` chỉ cho phép `ROLE_ADMIN`.
- Ở **Frontend**: React sử dụng thuộc tính Route Guard (`AdminRoute`) để kiểm tra quyền và chặn không cho User thường truy cập giao diện quản trị.

#### HỎI: API nào được sử dụng nhiều nhất?
**TRẢ LỜI:** 
- `GET /api/figures` (API lấy danh sách mô hình sản phẩm, được gọi liên tục mỗi khi người dùng tìm kiếm, chuyển trang, hoặc lọc danh mục).
- `GET /api/auth/profile` (API đồng bộ trạng thái tài khoản mỗi khi người dùng chuyển trang).

---

### 5. NHÓM CÂU HỎI VỀ KIẾN TRÚC VÀ THUẬT TOÁN

#### HỎI: Hãy mô tả kiến trúc tổng thể của hệ thống.
**TRẢ LỜI:** Hệ thống được thiết kế theo mô hình **Client-Server** giao tiếp qua REST API.
- Ở **Backend**: Sử dụng kiến trúc phân tầng chuẩn (**Layered Architecture**):
  - **Controller Layer**: Tiếp nhận request, xử lý validate và ánh xạ dữ liệu.
  - **Service Layer**: Nơi xử lý toàn bộ logic nghiệp vụ (business logic) của hệ thống.
  - **Repository Layer (DAO)**: Giao tiếp trực tiếp với MySQL CSDL thông qua Spring Data JPA.
  - **Entity Layer**: Ánh xạ trực tiếp các bảng CSDL thành các đối tượng Java.

#### HỎI: Luồng dữ liệu từ frontend đến backend diễn ra như thế nào?
**TRẢ LỜI:** Người dùng thao tác trên giao diện React -> Kích hoạt gọi hàm Axios -> Gửi HTTP Request kèm Token JWT đến cổng Server -> Spring Security kiểm tra tính hợp lệ của Token -> Chuyển đến Controller tương ứng -> Gọi hàm Service để thực hiện nghiệp vụ -> Service gọi Repository truy vấn MySQL -> Dữ liệu trả ngược lại Service xử lý -> Trả về Client dưới định dạng JSON -> Giao diện React nhận kết quả và cập nhật hiển thị.

#### HỎI: JWT là gì và hoạt động ra sao?
**TRẢ LỜI:** **JWT (JSON Web Token)** là một chuỗi mã hóa gồm 3 phần ngăn cách bởi dấu chấm: `Header` (Thuật toán mã hóa), `Payload` (Thông tin người dùng cần truyền tải như username, roles) và `Signature` (Chữ ký để xác thực tính toàn vẹn).
- **Cách hoạt động**:
  1. Người dùng đăng nhập thành công.
  2. Server dùng Secret Key ký và tạo ra JWT gửi về Client.
  3. Client lưu JWT vào `localStorage` và tự động gắn vào Header `Authorization: Bearer <Token>` cho các request sau.
  4. Server dùng bộ lọc Interceptor giải mã Signature bằng Secret Key. Nếu khớp, Server công nhận request hợp lệ và cho phép truy cập tài nguyên.

#### HỎI: RESTful API là gì?
**TRẢ LỜI:** RESTful API là một tiêu chuẩn thiết kế API web sử dụng các phương thức HTTP tiêu chuẩn (GET, POST, PUT, DELETE) để thực hiện các thao tác CRUD trên tài nguyên (Resources). Tài nguyên được đại diện bằng các đường dẫn danh từ (ví dụ: `/api/figures`, `/api/orders`) thay vì động từ.

---

### 6. NHÓM CÂU HỎI TÌNH HUỐNG PHẢN BIỆN

#### HỎI: Nếu có 10.000 người dùng truy cập cùng lúc, hệ thống sẽ xử lý thế nào?
**TRẢ LỜI:** Để xử lý được tải lớn như vậy, em sẽ đề xuất các bước nâng cấp hệ thống:
1. Sử dụng **Nginx** làm Load Balancer để chia tải đến các cụm Docker chứa nhiều bản sao của Spring Boot Server.
2. Tối ưu hóa **HikariCP** (Database Connection Pool) trong Spring Boot để tăng khả năng xử lý truy vấn đồng thời.
3. Kích hoạt bộ nhớ đệm **Redis Cache** cho các dữ liệu trang chủ nhằm giảm tải tối đa số lần đọc trực tiếp từ MySQL.
4. Đưa các tác vụ nặng (như gửi email xác nhận đơn hàng) vào hàng đợi tin nhắn **RabbitMQ** để xử lý bất đồng bộ.

#### HỎI: Nếu cơ sở dữ liệu bị mất kết nối thì hệ thống sẽ làm gì?
**TRẢ LỜI:** Khi mất kết nối database, các truy vấn Hibernate sẽ sinh ra ngoại lệ `QueryTimeoutException` hoặc `JDBCConnectionException`. Hệ thống đã được cấu hình bộ xử lý ngoại lệ tập trung (`@ControllerAdvice` / Global Exception Handler) để bắt các lỗi này, ghi nhận thông tin lỗi chi tiết vào file log của hệ thống để quản trị viên kiểm tra, đồng thời trả về client mã lỗi `HTTP 500` kèm thông báo thân thiện: "Hệ thống đang bảo trì dịch vụ dữ liệu, quý khách vui lòng thử lại sau". Việc này giúp bảo vệ ứng dụng không bị sập hoàn toàn và giữ trải nghiệm người dùng tốt nhất có thể.

#### HỎI: Nếu API trả về dữ liệu sai thì bạn xử lý ra sao?
**TRẢ LỜI:** Em sẽ sử dụng công cụ **Postman** hoặc tab Network trên trình duyệt để gọi và phân tích dữ liệu JSON trả về từ API đó nhằm xác định lỗi ở Frontend hay Backend.
- Nếu lỗi ở Frontend: Kiểm tra lại các hàm parse dữ liệu hoặc các biến state trong React.
- Nếu lỗi ở Backend: Tiến hành debug trong lớp Service, kiểm tra câu lệnh truy vấn JPA hoặc viết thêm Unit Test để cô lập và xử lý triệt để logic sai.

#### HỎI: Nếu được làm lại từ đầu, bạn sẽ thay đổi điều gì?
**TRẢ LỜI:** Em sẽ thiết kế hệ thống theo cấu trúc **Clean Architecture** (Architecture củ hành) ngay từ đầu để tăng tính độc lập giữa các lớp nghiệp vụ và môi trường bên ngoài. Đồng thời, em sẽ cấu hình hệ thống thanh toán tự động qua cổng thanh toán VNPay hoặc MoMo thật thay vì chỉ hiển thị mã QR chuyển khoản tĩnh như hiện tại.

#### HỎI: Chức năng nào khó thực hiện nhất? Vì sao?
**TRẢ LỜI:** Chức năng khó nhất là **Tích hợp hội thoại động cho Trợ lý AI**. Khó khăn lớn nhất là làm thế nào để AI có thể hiểu được người dùng đang hỏi về sản phẩm hay khuyến mãi nào, và tự động gọi API lấy đúng thông tin từ database để ghép vào ngữ cảnh (Prompt Context) trước khi truyền sang Gemini API, nhằm tạo ra câu trả lời chứa link liên kết sản phẩm chính xác mà không làm trễ tốc độ phản hồi tin nhắn.

#### HỎI: Trong quá trình thực hiện, bạn gặp những khó khăn gì?
**TRẢ LỜI:** Khó khăn lớn nhất là việc cấu hình phân quyền trên **Spring Security 6** (vốn có cú pháp thay đổi rất nhiều so với phiên bản cũ) và việc xử lý lỗi bất đồng bộ khi đồng bộ dữ liệu giỏ hàng của tài khoản khách hàng giữa các tab trình duyệt khác nhau.

#### HỎI: Bạn học được gì từ dự án này?
**TRẢ LỜI:** Qua dự án này, em đã thành thạo kỹ năng phân tích thiết kế cơ sở dữ liệu chuẩn hóa, làm chủ quy trình xây dựng RESTful API chuyên nghiệp bằng Spring Boot kết hợp bảo mật JWT. Đồng thời, em tích lũy được nhiều kinh nghiệm xây dựng ứng dụng SPA mượt mà bằng ReactJS, biết cách tích hợp và tối ưu hóa prompt cho các mô hình AI thông minh thế hệ mới.
