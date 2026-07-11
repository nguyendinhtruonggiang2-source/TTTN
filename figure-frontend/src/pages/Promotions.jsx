import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaTag, FaClock, FaGift, FaFire, FaTicketAlt, 
  FaShoppingCart, FaArrowRight, FaPercent, FaCalendarAlt,
  FaCopy, FaCheck, FaBell, FaTimes, FaAngleDown, FaAngleUp
} from 'react-icons/fa';
import axiosClient, { getImageUrl } from '../api/axiosClient';
import '../styles/Promotions.css';

const Promotions = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [promotions, setPromotions] = useState([]);
  const [flashSales, setFlashSales] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [expandedPromo, setExpandedPromo] = useState(null);
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    fetchPromotions();
    fetchFlashSales();
    fetchVouchers();
  }, []);

  // Timer cho flash sale
  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = {};
      flashSales.forEach(promo => {
        if (promo.endTime) {
          const end = new Date(promo.endTime).getTime();
          const now = new Date().getTime();
          const diff = end - now;
          
          if (diff > 0) {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (3600000)) / (1000 * 60));
            const seconds = Math.floor((diff % 60000) / 1000);
            newTimeLeft[promo.id] = { hours, minutes, seconds };
          } else {
            newTimeLeft[promo.id] = { hours: 0, minutes: 0, seconds: 0 };
          }
        }
      });
      setTimeLeft(newTimeLeft);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [flashSales]);

  const fetchPromotions = async () => {
    try {
      const response = await axiosClient.get('/promotions/active');
      setPromotions(response.data || []);
    } catch (error) {
      console.error('Error fetching promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFlashSales = async () => {
    try {
      const response = await axiosClient.get('/promotions/flash-sale');
      setFlashSales(response.data || []);
    } catch (error) {
      console.error('Error fetching flash sales:', error);
    }
  };

  const fetchVouchers = async () => {
    try {
      const response = await axiosClient.get('/promotions/vouchers');
      setVouchers(response.data || []);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setNotificationMessage(`Đã sao chép mã: ${code}`);
    setShowNotification(true);
    setTimeout(() => {
      setCopiedCode(null);
      setShowNotification(false);
    }, 2000);
  };

  const handleApplyVoucher = (code) => {
    // Lưu mã voucher vào localStorage để áp dụng khi thanh toán
    localStorage.setItem('appliedVoucher', code);
    setNotificationMessage(`Đã áp dụng mã: ${code}`);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
    
    // Chuyển đến trang giỏ hàng
    setTimeout(() => {
      navigate('/cart');
    }, 1500);
  };

  const toggleExpand = (id) => {
    setExpandedPromo(expandedPromo === id ? null : id);
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'flashsale': return <FaFire className="type-icon flash" />;
      case 'freeship': return <FaGift className="type-icon freeship" />;
      case 'bogo': return <FaTag className="type-icon bogo" />;
      default: return <FaPercent className="type-icon sale" />;
    }
  };

  const getTypeName = (type) => {
    switch(type) {
      case 'flashsale': return 'Flash Sale';
      case 'freeship': return 'Miễn phí vận chuyển';
      case 'bogo': return 'Mua 2 Tặng 1';
      default: return 'Giảm giá';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const getFilteredPromotions = () => {
    if (activeTab === 'all') return promotions;
    if (activeTab === 'flashsale') return flashSales;
    if (activeTab === 'voucher') return vouchers;
    return promotions.filter(p => p.type === activeTab);
  };

  const filteredPromotions = getFilteredPromotions();

  if (loading) {
    return (
      <div className="promotions-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải chương trình khuyến mãi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="promotions-container">
      {/* Notification */}
      {showNotification && (
        <div className="promotion-notification">
          <div className="notification-content">
            <FaCheck className="notification-icon" />
            <span>{notificationMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="promotions-header">
        <h1>Khuyến mãi & Ưu đãi</h1>
        <p>Những chương trình ưu đãi hấp dẫn chỉ có tại Figure Store</p>
      </div>

      {/* Tabs */}
      <div className="promotions-tabs">
        <button 
          className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          Tất cả
        </button>
        <button 
          className={`tab-btn ${activeTab === 'flashsale' ? 'active' : ''}`}
          onClick={() => setActiveTab('flashsale')}
        >
          <FaFire /> Flash Sale
        </button>
        <button 
          className={`tab-btn ${activeTab === 'voucher' ? 'active' : ''}`}
          onClick={() => setActiveTab('voucher')}
        >
          <FaTicketAlt /> Voucher
        </button>
        <button 
          className={`tab-btn ${activeTab === 'sale' ? 'active' : ''}`}
          onClick={() => setActiveTab('sale')}
        >
          <FaPercent /> Giảm giá
        </button>
        <button 
          className={`tab-btn ${activeTab === 'freeship' ? 'active' : ''}`}
          onClick={() => setActiveTab('freeship')}
        >
          <FaGift /> FreeShip
        </button>
      </div>

      {/* Flash Sale Banner */}
      {flashSales.length > 0 && activeTab === 'all' && (
        <div className="flash-sale-banner">
          <div className="flash-sale-content">
            <div className="flash-sale-icon">
              <FaFire />
              <span>FLASH SALE</span>
            </div>
            <div className="flash-sale-info">
              <h3>Siêu sale sốc - Giảm đến 50%</h3>
              <p>Nhanh tay săn ngay kẻo lỡ!</p>
            </div>
            <button className="flash-sale-btn" onClick={() => setActiveTab('flashsale')}>
              Xem ngay <FaArrowRight />
            </button>
          </div>
        </div>
      )}

      {/* Promotions Grid */}
      {filteredPromotions.length === 0 ? (
        <div className="no-promotions">
          <FaGift className="no-promotions-icon" />
          <h3>Chưa có chương trình khuyến mãi</h3>
          <p>Hiện tại chưa có chương trình khuyến mãi nào. Vui lòng quay lại sau!</p>
          <button onClick={() => navigate('/figures')} className="shop-now-btn">
            Mua sắm ngay
          </button>
        </div>
      ) : (
        <div className="promotions-grid">
          {filteredPromotions.map(promo => (
            <div key={promo.id} className={`promo-card ${promo.type === 'flashsale' ? 'flash-sale' : ''}`}>
              <div className="promo-image">
                {promo.image ? (
                  <img 
                    src={getImageUrl(promo.image)} 
                    alt={promo.title} 
                    onError={(e) => { e.target.src = '/default-promo.jpg'; }} 
                  />
                ) : (
                  <div className="promo-image-placeholder">
                    {getTypeIcon(promo.type)}
                    <span>{getTypeName(promo.type)}</span>
                  </div>
                )}
                {promo.type === 'flashsale' && (
                  <div className="flash-badge">
                    <FaFire /> FLASH SALE
                  </div>
                )}
                {promo.discount > 0 && (
                  <div className="discount-badge">
                    -{promo.discount}%
                  </div>
                )}
              </div>
              
              <div className="promo-content">
                <div className="promo-header">
                  {getTypeIcon(promo.type)}
                  <span className="promo-type">{getTypeName(promo.type)}</span>
                </div>
                
                <h3 className="promo-title">{promo.title}</h3>
                <p className="promo-description">{promo.description}</p>
                
                {promo.condition && (
                  <div className="promo-condition">
                    <FaTag /> {promo.condition}
                  </div>
                )}
                
                {promo.code && (
                  <div className="promo-code">
                    <span className="code-label">Mã:</span>
                    <span className="code-value">{promo.code}</span>
                    <button 
                      className={`copy-btn ${copiedCode === promo.code ? 'copied' : ''}`}
                      onClick={() => handleCopyCode(promo.code)}
                    >
                      {copiedCode === promo.code ? <FaCheck /> : <FaCopy />}
                      {copiedCode === promo.code ? 'Đã sao chép' : 'Sao chép'}
                    </button>
                  </div>
                )}
                
                {promo.type === 'flashsale' && timeLeft[promo.id] && (
                  <div className="flash-timer">
                    <FaClock />
                    <span className="timer-label">Kết thúc sau:</span>
                    <div className="timer">
                      <span>{String(timeLeft[promo.id]?.hours || 0).padStart(2, '0')}</span>:
                      <span>{String(timeLeft[promo.id]?.minutes || 0).padStart(2, '0')}</span>:
                      <span>{String(timeLeft[promo.id]?.seconds || 0).padStart(2, '0')}</span>
                    </div>
                  </div>
                )}
                
                <div className="promo-date">
                  <FaCalendarAlt />
                  {formatDate(promo.startDate)} - {formatDate(promo.endDate)}
                </div>
                
                <button 
                  className="promo-action-btn"
                  onClick={() => promo.code ? handleApplyVoucher(promo.code) : navigate('/figures')}
                >
                  {promo.code ? 'Áp dụng ngay' : 'Mua ngay'}
                  <FaArrowRight />
                </button>
                
                {promo.products && promo.products.length > 0 && (
                  <div className="promo-products">
                    <button 
                      className="toggle-products"
                      onClick={() => toggleExpand(promo.id)}
                    >
                      Sản phẩm áp dụng
                      {expandedPromo === promo.id ? <FaAngleUp /> : <FaAngleDown />}
                    </button>
                    {expandedPromo === promo.id && (
                      <div className="products-list">
                        {promo.products.map(product => (
                          <span key={product} className="product-tag">{product}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Newsletter */}
      <div className="promotions-newsletter">
        <div className="newsletter-content">
          <FaBell className="newsletter-icon" />
          <h3>Nhận thông báo khuyến mãi</h3>
          <p>Đăng ký để nhận những ưu đãi mới nhất qua email</p>
          <div className="newsletter-form">
            <input type="email" placeholder="Email của bạn" />
            <button>Đăng ký ngay</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Promotions;