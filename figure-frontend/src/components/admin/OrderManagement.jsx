import React, { useState, useEffect } from 'react';
import { FaSearch, FaEye, FaShippingFast, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import axiosClient, { getImageUrl } from '../../api/axiosClient';
import '../../styles/OrderManagement.css';

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/admin/orders');
            const sortedOrders = (response.data || []).sort((a, b) => b.id - a.id);
            setOrders(sortedOrders);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleStatusFilter = (e) => {
        setSelectedStatus(e.target.value);
    };

    const filteredOrders = orders.filter(order => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
            order.orderCode?.toLowerCase().includes(searchLower) ||
            order.shippingName?.toLowerCase().includes(searchLower) ||
            order.shippingPhone?.includes(searchLower);
        
        const matchesStatus = !selectedStatus || order.status === selectedStatus;
        
        return matchesSearch && matchesStatus;
    });

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setShowDetailModal(true);
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        if (!window.confirm(`Bạn có chắc muốn cập nhật trạng thái đơn hàng thành "${getStatusText(newStatus)}"?`)) {
            return;
        }

        try {
            await axiosClient.put(`/admin/orders/${orderId}/status?status=${newStatus}`);
            await fetchOrders();
            alert('✅ Cập nhật trạng thái thành công');
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('❌ Cập nhật trạng thái thất bại');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount || 0);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusText = (status) => {
        switch(status) {
            case 'PENDING': return 'Chờ xác nhận';
            case 'PROCESSING': return 'Đang xử lý';
            case 'SHIPPED': return 'Đang giao';
            case 'DELIVERED': return 'Đã giao';
            case 'CANCELLED': return 'Đã hủy';
            default: return status;
        }
    };

    const getStatusInfo = (status) => {
        if (!status) return { label: '', color: '#666', icon: '❓' };
        switch(status.toUpperCase()) {
            case 'PENDING':
                return { label: 'Chờ xác nhận', color: '#fa8c16', icon: '⏳' };
            case 'PROCESSING':
                return { label: 'Đang xử lý', color: '#1890ff', icon: '⚙️' };
            case 'SHIPPED':
                return { label: 'Đang giao', color: '#722ed1', icon: '🚚' };
            case 'DELIVERED':
                return { label: 'Đã giao', color: '#52c41a', icon: '✅' };
            case 'CANCELLED':
                return { label: 'Đã hủy', color: '#ff4d4f', icon: '❌' };
            case 'CANCELLING':
                return { label: 'Khách yêu cầu hủy', color: '#fa541c', icon: '⚠️' };
            default:
                return { label: status, color: '#666', icon: '❓' };
        }
    };

    const getStatusOptions = (currentStatus) => {
        if (!currentStatus) return [];
        const statusUpper = currentStatus.toUpperCase();
        const allStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
        const orderFlow = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
        
        if (statusUpper === 'CANCELLED') {
            return [];
        }
        if (statusUpper === 'CANCELLING') {
            return ['PENDING', 'PROCESSING', 'CANCELLED'];
        }
        
        const currentIndex = orderFlow.indexOf(statusUpper);
        if (currentIndex !== -1) {
            return orderFlow.slice(currentIndex + 1);
        }
        
        return allStatuses.filter(status => status !== statusUpper && status !== 'CANCELLED');
    };

    return (
        <div className="order-management">
            <div className="page-header">
                <h1>Quản lý đơn hàng</h1>
            </div>

            <div className="filters">
                <div className="search-box">
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo mã đơn, tên, số điện thoại..."
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>
                <select value={selectedStatus} onChange={handleStatusFilter}>
                    <option value="">Tất cả trạng thái</option>
                    <option value="PENDING">⏳ Chờ xác nhận</option>
                    <option value="PROCESSING">⚙️ Đang xử lý</option>
                    <option value="SHIPPED">🚚 Đang giao</option>
                    <option value="DELIVERED">✅ Đã giao</option>
                    <option value="CANCELLED">❌ Đã hủy</option>
                </select>
            </div>

            {loading ? (
                <div className="loading">Đang tải...</div>
            ) : filteredOrders.length === 0 ? (
                <div className="no-data">
                    <p>Không tìm thấy đơn hàng nào</p>
                </div>
            ) : (
                <div className="orders-table-container">
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>Mã đơn hàng</th>
                                <th>Khách hàng</th>
                                <th>Ngày đặt</th>
                                <th>Tổng tiền</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map(order => {
                                const statusInfo = getStatusInfo(order.status);
                                const statusOptions = getStatusOptions(order.status);
                                return (
                                    <tr key={order.id}>
                                        <td className="order-code-cell">
                                            <div className="order-code">{order.orderCode}</div>
                                            <div className="payment-method">{order.paymentMethod}</div>
                                        </td>
                                        <td className="customer-cell">
                                            <div className="customer-name">{order.shippingName}</div>
                                            <div className="customer-email">{order.shippingPhone}</div>
                                        </td>
                                        <td className="date-cell">{formatDate(order.createdAt)}</td>
                                        <td className="amount-cell">{formatCurrency(order.totalAmount)}</td>
                                        <td className="status-cell">
                                            <div className="status-container" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                <span 
                                                    className={`status-badge ${order.status.toLowerCase()}`}
                                                >
                                                    {statusInfo.icon} {statusInfo.label}
                                                </span>
                                                {order.status.toUpperCase() === 'CANCELLING' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
                                                        className="confirm-cancel-btn"
                                                        style={{
                                                            padding: '4px 10px',
                                                            backgroundColor: '#ff4d4f',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            fontWeight: 'bold',
                                                            fontSize: '11px',
                                                            transition: 'background-color 0.2s'
                                                        }}
                                                        onMouseOver={(e) => e.target.style.backgroundColor = '#ff7875'}
                                                        onMouseOut={(e) => e.target.style.backgroundColor = '#ff4d4f'}
                                                    >
                                                        Xác nhận hủy
                                                    </button>
                                                )}
                                                {statusOptions.length > 0 && (
                                                    <select
                                                        className="status-select"
                                                        value={order.status.toUpperCase()}
                                                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                                    >
                                                        <option value={order.status.toUpperCase()}>
                                                            → Cập nhật
                                                        </option>
                                                        {statusOptions.map(status => {
                                                            const optionInfo = getStatusInfo(status);
                                                            return (
                                                                <option key={status} value={status}>
                                                                    {optionInfo.icon} {optionInfo.label}
                                                                </option>
                                                            );
                                                        })}
                                                    </select>
                                                )}
                                            </div>
                                        </td>
                                        <td className="actions-cell">
                                            <div className="actions">
                                                <button 
                                                    className="action-btn view-btn"
                                                    onClick={() => handleViewDetails(order)}
                                                    title="Xem chi tiết"
                                                >
                                                    <FaEye />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal chi tiết đơn hàng */}
            {showDetailModal && selectedOrder && (
                <div className="modal-overlay">
                    <div className="modal order-detail-modal">
                        <div className="modal-header">
                            <h2>Chi tiết đơn hàng</h2>
                            <button className="close-btn" onClick={() => setShowDetailModal(false)}>
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="order-info">
                                <div className="info-row">
                                    <span className="info-label">Mã đơn hàng:</span>
                                    <span className="info-value">{selectedOrder.orderCode}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Ngày đặt:</span>
                                    <span className="info-value">{formatDate(selectedOrder.createdAt)}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Trạng thái:</span>
                                    <span className="info-value">
                                        <span 
                                            className={`status-badge ${selectedOrder.status.toLowerCase()}`}
                                        >
                                            {getStatusInfo(selectedOrder.status).icon} 
                                            {getStatusInfo(selectedOrder.status).label}
                                        </span>
                                    </span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Phương thức thanh toán:</span>
                                    <span className="info-value">{selectedOrder.paymentMethod}</span>
                                </div>
                            </div>

                            <div className="customer-info">
                                <h3>Thông tin giao hàng</h3>
                                <div className="info-row">
                                    <span className="info-label">Người nhận:</span>
                                    <span className="info-value">{selectedOrder.shippingName}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Số điện thoại:</span>
                                    <span className="info-value">{selectedOrder.shippingPhone}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Email:</span>
                                    <span className="info-value">{selectedOrder.shippingEmail || 'Không có'}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Địa chỉ:</span>
                                    <span className="info-value">{selectedOrder.shippingAddress}</span>
                                </div>
                            </div>

                            <div className="order-items">
                                <h3>Sản phẩm đã đặt</h3>
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
                                        {selectedOrder.items?.map((item, index) => (
                                            <tr key={index}>
                                                <td className="product-cell">
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div className="product-image-container" style={{ width: '50px', height: '50px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e2e8f0', flexShrink: 0 }}>
                                                            <img 
                                                                src={getImageUrl(item.figure?.image || item.figure?.imageUrl || '/default-figure.jpg')} 
                                                                alt={item.figure?.name || item.productName} 
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            />
                                                        </div>
                                                        <div className="product-name" style={{ fontWeight: '600' }}>{item.figure?.name || item.productName}</div>
                                                    </div>
                                                </td>
                                                <td className="price-cell">{formatCurrency(item.price)}</td>
                                                <td className="quantity-cell">{item.quantity}</td>
                                                <td className="subtotal-cell">{formatCurrency(item.price * item.quantity)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="order-total">
                                <div className="total-row">
                                    <span className="total-label">Tổng cộng:</span>
                                    <span className="total-amount">{formatCurrency(selectedOrder.totalAmount)}</span>
                                </div>
                            </div>

                            {selectedOrder.note && (
                                <div className="order-note">
                                    <h3>Ghi chú</h3>
                                    <p>{selectedOrder.note}</p>
                                </div>
                            )}
                        </div>
                        <div className="modal-actions">
                            <button 
                                type="button" 
                                className="close-modal-btn" 
                                onClick={() => setShowDetailModal(false)}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManagement;