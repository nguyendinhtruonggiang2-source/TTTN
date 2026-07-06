// src/pages/OrderHistory.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import '../styles/orderHistory.css';

function OrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  // Map status từ backend sang hiển thị
  const getStatusMapping = (status) => {
    const statusMap = {
      'PENDING': { text: '⏳ Chờ xác nhận', class: 'pending', icon: '⏳' },
      'PROCESSING': { text: '⚙️ Đang xử lý', class: 'processing', icon: '⚙️' },
      'SHIPPED': { text: '🚚 Đang giao hàng', class: 'shipping', icon: '🚚' },
      'DELIVERED': { text: '📦 Đã giao hàng', class: 'delivered', icon: '📦' },
      'CANCELLED': { text: '❌ Đã hủy', class: 'cancelled', icon: '❌' }
    };
    return statusMap[status] || { text: status, class: 'pending', icon: '⏳' };
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [statusFilter, searchTerm, dateRange, orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/orders');
      console.log('Orders response:', response.data);
      setOrders(response.data);
      setFilteredOrders(response.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      if (err.response?.status === 401) {
        setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setError('Không thể tải danh sách đơn hàng');
      }
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        order.orderCode?.toLowerCase().includes(term) ||
        order.shippingName?.toLowerCase().includes(term) ||
        order.shippingPhone?.includes(term)
      );
    }

    if (dateRange.from) {
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(order => new Date(order.createdAt) >= fromDate);
    }
    if (dateRange.to) {
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(order => new Date(order.createdAt) <= toDate);
    }

    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setFilteredOrders(filtered);
  };

  const handleViewDetail = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      return;
    }

    try {
      await axiosClient.put(`/orders/${orderId}/cancel`);
      alert('✅ Đã hủy đơn hàng thành công');
      await fetchOrders();
    } catch (err) {
      console.error('Error cancelling order:', err);
      const errorMsg = err.response?.data?.message || 'Không thể hủy đơn hàng';
      alert(`❌ ${errorMsg}`);
    }
  };

  const handleReorder = async (order) => {
    if (!window.confirm('Thêm tất cả sản phẩm từ đơn hàng này vào giỏ hàng?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      for (const item of order.items || []) {
        await axiosClient.post('/cart/add', {
          figureId: item.figure?.id || item.id,
          quantity: item.quantity
        });
      }
      
      alert('✅ Đã thêm tất cả sản phẩm vào giỏ hàng!');
      navigate('/cart');
    } catch (err) {
      console.error('Error reorder:', err);
      alert('❌ Không thể thêm vào giỏ hàng. Vui lòng thử lại.');
    }
  };

  const getStatusBadge = (status) => {
    const mapping = getStatusMapping(status);
    return {
      class: `status-badge ${mapping.class}`,
      text: mapping.text,
      icon: mapping.icon
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Không rõ';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setSearchTerm('');
    setDateRange({ from: '', to: '' });
  };

  // Thống kê theo trạng thái
  const getStats = () => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === 'PENDING').length,
      processing: orders.filter(o => o.status === 'PROCESSING').length,
      shipping: orders.filter(o => o.status === 'SHIPPED').length,
      delivered: orders.filter(o => o.status === 'DELIVERED').length,
      cancelled: orders.filter(o => o.status === 'CANCELLED').length
    };
  };

  if (loading) {
    return (
      <div className="order-history-loading">
        <div className="spinner"></div>
        <p>Đang tải lịch sử đơn hàng...</p>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="order-history-container">
      <div className="order-history-header">
        <h1>📜 Lịch Sử Đặt Hàng</h1>
        <p className="order-count">Tổng số: {filteredOrders.length} đơn hàng</p>
      </div>

      {/* Bộ lọc */}
      <div className="order-filters">
        <div className="filter-group">
          <label>🔍 Tìm kiếm</label>
          <input
            type="text"
            placeholder="Mã đơn, tên, số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <label>📌 Trạng thái</label>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-select"
          >
            <option value="all">Tất cả</option>
            <option value="PENDING">⏳ Chờ xác nhận</option>
            <option value="PROCESSING">⚙️ Đang xử lý</option>
            <option value="SHIPPED">🚚 Đang giao</option>
            <option value="DELIVERED">📦 Đã giao</option>
            <option value="CANCELLED">❌ Đã hủy</option>
          </select>
        </div>

        <div className="filter-group">
          <label>📅 Từ ngày</label>
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
            className="date-input"
          />
        </div>

        <div className="filter-group">
          <label>📅 Đến ngày</label>
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
            className="date-input"
          />
        </div>

        {(statusFilter !== 'all' || searchTerm || dateRange.from || dateRange.to) && (
          <button className="btn-clear-filters" onClick={clearFilters}>
            🗑️ Xóa lọc
          </button>
        )}
      </div>

      {/* Thống kê nhanh */}
      <div className="order-stats">
        <div className="stat-card">
          <span className="stat-icon">📦</span>
          <div className="stat-info">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Tổng đơn</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">⏳</span>
          <div className="stat-info">
            <span className="stat-value">{stats.pending + stats.processing}</span>
            <span className="stat-label">Đang xử lý</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🚚</span>
          <div className="stat-info">
            <span className="stat-value">{stats.shipping}</span>
            <span className="stat-label">Đang giao</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">✅</span>
          <div className="stat-info">
            <span className="stat-value">{stats.delivered}</span>
            <span className="stat-label">Đã giao</span>
          </div>
        </div>
      </div>

      {/* Danh sách đơn hàng */}
      {filteredOrders.length === 0 ? (
        <div className="order-history-empty">
          <div className="empty-icon">📭</div>
          <h3>Không có đơn hàng nào</h3>
          <p>
            {orders.length === 0 
              ? 'Bạn chưa đặt đơn hàng nào' 
              : 'Không tìm thấy đơn hàng phù hợp với bộ lọc'}
          </p>
          <button onClick={() => navigate('/figures')} className="btn-shop-now">
            🛍️ Mua sắm ngay
          </button>
        </div>
      ) : (
        <div className="order-list">
          {filteredOrders.map((order) => {
            const status = getStatusBadge(order.status);
            return (
              <div key={order.id} className="order-card">
                <div className="order-card-header">
                  <div className="order-info">
                    <div className="order-code">
                      <span className="label">Mã đơn:</span>
                      <strong>{order.orderCode}</strong>
                    </div>
                    <div className="order-date">
                      <span className="label">Ngày đặt:</span>
                      <span>{formatDate(order.createdAt)}</span>
                    </div>
                  </div>
                  <div className="order-status">
                    <span className={status.class}>
                      {status.icon} {status.text}
                    </span>
                    <div className="order-total">
                      <span className="label">Tổng tiền:</span>
                      <strong>{order.totalAmount?.toLocaleString()}đ</strong>
                    </div>
                  </div>
                </div>

                <div className="order-items-preview">
                  <div className="items-scroll">
                    {(order.items || []).slice(0, 3).map((item, idx) => (
                      <div key={idx} className="preview-item">
                        <img 
                          src={item.figure?.image || item.imageUrl || '/default-figure.jpg'}
                          alt={item.figure?.name}
                          onError={(e) => e.target.src = '/default-figure.jpg'}
                        />
                        <div className="preview-info">
                          <p className="item-name">{item.figure?.name}</p>
                          <p className="item-meta">
                            {item.quantity} x {item.price?.toLocaleString()}đ
                          </p>
                        </div>
                      </div>
                    ))}
                    {(order.items?.length || 0) > 3 && (
                      <div className="more-items">
                        +{(order.items.length - 3)} sản phẩm khác
                      </div>
                    )}
                  </div>
                </div>

                <div className="order-card-footer">
                  <div className="shipping-summary">
                    <span>📦 {order.shippingName}</span>
                    <span>📞 {order.shippingPhone}</span>
                  </div>
                  <div className="order-actions">
                    <button 
                      className="btn-view"
                      onClick={() => handleViewDetail(order.id)}
                    >
                      👁️ Xem chi tiết
                    </button>
                    {order.status === 'PENDING' && (
                      <button 
                        className="btn-cancel"
                        onClick={() => handleCancelOrder(order.id)}
                      >
                        ❌ Hủy đơn
                      </button>
                    )}
                    {order.status === 'DELIVERED' && (
                      <button 
                        className="btn-reorder"
                        onClick={() => handleReorder(order)}
                      >
                        🔄 Đặt lại
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default OrderHistory;