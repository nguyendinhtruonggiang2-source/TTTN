package com.example.figure.controller;

import com.example.figure.dto.PostDTO;
import com.example.figure.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/posts")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class AdminPostController {
    
    private final PostService postService;
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PostDTO>> getAllPosts() {
        return ResponseEntity.ok(postService.getAllPosts());
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PostDTO> getPostById(@PathVariable Long id) {
        return ResponseEntity.ok(postService.getPostById(id));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PostDTO> createPost(@RequestBody PostDTO postDTO) {
        return ResponseEntity.ok(postService.createPost(postDTO));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PostDTO> updatePost(@PathVariable Long id, @RequestBody PostDTO postDTO) {
        return ResponseEntity.ok(postService.updatePost(id, postDTO));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        postService.deletePost(id);
        return ResponseEntity.ok().build();
    }
    
    @PatchMapping("/{id}/toggle-featured")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> toggleFeatured(@PathVariable Long id) {
        postService.toggleFeatured(id);
        return ResponseEntity.ok().build();
    }
    
    @PatchMapping("/{id}/toggle-hot")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> toggleHot(@PathVariable Long id) {
        postService.toggleHot(id);
        return ResponseEntity.ok().build();
    }
}