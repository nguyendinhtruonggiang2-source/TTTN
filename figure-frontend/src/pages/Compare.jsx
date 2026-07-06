import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FaPlus, FaTrash, FaExchangeAlt, FaCheck, FaTimes,
  FaStar, FaStarHalfAlt, FaRegStar, FaShoppingCart,
  FaBox, FaRuler, FaIndustry, FaCalendarAlt, FaTag,
  FaHeart, FaEye, FaMinus, FaArrowLeft
} from 'react-icons/fa';
import axiosClient, { getImageUrl } from '../api/axiosClient';
import '../styles/Compare.css';

const Compare = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [compareProducts, setCompareProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Lấy danh sách sản phẩm đang so sánh từ localStorage
  useEffect(() => {
    const savedCompare = localStorage.getItem('compareProducts');
    if (savedCompare) {
      const ids = JSON.parse(savedCompare);
      fetchCompareProducts(ids);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCompareProducts = async (ids) => {
    setLoading(true);
    try {
      const productPromises = ids.map(id => axiosClient.get(`/figures/${id}`));
      const responses = await Promise.all(productPromises);
      const productsData = responses.map(res => res.data);
      setCompareProducts(productsData);
    } catch (error) {
      console.error('Error fetching compare products:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      const response = await axiosClient.get(`/figures/search?keyword=${encodeURIComponent(searchTerm)}`);
      // Lọc ra những sản phẩm chưa có trong danh sách so sánh
      const compareIds = compareProducts.map(p => p.id);
      const filtered = response.data.filter(p => !compareIds.includes(p.id));
      setSearchResults(filtered.slice(0, 10));
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm) {
        searchProducts();
      } else {
        setSearchResults([]);
      }
    }, 500);
    
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const addToCompare = (product) => {
    if (compareProducts.length >= 4) {
      alert('Chỉ có thể so sánh tối đa 4 sản phẩm cùng lúc');
      return;
    }
    
    const newCompare = [...compareProducts, product];
    setCompareProducts(newCompare);
    localStorage.setItem('compareProducts', JSON.stringify(newCompare.map(p => p.id)));
    setShowProductModal(false);
    setSearchTerm('');
    setSearchResults([]);
  };

  const removeFromCompare = (productId) => {
    const newCompare = compareProducts.filter(p => p.id !== productId);
    setCompareProducts(newCompare);
    localStorage.setItem('compareProducts', JSON.stringify(newCompare.map(p => p.id)));
  };

  const clearAllCompare = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tất cả sản phẩm khỏi danh sách so sánh?')) {
      setCompareProducts([]);
      localStorage.removeItem('compareProducts');
    }
  };

  const formatCurrency = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price || 0);
  };

  const getRatingStars = (rating) => {
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating % 1) >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <>
        {[...Array(fullStars)].map((_, i) => <FaStar key={`full-${i}`} className="star filled" />)}
        {hasHalfStar && <FaStarHalfAlt className="star half" />}
        {[...Array(emptyStars)].map((_, i) => <FaRegStar key={`empty-${i}`} className="star empty" />)}
      </>
    );
  };

  const handleAddToCart = async (product) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Vui lòng đăng nhập để thêm vào giỏ hàng');
        navigate('/login', { state: { from: '/compare' } });
        return;
      }
      
      await axiosClient.post('/cart/add', {
        figureId: product.id,
        quantity: 1
      });
      alert(`✅ Đã thêm "${product.name}" vào giỏ hàng!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('❌ Không thể thêm vào giỏ hàng');
    }
  };

  // Các trường so sánh
  const compareFields = [
    { key: 'name', label: 'Tên sản phẩm', icon: <FaTag /> },
    { key: 'series', label: 'Series', icon: null },
    { key: 'manufacturer', label: 'Nhà sản xuất', icon: <FaIndustry /> },
    { key: 'type', label: 'Loại', icon: <FaBox /> },
    { key: 'scale', label: 'Tỉ lệ', icon: <FaRuler /> },
    { key: 'releaseDate', label: 'Ngày phát hành', icon: <FaCalendarAlt /> },
    { key: 'price', label: 'Giá', icon: null },
    { key: 'stock', label: 'Tồn kho', icon: null },
    { key: 'rating', label: 'Đánh giá', icon: null }
  ];

  return (
    <div className="compare-container">
      {/* Header */}
      <div className="compare-header">
        <div className="compare-header-left">
          <button onClick={() => navigate(-1)} className="back-btn">
            <FaArrowLeft /> Quay lại
          </button>
          <h1>🔄 So sánh sản phẩm</h1>
        </div>
        {compareProducts.length > 0 && (
          <button onClick={clearAllCompare} className="clear-all-btn">
            <FaTrash /> Xóa tất cả
          </button>
        )}
      </div>

      {/* Empty State */}
      {compareProducts.length === 0 && !loading && (
        <div className="empty-compare">
          <FaExchangeAlt className="empty-icon" />
          <h3>Chưa có sản phẩm để so sánh</h3>
          <p>Thêm sản phẩm vào danh sách so sánh để xem sự khác biệt</p>
          <button onClick={() => setShowProductModal(true)} className="add-product-btn">
            <FaPlus /> Thêm sản phẩm
          </button>
          <button onClick={() => navigate('/figures')} className="browse-btn">
            <FaEye /> Xem sản phẩm
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="compare-loading">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      )}

      {/* Compare Table */}
      {compareProducts.length > 0 && !loading && (
        <div className="compare-table-wrapper">
          <table className="compare-table">
            <thead>
              <tr>
                <th className="field-label">Thông tin</th>
                {compareProducts.map(product => (
                  <th key={product.id} className="product-header">
                    <div className="product-header-content">
                      <button 
                        className="remove-product-btn"
                        onClick={() => removeFromCompare(product.id)}
                        title="Xóa khỏi so sánh"
                      >
                        <FaTimes />
                      </button>
                      <img 
                        src={getImageUrl(product.image)} 
                        alt={product.name}
                        className="product-thumb"
                        onError={(e) => { e.target.src = '/default-figure.jpg'; }}
                      />
                      <h3>{product.name}</h3>
                      <div className="product-actions-header">
                        <button 
                          className="cart-btn-header"
                          onClick={() => handleAddToCart(product)}
                          title="Thêm vào giỏ"
                        >
                          <FaShoppingCart />
                        </button>
                        <Link to={`/product/${product.id}`} className="view-btn-header">
                          <FaEye />
                        </Link>
                      </div>
                    </div>
                  </th>
                ))}
                {compareProducts.length < 4 && (
                  <th className="add-more-col">
                    <button 
                      className="add-more-btn"
                      onClick={() => setShowProductModal(true)}
                    >
                      <FaPlus />
                      <span>Thêm sản phẩm</span>
                    </button>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {compareFields.map(field => (
                <tr key={field.key}>
                  <td className="field-label">
                    {field.icon && <span className="field-icon">{field.icon}</span>}
                    <strong>{field.label}</strong>
                  </td>
                  {compareProducts.map(product => (
                    <td key={product.id} className="field-value">
                      {field.key === 'name' && (
                        <Link to={`/product/${product.id}`} className="product-link">
                          {product[field.key] || 'N/A'}
                        </Link>
                      )}
                      {field.key === 'price' && (
                        <span className="price-value">
                          {formatCurrency(product.price)}
                        </span>
                      )}
                      {field.key === 'stock' && (
                        <span className={`stock-value ${product.quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                          {product.quantity > 0 ? `Còn ${product.quantity} sản phẩm` : 'Hết hàng'}
                        </span>
                      )}
                      {field.key === 'rating' && (
                        <div className="rating-value">
                          {getRatingStars(product.rating || 4.5)}
                          <span className="rating-number">({product.rating || 4.5})</span>
                        </div>
                      )}
                      {field.key !== 'name' && field.key !== 'price' && 
                       field.key !== 'stock' && field.key !== 'rating' && (
                        <span>{product[field.key] || 'Chưa cập nhật'}</span>
                      )}
                    </td>
                  ))}
                  {compareProducts.length < 4 && <td className="empty-cell"></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Product Modal */}
      {showProductModal && (
        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Thêm sản phẩm để so sánh</h2>
              <button className="close-modal" onClick={() => setShowProductModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="search-results">
                {searchResults.length === 0 && searchTerm && (
                  <p className="no-results">Không tìm thấy sản phẩm</p>
                )}
                {searchResults.map(product => (
                  <div key={product.id} className="search-result-item">
                    <img 
                      src={getImageUrl(product.image)} 
                      alt={product.name}
                      className="result-image"
                      onError={(e) => { e.target.src = '/default-figure.jpg'; }}
                    />
                    <div className="result-info">
                      <h4>{product.name}</h4>
                      <p className="result-price">{formatCurrency(product.price)}</p>
                      <p className="result-series">{product.series || 'Chưa có series'}</p>
                    </div>
                    <button 
                      className="add-result-btn"
                      onClick={() => addToCompare(product)}
                    >
                      <FaPlus /> Thêm
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Compare;