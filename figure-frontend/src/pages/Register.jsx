import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../styles/auth.css";
import { 
  FaUser, 
  FaLock, 
  FaEnvelope, 
  FaPhone, 
  FaAddressCard, 
  FaUserTag,
  FaCheckCircle,
  FaShippingFast,
  FaGift,
  FaStar,
  FaEye,
  FaEyeSlash
} from "react-icons/fa";

function Register({ updateAuthStatus }) {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: ""
  });
  
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Vui lòng nhập tên đăng nhập";
    } else if (formData.username.length < 3) {
      newErrors.username = "Tên đăng nhập phải có ít nhất 3 ký tự";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới";
    }
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Vui lòng nhập họ và tên";
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Email không đúng định dạng";
      }
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu không khớp";
    }
    
    // Phone validation (optional)
    if (formData.phone && !/^\d{10,11}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = "Số điện thoại không hợp lệ";
    }
    
    // Terms validation
    if (!acceptTerms) {
      newErrors.terms = "Vui lòng chấp nhận điều khoản";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      const registerData = {
        username: formData.username,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || "",
        address: formData.address || ""
      };

      console.log("📤 Sending register request:", registerData);
      
      const response = await axios.post(
        "http://localhost:8080/api/auth/register", 
        registerData,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 seconds timeout
        }
      );
      
      console.log("✅ Register response:", response.data);
      
      // Handle response based on type
      if (response.data && typeof response.data === 'object') {
        const { token, id, username, name, email, phone, address } = response.data;
        
        if (token) {
          // Store user data
          const userData = { id, username, name, email, phone, address, token };
          localStorage.setItem("user", JSON.stringify(userData));
          localStorage.setItem("token", token);
          
          // Update auth context
          if (updateAuthStatus) {
            updateAuthStatus(userData);
          }
          
          setSuccess("Đăng ký thành công! Bạn đã được tự động đăng nhập.");
          
          // Redirect to home after 2 seconds
          setTimeout(() => {
            navigate("/");
          }, 2000);
        } else {
          setErrors({ general: "Đăng ký thất bại: Không nhận được token" });
        }
      } else {
        // If response is a string (error message)
        setErrors({ general: response.data || "Đăng ký thất bại" });
      }
      
    } catch (error) {
      console.error("❌ Register error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Handle specific error cases
      if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
          case 400:
            if (typeof data === 'string') {
              if (data.includes("username") || data.includes("Username")) {
                setErrors({ username: data });
              } else if (data.includes("email") || data.includes("Email")) {
                setErrors({ email: data });
              } else if (data.includes("password") || data.includes("Password")) {
                setErrors({ password: data });
              } else {
                setErrors({ general: data });
              }
            } else if (data.message) {
              setErrors({ general: data.message });
            } else {
              setErrors({ general: "Dữ liệu không hợp lệ" });
            }
            break;
            
          case 409:
            setErrors({ general: "Tài khoản đã tồn tại" });
            break;
            
          case 500:
            setErrors({ general: "Lỗi server. Vui lòng thử lại sau" });
            break;
            
          default:
            setErrors({ general: "Đăng ký thất bại. Vui lòng thử lại" });
        }
      } else if (error.request) {
        setErrors({ general: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối" });
      } else {
        setErrors({ general: error.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Left side - Register Form */}
        <div className="auth-form">
          <div className="auth-header">
            <h2>Đăng Ký Tài Khoản</h2>
            <p>Tham gia Figure Store để nhận ưu đãi đặc biệt!</p>
          </div>

          {errors.general && (
            <div className="error-alert">
              ⚠️ {errors.general}
            </div>
          )}

          {success && (
            <div className="success-alert">
              ✅ {success}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-grid">
              {/* Username */}
              <div className="input-group">
                <label>
                  <FaUserTag className="input-icon" /> Tên đăng nhập *
                </label>
                <input
                  type="text"
                  name="username"
                  placeholder="example123"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={loading}
                  className={errors.username ? 'error' : ''}
                />
                {errors.username && (
                  <span className="error-text">{errors.username}</span>
                )}
                <small className="input-hint">
                  Chỉ chứa chữ cái, số và dấu gạch dưới (3-20 ký tự)
                </small>
              </div>

              {/* Full Name */}
              <div className="input-group">
                <label>
                  <FaUser className="input-icon" /> Họ và tên *
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Nguyễn Văn A"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading}
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && (
                  <span className="error-text">{errors.name}</span>
                )}
              </div>

              {/* Email */}
              <div className="input-group">
                <label>
                  <FaEnvelope className="input-icon" /> Email *
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="example@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  className={errors.email ? 'error' : ''}
                />
                {errors.email && (
                  <span className="error-text">{errors.email}</span>
                )}
              </div>

              {/* Phone */}
              <div className="input-group">
                <label>
                  <FaPhone className="input-icon" /> Số điện thoại
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="0987654321"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={loading}
                  className={errors.phone ? 'error' : ''}
                />
                {errors.phone && (
                  <span className="error-text">{errors.phone}</span>
                )}
              </div>

              {/* Password */}
              <div className="input-group" style={{ position: 'relative' }}>
                <label>
                  <FaLock className="input-icon" /> Mật khẩu *
                </label>
                <div className="password-input-wrapper" style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Ít nhất 6 ký tự"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    className={errors.password ? 'error' : ''}
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
                {errors.password && (
                  <span className="error-text">{errors.password}</span>
                )}
              </div>

              {/* Confirm Password */}
              <div className="input-group" style={{ position: 'relative' }}>
                <label>
                  <FaLock className="input-icon" /> Xác nhận mật khẩu *
                </label>
                <div className="password-input-wrapper" style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Nhập lại mật khẩu"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                    className={errors.confirmPassword ? 'error' : ''}
                    style={{ paddingRight: '45px' }}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span className="error-text">{errors.confirmPassword}</span>
                )}
              </div>

              {/* Address */}
              <div className="input-group full-width">
                <label>
                  <FaAddressCard className="input-icon" /> Địa chỉ
                </label>
                <textarea
                  name="address"
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="terms-agreement">
              <input 
                type="checkbox" 
                id="terms" 
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                disabled={loading}
              />
              <label htmlFor="terms" className={errors.terms ? 'error' : ''}>
                Tôi đã đọc và đồng ý với <Link to="/terms">Điều khoản dịch vụ</Link> và <Link to="/privacy">Chính sách bảo mật</Link>
              </label>
              {errors.terms && (
                <span className="error-text block">{errors.terms}</span>
              )}
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="auth-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Đang đăng ký...
                </>
              ) : (
                "Đăng Ký Ngay"
              )}
            </button>
            {/* Login Link */}
            <div className="auth-footer">
              <p>
                Đã có tài khoản?{" "}
                <Link to="/login" className="link">
                  Đăng nhập ngay
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Right side - Benefits Banner */}
        <div className="auth-banner register-banner">
          <div className="banner-content">
            <h2 className="banner-title">ƯU ĐÃI ĐẶC BIỆT</h2>
            <p className="banner-subtitle">Khi đăng ký thành viên</p>
            
            <div className="benefits-list">
              <div className="benefit-item">
                <FaCheckCircle className="benefit-icon" />
                <div className="benefit-text">
                  <h3>Giảm 10% đơn đầu</h3>
                  <p>Áp dụng cho tất cả sản phẩm</p>
                </div>
              </div>
              
              <div className="benefit-item">
                <FaShippingFast className="benefit-icon" />
                <div className="benefit-text">
                  <h3>Miễn phí vận chuyển</h3>
                  <p>Cho đơn từ 500.000đ</p>
                </div>
              </div>
              
              <div className="benefit-item">
                <FaGift className="benefit-icon" />
                <div className="benefit-text">
                  <h3>Quà tặng độc quyền</h3>
                  <p>Dành riêng cho thành viên</p>
                </div>
              </div>
              
              <div className="benefit-item">
                <FaStar className="benefit-icon" />
                <div className="benefit-text">
                  <h3>Tích điểm đổi quà</h3>
                  <p>1 điểm = 1.000đ giá trị</p>
                </div>
              </div>
            </div>
            
            <div className="stats-section">
              <div className="stat">
                <h4>5,000+</h4>
                <p>Thành viên</p>
              </div>
              <div className="stat">
                <h4>99%</h4>
                <p>Hài lòng</p>
              </div>
              <div className="stat">
                <h4>24/7</h4>
                <p>Hỗ trợ</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;