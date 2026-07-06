package com.example.figure.service;

import com.example.figure.dto.PostDTO;
import com.example.figure.entity.Post;
import com.example.figure.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {
    
    private final PostRepository postRepository;
    private final CommentService commentService;
    
    @Transactional(readOnly = true)
    public List<PostDTO> getAllPosts() {
        return postRepository.findAll().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public Page<PostDTO> getPosts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return postRepository.findByOrderByPublishedAtDesc(pageable)
            .map(this::convertToDTO);
    }
    
    @Transactional(readOnly = true)
    public List<PostDTO> getFeaturedPosts() {
        return postRepository.findTop4ByFeaturedTrueOrderByPublishedAtDesc()
            .stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<PostDTO> getHotPosts() {
        return postRepository.findTop4ByHotTrueOrderByPublishedAtDesc()
            .stream().map(this::convertToDTO).collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public PostDTO getPostById(Long id) {
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
        // Tăng lượt xem
        post.setViews(post.getViews() + 1);
        postRepository.save(post);
        return convertToDTO(post);
    }
    
    @Transactional(readOnly = true)
    public Page<PostDTO> getPostsByCategory(String category, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return postRepository.findByCategory(category, pageable)
            .map(this::convertToDTO);
    }
    
    @Transactional(readOnly = true)
    public Page<PostDTO> searchPosts(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return postRepository.findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(keyword, keyword, pageable)
            .map(this::convertToDTO);
    }
    
    @Transactional
    public void likePost(Long id) {
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
        post.setLikes(post.getLikes() + 1);
        postRepository.save(post);
    }
    
    @Transactional
    public PostDTO createPost(PostDTO dto) {
        Post post = new Post();
        post.setTitle(dto.getTitle());
        post.setContent(dto.getContent());
        post.setExcerpt(dto.getExcerpt());
        post.setImage(dto.getImage());
        post.setCategory(dto.getCategory());
        post.setAuthor(dto.getAuthor() != null ? dto.getAuthor() : "Admin");
        post.setAuthorAvatar(dto.getAuthorAvatar());
        post.setTags(dto.getTags() != null ? dto.getTags() : List.of());
        post.setFeatured(dto.getFeatured() != null ? dto.getFeatured() : false);
        post.setHot(dto.getHot() != null ? dto.getHot() : false);
        return convertToDTO(postRepository.save(post));
    }
    
    @Transactional
    public PostDTO updatePost(Long id, PostDTO dto) {
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
        post.setTitle(dto.getTitle());
        post.setContent(dto.getContent());
        post.setExcerpt(dto.getExcerpt());
        post.setImage(dto.getImage());
        post.setCategory(dto.getCategory());
        post.setAuthor(dto.getAuthor());
        post.setAuthorAvatar(dto.getAuthorAvatar());
        post.setTags(dto.getTags());
        post.setFeatured(dto.getFeatured());
        post.setHot(dto.getHot());
        return convertToDTO(postRepository.save(post));
    }
    
    @Transactional
    public void deletePost(Long id) {
        if (!postRepository.existsById(id)) {
            throw new RuntimeException("Post not found with id: " + id);
        }
        // Xóa tất cả comments của bài viết trước
        commentService.deleteCommentsByPost(id);
        // Sau đó xóa bài viết
        postRepository.deleteById(id);
    }
    
    @Transactional
    public void toggleFeatured(Long id) {
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
        post.setFeatured(!post.getFeatured());
        postRepository.save(post);
    }
    
    @Transactional
    public void toggleHot(Long id) {
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Post not found with id: " + id));
        post.setHot(!post.getHot());
        postRepository.save(post);
    }
    
    private PostDTO convertToDTO(Post post) {
        return PostDTO.builder()
            .id(post.getId())
            .title(post.getTitle())
            .content(post.getContent())
            .excerpt(post.getExcerpt())
            .image(post.getImage())
            .category(post.getCategory())
            .author(post.getAuthor())
            .authorAvatar(post.getAuthorAvatar())
            .tags(post.getTags())
            .views(post.getViews())
            .likes(post.getLikes())
            .comments(post.getComments())
            .featured(post.getFeatured())
            .hot(post.getHot())
            .publishedAt(post.getPublishedAt())
            .createdAt(post.getCreatedAt())
            .updatedAt(post.getUpdatedAt())
            .build();
    }
}