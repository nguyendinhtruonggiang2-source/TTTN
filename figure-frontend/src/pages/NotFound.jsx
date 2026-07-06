import { Link } from "react-router-dom";
import "../styles/notfound.css";
import { FaHome, FaSearch, FaShoppingCart } from "react-icons/fa";

function NotFound() {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <div className="error-code">404</div>
        <h1>Oops! Trang không tìm thấy</h1>
        <p className="error-message">
          Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời không có sẵn.
        </p>
        
        <div className="suggestions">
          <h3>Hãy thử:</h3>
          <ul>
            <li>Kiểm tra lại URL</li>
            <li>Sử dụng thanh tìm kiếm trên trang</li>
            <li>Quay lại trang chủ</li>
          </ul>
        </div>

        <div className="action-buttons">
          <Link to="/" className="home-btn">
            <FaHome /> Trang chủ
          </Link>
          <Link to="/figures" className="products-btn">
            <FaShoppingCart /> Xem sản phẩm
          </Link>
          <button 
            onClick={() => window.history.back()} 
            className="back-btn"
          >
            Quay lại
          </button>
        </div>

        <div className="search-box">
          <h4>Tìm kiếm sản phẩm:</h4>
          <form onSubmit={(e) => {
            e.preventDefault();
            window.location.href = `/?keyword=${e.target.search.value}`;
          }}>
            <input
              type="text"
              name="search"
              placeholder="Nhập tên sản phẩm..."
            />
            <button type="submit">
              <FaSearch />
            </button>
          </form>
        </div>

        <div className="popular-links">
          <h4>Các trang phổ biến:</h4>
          <div className="links-grid">
            <Link to="/figures">Tất cả sản phẩm</Link>
            <Link to="/figures?keyword=Genshin Impact">Genshin Impact</Link>
            <Link to="/figures?keyword=Gundam">Gundam</Link>
            <Link to="/figures?keyword=Mihoyo">Mihoyo</Link>
            <Link to="/login">Đăng nhập</Link>
            <Link to="/register">Đăng ký</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;