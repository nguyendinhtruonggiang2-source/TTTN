// src/pages/Notifications.jsx
import React, { useEffect, useState } from 'react';
import {
    FaBell, FaCheck,
    FaClock,
    FaInfoCircle,
    FaShoppingBag,
    FaSpinner,
    FaTag,
    FaTrash
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import '../styles/Notifications.css';

const Notifications = () => {
  const navigate = useNavigate();
  
  // Lấy thông tin user đăng nhập
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const isAdmin = user?.roles?.includes("ROLE_ADMIN") || user?.username === "admin";

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [unreadCounts, setUnreadCounts] = useState({ total: 0, user: 0, admin: 0 });
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [categoryFilter, setCategoryFilter] = useState('all'); // all, ORDER, PROMOTION, SYSTEM
  const [activeTab, setActiveTab] = useState('user'); // user, admin
  const [filteredNotifications, setFilteredNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [currentPage, activeTab]);

  useEffect(() => {
    filterNotifications();
  }, [filter, categoryFilter, notifications]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get(`/notifications?scope=${activeTab}&page=${currentPage}&size=20`);
      setNotifications(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
      setFilteredNotifications(response.data.content || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await axiosClient.get('/notifications/count');
      const data = response.data;
      setUnreadCounts({
        total: data.total || data.count || 0,
        user: data.user || 0,
        admin: data.admin || 0
      });
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(0);
    setFilter('all');
  };

  const filterNotifications = () => {
    let temp = notifications;
    if (filter === 'unread') {
      temp = temp.filter(n => !n.isRead);
    } else if (filter === 'read') {
      temp = temp.filter(n => n.isRead);
    }
    
    if (categoryFilter !== 'all') {
      temp = temp.filter(n => n.type === categoryFilter);
    }
    setFilteredNotifications(temp);
  };

  const deleteNotification = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Bạn có chắc muốn xóa thông báo này?')) {
      return;
    }
    try {
      await axiosClient.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
      fetchUnreadCount();
    } catch (error) {
      console.error('Error deleting notification:', error);
      alert('Xóa thông báo thất bại');
    }
  };

  const handleMarkAsReadClick = (e, id) => {
    e.stopPropagation();
    markAsRead(id);
  };

  const markAsRead = async (id) => {
    try {
      await axiosClient.put(`/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCounts(prev => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
        [activeTab]: Math.max(0, prev[activeTab] - 1)
      }));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axiosClient.put('/notifications/read-all');
      setNotifications(prev => 
        prev.map(n => ({ ...n, isRead: true }))
      );
      setUnreadCounts({
        total: 0,
        user: 0,
        admin: 0
      });
      alert('✅ Đã đánh dấu tất cả là đã đọc');
    } catch (error) {
      console.error('Error marking all as read:', error);
      alert('❌ Có lỗi xảy ra');
    }
  };

  const deleteAllRead = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa tất cả thông báo đã đọc?')) {
      return;
    }
    
    try {
      await axiosClient.delete('/notifications/read-all');
      setNotifications(prev => prev.filter(n => !n.isRead));
      alert('✅ Đã xóa thông báo đã đọc');
    } catch (error) {
      console.error('Error deleting read notifications:', error);
      alert('❌ Có lỗi xảy ra');
    }
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'ORDER': return <FaShoppingBag className="icon order" />;
      case 'PROMOTION': return <FaTag className="icon promotion" />;
      case 'SYSTEM': return <FaInfoCircle className="icon system" />;
      default: return <FaBell className="icon default" />;
    }
  };

  const getNotificationBadge = (notification) => {
    const title = notification.title?.toLowerCase() || '';
    const content = notification.content?.toLowerCase() || '';
    const type = notification.type || '';
    
    if (type === 'ORDER' || title.includes('đơn hàng') || content.includes('đặt hàng')) {
      return <span className="fig-badge order-badge">📦 Đơn Hàng</span>;
    }
    if (type === 'PROMOTION' || title.includes('flash sale') || content.includes('khuyến mãi') || content.includes('giảm giá')) {
      return <span className="fig-badge promo-badge">🔥 Flash Sale</span>;
    }
    if (title.includes('bài viết') || content.includes('bài viết') || content.includes('tin tức')) {
      return <span className="fig-badge news-badge">📰 Tin Tức</span>;
    }
    if (type === 'SYSTEM' || title.includes('ai') || content.includes('trợ lý')) {
      return <span className="fig-badge ai-badge">🤖 Trợ Lý AI</span>;
    }
    return <span className="fig-badge default-badge">🔔 Hệ Thống</span>;
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    if (notification.redirectUrl) {
      navigate(notification.redirectUrl);
    }
  };

  if (loading) {
    return (
      <div className="notifications-loading">
        <FaSpinner className="spinner" />
        <p>Đang tải thông báo...</p>
      </div>
    );
  }

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h1>
          <FaBell className="header-icon" />
          Thông báo
          {unreadCounts.total > 0 && <span className="unread-badge">{unreadCounts.total}</span>}
        </h1>
        <div className="header-actions">
          <button className="mark-all-btn" onClick={markAllAsRead} disabled={unreadCounts.total === 0}>
            <FaCheck /> Đánh dấu đã đọc
          </button>
          <button className="delete-all-btn" onClick={deleteAllRead}>
            <FaTrash /> Xóa đã đọc
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="filter-tabs">
        <button 
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Tất cả ({notifications.length})
        </button>
        <button 
          className={`filter-tab ${filter === 'unread' ? 'active' : ''}`}
          onClick={() => setFilter('unread')}
        >
          Chưa đọc ({unreadCounts.user})
        </button>
        <button 
          className={`filter-tab ${filter === 'read' ? 'active' : ''}`}
          onClick={() => setFilter('read')}
        >
          Đã đọc ({notifications.length - unreadCounts.user})
        </button>
      </div>

      {/* Shopee Category Bar */}
      <div className="category-filter-bar">
        <button 
          className={`category-pill ${categoryFilter === 'all' ? 'active' : ''}`}
          onClick={() => setCategoryFilter('all')}
        >
          Tất cả
        </button>
        <button 
          className={`category-pill ${categoryFilter === 'ORDER' ? 'active' : ''}`}
          onClick={() => setCategoryFilter('ORDER')}
        >
          🛒 Đơn hàng
        </button>
        <button 
          className={`category-pill ${categoryFilter === 'PROMOTION' ? 'active' : ''}`}
          onClick={() => setCategoryFilter('PROMOTION')}
        >
          🔥 Khuyến mãi & Flash Sale
        </button>
        <button 
          className={`category-pill ${categoryFilter === 'SYSTEM' ? 'active' : ''}`}
          onClick={() => setCategoryFilter('SYSTEM')}
        >
          🤖 Chat AI & Hệ thống
        </button>
      </div>

      {/* Notifications list */}
      {filteredNotifications.length === 0 ? (
        <div className="empty-notifications">
          <FaBell className="empty-icon" />
          <p>Không có thông báo nào</p>
          <span>Bạn sẽ nhận được thông báo khi có đơn hàng hoặc khuyến mãi mới</span>
        </div>
      ) : (
        <div className="notifications-list">
          {filteredNotifications.map(notification => (
            <div 
              key={notification.id} 
              className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="notification-content">
                {getNotificationBadge(notification)}
                <div className="notification-title" style={{ marginTop: '6px' }}>{notification.title}</div>
                <div className="notification-message">{notification.content}</div>
                <div className="notification-time">
                  <FaClock /> {getTimeAgo(notification.createdAt)}
                </div>
              </div>
              <div className="notification-actions-hover">
                {!notification.isRead && (
                  <button 
                    className="action-hover-btn mark-read" 
                    onClick={(e) => handleMarkAsReadClick(e, notification.id)}
                    title="Đánh dấu đã đọc"
                  >
                    <FaCheck />
                  </button>
                )}
                <button 
                  className="action-hover-btn delete-notif" 
                  onClick={(e) => deleteNotification(e, notification.id)}
                  title="Xóa thông báo"
                >
                  <FaTrash />
                </button>
              </div>
              {!notification.isRead && <div className="unread-dot"></div>}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={currentPage === 0} onClick={() => setCurrentPage(prev => prev - 1)}>
            ‹ Trước
          </button>
          <span className="page-info">Trang {currentPage + 1} / {totalPages}</span>
          <button disabled={currentPage === totalPages - 1} onClick={() => setCurrentPage(prev => prev + 1)}>
            Sau ›
          </button>
        </div>
      )}
    </div>
  );
};

export default Notifications;