// service/CommentService.java
package com.example.figure.service;

import com.example.figure.dto.CommentDTO;
import com.example.figure.entity.Comment;
import com.example.figure.entity.Post;
import com.example.figure.entity.User;
import com.example.figure.repository.CommentRepository;
import com.example.figure.repository.PostRepository;
import com.example.figure.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {
    
    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    
    // Lấy comments theo postId
    @Transactional(readOnly = true)
    public List<CommentDTO> getCommentsByPostId(Long postId) {
        List<Comment> comments = commentRepository.findByPostIdAndParentIsNullOrderByCreatedAtDesc(postId);
        return comments.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    // Tạo comment mới
    @Transactional
    public CommentDTO createComment(CommentDTO commentDTO, String username) {
        Post post = postRepository.findById(commentDTO.getPostId())
            .orElseThrow(() -> new RuntimeException("Post not found"));
        
        User user = userRepository.findByUsername(username).orElse(null);
        
        Comment parent = null;
        if (commentDTO.getParentId() != null) {
            parent = commentRepository.findById(commentDTO.getParentId()).orElse(null);
        }
        
        Comment comment = Comment.builder()
            .author(commentDTO.getAuthor() != null ? commentDTO.getAuthor() : (user != null ? user.getUsername() : "Anonymous"))
            .email(commentDTO.getEmail() != null ? commentDTO.getEmail() : (user != null ? user.getEmail() : null))
            .content(commentDTO.getContent())
            .post(post)
            .parent(parent)
            .likes(0)
            .isApproved(true)
            .build();
        
        Comment savedComment = commentRepository.save(comment);
        return convertToDTO(savedComment);
    }
    
    // Thích comment
    @Transactional
    public void likeComment(Long commentId) {
        commentRepository.incrementLikes(commentId);
    }
    
    // Xóa comment
    @Transactional
    public void deleteComment(Long commentId, String username) {
        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        User user = userRepository.findByUsername(username).orElse(null);
        boolean isAdmin = user != null && user.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_ADMIN"));
        
        if (!isAdmin && !comment.getAuthor().equals(username)) {
            throw new RuntimeException("Bạn không có quyền xóa bình luận này");
        }
        
        // Xóa tất cả replies nếu có
        if (comment.getParent() == null) {
            List<Comment> replies = commentRepository.findByParentIdOrderByCreatedAtAsc(commentId);
            commentRepository.deleteAll(replies);
        }
        
        commentRepository.delete(comment);
    }
    
    // 👇 THÊM METHOD NÀY - Xóa tất cả comments của một post
    @Transactional
    public void deleteCommentsByPost(Long postId) {
        commentRepository.deleteByPostId(postId);
    }
    
    // Đếm số comments của post
    @Transactional(readOnly = true)
    public int countCommentsByPostId(Long postId) {
        return commentRepository.countByPostId(postId);
    }
    
    // Chuyển đổi Entity sang DTO
    private CommentDTO convertToDTO(Comment comment) {
        CommentDTO dto = CommentDTO.builder()
            .id(comment.getId())
            .author(comment.getAuthor())
            .email(comment.getEmail())
            .content(comment.getContent())
            .likes(comment.getLikes())
            .postId(comment.getPost().getId())
            .parentId(comment.getParent() != null ? comment.getParent().getId() : null)
            .createdAt(comment.getCreatedAt())
            .updatedAt(comment.getUpdatedAt())
            .isApproved(comment.getIsApproved())
            .build();
        
        // Lấy replies
        if (comment.getParent() == null) {
            List<Comment> replies = commentRepository.findByParentIdOrderByCreatedAtAsc(comment.getId());
            if (replies != null && !replies.isEmpty()) {
                dto.setReplies(replies.stream()
                    .filter(reply -> reply.getIsApproved())
                    .map(this::convertToDTO)
                    .collect(Collectors.toList()));
            }
        }
        
        return dto;
    }
}