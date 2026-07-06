import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import '../styles/profile.css';

function Profile() {
  const [user, setUser] = useState(() => {
    const cachedUser = localStorage.getItem('user');
    return cachedUser ? JSON.parse(cachedUser) : null;
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(() => {
    const cachedUser = localStorage.getItem('user');
    if (cachedUser) {
      const u = JSON.parse(cachedUser);
      return {
        name: u.name || u.fullName || u.username || '',
        email: u.email || '',
        phone: u.phone || '',
        address: u.address || ''
      };
    }
    return {
      name: '',
      email: '',
      phone: '',
      address: ''
    };
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Nếu đã có thông tin cached user từ trước, không cần hiển thị màn hình loading toàn trang
    const cachedUser = localStorage.getItem('user');
    if (cachedUser) {
      setLoading(false);
    }
    
    fetchUserProfile();
    fetchUserOrders();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosClient.get('/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUser(response.data);
      
      // Đồng bộ thông tin mới nhất vào localStorage
      const cached = localStorage.getItem('user');
      const currentCached = cached ? JSON.parse(cached) : {};
      const updatedUser = { ...currentCached, ...response.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setFormData({
        name: response.data.name || '',
        email: response.data.email || '',
        phone: response.data.phone || '',
        address: response.data.address || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    }
  };

  const fetchUserOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosClient.get('/orders/my-orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axiosClient.put('/auth/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const updatedUser = { ...user, ...formData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setEditMode(false);
      alert('✅ Cập nhật thông tin thành công!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(error.response?.data?.message || '❌ Cập nhật thất bại!');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Đang tải thông tin...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h1>👤 Hồ Sơ Của Tôi</h1>
      
      <div className="profile-content">
        <div className="profile-sidebar">
          <div className="user-avatar">
            <div className="avatar-icon">👤</div>
            <h3>{user?.name || 'Người dùng'}</h3>
            <p>{user?.email}</p>
          </div>

          <div className="sidebar-menu">
            <button 
              className={`menu-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              📝 Thông tin cá nhân
            </button>
            <button 
              className={`menu-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              📦 Đơn hàng của tôi
            </button>
            <Link 
              to="/addresses"
              className={`menu-item ${activeTab === 'address' ? 'active' : ''}`}
              onClick={() => setActiveTab('address')}
            >
              🏠 Sổ địa chỉ
            </Link>
            <button className="menu-item logout" onClick={handleLogout}>
              🚪 Đăng xuất
            </button>
          </div>
        </div>

        <div className="profile-main">
          {activeTab === 'profile' && (
            <div className="profile-section">
              <div className="section-header">
                <h2>Thông tin cá nhân</h2>
                {!editMode && (
                  <button 
                    className="btn-edit"
                    onClick={() => setEditMode(true)}
                  >
                    ✏️ Chỉnh sửa
                  </button>
                )}
              </div>

              <div className="profile-form">
                <div className="form-group">
                  <label>Họ và tên</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={saving}
                    />
                  ) : (
                    <p className="info-value">{user?.name || 'Chưa cập nhật'}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <p className="info-value">{user?.email}</p>
                </div>

                <div className="form-group">
                  <label>Số điện thoại</label>
                  {editMode ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Nhập số điện thoại"
                      disabled={saving}
                    />
                  ) : (
                    <p className="info-value">{user?.phone || 'Chưa cập nhật'}</p>
                  )}
                </div>

                <div className="form-group">
                  <label>Địa chỉ</label>
                  {editMode ? (
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Nhập địa chỉ"
                      disabled={saving}
                    />
                  ) : (
                    <p className="info-value">{user?.address || 'Chưa cập nhật'}</p>
                  )}
                </div>

                {editMode && (
                  <div className="form-actions">
                    <button 
                      className="btn-cancel" 
                      onClick={() => {
                        setEditMode(false);
                        setFormData({
                          name: user?.name || '',
                          email: user?.email || '',
                          phone: user?.phone || '',
                          address: user?.address || ''
                        });
                      }}
                      disabled={saving}
                    >
                      Hủy
                    </button>
                    <button 
                      className="btn-save" 
                      onClick={handleSaveProfile}
                      disabled={saving}
                    >
                      {saving ? 'Đang lưu...' : '💾 Lưu thay đổi'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="orders-section">
              <h2>Đơn hàng của tôi</h2>
              
              {orders.length === 0 ? (
                <div className="empty-orders">
                  <div className="empty-icon">📦</div>
                  <h3>Chưa có đơn hàng nào</h3>
                  <p>Bạn chưa đặt mua sản phẩm nào từ cửa hàng của chúng tôi</p>
                  <button onClick={() => navigate('/figures')} className="btn-shop">
                    🛒 Mua sắm ngay
                  </button>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map(order => (
                    <div key={order.id} className="order-card">
                      <div className="order-header">
                        <div>
                          <h4>Mã đơn hàng: {order.orderCode}</h4>
                          <p className="order-date">
                            📅 {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        <div className="order-status">
                          <span className={`status-badge ${order.status}`}>
                            {getStatusText(order.status)}
                          </span>
                          <p className="order-total">
                            {order.totalAmount?.toLocaleString()}đ
                          </p>
                        </div>
                      </div>

                      <div className="order-items">
                        {order.items?.map(item => (
                          <div key={item.id} className="order-item">
                            <img 
                              src={item.figure?.imageUrl || '/placeholder.png'} 
                              alt={item.figure?.name || 'Sản phẩm'}
                              onError={(e) => { e.target.src = '/placeholder.png'; }}
                            />
                            <div className="item-details">
                              <h5>{item.figure?.name || 'Sản phẩm'}</h5>
                              <p>Số lượng: {item.quantity}</p>
                            </div>
                            <div className="item-price">
                              {item.price?.toLocaleString()}đ
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="order-actions">
                        <button 
                          className="btn-detail"
                          onClick={() => navigate(`/orders/${order.id}`)}
                        >
                          Xem chi tiết
                        </button>
                        {order.status === 'pending' && (
                          <button className="btn-cancel">Hủy đơn</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'address' && (
            <div className="address-section">
              <h2>Sổ địa chỉ</h2>
              <div className="address-list">
                {user?.address ? (
                  <div className="address-card">
                    <h4>🏠 Địa chỉ mặc định</h4>
                    <p>{user.address}</p>
                    <p>📞 {user.phone || 'Chưa có số điện thoại'}</p>
                    <div className="address-actions">
                      <Link to="/addresses" className="btn-manage-address">
                        📝 Quản lý địa chỉ
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="empty-address">
                    <p>Chưa có địa chỉ nào</p>
                    <Link to="/addresses" className="btn-add-address">
                      + Thêm địa chỉ mới
                    </Link>
                  </div>
                )}
              </div>
              <Link to="/addresses" className="btn-add-address">
                + Thêm địa chỉ mới
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function
function getStatusText(status) {
  const statusMap = {
    'pending': '⏳ Chờ xác nhận',
    'confirmed': '✅ Đã xác nhận',
    'processing': '⚙️ Đang xử lý',
    'shipped': '🚚 Đang giao hàng',
    'delivered': '📦 Đã giao hàng',
    'cancelled': '❌ Đã hủy'
  };
  return statusMap[status] || status;
}

export default Profile;