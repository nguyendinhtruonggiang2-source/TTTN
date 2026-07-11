package com.example.figure.repository;

import com.example.figure.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findBySessionIdOrderByCreatedAtAsc(String sessionId);
    
    // Get unique session IDs ordered by latest activity
    @Query("SELECT DISTINCT m.sessionId FROM ChatMessage m ORDER BY m.sessionId")
    List<String> findDistinctSessionIds();
}
