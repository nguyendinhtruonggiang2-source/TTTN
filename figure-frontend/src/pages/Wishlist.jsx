// src/pages/Wishlist.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaHeart, FaTrash, FaShoppingCart, FaEye, 
  FaSpinner, FaRegHeart, FaStar, FaFire, FaArrowLeft
} from 'react-icons/fa';
import axiosClient, { getImageUrl } from '../api/axiosClient';
import '../styles/Wishlist.css';

const Wishlist = () => {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState({});
  const [removing, setRemoving] = useState({});

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const response = await axiosClient.get('/wishlist');
      console.log('Wishlist response:', response.data);
      setWishlist(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      if (err.response?.status === 401) {
        navigate('/login', { state: { from: '/wishlist' } });
      } else {
        setError('Không thể tải danh sách yêu thích');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (figureId, figureName) => {
    setAddingToCart(prev => ({ ...prev, [figureId]: true }));
    
    try {
      const response = await axiosClient.post('/cart/add', {
        figureId: figureId,
        quantity: 1
      });
      
      if (response.data.success) {
        alert(`✅ Đã thêm "${figureName}" vào giỏ hàng!`);
      } else {
        alert(response.data.message || '❌ Không thể thêm vào giỏ hàng');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      if (err.response?.status === 401) {
        alert('Vui lòng đăng nhập để thêm vào giỏ hàng');
        navigate('/login', { state: { from: '/wishlist' } });
      } else {
        alert('❌ Không thể thêm vào giỏ hàng');
      }
    } finally {
      setAddingToCart(prev => ({ ...prev, [figureId]: false }));
    }
  };

  const handleRemoveFromWishlist = async (figureId, figureName) => {
    if (!window.confirm(`Bạn có chắc muốn xóa "${figureName}" khỏi danh sách yêu thích?`)) {
      return;
    }
    
    setRemoving(prev => ({ ...prev, [figureId]: true }));
    
    try {
      await axiosClient.delete(`/wishlist/remove/${figureId}`);
      setWishlist(prev => prev.filter(item => item.figure.id !== figureId));
      alert(`✅ Đã xóa "${figureName}" khỏi danh sách yêu thích`);
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      alert('❌ Không thể xóa khỏi danh sách yêu thích');
    } finally {
      setRemoving(prev => ({ ...prev, [figureId]: false }));
    }
  };

  const handleBuyNow = (figure) => {
    const checkoutItem = {
      figureId: figure.id,
      name: figure.name,
      price: figure.price,
      originalPrice: figure.originalPrice || figure.price,
      quantity: 1,
      image: figure.image,
      series: figure.series,
      fromBuyNow: true
    };
    
    sessionStorage.setItem('buyNowItem', JSON.stringify(checkoutItem));
    navigate('/checkout');
  };



  const formatPrice = (price) => {
    if (!price) return '0₫';
    return price.toLocaleString() + '₫';
  };

  if (loading) {
    return (
      <div className="wishlist-container">
        <div className="loading-spinner">
          <FaSpinner className="spinner" />
          <p>Đang tải danh sách yêu thích...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-container">
      <div className="wishlist-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <FaArrowLeft /> Quay lại
          </button>
          <h1>
            <FaHeart className="header-icon" />
            Sản phẩm yêu thích
          </h1>
        </div>
        <p className="wishlist-subtitle">
          {wishlist.length} sản phẩm trong danh sách yêu thích của bạn
        </p>
      </div>

      {error ? (
        <div className="error-message">
          <p>⚠️ {error}</p>
          <button onClick={fetchWishlist} className="retry-btn">Thử lại</button>
        </div>
      ) : wishlist.length === 0 ? (
        <div className="empty-wishlist">
          <FaRegHeart className="empty-icon" />
          <h3>Danh sách yêu thích trống</h3>
          <p>Hãy thêm những sản phẩm bạn yêu thích vào đây nhé!</p>
          <Link to="/figures" className="shop-now-btn">
            <FaShoppingCart /> Mua sắm ngay
          </Link>
        </div>
      ) : (
        <>
          <div className="wishlist-grid">
            {wishlist.map((item) => (
              <div key={item.id} className="wishlist-card">
                <div className="card-image">
                  <img 
                    src={getImageUrl(item.figure.image || item.figure.imageUrl)} 
                    alt={item.figure.name}
                    onError={(e) => e.target.src = '/default-figure.jpg'}
                  />
                  {item.figure.discount > 0 && (
                    <div className="discount-badge">-{item.figure.discount}%</div>
                  )}
                  {item.figure.isNew && (
                    <div className="new-badge">Mới</div>
                  )}
                </div>
                
                <div className="card-content">
                  <Link to={`/product/${item.figure.id}`} className="product-title">
                    <h3>{item.figure.name}</h3>
                  </Link>
                  

                  
                  <div className="product-price">
                    {item.figure.discount > 0 ? (
                      <>
                        <span className="original-price">
                          {formatPrice(item.figure.originalPrice)}
                        </span>
                        <span className="current-price">
                          {formatPrice(item.figure.price)}
                        </span>
                      </>
                    ) : (
                      <span className="current-price">
                        {formatPrice(item.figure.price)}
                      </span>
                    )}
                  </div>
                  
                  <div className="product-stock">
                    {item.figure.quantity > 0 ? (
                      <span className="in-stock">✓ Còn {item.figure.quantity} sản phẩm</span>
                    ) : (
                      <span className="out-of-stock">✗ Hết hàng</span>
                    )}
                  </div>
                  
                  <div className="product-sold">
                    <FaStar className="sold-icon" />
                    <span>Đã bán {item.figure.soldCount || 0}</span>
                  </div>
                  
                  <div className="card-actions">
                    <button 
                      className="buy-now-btn"
                      onClick={() => handleBuyNow(item.figure)}
                      disabled={item.figure.quantity <= 0}
                    >
                      <FaFire /> Mua ngay
                    </button>
                    <button 
                      className="add-to-cart-btn"
                      onClick={() => handleAddToCart(item.figure.id, item.figure.name)}
                      disabled={item.figure.quantity <= 0 || addingToCart[item.figure.id]}
                    >
                      {addingToCart[item.figure.id] ? (
                        <FaSpinner className="spinner-small" />
                      ) : (
                        <FaShoppingCart />
                      )}
                      Thêm giỏ
                    </button>
                    <Link to={`/product/${item.figure.id}`} className="view-detail-btn" title="Xem chi tiết">
                      <FaEye />
                    </Link>
                    <button 
                      className="remove-btn"
                      onClick={() => handleRemoveFromWishlist(item.figure.id, item.figure.name)}
                      disabled={removing[item.figure.id]}
                      title="Xóa khỏi yêu thích"
                    >
                      {removing[item.figure.id] ? (
                        <FaSpinner className="spinner-small" />
                      ) : (
                        <FaTrash />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="wishlist-footer">
            <button className="continue-shopping" onClick={() => navigate('/figures')}>
              <FaShoppingCart /> Tiếp tục mua sắm
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Wishlist;