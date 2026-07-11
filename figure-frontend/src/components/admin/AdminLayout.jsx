import React, { useEffect, useState } from 'react';
import { FaBell, FaUserCircle } from 'react-icons/fa';
import { Outlet, useLocation } from 'react-router-dom';
import axiosClient, { getImageUrl } from '../../api/axiosClient';
import '../../styles/AdminLayout.css';
import AdminSidebar from './AdminSidebar';

const AdminLayout = ({ user, onLogout }) => {
    const location = useLocation();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (user) {
            fetchUnreadCount();
        }

        const handleNewNotification = (e) => {
            const data = e.detail;
            setUnreadCount(prev => prev + 1);
            setNotifications(prev => [data, ...prev]);
        };

        window.addEventListener('new-notification', handleNewNotification);
        return () => {
            window.removeEventListener('new-notification', handleNewNotification);
        };
    }, [user]);

    const fetchUnreadCount = async () => {
        try {
            const response = await axiosClient.get('/notifications/count');
            setUnreadCount(response.data?.admin || 0);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const fetchNotifications = async () => {
        try {
            const response = await axiosClient.get('/notifications?scope=admin&page=0&size=5');
            setNotifications(response.data.content || []);
            setShowNotifications(!showNotifications);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const markAsRead = async (id) => {
        try {
            await axiosClient.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => 
                n.id === id ? { ...n, isRead: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const getPageTitle = () => {
        const path = location.pathname;
        if (path.includes('/admin/dashboard') || path === '/admin') return 'Tổng quan';
        if (path.includes('/admin/products')) return 'Quản lý sản phẩm';
        if (path.includes('/admin/categories')) return 'Quản lý danh mục';
        if (path.includes('/admin/banners')) return 'Quản lý Banners';
        if (path.includes('/admin/branches')) return 'Quản lý chi nhánh';
        if (path.includes('/admin/posts')) return 'Quản lý bài viết';
        if (path.includes('/admin/promotions')) return 'Quản lý khuyến mãi';
        if (path.includes('/admin/flash-sale')) return 'Quản lý Flash Sale';
        if (path.includes('/admin/users')) return 'Quản lý người dùng';
        if (path.includes('/admin/orders')) return 'Quản lý đơn hàng';
        if (path.includes('/admin/ai-chat')) return 'Trợ lý AI';
        return 'Dashboard';
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <div className="admin-layout">
            <AdminSidebar user={user} onLogout={onLogout} />
            <div className="admin-content">
                <div className="admin-header">
                    <div className="header-left">
                        <h1>{getPageTitle()}</h1>
                        <div className="breadcrumb">
                            <span>Admin</span>
                            <span className="separator">/</span>
                            <span className="current">{getPageTitle()}</span>
                        </div>
                    </div>
                    <div className="header-right">
                        <div className="header-date">
                            <div className="date">{formatDate(currentTime)}</div>
                            <div className="time">{formatTime(currentTime)}</div>
                        </div>
                        
                        {/* Notifications Dropdown */}
                        <div className="notifications-dropdown">
                            <button 
                                className="notification-btn"
                                onClick={fetchNotifications}
                            >
                                <FaBell />
                                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                            </button>
                            {showNotifications && (
                                <div className="notification-menu">
                                    <div className="notification-header">
                                        <h4>Thông báo</h4>
                                        <button onClick={() => setShowNotifications(false)}>✕</button>
                                    </div>
                                    <div className="notification-list">
                                        {notifications.length === 0 ? (
                                            <div className="no-notifications">Không có thông báo mới</div>
                                        ) : (
                                            notifications.map(notif => (
                                                <div 
                                                    key={notif.id} 
                                                    className={`admin-notif-item ${!notif.isRead ? 'unread' : ''}`}
                                                    onClick={() => {
                                                        if (!notif.isRead) markAsRead(notif.id);
                                                        if (notif.redirectUrl) window.location.href = notif.redirectUrl;
                                                        setShowNotifications(false);
                                                    }}
                                                >
                                                    <div className="admin-notif-content">
                                                        <div className="admin-notif-title">{notif.title}</div>
                                                        <div className="admin-notif-message">{notif.content}</div>
                                                        <div className="admin-notif-time">
                                                            {new Date(notif.createdAt).toLocaleString('vi-VN')}
                                                        </div>
                                                    </div>
                                                    {!notif.isRead && <div className="admin-notif-unread-dot"></div>}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="admin-user-info">
                            <div className="user-avatar">
                                {user?.avatar ? (
                                    <img src={getImageUrl(user.avatar)} alt={user.username} />
                                ) : (
                                    <FaUserCircle />
                                )}
                            </div>
                            <div className="user-details">
                                <span className="admin-name">{user?.username || 'Admin'}</span>
                                <span className="user-role">Administrator</span>
                            </div>
                            <button className="logout-btn" onClick={onLogout}>
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                </div>
                <div className="admin-main">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;