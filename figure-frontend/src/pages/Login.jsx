import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import "../styles/auth.css";
import { FaUser, FaLock, FaEnvelope, FaEye, FaEyeSlash, FaInfoCircle } from "react-icons/fa";

function Login({ updateAuthStatus }) {
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra email đã đăng ký
    if (location.state?.registeredEmail) {
      setFormData(prev => ({
        ...prev,
        username: location.state.registeredEmail
      }));
    }

    // Kiểm tra email đã nhớ
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setFormData(prev => ({
        ...prev,
        username: rememberedEmail
      }));
      setRememberMe(true);
    }

    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("Sending login request with:", formData);
      
      const loginData = {
        username: formData.username.trim(),
        password: formData.password
      };

      const response = await axios.post(
        "http://localhost:8080/api/auth/login", 
        loginData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log("Login response:", response.data);

      const { token, username, name, email } = response.data;

      if (token) {
        // LẤY ROLES TỪ RESPONSE - FIX QUAN TRỌNG
        let userRoles = ["ROLE_USER"]; // Mặc định
        
        // Cách 1: Lấy từ response.data.roles
        if (response.data.roles && Array.isArray(response.data.roles)) {
          userRoles = response.data.roles;
        } 
        // Cách 2: Lấy từ response.data.role (string)
        else if (response.data.role) {
          userRoles = [response.data.role];
        }
        // Cách 3: Kiểm tra username để xác định admin
        else if (username === "admin" || username === "admin@figurestore.com") {
          userRoles = ["ROLE_ADMIN", "ROLE_USER"];
          console.log("Admin detected, setting admin roles");
        }

        const userData = {
          username: username || formData.username,
          name: name || formData.username,
          email: email || formData.username,
          roles: userRoles
        };

        console.log("Saving user data with roles:", userData);

        // Lưu thông tin đăng nhập
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", token);

        // Cấu hình axios header cho các request sau
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        if (rememberMe) {
          localStorage.setItem("rememberedEmail", formData.username);
        } else {
          localStorage.removeItem("rememberedEmail");
        }

        // Cập nhật trạng thái đăng nhập
        if (updateAuthStatus) {
          updateAuthStatus(userData);
        }

        // Kiểm tra và thông báo nếu là admin
        if (userRoles.includes("ROLE_ADMIN")) {
          alert("✅ Đăng nhập thành công với quyền ADMIN!");
        }

        // Chuyển hướng
        const from = location.state?.from?.pathname || "/";
        console.log("Redirecting to:", from);
        navigate(from, { replace: true });
        
      } else {
        setError("Token không tồn tại trong response");
      }

    } catch (err) {
      console.error("Login error details:", err);
      
      if (err.response) {
        const errorData = err.response.data;
        
        if (err.response.status === 400) {
          if (errorData.errors) {
            const validationErrors = errorData.errors.map(e => e.defaultMessage).join(", ");
            setError(`Lỗi xác thực: ${validationErrors}`);
          } else if (errorData.message) {
            setError(errorData.message);
          } else if (errorData === "Bad credentials") {
            setError("Tên đăng nhập hoặc mật khẩu không đúng");
          } else {
            setError("Thông tin đăng nhập không hợp lệ");
          }
        } else if (err.response.status === 401) {
          setError("Tên đăng nhập hoặc mật khẩu không đúng");
        } else if (err.response.status === 403) {
          setError("Tài khoản bị vô hiệu hóa hoặc không có quyền truy cập");
        } else if (err.response.status === 404) {
          setError("Không tìm thấy endpoint đăng nhập");
        } else {
          setError(`Lỗi server: ${err.response.status}`);
        }
      } else if (err.request) {
        setError("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.");
      } else {
        setError("Đã xảy ra lỗi: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    const guestUser = {
      username: "guest",
      name: "Khách",
      email: "guest@example.com",
      roles: ["ROLE_GUEST"]
    };

    localStorage.setItem("user", JSON.stringify(guestUser));
    localStorage.setItem("token", "guest-token-" + Date.now());
    
    if (updateAuthStatus) {
      updateAuthStatus(guestUser);
    }
    
    navigate("/");
  };

  // Hàm test login nhanh (cho dev)
  const handleQuickLogin = (type) => {
    if (type === "admin") {
      setFormData({
        username: "admin",
        password: "admin123"
      });
    } else if (type === "user") {
      setFormData({
        username: "user123",
        password: "password123"
      });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        <div className="auth-form">
          <div className="auth-header">
            <h2>Đăng Nhập</h2>
            <p>Chào mừng trở lại! Vui lòng đăng nhập tài khoản của bạn.</p>
          </div>

          {successMessage && (
            <div className="success-alert">
              {successMessage}
            </div>
          )}
          
          {error && (
            <div className="error-alert">
              {error}
            </div>
          )}

          {/* Quick login buttons (cho dev) */}
          <div className="quick-login-buttons">
            <button 
              type="button" 
              className="quick-btn admin"
              onClick={() => handleQuickLogin("admin")}
              disabled={loading}
            >
              Login as Admin
            </button>
            <button 
              type="button" 
              className="quick-btn user"
              onClick={() => handleQuickLogin("user")}
              disabled={loading}
            >
              Login as User
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>
                <FaEnvelope /> Tên đăng nhập hoặc Email
              </label>
              <input
                type="text"
                name="username"
                placeholder="Nhập tên đăng nhập hoặc email"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="username"
              />
            </div>

            <div className="input-group" style={{ position: 'relative' }}>
              <label>
                <FaLock /> Mật khẩu
              </label>
              <div className="password-input-wrapper" style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  autoComplete="current-password"
                  style={{ paddingRight: '45px' }}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '6px',
                    zIndex: 2
                  }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
                Ghi nhớ đăng nhập
              </label>

              <Link to="/forgot-password" className="forgot-password">
                Quên mật khẩu?
              </Link>
            </div>

            <button 
              type="submit" 
              className="auth-submit" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Đang đăng nhập...
                </>
              ) : "Đăng Nhập"}
            </button>
            <div className="auth-footer">
              <p>Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p>

              <button 
                type="button" 
                className="guest-btn" 
                onClick={handleGuestLogin}
                disabled={loading}
              >
                Tiếp tục với tư cách khách
              </button>
            </div>

          </form>
        </div>

        <div className="auth-banner">
          <div className="banner-content">
            <h2>FIGURE STORE</h2>
            <p>Khám phá bộ sưu tập mô hình độc đáo!</p>
            <div className="features">
              <p>✓ Mua sắm nhanh chóng</p>
              <p>✓ Theo dõi đơn hàng</p>
              <p>✓ Lịch sử mua hàng</p>
              <p>✓ Ưu đãi thành viên</p>
              <p>✓ Quản lý Admin (cho admin)</p>
            </div>
            <details className="dev-tips-details" style={{ marginTop: '20px', cursor: 'pointer', textAlign: 'left' }}>
              <summary style={{ color: '#fbbf24', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', userSelect: 'none' }}>
                <FaInfoCircle /> Hướng dẫn tài khoản kiểm thử
              </summary>
              <div className="banner-tips" style={{ marginTop: '10px', background: 'rgba(0, 0, 0, 0.2)', padding: '15px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#fbbf24', fontSize: '14px' }}>Thông tin đăng nhập mặc định:</h4>
                <p style={{ margin: '4px 0', fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}><strong>Tài khoản Admin:</strong></p>
                <p style={{ margin: '4px 0 4px 10px', fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>• Username: <code>admin</code></p>
                <p style={{ margin: '4px 0 4px 10px', fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>• Password: <code>admin123</code></p>
                <p style={{ margin: '4px 0 4px 10px', fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>• Email: <code>admin@figurestore.com</code></p>
                <p style={{ margin: '8px 0 4px 0', fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}><strong>Tài khoản User mẫu:</strong></p>
                <p style={{ margin: '4px 0 4px 10px', fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>• Username: <code>user123</code></p>
                <p style={{ margin: '4px 0 4px 10px', fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>• Password: <code>password123</code></p>
              </div>
              <div className="admin-note" style={{ marginTop: '10px', background: 'rgba(0, 0, 0, 0.2)', padding: '15px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ margin: '0 0 8px 0', color: '#fbbf24', fontSize: '14px' }}>Lưu ý:</h4>
                <p style={{ margin: '4px 0', fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>Sau khi đăng nhập với admin, các nút Admin Panel sẽ xuất hiện ở:</p>
                <p style={{ margin: '4px 0 4px 10px', fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>• Nút nổi góc phải màn hình</p>
                <p style={{ margin: '4px 0 4px 10px', fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>• Trong banner trang chủ</p>
                <p style={{ margin: '4px 0 4px 10px', fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>• Dưới chân trang (Footer)</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;