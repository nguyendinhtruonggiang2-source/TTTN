package com.example.figure.controller;

import com.example.figure.dto.AiChatRequest;
import com.example.figure.dto.AiChatResponse;
import com.example.figure.service.AiChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiChatController {

    private final AiChatService aiChatService;

    @PostMapping("/chat")
    public ResponseEntity<AiChatResponse> chat(@RequestBody AiChatRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        String reply = aiChatService.generateReply(request.getMessage(), username);
        return ResponseEntity.ok(new AiChatResponse(reply));
    }
}
