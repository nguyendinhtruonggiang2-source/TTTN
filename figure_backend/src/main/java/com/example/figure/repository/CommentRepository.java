// repository/CommentRepository.java
package com.example.figure.repository;

import com.example.figure.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    
    // Lấy comments theo postId, chỉ lấy comments gốc (parent = null)
    List<Comment> findByPostIdAndParentIsNullOrderByCreatedAtDesc(Long postId);
    
    // Lấy tất cả comments của một post
    List<Comment> findByPostIdOrderByCreatedAtDesc(Long postId);
    
    // Lấy replies theo parentId
    List<Comment> findByParentIdOrderByCreatedAtAsc(Long parentId);
    
    // Đếm số comments của một post
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.post.id = :postId AND c.isApproved = true")
    int countByPostId(@Param("postId") Long postId);
    
    // Tăng số lượng likes
    @Modifying
    @Transactional
    @Query("UPDATE Comment c SET c.likes = c.likes + 1 WHERE c.id = :commentId")
    void incrementLikes(@Param("commentId") Long commentId);
    
    // Giảm số lượng likes
    @Modifying
    @Transactional
    @Query("UPDATE Comment c SET c.likes = c.likes - 1 WHERE c.id = :commentId")
    void decrementLikes(@Param("commentId") Long commentId);
    
    // Xóa tất cả comments của một post
    @Modifying
    @Transactional
    @Query("DELETE FROM Comment c WHERE c.post.id = :postId")
    void deleteByPostId(@Param("postId") Long postId);
}