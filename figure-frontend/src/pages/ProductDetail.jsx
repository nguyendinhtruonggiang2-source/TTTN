import { useEffect, useState } from "react";
import { FaExchangeAlt, FaEye, FaHeart, FaRegHeart, FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";
import axiosClient, { getImageUrl } from "../api/axiosClient";
import ProductReviews from "./ProductReviews";
import "../styles/product.css";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [figure, setFigure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [relatedFigures, setRelatedFigures] = useState([]);
  const [randomFigures, setRandomFigures] = useState([]);
  const [showMoreDescription, setShowMoreDescription] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);
  const [reviewStats, setReviewStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [selectedImage, setSelectedImage] = useState("");
  const isAuthenticated = !!localStorage.getItem("token");

  useEffect(() => {
    fetchFigure();
    fetchRelatedFigures();
    fetchRandomFigures();
    fetchReviewStats();
  }, [id]);

  // Kiểm tra wishlist khi load sản phẩm
  useEffect(() => {
    if (figure && isAuthenticated) {
      checkWishlistStatus();
    }
  }, [figure]);

  const fetchFigure = async () => {
    try {
      setLoading(true);
      setError("");
      
      console.log(`🔍 Fetching figure with ID: ${id}`);
      
      const response = await axiosClient.get(`/figures/${id}`);
      
      console.log("✅ Figure data received:", response.data);
      
      const figureData = {
        ...response.data,
        id: response.data.id || id,
        quantity: (response.data.quantity && response.data.quantity > 0) 
          ? response.data.quantity 
          : 100,
        price: response.data.price || 0,
        originalPrice: response.data.originalPrice || response.data.price || 0,
        image: getImageUrl(response.data.image || response.data.imageUrl),
        series: response.data.series || "Không rõ series",
        manufacturer: response.data.manufacturer || "Không rõ nhà sản xuất",
        type: response.data.type || "Figure",
        scale: response.data.scale || "1/8",
        releaseDate: response.data.releaseDate || new Date().toISOString().split('T')[0],
        description: response.data.description || "Chưa có mô tả chi tiết cho sản phẩm này.",
        category: response.data.category || "Anime",
        isNew: response.data.isNew || false,
        discount: response.data.discount || 0,
        name: response.data.name || `Figure ${id}`,
        branch: response.data.branch || null,
        branchName: response.data.branch?.name || response.data.branchName || "Chưa phân bổ",
        branchAddress: response.data.branch?.address || response.data.branchAddress || "",
        branchPhone: response.data.branch?.phone || response.data.branchPhone || "",
        imagesList: response.data.imagesList || "",
        videoUrl: response.data.videoUrl || ""
      };
      
      if (figureData.discount > 0 && figureData.originalPrice > 0) {
        figureData.price = figureData.originalPrice * (1 - figureData.discount / 100);
      }
      
      // Check for active flash sale
      try {
        const fsRes = await axiosClient.get(`/flash-sale/figure/${figureData.id}`);
        const flashSale = fsRes.data || fsRes;
        if (flashSale && flashSale.salePrice) {
          console.log("⚡ Active flash sale found for figure:", flashSale);
          figureData.originalPrice = figureData.price || figureData.originalPrice;
          figureData.price = flashSale.salePrice;
          figureData.isFlashSale = true;
          figureData.flashSale = flashSale;
        }
      } catch (e) {
        console.error("Error fetching flash sale for details:", e);
      }
      
      setFigure(figureData);
      setSelectedImage(figureData.image);
      console.log("✅ Processed figure data:", figureData);
      
    } catch (err) {
      console.error("❌ Error fetching figure:", err);
      
      if (err.response?.status === 404) {
        setError("Không tìm thấy sản phẩm");
      } else if (err.response?.status === 500) {
        setError("Lỗi server. Vui lòng thử lại sau");
      } else if (err.code === 'ERR_NETWORK') {
        setError("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.");
      } else {
        setError("Đã xảy ra lỗi. Vui lòng thử lại");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedFigures = async () => {
    try {
      if (!figure?.series) return;
      
      const response = await axiosClient.get(`/figures/search?keyword=${figure.series}`);
      const filtered = response.data
        .filter(f => f.id != id)
        .slice(0, 4)
        .map(f => ({
          ...f,
          quantity: f.quantity > 0 ? f.quantity : 50,
          image: getImageUrl(f.image || f.imageUrl)
        }));
      
      setRelatedFigures(filtered);
    } catch (err) {
      console.error("❌ Error fetching related figures:", err);
    }
  };

  const fetchRandomFigures = async () => {
    try {
      const response = await axiosClient.get("/figures");
      let allFigures = response.data || [];
      
      allFigures = allFigures.filter(f => f.id != id);
      
      for (let i = allFigures.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allFigures[i], allFigures[j]] = [allFigures[j], allFigures[i]];
      }
      
      const random = allFigures.slice(0, 8).map(f => ({
        ...f,
        quantity: f.quantity > 0 ? f.quantity : 50,
        image: getImageUrl(f.image || f.imageUrl)
      }));
      
      setRandomFigures(random);
    } catch (err) {
      console.error("❌ Error fetching random figures:", err);
    }
  };

  // 👉 Lấy thống kê đánh giá
  const fetchReviewStats = async () => {
    try {
      const response = await axiosClient.get(`/reviews/figure/${id}/stats`);
      setReviewStats(response.data);
    } catch (error) {
      console.error("Error fetching review stats:", error);
    }
  };

  const checkWishlistStatus = async () => {
    try {
      const response = await axiosClient.get(`/wishlist/check/${figure.id}`);
      setIsInWishlist(response.data.inWishlist);
    } catch (error) {
      console.error("Error checking wishlist status:", error);
      setIsInWishlist(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      alert("💡 Vui lòng đăng nhập để thêm vào danh sách yêu thích");
      navigate("/login", { 
        state: { from: `/product/${id}` } 
      });
      return;
    }
    
    setTogglingWishlist(true);
    
    try {
      if (isInWishlist) {
        await axiosClient.delete(`/wishlist/remove/${figure.id}`);
        setIsInWishlist(false);
        alert("✅ Đã xóa khỏi danh sách yêu thích");
      } else {
        await axiosClient.post(`/wishlist/add/${figure.id}`);
        setIsInWishlist(true);
        alert("❤️ Đã thêm vào danh sách yêu thích");
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      alert(error.response?.data?.error || "Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setTogglingWishlist(false);
    }
  };

  const handleAddToCompare = () => {
    const savedCompare = localStorage.getItem('compareProducts');
    let compareIds = savedCompare ? JSON.parse(savedCompare) : [];
    
    if (compareIds.includes(figure.id)) {
      alert('⚠️ Sản phẩm này đã có trong danh sách so sánh');
      return;
    }
    
    if (compareIds.length >= 4) {
      alert('⚠️ Chỉ có thể so sánh tối đa 4 sản phẩm cùng lúc');
      return;
    }
    
    compareIds.push(figure.id);
    localStorage.setItem('compareProducts', JSON.stringify(compareIds));
    alert('✅ Đã thêm sản phẩm vào danh sách so sánh');
  };

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);
      
      if (!figure || figure.quantity <= 0) {
        alert("❌ Sản phẩm đã hết hàng");
        return;
      }
      
      if (quantity > figure.quantity) {
        alert(`❌ Số lượng vượt quá tồn kho. Chỉ còn ${figure.quantity} sản phẩm`);
        setQuantity(figure.quantity);
        return;
      }
      
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      
      if (!token || !user) {
        navigate("/login", { 
          state: { 
            from: `/product/${id}`,
            message: "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng",
            productId: figure.id,
            productName: figure.name
          } 
        });
        return;
      }
      
      const cartItem = {
        productId: figure.id,
        quantity: quantity
      };
      
      const response = await axiosClient.post("/cart/add", cartItem);
      
      if (response.data.success) {
        alert(`✅ Đã thêm ${figure.name} vào giỏ hàng!`);
      } else {
        alert("❌ " + (response.data.message || "Không thể thêm vào giỏ hàng"));
      }
    } catch (err) {
      console.error("❌ Error adding to cart:", err);
      
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        alert("⚠️ Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        navigate("/login");
      } else {
        alert("❌ Lỗi: " + (err.response?.data?.message || "Vui lòng thử lại"));
      }
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    if (!figure) return;
    
    if (figure.quantity <= 0) {
      alert("❌ Sản phẩm đã hết hàng");
      return;
    }
    
    if (quantity > figure.quantity) {
      alert(`❌ Số lượng vượt quá tồn kho. Chỉ còn ${figure.quantity} sản phẩm`);
      setQuantity(figure.quantity);
      return;
    }
    
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    
    if (!token || !user) {
      navigate("/login", { 
        state: { 
          from: `/product/${id}`,
          message: "Vui lòng đăng nhập để mua sản phẩm",
          productId: figure.id,
          productName: figure.name,
          quantity: quantity,
          buyNow: true
        } 
      });
      return;
    }
    
    const checkoutItem = {
      figureId: figure.id,
      name: figure.name,
      price: figure.price,
      originalPrice: figure.originalPrice,
      quantity: quantity,
      image: figure.image,
      series: figure.series,
      fromBuyNow: true
    };
    
    sessionStorage.setItem('buyNowItem', JSON.stringify(checkoutItem));
    
    navigate("/checkout", {
      state: {
        items: [{
          figureId: figure.id,
          name: figure.name,
          price: figure.price,
          originalPrice: figure.originalPrice,
          quantity: quantity,
          image: figure.image,
          series: figure.series
        }],
        fromProduct: true,
        buyNow: true
      }
    });
  };

  const handleShare = () => {
    const url = window.location.href;
    const text = `Check out this awesome figure: ${figure.name}`;
    
    if (navigator.share) {
      navigator.share({
        title: figure.name,
        text: text,
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert("✅ Đã sao chép link sản phẩm vào clipboard!");
    }
  };

  // 👉 Render stars dựa trên rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="star filled" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="star half" />);
      } else {
        stars.push(<FaRegStar key={i} className="star empty" />);
      }
    }
    return stars;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Không có";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch {
      return "Không có";
    }
  };

  if (loading) {
    return (
      <div className="product-detail-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Đang tải thông tin sản phẩm...</p>
          <button 
            onClick={() => navigate("/figures")}
            className="btn-back"
          >
            ← Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-detail-container">
        <div className="error-message">
          <h3>{error}</h3>
          <div className="error-actions">
            <button onClick={() => navigate("/")}>Về trang chủ</button>
            <button onClick={() => navigate("/figures")}>Xem sản phẩm khác</button>
            <button onClick={fetchFigure}>Thử lại</button>
          </div>
        </div>
      </div>
    );
  }

  if (!figure) {
    return (
      <div className="product-detail-container">
        <div className="error-message">
          <h3>Không tìm thấy sản phẩm</h3>
          <p>Sản phẩm bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <div className="error-actions">
            <button onClick={() => navigate("/")}>Về trang chủ</button>
            <button onClick={() => navigate("/figures")}>Xem tất cả sản phẩm</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-container">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/">Trang chủ</Link> &gt; 
        <Link to="/figures">Figure</Link> &gt; 
        {figure.series && <Link to={`/figures?series=${figure.series}`}>{figure.series}</Link>}
        {figure.series && " > "}
        <span className="current">{figure.name}</span>
      </div>

      {/* Product Main Section */}
      <div className="product-detail">
        {/* Product Images & Gallery */}
        <div className="product-images">
          <div className="main-image">
            <img 
              src={selectedImage || figure.image} 
              alt={figure.name}
              onError={(e) => {
                console.warn("❌ Image failed to load, using fallback");
                e.target.src = "/default-figure.jpg";
                e.target.onerror = null;
              }}
            />
            {figure.isNew && (
              <div className="product-badge new">MỚI</div>
            )}
            {figure.discount > 0 && (
              <div className="product-badge discount">-{figure.discount}%</div>
            )}
          </div>

          {/* Gallery thumbnails */}
          {Array.from(new Set([
            figure.image,
            ...(figure.imagesList ? figure.imagesList.split(',').filter(Boolean).map(img => getImageUrl(img)) : [])
          ])).filter(Boolean).length > 1 && (
            <div className="product-gallery-thumbnails">
              {Array.from(new Set([
                figure.image,
                ...(figure.imagesList ? figure.imagesList.split(',').filter(Boolean).map(img => getImageUrl(img)) : [])
              ])).filter(Boolean).map((imgUrl, idx) => (
                <div 
                  key={idx} 
                  className={`thumbnail-item ${selectedImage === imgUrl ? 'active' : ''}`}
                  onClick={() => setSelectedImage(imgUrl)}
                >
                  <img src={imgUrl} alt={`Thumb ${idx}`} />
                </div>
              ))}
            </div>
          )}

          {/* Product Video */}
          {figure.videoUrl && (
            (() => {
              const url = figure.videoUrl;
              const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
              const match = url.match(regExp);
              
              if (match && match[2].length === 11) {
                const youtubeId = match[2];
                return (
                  <div className="product-video-section">
                    <h4>🎥 Video giới thiệu</h4>
                    <div className="product-video-container">
                      <iframe
                        width="100%"
                        height="240"
                        src={`https://www.youtube.com/embed/${youtubeId}`}
                        title="Product Video"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div className="product-video-section">
                    <h4>🎥 Video giới thiệu</h4>
                    <div className="product-video-container">
                      <video width="100%" height="auto" controls>
                        <source src={url.startsWith('http') ? url : getImageUrl(url)} type="video/mp4" />
                        Trình duyệt của bạn không hỗ trợ phát video này.
                      </video>
                    </div>
                  </div>
                );
              }
            })()
          )}
          
          <div className="product-tags">
            {figure.category && (
              <span className="tag category">
                {typeof figure.category === 'object' ? figure.category.name : figure.category}
              </span>
            )}
            {figure.series && (
              <span className="tag series">{figure.series}</span>
            )}
            {figure.manufacturer && (
              <span className="tag manufacturer">{figure.manufacturer}</span>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="product-info">
          <h1 className="product-name">{figure.name}</h1>
          
          {/* 👉 Rating Section - Thêm phần hiển thị đánh giá */}
          <div className="rating-section">
            <div className="rating-stars">
              {renderStars(reviewStats.averageRating || 0)}
              <span className="rating-value">{reviewStats.averageRating?.toFixed(1) || 0}</span>
            </div>
            <Link to={`/product/${id}/reviews`} className="rating-link">
              <FaEye /> Xem {reviewStats.totalReviews || 0} đánh giá
            </Link>
          </div>

          <div className="product-meta">
            {figure.type && (
              <div className="meta-item">
                <span className="meta-label">Loại:</span>
                <span className="meta-value">{figure.type}</span>
              </div>
            )}
            {figure.scale && (
              <div className="meta-item">
                <span className="meta-label">Tỉ lệ:</span>
                <span className="meta-value">{figure.scale}</span>
              </div>
            )}
            {figure.releaseDate && (
              <div className="meta-item">
                <span className="meta-label">Ngày phát hành:</span>
                <span className="meta-value">{formatDate(figure.releaseDate)}</span>
              </div>
            )}
          </div>

          <div className="product-price">
            {figure.isFlashSale ? (
              <>
                <div className="price-original">
                  <del>{figure.originalPrice.toLocaleString()}₫</del>
                  <span className="discount-percent flash-discount" style={{ backgroundColor: '#ff3838', color: 'white', padding: '2px 6px', borderRadius: '4px', marginLeft: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                    ⚡ -{figure.flashSale.discountPercent}% FLASH SALE
                  </span>
                </div>
                <div className="price-current flash-price-current" style={{ color: '#ff3838', fontWeight: '800', fontSize: '28px' }}>
                  {figure.price.toLocaleString()}₫
                </div>
              </>
            ) : figure.discount > 0 && figure.originalPrice > figure.price ? (
              <>
                <div className="price-original">
                  <del>{figure.originalPrice.toLocaleString()}₫</del>
                  <span className="discount-percent">-{figure.discount}%</span>
                </div>
                <div className="price-current">
                  {figure.price.toLocaleString()}₫
                </div>
              </>
            ) : (
              <div className="price-current">
                {figure.price ? figure.price.toLocaleString() + "₫" : "Liên hệ"}
              </div>
            )}
          </div>

          <div className="product-branch-info">
            <div className="branch-title">
              <span className="branch-icon"></span>
              <strong>Chi nhánh phân phối:</strong>
            </div>
            <div className="branch-details">
              <div className="branch-name">{figure.branchName}</div>
              {figure.branchAddress && (
                <div className="branch-address">{figure.branchAddress}</div>
              )}
              {figure.branchPhone && (
                <div className="branch-phone">{figure.branchPhone}</div>
              )}
              <Link to={`/branches/${figure.branch?.id || '#'}`} className="branch-link">
                Xem chi tiết chi nhánh →
              </Link>
            </div>
          </div>

          <div className="product-stock">
            <div className="stock-status in-stock">
              <span className="stock-icon">✓</span>
              <span className="stock-text">
                <strong>Còn {figure.quantity} sản phẩm</strong>
              </span>
            </div>
            <div className="stock-note">
              Giao hàng nhanh trong 2-4 ngày
            </div>
          </div>

          <div className="product-actions">
            <div className="quantity-selector">
              <span className="qty-label">Số lượng:</span>
              <div className="qty-controls">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="qty-btn minus"
                >
                  −
                </button>
                <input 
                  type="number" 
                  value={quantity}
                  min="1"
                  max={figure.quantity}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    setQuantity(Math.max(1, Math.min(figure.quantity, value)));
                  }}
                  className="qty-input"
                />
                <button 
                  onClick={() => setQuantity(q => Math.min(figure.quantity, q + 1))}
                  disabled={quantity >= figure.quantity}
                  className="qty-btn plus"
                >
                  +
                </button>
              </div>
              <span className="qty-max">Tối đa: {figure.quantity}</span>
            </div>

            <div className="action-buttons">
              <button 
                className={`btn-add-to-cart ${addingToCart ? 'loading' : ''}`}
                onClick={handleAddToCart}
                disabled={figure.quantity <= 0 || addingToCart}
              >
                {addingToCart ? (
                  <>
                    <span className="spinner-small"></span> Đang thêm...
                  </>
                ) : (
                  <>
                    Thêm vào giỏ hàng
                  </>
                )}
              </button>
              
              <button 
                className="btn-buy-now"
                onClick={handleBuyNow}
                disabled={figure.quantity <= 0}
              >
                Mua ngay
              </button>
              
              <button 
                className="btn-compare"
                onClick={handleAddToCompare}
                title="Thêm vào danh sách so sánh"
              >
                <FaExchangeAlt /> So sánh
              </button>
              
              <div className="secondary-actions">
                <button 
                  className={`btn-wishlist ${isInWishlist ? 'active' : ''}`}
                  onClick={handleToggleWishlist}
                  disabled={togglingWishlist}
                  title={isInWishlist ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
                >
                  {togglingWishlist ? (
                    <span className="spinner-small"></span>
                  ) : isInWishlist ? (
                    <FaHeart />
                  ) : (
                    <FaRegHeart />
                  )}
                </button>
                <button 
                  className="btn-share"
                  onClick={handleShare}
                  title="Chia sẻ sản phẩm"
                >
                  ↗️
                </button>
              </div>
            </div>

            <div className="guarantee-info">
              <div className="guarantee-item">
                <span className="guarantee-icon">✓</span>
                <span>Hàng chính hãng 100%</span>
              </div>
              <div className="guarantee-item">
                <span className="guarantee-icon">✓</span>
                <span>Đổi trả trong 7 ngày</span>
              </div>
              <div className="guarantee-item">
                <span className="guarantee-icon">✓</span>
                <span>Miễn phí vận chuyển đơn từ 500K</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Description */}
      <div className="product-description">
        <h2>Mô tả sản phẩm</h2>
        <div className="description-content">
          <div className={`description-text ${showMoreDescription ? 'expanded' : ''}`}>
            <p>{figure.description}</p>
          </div>
          {figure.description.length > 300 && (
            <button 
              className="btn-show-more"
              onClick={() => setShowMoreDescription(!showMoreDescription)}
            >
              {showMoreDescription ? 'Thu gọn' : 'Xem thêm'}
            </button>
          )}
          
          <div className="specs">
            <h3>Thông số kỹ thuật</h3>
            <table>
              <tbody>
                <tr>
                  <td><strong>Tên sản phẩm</strong></td>
                  <td>{figure.name}</td>
                </tr>
                {figure.series && (
                  <tr>
                    <td><strong>Series</strong></td>
                    <td>{figure.series}</td>
                  </tr>
                )}
                {figure.manufacturer && (
                  <tr>
                    <td><strong>Nhà sản xuất</strong></td>
                    <td>{figure.manufacturer}</td>
                  </tr>
                )}
                {figure.type && (
                  <tr>
                    <td><strong>Loại</strong></td>
                    <td>{figure.type}</td>
                  </tr>
                )}
                {figure.scale && (
                  <tr>
                    <td><strong>Tỉ lệ</strong></td>
                    <td>{figure.scale}</td>
                  </tr>
                )}
                {figure.releaseDate && (
                  <tr>
                    <td><strong>Ngày phát hành</strong></td>
                    <td>{formatDate(figure.releaseDate)}</td>
                  </tr>
                )}
                <tr>
                  <td><strong>Chi nhánh</strong></td>
                  <td>
                    <span className="branch-info-cell">
                      {figure.branchName}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td><strong>Số lượng còn</strong></td>
                  <td>
                    <span className="text-success">
                      <strong>{figure.quantity} sản phẩm</strong>
                    </span>
                  </td>
                </tr>
                {figure.price > 0 && (
                  <tr>
                    <td><strong>Giá</strong></td>
                    <td className="text-price">
                      <strong>{figure.price.toLocaleString()}₫</strong>
                      {figure.discount > 0 && (
                        <span className="text-discount"> (Giảm {figure.discount}%)</span>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Related Products - Cùng series */}
      {relatedFigures.length > 0 && (
        <div className="related-products">
          <h2>Sản phẩm cùng series</h2>
          <div className="related-list">
            {relatedFigures.map((relatedFigure) => (
              <div key={relatedFigure.id} className="related-card">
                <Link to={`/product/${relatedFigure.id}`}>
                  <div className="related-image">
                    <img 
                      src={getImageUrl(relatedFigure.image)} 
                      alt={relatedFigure.name}
                      onError={(e) => {
                        e.target.src = "/default-figure.jpg";
                        e.target.onerror = null;
                      }}
                    />
                  </div>
                  <div className="related-info">
                    <h4>{relatedFigure.name}</h4>
                    {relatedFigure.series && (
                      <p className="related-series">{relatedFigure.series}</p>
                    )}
                    <div className="related-price">
                      {relatedFigure.price.toLocaleString()}₫
                    </div>
                    <div className="related-stock in-stock">
                      ✓ Còn {relatedFigure.quantity} sản phẩm
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
          <div className="related-actions">
            <Link to={`/figures?series=${figure.series}`}>
              <button className="btn-view-all">
                Xem tất cả sản phẩm {figure.series} →
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Random Products */}
      {randomFigures.length > 0 && (
        <div className="random-products">
          <h2>Gợi ý sản phẩm ngẫu nhiên</h2>
          <div className="random-list">
            {randomFigures.map((randomFigure) => (
              <div key={randomFigure.id} className="random-card">
                <Link to={`/product/${randomFigure.id}`}>
                  <div className="random-image">
                    <img 
                      src={getImageUrl(randomFigure.image)} 
                      alt={randomFigure.name}
                      onError={(e) => {
                        e.target.src = "/default-figure.jpg";
                        e.target.onerror = null;
                      }}
                    />
                    {randomFigure.discount > 0 && (
                      <div className="random-badge discount">-{randomFigure.discount}%</div>
                    )}
                    {randomFigure.isNew && (
                      <div className="random-badge new">Mới</div>
                    )}
                  </div>
                  <div className="random-info">
                    <h4>{randomFigure.name}</h4>
                    {randomFigure.series && (
                      <p className="random-series">{randomFigure.series}</p>
                    )}
                    <div className="random-price">
                      {randomFigure.price.toLocaleString()}₫
                    </div>
                    <div className="random-stock in-stock">
                      ✓ Còn {randomFigure.quantity} sản phẩm
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
          <div className="random-actions">
            <button 
              className="btn-refresh-random"
              onClick={fetchRandomFigures}
            >
              Làm mới gợi ý
            </button>
          </div>
        </div>
      )}

      {/* Product Reviews */}
      <div className="product-detail-reviews-section">
        <h2>Đánh giá từ khách hàng</h2>
        <ProductReviews isEmbedded={true} />
      </div>

      {/* Back to List Button */}
      <div className="back-to-list">
        <button 
          onClick={() => navigate("/figures")}
          className="btn-back-to-list"
        >
          ← Quay lại danh sách sản phẩm
        </button>
      </div>
    </div>
  );
}

export default ProductDetail;