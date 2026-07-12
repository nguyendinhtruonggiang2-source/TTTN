package com.example.figure.websocket;

import com.example.figure.entity.ChatMessage;
import com.example.figure.repository.ChatMessageRepository;
import com.example.figure.service.AiChatService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class ChatWebSocketHandler extends TextWebSocketHandler {

    private final ChatMessageRepository chatMessageRepository;
    private final AiChatService aiChatService;
    private final com.example.figure.repository.UserRepository userRepository;
    private final com.example.figure.repository.NotificationRepository notificationRepository;
    private final com.example.figure.websocket.NotificationWebSocketHandler notificationWebSocketHandler;
    private final ObjectMapper objectMapper;
    
    // Lưu các session kết nối đồng thời một cách an toàn
    private final List<WebSocketSession> sessions = new CopyOnWriteArrayList<>();

    public ChatWebSocketHandler(ChatMessageRepository chatMessageRepository, 
                                AiChatService aiChatService,
                                com.example.figure.repository.UserRepository userRepository,
                                com.example.figure.repository.NotificationRepository notificationRepository,
                                com.example.figure.websocket.NotificationWebSocketHandler notificationWebSocketHandler,
                                ObjectMapper objectMapper) {
        this.chatMessageRepository = chatMessageRepository;
        this.aiChatService = aiChatService;
        this.userRepository = userRepository;
        this.notificationRepository = notificationRepository;
        this.notificationWebSocketHandler = notificationWebSocketHandler;
        this.objectMapper = objectMapper;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.add(session);
        System.out.println("⚡ WebSocket connection established: " + session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        System.out.println("⚡ Received WS payload: " + payload);
        
        try {
            // Đọc dữ liệu JSON gửi lên
            ChatMessage chatMsg = objectMapper.readValue(payload, ChatMessage.class);
            if (chatMsg.getCreatedAt() == null) {
                chatMsg.setCreatedAt(java.time.LocalDateTime.now());
            }
            
            // Lưu tin nhắn vào Database
            ChatMessage saved = chatMessageRepository.save(chatMsg);
            if (saved.getCreatedAt() == null) {
                saved.setCreatedAt(java.time.LocalDateTime.now());
            }
            
            // Phát đi (broadcast) tin nhắn này tới tất cả mọi người đang online
            broadcast(saved);
            
            // Nếu người gửi là Customer và là câu hỏi gợi ý, tự động kích hoạt bot trả lời trong cùng phiên chat
            if ("customer".equals(saved.getSender()) && Boolean.TRUE.equals(chatMsg.getIsPreset())) {
                String botReplyText = aiChatService.generateReply(saved.getText(), saved.getSessionId());
                
                ChatMessage botMsg = new ChatMessage();
                botMsg.setSessionId(saved.getSessionId());
                botMsg.setSender("bot");
                botMsg.setText(botReplyText);
                
                ChatMessage savedBotMsg = chatMessageRepository.save(botMsg);
                broadcast(savedBotMsg);
            }
            

        } catch (Exception e) {
            System.err.println("❌ WS Error handling text message: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessions.remove(session);
        System.out.println("⚡ WebSocket connection closed: " + session.getId());
    }

    public void broadcast(ChatMessage message) {
        String jsonMsg;
        try {
            jsonMsg = objectMapper.writeValueAsString(message);
        } catch (IOException e) {
            System.err.println("❌ WS: Error serialization: " + e.getMessage());
            return;
        }
        
        TextMessage textMessage = new TextMessage(jsonMsg);
        for (WebSocketSession session : sessions) {
            if (session.isOpen()) {
                try {
                    session.sendMessage(textMessage);
                } catch (IOException e) {
                    System.err.println("❌ WS: Error sending to session " + session.getId() + ": " + e.getMessage());
                }
            }
        }
    }
}
