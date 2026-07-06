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
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [filteredNotifications, setFilteredNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [currentPage]);

  useEffect(() => {
    filterNotifications();
  }, [filter, notifications]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get(`/notifications?page=${currentPage}&size=20`);
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
      setUnreadCount(response.data.count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const filterNotifications = () => {
    if (filter === 'all') {
      setFilteredNotifications(notifications);
    } else if (filter === 'unread') {
      setFilteredNotifications(notifications.filter(n => !n.isRead));
    } else {
      setFilteredNotifications(notifications.filter(n => n.isRead));
    }
  };

  const markAsRead = async (id) => {
    try {
      await axiosClient.put(`/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
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
      setUnreadCount(0);
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
          {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
        </h1>
        <div className="header-actions">
          <button className="mark-all-btn" onClick={markAllAsRead} disabled={unreadCount === 0}>
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
          Chưa đọc ({unreadCount})
        </button>
        <button 
          className={`filter-tab ${filter === 'read' ? 'active' : ''}`}
          onClick={() => setFilter('read')}
        >
          Đã đọc ({notifications.length - unreadCount})
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
                <div className="notification-title">{notification.title}</div>
                <div className="notification-message">{notification.content}</div>
                <div className="notification-time">
                  <FaClock /> {getTimeAgo(notification.createdAt)}
                </div>
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