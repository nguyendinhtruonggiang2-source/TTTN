// src/pages/OrderDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axiosClient, { getImageUrl } from '../api/axiosClient';
import '../styles/orderDetail.css';

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get(`/orders/${id}`);
      console.log('Order detail response:', response.data);
      setOrder(response.data);
    } catch (err) {
      console.error('Error fetching order detail:', err);
      if (err.response?.status === 404) {
        setError('Không tìm thấy đơn hàng');
      } else if (err.response?.status === 401) {
        setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setError('Không thể tải thông tin đơn hàng');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) {
      return;
    }

    try {
      setCancelling(true);
      await axiosClient.post(`/orders/${id}/cancel`);
      alert('✅ Đã hủy đơn hàng thành công');
      await fetchOrderDetail();
    } catch (err) {
      console.error('Error cancelling order:', err);
      const errorMsg = err.response?.data?.message || 'Không thể hủy đơn hàng';
      alert(`❌ ${errorMsg}`);
    } finally {
      setCancelling(false);
    }
  };

  const handleReorder = async () => {
    if (!window.confirm('Thêm tất cả sản phẩm từ đơn hàng này vào giỏ hàng?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      for (const item of order.items) {
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



  if (loading) {
    return (
      <div className="order-detail-loading">
        <div className="spinner"></div>
        <p>Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-detail-error">
        <h3>⚠️ {error || 'Không tìm thấy đơn hàng'}</h3>
        <Link to="/orders" className="btn-back">
          ← Quay lại danh sách đơn hàng
        </Link>
      </div>
    );
  }

  return (
    <div className="order-detail-container">
      <div className="order-detail-header">
        <h1>📦 Chi Tiết Đơn Hàng</h1>
        <Link to="/orders" className="btn-back">
          ← Quay lại
        </Link>
      </div>

      <div className="order-info">
        <div className="info-row">
          <span>Mã đơn hàng:</span>
          <strong>{order.orderCode}</strong>
        </div>
        <div className="info-row">
          <span>Ngày đặt:</span>
          <span>{new Date(order.createdAt).toLocaleString('vi-VN')}</span>
        </div>
        <div className="info-row">
          <span>Trạng thái:</span>
          <span className={`status-badge ${order.status}`}>
            {getStatusText(order.status)}
          </span>
        </div>
        <div className="info-row">
          <span>Phương thức thanh toán:</span>
          <span>{getPaymentMethod(order.paymentMethod)}</span>
        </div>
      </div>

      <div className="shipping-info">
        <h3>📬 Thông tin giao hàng</h3>
        <p><strong>Người nhận:</strong> {order.shippingName}</p>
        <p><strong>Số điện thoại:</strong> {order.shippingPhone}</p>
        <p><strong>Email:</strong> {order.shippingEmail || 'Không có'}</p>
        <p><strong>Địa chỉ:</strong> {order.shippingAddress}</p>
        {order.note && <p><strong>Ghi chú:</strong> {order.note}</p>}
      </div>

      <div className="order-items">
        <h3>🛍️ Sản phẩm</h3>
        <table className="items-table">
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Đơn giá</th>
              <th>Số lượng</th>
              <th>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {order.items && order.items.map((item, index) => (
              <tr key={item.id || index}>
                <td>
                  <div className="product-cell">
                    <img 
                      src={getImageUrl(item.figure?.image || item.figure?.imageUrl)} 
                      alt={item.figure?.name || 'Sản phẩm'}
                      onError={(e) => e.target.src = '/default-figure.jpg'}
                    />
                    <span className="product-name">{item.figure?.name || 'Sản phẩm'}</span>
                  </div>
                </td>
                <td>{item.price?.toLocaleString() || 0}đ</td>
                <td>{item.quantity || 0}</td>
                <td>{((item.price || 0) * (item.quantity || 0)).toLocaleString()}đ</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="order-total">
        <div className="total-row">
          <span>Tạm tính:</span>
          <span>{(order.totalAmount - 30000).toLocaleString()}đ</span>
        </div>
        <div className="total-row">
          <span>Phí vận chuyển:</span>
          <span>30,000đ</span>
        </div>
        <div className="total-row grand-total">
          <span>Tổng cộng:</span>
          <span>{order.totalAmount?.toLocaleString() || 0}đ</span>
        </div>
      </div>

      <div className="order-actions">
        {(order.status?.toUpperCase() === 'PENDING' || order.status?.toUpperCase() === 'PROCESSING' || order.status?.toUpperCase() === 'WAITING_PAYMENT') && (
          <button 
            className="btn-cancel"
            onClick={handleCancelOrder}
            disabled={cancelling}
          >
            {cancelling ? (
              <>
                <span className="spinner-small"></span>
                Đang xử lý...
              </>
            ) : (
              '❌ Yêu cầu hủy đơn'
            )}
          </button>
        )}
        <button 
          className="btn-reorder"
          onClick={handleReorder}
        >
          🔄 Đặt lại
        </button>
      </div>
    </div>
  );
}

function getStatusText(status) {
  if (!status) return '';
  const statusMap = {
    'PENDING': '⏳ Chờ xác nhận',
    'PROCESSING': '⚙️ Đang xử lý',
    'SHIPPED': '🚚 Đang giao hàng',
    'DELIVERED': '📦 Đã giao hàng',
    'CANCELLED': '❌ Đã hủy',
    'CANCELLING': '⚠️ Đang chờ hủy',
    'WAITING_PAYMENT': '💳 Chờ thanh toán'
  };
  return statusMap[status.toUpperCase()] || status;
}

function getPaymentMethod(method) {
  const methodMap = {
    'cod': '💰 Thanh toán khi nhận hàng',
    'banking': '🏦 Chuyển khoản ngân hàng',
    'momo': '💜 Ví MoMo'
  };
  return methodMap[method] || method;
}

export default OrderDetail;