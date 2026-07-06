import React, { useState } from 'react';
import { 
  FaShoppingCart, FaTruck, FaExchangeAlt, FaShieldAlt, 
  FaCreditCard, FaUser, FaBox, FaGift, FaChevronDown, 
  FaChevronUp, FaSearch, FaQuestionCircle 
} from 'react-icons/fa';
import '../styles/FAQ.css';

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openQuestions, setOpenQuestions] = useState({});

  const categories = [
    { id: 'all', name: 'Tất cả', icon: <FaQuestionCircle /> },
    { id: 'order', name: 'Đặt hàng', icon: <FaShoppingCart /> },
    { id: 'shipping', name: 'Vận chuyển', icon: <FaTruck /> },
    { id: 'return', name: 'Đổi trả', icon: <FaExchangeAlt /> },
    { id: 'payment', name: 'Thanh toán', icon: <FaCreditCard /> },
    { id: 'product', name: 'Sản phẩm', icon: <FaBox /> },
    { id: 'account', name: 'Tài khoản', icon: <FaUser /> },
    { id: 'promotion', name: 'Khuyến mãi', icon: <FaGift /> }
  ];

  const faqData = [
    // Đặt hàng
    {
      id: 1,
      category: 'order',
      question: 'Làm thế nào để đặt hàng trên Figure Store?',
      answer: 'Bạn có thể đặt hàng bằng cách:\n\n1. Truy cập website figurestore.com\n2. Tìm kiếm sản phẩm yêu thích\n3. Chọn sản phẩm và số lượng\n4. Thêm vào giỏ hàng\n5. Tiến hành thanh toán và điền thông tin giao hàng\n6. Xác nhận đơn hàng và chờ giao hàng'
    },
    {
      id: 2,
      category: 'order',
      question: 'Tôi có thể hủy đơn hàng không?',
      answer: 'Có, bạn có thể hủy đơn hàng trong vòng 1 giờ sau khi đặt. Sau thời gian này, vui lòng liên hệ hotline 1900 1234 để được hỗ trợ hủy đơn hàng.'
    },
    {
      id: 3,
      category: 'order',
      question: 'Làm sao để theo dõi đơn hàng?',
      answer: 'Sau khi đặt hàng thành công, bạn sẽ nhận được email xác nhận. Khi đơn hàng được giao, bạn sẽ nhận được mã vận đơn để theo dõi trên website của đơn vị vận chuyển. Bạn cũng có thể theo dõi trạng thái đơn hàng trong mục "Đơn hàng" sau khi đăng nhập.'
    },

    // Vận chuyển
    {
      id: 4,
      category: 'shipping',
      question: 'Thời gian giao hàng là bao lâu?',
      answer: 'Thời gian giao hàng:\n\n- Nội thành Hà Nội/TP.HCM: 1-2 ngày làm việc\n- Các tỉnh thành khác: 3-5 ngày làm việc\n- Khu vực vùng sâu vùng xa: 5-7 ngày làm việc'
    },
    {
      id: 5,
      category: 'shipping',
      question: 'Phí vận chuyển được tính như thế nào?',
      answer: 'Phí vận chuyển:\n\n- Đơn hàng dưới 500,000đ: 30,000đ\n- Đơn hàng từ 500,000đ - 1,000,000đ: 20,000đ\n- Đơn hàng trên 1,000,000đ: Miễn phí vận chuyển'
    },
    {
      id: 6,
      category: 'shipping',
      question: 'Có giao hàng quốc tế không?',
      answer: 'Hiện tại Figure Store chỉ giao hàng trong nội địa Việt Nam. Chúng tôi đang mở rộng dịch vụ và sẽ thông báo khi có thể giao hàng quốc tế.'
    },

    // Đổi trả
    {
      id: 7,
      category: 'return',
      question: 'Chính sách đổi trả như thế nào?',
      answer: 'Chính sách đổi trả:\n\n- Thời gian đổi trả: 7 ngày kể từ ngày nhận hàng\n- Điều kiện: Sản phẩm còn nguyên tem, hộp, chưa qua sử dụng\n- Lỗi do nhà sản xuất: Đổi mới 100%\n- Không thích sản phẩm: Đổi sang sản phẩm khác (chênh lệch thanh toán thêm)'
    },
    {
      id: 8,
      category: 'return',
      question: 'Quy trình đổi trả như thế nào?',
      answer: 'Quy trình đổi trả:\n\n1. Liên hệ hotline 1900 1234 để báo lỗi\n2. Cung cấp video/ảnh sản phẩm lỗi\n3. Đóng gói sản phẩm cẩn thận\n4. Gửi hàng về địa chỉ Figure Store\n5. Chúng tôi sẽ kiểm tra và xử lý trong 3-5 ngày'
    },

    // Thanh toán
    {
      id: 9,
      category: 'payment',
      question: 'Các phương thức thanh toán?',
      answer: 'Figure Store chấp nhận các phương thức thanh toán:\n\n- Thanh toán khi nhận hàng (COD)\n- Chuyển khoản ngân hàng\n- Thanh toán qua ví Momo\n- Thanh toán qua thẻ tín dụng/ghi nợ (thêm 2% phí)'
    },
    {
      id: 10,
      category: 'payment',
      question: 'Thanh toán online có an toàn không?',
      answer: 'Rất an toàn! Figure Store sử dụng công nghệ bảo mật SSL 256-bit, đảm bảo thông tin thanh toán của bạn được mã hóa và bảo vệ tuyệt đối. Chúng tôi không lưu trữ thông tin thẻ tín dụng của khách hàng.'
    },

    // Sản phẩm
    {
      id: 11,
      category: 'product',
      question: 'Sản phẩm có phải hàng chính hãng không?',
      answer: 'Có! Figure Store cam kết tất cả sản phẩm đều là hàng chính hãng 100%, có nguồn gốc xuất xứ rõ ràng từ các thương hiệu uy tín như Good Smile Company, Bandai, Kotobukiya, MegaHouse...'
    },
    {
      id: 12,
      category: 'product',
      question: 'Làm sao để biết sản phẩm còn hàng?',
      answer: 'Trên trang chi tiết sản phẩm, chúng tôi hiển thị rõ số lượng còn lại. Nếu sản phẩm hết hàng, nút "Thêm vào giỏ" sẽ bị vô hiệu hóa và hiển thị thông báo "Hết hàng".'
    },
    {
      id: 13,
      category: 'product',
      question: 'Có bảo hành sản phẩm không?',
      answer: 'Có! Chúng tôi bảo hành sản phẩm figure 3 tháng kể từ ngày mua đối với lỗi từ nhà sản xuất (lỗi sơn, gãy chi tiết, thiếu phụ kiện).'
    },

    // Tài khoản
    {
      id: 14,
      category: 'account',
      question: 'Làm thế nào để tạo tài khoản?',
      answer: 'Bạn có thể tạo tài khoản bằng cách:\n\n1. Nhấn vào nút "Đăng ký" trên thanh menu\n2. Điền thông tin: Họ tên, Email, Số điện thoại, Mật khẩu\n3. Xác nhận đăng ký qua email\n4. Đăng nhập và bắt đầu mua sắm'
    },
    {
      id: 15,
      category: 'account',
      question: 'Quên mật khẩu phải làm sao?',
      answer: 'Bạn có thể lấy lại mật khẩu bằng cách:\n\n1. Nhấn vào "Quên mật khẩu" trên trang đăng nhập\n2. Nhập email đã đăng ký\n3. Kiểm tra email để nhận link đặt lại mật khẩu\n4. Tạo mật khẩu mới và đăng nhập'
    },

    // Khuyến mãi
    {
      id: 16,
      category: 'promotion',
      question: 'Có chương trình khuyến mãi nào không?',
      answer: 'Figure Store thường xuyên có các chương trình khuyến mãi:\n\n- Giảm giá theo mùa, theo sự kiện\n- Flash sale hàng tuần\n- Mua 2 tặng 1 (sản phẩm chọn lọc)\n- Tích điểm đổi quà cho thành viên\n- Giảm 10% cho đơn hàng đầu tiên (mã: WELCOME10)'
    },
    {
      id: 17,
      category: 'promotion',
      question: 'Làm sao để nhận thông báo khuyến mãi?',
      answer: 'Để nhận thông báo khuyến mãi, bạn có thể:\n\n1. Đăng ký nhận email quảng cáo\n2. Theo dõi fanpage Figure Store\n3. Cài đặt thông báo trên website\n4. Tham gia group cộng đồng Figure Store'
    }
  ];

  // Lọc câu hỏi theo category và search term
  const filteredFaqs = faqData.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = searchTerm === '' || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleQuestion = (id) => {
    setOpenQuestions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
  };

  // Thống kê số lượng câu hỏi theo category
  const getCategoryCount = (categoryId) => {
    if (categoryId === 'all') return faqData.length;
    return faqData.filter(faq => faq.category === categoryId).length;
  };

  return (
    <div className="faq-container">
      {/* Header */}
      <div className="faq-header">
        <h1>❓ Câu hỏi thường gặp</h1>
        <p>Những câu hỏi và giải đáp thắc mắc của khách hàng</p>
      </div>

      {/* Search Bar */}
      <div className="faq-search">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm câu hỏi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="faq-categories">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(category.id)}
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-name">{category.name}</span>
            <span className="category-count">{getCategoryCount(category.id)}</span>
          </button>
        ))}
      </div>

      {/* Results Count */}
      <div className="faq-results">
        {searchTerm && (
          <p>Kết quả tìm kiếm cho: <strong>"{searchTerm}"</strong></p>
        )}
        <p>Tìm thấy <strong>{filteredFaqs.length}</strong> câu hỏi</p>
      </div>

      {/* FAQ List */}
      <div className="faq-list">
        {filteredFaqs.length === 0 ? (
          <div className="no-results">
            <FaQuestionCircle className="no-results-icon" />
            <h3>Không tìm thấy câu hỏi</h3>
            <p>Rất tiếc không tìm thấy câu hỏi nào phù hợp với tìm kiếm của bạn.</p>
            <button onClick={() => {
              setSearchTerm('');
              setActiveCategory('all');
            }}>Xóa bộ lọc</button>
          </div>
        ) : (
          filteredFaqs.map(faq => (
            <div key={faq.id} className="faq-item">
              <div 
                className={`faq-question ${openQuestions[faq.id] ? 'active' : ''}`}
                onClick={() => toggleQuestion(faq.id)}
              >
                <div className="question-content">
                  <span className="question-category">{getCategoryName(faq.category)}</span>
                  <h3>{faq.question}</h3>
                </div>
                <div className="question-toggle">
                  {openQuestions[faq.id] ? <FaChevronUp /> : <FaChevronDown />}
                </div>
              </div>
              {openQuestions[faq.id] && (
                <div className="faq-answer">
                  <div className="answer-content">
                    {faq.answer.split('\n').map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Contact Support */}
      <div className="faq-contact">
        <h3>💬 Chưa tìm thấy câu trả lời?</h3>
        <p>Liên hệ với chúng tôi để được hỗ trợ nhanh nhất</p>
        <div className="contact-buttons">
          <button onClick={() => window.location.href = '/contact'} className="contact-btn">
            📞 Liên hệ ngay
          </button>
          <button onClick={() => window.location.href = 'mailto:support@figurestore.com'} className="email-btn">
            ✉️ Gửi email
          </button>
        </div>
      </div>
    </div>
  );
};

export default FAQ;