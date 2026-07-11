import React, { useState, useEffect, useRef } from 'react';
import { FaRobot, FaPaperPlane, FaUserShield, FaUsers, FaArrowLeft } from 'react-icons/fa';
import axiosClient from '../../api/axiosClient';
import '../../styles/AdminAiChat.css';

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

const AdminAiChat = () => {
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState('');
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [unreadSessions, setUnreadSessions] = useState({});
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);
    const selectedSessionRef = useRef('');

    useEffect(() => {
        selectedSessionRef.current = selectedSession;
    }, [selectedSession]);

    useEffect(() => {
        // Lấy danh sách phiên hội thoại ban đầu và cập nhật mỗi 5 giây
        fetchSessions();
        const sessionInterval = setInterval(fetchSessions, 5000);

        let ws;
        let reconnectTimeout;
        let isComponentMounted = true;

        const connect = () => {
            if (!isComponentMounted) return;

            console.log('⚡ Admin attempting to connect to Chat WebSocket...');
            ws = new WebSocket(getWebSocketUrl('/ws/chat'));
            socketRef.current = ws;

            ws.onopen = () => {
                console.log('⚡ Admin connected to Chat WebSocket');
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data && data.sessionId) {
                        // Di chuyển session lên đầu danh sách hoặc thêm mới
                        setSessions(prev => {
                            const filtered = prev.filter(s => s !== data.sessionId);
                            return [data.sessionId, ...filtered];
                        });

                        // Đánh dấu chưa đọc nếu không phải session đang chọn và là tin nhắn từ customer
                        if (data.sessionId !== selectedSessionRef.current && data.sender === 'customer') {
                            setUnreadSessions(prev => ({
                                ...prev,
                                [data.sessionId]: true
                            }));
                        }

                        // Cập nhật tin nhắn của phiên chat đang hiển thị
                        if (data.sessionId === selectedSessionRef.current) {
                            setMessages(prev => {
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
                        }
                    }
                } catch (e) {
                    console.error('Error parsing WS message in Admin:', e);
                }
            };

            ws.onclose = () => {
                console.log('⚡ Admin WebSocket disconnected. Reconnecting in 5s...');
                if (isComponentMounted) {
                    reconnectTimeout = setTimeout(connect, 5000);
                }
            };

            ws.onerror = (error) => {
                console.error('⚡ Admin WebSocket error:', error);
                ws.close();
            };
        };

        connect();

        return () => {
            isComponentMounted = false;
            clearInterval(sessionInterval);
            clearTimeout(reconnectTimeout);
            if (ws) {
                ws.onclose = null;
                ws.close();
            }
        };
    }, []);

    useEffect(() => {
        // Tải lịch sử khi chọn phiên chat mới
        if (selectedSession) {
            fetchMessages(selectedSession);
            // Xóa đánh dấu chưa đọc khi chọn xem session
            setUnreadSessions(prev => {
                const next = { ...prev };
                delete next[selectedSession];
                return next;
            });
        } else {
            setMessages([]);
        }
    }, [selectedSession]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchSessions = async () => {
        try {
            const response = await axiosClient.get('/chat/sessions');
            if (response.data && Array.isArray(response.data)) {
                const validSessions = response.data.filter(s => s && s.trim().length > 0);
                setSessions(validSessions);
                if (!selectedSession && validSessions.length > 0) {
                    setSelectedSession(validSessions[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching chat sessions:', error);
        }
    };

    const fetchMessages = async (sid) => {
        try {
            const response = await axiosClient.get(`/chat/messages?sessionId=${sid}`);
            if (response.data && Array.isArray(response.data)) {
                const mapped = response.data.map(msg => ({
                    sender: msg.sender,
                    text: msg.text,
                    time: new Date(msg.createdAt || new Date())
                }));
                setMessages(mapped);
            }
        } catch (error) {
            console.error('Error fetching messages for session:', error);
        }
    };

    const sendPrompt = async (text) => {
        if (!text.trim() || !selectedSession || isLoading) return;

        // Thêm tin nhắn của admin vào giao diện cục bộ ngay lập tức
        const localMsg = {
            sender: 'admin',
            text: text,
            time: new Date()
        };
        setMessages(prev => [...prev, localMsg]);
        setTimeout(scrollToBottom, 50);

        setIsLoading(true);

        const payload = {
            sessionId: selectedSession,
            sender: 'admin',
            text: text
        };

        const ws = socketRef.current;
        if (ws && ws.readyState === WebSocket.OPEN) {
            try {
                ws.send(JSON.stringify(payload));
                setInputValue('');
                setIsLoading(false);
            } catch (wsErr) {
                console.error('Error sending WS message from admin:', wsErr);
                sendHttpFallback(payload);
            }
        } else {
            sendHttpFallback(payload);
        }
    };

    const sendHttpFallback = async (payload) => {
        try {
            await axiosClient.post('/chat/send', payload);
            await fetchMessages(selectedSession);
            setInputValue('');
        } catch (error) {
            console.error('Error sending admin message via fallback:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;
        sendPrompt(inputValue.trim());
    };

    const formatMessageText = (text) => {
        if (!text) return '';
        const lines = text.split('\n');
        return lines.map((line, idx) => {
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
                        <code key={keyCounter++} className="admin-chat-inline-code">{matchText.slice(1, -1)}</code>
                    );
                } else if (matchText.startsWith('[') && matchText.includes('](')) {
                    const name = matchText.substring(1, matchText.indexOf(']'));
                    const url = matchText.substring(matchText.indexOf('](') + 2, matchText.length - 1);
                    parsedElements.push(
                        <a key={keyCounter++} href={url} target="_blank" rel="noopener noreferrer" className="admin-chat-link">{name}</a>
                    );
                }
                lastIndex = inlineRegex.lastIndex;
            }

            if (lastIndex < content.length) {
                parsedElements.push(content.substring(lastIndex));
            }

            const lineNode = <span key={idx}>{parsedElements}</span>;
            if (isListItem) {
                return <li key={idx} className="admin-chat-list-item">{lineNode}</li>;
            }
            return <p key={idx} className="admin-chat-paragraph">{lineNode}</p>;
        });
    };

    return (
        <div className="admin-ai-chat-container">
            <div className="admin-ai-sidebar">
                <div className="ai-sidebar-header">
                    <FaUsers className="ai-icon" />
                    <h3>Hội thoại khách hàng</h3>
                </div>
                <p className="sidebar-desc">Chọn một phiên hội thoại của khách để theo dõi hoặc trả lời trực tiếp.</p>
                <div className="preset-prompts-list">
                    {sessions.map((sid, idx) => (
                        <div 
                            key={idx} 
                            className={`preset-prompt-card session-card ${selectedSession === sid ? 'selected' : ''} ${unreadSessions[sid] ? 'unread' : ''}`}
                            onClick={() => setSelectedSession(sid)}
                            style={{ position: 'relative' }}
                        >
                            <h4>👤 {sid}</h4>
                            <p style={{ color: unreadSessions[sid] ? '#ef4444' : '#64748b', fontWeight: unreadSessions[sid] ? '600' : 'normal' }}>
                                {unreadSessions[sid] ? '🔴 Có tin nhắn mới' : 'Nhấp để xem tin nhắn'}
                            </p>
                            {unreadSessions[sid] && (
                                <span className="unread-dot-badge" style={{
                                    position: 'absolute',
                                    top: '12px',
                                    right: '12px',
                                    width: '8px',
                                    height: '8px',
                                    backgroundColor: '#ef4444',
                                    borderRadius: '50%'
                                }}></span>
                            )}
                        </div>
                    ))}
                    {sessions.length === 0 && (
                        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '13px', marginTop: '20px' }}>
                            Chưa có hội thoại nào của khách hàng.
                        </p>
                    )}
                </div>
            </div>

            <div className="admin-ai-main-chat">
                {selectedSession ? (
                    <>
                        <div className="admin-chat-header">
                            <div className="chat-avatar-status">
                                <FaRobot />
                                <span className="status-dot online"></span>
                            </div>
                            <div>
                                <h4>👤 Khách hàng: {selectedSession}</h4>
                                <span className="chat-status-text">Đang xem hội thoại trực tiếp</span>
                            </div>
                        </div>

                        <div className="admin-chat-messages">
                            {messages.map((msg, index) => (
                                <div key={index} className={`admin-chat-bubble ${msg.sender === 'admin' ? 'admin' : (msg.sender === 'customer' ? 'customer' : 'bot')}`}>
                                    <div className="bubble-avatar">
                                        {msg.sender === 'bot' ? <FaRobot /> : (msg.sender === 'admin' ? <FaUserShield /> : <span>👤</span>)}
                                    </div>
                                    <div className="bubble-content-wrapper">
                                        <div className="bubble-sender-name">
                                            {msg.sender === 'bot' ? 'Trợ lý AI' : (msg.sender === 'admin' ? 'Quản trị viên' : 'Khách hàng')}
                                        </div>
                                        <div className="bubble-text">
                                            {formatMessageText(msg.text)}
                                        </div>
                                        <span className="bubble-time">
                                            {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="admin-chat-bubble admin typing">
                                    <div className="bubble-avatar">
                                        <FaUserShield />
                                    </div>
                                    <div className="bubble-content-wrapper">
                                        <div className="bubble-sender-name">Đang gửi tin nhắn...</div>
                                        <div className="bubble-text typing-indicator">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <form className="admin-chat-input-area" onSubmit={handleSend}>
                            <input 
                                type="text" 
                                placeholder="Nhập câu trả lời trực tiếp cho khách hàng..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                disabled={isLoading}
                            />
                            <button type="submit" disabled={!inputValue.trim() || isLoading}>
                                <FaPaperPlane />
                                <span>Gửi</span>
                            </button>
                        </form>
                    </>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
                        <FaRobot size={60} style={{ marginBottom: '16px', opacity: 0.5 }} />
                        <h3>Hộp thư hỗ trợ trực tuyến</h3>
                        <p>Vui lòng chọn một phiên hội thoại từ danh sách bên trái để bắt đầu chat.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminAiChat;
