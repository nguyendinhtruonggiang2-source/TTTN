import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaRobot, FaPaperPlane, FaTimes, FaMinus, FaCommentDots, FaSync } from 'react-icons/fa';
import axiosClient from '../api/axiosClient';
import '../styles/AiChatWidget.css';

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

const AiChatWidget = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isOpenRef = useRef(false);

    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            sender: 'bot',
            text: 'Xin chào! 👋 Tôi là trợ lý AI tự động của shop. Tôi có thể hỗ trợ bạn tìm kiếm mô hình figure, tra cứu đơn hàng hoặc giải đáp nhanh các chính sách vận chuyển/đổi trả hàng.\n\nBạn cần tôi giúp gì hôm nay?',
            time: new Date()
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [unread, setUnread] = useState(false);
    const [sessionId, setSessionId] = useState('');
    
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);

    useEffect(() => {
        let sid = localStorage.getItem('chatSessionId');
        if (!sid) {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    const u = JSON.parse(userStr);
                    if (u.username) sid = u.username;
                } catch(e){}
            }
            if (!sid) {
                sid = 'guest_' + Math.random().toString(36).substring(2, 11);
            }
            localStorage.setItem('chatSessionId', sid);
        }
        setSessionId(sid);
    }, []);

    const fetchChatMessages = async (sid) => {
        if (!sid) return;
        try {
            const response = await axiosClient.get(`/chat/messages?sessionId=${sid}`);
            if (response.data && Array.isArray(response.data)) {
                const mapped = response.data.map(msg => ({
                    sender: msg.sender,
                    text: msg.text,
                    time: new Date(msg.createdAt || new Date())
                }));
                if (mapped.length > 0) {
                    setMessages(mapped);
                }
            }
        } catch (error) {
            console.error('Error fetching chat messages:', error);
        }
    };

    useEffect(() => {
        isOpenRef.current = isOpen;
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && sessionId) {
            fetchChatMessages(sessionId);
        }
    }, [isOpen, sessionId]);

    useEffect(() => {
        if (!sessionId) return;

        let ws;
        let reconnectTimeout;
        let isComponentMounted = true;

        const connect = () => {
            if (!isComponentMounted) return;

            console.log('⚡ Attempting to connect to Chat WebSocket...');
            ws = new WebSocket(getWebSocketUrl('/ws/chat'));
            socketRef.current = ws;

            ws.onopen = () => {
                console.log('⚡ Connected to Chat WebSocket');
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data && data.sessionId === sessionId) {
                        setMessages(prev => {
                            // Tránh trùng tin nhắn
                            const exists = prev.some(m => 
                                m.text === data.text && 
                                m.sender === data.sender &&
                                Math.abs(new Date(m.time) - new Date(data.createdAt || new Date())) < 2000
                            );
                            if (exists) return prev;
                            
                            return [...prev, {
                                sender: data.sender,
                                text: data.text,
                                time: new Date(data.createdAt || new Date())
                            }];
                        });

                        // Nếu đang đóng chat và nhận được tin nhắn của admin/bot, kích hoạt chấm đỏ chưa đọc
                        if (!isOpenRef.current && (data.sender === 'admin' || data.sender === 'bot')) {
                            setUnread(true);
                        }
                    }
                } catch (e) {
                    console.error('Error parsing WS message:', e);
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket Error:', error);
                ws.close();
            };

            ws.onclose = () => {
                console.log('⚡ WebSocket Connection closed. Reconnecting in 5s...');
                if (isComponentMounted) {
                    reconnectTimeout = setTimeout(connect, 5000);
                }
            };
        };

        connect();

        return () => {
            isComponentMounted = false;
            clearTimeout(reconnectTimeout);
            if (ws) {
                ws.onclose = null;
                ws.close();
            }
        };
    }, [sessionId]);

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
            setUnread(false);
        }
    }, [isOpen, messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleRefreshChat = async () => {
        if (!window.confirm('Bạn có chắc muốn làm mới cuộc trò chuyện? Lịch sử tin nhắn sẽ bị xóa.')) {
            return;
        }
        
        try {
            setIsLoading(true);
            await axiosClient.delete(`/chat/clear?sessionId=${sessionId}`);
            
            const isGuest = sessionId.startsWith('guest_');
            if (isGuest) {
                const newSid = 'guest_' + Math.random().toString(36).substring(2, 11);
                localStorage.setItem('chatSessionId', newSid);
                setSessionId(newSid);
            }
            
            setMessages([
                {
                    sender: 'bot',
                    text: 'Xin chào! 👋 Tôi là trợ lý AI tự động của shop. Tôi có thể hỗ trợ bạn tìm kiếm mô hình figure, tra cứu đơn hàng hoặc giải đáp nhanh các chính sách vận chuyển/đổi trả hàng.\n\nBạn cần tôi giúp gì hôm nay?',
                    time: new Date()
                }
            ]);
            
            alert('🔄 Đã làm mới cuộc hội thoại!');
        } catch (error) {
            console.error('Error clearing chat history:', error);
            alert('❌ Không thể xóa lịch sử cuộc trò chuyện');
        } finally {
            setIsLoading(false);
        }
    };

    const presetQuestions = [
        '🔍 Gợi ý mô hình Genshin',
        '📦 Kiểm tra đơn hàng của tôi',
        '🚚 Chính sách vận chuyển',
        '🏠 Địa chỉ showroom',
        '🔄 Chính sách đổi trả hàng',
        '🎁 Chương trình khuyến mãi',
        '💳 Phương thức thanh toán',
        '🛡️ Cam kết chính hãng'
    ];

    const sendQuestion = async (text, isPreset = false) => {
        if (!text.trim() || isLoading) return;
        
        // Thêm tin nhắn vào giao diện cục bộ ngay lập tức
        const localMsg = {
            sender: 'customer',
            text: text,
            time: new Date()
        };
        setMessages(prev => [...prev, localMsg]);
        setTimeout(scrollToBottom, 50);

        setIsLoading(true);
        
        const payload = {
            sessionId: sessionId,
            sender: 'customer',
            text: text,
            isPreset: isPreset
        };

        const ws = socketRef.current;
        if (ws && ws.readyState === WebSocket.OPEN) {
            try {
                ws.send(JSON.stringify(payload));
                setIsLoading(false);
            } catch (wsErr) {
                console.error('Error sending WS message:', wsErr);
                // Fallback to HTTP POST if WS send fails
                sendHttpFallback(payload);
            }
        } else {
            sendHttpFallback(payload);
        }
    };

    const sendHttpFallback = async (payload) => {
        try {
            await axiosClient.post('/chat/send', payload);
            await fetchChatMessages(sessionId);
        } catch (error) {
            console.error('Error sending message via fallback:', error);
            setMessages(prev => [...prev, {
                sender: 'bot',
                text: '⚠️ Không thể gửi tin nhắn. Vui lòng kiểm tra kết nối mạng của bạn.',
                time: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;
        const text = inputValue.trim();
        setInputValue('');
        await sendQuestion(text, false);
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    // Helper function to format chat message text containing basic Markdown syntax
    const formatMessageText = (text) => {
        if (!text) return '';
        
        const lines = text.split('\n');
        return lines.map((line, lineIndex) => {
            const isListItem = line.trim().startsWith('-') || line.trim().startsWith('*');
            let content = line;
            if (isListItem) {
                content = line.trim().replace(/^[-*]\s+/, '');
            }
            
            const parsedElements = [];
            let lastIndex = 0;
            const inlineRegex = /(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g;
            let match;
            let keyCounter = 0;
            
            while ((match = inlineRegex.exec(content)) !== null) {
                const matchIndex = match.index;
                const matchText = match[0];
                
                if (matchIndex > lastIndex) {
                    parsedElements.push(content.substring(lastIndex, matchIndex));
                }
                
                if (matchText.startsWith('**') && matchText.endsWith('**')) {
                    parsedElements.push(
                        <strong key={keyCounter++}>{matchText.slice(2, -2)}</strong>
                    );
                } else if (matchText.startsWith('`') && matchText.endsWith('`')) {
                    parsedElements.push(
                        <code key={keyCounter++} className="chat-inline-code">{matchText.slice(1, -1)}</code>
                    );
                } else if (matchText.startsWith('[') && matchText.includes(']Direct:')) {
                    // Custom marker if needed
                    const name = matchText.substring(1, matchText.indexOf(']'));
                    const url = matchText.substring(matchText.indexOf('](') + 2, matchText.length - 1);
                    parsedElements.push(
                        <a key={keyCounter++} href={url} target="_blank" rel="noopener noreferrer" className="chat-link">{name}</a>
                    );
                } else if (matchText.startsWith('[') && matchText.includes('](')) {
                    const name = matchText.substring(1, matchText.indexOf(']'));
                    const url = matchText.substring(matchText.indexOf('](') + 2, matchText.length - 1);
                    const isInternal = url.startsWith('/');
                    
                    if (isInternal) {
                        parsedElements.push(
                            <a 
                                key={keyCounter++} 
                                href={url} 
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigate(url);
                                    setIsOpen(false);
                                }} 
                                className="chat-link"
                            >
                                {name}
                            </a>
                        );
                    } else {
                        parsedElements.push(
                            <a key={keyCounter++} href={url} target="_blank" rel="noopener noreferrer" className="chat-link">{name}</a>
                        );
                    }
                }
                
                lastIndex = inlineRegex.lastIndex;
            }
            
            if (lastIndex < content.length) {
                parsedElements.push(content.substring(lastIndex));
            }
            
            const elementNode = <span key={lineIndex}>{parsedElements}</span>;
            
            if (isListItem) {
                return <li key={lineIndex} className="chat-list-item">{elementNode}</li>;
            }
            
            return <p key={lineIndex} className="chat-paragraph">{elementNode}</p>;
        });
    };

    // Chỉ hiển thị widget chat ở trang chính (Trang chủ "/")
    if (location.pathname !== '/') {
        return null;
    }

    return (
        <div className={`ai-chat-widget-container ${isOpen ? 'open' : ''}`}>
            {/* --- Chat Trigger Button --- */}
            {!isOpen && (
                <button className={`chat-trigger-btn ${unread ? 'unread' : ''}`} onClick={toggleChat} title="Chat hỗ trợ AI" style={{ position: 'relative' }}>
                    <div className="chat-trigger-icon">
                        <FaRobot />
                    </div>
                    <span className="chat-trigger-text">Trợ lý AI</span>
                    {unread && (
                        <span className="unread-badge-dot" style={{
                            position: 'absolute',
                            top: '2px',
                            right: '2px',
                            width: '10px',
                            height: '10px',
                            backgroundColor: '#ef4444',
                            borderRadius: '50%',
                            border: '2px solid white',
                            boxShadow: '0 0 0 2px rgba(239, 68, 68, 0.4)',
                        }}></span>
                    )}
                </button>
            )}

            {/* --- Chat Window --- */}
            {isOpen && (
                <div className="chat-window">
                    {/* Header */}
                    <div className="chat-header">
                        <div className="chat-header-info">
                            <div className="chat-avatar-status">
                                <FaRobot />
                                <span className="status-dot online"></span>
                            </div>
                            <div>
                                <h4 className="chat-header-title">Trợ lý AI Store</h4>
                                <span className="chat-header-subtitle">Hỗ trợ tự động 24/7</span>
                            </div>
                        </div>
                        <div className="chat-header-actions">
                            <button className="chat-action-btn" onClick={handleRefreshChat} title="Làm mới hội thoại" disabled={isLoading}>
                                <FaSync className={isLoading ? 'spinner-small' : ''} />
                            </button>
                            <button className="chat-action-btn" onClick={toggleChat} title="Thu nhỏ">
                                <FaMinus />
                            </button>
                            <button className="chat-action-btn close" onClick={toggleChat} title="Đóng">
                                <FaTimes />
                            </button>
                        </div>
                    </div>

                    {/* Message list */}
                    <div className="chat-messages-container">
                        {messages.map((msg, index) => (
                            <div key={index} className={`chat-message-bubble ${msg.sender === 'customer' ? 'user' : 'bot'}`}>
                                <div className="message-avatar">
                                    {msg.sender === 'customer' ? <div className="user-avatar-char">U</div> : <FaRobot />}
                                </div>
                                <div className="message-content-wrapper">
                                    <div className="message-text">
                                        {formatMessageText(msg.text)}
                                    </div>
                                    <span className="message-time">
                                        {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                        
                        {isLoading && (
                            <div className="chat-message-bubble bot typing">
                                <div className="message-avatar">
                                    <FaRobot />
                                </div>
                                <div className="message-content-wrapper">
                                    <div className="message-text typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Preset Questions Row */}
                    <div className="chat-presets-container">
                        {presetQuestions.map((q, idx) => (
                            <button 
                                key={idx} 
                                type="button" 
                                className="chat-preset-pill" 
                                onClick={() => sendQuestion(q, true)}
                                disabled={isLoading}
                            >
                                {q}
                            </button>
                        ))}
                    </div>
 
                    {/* Input form */}
                    <form className="chat-input-form" onSubmit={handleSend}>
                        <input
                            type="text"
                            placeholder="Nhập câu hỏi của bạn tại đây..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            disabled={isLoading}
                        />
                        <button type="submit" className="chat-submit-btn" disabled={!inputValue.trim() || isLoading}>
                            <FaPaperPlane />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AiChatWidget;
