package com.example.figure.websocket;

import com.example.figure.entity.Notification;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import java.io.IOException;
import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class NotificationWebSocketHandler extends TextWebSocketHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();
    
    // Map username to their active WebSocket sessions
    private final Map<String, List<WebSocketSession>> userSessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String username = getUsernameFromSession(session);
        if (username != null) {
            userSessions.computeIfAbsent(username, k -> new CopyOnWriteArrayList<>()).add(session);
            System.out.println("🔔 Notification WebSocket connected: " + username + " (session: " + session.getId() + ")");
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        String username = getUsernameFromSession(session);
        if (username != null) {
            List<WebSocketSession> sessions = userSessions.get(username);
            if (sessions != null) {
                sessions.remove(session);
                if (sessions.isEmpty()) {
                    userSessions.remove(username);
                }
            }
            System.out.println("🔔 Notification WebSocket disconnected: " + username + " (session: " + session.getId() + ")");
        }
    }

    public void sendNotificationToUser(String username, Notification notification) {
        List<WebSocketSession> sessions = userSessions.get(username);
        if (sessions == null || sessions.isEmpty()) {
            System.out.println("🔔 No active WebSocket session for user: " + username + ". Notification saved in DB only.");
            return;
        }

        try {
            // Map Entity to simple map so we avoid lazy-loading issues of User inside
            Map<String, Object> data = Map.of(
                "id", notification.getId(),
                "title", notification.getTitle(),
                "content", notification.getContent(),
                "type", notification.getType() != null ? notification.getType() : "SYSTEM",
                "redirectUrl", notification.getRedirectUrl() != null ? notification.getRedirectUrl() : "",
                "isRead", notification.getIsRead(),
                "createdAt", notification.getCreatedAt() != null ? notification.getCreatedAt().toString() : ""
            );
            
            String payload = objectMapper.writeValueAsString(data);
            TextMessage textMessage = new TextMessage(payload);
            
            for (WebSocketSession session : sessions) {
                if (session.isOpen()) {
                    session.sendMessage(textMessage);
                    System.out.println("🔔 Pushed notification live to " + username);
                }
            }
        } catch (Exception e) {
            System.err.println("❌ Error pushing notification to " + username + ": " + e.getMessage());
        }
    }

    private String getUsernameFromSession(WebSocketSession session) {
        URI uri = session.getUri();
        if (uri == null) return null;
        String query = uri.getQuery();
        if (query != null && query.contains("username=")) {
            String[] params = query.split("&");
            for (String param : params) {
                if (param.startsWith("username=")) {
                    return param.substring(9);
                }
            }
        }
        return null;
    }
}
