// src/pages/FlashSale.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaShoppingCart, FaEye, FaBolt, FaClock, FaSpinner, 
  FaFire, FaBell, FaCheckCircle, FaAngleRight
} from 'react-icons/fa';
import axiosClient, { getImageUrl } from '../api/axiosClient';
import '../styles/FlashSale.css';

const parseDate = (dateString) => {
  if (!dateString) return null;
  if (typeof dateString === 'string' && !dateString.endsWith('Z') && !dateString.includes('+') && dateString.includes('T')) {
    return new Date(dateString + 'Z');
  }
  return new Date(dateString);
};

const FlashSale = () => {
  const navigate = useNavigate();
  const [flashSales, setFlashSales] = useState([]);
  const [upcomingSales, setUpcomingSales] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [activeTab, setActiveTab] = useState('flashsale');
  const [copiedId, setCopiedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState({});
  const [timeLeft, setTimeLeft] = useState({});
  const [notified, setNotified] = useState({});

  useEffect(() => {
    fetchFlashSales();
    fetchUpcomingSales();
    fetchActivePromotions();
  }, []);

  const fetchActivePromotions = async () => {
    try {
      const response = await axiosClient.get('/promotions/active');
      setPromotions(response.data || []);
    } catch (err) {
      console.error('Error fetching active promotions:', err);
    }
  };

  const handleCopyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Cập nhật đồng hồ đếm ngược mỗi giây
  useEffect(() => {
    const interval = setInterval(() => {
      updateTimeLeft();
    }, 1000);
    return () => clearInterval(interval);
  }, [flashSales, upcomingSales]);

  const fetchFlashSales = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/flash-sale/active');
      console.log('Flash sales response:', response.data);
      setFlashSales(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching flash sales:', err);
      setError('Không thể tải danh sách flash sale');
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingSales = async () => {
    try {
      const response = await axiosClient.get('/flash-sale/upcoming');
      setUpcomingSales(response.data || []);
    } catch (err) {
      console.error('Error fetching upcoming sales:', err);
    }
  };

  const updateTimeLeft = () => {
    const newTimeLeft = {};
    const now = new Date().getTime();
    
    flashSales.forEach(sale => {
      if (sale.status === 'ACTIVE') {
        const end = parseDate(sale.endTime).getTime();
        const diff = end - now;
        
        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          newTimeLeft[sale.id] = { hours, minutes, seconds, isEnded: false };
        } else {
          newTimeLeft[sale.id] = { hours: 0, minutes: 0, seconds: 0, isEnded: true };
        }
      }
    });
    
    upcomingSales.forEach(sale => {
      if (sale.status === 'UPCOMING') {
        const start = parseDate(sale.startTime).getTime();
        const diff = start - now;
        
        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          newTimeLeft[sale.id] = { days, hours, minutes, isUpcoming: true };
        }
      }
    });
    
    setTimeLeft(newTimeLeft);
  };

  const handleAddToCart = async (sale) => {
    if (addingToCart[sale.id]) return;
    
    setAddingToCart(prev => ({ ...prev, [sale.id]: true }));
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Vui lòng đăng nhập để thêm vào giỏ hàng');
        navigate('/login', { state: { from: '/flash-sale' } });
        return;
      }
      
      const response = await axiosClient.post('/cart/add', {
        figureId: sale.figure.id,
        quantity: 1
      });
      
      if (response.data.success) {
        alert(`✅ Đã thêm "${sale.figure.name}" vào giỏ hàng!`);
      } else {
        alert(response.data.message || '❌ Không thể thêm vào giỏ hàng');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      if (err.response?.status === 401) {
        alert('Vui lòng đăng nhập để thêm vào giỏ hàng');
        navigate('/login', { state: { from: '/flash-sale' } });
      } else {
        alert('❌ Không thể thêm vào giỏ hàng');
      }
    } finally {
      setAddingToCart(prev => ({ ...prev, [sale.id]: false }));
    }
  };

  const handleBuyNow = (sale) => {
    if (sale.remainingQuantity <= 0) {
      alert('❌ Sản phẩm đã hết hàng');
      return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Vui lòng đăng nhập để mua hàng');
      navigate('/login', { state: { from: '/flash-sale' } });
      return;
    }
    
    const checkoutItem = {
      figureId: sale.figure.id,
      name: sale.figure.name,
      price: sale.salePrice,
      originalPrice: sale.figure.originalPrice,
      quantity: 1,
      image: sale.figure.image,
      series: sale.figure.series,
      fromBuyNow: true,
      isFlashSale: true,
      discountPercent: sale.discountPercent
    };
    
    sessionStorage.setItem('buyNowItem', JSON.stringify(checkoutItem));
    navigate('/checkout');
  };

  const handleNotify = (sale) => {
    setNotified(prev => ({ ...prev, [sale.id]: true }));
    setTimeout(() => {
      setNotified(prev => ({ ...prev, [sale.id]: false }));
    }, 3000);
    // Có thể gọi API lưu thông báo ở đây
  };



  const formatPrice = (price) => {
    if (!price) return '0₫';
    return price.toLocaleString() + '₫';
  };

  const getProgressPercent = (sale) => {
    const percent = (sale.soldQuantity / sale.quantityLimit) * 100;
    return Math.min(percent, 100);
  };

  if (loading) {
    return (
      <div className="flash-sale-container">
        <div className="loading-spinner">
          <FaSpinner className="spinner" />
          <p>Đang tải chương trình flash sale...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flash-sale-container">
      {/* Header */}
      <div className="flash-sale-header">
        <h1>
          <FaFire className="header-icon" />
          Flash Sale
        </h1>
        <p>Siêu giảm giá sốc - Số lượng có hạn</p>
      </div>

      {/* Tabs */}
      <div className="discount-tabs">
        <button 
          className={`tab-btn ${activeTab === 'flashsale' ? 'active' : ''}`}
          onClick={() => setActiveTab('flashsale')}
        >
          <FaBolt /> Flash Sale
        </button>
        <button 
          className={`tab-btn ${activeTab === 'voucher' ? 'active' : ''}`}
          onClick={() => setActiveTab('voucher')}
        >
          🎟️ Voucher & Coupon
        </button>
        <button 
          className={`tab-btn ${activeTab === 'freeship' ? 'active' : ''}`}
          onClick={() => setActiveTab('freeship')}
        >
          🚚 Miễn Phí Vận Chuyển
        </button>
        <button 
          className={`tab-btn ${activeTab === 'sale' ? 'active' : ''}`}
          onClick={() => setActiveTab('sale')}
        >
          🏷️ Ưu Đãi Khác
        </button>
      </div>

      {activeTab === 'flashsale' && (
        <>
          {/* Flash Sale đang diễn ra */}
          {flashSales.length > 0 ? (
            <div className="flash-sale-section">
              <div className="section-header">
                <h2>
                  <FaBolt className="section-icon" />
                  Đang diễn ra
                </h2>
                <Link to="/figures" className="view-all">
                  Xem tất cả <FaAngleRight />
                </Link>
              </div>
              
              <div className="flash-sale-grid">
                {flashSales.map(sale => {
                  const time = timeLeft[sale.id] || { hours: 0, minutes: 0, seconds: 0 };
                  const progress = getProgressPercent(sale);
                  const remaining = sale.quantityLimit - sale.soldQuantity;
                  
                  return (
                    <div key={sale.id} className="flash-sale-card">
                      <div className="card-image">
                        <img 
                          src={getImageUrl(sale.figure.image)} 
                          alt={sale.figure.name}
                          onError={(e) => e.target.src = '/default-figure.jpg'}
                        />
                        <div className="discount-badge">-{sale.discountPercent}%</div>
                        <div className="flash-badge">
                          <FaBolt /> FLASH SALE
                        </div>
                      </div>
                      
                      <div className="card-content">
                        <Link to={`/product/${sale.figure.id}`} className="product-title">
                          <h3>{sale.figure.name}</h3>
                        </Link>
                        
                        <div className="product-price">
                          <span className="original-price">
                            {formatPrice(sale.figure.originalPrice)}
                          </span>
                          <span className="flash-price">
                            {formatPrice(sale.salePrice)}
                          </span>
                        </div>
                        
                        <div className="countdown-timer">
                          <FaClock className="timer-icon" />
                          <span>Kết thúc sau: </span>
                          <div className="timer">
                            <span className="time-unit">{String(time.hours).padStart(2, '0')}</span>:
                            <span className="time-unit">{String(time.minutes).padStart(2, '0')}</span>:
                            <span className="time-unit">{String(time.seconds).padStart(2, '0')}</span>
                          </div>
                        </div>
                        
                        <div className="progress-section">
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                          </div>
                          <div className="progress-info">
                            <span className="sold-info">Đã bán {sale.soldQuantity}</span>
                            <span className="remaining-info">Còn {remaining}</span>
                          </div>
                        </div>
                        
                        <div className="card-actions">
                          <button 
                            className="buy-now-btn"
                            onClick={() => handleBuyNow(sale)}
                            disabled={remaining <= 0}
                          >
                            <FaBolt /> Mua ngay
                          </button>
                          <button 
                            className="add-to-cart-btn"
                            onClick={() => handleAddToCart(sale)}
                            disabled={remaining <= 0 || addingToCart[sale.id]}
                          >
                            {addingToCart[sale.id] ? (
                              <FaSpinner className="spinner-small" />
                            ) : (
                              <FaShoppingCart />
                            )}
                            Thêm giỏ
                          </button>
                          <Link to={`/product/${sale.figure.id}`} className="view-detail-btn" title="Xem chi tiết">
                            <FaEye />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="no-flash-sale">
              <FaFire className="no-sale-icon" />
              <h3>Hiện không có chương trình flash sale</h3>
              <p>Hãy quay lại sau để không bỏ lỡ ưu đãi nhé!</p>
              <Link to="/figures" className="shop-now-btn">
                <FaShoppingCart /> Mua sắm ngay
              </Link>
            </div>
          )}

          {/* Flash Sale sắp diễn ra */}
          {upcomingSales.length > 0 && (
            <div className="upcoming-section">
              <div className="section-header">
                <h2>
                  <FaClock className="section-icon" />
                  Sắp diễn ra
                </h2>
              </div>
              
              <div className="upcoming-grid">
                {upcomingSales.map(sale => {
                  const time = timeLeft[sale.id] || { days: 0, hours: 0, minutes: 0 };
                  
                  return (
                    <div key={sale.id} className="upcoming-card">
                      <div className="card-image">
                        <img 
                          src={getImageUrl(sale.figure.image)} 
                          alt={sale.figure.name}
                          onError={(e) => e.target.src = '/default-figure.jpg'}
                        />
                        <div className="discount-badge">-{sale.discountPercent}%</div>
                      </div>
                      <div className="card-content">
                        <h4>{sale.figure.name}</h4>
                        <div className="product-price">
                          <span className="original-price">{formatPrice(sale.figure.originalPrice)}</span>
                          <span className="flash-price">{formatPrice(sale.salePrice)}</span>
                        </div>
                        <div className="countdown-timer upcoming">
                          <FaClock className="timer-icon" />
                          <span>Bắt đầu sau: </span>
                          <div className="timer">
                            {time.days > 0 && (
                              <><span className="time-unit">{time.days}</span>d </>
                            )}
                            <span className="time-unit">{String(time.hours).padStart(2, '0')}</span>:
                            <span className="time-unit">{String(time.minutes).padStart(2, '0')}</span>
                          </div>
                        </div>
                        <div className="notify-btn">
                          {notified[sale.id] ? (
                            <button className="notified" disabled>
                              <FaCheckCircle /> Đã nhắc
                            </button>
                          ) : (
                            <button onClick={() => handleNotify(sale)}>
                              <FaBell /> Nhắc tôi
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'voucher' && (
        <div className="flash-sale-section">
          <div className="section-header">
            <h2>🎟️ Mã Giảm Giá / Voucher Coupon</h2>
          </div>
          <div className="vouchers-grid">
            {promotions.filter(p => p.type === 'voucher').length === 0 ? (
              <div className="no-promo-data">
                <p>Hiện tại chưa có mã voucher nào khả dụng.</p>
              </div>
            ) : (
              promotions.filter(p => p.type === 'voucher').map(promo => (
                <div key={promo.id} className="coupon-ticket">
                  <div className="coupon-left">
                    <div className="discount-value">{promo.discount}%</div>
                    <div className="discount-label">GIẢM GIÁ</div>
                  </div>
                  <div className="coupon-right">
                    <div>
                      <div className="coupon-title">{promo.title}</div>
                      {promo.description && <div className="coupon-desc">{promo.description}</div>}
                      <div className="coupon-condition">
                        {promo.minOrderAmount > 0 ? `Đơn tối thiểu ${promo.minOrderAmount.toLocaleString()}đ` : 'Không giới hạn đơn tối thiểu'}
                      </div>
                    </div>
                    <div>
                      <div className="coupon-date">
                        Hạn dùng: {formatDate(promo.endDate)}
                      </div>
                      <div className="coupon-action-row">
                        <span className="coupon-code">{promo.code}</span>
                        <button 
                          className={`copy-code-btn ${copiedId === promo.id ? 'copied' : ''}`}
                          onClick={() => handleCopyCode(promo.code, promo.id)}
                        >
                          {copiedId === promo.id ? 'Đã lưu' : 'Sao chép'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'freeship' && (
        <div className="flash-sale-section">
          <div className="section-header">
            <h2>🚚 Miễn Phí Vận Chuyển</h2>
          </div>
          <div className="vouchers-grid">
            {promotions.filter(p => p.type === 'freeship').length === 0 ? (
              <div className="no-promo-data">
                <p>Hiện tại chưa có chương trình miễn phí vận chuyển nào.</p>
              </div>
            ) : (
              promotions.filter(p => p.type === 'freeship').map(promo => (
                <div key={promo.id} className="coupon-ticket freeship-ticket">
                  <div className="coupon-left">
                    <div className="discount-value">FREE</div>
                    <div className="discount-label">SHIPPING</div>
                  </div>
                  <div className="coupon-right">
                    <div>
                      <div className="coupon-title">{promo.title}</div>
                      {promo.description && <div className="coupon-desc">{promo.description}</div>}
                      <div className="coupon-condition">
                        {promo.minOrderAmount > 0 ? `Đơn tối thiểu ${promo.minOrderAmount.toLocaleString()}đ` : 'Không giới hạn đơn tối thiểu'}
                      </div>
                    </div>
                    <div>
                      <div className="coupon-date">
                        Hạn dùng: {formatDate(promo.endDate)}
                      </div>
                      <div className="coupon-action-row">
                        <span className="coupon-code">{promo.code}</span>
                        <button 
                          className={`copy-code-btn ${copiedId === promo.id ? 'copied' : ''}`}
                          onClick={() => handleCopyCode(promo.code, promo.id)}
                        >
                          {copiedId === promo.id ? 'Đã lưu' : 'Sao chép'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'sale' && (
        <div className="flash-sale-section">
          <div className="section-header">
            <h2>🏷️ Ưu Đãi Đặc Biệt</h2>
          </div>
          <div className="sales-grid">
            {promotions.filter(p => p.type === 'sale').length === 0 ? (
              <div className="no-promo-data">
                <p>Hiện tại chưa có chương trình ưu đãi đặc biệt nào.</p>
              </div>
            ) : (
              promotions.filter(p => p.type === 'sale').map(promo => (
                <div key={promo.id} className="sale-promo-card">
                  <div className="promo-card-left">
                    <span className="promo-badge-tag">SALES</span>
                    <div className="promo-discount-num">{promo.discount}% OFF</div>
                  </div>
                  <div className="promo-card-right">
                    <div>
                      <h3>{promo.title}</h3>
                      <p>{promo.description}</p>
                    </div>
                    <div>
                      <div className="promo-meta-info">
                        <span>⏳ Hạn dùng: {formatDate(promo.startDate)} - {formatDate(promo.endDate)}</span>
                        {promo.code && (
                          <div className="promo-code-box">
                            Mã: <code>{promo.code}</code>
                            <button 
                              className="copy-mini-btn"
                              onClick={() => handleCopyCode(promo.code, promo.id)}
                            >
                              {copiedId === promo.id ? 'Đã chép' : 'Chép'}
                            </button>
                          </div>
                        )}
                      </div>
                      <Link to="/figures" className="go-shop-link">
                        Mua sắm ngay ➔
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Banner quảng cáo */}
      <div className="flash-sale-banner">
        <div className="banner-content">
          <h3>🔥 Flash Sale mỗi ngày</h3>
          <p>Đừng bỏ lỡ cơ hội sở hữu figure yêu thích với giá tốt nhất</p>
          <Link to="/figures" className="banner-btn">
            Khám phá ngay <FaAngleRight />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FlashSale;