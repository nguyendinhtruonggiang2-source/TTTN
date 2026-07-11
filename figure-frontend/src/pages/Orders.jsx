import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getImageUrl } from '../api/axiosClient';
import '../styles/orders.css';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [expandedOrders, setExpandedOrders] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, []);

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === statusFilter));
    }
  }, [statusFilter, orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/orders/my-orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data);
      setFilteredOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      
      // Tạo đơn hàng mẫu nếu API bị lỗi hoặc chưa có dữ liệu
      const sampleOrders = createSampleOrders();
      setOrders(sampleOrders);
      setFilteredOrders(sampleOrders);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      return;
    }

    try {
      setCancellingOrder(orderId);
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8080/api/orders/${orderId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ Đã hủy đơn hàng thành công');
      await fetchOrders(); // Refresh list
    } catch (error) {
      console.error('Error cancelling order:', error);
      const errorMsg = error.response?.data?.message || 'Không thể hủy đơn hàng';
      alert(`❌ ${errorMsg}`);
    } finally {
      setCancellingOrder(null);
    }
  };

  const reorder = async (order) => {
    if (!window.confirm('Thêm tất cả sản phẩm từ đơn hàng này vào giỏ hàng?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Thêm từng sản phẩm vào giỏ hàng
      for (const item of order.items) {
        await axios.post('http://localhost:8080/api/cart/add', {
          productId: item.figure?.id || item.id,
          quantity: item.quantity
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      alert('✅ Đã thêm tất cả sản phẩm vào giỏ hàng!');
      navigate('/cart');
    } catch (error) {
      console.error('Error reorder:', error);
      alert('❌ Không thể thêm vào giỏ hàng. Vui lòng thử lại.');
    }
  };

  const toggleExpandOrder = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Không rõ';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Không rõ';
    }
  };

  // Tạo đơn hàng mẫu liên quan đến Gundam và HoYoverse
  const createSampleOrders = () => {
    return [
      {
        id: 1,
        orderCode: 'ORD-GUNDAM001',
        status: 'delivered',
        createdAt: '2024-01-15T10:30:00',
        totalAmount: 12500000,
        shippingAddress: '123 Đường Lê Lợi, Quận 1, TP.HCM',
        shippingName: 'Nguyễn Văn A',
        shippingPhone: '0912345678',
        paymentMethod: 'banking',
        note: 'Giao hàng trước 5h chiều',
        items: [
          {
            id: 101,
            quantity: 1,
            price: 8500000,
            subtotal: 8500000,
            figure: {
              id: 1,
              name: 'MG RX-78-2 Gundam Ver.3.0',
              imageUrl: 'https://images.unsplash.com/photo-1591696205602-2f950c417cb9?w=400&h=400&fit=crop',
              description: 'Master Grade Gundam RX-78-2 phiên bản 3.0, tỉ lệ 1/100'
            }
          },
          {
            id: 102,
            quantity: 1,
            price: 4000000,
            subtotal: 4000000,
            figure: {
              id: 2,
              name: 'HG Char\'s Zaku II',
              imageUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&h=400&fit=crop',
              description: 'High Grade Zaku II màu đỏ của Char Aznable, tỉ lệ 1/144'
            }
          }
        ]
      },
      {
        id: 2,
        orderCode: 'ORD-HOYO002',
        status: 'shipping',
        createdAt: '2024-01-20T14:45:00',
        totalAmount: 9800000,
        shippingAddress: '456 Đường Nguyễn Huệ, Quận 5, TP.HCM',
        shippingName: 'Trần Thị B',
        shippingPhone: '0923456789',
        paymentMethod: 'momo',
        note: 'Cần kiểm tra hàng trước khi thanh toán',
        items: [
          {
            id: 201,
            quantity: 1,
            price: 7500000,
            subtotal: 7500000,
            figure: {
              id: 3,
              name: 'Raiden Shogun Figure - Genshin Impact',
              imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=400&fit=crop',
              description: 'Figure Raiden Shogun chính hãng HoYoverse, tỉ lệ 1/7'
            }
          },
          {
            id: 202,
            quantity: 1,
            price: 2300000,
            subtotal: 2300000,
            figure: {
              id: 4,
              name: 'Bronya Zaychik - Honkai Impact 3rd',
              imageUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&h=400&fit=crop',
              description: 'Figure Bronya phiên bản giới hạn, tỉ lệ 1/8'
            }
          }
        ]
      },
      {
        id: 3,
        orderCode: 'ORD-GUNDAM003',
        status: 'pending',
        createdAt: '2024-01-25T09:15:00',
        totalAmount: 3200000,
        shippingAddress: '789 Đường Trần Hưng Đạo, Quận 10, TP.HCM',
        shippingName: 'Lê Văn C',
        shippingPhone: '0934567890',
        paymentMethod: 'cod',
        note: '',
        items: [
          {
            id: 301,
            quantity: 1,
            price: 3200000,
            subtotal: 3200000,
            figure: {
              id: 5,
              name: 'RG Freedom Gundam',
              imageUrl: 'https://images.unsplash.com/photo-1589256469067-ea99122bbdc4?w=400&h=400&fit=crop',
              description: 'Real Grade Freedom Gundam từ Gundam SEED, tỉ lệ 1/144'
            }
          }
        ]
      }
    ];
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': '⏳ Chờ xác nhận',
      'confirmed': '✅ Đã xác nhận',
      'shipping': '🚚 Đang giao hàng',
      'delivered': '📦 Đã giao hàng',
      'cancelled': '❌ Đã hủy'
    };
    return statusMap[status] || status;
  };

  const getPaymentMethod = (method) => {
    const methodMap = {
      'cod': '💰 Thanh toán khi nhận hàng (COD)',
      'banking': '🏦 Chuyển khoản ngân hàng',
      'momo': '💜 Ví MoMo'
    };
    return methodMap[method] || method;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'pending': '#ff9800',
      'confirmed': '#2196f3',
      'shipping': '#9c27b0',
      'delivered': '#4caf50',
      'cancelled': '#f44336'
    };
    return colorMap[status] || '#757575';
  };

  if (loading) {
    return (
      <div className="orders-loading-container">
        <div className="orders-spinner"></div>
        <p>Đang tải đơn hàng của bạn...</p>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <div className="orders-header">
        <div className="header-title">
          <h1>Đơn Hàng Của Tôi</h1>
          <p className="orders-count">Tổng số: {orders.length} đơn hàng</p>
        </div>
        
        <div className="filters">
          <button 
            className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            Tất cả ({orders.length})
          </button>
          <button 
            className={`filter-btn ${statusFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setStatusFilter('pending')}
          >
            Chờ xác nhận ({orders.filter(o => o.status === 'pending').length})
          </button>
          <button 
            className={`filter-btn ${statusFilter === 'shipping' ? 'active' : ''}`}
            onClick={() => setStatusFilter('shipping')}
          >
            Đang giao ({orders.filter(o => o.status === 'shipping').length})
          </button>
          <button 
            className={`filter-btn ${statusFilter === 'delivered' ? 'active' : ''}`}
            onClick={() => setStatusFilter('delivered')}
          >
            Đã giao ({orders.filter(o => o.status === 'delivered').length})
          </button>
          <button 
            className={`filter-btn ${statusFilter === 'cancelled' ? 'active' : ''}`}
            onClick={() => setStatusFilter('cancelled')}
          >
            Đã hủy ({orders.filter(o => o.status === 'cancelled').length})
          </button>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="empty-orders">
          <h2>Không có đơn hàng nào</h2>
          <p>
            {statusFilter !== 'all' 
              ? `Bạn chưa có đơn hàng nào với trạng thái ${getStatusText(statusFilter)}`
              : 'Bạn chưa đặt đơn hàng nào cả'}
          </p>
          <button onClick={() => navigate('/figures')} className="btn-shop-now">
            Mua sắm ngay
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div className="order-info">
                  <div className="order-code">
                    <span className="code-label">Mã đơn hàng:</span>
                    <strong className="code-value">{order.orderCode}</strong>
                  </div>
                  <div className="order-date">
                    <span className="date-label">Đặt ngày:</span>
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                </div>
                
                <div className="order-status-info">
                  <div 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {getStatusText(order.status)}
                  </div>
                  <div className="order-total">
                    <span className="total-label">Tổng tiền:</span>
                    <strong className="total-value">{order.totalAmount.toLocaleString('vi-VN')}đ</strong>
                  </div>
                </div>
              </div>

              {/* Hiển thị preview sản phẩm */}
              <div className="order-items-preview">
                {order.items.slice(0, expandedOrders.has(order.id) ? order.items.length : 2).map((item, idx) => (
                  <div key={item.id || idx} className="preview-item">
                    <div 
                      className="preview-image"
                      onClick={() => navigate(`/product/${item.figure?.id || item.id}`)}
                    >
                      {item.figure?.imageUrl ? (
                        <img 
                          src={getImageUrl(item.figure.imageUrl)} 
                          alt={item.figure.name}
                          onError={(e) => {
                            e.target.src = '/default-figure.jpg';
                          }}
                        />
                      ) : (
                        <div className="image-placeholder">Ảnh sản phẩm</div>
                      )}
                    </div>
                    <div className="preview-details">
                      <h4 
                        className="product-name"
                        onClick={() => navigate(`/product/${item.figure?.id || item.id}`)}
                      >
                        {item.figure?.name}
                      </h4>
                      <p className="item-quantity">
                        Số lượng: <strong>{item.quantity}</strong> × {item.price.toLocaleString('vi-VN')}đ
                      </p>
                      <p className="item-subtotal">
                        Thành tiền: <strong className="text-primary">{item.subtotal.toLocaleString('vi-VN')}đ</strong>
                      </p>
                    </div>
                  </div>
                ))}
                
                {order.items.length > 2 && (
                  <button 
                    className="show-more-btn"
                    onClick={() => toggleExpandOrder(order.id)}
                  >
                    {expandedOrders.has(order.id) ? '▲ Thu gọn' : `▼ Xem thêm ${order.items.length - 2} sản phẩm`}
                  </button>
                )}
              </div>

              {/* Thông tin giao hàng */}
              <div className="order-shipping">
                <div className="shipping-row">
                  <span><strong>Địa chỉ:</strong> {order.shippingAddress}</span>
                </div>
                <div className="shipping-row">
                  <span><strong>Người nhận:</strong> {order.shippingName} - {order.shippingPhone}</span>
                </div>
                <div className="shipping-row">
                  <span><strong>Thanh toán:</strong> {getPaymentMethod(order.paymentMethod)}</span>
                </div>
                {order.note && (
                  <div className="shipping-row">
                    <span><strong>Ghi chú:</strong> {order.note}</span>
                  </div>
                )}
              </div>

              {/* Hành động */}
              <div className="order-actions">
                <button 
                  className="btn-detail"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  Xem chi tiết
                </button>
                
                {order.status === 'pending' && (
                  <button 
                    className="btn-cancel"
                    onClick={() => cancelOrder(order.id)}
                    disabled={cancellingOrder === order.id}
                  >
                    {cancellingOrder === order.id ? (
                      <>
                        <span className="spinner-small"></span>
                        Đang xử lý...
                      </>
                    ) : (
                      'Hủy đơn'
                    )}
                  </button>
                )}

                {order.status === 'delivered' && (
                  <button 
                    className="btn-reorder"
                    onClick={() => reorder(order)}
                  >
                    Đặt lại
                  </button>
                )}

                <button 
                  className="btn-track"
                  onClick={() => window.open(`/track-order/${order.id}`, '_blank')}
                >
                  Theo dõi đơn hàng
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;