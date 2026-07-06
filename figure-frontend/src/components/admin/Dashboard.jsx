import React, { useState, useEffect } from 'react';
import { FaBox, FaTags, FaUsers, FaShoppingBag, FaDollarSign, FaChartLine, FaExclamationTriangle } from 'react-icons/fa';
import axiosClient from '../../api/axiosClient';
import '../../styles/Dashboard.css';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalCategories: 0,
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('🔄 Bắt đầu lấy dữ liệu dashboard...');
            
            // Debug token và user info
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            
            console.log('🔍 Debug session:', {
                hasToken: !!token,
                userRole: user?.role || 'Không có role',
                userName: user?.name || user?.username || 'Không có tên'
            });
            
            // Thử gọi API với debug
            console.log('🌐 Testing endpoints...');
            
            // Test từng endpoint riêng biệt để debug
            try {
                console.log('Testing: /admin/products');
                const productsRes = await axiosClient.get('/admin/products');
                console.log('✅ /admin/products response:', productsRes.data?.length || 0);
                
                console.log('Testing: /admin/categories');
                const categoriesRes = await axiosClient.get('/admin/categories');
                console.log('✅ /admin/categories response:', categoriesRes.data?.length || 0);
                
                console.log('Testing: /admin/users');
                const usersRes = await axiosClient.get('/admin/users');
                console.log('✅ /admin/users response:', usersRes.data?.length || 0);
                
                console.log('Testing: /admin/orders');
                const ordersRes = await axiosClient.get('/admin/orders');
                console.log('✅ /admin/orders response:', ordersRes.data?.length || 0);
                
                // Lấy dữ liệu
                const products = productsRes.data || [];
                const categories = categoriesRes.data || [];
                const users = usersRes.data || [];
                const orders = ordersRes.data || [];
                
                console.log('📊 Dữ liệu nhận được:', {
                    products: products.length,
                    categories: categories.length,
                    users: users.length,
                    orders: orders.length
                });
                
                // Tính toán thống kê
                const revenue = orders.reduce((sum, order) => {
                    const amount = parseFloat(order.totalAmount) || parseFloat(order.total) || 0;
                    return sum + amount;
                }, 0);
                
                const pendingOrdersCount = orders.filter(order => {
                    const status = (order.status || '').toUpperCase();
                    return status === 'PENDING' || status === 'CHỜ XỬ LÝ';
                }).length;
                
                setStats({
                    totalProducts: products.length,
                    totalCategories: categories.length,
                    totalUsers: users.length,
                    totalOrders: orders.length,
                    totalRevenue: revenue,
                    pendingOrders: pendingOrdersCount
                });
                
                // Lấy 5 đơn hàng gần nhất
                const sortedOrders = [...orders]
                    .sort((a, b) => {
                        const dateA = new Date(a.createdAt || a.createdDate || a.orderDate || 0);
                        const dateB = new Date(b.createdAt || b.createdDate || b.orderDate || 0);
                        return dateB - dateA;
                    })
                    .slice(0, 5);
                setRecentOrders(sortedOrders);
                
            } catch (apiError) {
                console.error('❌ Lỗi API chi tiết:', {
                    message: apiError.message,
                    status: apiError.response?.status,
                    statusText: apiError.response?.statusText,
                    url: apiError.config?.url,
                    data: apiError.response?.data
                });
                
                if (apiError.response?.status === 403) {
                    setError({
                        type: 'auth',
                        message: 'Không có quyền truy cập. Vui lòng đăng nhập với tài khoản ADMIN.'
                    });
                } else if (apiError.response?.status === 401) {
                    setError({
                        type: 'session',
                        message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
                    });
                } else {
                    setError({
                        type: 'server',
                        message: 'Không thể kết nối đến server. Vui lòng thử lại sau.'
                    });
                }
            }
            
        } catch (error) {
            console.error('❌ Lỗi khi lấy dữ liệu dashboard:', error);
            setError({
                type: 'network',
                message: 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        fetchDashboardData();
    };

    const handleLoginRedirect = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return '0 ₫';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Ngày không hợp lệ';
        }
    };

    const getStatusColor = (status) => {
        if (!status) return '';
        const statusUpper = (status || '').toUpperCase();
        if (statusUpper.includes('PENDING') || statusUpper.includes('CHỜ')) return 'status-pending';
        if (statusUpper.includes('PROCESSING') || statusUpper.includes('XỬ LÝ')) return 'status-processing';
        if (statusUpper.includes('SHIPPED') || statusUpper.includes('GIAO')) return 'status-shipped';
        if (statusUpper.includes('DELIVERED') || statusUpper.includes('GIAO')) return 'status-delivered';
        if (statusUpper.includes('CANCELLED') || statusUpper.includes('HỦY')) return 'status-cancelled';
        return '';
    };

    const translateStatus = (status) => {
        if (!status) return 'KHÔNG XÁC ĐỊNH';
        const statusUpper = (status || '').toUpperCase();
        if (statusUpper.includes('PENDING')) return 'CHỜ XỬ LÝ';
        if (statusUpper.includes('PROCESSING')) return 'ĐANG XỬ LÝ';
        if (statusUpper.includes('SHIPPED')) return 'ĐANG GIAO';
        if (statusUpper.includes('DELIVERED')) return 'ĐÃ GIAO';
        if (statusUpper.includes('CANCELLED')) return 'ĐÃ HỦY';
        return status;
    };

    const statCards = [
        { 
            title: 'Tổng sản phẩm', 
            value: stats.totalProducts, 
            icon: <FaBox />, 
            color: 'blue',
            description: 'Sản phẩm trong kho'
        },
        { 
            title: 'Danh mục', 
            value: stats.totalCategories, 
            icon: <FaTags />, 
            color: 'green',
            description: 'Danh mục sản phẩm'
        },
        { 
            title: 'Người dùng', 
            value: stats.totalUsers, 
            icon: <FaUsers />, 
            color: 'purple',
            description: 'Người dùng đã đăng ký'
        },
        { 
            title: 'Tổng đơn hàng', 
            value: stats.totalOrders, 
            icon: <FaShoppingBag />, 
            color: 'orange',
            description: 'Đơn hàng đã đặt'
        },
        { 
            title: 'Doanh thu', 
            value: formatCurrency(stats.totalRevenue), 
            icon: <FaDollarSign />, 
            color: 'red',
            description: 'Tổng doanh thu'
        },
        { 
            title: 'Đơn chờ xử lý', 
            value: stats.pendingOrders, 
            icon: <FaChartLine />, 
            color: 'yellow',
            description: 'Đơn hàng đang chờ'
        },
    ];

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
                <p>Đang tải dữ liệu...</p>
                <small>Đang kết nối đến server...</small>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-error">
                <div className="error-icon">
                    <FaExclamationTriangle />
                </div>
                <h3>Không thể tải dữ liệu</h3>
                <p className="error-message">{error.message}</p>
                
                {error.type === 'auth' && (
                    <div className="error-actions">
                        <button onClick={handleLoginRedirect} className="btn-login">
                            Đăng nhập lại
                        </button>
                        <button onClick={handleRefresh} className="btn-retry">
                            Thử lại
                        </button>
                    </div>
                )}
                
                {error.type === 'session' && (
                    <div className="error-actions">
                        <button onClick={handleLoginRedirect} className="btn-login">
                            Đăng nhập lại
                        </button>
                    </div>
                )}
                
                {error.type === 'server' && (
                    <div className="error-actions">
                        <button onClick={handleRefresh} className="btn-retry">
                            Thử lại
                        </button>
                        <small>Kiểm tra xem backend có đang chạy không</small>
                    </div>
                )}
                
                <div className="debug-info">
                    <p>Debug Info:</p>
                    <small>API Base URL: {axiosClient.defaults.baseURL}</small><br/>
                    <small>Endpoints: /admin/products, /admin/categories, /admin/users, /admin/orders</small>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <h1 className="dashboard-title">Tổng quan Dashboard</h1>
                <div className="header-actions">
                    <button onClick={handleRefresh} className="refresh-btn">
                        ⟳ Làm mới
                    </button>
                    <div className="user-info">
                        <small>Xin chào, ADMIN</small>
                    </div>
                </div>
            </div>
            
            <div className="stats-grid">
                {statCards.map((stat, index) => (
                    <div key={index} className={`stat-card ${stat.color}`}>
                        <div className="stat-header">
                            <div className="stat-icon">{stat.icon}</div>
                            <h3>{stat.title}</h3>
                        </div>
                        <div className="stat-value">{stat.value}</div>
                        <div className="stat-description">{stat.description}</div>
                    </div>
                ))}
            </div>
            
            <div className="dashboard-sections">
                <div className="dashboard-section">
                    <div className="section-header">
                        <h2>Đơn hàng gần đây</h2>
                        <div className="section-info">
                            <span className="order-count">Tổng: {stats.totalOrders} đơn</span>
                            <span className="revenue">Doanh thu: {formatCurrency(stats.totalRevenue)}</span>
                        </div>
                    </div>
                    {recentOrders.length > 0 ? (
                        <div className="recent-orders">
                            <table className="orders-table">
                                <thead>
                                    <tr>
                                        <th>Mã đơn</th>
                                        <th>Khách hàng</th>
                                        <th>Ngày đặt</th>
                                        <th>Tổng tiền</th>
                                        <th>Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((order, index) => (
                                        <tr key={order.id || index}>
                                            <td className="order-code">
                                                {order.orderCode || order.id?.substring(0, 8) || `ORD${index + 1}`}
                                            </td>
                                            <td className="customer-name">
                                                {order.user?.name || 
                                                 order.user?.username || 
                                                 order.customerName || 
                                                 order.userEmail ||
                                                 'Khách vãng lai'}
                                            </td>
                                            <td className="order-date">{formatDate(order.createdAt)}</td>
                                            <td className="order-amount">{formatCurrency(order.totalAmount || order.total)}</td>
                                            <td>
                                                <span className={`order-status ${getStatusColor(order.status)}`}>
                                                    {translateStatus(order.status)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="no-data">
                            <p>📭 Chưa có đơn hàng nào</p>
                            <small>Đơn hàng mới sẽ hiển thị ở đây</small>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="debug-info">
                <small>
                    API: {axiosClient.defaults.baseURL} | 
                    Sản phẩm: {stats.totalProducts} | 
                    Đơn hàng: {stats.totalOrders}
                </small>
            </div>
        </div>
    );
};

export default Dashboard;