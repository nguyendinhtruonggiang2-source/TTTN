import React from 'react';
import { FaStore, FaTruck, FaShieldAlt, FaMedal, FaUsers, FaHeart } from 'react-icons/fa';
import '../styles/About.css';

const About = () => {
    return (
        <div className="about-container">
            {/* Hero Section */}
            <div className="about-hero">
                <h1>Về Figure Store</h1>
                <p>Nơi đam mê figure gặp chất lượng hoàn hảo</p>
            </div>

            {/* Story Section */}
            <div className="about-section story-section">
                <div className="about-content">
                    <h2>Câu chuyện của chúng tôi</h2>
                    <p>
                        Figure Store được thành lập vào năm 2020 với sứ mệnh mang đến cho cộng đồng yêu thích 
                        mô hình anime và game những sản phẩm figure chính hãng chất lượng cao nhất.
                    </p>
                    <p>
                        Xuất phát từ niềm đam mê sưu tập figure, chúng tôi hiểu rằng mỗi bức tượng không chỉ 
                        là một món đồ chơi, mà còn là một tác phẩm nghệ thuật, là niềm tự hào của người sở hữu.
                    </p>
                    <p>
                        Với sự hợp tác từ các thương hiệu lớn như Good Smile Company, Bandai, Kotobukiya, 
                        chúng tôi tự hào mang đến những sản phẩm figure chính hãng với giá cả cạnh tranh nhất.
                    </p>
                </div>
                <div className="about-image">
                    <img src="/about-store.jpg" alt="Figure Store" />
                </div>
            </div>

            {/* Mission & Vision */}
            <div className="about-section mission-vision">
                <div className="mission-card">
                    <FaHeart className="mission-icon" />
                    <h3>Sứ mệnh</h3>
                    <p>Mang đến những sản phẩm figure chính hãng chất lượng cao, phục vụ niềm đam mê của cộng đồng người hâm mộ.</p>
                </div>
                <div className="vision-card">
                    <FaMedal className="vision-icon" />
                    <h3>Tầm nhìn</h3>
                    <p>Trở thành nhà phân phối figure hàng đầu Việt Nam, kết nối người yêu thích mô hình trên toàn quốc.</p>
                </div>
            </div>

            {/* Values Section */}
            <div className="about-section values-section">
                <h2>Giá trị cốt lõi</h2>
                <div className="values-grid">
                    <div className="value-card">
                        <FaStore className="value-icon" />
                        <h3>Chính hãng 100%</h3>
                        <p>Cam kết sản phẩm chính hãng, có nguồn gốc rõ ràng từ các thương hiệu uy tín.</p>
                    </div>
                    <div className="value-card">
                        <FaTruck className="value-icon" />
                        <h3>Giao hàng nhanh</h3>
                        <p>Giao hàng toàn quốc, đóng gói cẩn thận, đảm bảo sản phẩm nguyên vẹn.</p>
                    </div>
                    <div className="value-card">
                        <FaShieldAlt className="value-icon" />
                        <h3>Bảo hành uy tín</h3>
                        <p>Chính sách đổi trả linh hoạt, hỗ trợ khách hàng tận tình 24/7.</p>
                    </div>
                    <div className="value-card">
                        <FaUsers className="value-icon" />
                        <h3>Cộng đồng</h3>
                        <p>Xây dựng cộng đồng yêu figure, tổ chức sự kiện giao lưu định kỳ.</p>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="stats-section">
                <div className="stat-item">
                    <span className="stat-number">5000+</span>
                    <span className="stat-label">Sản phẩm đã bán</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">1000+</span>
                    <span className="stat-label">Khách hàng hài lòng</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">50+</span>
                    <span className="stat-label">Thương hiệu đối tác</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">3</span>
                    <span className="stat-label">Chi nhánh toàn quốc</span>
                </div>
            </div>

            {/* Team Section */}
            <div className="about-section team-section">
                <h2>Đội ngũ của chúng tôi</h2>
                <div className="team-grid">
                    <div className="team-card">
                        <img src="/team-1.jpg" alt="Team member" />
                        <h3>Nguyễn Văn A</h3>
                        <p>Founder & CEO</p>
                    </div>
                    <div className="team-card">
                        <img src="/team-2.jpg" alt="Team member" />
                        <h3>Trần Thị B</h3>
                        <p>Head of Operations</p>
                    </div>
                    <div className="team-card">
                        <img src="/team-3.jpg" alt="Team member" />
                        <h3>Lê Văn C</h3>
                        <p>Product Manager</p>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="cta-section">
                <h2>Bạn đã sẵn sàng khám phá?</h2>
                <p>Tham gia cộng đồng Figure Store ngay hôm nay</p>
                <div className="cta-buttons">
                    <button onClick={() => window.location.href = '/figures'}>Mua sắm ngay</button>
                    <button onClick={() => window.location.href = '/branches'}>Tìm chi nhánh</button>
                </div>
            </div>
        </div>
    );
};

export default About;