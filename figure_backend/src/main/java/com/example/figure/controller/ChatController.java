package com.example.figure.controller;

import com.example.figure.entity.ChatMessage;
import com.example.figure.repository.ChatMessageRepository;
import com.example.figure.service.AiChatService;
import com.example.figure.websocket.ChatWebSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class ChatController {
    
    private final ChatMessageRepository chatMessageRepository;
    private final AiChatService aiChatService;
    private final ChatWebSocketHandler chatWebSocketHandler;
    
    // Get messages for a specific session ID
    @GetMapping("/messages")
    public ResponseEntity<List<ChatMessage>> getMessages(@RequestParam String sessionId) {
        List<ChatMessage> messages = chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
        return ResponseEntity.ok(messages);
    }
    
    // Send a message
    @PostMapping("/send")
    public ResponseEntity<ChatMessage> sendMessage(@RequestBody ChatMessage message) {
        if (message.getCreatedAt() == null) {
            message.setCreatedAt(java.time.LocalDateTime.now());
        }
        ChatMessage saved = chatMessageRepository.save(message);
        if (saved.getCreatedAt() == null) {
            saved.setCreatedAt(java.time.LocalDateTime.now());
        }
        
        try {
            chatWebSocketHandler.broadcast(saved);
        } catch (Exception e) {
            System.err.println("Error broadcasting message: " + e.getMessage());
        }
        
        // If the sender is the customer, automatically generate an AI Bot reply in the same thread
        if ("customer".equals(message.getSender())) {
            try {
                String botReply = aiChatService.generateReply(message.getText(), message.getSessionId());
                
                ChatMessage botMessage = new ChatMessage();
                botMessage.setSessionId(message.getSessionId());
                botMessage.setSender("bot");
                botMessage.setText(botReply);
                botMessage.setCreatedAt(java.time.LocalDateTime.now());
                
                ChatMessage savedBot = chatMessageRepository.save(botMessage);
                if (savedBot.getCreatedAt() == null) {
                    savedBot.setCreatedAt(java.time.LocalDateTime.now());
                }
                chatWebSocketHandler.broadcast(savedBot);
            } catch (Exception e) {
                System.err.println("Error generating automatic bot reply: " + e.getMessage());
            }
        }
        
        return ResponseEntity.ok(saved);
    }
    
    // Get all unique session IDs for the admin console
    @GetMapping("/sessions")
    public ResponseEntity<List<String>> getChatSessions() {
        List<String> sessions = chatMessageRepository.findDistinctSessionIds();
        return ResponseEntity.ok(sessions);
    }
    
    // Clear chat history for a session
    @DeleteMapping("/clear")
    public ResponseEntity<?> clearChat(@RequestParam String sessionId) {
        try {
            List<ChatMessage> messages = chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
            chatMessageRepository.deleteAll(messages);
            return ResponseEntity.ok().body(java.util.Map.of("success", true, "message", "Chat cleared"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(java.util.Map.of("success", false, "error", e.getMessage()));
        }
    }
}
