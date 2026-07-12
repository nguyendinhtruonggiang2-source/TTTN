// src/pages/Home.jsx
import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import axiosClient, { getImageUrl } from "../api/axiosClient";
import BranchSection from "../components/BranchSection";
import { FaShoppingCart, FaEye } from "react-icons/fa";
import "../styles/home.css";

const parseDate = (dateString) => {
  if (!dateString) return null;
  if (typeof dateString === 'string' && !dateString.endsWith('Z') && !dateString.includes('+') && dateString.includes('T')) {
    return new Date(dateString + 'Z');
  }
  return new Date(dateString);
};

function Home() {
  const [figures, setFigures] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [banners, setBanners] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const itemsPerPage = 24;

  // Flash Sale States
  const [flashSales, setFlashSales] = useState([]);
  const [flashSaleTimeLeft, setFlashSaleTimeLeft] = useState("00:00:00");

  // Phân trang
  const totalPages = Math.ceil(figures.length / itemsPerPage);
  const paginatedFigures = figures.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Danh sách placeholder images an toàn
  const placeholderImages = [
    "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=300&h=400&q=80",
    "https://images.unsplash.com/photo-1633158829558-8e42d36db7e0?auto=format&fit=crop&w=300&h=400&q=80",
    "https://images.unsplash.com/photo-1593081891731-fda0877988da?auto=format&fit=crop&w=300&h=400&q=80",
    "https://images.unsplash.com/photo-1546436836-07bfe9ee8b2c?auto=format&fit=crop&w=300&h=400&q=80"
  ];

  // Hàm lấy placeholder image an toàn
  const getPlaceholderImage = (index) => {
    return placeholderImages[index % placeholderImages.length];
  };

  // Hàm xử lý lỗi hình ảnh
  const handleImageError = (e, index) => {
    console.warn(`Image failed to load, using placeholder: ${e.target.src}`);
    e.target.src = getPlaceholderImage(index);
    e.target.onerror = null;
  };

  // Hàm kiểm tra đăng nhập
  const checkAuthentication = useCallback(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    return !!(token && user);
  }, []);

  // Hàm hiển thị thông báo
  const displayNotification = (message, type = "success") => {
    setNotificationMessage(message);
    setShowNotification(true);
    
    setTimeout(() => {
      setShowNotification(false);
      setNotificationMessage("");
    }, 3000);
  };

  // Hàm lấy số lượng giỏ hàng
  const fetchCartCount = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setCartCount(0);
        return;
      }

      console.log("🛒 Fetching cart count...");
      const response = await axiosClient.get("/cart/count");
      console.log("🛒 Cart count response:", response.data);
      
      if (response.data && typeof response.data.count === 'number') {
        setCartCount(response.data.count);
      } else {
        setCartCount(0);
      }
    } catch (error) {
      console.log("🛒 Cart count fetch error:", error.message);
      setCartCount(0);
    }
  }, []);

  // Hàm fetch figures
  const fetchFigures = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("🔍 Starting fetchFigures...");
      
      const keyword = searchParams.get("keyword");
      
      let url = "/figures";
      const params = new URLSearchParams();
      
      if (keyword && keyword.trim()) {
        params.append("keyword", keyword.trim());
      }
      
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
      
      console.log("🔍 Fetching figures from:", url);
      
      const [response, newestResponse] = await Promise.all([
        axiosClient.get(url),
        axiosClient.get("/figures/newest").catch(err => {
          console.warn("⚠️ Failed to fetch newest figures:", err);
          return { data: [] };
        })
      ]);
      
      console.log("✅ Figures response received:", {
        status: response.status,
        count: Array.isArray(response.data) ? response.data.length : 0,
      });
      
      if (Array.isArray(response.data)) {
        const processedFigures = response.data.map((figure, index) => {
          const quantity = figure.quantity && figure.quantity > 0 ? figure.quantity : Math.floor(Math.random() * 50) + 20;
          const stock = figure.stock && figure.stock > 0 ? figure.stock : quantity;
          
          const basePrice = figure.price || 500000;
          const discount = Math.random() > 0.5 ? Math.floor(Math.random() * 30) + 10 : 0;
          const originalPrice = discount > 0 ? Math.round(basePrice * (1 + discount/100)) : basePrice;
          
          return {
            ...figure,
            id: figure.id || `fig-${index}`,
            imageUrl: getImageUrl(figure.imageUrl || figure.image) || getPlaceholderImage(index),
            price: basePrice,
            originalPrice: originalPrice,
            stock: stock,
            quantity: quantity,
            isNew: Math.random() > 0.7,
            discount: discount,
            category: figure.category || ["Anime", "Game", "Movie"][index % 3],
            name: figure.name || `Figure ${index + 1}`,
            series: figure.series || "Various",
            manufacturer: figure.manufacturer || "Unknown",
            description: figure.description || "Mô hình chất lượng cao",
            rating: 5,
            soldCount: Math.floor(Math.random() * 5000) + 100
          };
        });
        
        console.log(`✅ Processed ${processedFigures.length} figures`);
        setFigures(processedFigures);
      } else {
        console.warn("⚠️ Response data is not an array:", response.data);
        setFigures([]);
      }

      if (newestResponse && Array.isArray(newestResponse.data)) {
        const processedNewest = newestResponse.data.map((figure, index) => {
          const quantity = figure.quantity && figure.quantity > 0 ? figure.quantity : Math.floor(Math.random() * 50) + 20;
          const stock = figure.stock && figure.stock > 0 ? figure.stock : quantity;
          
          const basePrice = figure.price || 500000;
          const discount = figure.discount || 0;
          const originalPrice = figure.originalPrice || basePrice;
          
          return {
            ...figure,
            id: figure.id || `fig-new-${index}`,
            imageUrl: getImageUrl(figure.imageUrl || figure.image) || getPlaceholderImage(index),
            price: basePrice,
            originalPrice: originalPrice,
            stock: stock,
            quantity: quantity,
            isNew: true, // Always show "NEW" badge for actual newest arrivals
            discount: discount,
            category: figure.category || ["Anime", "Game", "Movie"][index % 3],
            name: figure.name || `Figure ${index + 1}`,
            series: figure.series || "Various",
            manufacturer: figure.manufacturer || "Unknown",
            description: figure.description || "Mô hình chất lượng cao",
            rating: 5,
            soldCount: figure.soldCount || 0
          };
        });
        
        console.log(`✅ Processed ${processedNewest.length} new arrivals`);
        setNewArrivals(processedNewest);
      } else {
        setNewArrivals([]);
      }
    } catch (error) {
      console.error("❌ Error fetching figures:", error);
      
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || error.response.data?.error || "Lỗi không xác định";
        
        if (status === 404) {
          setError("Không tìm thấy dữ liệu.");
          setFigures([]);
        } else if (status === 500) {
          setError(`Lỗi server (500): ${message}`);
          setFigures([]);
        } else {
          setError(`Lỗi (${status}): ${message}`);
          setFigures([]);
        }
      } else if (error.request) {
        setError("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.");
        setFigures([]);
      } else {
        setError("Đã xảy ra lỗi: " + error.message);
        setFigures([]);
      }
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  // Hàm thêm vào giỏ hàng
  const handleAddToCart = async (figure) => {
    if (addingToCart) return;
    
    try {
      setAddingToCart(true);
      
      console.log(`🛒 Adding to cart - Figure: ${figure.name}, ID: ${figure.id}`);
      
      const isAuthenticated = checkAuthentication();
      
      if (!isAuthenticated) {
        displayNotification("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng", "warning");
        setTimeout(() => {
          navigate("/login", { 
            state: { 
              from: location.pathname,
              message: "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng",
              productId: figure.id,
              productName: figure.name
            } 
          });
        }, 1500);
        return;
      }

      const requestData = {
        figureId: figure.id,
        quantity: 1
      };

      console.log("🛒 Request data:", requestData);

      const response = await axiosClient.post("/cart/add", requestData);

      console.log("🛒 Response:", response.data);

      if (response.data.success) {
        await fetchCartCount();
        displayNotification(`✅ Đã thêm "${figure.name}" vào giỏ hàng!`);
      } else {
        displayNotification(`❌ ${response.data.message || "Không thể thêm vào giỏ hàng"}`, "error");
      }
    } catch (error) {
      console.error("❌ Error adding to cart:", error);
      
      if (error.response) {
        if (error.response.status === 401) {
          displayNotification("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", "warning");
        } else if (error.response.status === 400) {
          const errorMsg = error.response.data?.message || "Dữ liệu không hợp lệ";
          displayNotification(`❌ ${errorMsg}`, "error");
        } else {
          displayNotification("❌ Lỗi khi thêm vào giỏ hàng", "error");
        }
      } else if (error.request) {
        displayNotification("❌ Không thể kết nối đến server", "error");
      } else {
        displayNotification("❌ Lỗi: " + error.message, "error");
      }
    } finally {
      setAddingToCart(false);
    }
  };

  // Hàm mua ngay
  const handleBuyNow = (figure) => {
    if (!figure) return;
    
    // Kiểm tra số lượng tồn kho
    if (figure.quantity <= 0) {
      displayNotification("❌ Sản phẩm đã hết hàng", "error");
      return;
    }
    
    const isAuthenticated = checkAuthentication();
    
    // Kiểm tra đăng nhập
    if (!isAuthenticated) {
      displayNotification("Vui lòng đăng nhập để mua sản phẩm", "warning");
      setTimeout(() => {
        navigate("/login", { 
          state: { 
            from: location.pathname,
            message: "Vui lòng đăng nhập để mua sản phẩm",
            productId: figure.id,
            productName: figure.name,
            quantity: 1,
            buyNow: true
          } 
        });
      }, 1500);
      return;
    }
    
    // Lưu thông tin sản phẩm vào sessionStorage để checkout lấy
    const checkoutItem = {
      figureId: figure.id,
      name: figure.name,
      price: figure.price,
      originalPrice: figure.originalPrice,
      quantity: 1,
      image: figure.imageUrl,
      series: figure.series,
      fromBuyNow: true
    };
    
    sessionStorage.setItem('buyNowItem', JSON.stringify(checkoutItem));
    
    // Chuyển đến trang thanh toán
    navigate("/checkout", {
      state: {
        items: [{
          figureId: figure.id,
          name: figure.name,
          price: figure.price,
          originalPrice: figure.originalPrice,
          quantity: 1,
          image: figure.imageUrl,
          series: figure.series
        }],
        fromProduct: true,
        buyNow: true
      }
    });
  };

  // Hàm xem chi tiết sản phẩm
  const handleViewDetail = (figure) => {
    if (figure.id && figure.id.toString().startsWith('fig-')) {
      navigate("/figures");
    } else if (figure.id) {
      navigate(`/product/${figure.id}`);
    }
  };

  // Hàm xử lý category click
  const handleCategoryClick = (category) => {
    navigate(`/figures?keyword=${encodeURIComponent(category)}`);
  };

  // Hàm xem giỏ hàng
  const handleViewCart = () => {
    navigate("/cart");
  };

  // Hàm thanh toán
  const handleCheckout = () => {
    if (!checkAuthentication()) {
      displayNotification("Vui lòng đăng nhập để thanh toán", "warning");
      setTimeout(() => {
        navigate("/login", { state: { from: "/checkout" } });
      }, 1500);
      return;
    }
    
    if (cartCount === 0) {
      displayNotification("Giỏ hàng trống. Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.", "warning");
      return;
    }
    
    navigate("/checkout");
  };

  // Change page
  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchBanners = useCallback(async () => {
    try {
      const response = await axiosClient.get("/banners");
      if (Array.isArray(response.data) && response.data.length > 0) {
        setBanners(response.data);
      } else {
        setBanners([
          {
            id: 'default',
            title: 'KHO MÔ HÌNH ANIME CHÍNH HÃNG',
            subtitle: 'Khám phá bộ sưu tập figure từ các tựa game và anime nổi tiếng với chất lượng cao cấp',
            imageUrl: '',
            linkUrl: '/figures'
          }
        ]);
      }
    } catch (error) {
      console.log("Error fetching banners:", error);
      setBanners([
        {
          id: 'default-err',
          title: 'KHO MÔ HÌNH ANIME CHÍNH HÃNG',
          subtitle: 'Khám phá bộ sưu tập figure từ các tựa game và anime nổi tiếng với chất lượng cao cấp',
          imageUrl: '',
          linkUrl: '/figures'
        }
      ]);
    }
  }, []);

  const fetchFlashSales = useCallback(async () => {
    try {
      console.log("⚡ Fetching all flash sales for home...");
      const response = await axiosClient.get("/flash-sale/all");
      const allSales = response.data || [];
      const mappedSales = allSales.map(s => ({ ...s, status: 'ACTIVE' }));
      setFlashSales(mappedSales);
    } catch (error) {
      console.error("Error fetching flash sales for home:", error);
    }
  }, []);

  useEffect(() => {
    if (flashSales.length === 0) return;
    
    const activeSales = flashSales.filter(s => s.status === 'ACTIVE');
    if (activeSales.length === 0) return;
    
    const endTime = parseDate(activeSales[0].endTime).getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = endTime - now;
      
      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        const hStr = hours < 10 ? `0${hours}` : hours;
        const mStr = minutes < 10 ? `0${minutes}` : minutes;
        const sStr = seconds < 10 ? `0${seconds}` : seconds;
        
        setFlashSaleTimeLeft(`${hStr}:${mStr}:${sStr}`);
      } else {
        setFlashSaleTimeLeft("00:00:00");
        clearInterval(interval);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [flashSales]);

  useEffect(() => {
    fetchFigures();
    fetchCartCount();
    fetchBanners();
    fetchFlashSales();
    
    const token = localStorage.getItem("token");
    if (token && token.split(".").length !== 3) {
      console.warn("⚠️ Invalid token format");
    }
  }, [fetchFigures, fetchCartCount, fetchBanners]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  // Render UI
  if (loading) {
    return (
      <div className="home-container">
        <div className="home-loading-container">
          <div className="home-spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-container">
        <div className="home-error-message">
          <h3>⚠️ Có lỗi xảy ra</h3>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={fetchFigures}>Thử lại</button>
            <button onClick={() => navigate("/")}>Về trang chủ</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Notification Container */}
      {showNotification && (
        <div className="notification-container">
          <div className={`notification ${notificationMessage.includes("❌") ? "error" : notificationMessage.includes("Vui lòng") ? "warning" : ""}`}>
            <span>{notificationMessage}</span>
            <button 
              className="notification-close"
              onClick={() => setShowNotification(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Floating Cart Button */}
      <button className="floating-cart-button" onClick={handleViewCart}>
        🛒
        {cartCount > 0 && (
          <div className="cart-count-badge">{cartCount}</div>
        )}
      </button>

      {/* Hero Banner Slider */}
      {banners.length > 0 && (
        <div 
          className="home-hero-banner"
          style={{
            backgroundImage: banners[currentBannerIndex].imageUrl 
              ? `linear-gradient(rgba(15, 23, 42, 0.55), rgba(15, 23, 42, 0.55)), url(${getImageUrl(banners[currentBannerIndex].imageUrl)})`
              : 'linear-gradient(135deg, var(--primary-color), var(--primary-hover))',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '520px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-image 0.5s ease-in-out',
            padding: '100px 40px',
            position: 'relative'
          }}
        >
          <div className="home-hero-content" style={{ zIndex: 2, position: 'relative' }}>
            <h1>{banners[currentBannerIndex].title}</h1>
            <p className="home-hero-subtitle">
              {banners[currentBannerIndex].subtitle}
            </p>
            
            <div className="home-hero-stats">
              <div className="home-stat-item">
                <span className="home-stat-number">{figures.length}+</span>
                <span className="home-stat-label">Sản phẩm</span>
              </div>
              <div className="home-stat-item">
                <span className="home-stat-number">
                  {new Set(figures.map(f => f.manufacturer)).size}+
                </span>
                <span className="home-stat-label">Thương hiệu</span>
              </div>
              <div className="home-stat-item">
                <span className="home-stat-number">100%</span>
                <span className="home-stat-label">Chính hãng</span>
              </div>
            </div>
            
            <div className="home-hero-cta" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', alignItems: 'center' }}>
              <button 
                className="home-btn-primary" 
                onClick={() => {
                  const url = banners[currentBannerIndex].linkUrl;
                  if (url) {
                    if (url.startsWith('http://') || url.startsWith('https://')) {
                      window.open(url, '_blank');
                    } else {
                      navigate(url);
                    }
                  } else {
                    navigate("/figures");
                  }
                }}
              >
                <span>MUA NGAY</span>
              </button>
              <button 
                className="home-btn-secondary" 
                onClick={() => navigate("/figures")}
              >
                <span>XEM TẤT CẢ</span>
              </button>
            </div>

            {/* Slide Navigation Dots */}
            {banners.length > 1 && (
              <div className="banner-dots" style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '28px' }}>
                {banners.map((_, idx) => (
                  <span 
                    key={idx}
                    onClick={() => setCurrentBannerIndex(idx)}
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: currentBannerIndex === idx ? 'var(--primary-color)' : 'rgba(255,255,255,0.4)',
                      border: '1px solid rgba(0,0,0,0.1)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      transform: currentBannerIndex === idx ? 'scale(1.2)' : 'none'
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dịch vụ / Ưu đãi như Shopee */}
      <div className="services-section">
        <div className="services-grid">
          <div className="service-card">
            <div className="service-icon">🚚</div>
            <div className="service-info">
              <h4>Miễn phí vận chuyển</h4>
              <p>Cho đơn hàng từ 500.000đ</p>
            </div>
          </div>
          <div className="service-card">
            <div className="service-icon">💰</div>
            <div className="service-info">
              <h4>Hoàn tiền 100%</h4>
              <p>Nếu sản phẩm không giống mô tả</p>
            </div>
          </div>
          <div className="service-card">
            <div className="service-icon">🔄</div>
            <div className="service-info">
              <h4>Đổi trả trong 7 ngày</h4>
              <p>Hàng lỗi đổi trả miễn phí</p>
            </div>
          </div>
          <div className="service-card">
            <div className="service-icon">🔒</div>
            <div className="service-info">
              <h4>Thanh toán an toàn</h4>
              <p>COD, chuyển khoản, ví điện tử</p>
            </div>
          </div>
          <div className="service-card">
            <div className="service-icon">⭐</div>
            <div className="service-info">
              <h4>Hàng chính hãng 100%</h4>
              <p>Có giấy tờ chứng minh nguồn gốc</p>
            </div>
          </div>
          <div className="service-card">
            <div className="service-icon">🎁</div>
            <div className="service-info">
              <h4>Quà tặng hấp dẫn</h4>
              <p>Tặng kèm phụ kiện cho đơn lớn</p>
            </div>
          </div>
        </div>
      </div>

      {/* Hot Deals Section */}
      <section className="home-hot-deals">
        <div className="home-section-header">
          <h2 className="home-section-title">🔥 DEAL HOT</h2>
          <button className="home-view-all-btn" onClick={() => navigate("/figures")}>
            Xem tất cả
          </button>
        </div>
        
        <div className="home-products-grid">
          {figures.slice(0, 4).map((figure, index) => (
            <div className="home-product-card" key={figure.id} onClick={() => handleViewDetail(figure)}>
              {figure.discount > 0 && (
                <div className="home-product-badge discount">-{figure.discount}%</div>
              )}
              {figure.isNew && (
                <div className="home-product-badge new">MỚI</div>
              )}
              
              <div className="home-product-image">
                <img 
                  src={figure.imageUrl} 
                  alt={figure.name}
                  onError={(e) => handleImageError(e, index)}
                  loading="lazy"
                />
              </div>
              
              <div className="home-product-info">
                <div className="home-product-series-tag">{figure.series || "Various Series"}</div>
                <h3 className="home-product-name">{figure.name}</h3>
                
                <div className="home-product-specs">
                  <span className="home-product-scale-tag">{figure.scale || "Scale 1/7"}</span>
                  <span className="home-product-manufacturer-tag">{figure.manufacturer || "Good Smile Company"}</span>
                </div>
                
                <div className="home-product-rating">
                  <span className="stars">★★★★★</span>
                  <span className="sold-count">Đã bán {figure.soldCount}</span>
                </div>
                
                <div className="home-product-pricing">
                  {figure.discount > 0 ? (
                    <>
                      <span className="home-original-price">
                        {figure.originalPrice.toLocaleString()}₫
                      </span>
                      <span className="home-current-price">
                        {figure.price.toLocaleString()}₫
                      </span>
                    </>
                  ) : (
                    <span className="home-current-price">
                      {figure.price.toLocaleString()}₫
                    </span>
                  )}
                </div>
                
                <div className="home-product-actions" onClick={(e) => e.stopPropagation()}>
                  <button 
                    className="home-btn-buynow"
                    onClick={() => handleBuyNow(figure)}
                  >
                    ⚡ Mua ngay
                  </button>
                  <button 
                    className="home-btn-cart"
                    onClick={() => handleAddToCart(figure)}
                    disabled={addingToCart}
                    title="Thêm vào giỏ hàng"
                  >
                    {addingToCart ? (
                      <span className="spinner-small"></span>
                    ) : (
                      <FaShoppingCart />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Flash Sale Section */}
      <section className="flash-sale-section">
        <div className="home-section-header">
          <h2 className="home-section-title">⚡ FLASH SALE</h2>
          <div className="flash-sale-timer">
            <span>Kết thúc sau: </span>
            <span className="timer">{flashSaleTimeLeft}</span>
          </div>
        </div>
        
        <div className="home-products-grid">
          {flashSales.length === 0 ? (
            <div className="no-flash-sales" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 20px', color: '#64748b', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚡</div>
              <p style={{ fontWeight: '600' }}>Hiện tại không có chương trình Flash Sale nào đang diễn ra.</p>
              <p style={{ fontSize: '13px', marginTop: '6px' }}>Vui lòng quay lại sau hoặc xem các sản phẩm khuyến mãi khác của shop.</p>
            </div>
          ) : (
            flashSales.slice(0, 4).map((sale, index) => {
              const figure = sale.figure;
              if (!figure) return null;
              
              const imageUrl = getImageUrl(figure.image || figure.imageUrl) || getPlaceholderImage(index);
              const soldCount = sale.soldCount || 0;
              const limitQty = sale.quantity || 10;
              const progressPercent = limitQty > 0 ? Math.round((soldCount / limitQty) * 100) : 0;
              
              return (
                <div 
                  className="home-product-card flash-sale" 
                  key={`flash-${sale.id}`} 
                  onClick={() => navigate(`/product/${figure.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  {sale.discountPercent > 0 && (
                    <div className="home-product-badge discount">-{sale.discountPercent}%</div>
                  )}
                  
                  <div className="home-product-image">
                    <img 
                      src={imageUrl} 
                      alt={figure.name}
                      onError={(e) => {
                        e.target.src = getPlaceholderImage(index);
                        e.target.onerror = null;
                      }}
                      loading="lazy"
                    />
                  </div>
                  
                  <div className="home-product-info">
                    <div className="home-product-series-tag">{figure.series || "Various Series"}</div>
                    <h3 className="home-product-name">{figure.name}</h3>
                    
                    <div className="home-product-specs">
                      <span className="home-product-scale-tag">{figure.scale || "Scale 1/7"}</span>
                      <span className="home-product-manufacturer-tag">{figure.manufacturer || "Good Smile Company"}</span>
                    </div>
                    
                    <div className="home-product-rating">
                      <span className="stars">★★★★★</span>
                      <span className="sold-count">Đã bán {soldCount} / {limitQty}</span>
                    </div>
                    
                    <div className="home-product-pricing">
                      <span className="home-current-price flash-price">
                        {sale.salePrice.toLocaleString()}₫
                      </span>
                      <span className="home-original-price">
                        {(figure.originalPrice || figure.price || sale.salePrice).toLocaleString()}₫
                      </span>
                    </div>
                    
                    <div className="flash-progress">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${Math.min(100, progressPercent)}%` }}></div>
                      </div>
                      <span className="sold-percent">Đã bán {Math.min(100, progressPercent)}%</span>
                    </div>
                    
                    <div className="home-product-actions" onClick={(e) => e.stopPropagation()}>
                      <button 
                        className="home-btn-buynow flash-btn"
                        onClick={() => {
                          const checkoutItem = {
                            figureId: figure.id,
                            name: figure.name,
                            price: sale.salePrice,
                            originalPrice: figure.originalPrice || figure.price,
                            quantity: 1,
                            image: getImageUrl(figure.image || figure.imageUrl),
                            series: figure.series,
                            fromBuyNow: true
                          };
                          sessionStorage.setItem('buyNowItem', JSON.stringify(checkoutItem));
                          navigate("/checkout", {
                            state: {
                              items: [checkoutItem],
                              fromProduct: true,
                              buyNow: true
                            }
                          });
                        }}
                        disabled={figure.quantity <= 0 || (limitQty - soldCount) <= 0}
                      >
                        ⚡ Mua ngay
                      </button>
                      <button 
                        className="home-btn-cart"
                        onClick={async () => {
                          try {
                            const token = localStorage.getItem("token");
                            if (!token) {
                              alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng");
                              navigate("/login");
                              return;
                            }
                            setAddingToCart(true);
                            const response = await axiosClient.post("/cart/add", {
                              productId: figure.id,
                              quantity: 1
                            });
                            if (response.data.success) {
                              alert(`✅ Đã thêm ${figure.name} vào giỏ hàng!`);
                              fetchCartCount();
                            } else {
                              alert("❌ " + (response.data.message || "Không thể thêm vào giỏ hàng"));
                            }
                          } catch (err) {
                            console.error(err);
                            alert("❌ Lỗi kết nối khi thêm vào giỏ hàng");
                          } finally {
                            setAddingToCart(false);
                          }
                        }}
                        disabled={addingToCart || figure.quantity <= 0 || (limitQty - soldCount) <= 0}
                        title="Thêm vào giỏ hàng"
                      >
                        {addingToCart ? (
                          <span className="spinner-small"></span>
                        ) : (
                          <FaShoppingCart />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Category Banners */}
      <div className="home-category-banners">
        <div className="home-category-banner large">
          <div className="home-category-banner-content">
            <h2>GIẢM GIÁ LÊN ĐẾN 50%</h2>
            <p>Chỉ trong tháng này - Số lượng có hạn</p>
            <button 
              className="home-banner-btn" 
              onClick={() => navigate("/figures")}
            >
              MUA NGAY
            </button>
          </div>
        </div>
        
        <div className="home-category-banner-group">
          <div 
            className="home-category-banner small"
            onClick={() => handleCategoryClick("Genshin Impact")}
          >
            <div className="home-category-banner-content">
              <h3>Genshin Impact</h3>
              <p>Figure cao cấp</p>
              <button 
                className="banner-small-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCategoryClick("Genshin Impact");
                }}
              >
                XEM SẢN PHẨM
              </button>
            </div>
          </div>
          <div 
            className="home-category-banner small"
            onClick={() => handleCategoryClick("honkai")}
          >
            <div className="home-category-banner-content">
              <h3>Honkai Series</h3>
              <p>Mô hình Valkyrie</p>
              <button 
                className="banner-small-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCategoryClick("honkai");
                }}
              >
                XEM SẢN PHẨM
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* New Arrivals */}
      <section className="home-new-arrivals">
        <div className="home-section-header">
          <h2 className="home-section-title">🆕 SẢN PHẨM MỚI</h2>
          <button className="home-view-all-btn" onClick={() => navigate("/figures")}>
            Xem tất cả
          </button>
        </div>
        
        <div className="home-products-grid">
          {(newArrivals.length > 0 ? newArrivals : figures.slice(4, 8)).slice(0, 4).map((figure, index) => (
            <div className="home-product-card" key={`new-${figure.id}`} onClick={() => handleViewDetail(figure)}>
              {figure.isNew && (
                <div className="home-product-badge new">MỚI</div>
              )}
              
              <div className="home-product-image">
                <img 
                  src={figure.imageUrl} 
                  alt={figure.name}
                  onError={(e) => handleImageError(e, index + 4)}
                  loading="lazy"
                />
              </div>
              
              <div className="home-product-info">
                <div className="home-product-series-tag">{figure.series || "Various Series"}</div>
                <h3 className="home-product-name">{figure.name}</h3>
                
                <div className="home-product-specs">
                  <span className="home-product-scale-tag">{figure.scale || "Scale 1/7"}</span>
                  <span className="home-product-manufacturer-tag">{figure.manufacturer || "Good Smile Company"}</span>
                </div>
                
                <div className="home-product-rating">
                  <span className="stars">★★★★★</span>
                  <span className="sold-count">Đã bán {figure.soldCount}</span>
                </div>
                
                <div className="home-product-pricing">
                  {figure.discount > 0 ? (
                    <>
                      <span className="home-original-price">
                        {figure.originalPrice.toLocaleString()}₫
                      </span>
                      <span className="home-current-price">
                        {figure.price.toLocaleString()}₫
                      </span>
                    </>
                  ) : (
                    <span className="home-current-price">
                      {figure.price.toLocaleString()}₫
                    </span>
                  )}
                </div>
                
                <div className="home-product-actions" onClick={(e) => e.stopPropagation()}>
                  <button 
                    className="home-btn-buynow"
                    onClick={() => handleBuyNow(figure)}
                  >
                    ⚡ Mua ngay
                  </button>
                  <button 
                    className="home-btn-cart"
                    onClick={() => handleAddToCart(figure)}
                    disabled={addingToCart}
                    title="Thêm vào giỏ hàng"
                  >
                    {addingToCart ? (
                      <span className="spinner-small"></span>
                    ) : (
                      <FaShoppingCart />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Categories */}
      <section className="home-popular-categories">
        <div className="home-section-header">
          <h2 className="home-section-title">DANH MỤC PHỔ BIẾN</h2>
        </div>
        
        <div className="home-categories-grid">
          <div 
            className="home-category-card" 
            style={{backgroundImage: `url(${placeholderImages[0]})`}}
            onClick={() => handleCategoryClick("Genshin Impact")}
          >
            <div className="home-category-info">
              <h3>Genshin Impact</h3>
              <p>{figures.filter(f => f.series === "Genshin Impact" || (f.category?.name || f.category) === "Genshin Impact").length || 15} sản phẩm</p>
              <button 
                className="category-card-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCategoryClick("Genshin Impact");
                }}
              >
                XEM NGAY
              </button>
            </div>
          </div>
          
          <div 
            className="home-category-card" 
            style={{backgroundImage: `url(${placeholderImages[1]})`}}
            onClick={() => handleCategoryClick("honkai")}
          >
            <div className="home-category-info">
              <h3>Honkai Series</h3>
              <p>{figures.filter(f => f.series?.toLowerCase() === "honkai" || (f.category?.name || f.category)?.toLowerCase() === "honkai").length || 8} sản phẩm</p>
              <button 
                className="category-card-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCategoryClick("honkai");
                }}
              >
                XEM NGAY
              </button>
            </div>
          </div>
          
          <div 
            className="home-category-card" 
            style={{backgroundImage: `url(${placeholderImages[2]})`}}
            onClick={() => handleCategoryClick("Anime")}
          >
            <div className="home-category-info">
              <h3>Anime Figures</h3>
              <p>{figures.filter(f => f.category === "Anime").length || 45} sản phẩm</p>
              <button 
                className="category-card-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCategoryClick("Anime");
                }}
              >
                XEM NGAY
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Branch Section */}
      <BranchSection />

      {/* Footer */}
      <footer className="home-footer">
        <div className="home-footer-top">
          <div className="home-footer-section">
            <h3>FIGURE STORE</h3>
            <p>Chuyên cung cấp mô hình anime, game figure chính hãng với chất lượng cao cấp.</p>
            <div className="home-social-icons">
              <div className="home-social-icon">f</div>
              <div className="home-social-icon">in</div>
              <div className="home-social-icon">ig</div>
              <div className="home-social-icon">yt</div>
            </div>
          </div>
          
          <div className="home-footer-section">
            <h4>DANH MỤC</h4>
            <ul>
              <li onClick={() => navigate("/figures")}>Tất cả sản phẩm</li>
              <li onClick={() => handleCategoryClick("Genshin Impact")}>Genshin Impact</li>
              <li onClick={() => handleCategoryClick("honkai")}>Honkai Series</li>
              <li onClick={() => handleCategoryClick("Anime")}>Anime Figures</li>
            </ul>
          </div>
          
          <div className="home-footer-section">
            <h4>HỖ TRỢ</h4>
            <ul>
              <li onClick={handleViewCart}>🛒 Giỏ hàng ({cartCount})</li>
              <li onClick={handleCheckout}>⚡ Thanh toán</li>
              <li onClick={() => navigate("/orders")}>📦 Theo dõi đơn hàng</li>
              <li onClick={() => navigate("/policies")}>📜 Chính sách</li>
              <li onClick={() => navigate("/faq")}>❓ FAQ</li>
            </ul>
          </div>
          
          <div className="home-footer-section">
            <h4>LIÊN HỆ</h4>
            <p>🏠 123 Đường ABC, Quận 1, TP.HCM</p>
            <p>📞 1900 1234</p>
            <p>✉️ info@figurestore.com</p>
          </div>
        </div>
        
        <div className="home-footer-bottom">
          <p>© 2024 FIGURE STORE. Tất cả các quyền được bảo lưu.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;