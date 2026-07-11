import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import "../styles/auth.css";
import { 
  FaEnvelope, 
  FaLock, 
  FaCheckCircle, 
  FaArrowLeft, 
  FaKey,
  FaGoogle,
  FaFacebook,
  FaEye,
  FaEyeSlash,
  FaInfoCircle
} from "react-icons/fa";

function ForgotPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Xác định bước ban đầu dựa trên đường dẫn
  const isResetPath = location.pathname.includes("reset-password");
  const [step, setStep] = useState(isResetPath ? 2 : 1);
  
  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Biến lưu mã test nhận được từ API để hỗ trợ test nhanh trên UI
  const [testHelperCode, setTestHelperCode] = useState("");

  useEffect(() => {
    // Cập nhật step khi path thay đổi
    if (location.pathname.includes("reset-password")) {
      setStep(2);
    } else {
      setStep(1);
    }
    setError("");
    setSuccess("");
  }, [location.pathname]);

  const handleRequestCode = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Vui lòng nhập địa chỉ email");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:8080/api/auth/forgot-password", {
        email: email.trim()
      });

      setSuccess("Mã xác thực đã được gửi thành công!");
      
      // Lấy resetCode trả về trong response để hiển thị trợ giúp kiểm thử
      if (response.data && response.data.resetCode) {
        setTestHelperCode(response.data.resetCode);
        setResetCode(response.data.resetCode); // Tự động điền code cho tiện test
      }

      // Sau 2 giây tự động chuyển sang bước 2
      setTimeout(() => {
        setStep(2);
        setSuccess("");
      }, 2000);

    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        setError(typeof err.response.data === "string" ? err.response.data : err.response.data.message || "Email không tồn tại trong hệ thống.");
      } else {
        setError("Không thể kết nối tới máy chủ. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim()) {
      setError("Vui lòng nhập địa chỉ email");
      return;
    }
    if (!resetCode.trim()) {
      setError("Vui lòng nhập mã xác thực");
      return;
    }
    if (!newPassword) {
      setError("Vui lòng nhập mật khẩu mới");
      return;
    }
    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải chứa ít nhất 6 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("http://localhost:8080/api/auth/reset-password", {
        email: email.trim(),
        resetCode: resetCode.trim(),
        newPassword: newPassword
      });

      setSuccess("Đặt lại mật khẩu thành công! Bạn đang được chuyển hướng về trang đăng nhập...");
      
      // Chuyển hướng về trang đăng nhập sau 3 giây
      setTimeout(() => {
        navigate("/login", { state: { message: "Đặt lại mật khẩu thành công! Hãy đăng nhập bằng mật khẩu mới của bạn.", registeredEmail: email } });
      }, 3000);

    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
        setError(typeof err.response.data === "string" ? err.response.data : err.response.data.message || "Đặt lại mật khẩu không thành công. Vui lòng kiểm tra lại thông tin.");
      } else {
        setError("Có lỗi xảy ra trong quá trình đặt lại mật khẩu. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-form">
          <div className="auth-header">
            {step === 1 ? (
              <>
                <h2>Quên Mật Khẩu</h2>
                <p>Nhập địa chỉ email của bạn để nhận mã xác thực đặt lại mật khẩu.</p>
              </>
            ) : (
              <>
                <h2>Đặt Lại Mật Khẩu</h2>
                <p>Vui lòng nhập mã xác thực (OTP) và mật khẩu mới để cập nhật tài khoản.</p>
              </>
            )}
          </div>

          {success && <div className="success-alert">✅ {success}</div>}
          {error && <div className="error-alert">⚠️ {error}</div>}

          {/* Hiển thị hỗ trợ kiểm thử code trong môi trường dev */}
          {testHelperCode && step === 2 && (
            <details className="dev-tips-details" style={{ marginBottom: "20px", cursor: "pointer", textAlign: 'left' }}>
              <summary style={{ color: '#fbbf24', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', userSelect: 'none' }}>
                <FaInfoCircle /> Trợ giúp kiểm thử OTP (Dev Mode)
              </summary>
              <div className="banner-tips" style={{ marginTop: "10px", borderLeft: "4px solid #10b981", background: "rgba(16, 185, 129, 0.1)", padding: "12px", borderRadius: "8px" }}>
                <p style={{ margin: 0, fontSize: "13px", color: "#10b981", fontWeight: '600' }}>
                  Mã xác thực OTP là: <span style={{ fontSize: "15px", color: "#fbbf24", fontFamily: 'monospace' }}>{testHelperCode}</span> (hệ thống đã tự động điền).
                </p>
              </div>
            </details>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestCode}>
              <div className="input-group">
                <label>
                  <FaEnvelope /> Địa chỉ Email
                </label>
                <input
                  type="email"
                  placeholder="example@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Đang gửi yêu cầu...
                  </>
                ) : (
                  "Gửi Mã Xác Thực"
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword}>
              <div className="input-group">
                <label>
                  <FaEnvelope /> Địa chỉ Email
                </label>
                <input
                  type="email"
                  placeholder="example@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="input-group">
                <label>
                  <FaKey /> Mã xác thực (OTP)
                </label>
                <input
                  type="text"
                  placeholder="Nhập mã 6 chữ số"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="input-group" style={{ position: 'relative' }}>
                <label>
                  <FaLock /> Mật khẩu mới
                </label>
                <div className="password-input-wrapper" style={{ position: 'relative' }}>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu mới"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={loading}
                    style={{ paddingRight: '45px' }}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowNewPassword(!showNewPassword)}
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
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div className="input-group" style={{ position: 'relative' }}>
                <label>
                  <FaLock /> Xác nhận mật khẩu mới
                </label>
                <div className="password-input-wrapper" style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Xác nhận mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
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
              </div>

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Đang đặt lại mật khẩu...
                  </>
                ) : (
                  "Đặt Lại Mật Khẩu"
                )}
              </button>
              
              <button 
                type="button" 
                className="guest-btn" 
                onClick={() => setStep(1)} 
                disabled={loading}
                style={{ marginTop: "15px", width: "100%" }}
              >
                <FaArrowLeft style={{ marginRight: "8px" }} /> Quay lại bước 1
              </button>
            </form>
          )}

          <div className="auth-footer">
            <p>Nhớ mật khẩu? <Link to="/login" className="link">Đăng nhập ngay</Link></p>
          </div>
        </div>

        <div className="auth-banner">
          <div className="banner-content">
            <h2>🎯 FIGURE STORE</h2>
            <p>Khôi phục quyền truy cập vào tài khoản của bạn.</p>
            <div className="features">
              <p>✓ Bảo mật tuyệt đối</p>
              <p>✓ Xác thực OTP nhanh chóng</p>
              <p>✓ Đặt mật khẩu an toàn</p>
              <p>✓ Hỗ trợ khách hàng 24/7</p>
            </div>
            <div className="banner-tips">
              <h4>💡 Gợi ý mật khẩu an toàn:</h4>
              <p>• Dài từ 6 ký tự trở lên</p>
              <p>• Nên chứa cả chữ hoa, chữ thường và số</p>
              <p>• Không sử dụng thông tin dễ đoán (như ngày sinh, tên của bạn)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
