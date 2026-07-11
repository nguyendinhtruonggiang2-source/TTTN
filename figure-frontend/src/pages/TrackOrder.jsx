// src/pages/TrackOrder.jsx
import React, { useEffect, useState } from 'react';
import {
    FaBox,
    FaCheckCircle,
    FaClock, FaMapMarkerAlt,
    FaMoneyBillAlt,
    FaPhoneAlt,
    FaSearch,
    FaShippingFast,
    FaSpinner
} from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import axiosClient, { getImageUrl } from '../api/axiosClient';
import '../styles/TrackOrder.css';

const TrackOrder = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [orderCode, setOrderCode] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (code) {
      setOrderCode(code);
      handleTrackOrder(code);
    }
  }, [code]);

  const handleTrackOrder = async (trackCode = orderCode) => {
    if (!trackCode.trim()) {
      setError('Vui lòng nhập mã đơn hàng');
      return;
    }
    
    setLoading(true);
    setError('');
    setSearched(true);
    
    try {
      const response = await axiosClient.get(`/track-order/${trackCode.trim()}`);
      setOrder(response.data);
    } catch (err) {
      console.error('Error tracking order:', err);
      if (err.response?.status === 404) {
        setError('Không tìm thấy đơn hàng với mã này');
      } else {
        setError('Có lỗi xảy ra, vui lòng thử lại sau');
      }
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    handleTrackOrder();
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'PENDING': return <FaClock className="status-icon pending" />;
      case 'PROCESSING': return <FaBox className="status-icon processing" />;
      case 'SHIPPED': return <FaShippingFast className="status-icon shipped" />;
      case 'DELIVERED': return <FaCheckCircle className="status-icon delivered" />;
      case 'CANCELLED': return <FaCheckCircle className="status-icon cancelled" />;
      default: return <FaBox className="status-icon" />;
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'PENDING': 'Chờ xác nhận',
      'PROCESSING': 'Đang xử lý',
      'SHIPPED': 'Đang giao hàng',
      'DELIVERED': 'Đã giao hàng',
      'CANCELLED': 'Đã hủy'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'PENDING': '#ff9800',
      'PROCESSING': '#2196f3',
      'SHIPPED': '#9c27b0',
      'DELIVERED': '#4caf50',
      'CANCELLED': '#f44336'
    };
    return colorMap[status] || '#757575';
  };

  const formatPrice = (price) => {
    return price?.toLocaleString() + '₫' || '0₫';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getEstimatedDeliveryDate = () => {
    if (!order?.createdAt) return 'N/A';
    const deliveryDate = new Date(order.createdAt);
    deliveryDate.setDate(deliveryDate.getDate() + 5);
    return deliveryDate.toLocaleDateString('vi-VN');
  };

  // Timeline steps
  const timelineSteps = [
    { status: 'PENDING', label: 'Đặt hàng', icon: '' },
    { status: 'PROCESSING', label: 'Xác nhận', icon: '' },
    { status: 'SHIPPED', label: 'Vận chuyển', icon: '' },
    { status: 'DELIVERED', label: 'Giao hàng', icon: '' }
  ];

  const getCurrentStepIndex = () => {
    const statusOrder = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    const index = statusOrder.indexOf(order?.status);
    return index >= 0 ? index : -1;
  };

  return (
    <div className="track-order-container">
      <div className="track-order-header">
        <h1>Theo dõi đơn hàng</h1>
        <p>Nhập mã đơn hàng để kiểm tra trạng thái</p>
      </div>

      {/* Search Form */}
      <form className="track-search-form" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Nhập mã đơn hàng (VD: ORD123456789)"
          value={orderCode}
          onChange={(e) => setOrderCode(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? <FaSpinner className="spinner" /> : <FaSearch />}
          {loading ? 'Đang tra cứu...' : 'Tra cứu'}
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="track-error">
          <span>⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {/* Order Result */}
      {order && (
        <div className="track-result">
          {/* Order Summary */}
          <div className="order-summary">
            <div className="summary-header">
              <h2>Đơn hàng #{order.orderCode}</h2>
              <span 
                className="status-badge"
                style={{ backgroundColor: getStatusColor(order.status) }}
              >
                {getStatusIcon(order.status)} {getStatusText(order.status)}
              </span>
            </div>
            <div className="summary-info">
              <div className="info-item">
                <span className="label">Ngày đặt:</span>
                <span className="value">{formatDate(order.createdAt)}</span>
              </div>
              <div className="info-item">
                <span className="label">Dự kiến giao:</span>
                <span className="value">{getEstimatedDeliveryDate()}</span>
              </div>
              <div className="info-item">
                <span className="label">Tổng tiền:</span>
                <span className="value total">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="track-timeline">
            <div className="timeline-steps">
              {timelineSteps.map((step, idx) => {
                const currentStep = getCurrentStepIndex();
                const isCompleted = idx <= currentStep;
                const isActive = idx === currentStep;
                const isCancelled = order.status === 'CANCELLED';
                
                return (
                  <div 
                    key={step.status} 
                    className={`timeline-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
                  >
                    <div className="step-icon">{step.icon}</div>
                    <div className="step-label">{step.label}</div>
                    {idx < timelineSteps.length - 1 && <div className="step-line"></div>}
                  </div>
                );
              })}
            </div>
            {order.status === 'CANCELLED' && (
              <div className="cancelled-note">
                Đơn hàng đã bị hủy
              </div>
            )}
          </div>

          {/* Shipping Info */}
          <div className="shipping-info">
            <h3>Thông tin giao hàng</h3>
            <div className="info-grid">
              <div className="info-item">
                <FaMapMarkerAlt className="info-icon" />
                <div>
                  <div className="label">Địa chỉ nhận hàng</div>
                  <div className="value">{order.shippingAddress}</div>
                </div>
              </div>
              <div className="info-item">
                <FaPhoneAlt className="info-icon" />
                <div>
                  <div className="label">Số điện thoại</div>
                  <div className="value">{order.shippingPhone}</div>
                </div>
              </div>
              <div className="info-item">
                <FaMoneyBillAlt className="info-icon" />
                <div>
                  <div className="label">Phương thức thanh toán</div>
                  <div className="value">{order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="order-items">
            <h3>Sản phẩm đã đặt</h3>
            <div className="items-list">
              {order.items?.map((item, idx) => (
                <div key={idx} className="item-card">
                  <div className="item-image">
                    <img src={getImageUrl(item.image || item.imageUrl || '/default-figure.jpg')} alt={item.name} />
                  </div>
                  <div className="item-details">
                    <div className="item-name">{item.name}</div>
                    <div className="item-quantity">Số lượng: {item.quantity}</div>
                    <div className="item-price">{formatPrice(item.price)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="track-actions">
            <button className="btn-primary" onClick={() => navigate('/')}>
              Tiếp tục mua sắm
            </button>
            {order.status === 'PENDING' && (
              <button className="btn-outline" onClick={() => navigate(`/orders/${order.id}`)}>
                Xem chi tiết đơn hàng
              </button>
            )}
          </div>
        </div>
      )}

      {searched && !loading && !order && !error && (
        <div className="no-result">
          <p>Nhập mã đơn hàng để tra cứu</p>
        </div>
      )}
    </div>
  );
};

export default TrackOrder;