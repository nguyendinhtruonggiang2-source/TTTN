package com.example.figure.service;

import com.example.figure.entity.Figure;
import com.example.figure.entity.Order;
import com.example.figure.entity.User;
import com.example.figure.repository.FigureRepository;
import com.example.figure.repository.OrderRepository;
import com.example.figure.repository.UserRepository;
import com.example.figure.repository.PromotionRepository;
import com.example.figure.repository.FlashSaleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.DecimalFormat;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AiChatService {

    private final FigureRepository figureRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final PromotionRepository promotionRepository;
    private final FlashSaleRepository flashSaleRepository;

    private static final DecimalFormat CURRENCY_FORMAT = new DecimalFormat("#,###₫");
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    public String generateReply(String message, String username) {
        if (message == null || message.trim().isEmpty()) {
            return "Xin chào! Bạn cần tôi giúp gì hôm nay?";
        }

        String msgLower = message.toLowerCase().trim();
        User user = null;
        if (username != null && !username.trim().isEmpty() && !username.equals("anonymousUser")) {
            user = userRepository.findByUsername(username)
                    .orElseGet(() -> userRepository.findByEmail(username).orElse(null));
        }

        // 1. Chào hỏi
        if (msgLower.matches(".*(chào|hello|hi|helo|xin chào|chao).*")) {
            String welcome = "Xin chào" + (user != null ? " **" + (user.getName() != null ? user.getName() : user.getUsername()) + "**" : "") + "! 👋 Tôi là Trợ lý AI của cửa hàng Figure.\n\n" +
                    "Tôi có thể hỗ trợ bạn các nội dung sau:\n" +
                    "- 🔍 **Tìm kiếm & Gợi ý sản phẩm**: Thử hỏi *\"Gợi ý figure Genshin\"*, *\"Tìm mô hình Gundam\"*...\n" +
                    "- 📦 **Tra cứu đơn hàng**: Hỏi *\"Kiểm tra đơn hàng của tôi\"* hoặc nhập trực tiếp mã đơn (ví dụ: *`DH-171987`*).\n" +
                    "- 🚚 **Chính sách**: Hỏi về *\"Chính sách vận chuyển\"*, *\"Địa chỉ cửa hàng\"*, *\"Chính sách đổi trả\"*...\n\n" +
                    "Bạn cần tôi hỗ trợ thông tin gì hôm nay?";
            return welcome;
        }

        // 2. Tra cứu đơn hàng dựa trên mã đơn hàng gửi kèm trong tin nhắn (Regex khớp DH-xxxxxx hoặc DHxxxxxx)
        Pattern orderPattern = Pattern.compile("dh[-_]?\\d+", Pattern.CASE_INSENSITIVE);
        Matcher matcher = orderPattern.matcher(msgLower);
        if (matcher.find()) {
            String foundCode = matcher.group().toUpperCase();
            // Thử tìm kiếm trực tiếp hoặc thay thế ký tự gạch ngang
            Optional<Order> orderOpt = orderRepository.findByOrderCode(foundCode);
            if (!orderOpt.isPresent()) {
                // Thử tìm các biến thể mã đơn
                String normalizedCode = foundCode.replace("-", "").replace("_", "");
                orderOpt = orderRepository.findAll().stream()
                        .filter(o -> o.getOrderCode().replace("-", "").replace("_", "").equalsIgnoreCase(normalizedCode))
                        .findFirst();
            }

            if (orderOpt.isPresent()) {
                Order order = orderOpt.get();
                // Nếu có tài khoản đăng nhập, kiểm tra tính sở hữu đơn hàng (Admin được xem tất cả, User chỉ xem của mình)
                if (user != null && !user.getUsername().equals("admin") && !order.getUser().getId().equals(user.getId())) {
                    return "Mã đơn hàng **" + order.getOrderCode() + "** không thuộc về tài khoản của bạn. Vui lòng đăng nhập đúng tài khoản để tra cứu chi tiết nhé!";
                }
                
                return "📦 **Thông tin đơn hàng " + order.getOrderCode() + ":**\n\n" +
                        "- **Ngày đặt:** " + (order.getCreatedAt() != null ? order.getCreatedAt().format(DATE_FORMAT) : "N/A") + "\n" +
                        "- **Trạng thái:** " + getStatusText(order.getStatus()) + "\n" +
                        "- **Tổng thanh toán:** `" + CURRENCY_FORMAT.format(order.getTotalAmount()) + "`\n" +
                        "- **Người nhận:** " + order.getShippingName() + " (" + order.getShippingPhone() + ")\n" +
                        "- **Địa chỉ:** " + order.getShippingAddress() + "\n" +
                        "- **Hình thức:** " + order.getPaymentMethod() + "\n\n" +
                        "👉 Bạn có thể [Bấm vào đây để xem chi tiết đơn hàng](/orders/" + order.getId() + ").";
            } else {
                return "❌ Tôi không tìm thấy đơn hàng nào có mã **" + foundCode + "** trên hệ thống. Bạn vui lòng kiểm tra lại mã đơn hàng chính xác nhé!";
            }
        }

        // 3. Tra cứu đơn hàng của tôi (Yêu cầu đăng nhập)
        if (msgLower.contains("đơn hàng") || msgLower.contains("order") || msgLower.contains("trạng thái đơn") || msgLower.contains("kiểm tra đơn")) {
            if (user == null) {
                return "🔑 Bạn vui lòng đăng nhập tài khoản của mình trên hệ thống để tra cứu danh sách đơn hàng gần đây nhé!\n\n" +
                        "Hoặc nếu bạn mua hàng không cần tài khoản, hãy nhập mã đơn hàng (ví dụ: *`DH-171987`*) để tôi tra cứu nhanh giúp bạn.";
            }

            List<Order> orders = orderRepository.findByUserOrderByCreatedAtDesc(user);
            if (orders.isEmpty()) {
                return "📦 Tôi kiểm tra thấy tài khoản của bạn hiện tại chưa có đơn hàng nào được đặt.\n\n" +
                        "Hãy ghé thăm danh mục sản phẩm của chúng tôi để mua sắm ngay nhé! 👉 [Xem sản phẩm](/figures)";
            }

            StringBuilder sb = new StringBuilder();
            sb.append("📦 **Danh sách đơn hàng gần đây của bạn:**\n\n");
            int limit = Math.min(orders.size(), 3);
            for (int i = 0; i < limit; i++) {
                Order o = orders.get(i);
                sb.append(String.format("- **%s** (%s) - Tổng: `%s` | Trạng thái: %s -> [Xem chi tiết](/orders/%d)\n",
                        o.getOrderCode(),
                        o.getCreatedAt() != null ? o.getCreatedAt().format(DATE_FORMAT) : "N/A",
                        CURRENCY_FORMAT.format(o.getTotalAmount()),
                        getStatusText(o.getStatus()),
                        o.getId()
                ));
            }
            if (orders.size() > 3) {
                sb.append(String.format("\n*(Bạn còn %d đơn hàng khác nữa)*", orders.size() - 3));
            }
            return sb.toString();
        }

        // 4. Chính sách vận chuyển
        if (msgLower.contains("vận chuyển") || msgLower.contains("ship") || msgLower.contains("giao hàng") || msgLower.contains("phí ship")) {
            return "🚚 **Chính sách vận chuyển và giao nhận hàng:**\n\n" +
                    "- **Phí vận chuyển:**\n" +
                    "  - 🆓 **MIỄN PHÍ SHIP** toàn quốc cho đơn hàng trị giá từ **1.000.000₫** trở lên.\n" +
                    "  - Đơn hàng dưới 1.000.000₫ áp dụng phí vận chuyển đồng giá **30.000₫**.\n" +
                    "- **Thời gian giao hàng:**\n" +
                    "  - *Nội thành Hà Nội:* Giao hỏa tốc nhận hàng trong ngày hoặc tối đa 24 giờ.\n" +
                    "  - *Các tỉnh/thành khác:* Thời gian giao hàng dao động từ 2 - 4 ngày làm việc.";
        }

        // 5. Chính sách đổi trả
        if (msgLower.contains("đổi trả") || msgLower.contains("hoàn tiền") || msgLower.contains("trả hàng") || msgLower.contains("lỗi") || msgLower.contains("hỏng")) {
            return "🔄 **Chính sách đổi trả & hoàn tiền sản phẩm:**\n\n" +
                    "- **Điều kiện áp dụng:** Hỗ trợ đổi trả miễn phí **trong vòng 3 ngày** kể từ khi nhận hàng thành công.\n" +
                    "- **Các trường hợp hỗ trợ:** Sản phẩm bị bể, gãy, lỗi sơn lớn từ nhà sản xuất, hỏng hóc do vận chuyển, hoặc gửi sai mẫu sản phẩm.\n" +
                    "- **Yêu cầu:** Sản phẩm gửi trả phải còn nguyên hộp (box), chưa bóc seal/nylon bảo vệ và đầy đủ phụ kiện đi kèm. Quý khách vui lòng cung cấp video khui hàng để được xử lý nhanh nhất.";
        }

        // 6. Địa chỉ cửa hàng
        if (msgLower.contains("địa chỉ") || msgLower.contains("cửa hàng") || msgLower.contains("ở đâu") || msgLower.contains("showroom") || msgLower.contains("shop ở đâu")) {
            return "🏠 **Thông tin showroom Figure Store:**\n\n" +
                    "- **Địa chỉ:** Số 123 Nguyễn Trãi, quận Thanh Xuân, Hà Nội.\n" +
                    "- **Giờ hoạt động:** Từ 9:00 sáng đến 10:00 tối hàng ngày (làm việc tất cả các ngày trong tuần, kể cả Thứ Bảy, Chủ Nhật và ngày lễ).\n" +
                    "- **Hotline hỗ trợ:** `0987.654.321`\n" +
                    "- **Email:** `support@figurestore.vn`\n\n" +
                    "Rất hân hạnh được đón tiếp bạn ghé thăm showroom của chúng tôi để ngắm nhìn trực tiếp các mẫu figure siêu chất lượng! 🎯";
        }

        // 6.1. Khuyến mãi & Giảm giá
        if (msgLower.contains("khuyến mãi") || msgLower.contains("mã giảm giá") || msgLower.contains("voucher") || msgLower.contains("coupon") || msgLower.contains("giảm giá") || msgLower.contains("ưu đãi")) {
            List<com.example.figure.entity.FlashSale> activeFlashSales = flashSaleRepository.findByIsActiveTrueAndStartTimeBeforeAndEndTimeAfter(java.time.LocalDateTime.now(), java.time.LocalDateTime.now());
            List<com.example.figure.entity.Promotion> activePromotions = promotionRepository.findByIsActiveTrueOrderByDisplayOrderAsc();

            StringBuilder sb = new StringBuilder();
            sb.append("🎁 **Chương trình khuyến mãi & Ưu đãi đang diễn ra tại cửa hàng:**\n\n");
            
            // A. Flash sales
            if (!activeFlashSales.isEmpty()) {
                sb.append("⚡ **FLASH SALE ĐANG DIỄN RA:**\n");
                for (com.example.figure.entity.FlashSale fs : activeFlashSales) {
                    sb.append(String.format("- **[%s](/product/%d)**: Giảm ngay **-%d%%** còn `%s` *(Chỉ còn %d sản phẩm)*\n",
                            fs.getFigure().getName(),
                            fs.getFigure().getId(),
                            fs.getDiscountPercent(),
                            CURRENCY_FORMAT.format(fs.getSalePrice()),
                            fs.getQuantityLimit() - fs.getSoldQuantity()
                    ));
                }
                sb.append("👉 [Săn ngay Flash Sale tại đây](/flash-sale)\n\n");
            } else {
                sb.append("⚡ Hiện tại không có sản phẩm Flash Sale nào đang diễn ra, bạn có thể xem các mã giảm giá bên dưới nha!\n\n");
            }
            
            // B. Vouchers & Coupons
            List<com.example.figure.entity.Promotion> vouchers = activePromotions.stream()
                    .filter(p -> "voucher".equalsIgnoreCase(p.getType()))
                    .collect(Collectors.toList());
            if (!vouchers.isEmpty()) {
                sb.append("🎫 **MÃ GIẢM GIÁ / VOUCHER COUPON:**\n");
                for (com.example.figure.entity.Promotion p : vouchers) {
                    String minOrderStr = p.getMinOrderAmount() != null && p.getMinOrderAmount() > 0 
                            ? "cho đơn từ " + CURRENCY_FORMAT.format(p.getMinOrderAmount()) 
                            : "không giới hạn đơn tối thiểu";
                    sb.append(String.format("- Mã **`%s`**: Giảm **-%s%%** %s. *(Hạn dùng: %s)*\n",
                            p.getCode(),
                            p.getDiscount() != null ? String.valueOf(p.getDiscount().intValue()) : "10",
                            minOrderStr,
                            p.getEndDate() != null ? p.getEndDate().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")) : "N/A"
                    ));
                }
                sb.append("\n");
            }
            
            // C. Freeship & Others
            List<com.example.figure.entity.Promotion> otherPromos = activePromotions.stream()
                    .filter(p -> !"voucher".equalsIgnoreCase(p.getType()))
                    .collect(Collectors.toList());
            if (!otherPromos.isEmpty()) {
                sb.append("🚚 **ƯU ĐÃI & CHƯƠNG TRÌNH KHÁC:**\n");
                for (com.example.figure.entity.Promotion p : otherPromos) {
                    sb.append(String.format("- **%s**: %s\n",
                            p.getTitle(),
                            p.getDescription() != null ? p.getDescription() : "Giảm giá đặc biệt"
                    ));
                }
            }
            
            return sb.toString();
        }

        // 6.2. Hướng dẫn & Phương thức thanh toán
        if (msgLower.contains("thanh toán") || msgLower.contains("chuyển khoản") || msgLower.contains("vnpay") || msgLower.contains("cod") || msgLower.contains("banking")) {
            return "💳 **Các phương thức thanh toán tại Figure Store:**\n\n" +
                    "- 💵 **COD (Thanh toán khi giao hàng):** Cho phép quý khách kiểm tra bên ngoài vỏ hộp sản phẩm trước khi thanh toán tiền mặt cho shipper.\n" +
                    "- 🏦 **Chuyển khoản Ngân hàng (Internet Banking):** Chuyển khoản trực tiếp vào số tài khoản chính thức của shop.\n" +
                    "- 💳 **Cổng thanh toán điện tử VNPAY:** Hỗ trợ giao dịch nhanh chóng và bảo mật cao thông qua ứng dụng Mobile Banking của các ngân hàng hoặc Ví điện tử quét mã QR.";
        }

        // 6.3. Cam kết chất lượng chính hãng
        if (msgLower.contains("chính hãng") || msgLower.contains("real") || msgLower.contains("auth") || msgLower.contains("fake") || msgLower.contains("nhái") || msgLower.contains("chất lượng")) {
            return "🛡️ **Cam kết chất lượng và xuất xứ của Figure Store:**\n\n" +
                    "- 💯 **100% Hàng Authentic:** Shop cam kết chỉ phân phối các dòng mô hình chính hãng nhập khẩu từ Nhật Bản (Good Smile Company, Alter, Kotobukiya, Bandai, Sega, FuRyu...).\n" +
                    "- ❌ **Nói không với hàng FAKE:** Cam kết đền bù gấp **200%** giá trị đơn hàng nếu quý khách phát hiện hàng giả, hàng nhái, hàng kém chất lượng.\n" +
                    "- 📦 **Tình trạng sản phẩm:** Tất cả các mô hình gửi đi đều mới 100% nguyên seal nguyên box từ nhà sản xuất, được đóng gói chống sốc 3 lớp cực kỳ kỹ càng.";
        }

        // 7. Gợi ý / Tìm kiếm sản phẩm (Nếu chứa từ khóa liên quan đến mua sắm, tìm kiếm)
        boolean isQueryingProducts = msgLower.contains("figure") || msgLower.contains("mô hình") || 
                                     msgLower.contains("sản phẩm") || msgLower.contains("tìm") || 
                                     msgLower.contains("gợi ý") || msgLower.contains("mua") || 
                                     msgLower.contains("bán") || msgLower.contains("giá");

        if (isQueryingProducts || msgLower.length() >= 2) {
            // Lọc ra các từ khóa tìm kiếm sạch (bỏ bớt từ thừa)
            String searchKeyword = cleanKeyword(message);
            List<Figure> figures = figureRepository.searchAllFields(searchKeyword);

            if (!figures.isEmpty()) {
                StringBuilder sb = new StringBuilder();
                sb.append("🔍 **Kết quả tìm kiếm sản phẩm phù hợp cho bạn:**\n\n");
                int limit = Math.min(figures.size(), 5);
                for (int i = 0; i < limit; i++) {
                    Figure f = figures.get(i);
                    String priceStr = f.getPrice() > 0 ? CURRENCY_FORMAT.format(f.getPrice()) : "Liên hệ";
                    sb.append(String.format("%d. **[%s](/product/%d)**\n", i + 1, f.getName(), f.getId()));
                    sb.append(String.format("   - Giá: `%s` %s\n", priceStr, f.getDiscount() > 0 ? "*(Giảm -" + f.getDiscount() + "%)*" : ""));
                    if (f.getSeries() != null) {
                        sb.append(String.format("   - Series: *%s*\n", f.getSeries()));
                    }
                    if (f.getManufacturer() != null) {
                        sb.append(String.format("   - Hãng sản xuất: %s\n", f.getManufacturer()));
                    }
                }
                if (figures.size() > 5) {
                    sb.append(String.format("\n*(Tìm thấy tất cả %d sản phẩm phù hợp. Bạn có thể gõ từ khóa cụ thể hơn để lọc)*", figures.size()));
                }
                return sb.toString();
            } else if (isQueryingProducts) {
                return "🔍 Hiện tại tôi chưa tìm thấy sản phẩm nào trên hệ thống khớp với từ khóa **\"" + searchKeyword + "\"**.\n\n" +
                        "Bạn thử tìm kiếm với các từ khóa ngắn gọn hơn như: *'Genshin'*, *'Gundam'*, *'One Piece'*, *'Luffy'*... xem sao nhé!";
            }
        }

        // 8. Trả lời mặc định
        return "🤖 Cảm ơn bạn đã tương tác! Tôi là trợ lý AI tự động của shop.\n\n" +
                "Tôi có thể hỗ trợ bạn tìm sản phẩm, xem chính sách giao hàng, hoặc tra cứu đơn hàng nhanh.\n\n" +
                "Hãy thử hỏi tôi những câu như:\n" +
                "- *\"Tìm mô hình Genshin Impact\"*\n" +
                "- *\"Chính sách đổi trả hàng như thế nào?\"*\n" +
                "- *\"Showroom shop ở đâu?\"*\n" +
                "- *\"Kiểm tra trạng thái đơn hàng của tôi\"*\n\n" +
                "Hoặc nếu cần gặp nhân viên tư vấn trực tiếp, bạn vui lòng liên hệ hotline **0987.654.321** nhé!";
    }

    private String getStatusText(String status) {
        if (status == null) return "N/A";
        switch (status.toUpperCase()) {
            case "PENDING": return "⏳ Chờ xác nhận";
            case "PROCESSING": return "⚙️ Đang xử lý";
            case "SHIPPED": return "🚚 Đang giao hàng";
            case "DELIVERED": return "✅ Đã giao hàng thành công";
            case "CANCELLED": return "❌ Đã hủy";
            default: return status;
        }
    }

    private String cleanKeyword(String message) {
        String keyword = message.toLowerCase()
                .replaceAll("gợi ý", "")
                .replaceAll("tìm kiếm", "")
                .replaceAll("tìm", "")
                .replaceAll("mua", "")
                .replaceAll("figure", "")
                .replaceAll("mô hình", "")
                .replaceAll("sản phẩm", "")
                .replaceAll("cho tôi", "")
                .replaceAll("với", "")
                .replaceAll("giúp", "")
                .replaceAll("có", "")
                .replaceAll("nào", "")
                .trim();
        
        if (keyword.isEmpty()) {
            return message.trim();
        }
        return keyword;
    }
}
