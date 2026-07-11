import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  FaSearch, FaShoppingCart, FaUser, FaBars, FaTimes, 
  FaTachometerAlt, FaStore, FaInfoCircle, FaEnvelope, 
  FaExchangeAlt, FaNewspaper, FaHome, FaBox, FaGift, 
  FaQuestionCircle, FaFileAlt, FaHeart, FaAddressBook,
  FaClipboardList, FaTag, FaBlog, FaPhoneAlt, FaFire, FaClock,
  FaCrown, FaUserCircle, FaSignOutAlt, FaSignInAlt, FaUserPlus,
  FaStar, FaThLarge, FaPercent, FaShieldAlt, FaHeadset,
  FaGamepad, FaRobot, FaDragon, FaChessQueen, FaBell
} from "react-icons/fa";
import axiosClient from "../api/axiosClient";
import { useCategory } from "../contexts/CategoryContext";
import "../styles/header.css";

function Header({ isAuthenticated, user, updateAuthStatus, onLogout }) {
  const { refreshTrigger } = useCategory();
  const [categories, setCategories] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownActive, setDropdownActive] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosClient.get("/categories");
        setCategories(response.data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, [refreshTrigger]);

  const getCategoryIcon = (name) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("game")) return <FaGamepad />;
    if (lowerName.includes("gundam") || lowerName.includes("mecha") || lowerName.includes("robot")) return <FaRobot />;
    if (lowerName.includes("kpop") || lowerName.includes("idol")) return <FaChessQueen />;
    return <FaBox />;
  };

  const isAdmin = user?.roles?.includes("ROLE_ADMIN");

  useEffect(() => {
    if (isAuthenticated) {
      fetchCartCount();
      fetchUnreadCount();
    } else {
      setCartCount(0);
      setUnreadCount(0);
    }
  }, [isAuthenticated, location.pathname]);

  useEffect(() => {
    if (isAuthenticated) {
      const handleNewNotification = () => {
        fetchUnreadCount();
      };
      window.addEventListener('new-notification', handleNewNotification);
      return () => {
        window.removeEventListener('new-notification', handleNewNotification);
      };
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlKeyword = params.get("keyword");
    if (urlKeyword) {
      setKeyword(decodeURIComponent(urlKeyword));
    } else {
      setKeyword("");
    }
  }, [location.search]);

  const fetchCartCount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setCartCount(0);
        return;
      }
      const response = await axiosClient.get("/cart/count");
      setCartCount(response.data.count || 0);
    } catch (error) {
      setCartCount(0);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUnreadCount(0);
        return;
      }
      const response = await axiosClient.get("/notifications/count");
      setUnreadCount(response.data.total || response.data.count || 0);
    } catch (error) {
      setUnreadCount(0);
    }
  };

  const search = () => {
    if (keyword.trim()) {
      navigate(`/figures?keyword=${encodeURIComponent(keyword.trim())}`);
    } else {
      navigate("/figures");
    }
    setMobileMenuOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      search();
    }
  };

  const handleLogin = () => {
    navigate("/login");
    setMobileMenuOpen(false);
  };

  const handleRegister = () => {
    navigate("/register");
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    if (onLogout) onLogout();
    setCartCount(0);
    navigate("/");
    setMobileMenuOpen(false);
  };

  const handleCartClick = () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/cart" } });
      return;
    }
    navigate("/cart");
    setMobileMenuOpen(false);
  };

  const handleNavigate = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
    setDropdownActive(null);
  };



  const handleCategoryClick = (category) => {
    navigate(`/figures?category=${encodeURIComponent(category)}`);
    setMobileMenuOpen(false);
    setDropdownActive(null);
  };

  const toggleDropdown = (name) => {
    setDropdownActive(dropdownActive === name ? null : name);
  };

  return (
    <header className="header">
      {/* ===== TOP BAR ===== */}
      <div className="header-top">
        {/* Logo */}
        <div className="logo-container" onClick={() => handleNavigate("/")}>
          <div className="logo-icon">🎯</div>
          <div className="logo-text">
            <h1>FIGURE <span>STORE</span></h1>
            <p>Mô Hình Chính Hãng</p>
          </div>
        </div>

        {/* Search Bar - Desktop */}
        <div className="search-container">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm (Genshin, Gundam, Honkai...)"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="search-btn" onClick={search}>
              <FaSearch />
            </button>
          </div>
        </div>

        {/* User Actions - Desktop */}
        <div className="user-actions">
          {isAuthenticated ? (
            <div className="user-profile">
              <div className="user-info">
                <FaUserCircle />
                <span className="user-name">{user?.username || user?.name || "User"}</span>
                {isAdmin && <span className="admin-badge">ADMIN</span>}
              </div>
              <div className="user-dropdown">
                <button onClick={() => handleNavigate("/profile")}>
                  <FaUser /> Tài khoản của tôi
                </button>
                <button onClick={() => handleNavigate("/orders")}>
                  <FaClipboardList /> Lịch sử đơn hàng
                </button>
                <button onClick={() => handleNavigate("/addresses")}>
                  <FaAddressBook /> Sổ địa chỉ
                </button>
                <button onClick={() => handleNavigate("/wishlist")}>
                  <FaHeart /> Sản phẩm yêu thích
                </button>
                <button onClick={() => handleNavigate("/notifications")}>
                  <FaBell /> Thông báo của tôi
                </button>
                {isAdmin && (
                  <button onClick={() => handleNavigate("/admin")} className="admin-btn">
                    <FaTachometerAlt /> Quản trị hệ thống
                  </button>
                )}
                <button onClick={handleLogout}>
                  <FaSignOutAlt /> Đăng xuất
                </button>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <button className="login-btn" onClick={handleLogin}>
                <FaSignInAlt /> <span>Đăng nhập</span>
              </button>
              <button className="register-btn" onClick={handleRegister}>
                <FaUserPlus /> <span>Đăng ký</span>
              </button>
            </div>
          )}

          {isAuthenticated && (
            <div className="cart-container" style={{ marginRight: '10px' }}>
              <button className="cart-btn" onClick={() => handleNavigate("/notifications")} title="Thông báo">
                <FaBell />
                {unreadCount > 0 && (
                  <span className="cart-badge" style={{ background: '#ff4d4f' }}>{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
              </button>
            </div>
          )}

          <div className="cart-container">
            <button className="cart-btn" onClick={handleCartClick} title="Giỏ hàng">
              <FaShoppingCart />
              {isAuthenticated && cartCount > 0 && (
                <span className="cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>
              )}
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className={`mobile-toggle ${mobileMenuOpen ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* ===== MAIN NAVIGATION ===== */}
      <nav className={`main-nav ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="nav-container">
          <div className="nav-categories">
            {/* Trang chủ */}
            <button 
              className={`nav-btn ${location.pathname === "/" ? "active" : ""}`}
              onClick={() => handleNavigate("/")}
              title="Trang chủ"
            >
              <FaHome /> <span className="nav-text">Trang chủ</span>
            </button>

            {/* Tất cả sản phẩm */}
            <button 
              className={`nav-btn ${location.pathname === "/figures" ? "active" : ""}`}
              onClick={() => handleNavigate("/figures")}
              title="Tất cả sản phẩm"
            >
              <FaBox /> <span className="nav-text">Sản phẩm</span>
            </button>



            {/* Dropdown Danh mục */}
            <div className={`dropdown ${dropdownActive === 'category' ? 'active' : ''}`}>
              <button className="nav-btn dropdown-toggle" onClick={() => toggleDropdown('category')} title="Danh mục">
                <FaThLarge /> <span className="nav-text">Danh mục</span>
              </button>
              <div className="dropdown-menu">
                {categories.map(category => (
                  <button key={category.id} onClick={() => handleCategoryClick(category.name)}>
                    {getCategoryIcon(category.name)} {category.name}
                  </button>
                ))}
                {categories.length === 0 && (
                  <span className="dropdown-empty" style={{ display: 'block', padding: '8px 12px', fontSize: '11px', color: '#94a3b8' }}>
                    Không có danh mục
                  </span>
                )}
              </div>
            </div>

            {/* 👉 FLASH SALE - ĐÃ CÓ */}
            <button 
              className={`nav-btn ${location.pathname === "/flash-sale" ? "active" : ""}`}
              onClick={() => handleNavigate("/flash-sale")}
              title="Flash Sale"
            >
              <FaFire /> <span className="nav-text">Flash Sale</span>
            </button>

            {/* Khuyến mãi */}
            <button 
              className={`nav-btn ${location.pathname === "/promotions" ? "active" : ""}`}
              onClick={() => handleNavigate("/promotions")}
              title="Khuyến mãi"
            >
              <FaPercent /> <span className="nav-text">Khuyến mãi</span>
            </button>



            {/* Chi nhánh */}
            <button 
              className={`nav-btn ${location.pathname === "/branches" ? "active" : ""}`}
              onClick={() => handleNavigate("/branches")}
              title="Chi nhánh"
            >
              <FaStore /> <span className="nav-text">Chi nhánh</span>
            </button>

            {/* Blog */}
            <button 
              className={`nav-btn ${location.pathname === "/blog" ? "active" : ""}`}
              onClick={() => handleNavigate("/blog")}
              title="Blog"
            >
              <FaBlog /> <span className="nav-text">Blog</span>
            </button>

            {/* ===== MOBILE MENU EXTRA ===== */}
            {/* Mobile Search */}
            <div className="mobile-search">
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <button className="search-btn" onClick={search}>
                  <FaSearch />
                </button>
              </div>
            </div>

            {/* Mobile Cart */}
            <div className="mobile-cart">
              <button className="cart-btn-mobile" onClick={handleCartClick}>
                <FaShoppingCart />
                {isAuthenticated && cartCount > 0 && (
                  <span className="cart-badge-mobile">{cartCount > 99 ? '99+' : cartCount}</span>
                )}
                <span>Giỏ hàng ({cartCount})</span>
              </button>
            </div>

            {/* Mobile User Menu - Đã đăng nhập */}
            {isAuthenticated ? (
              <div className="mobile-user-menu">
                <div className="user-info-mobile">
                  <FaUserCircle />
                  <span className="user-name">{user?.username || user?.name || "User"}</span>
                  {isAdmin && <span className="admin-badge-mobile">ADMIN</span>}
                </div>
                <button className="nav-btn" onClick={() => handleNavigate("/profile")}>
                  <FaUser /> Tài khoản của tôi
                </button>
                <button className="nav-btn" onClick={() => handleNavigate("/orders")}>
                  <FaClipboardList /> Lịch sử đơn hàng
                </button>
                <button className="nav-btn" onClick={() => handleNavigate("/addresses")}>
                  <FaAddressBook /> Sổ địa chỉ
                </button>
                <button className="nav-btn" onClick={() => handleNavigate("/wishlist")}>
                  <FaHeart /> Sản phẩm yêu thích
                </button>
                <button className="nav-btn" onClick={() => handleNavigate("/notifications")}>
                  <FaBell /> Thông báo của tôi
                </button>
                {isAdmin && (
                  <button className="nav-btn admin-nav-btn" onClick={() => handleNavigate("/admin")}>
                    <FaTachometerAlt /> Quản trị hệ thống
                  </button>
                )}
                <button className="nav-btn logout-btn" onClick={handleLogout}>
                  <FaSignOutAlt /> Đăng xuất
                </button>
              </div>
            ) : (
              /* Mobile Auth - Chưa đăng nhập */
              <div className="mobile-auth-buttons">
                <button className="nav-btn" onClick={handleLogin}>
                  <FaSignInAlt /> Đăng nhập
                </button>
                <button className="nav-btn" onClick={handleRegister}>
                  <FaUserPlus /> Đăng ký
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;