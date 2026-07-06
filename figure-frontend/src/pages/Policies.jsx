import React, { useState } from 'react';
import { FaShieldAlt, FaTruck, FaExchangeAlt, FaLock, FaUserSecret, FaFileContract, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import '../styles/Policies.css';

const Policies = () => {
    const [openSection, setOpenSection] = useState(null);

    const toggleSection = (section) => {
        setOpenSection(openSection === section ? null : section);
    };

    const policies = [
        {
            id: 'shipping',
            icon: <FaTruck />,
            title: 'Chính sách vận chuyển',
            content: (
                <div>
                    <h4>📦 Thời gian giao hàng</h4>
                    <ul>
                        <li><strong>Nội thành Hà Nội/TP.HCM:</strong> 1-2 ngày làm việc</li>
                        <li><strong>Các tỉnh thành khác:</strong> 3-5 ngày làm việc</li>
                        <li><strong>Khu vực vùng sâu vùng xa:</strong> 5-7 ngày làm việc</li>
                    </ul>
                    
                    <h4>💰 Phí vận chuyển</h4>
                    <ul>
                        <li>Đơn hàng dưới 500,000đ: 30,000đ</li>
                        <li>Đơn hàng từ 500,000đ - 1,000,000đ: 20,000đ</li>
                        <li>Đơn hàng trên 1,000,000đ: <strong>Miễn phí vận chuyển</strong></li>
                    </ul>
                    
                    <h4>📝 Quy trình giao hàng</h4>
                    <ul>
                        <li>Kiểm tra hàng trước khi nhận</li>
                        <li>Quay video mở hộp nếu có vấn đề</li>
                        <li>Liên hệ hotline ngay nếu phát hiện lỗi</li>
                    </ul>
                </div>
            )
        },
        {
            id: 'return',
            icon: <FaExchangeAlt />,
            title: 'Chính sách đổi trả',
            content: (
                <div>
                    <h4>✅ Điều kiện đổi trả</h4>
                    <ul>
                        <li>Sản phẩm bị lỗi từ nhà sản xuất</li>
                        <li>Sản phẩm không đúng mẫu mã, kích thước</li>
                        <li>Sản phẩm bị hư hỏng trong quá trình vận chuyển</li>
                        <li>Thời gian đổi trả trong vòng <strong>7 ngày</strong> kể từ ngày nhận hàng</li>
                    </ul>
                    
                    <h4>❌ Không áp dụng đổi trả</h4>
                    <ul>
                        <li>Sản phẩm đã qua sử dụng, trầy xước do người dùng</li>
                        <li>Sản phẩm không còn nguyên tem, hộp</li>
                        <li>Không thích, không hợp gu</li>
                        <li>Quá thời gian quy định</li>
                    </ul>
                    
                    <h4>📞 Quy trình đổi trả</h4>
                    <ul>
                        <li>Liên hệ hotline 1900 1234 để được hỗ trợ</li>
                        <li>Cung cấp video/ảnh sản phẩm lỗi</li>
                        <li>Gửi hàng về địa chỉ của Figure Store</li>
                        <li>Hoàn tiền hoặc đổi sản phẩm mới trong 3-5 ngày</li>
                    </ul>
                </div>
            )
        },
        {
            id: 'warranty',
            icon: <FaShieldAlt />,
            title: 'Chính sách bảo hành',
            content: (
                <div>
                    <h4>🛡️ Thời gian bảo hành</h4>
                    <ul>
                        <li><strong>Sản phẩm Figure:</strong> 3 tháng kể từ ngày mua</li>
                        <li><strong>Phụ kiện, hộp đựng:</strong> Không bảo hành</li>
                        <li><strong>Lỗi do nhà sản xuất:</strong> Bảo hành 6 tháng</li>
                    </ul>
                    
                    <h4>🔧 Các lỗi được bảo hành</h4>
                    <ul>
                        <li>Lỗi sơn, màu sắc không đúng</li>
                        <li>Chi tiết bị gãy, rời ra từ nhà máy</li>
                        <li>Thiếu phụ kiện so với mô tả</li>
                    </ul>
                    
                    <h4>⚠️ Không bảo hành</h4>
                    <ul>
                        <li>Hư hỏng do va đập, rơi vỡ</li>
                        <li>Sản phẩm bị ẩm mốc do bảo quản</li>
                        <li>Tự ý sửa chữa, thay đổi sản phẩm</li>
                    </ul>
                </div>
            )
        },
        {
            id: 'privacy',
            icon: <FaUserSecret />,
            title: 'Chính sách bảo mật',
            content: (
                <div>
                    <h4>🔒 Thu thập thông tin</h4>
                    <ul>
                        <li>Họ tên, số điện thoại, email, địa chỉ giao hàng</li>
                        <li>Lịch sử mua hàng, sản phẩm yêu thích</li>
                        <li>Thông tin thanh toán được mã hóa bảo mật</li>
                    </ul>
                    
                    <h4>🛡️ Cam kết bảo mật</h4>
                    <ul>
                        <li>Không chia sẻ thông tin khách hàng cho bên thứ 3</li>
                        <li>Sử dụng công nghệ SSL mã hóa dữ liệu</li>
                        <li>Chỉ sử dụng thông tin để phục vụ đơn hàng và chăm sóc khách hàng</li>
                    </ul>
                    
                    <h4>📧 Quyền của khách hàng</h4>
                    <ul>
                        <li>Yêu cầu xóa thông tin cá nhân</li>
                        <li>Từ chối nhận email quảng cáo</li>
                        <li>Kiểm tra và chỉnh sửa thông tin trong tài khoản</li>
                    </ul>
                </div>
            )
        },
        {
            id: 'payment',
            icon: <FaLock />,
            title: 'Chính sách thanh toán',
            content: (
                <div>
                    <h4>💳 Phương thức thanh toán</h4>
                    <ul>
                        <li><strong>Thanh toán khi nhận hàng (COD)</strong> - Miễn phí</li>
                        <li><strong>Chuyển khoản ngân hàng</strong> - Miễn phí</li>
                        <li><strong>Thanh toán qua ví Momo</strong> - Miễn phí</li>
                        <li><strong>Thanh toán qua thẻ tín dụng/ghi nợ</strong> - +2% phí</li>
                    </ul>
                    
                    <h4>🏦 Thông tin tài khoản</h4>
                    <ul>
                        <li><strong>Ngân hàng:</strong> Vietcombank</li>
                        <li><strong>Chủ tài khoản:</strong> FIGURE STORE COMPANY</li>
                        <li><strong>Số tài khoản:</strong> 1234567890</li>
                        <li><strong>Chi nhánh:</strong> Hà Nội</li>
                    </ul>
                    
                    <h4>📝 Lưu ý khi chuyển khoản</h4>
                    <ul>
                        <li>Ghi rõ nội dung: Mã đơn hàng + Họ tên</li>
                        <li>Liên hệ hotline sau khi chuyển khoản</li>
                        <li>Sẽ hoàn tiền nếu đơn hàng không thể giao</li>
                    </ul>
                </div>
            )
        },
        {
            id: 'terms',
            icon: <FaFileContract />,
            title: 'Điều khoản sử dụng',
            content: (
                <div>
                    <h4>📋 Quy định chung</h4>
                    <ul>
                        <li>Khách hàng phải đủ 18 tuổi để mua hàng</li>
                        <li>Thông tin cung cấp phải chính xác, trung thực</li>
                        <li>Không sử dụng tài khoản để thực hiện hành vi vi phạm pháp luật</li>
                    </ul>
                    
                    <h4>🛒 Đặt hàng và hủy đơn</h4>
                    <ul>
                        <li>Có thể hủy đơn trong vòng 1 giờ sau khi đặt</li>
                        <li>Sau 1 giờ, vui lòng liên hệ hotline để hỗ trợ</li>
                        <li>Figure Store có quyền từ chối đơn hàng nếu phát hiện gian lận</li>
                    </ul>
                    
                    <h4>⚖️ Giải quyết tranh chấp</h4>
                    <ul>
                        <li>Mọi tranh chấp sẽ được giải quyết trên tinh thần hợp tác</li>
                        <li>Trường hợp không thể thương lượng, sẽ giải quyết theo pháp luật Việt Nam</li>
                        <li>Khách hàng có thể khiếu nại qua email: support@figurestore.com</li>
                    </ul>
                </div>
            )
        }
    ];

    return (
        <div className="policies-container">
            <div className="policies-header">
                <h1>📜 Chính sách & Điều khoản</h1>
                <p>Figure Store cam kết mang đến trải nghiệm mua sắm tốt nhất cho khách hàng</p>
            </div>

            <div className="policies-content">
                {policies.map((policy) => (
                    <div key={policy.id} className="policy-section">
                        <div 
                            className={`policy-header ${openSection === policy.id ? 'active' : ''}`}
                            onClick={() => toggleSection(policy.id)}
                        >
                            <div className="policy-title">
                                <span className="policy-icon">{policy.icon}</span>
                                <h2>{policy.title}</h2>
                            </div>
                            <div className="policy-toggle">
                                {openSection === policy.id ? <FaChevronUp /> : <FaChevronDown />}
                            </div>
                        </div>
                        {openSection === policy.id && (
                            <div className="policy-content">
                                {policy.content}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="policies-footer">
                <p>
                    <strong>📅 Cập nhật lần cuối:</strong> 01/01/2024
                </p>
                <p>
                    Mọi thắc mắc vui lòng liên hệ hotline <strong>1900 1234</strong> hoặc email <strong>support@figurestore.com</strong>
                </p>
            </div>
        </div>
    );
};

export default Policies;