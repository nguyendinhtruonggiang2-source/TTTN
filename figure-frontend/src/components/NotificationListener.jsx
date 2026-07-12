import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/NotificationListener.css';

const getWebSocketUrl = (path) => {
    const API_URL = import.meta.env?.VITE_API_URL;
    if (API_URL) {
        try {
            const url = new URL(API_URL);
            const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
            const cleanPath = path.startsWith('/') ? path : '/' + path;
            return `${protocol}//${url.host}${cleanPath}`;
        } catch (e) {
            console.error('Error parsing VITE_API_URL:', e);
        }
    }
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname || 'localhost';
    const cleanPath = path.startsWith('/') ? path : '/' + path;
    return `${protocol}//${host}:8080${cleanPath}`;
};

const NotificationListener = () => {
    const navigate = useNavigate();
    const [toasts, setToasts] = useState([]);
    const socketRef = useRef(null);
    const [username, setUsername] = useState('');

    useEffect(() => {
        // Lấy thông tin user đăng nhập
        const checkUser = () => {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    const u = JSON.parse(userStr);
                    if (u.username) {
                        setUsername(u.username);
                        return u.username;
                    }
                } catch (e) {}
            }
            setUsername('');
            return null;
        };

        const activeUsername = checkUser();

        let ws;
        let reconnectTimeout;
        let isComponentMounted = true;

        const connect = () => {
            if (!isComponentMounted || !activeUsername) return;

            console.log(`🔔 Notification WebSocket attempting to connect for user: ${activeUsername}...`);
            ws = new WebSocket(getWebSocketUrl(`/ws/notifications?username=${activeUsername}`));
            socketRef.current = ws;

            ws.onopen = () => {
                console.log(`🔔 Notification WebSocket connected for user: ${activeUsername}`);
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data) {
                        // Không hiện cửa sổ thông báo quản trị (Toast) khi đang ở trang chính (/) hoặc là thông báo đơn hàng mới
                        const isAdminNotification = data.redirectUrl?.startsWith('/admin');
                        const isMainPage = window.location.pathname === '/';
                        const isNewOrderNotification = data.title?.includes('Đơn hàng mới') || data.content?.includes('đặt đơn hàng mới');
                        
                        if ((isAdminNotification && isMainPage) || isNewOrderNotification) {
                            console.log('Skipping toast notification (admin on main page or new order notification)');
                            // Vẫn phát Event để cập nhật số lượng badge ở các vị trí khác
                            window.dispatchEvent(new CustomEvent('new-notification', { detail: data }));
                            return;
                        }

                        // Thêm vào danh sách toasts hiển thị
                        const toastId = data.id || Math.random();
                        const newToast = {
                            id: toastId,
                            title: data.title,
                            content: data.content,
                            redirectUrl: data.redirectUrl
                        };
                        setToasts(prev => [...prev, newToast]);

                        // Phát âm thanh thông báo
                        try {
                            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-200.wav');
                            audio.volume = 0.4;
                            audio.play();
                        } catch (audioErr) {
                            console.log('Audio playback blocked by browser policy');
                        }

                        // Phát Event DOM để AdminLayout/Client cập nhật số thông báo chưa đọc
                        window.dispatchEvent(new CustomEvent('new-notification', { detail: data }));

                        // Tự động ẩn toast sau 6 giây
                        setTimeout(() => {
                            setToasts(prev => prev.filter(t => t.id !== toastId));
                        }, 6000);
                    }
                } catch (e) {
                    console.error('Error parsing notification WS message:', e);
                }
            };

            ws.onclose = () => {
                console.log('🔔 Notification WebSocket closed. Reconnecting in 5s...');
                if (isComponentMounted) {
                    reconnectTimeout = setTimeout(connect, 5000);
                }
            };

            ws.onerror = (error) => {
                console.error('🔔 Notification WebSocket error:', error);
                ws.close();
            };
        };

        if (activeUsername) {
            connect();
        }

        return () => {
            isComponentMounted = false;
            clearTimeout(reconnectTimeout);
            if (ws) {
                ws.onclose = null;
                ws.close();
            }
        };
    }, [localStorage.getItem('token')]); // Re-run when login token changes

    const handleToastClick = (toast) => {
        if (toast.redirectUrl) {
            navigate(toast.redirectUrl);
        }
        // Xóa toast khỏi danh sách
        setToasts(prev => prev.filter(t => t.id !== toast.id));
    };

    const handleCloseToast = (e, id) => {
        e.stopPropagation();
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <div className="global-toast-container">
            {toasts.map(toast => (
                <div 
                    key={toast.id} 
                    className="notification-toast"
                    onClick={() => handleToastClick(toast)}
                >
                    <div className="toast-icon">🔔</div>
                    <div className="toast-body">
                        <div className="toast-title">{toast.title}</div>
                        <div className="toast-content">{toast.content}</div>
                    </div>
                    <button 
                        className="toast-close-btn"
                        onClick={(e) => handleCloseToast(e, toast.id)}
                    >
                        ✕
                    </button>
                </div>
            ))}
        </div>
    );
};

export default NotificationListener;
