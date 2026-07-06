package com.example.figure.controller;

import com.example.figure.dto.PostDTO;
import com.example.figure.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class PostController {
    
    private final PostService postService;
    
    @GetMapping
    public ResponseEntity<Page<PostDTO>> getPosts(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "6") int size
    ) {
        return ResponseEntity.ok(postService.getPosts(page, size));
    }
    
    @GetMapping("/featured")
    public ResponseEntity<List<PostDTO>> getFeaturedPosts() {
        return ResponseEntity.ok(postService.getFeaturedPosts());
    }
    
    @GetMapping("/hot")
    public ResponseEntity<List<PostDTO>> getHotPosts() {
        return ResponseEntity.ok(postService.getHotPosts());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<PostDTO> getPostById(@PathVariable Long id) {
        return ResponseEntity.ok(postService.getPostById(id));
    }
    
    @GetMapping("/category/{category}")
    public ResponseEntity<Page<PostDTO>> getPostsByCategory(
        @PathVariable String category,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "6") int size
    ) {
        return ResponseEntity.ok(postService.getPostsByCategory(category, page, size));
    }
    
    @GetMapping("/search")
    public ResponseEntity<Page<PostDTO>> searchPosts(
        @RequestParam String keyword,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "6") int size
    ) {
        return ResponseEntity.ok(postService.searchPosts(keyword, page, size));
    }
    
    @PostMapping("/{id}/like")
    public ResponseEntity<Void> likePost(@PathVariable Long id) {
        postService.likePost(id);
        return ResponseEntity.ok().build();
    }
}