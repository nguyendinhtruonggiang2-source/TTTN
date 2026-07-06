import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import '../styles/checkout.css';

function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    paymentMethod: 'cod',
    note: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isBuyNow, setIsBuyNow] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy token từ localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Kiểm tra xem có phải mua ngay không
  const checkBuyNow = () => {
    // Kiểm tra từ sessionStorage
    const buyNowItem = sessionStorage.getItem('buyNowItem');
    if (buyNowItem) {
      const item = JSON.parse(buyNowItem);
      setCartItems([{
        id: item.figureId,
        figure: {
          id: item.figureId,
          name: item.name,
          imageUrl: item.image,
          price: item.price
        },
        quantity: item.quantity,
        price: item.price,
        fromBuyNow: true
      }]);
      setIsBuyNow(true);
      // Xóa sessionStorage sau khi lấy
      sessionStorage.removeItem('buyNowItem');
      setLoading(false);
      return true;
    }
    
    // Kiểm tra từ location.state
    if (location.state?.buyNow && location.state?.items) {
      setCartItems(location.state.items.map(item => ({
        id: item.figureId,
        figure: {
          id: item.figureId,
          name: item.name,
          imageUrl: item.image,
          price: item.price
        },
        quantity: item.quantity,
        price: item.price,
        fromBuyNow: true
      })));
      setIsBuyNow(true);
      setLoading(false);
      return true;
    }
    
    return false;
  };

  // Lấy giỏ hàng từ API
  const fetchCartItems = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axiosClient.get('/cart');
      
      let items = [];
      if (Array.isArray(response.data)) {
        items = response.data.map(item => ({
          id: item.id || item.figure?.id,
          figure: {
            id: item.figure?.id,
            name: item.figure?.name || 'Sản phẩm',
            imageUrl: item.figure?.imageUrl || '/default-figure.jpg',
            price: item.figure?.price || 0
          },
          quantity: item.quantity || 1,
          price: item.price || item.figure?.price || 0
        }));
      } else if (response.data?.items) {
        items = response.data.items;
      }

      setCartItems(items);
    } catch (error) {
      console.error('Error fetching cart:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setErrorMessage('Không thể tải giỏ hàng');
      }
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách địa chỉ từ API
  const fetchAddresses = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      
      const response = await axiosClient.get('/user/addresses');
      setAddresses(response.data || []);
      
      // Tìm địa chỉ mặc định
      const defaultAddress = response.data.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
        // Tự động điền thông tin từ địa chỉ mặc định
        setFormData(prev => ({
          ...prev,
          fullName: defaultAddress.fullName || prev.fullName,
          phone: defaultAddress.phone || prev.phone,
          address: defaultAddress.address || '',
          city: defaultAddress.city || '',
          district: defaultAddress.district || '',
          ward: defaultAddress.ward || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  // Load thông tin user
  const loadUserInfo = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      
      // Khởi tạo trước từ localStorage (nếu có) để tránh ô input bị trống trong lúc đợi API
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName || user.name || user.username || prev.fullName || '',
        email: user.email || prev.email || '',
        phone: user.phone || prev.phone || '',
        address: user.address || prev.address || ''
      }));

      // Gọi API lấy thông tin mới nhất và đầy đủ nhất (bao gồm cả số điện thoại, địa chỉ khi đăng ký)
      console.log('🔄 Fetching user profile from API for auto-fill...');
      const response = await axiosClient.get('/auth/profile');
      if (response.data) {
        const profile = response.data;
        setFormData(prev => ({
          ...prev,
          fullName: profile.name || prev.fullName,
          email: profile.email || prev.email,
          phone: profile.phone || prev.phone,
          address: profile.address || prev.address
        }));
        
        // Cập nhật lại cache localStorage
        const updatedUser = { ...user, ...profile };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Error fetching user profile at checkout:', error);
    }
  };

  // Tính tổng tiền
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.figure?.price || item.price || 0;
      const quantity = item.quantity || 1;
      return total + (price * quantity);
    }, 0);
  };

  // Tính phí vận chuyển
  const calculateShipping = () => {
    const subtotal = calculateTotal();
    return subtotal > 500000 ? 0 : 30000;
  };

  // Tính tổng cộng
  const calculateGrandTotal = () => {
    return calculateTotal() + calculateShipping();
  };

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Chọn địa chỉ có sẵn
  const handleSelectAddress = (address) => {
    setSelectedAddress(address);
    setFormData(prev => ({
      ...prev,
      fullName: address.fullName,
      phone: address.phone,
      address: address.address,
      city: address.city,
      district: address.district,
      ward: address.ward || ''
    }));
    setShowAddressForm(false);
  };

  // Validate form
  const validateForm = () => {
    if (cartItems.length === 0) {
      setErrorMessage('Không có sản phẩm để thanh toán!');
      return false;
    }

    if (!formData.fullName || formData.fullName.trim() === '') {
      setErrorMessage('Vui lòng nhập họ và tên');
      return false;
    }

    if (!formData.phone || formData.phone.trim() === '') {
      setErrorMessage('Vui lòng nhập số điện thoại');
      return false;
    }

    const phoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$/;
    if (!phoneRegex.test(formData.phone)) {
      setErrorMessage('Số điện thoại không hợp lệ');
      return false;
    }

    if (!formData.address || formData.address.trim() === '') {
      setErrorMessage('Vui lòng nhập địa chỉ');
      return false;
    }

    if (!formData.city || formData.city.trim() === '') {
      setErrorMessage('Vui lòng nhập tỉnh/thành phố');
      return false;
    }

    if (!formData.district || formData.district.trim() === '') {
      setErrorMessage('Vui lòng nhập quận/huyện');
      return false;
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      setErrorMessage('Email không hợp lệ');
      return false;
    }

    return true;
  };

  // Xử lý đặt hàng
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setErrorMessage('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const token = getAuthToken();
      if (!token) {
        navigate('/login');
        return;
      }

      // Tạo địa chỉ giao hàng đúng format
      const shippingAddress = [
        formData.address,
        formData.ward,
        formData.district,
        formData.city
      ].filter(Boolean).join(', ');

      // Tạo dữ liệu đơn hàng
      const orderData = {
        shippingInfo: {
          name: formData.fullName.trim(),
          phone: formData.phone.trim(),
          email: formData.email?.trim() || '',
          address: shippingAddress
        },
        paymentMethod: formData.paymentMethod,
        note: formData.note?.trim() || '',
        items: cartItems.map(item => ({
          figureId: item.figure?.id || item.id,
          quantity: item.quantity || 1,
          price: item.figure?.price || item.price || 0
        }))
      };

      console.log('📦 Order data being sent:', JSON.stringify(orderData, null, 2));

      // Gọi API đặt hàng
      const response = await axiosClient.post('/orders', orderData);

      console.log('✅ Order response:', response.data);

      if (response.data.success || response.data.orderId || response.data.id) {
        const orderId = response.data.orderId || response.data.id;
        const orderCode = response.data.orderCode || orderId;
        
        setSuccessMessage(`✅ Đặt hàng thành công! Mã đơn hàng: ${orderCode}`);
        
        // Nếu không phải mua ngay, xóa giỏ hàng sau khi đặt hàng thành công
        if (!isBuyNow) {
          try {
            console.log('🛒 Xóa giỏ hàng sau khi đặt hàng thành công...');
            await axiosClient.delete('/cart/clear');
            setCartItems([]);
          } catch (clearError) {
            console.error('Error clearing cart:', clearError);
          }
        }

        // Chuyển hướng sau 3 giây
        setTimeout(() => {
          if (orderId) {
            navigate(`/orders/${orderId}`);
          } else {
            navigate('/orders');
          }
        }, 3000);
      } else {
        throw new Error(response.data.message || 'Đặt hàng thất bại');
      }
    } catch (error) {
      console.error('❌ Order error:', error);
      console.error('Error details:', error.response?.data);
      
      if (error.response?.status === 401) {
        setErrorMessage('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        setTimeout(() => navigate('/login'), 1500);
      } else if (error.response?.data?.message) {
        const errorMsg = error.response.data.message;
        if (errorMsg.includes('shippingInfo') || errorMsg.includes('getName()')) {
          setErrorMessage('Lỗi cấu trúc dữ liệu: Thông tin giao hàng không hợp lệ. Vui lòng thử lại.');
        } else if (errorMsg.includes('cannot be null')) {
          setErrorMessage('Lỗi: Thiếu thông tin bắt buộc. Vui lòng điền đầy đủ thông tin giao hàng.');
        } else {
          setErrorMessage(`Đặt hàng thất bại: ${errorMsg}`);
        }
      } else if (error.message) {
        setErrorMessage(`Đặt hàng thất bại: ${error.message}`);
      } else {
        setErrorMessage('Đặt hàng thất bại. Vui lòng thử lại.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Quay lại giỏ hàng hoặc trang sản phẩm
  const handleBack = () => {
    if (isBuyNow) {
      navigate('/figures');
    } else {
      navigate('/cart');
    }
  };

  // Tiếp tục mua sắm
  const handleContinueShopping = () => {
    navigate('/figures');
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // Kiểm tra mua ngay trước
      const isBuyNowFlow = checkBuyNow();
      
      if (!isBuyNowFlow) {
        // Nếu không phải mua ngay, lấy giỏ hàng từ API
        await fetchCartItems();
        await fetchAddresses();
        await loadUserInfo();
      } else {
        // Nếu là mua ngay, chỉ lấy địa chỉ và thông tin user
        await fetchAddresses();
        await loadUserInfo();
      }
      
      setLoading(false);
    };
    
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="checkout-loading-container">
        <div className="checkout-spinner"></div>
        <p>Đang tải thông tin thanh toán...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="checkout-empty">
        <div className="checkout-empty-icon">🛒</div>
        <h2>Không có sản phẩm để thanh toán</h2>
        <p>{isBuyNow ? 'Không tìm thấy sản phẩm để mua ngay' : 'Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán'}</p>
        <div className="checkout-empty-actions">
          <button onClick={handleContinueShopping} className="btn-primary">
            Tiếp tục mua sắm
          </button>
          <button onClick={handleBack} className="btn-secondary">
            {isBuyNow ? 'Quay lại cửa hàng' : 'Quay lại giỏ hàng'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1>📋 Thanh Toán</h1>
        <button onClick={handleBack} className="btn-back">
          ← {isBuyNow ? 'Quay lại cửa hàng' : 'Quay lại giỏ hàng'}
        </button>
      </div>

      {errorMessage && (
        <div className="checkout-error-message">
          <span className="error-icon">⚠️</span>
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="checkout-success-message">
          <span className="success-icon">✅</span>
          {successMessage}
          <p className="success-note">Đang chuyển hướng đến trang đơn hàng...</p>
        </div>
      )}

      <div className="checkout-content">
        <div className="checkout-left">
          <div className="shipping-form">
            <h2>🏠 Thông tin giao hàng</h2>
            
            {/* Danh sách địa chỉ có sẵn */}
            {addresses.length > 0 && !showAddressForm && (
              <div className="saved-addresses">
                <h3>Địa chỉ của tôi</h3>
                <div className="address-list">
                  {addresses.map(addr => (
                    <div 
                      key={addr.id} 
                      className={`address-item ${selectedAddress?.id === addr.id ? 'selected' : ''}`}
                      onClick={() => handleSelectAddress(addr)}
                    >
                      <div className="address-info">
                        <p><strong>{addr.fullName}</strong> | 📞 {addr.phone}</p>
                        <p className="address-detail">
                          {[addr.address, addr.ward, addr.district, addr.city].filter(Boolean).join(', ')}
                        </p>
                        {addr.isDefault && <span className="default-badge">Mặc định</span>}
                      </div>
                    </div>
                  ))}
                </div>
                <button 
                  type="button" 
                  className="btn-add-new-address"
                  onClick={() => setShowAddressForm(true)}
                >
                  + Thêm địa chỉ mới
                </button>
              </div>
            )}

            {/* Form nhập địa chỉ mới */}
            {(showAddressForm || addresses.length === 0) && (
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Họ và tên *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      placeholder="Nhập họ và tên"
                      className={!formData.fullName.trim() ? 'input-error' : ''}
                    />
                  </div>

                  <div className="form-group">
                    <label>Số điện thoại *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="Nhập số điện thoại"
                      className={!formData.phone.trim() ? 'input-error' : ''}
                    />
                  </div>

                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Nhập email"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Địa chỉ *</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      placeholder="Số nhà, tên đường"
                      className={!formData.address.trim() ? 'input-error' : ''}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Tỉnh/Thành phố *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        placeholder="Hà Nội, TP.HCM..."
                        className={!formData.city.trim() ? 'input-error' : ''}
                      />
                    </div>

                    <div className="form-group">
                      <label>Quận/Huyện *</label>
                      <input
                        type="text"
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        required
                        placeholder="Quận/Huyện"
                        className={!formData.district.trim() ? 'input-error' : ''}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Phường/Xã</label>
                    <input
                      type="text"
                      name="ward"
                      value={formData.ward}
                      onChange={handleInputChange}
                      placeholder="Phường/Xã"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Ghi chú</label>
                    <textarea
                      name="note"
                      value={formData.note}
                      onChange={handleInputChange}
                      placeholder="Ghi chú về đơn hàng..."
                      rows="3"
                    />
                  </div>
                </div>

                <h2>💳 Phương thức thanh toán</h2>
                <div className="payment-methods">
                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={formData.paymentMethod === 'cod'}
                      onChange={handleInputChange}
                    />
                    <span className="payment-label">
                      <span className="payment-icon">💰</span>
                      <span className="payment-text">
                        <strong>Thanh toán khi nhận hàng (COD)</strong>
                        <small>Thanh toán bằng tiền mặt khi nhận hàng</small>
                      </span>
                    </span>
                  </label>

                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="banking"
                      checked={formData.paymentMethod === 'banking'}
                      onChange={handleInputChange}
                    />
                    <span className="payment-label">
                      <span className="payment-icon">🏦</span>
                      <span className="payment-text">
                        <strong>Chuyển khoản ngân hàng</strong>
                        <small>Chuyển khoản qua ngân hàng. Thông tin sẽ được gửi qua email.</small>
                      </span>
                    </span>
                  </label>

                  <label className="payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="momo"
                      checked={formData.paymentMethod === 'momo'}
                      onChange={handleInputChange}
                    />
                    <span className="payment-label">
                      <span className="payment-icon">💜</span>
                      <span className="payment-text">
                        <strong>Ví điện tử MoMo</strong>
                        <small>Thanh toán nhanh chóng qua ứng dụng MoMo</small>
                      </span>
                    </span>
                  </label>
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    onClick={handleBack}
                    className="btn-secondary"
                  >
                    {isBuyNow ? 'Quay lại cửa hàng' : 'Quay lại giỏ hàng'}
                  </button>
                  <button 
                    type="submit" 
                    className="btn-submit-order" 
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner"></span>
                        Đang xử lý...
                      </>
                    ) : (
                      '🛒 Xác nhận đặt hàng'
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Nếu đang xem danh sách địa chỉ và có form ẩn, hiển thị nút quay lại */}
            {addresses.length > 0 && !showAddressForm && (
              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={handleBack}
                  className="btn-secondary"
                >
                  {isBuyNow ? 'Quay lại cửa hàng' : 'Quay lại giỏ hàng'}
                </button>
                <button 
                  type="button"
                  className="btn-submit-order" 
                  onClick={() => {
                    if (selectedAddress) {
                      // Submit form với địa chỉ đã chọn
                      const fakeEvent = { preventDefault: () => {} };
                      handleSubmit(fakeEvent);
                    } else {
                      setErrorMessage('Vui lòng chọn địa chỉ giao hàng');
                    }
                  }}
                  disabled={submitting || !selectedAddress}
                >
                  {submitting ? (
                    <>
                      <span className="spinner"></span>
                      Đang xử lý...
                    </>
                  ) : (
                    '🛒 Xác nhận đặt hàng'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="checkout-right">
          <div className="order-summary">
            <h2>📦 Đơn hàng của bạn</h2>
            
            <div className="order-items">
              {cartItems.map((item, index) => (
                <div key={item.id || index} className="order-item">
                  <div className="item-info">
                    <img 
                      src={item.figure?.imageUrl || item.imageUrl || '/default-figure.jpg'} 
                      alt={item.figure?.name || 'Sản phẩm'}
                      onError={(e) => {
                        e.target.src = '/default-figure.jpg';
                      }}
                    />
                    <div className="item-details">
                      <h4>{item.figure?.name || 'Sản phẩm'}</h4>
                      <p>Số lượng: {item.quantity || 1}</p>
                      {item.fromBuyNow && (
                        <span className="buy-now-badge">Mua ngay</span>
                      )}
                    </div>
                  </div>
                  <div className="item-price">
                    {((item.figure?.price || item.price || 0) * (item.quantity || 1)).toLocaleString()}đ
                  </div>
                </div>
              ))}
            </div>

            <div className="order-totals">
              <div className="total-row">
                <span>Tạm tính:</span>
                <span>{calculateTotal().toLocaleString()}đ</span>
              </div>
              <div className="total-row">
                <span>Phí vận chuyển:</span>
                <span>{calculateShipping().toLocaleString()}đ</span>
              </div>
              {calculateTotal() > 500000 && (
                <div className="total-row shipping-free">
                  <span>Miễn phí vận chuyển:</span>
                  <span>-30,000đ</span>
                </div>
              )}
              <div className="total-row total">
                <span>Tổng cộng:</span>
                <span>{calculateGrandTotal().toLocaleString()}đ</span>
              </div>
            </div>

            <div className="order-note">
              <p>📦 Miễn phí vận chuyển cho đơn hàng trên 500,000đ</p>
              <p>⏰ Giao hàng dự kiến: 2-5 ngày làm việc</p>
              <p>💰 Hỗ trợ nhiều phương thức thanh toán</p>
              {!isBuyNow && (
                <p className="important-note">
                  ⚠️ <strong>Lưu ý:</strong> Giỏ hàng sẽ được tự động xóa sau khi đặt hàng thành công
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;