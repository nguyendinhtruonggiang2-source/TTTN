// src/pages/FlashSale.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaShoppingCart, FaEye, FaBolt, FaClock, FaSpinner, 
  FaFire, FaBell, FaCheckCircle, FaAngleRight
} from 'react-icons/fa';
import axiosClient from '../api/axiosClient';
import '../styles/FlashSale.css';

const FlashSale = () => {
  const navigate = useNavigate();
  const [flashSales, setFlashSales] = useState([]);
  const [upcomingSales, setUpcomingSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState({});
  const [timeLeft, setTimeLeft] = useState({});
  const [notified, setNotified] = useState({});

  useEffect(() => {
    fetchFlashSales();
    fetchUpcomingSales();
  }, []);

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
        const end = new Date(sale.endTime).getTime();
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
        const start = new Date(sale.startTime).getTime();
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

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/default-figure.jpg';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    if (imagePath.startsWith('/uploads/')) {
      return `http://localhost:8080${imagePath}`;
    }
    return imagePath;
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
                    
                    {sale.figure.series && (
                      <p className="product-series">📺 {sale.figure.series}</p>
                    )}
                    
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