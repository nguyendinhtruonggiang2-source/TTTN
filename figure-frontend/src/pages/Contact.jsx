import React, { useState } from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaFacebook, FaInstagram, FaYoutube, FaTwitter, FaPaperPlane } from 'react-icons/fa';
import '../styles/Contact.css';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        
        // Simulate API call
        setTimeout(() => {
            console.log('Form submitted:', formData);
            setSubmitting(false);
            setSubmitted(true);
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
            setTimeout(() => setSubmitted(false), 5000);
        }, 1500);
    };

    return (
        <div className="contact-container">
            <div className="contact-header">
                <h1>📞 Liên hệ với chúng tôi</h1>
                <p>Chúng tôi luôn sẵn sàng hỗ trợ bạn 24/7</p>
            </div>

            <div className="contact-content">
                {/* Contact Info Cards */}
                <div className="contact-info-grid">
                    <div className="info-card">
                        <div className="info-icon">
                            <FaMapMarkerAlt />
                        </div>
                        <h3>Địa chỉ</h3>
                        <p>123 Đường Láng, Đống Đa, Hà Nội</p>
                        <p>456 Nguyễn Huệ, Quận 1, TP.HCM</p>
                    </div>
                    
                    <div className="info-card">
                        <div className="info-icon">
                            <FaPhone />
                        </div>
                        <h3>Hotline</h3>
                        <p>📞 1900 1234</p>
                        <p>📞 024 1234 5678</p>
                        <p className="small">8:00 - 21:00 (Thứ 2 - Chủ nhật)</p>
                    </div>
                    
                    <div className="info-card">
                        <div className="info-icon">
                            <FaEnvelope />
                        </div>
                        <h3>Email</h3>
                        <p>info@figurestore.com</p>
                        <p>support@figurestore.com</p>
                        <p>sales@figurestore.com</p>
                    </div>
                    
                    <div className="info-card">
                        <div className="info-icon">
                            <FaClock />
                        </div>
                        <h3>Giờ làm việc</h3>
                        <p>Thứ 2 - Thứ 6: 8:00 - 21:00</p>
                        <p>Thứ 7 - Chủ nhật: 9:00 - 20:00</p>
                    </div>
                </div>

                {/* Contact Form & Map */}
                <div className="contact-form-section">
                    <div className="form-container">
                        <h2>Gửi tin nhắn cho chúng tôi</h2>
                        {submitted && (
                            <div className="success-message">
                                ✅ Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất.
                            </div>
                        )}
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Họ và tên *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        placeholder="Nhập họ tên của bạn"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="example@email.com"
                                    />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Số điện thoại</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="0123456789"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Chủ đề *</label>
                                    <input
                                        type="text"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        placeholder="Vấn đề bạn muốn hỏi"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Nội dung *</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    rows="5"
                                    placeholder="Nhập nội dung chi tiết..."
                                />
                            </div>
                            <button type="submit" className="submit-btn" disabled={submitting}>
                                {submitting ? (
                                    <>Đang gửi...</>
                                ) : (
                                    <>Gửi tin nhắn <FaPaperPlane /></>
                                )}
                            </button>
                        </form>
                    </div>
                    
                    <div className="map-container">
                        <h2>📍 Bản đồ</h2>
                        <div className="map-placeholder">
                            <iframe 
                                title="Google Maps"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1x3724.978693390325!2x105.804817!3x21.028511!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab3f7c0a6d6b%3A0x3e9a1d8a7c8f9e2d!2zVHLGsOG7nW5nIMSQ4bqhaSBI4buNYyBDw7RuZyBuZ2jhu4cgVGjDtG5nIHRpbg!5e0!3m2!1svi!2s!4v1700000000000!5m2!1svi!2s"
                                width="100%"
                                height="400"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                            />
                        </div>
                    </div>
                </div>

                {/* Social Links */}
                <div className="social-section">
                    <h2>📱 Kết nối với chúng tôi</h2>
                    <div className="social-links">
                        <a href="#" className="social-link facebook"><FaFacebook /> Facebook</a>
                        <a href="#" className="social-link instagram"><FaInstagram /> Instagram</a>
                        <a href="#" className="social-link youtube"><FaYoutube /> YouTube</a>
                        <a href="#" className="social-link twitter"><FaTwitter /> Twitter</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;