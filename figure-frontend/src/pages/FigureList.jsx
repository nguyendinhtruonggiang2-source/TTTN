import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaShoppingCart, FaEye, FaBolt, FaHeart, FaRegHeart } from "react-icons/fa";
import axiosClient, { getImageUrl } from "../api/axiosClient";
import "../styles/figures.css";

function FigureList() {
  const [figures, setFigures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [addingToCart, setAddingToCart] = useState({});
  const [wishlistStatus, setWishlistStatus] = useState({});
  const [togglingWishlist, setTogglingWishlist] = useState({});
  
  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // 8 sản phẩm mỗi trang (2 hàng x 4 cột)
  
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem("token");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get('category');
    const series = params.get('series');
    const keyword = params.get('keyword');
    const isNew = params.get('isNew') === 'true';
    
    if (category) {
      setFilterType('category');
      setFilterValue(category);
      setSearchTerm(category);
      fetchFiguresByCategory(category);
    } else if (series) {
      setFilterType('series');
      setFilterValue(series);
      setSearchTerm(series);
      fetchFiguresBySeries(series);
    } else if (keyword) {
      setFilterType('search');
      setFilterValue(keyword);
      setSearchTerm(keyword);
      fetchFiguresByKeyword(keyword);
    } else if (isNew) {
      setFilterType('new');
      setFilterValue('Hàng mới');
      setSearchTerm('');
      fetchNewFigures();
    } else {
      setFilterType('');
      setFilterValue('');
      setSearchTerm('');
      fetchFigures();
    }
  }, [location.search]);

  // Lấy tất cả figures
  const fetchFigures = async () => {
    setLoading(true);
    setError("");
    try {
      console.log("🔍 Fetching all figures...");
      const response = await axiosClient.get("/figures");
      
      const processedFigures = response.data.map(figure => ({
        ...figure,
        quantity: figure.quantity || 50,
        price: figure.price || 0,
        image: figure.image || "/default-figure.jpg",
        id: figure.id || Math.random().toString(36).substr(2, 9)
      }));
      
      setFigures(processedFigures);
      setCurrentPage(1);
      
      // Kiểm tra wishlist cho từng sản phẩm
      if (isAuthenticated) {
        await checkMultipleWishlistStatus(processedFigures.map(f => f.id));
      }
    } catch (err) {
      console.error("❌ Error fetching figures:", err);
      setError("Không thể tải danh sách figure");
    } finally {
      setLoading(false);
    }
  };

  // Kiểm tra wishlist cho nhiều sản phẩm
  const checkMultipleWishlistStatus = async (figureIds) => {
    try {
      const promises = figureIds.map(id => 
        axiosClient.get(`/wishlist/check/${id}`).catch(() => ({ data: { inWishlist: false } }))
      );
      const responses = await Promise.all(promises);
      const status = {};
      figureIds.forEach((id, index) => {
        status[id] = responses[index].data?.inWishlist || false;
      });
      setWishlistStatus(status);
    } catch (error) {
      console.error("Error checking wishlist status:", error);
    }
  };

  // CÁCH 1: Lọc bằng API có sẵn (dùng search)
  const fetchFiguresByCategory = async (category) => {
    setLoading(true);
    setError("");
    try {
      console.log(`🔍 Fetching figures by category using search: ${category}`);
      const response = await axiosClient.get(`/figures/search?keyword=${encodeURIComponent(category)}`);
      
      const processedFigures = response.data.map(figure => ({
        ...figure,
        quantity: figure.quantity || 50,
        price: figure.price || 0,
        image: figure.image || "/default-figure.jpg",
        id: figure.id || Math.random().toString(36).substr(2, 9)
      }));
      
      setFigures(processedFigures);
      setCurrentPage(1);
      
      if (isAuthenticated && processedFigures.length > 0) {
        await checkMultipleWishlistStatus(processedFigures.map(f => f.id));
      }
      
      if (processedFigures.length === 0) {
        setError(`Không tìm thấy sản phẩm nào trong danh mục "${category}"`);
      }
    } catch (err) {
      console.error("❌ Error fetching by category:", err);
      setError(`Không thể tải sản phẩm theo danh mục "${category}"`);
      setFigures([]);
    } finally {
      setLoading(false);
    }
  };

  // CÁCH 2: Lọc bằng API có sẵn (dùng search cho series)
  const fetchFiguresBySeries = async (series) => {
    setLoading(true);
    setError("");
    try {
      console.log(`🔍 Fetching figures by series using search: ${series}`);
      const response = await axiosClient.get(`/figures/search?keyword=${encodeURIComponent(series)}`);
      
      const processedFigures = response.data.map(figure => ({
        ...figure,
        quantity: figure.quantity || 50,
        price: figure.price || 0,
        image: figure.image || "/default-figure.jpg",
        id: figure.id || Math.random().toString(36).substr(2, 9)
      }));
      
      setFigures(processedFigures);
      setCurrentPage(1);
      
      if (isAuthenticated && processedFigures.length > 0) {
        await checkMultipleWishlistStatus(processedFigures.map(f => f.id));
      }
      
      if (processedFigures.length === 0) {
        setError(`Không tìm thấy sản phẩm nào trong series "${series}"`);
      }
    } catch (err) {
      console.error("❌ Error fetching by series:", err);
      setError(`Không thể tải sản phẩm theo series "${series}"`);
      setFigures([]);
    } finally {
      setLoading(false);
    }
  };

  // Tìm kiếm theo keyword
  const fetchFiguresByKeyword = async (keyword) => {
    setLoading(true);
    setError("");
    try {
      console.log(`🔍 Searching for: ${keyword}`);
      const response = await axiosClient.get(`/figures/search?keyword=${encodeURIComponent(keyword)}`);
      
      const processedFigures = response.data.map(figure => ({
        ...figure,
        quantity: figure.quantity || 30,
        price: figure.price || 0,
        image: figure.image || "/default-figure.jpg",
        id: figure.id || Math.random().toString(36).substr(2, 9)
      }));
      
      setFigures(processedFigures);
      setCurrentPage(1);
      
      if (isAuthenticated && processedFigures.length > 0) {
        await checkMultipleWishlistStatus(processedFigures.map(f => f.id));
      }
      
      if (processedFigures.length === 0) {
        setError(`Không tìm thấy sản phẩm nào với từ khóa "${keyword}"`);
      }
    } catch (err) {
      console.error("❌ Search error:", err);
      setError(`Lỗi tìm kiếm: ${err.message}`);
      setFigures([]);
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách hàng mới
  const fetchNewFigures = async () => {
    setLoading(true);
    setError("");
    try {
      console.log("🔍 Fetching new figures...");
      const response = await axiosClient.get("/figures");
      
      const processedFigures = response.data
        .map(figure => ({
          ...figure,
          quantity: figure.quantity || 50,
          price: figure.price || 0,
          image: figure.image || "/default-figure.jpg",
          id: figure.id || Math.random().toString(36).substr(2, 9)
        }))
        .filter(figure => figure.isNew === true);
      
      setFigures(processedFigures);
      setCurrentPage(1);
      
      if (isAuthenticated && processedFigures.length > 0) {
        await checkMultipleWishlistStatus(processedFigures.map(f => f.id));
      }
      
      if (processedFigures.length === 0) {
        setError("Chưa có sản phẩm hàng mới nào được thêm");
      }
    } catch (err) {
      console.error("❌ Error fetching new figures:", err);
      setError("Không thể tải danh sách hàng mới");
      setFigures([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      window.location.href = "/figures";
      return;
    }
    window.location.href = `/figures?keyword=${encodeURIComponent(searchTerm.trim())}`;
  };

  const handleReset = () => {
    setSearchTerm("");
    window.location.href = "/figures";
  };

  // Hàm thêm vào giỏ hàng
  const handleAddToCart = async (figure) => {
    if (addingToCart[figure.id]) return;
    
    setAddingToCart(prev => ({ ...prev, [figure.id]: true }));
    
    try {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      
      if (!token || !user) {
        alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
        window.location.href = `/login?from=/figures&productId=${figure.id}`;
        return;
      }
      
      const cartItem = {
        figureId: figure.id,
        quantity: 1
      };
      
      console.log("🛒 Adding to cart:", cartItem);
      const response = await axiosClient.post("/cart/add", cartItem);
      
      if (response.data.success) {
        alert("✅ Đã thêm vào giỏ hàng!");
      } else {
        alert("❌ " + (response.data.message || "Lỗi không xác định"));
      }
    } catch (error) {
      console.error("❌ Add to cart error:", error);
      
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        alert("⚠️ Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        window.location.href = "/login";
      } else {
        alert("❌ Lỗi: " + (error.response?.data?.message || "Vui lòng thử lại"));
      }
    } finally {
      setAddingToCart(prev => ({ ...prev, [figure.id]: false }));
    }
  };

  // Hàm xử lý mua ngay - lưu thông tin vào sessionStorage
  const handleBuyNowClick = (figure) => {
    if (figure.quantity <= 0) {
      alert("❌ Sản phẩm đã hết hàng");
      return;
    }
    
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    
    if (!token || !user) {
      alert("Vui lòng đăng nhập để mua sản phẩm");
      window.location.href = `/login?from=/figures&productId=${figure.id}&buyNow=true`;
      return;
    }
    
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
  };

  // 👉 HÀM THÊM/XÓA YÊU THÍCH
  const handleToggleWishlist = async (figureId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      alert("Vui lòng đăng nhập để sử dụng tính năng này");
      window.location.href = `/login?from=/figures`;
      return;
    }
    
    setTogglingWishlist(prev => ({ ...prev, [figureId]: true }));
    
    try {
      if (wishlistStatus[figureId]) {
        // Xóa khỏi wishlist
        await axiosClient.delete(`/wishlist/remove/${figureId}`);
        setWishlistStatus(prev => ({ ...prev, [figureId]: false }));
        alert("✅ Đã xóa khỏi danh sách yêu thích");
      } else {
        // Thêm vào wishlist
        await axiosClient.post(`/wishlist/add/${figureId}`);
        setWishlistStatus(prev => ({ ...prev, [figureId]: true }));
        alert("✅ Đã thêm vào danh sách yêu thích");
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      alert(error.response?.data?.error || "Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setTogglingWishlist(prev => ({ ...prev, [figureId]: false }));
    }
  };

  const getPageTitle = () => {
    if (filterType === 'category') {
      return `🏷️ Danh mục: ${filterValue}`;
    } else if (filterType === 'series') {
      return `📺 Series: ${filterValue}`;
    } else if (filterType === 'search') {
      return `🔍 Kết quả tìm kiếm: "${filterValue}"`;
    } else if (filterType === 'new') {
      return `✨ Hàng mới về`;
    }
    return "🏷️ Danh Sách Figure";
  };

  if (loading) {
    return (
      <div className="figure-list-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Đang tải danh sách sản phẩm...</p>
        </div>
      </div>
    );
  }

  // Các biến phục vụ phân trang
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = figures.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(figures.length / itemsPerPage);

  return (
    <div className="figure-list-container">
      <div className="figure-header">
        <h1>{getPageTitle()}</h1>
        <div className="header-actions">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Tìm kiếm figure theo tên, series..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} className="search-btn">🔍 Tìm kiếm</button>
            {(filterType || searchTerm) && (
              <button onClick={handleReset} className="reset-btn">Xóa bộ lọc</button>
            )}
          </div>
          <div className="total-count">
            Tổng: <strong>{figures.length}</strong> sản phẩm
          </div>
        </div>
      </div>

      {filterType && (
        <div className="filter-info">
          <span className="filter-badge">
            {filterType === 'category' && '📁 Danh mục'}
            {filterType === 'series' && '📺 Series'}
            {filterType === 'search' && '🔍 Tìm kiếm'}
            {filterType === 'new' && '✨ Trạng thái'}
            : {filterValue}
          </span>
          <button onClick={handleReset} className="clear-filter-btn">✖ Xóa lọc</button>
        </div>
      )}

      {error ? (
        <div className="error-message">
          <h3>⚠️ {error}</h3>
          <div className="error-actions">
            <button onClick={handleReset} className="btn-primary">Xem tất cả sản phẩm</button>
            <button onClick={() => window.location.href = "/"} className="btn-secondary">Về trang chủ</button>
          </div>
        </div>
      ) : figures.length === 0 ? (
        <div className="no-results">
          <h3>🔍 Không tìm thấy sản phẩm</h3>
          <p>Không có sản phẩm nào phù hợp với tìm kiếm của bạn.</p>
          <button onClick={handleReset} className="btn-primary">Xem tất cả sản phẩm</button>
        </div>
      ) : (
        <>
          <div className="figure-grid">
            {currentItems.map((figure) => (
              <div key={figure.id} className="figure-card">
                <Link to={`/product/${figure.id}`} className="figure-link">
                  <div className="figure-image">
                    <img 
                      src={getImageUrl(figure.image)} 
                      alt={figure.name}
                      onError={(e) => {
                        e.target.src = "/default-figure.jpg";
                        e.target.onerror = null;
                      }}
                    />
                  </div>
                  <div className="figure-info">
                    <h3>{figure.name}</h3>
                    
                    <div className="figure-price">
                      <strong>{figure.price ? figure.price.toLocaleString() + "₫" : "Liên hệ"}</strong>
                    </div>
                    
                    <div className="figure-stock in-stock">
                      <span className="stock-icon">✓</span>
                      <span className="stock-text">Còn {figure.quantity} sản phẩm</span>
                    </div>
                  </div>
                </Link>
                
                <div className="figure-actions">
                  <button 
                    className={`wishlist-btn ${wishlistStatus[figure.id] ? 'active' : ''}`}
                    onClick={(e) => handleToggleWishlist(figure.id, e)}
                    disabled={togglingWishlist[figure.id]}
                    title={wishlistStatus[figure.id] ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
                  >
                    {togglingWishlist[figure.id] ? (
                      <span className="spinner-small"></span>
                    ) : wishlistStatus[figure.id] ? (
                      <FaHeart />
                    ) : (
                      <FaRegHeart />
                    )}
                  </button>
                  <Link
                    to="/checkout"
                    className="buy-now-link"
                    onClick={() => handleBuyNowClick(figure)}
                    style={{ pointerEvents: figure.quantity <= 0 ? 'none' : 'auto' }}
                  >
                    <FaBolt /> Mua ngay
                  </Link>
                  <button 
                    className="add-to-cart-icon"
                    onClick={() => handleAddToCart(figure)}
                    disabled={figure.quantity <= 0 || addingToCart[figure.id]}
                    title="Thêm vào giỏ hàng"
                  >
                    {addingToCart[figure.id] ? (
                      <span className="spinner-small"></span>
                    ) : (
                      <FaShoppingCart />
                    )}
                  </button>
                  <Link to={`/product/${figure.id}`} className="view-detail-icon" title="Xem chi tiết">
                    <FaEye />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="pagination" style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              marginTop: '40px',
              marginBottom: '30px'
            }}>
              <button 
                type="button"
                onClick={() => {
                  setCurrentPage(prev => Math.max(prev - 1, 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={currentPage === 1}
                style={{
                  padding: '10px 18px',
                  borderRadius: '25px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: currentPage === 1 ? '#f1f5f9' : '#ffffff',
                  color: currentPage === 1 ? '#94a3b8' : '#1e293b',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}
              >
                ← Trước
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                <button
                  type="button"
                  key={pageNumber}
                  onClick={() => {
                    setCurrentPage(pageNumber);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    border: '1px solid',
                    borderColor: currentPage === pageNumber ? '#3b82f6' : '#e2e8f0',
                    backgroundColor: currentPage === pageNumber ? '#3b82f6' : '#ffffff',
                    color: currentPage === pageNumber ? '#ffffff' : '#1e293b',
                    cursor: 'pointer',
                    fontWeight: '700',
                    transition: 'all 0.2s',
                    boxShadow: currentPage === pageNumber ? '0 4px 10px rgba(59, 130, 246, 0.3)' : '0 2px 4px rgba(0,0,0,0.02)'
                  }}
                >
                  {pageNumber}
                </button>
              ))}

              <button 
                type="button"
                onClick={() => {
                  setCurrentPage(prev => Math.min(prev + 1, totalPages));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={currentPage === totalPages}
                style={{
                  padding: '10px 18px',
                  borderRadius: '25px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: currentPage === totalPages ? '#f1f5f9' : '#ffffff',
                  color: currentPage === totalPages ? '#94a3b8' : '#1e293b',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}
              >
                Sau →
              </button>
            </div>
          )}

          <div className="figure-footer" style={{ marginTop: '20px' }}>
            <p>Trang <strong>{currentPage}</strong> / <strong>{totalPages}</strong> | Hiển thị từ <strong>{indexOfFirstItem + 1}</strong> đến <strong>{Math.min(indexOfLastItem, figures.length)}</strong> trong tổng số <strong>{figures.length}</strong> sản phẩm</p>
            {filterType && (
              <p className="filter-info-text">
                Đang hiển thị sản phẩm theo {filterType === 'category' ? 'danh mục' : filterType === 'series' ? 'series' : 'từ khóa'}: 
                <strong> {filterValue}</strong>
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default FigureList;