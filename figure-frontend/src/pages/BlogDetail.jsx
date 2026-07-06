// src/pages/BlogDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FaCalendarAlt, FaUser, FaEye, FaHeart, FaComment, 
  FaShare, FaArrowLeft, FaSpinner, FaTags, FaFacebook, 
  FaTwitter, FaLinkedin, FaLink, FaCheck, FaBookmark,
  FaReply, FaTrash, FaUserCircle, FaRegThumbsUp,
  FaAngleDown, FaAngleUp
} from 'react-icons/fa';
import axiosClient from '../api/axiosClient';
import '../styles/BlogDetail.css';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [visibleReplies, setVisibleReplies] = useState({});
  
  // Comment states
  const [commentText, setCommentText] = useState('');
  const [commentName, setCommentName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [showReplyForm, setShowReplyForm] = useState({});
  const [likedComments, setLikedComments] = useState({});
  const [deletingComment, setDeletingComment] = useState(null);

  // Lấy thông tin user từ localStorage
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  const isAuthenticated = !!localStorage.getItem('token');
  const isAdmin = currentUser?.roles?.includes('ROLE_ADMIN');

  // Hàm lấy đường dẫn ảnh đúng
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/default-blog.jpg';
    
    // Nếu đã là URL đầy đủ (http:// hoặc https://)
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Nếu là đường dẫn từ upload (bắt đầu bằng /uploads/)
    if (imagePath.startsWith('/uploads/')) {
      return `http://localhost:8080${imagePath}`;
    }
    
    // Nếu là đường dẫn tương đối khác
    return imagePath;
  };

  useEffect(() => {
    fetchPost();
    fetchComments();
    window.scrollTo(0, 0);
  }, [id]);

  // Lấy bài viết
  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get(`/posts/${id}`);
      setPost(response.data);
      
      // Lấy bài viết liên quan
      if (response.data.category) {
        try {
          const relatedResponse = await axiosClient.get(`/posts/category/${response.data.category}`);
          let relatedData = [];
          if (relatedResponse.data && relatedResponse.data.content) {
            relatedData = relatedResponse.data.content;
          } else if (Array.isArray(relatedResponse.data)) {
            relatedData = relatedResponse.data;
          }
          const filtered = relatedData.filter(p => p.id !== parseInt(id)).slice(0, 3);
          setRelatedPosts(filtered);
        } catch (relatedError) {
          console.error('Error fetching related posts:', relatedError);
        }
      }
      
      setError(null);
    } catch (error) {
      console.error('Error fetching post:', error);
      if (error.response?.status === 404) {
        setError('Không tìm thấy bài viết');
      } else {
        setError('Không thể tải bài viết. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Lấy bình luận từ API
  const fetchComments = async () => {
    try {
      const response = await axiosClient.get(`/comments/post/${id}`);
      setComments(response.data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    }
  };

  // Gửi bình luận mới
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!commentText.trim()) {
      alert('Vui lòng nhập nội dung bình luận');
      return;
    }
    
    if (!isAuthenticated && (!commentName.trim() || !commentEmail.trim())) {
      alert('Vui lòng nhập họ tên và email');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const commentData = {
        content: commentText.trim(),
        author: isAuthenticated ? currentUser?.username || currentUser?.name : commentName.trim(),
        email: isAuthenticated ? currentUser?.email : commentEmail.trim(),
        postId: parseInt(id),
        parentId: null
      };
      
      const response = await axiosClient.post('/comments', commentData);
      const newComment = response.data;
      
      setComments(prev => [newComment, ...prev]);
      
      setCommentText('');
      setCommentName('');
      setCommentEmail('');
      
      alert('✅ Đã gửi bình luận thành công!');
    } catch (error) {
      console.error('Error submitting comment:', error);
      if (error.response?.status === 401) {
        alert('Vui lòng đăng nhập để bình luận');
        navigate('/login', { state: { from: `/blog/${id}` } });
      } else {
        alert('❌ Có lỗi xảy ra. Vui lòng thử lại sau.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Gửi reply
  const handleSubmitReply = async (commentId) => {
    if (!replyText.trim()) {
      alert('Vui lòng nhập nội dung trả lời');
      return;
    }
    
    try {
      const replyData = {
        content: replyText.trim(),
        author: isAuthenticated ? currentUser?.username || currentUser?.name : commentName.trim(),
        email: isAuthenticated ? currentUser?.email : commentEmail.trim(),
        postId: parseInt(id),
        parentId: commentId
      };
      
      const response = await axiosClient.post('/comments', replyData);
      const newReply = response.data;
      
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, replies: [...(comment.replies || []), newReply] }
          : comment
      ));
      
      setReplyText('');
      setShowReplyForm(prev => ({ ...prev, [commentId]: false }));
      setReplyTo(null);
      
      alert('✅ Đã gửi phản hồi thành công!');
    } catch (error) {
      console.error('Error submitting reply:', error);
      alert('❌ Có lỗi xảy ra. Vui lòng thử lại sau.');
    }
  };

  // Thích bình luận
  const handleLikeComment = async (commentId) => {
    if (likedComments[commentId]) return;
    
    try {
      await axiosClient.post(`/comments/${commentId}/like`);
      
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, likes: (comment.likes || 0) + 1 };
        }
        if (comment.replies) {
          return {
            ...comment,
            replies: comment.replies.map(reply => 
              reply.id === commentId 
                ? { ...reply, likes: (reply.likes || 0) + 1 }
                : reply
            )
          };
        }
        return comment;
      }));
      
      setLikedComments(prev => ({ ...prev, [commentId]: true }));
    } catch (error) {
      console.error('Error liking comment:', error);
      if (error.response?.status === 401) {
        alert('Vui lòng đăng nhập để thích bình luận');
      }
    }
  };

  // Xóa bình luận
  const handleDeleteComment = async (commentId, isReply = false, parentId = null) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
      return;
    }
    
    setDeletingComment(commentId);
    
    try {
      await axiosClient.delete(`/comments/${commentId}`);
      
      if (isReply && parentId) {
        setComments(prev => prev.map(comment => 
          comment.id === parentId 
            ? { ...comment, replies: comment.replies.filter(reply => reply.id !== commentId) }
            : comment
        ));
      } else {
        setComments(prev => prev.filter(comment => comment.id !== commentId));
      }
      
      alert('✅ Đã xóa bình luận');
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('❌ Xóa thất bại');
    } finally {
      setDeletingComment(null);
    }
  };

  // Thích bài viết
  const handleLike = async () => {
    if (liked) return;
    
    try {
      await axiosClient.post(`/posts/${id}/like`);
      setPost(prev => ({ ...prev, likes: (prev.likes || 0) + 1 }));
      setLiked(true);
    } catch (error) {
      console.error('Error liking post:', error);
      if (error.response?.status === 401) {
        alert('Vui lòng đăng nhập để thích bài viết');
        navigate('/login', { state: { from: `/blog/${id}` } });
      }
    }
  };

  // Lưu bài viết (localStorage)
  const handleSave = () => {
    setSaved(!saved);
    const savedPosts = JSON.parse(localStorage.getItem('savedPosts') || '[]');
    if (!saved) {
      if (!savedPosts.includes(id)) {
        savedPosts.push(id);
        localStorage.setItem('savedPosts', JSON.stringify(savedPosts));
      }
    } else {
      const index = savedPosts.indexOf(id);
      if (index > -1) {
        savedPosts.splice(index, 1);
        localStorage.setItem('savedPosts', JSON.stringify(savedPosts));
      }
    }
  };

  // Chia sẻ bài viết
  const handleShare = (platform) => {
    const url = window.location.href;
    const title = encodeURIComponent(post?.title || '');
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${title}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${title}`
    };
    
    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
    
    setShowShareMenu(false);
  };

  // Toggle reply form
  const toggleReplyForm = (commentId) => {
    setShowReplyForm(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
    setReplyTo(commentId);
    setReplyText('');
  };

  // Toggle hiển thị replies
  const toggleReplies = (commentId) => {
    setVisibleReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  // Format ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = Math.floor((now - date) / 1000);
      
      if (diff < 60) return `${diff} giây trước`;
      if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
      if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
      if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getCategoryName = (category) => {
    const categories = {
      news: 'Tin tức',
      promotion: 'Khuyến mãi',
      review: 'Đánh giá',
      guide: 'Hướng dẫn',
      gift: 'Quà tặng'
    };
    return categories[category] || category;
  };

  const getCategoryBadgeStyle = (category) => {
    const styles = {
      news: { background: '#2563eb', icon: '📰' },
      promotion: { background: '#ef4444', icon: '🎉' },
      review: { background: '#f59e0b', icon: '⭐' },
      guide: { background: '#10b981', icon: '📖' },
      gift: { background: '#8b5cf6', icon: '🎁' }
    };
    return styles[category] || { background: '#64748b', icon: '📄' };
  };

  // Kiểm tra saved posts khi load
  useEffect(() => {
    const savedPosts = JSON.parse(localStorage.getItem('savedPosts') || '[]');
    setSaved(savedPosts.includes(parseInt(id)));
  }, [id]);

  if (loading) {
    return (
      <div className="blog-detail-container">
        <div className="loading-spinner">
          <FaSpinner className="spinner" />
          <p>Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="blog-detail-container">
        <div className="error-message">
          <h3>⚠️ {error || 'Không tìm thấy bài viết'}</h3>
          <p>Rất tiếc, bài viết bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <div className="error-actions">
            <button onClick={() => navigate('/blog')} className="back-btn">
              <FaArrowLeft /> Quay lại trang blog
            </button>
            <button onClick={() => navigate('/')} className="home-btn">
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  const categoryStyle = getCategoryBadgeStyle(post.category);

  return (
    <div className="blog-detail-container">
      {/* Back Button */}
      <div className="back-button-container">
        <button onClick={() => navigate('/blog')} className="back-button">
          <FaArrowLeft /> Quay lại Blog
        </button>
      </div>

      {/* Hero Section */}
      <div className="blog-hero">
        {post.image && (
          <div className="blog-hero-image">
            <img 
              src={getImageUrl(post.image)} 
              alt={post.title}
              onError={(e) => {
                e.target.src = '/default-blog.jpg';
                e.target.onerror = null;
              }}
            />
            <div className="hero-overlay"></div>
          </div>
        )}
        <div className="blog-hero-content">
          <div className="post-category">
            <span 
              className="category-badge" 
              style={{ backgroundColor: categoryStyle.background }}
            >
              {categoryStyle.icon} {getCategoryName(post.category)}
            </span>
          </div>
          <h1 className="post-title">{post.title}</h1>
          <div className="post-meta">
            <div className="meta-item">
              <FaCalendarAlt />
              <span>{formatDate(post.publishedAt || post.createdAt)}</span>
            </div>
            <div className="meta-item">
              <FaUser />
              <span>{post.author || 'Admin'}</span>
            </div>
            <div className="meta-item">
              <FaEye />
              <span>{post.views?.toLocaleString() || 0} lượt xem</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="blog-content-wrapper">
        <div className="blog-main">
          <article className="blog-article">
            <div className="article-content">
              {post.excerpt && (
                <p className="article-excerpt">{post.excerpt}</p>
              )}
              <div className="article-body">
                {post.content ? (
                  post.content.split('\n').map((paragraph, index) => (
                    paragraph.trim() && <p key={index}>{paragraph}</p>
                  ))
                ) : (
                  <p>Nội dung đang được cập nhật...</p>
                )}
              </div>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="article-tags">
                <FaTags className="tags-icon" />
                {post.tags.map(tag => (
                  <Link key={tag} to={`/blog?tag=${tag}`} className="tag">
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="article-actions">
              <button 
                className={`action-btn like-btn ${liked ? 'active' : ''}`}
                onClick={handleLike}
              >
                <FaHeart /> {post.likes || 0} Thích
              </button>
              <button 
                className={`action-btn save-btn ${saved ? 'active' : ''}`}
                onClick={handleSave}
              >
                <FaBookmark /> {saved ? 'Đã lưu' : 'Lưu bài viết'}
              </button>
              <div className="share-wrapper">
                <button 
                  className="action-btn share-btn"
                  onClick={() => setShowShareMenu(!showShareMenu)}
                >
                  <FaShare /> Chia sẻ
                </button>
                {showShareMenu && (
                  <div className="share-menu">
                    <button onClick={() => handleShare('facebook')}>
                      <FaFacebook /> Facebook
                    </button>
                    <button onClick={() => handleShare('twitter')}>
                      <FaTwitter /> Twitter
                    </button>
                    <button onClick={() => handleShare('linkedin')}>
                      <FaLinkedin /> LinkedIn
                    </button>
                    <button onClick={() => handleShare('copy')}>
                      {copied ? <FaCheck /> : <FaLink />}
                      {copied ? 'Đã sao chép!' : 'Sao chép link'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Author Info */}
            <div className="author-section">
              <div className="author-avatar">
                {post.authorAvatar ? (
                  <img src={getImageUrl(post.authorAvatar)} alt={post.author} />
                ) : (
                  <div className="avatar-placeholder">
                    {post.author?.charAt(0) || 'A'}
                  </div>
                )}
              </div>
              <div className="author-info">
                <h4>{post.author || 'Admin'}</h4>
                <p>Chuyên gia đánh giá và chia sẻ về các dòng figure anime, game</p>
              </div>
            </div>
          </article>
        </div>

        {/* Sidebar */}
        <aside className="blog-sidebar">
          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="sidebar-widget">
              <h3>📖 Bài viết liên quan</h3>
              <div className="related-posts">
                {relatedPosts.map(related => (
                  <Link key={related.id} to={`/blog/${related.id}`} className="related-post">
                    {related.image && (
                      <div className="related-image">
                        <img 
                          src={getImageUrl(related.image)} 
                          alt={related.title}
                          onError={(e) => {
                            e.target.src = '/default-blog.jpg';
                            e.target.onerror = null;
                          }}
                        />
                      </div>
                    )}
                    <div className="related-info">
                      <h4>{related.title}</h4>
                      <span className="related-date">
                        <FaCalendarAlt /> {formatDate(related.publishedAt)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Popular Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="sidebar-widget">
              <h3>🏷️ Tags phổ biến</h3>
              <div className="popular-tags">
                {post.tags.slice(0, 10).map(tag => (
                  <Link key={tag} to={`/blog?tag=${tag}`} className="popular-tag">
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Newsletter */}
          <div className="sidebar-widget newsletter-widget">
            <h3>📧 Đăng ký nhận tin</h3>
            <p>Nhận thông báo về bài viết mới nhất</p>
            <div className="newsletter-form">
              <input type="email" placeholder="Email của bạn" />
              <button>Đăng ký</button>
            </div>
          </div>
        </aside>
      </div>

      {/* Comments Section */}
      <div className="comments-section">
        <div className="comments-header">
          <h3>💬 Bình luận</h3>
          <span className="comments-count">{comments.length} bình luận</span>
        </div>
        
        {/* Comment Form */}
        <div className="comment-form-container">
          <div className="comment-avatar">
            {currentUser?.avatar ? (
              <img src={getImageUrl(currentUser.avatar)} alt={currentUser.name} />
            ) : (
              <div className="avatar-placeholder">
                {currentUser?.username?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          <form className="comment-form" onSubmit={handleSubmitComment}>
            <textarea
              placeholder="Viết bình luận của bạn..."
              rows="3"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={submitting}
            ></textarea>
            
            {!isAuthenticated && (
              <div className="comment-user-info">
                <input
                  type="text"
                  placeholder="Họ và tên *"
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  disabled={submitting}
                />
                <input
                  type="email"
                  placeholder="Email *"
                  value={commentEmail}
                  onChange={(e) => setCommentEmail(e.target.value)}
                  disabled={submitting}
                />
              </div>
            )}
            
            <div className="form-actions">
              <button 
                type="submit" 
                className="submit-comment"
                disabled={submitting}
              >
                {submitting ? <FaSpinner className="spinner-small" /> : <FaComment />}
                {submitting ? 'Đang gửi...' : 'Gửi bình luận'}
              </button>
            </div>
          </form>
        </div>

        {/* Comments List */}
        <div className="comments-list">
          {comments.length === 0 ? (
            <div className="no-comments">
              <div className="no-comments-icon">💬</div>
              <p>Chưa có bình luận nào.</p>
              <span>Hãy là người đầu tiên bình luận!</span>
            </div>
          ) : (
            comments.map(comment => (
              <div key={comment.id} className="comment-item">
                <div className="comment-avatar">
                  <div className="avatar-placeholder">
                    {comment.author?.charAt(0).toUpperCase()}
                  </div>
                </div>
                
                <div className="comment-content">
                  <div className="comment-header">
                    <div className="comment-author-wrapper">
                      <span className="comment-author">{comment.author}</span>
                      {comment.author === 'Admin' && (
                        <span className="author-badge">Admin</span>
                      )}
                    </div>
                    <span className="comment-date">{formatDate(comment.createdAt)}</span>
                  </div>
                  
                  <p className="comment-text">{comment.content}</p>
                  
                  <div className="comment-footer">
                    <button 
                      className={`like-btn ${likedComments[comment.id] ? 'active' : ''}`}
                      onClick={() => handleLikeComment(comment.id)}
                    >
                      <FaRegThumbsUp />
                      <span>{comment.likes > 0 && comment.likes}</span>
                    </button>
                    <button 
                      className="reply-btn"
                      onClick={() => toggleReplyForm(comment.id)}
                    >
                      <FaReply /> Trả lời
                    </button>
                    {(isAdmin || comment.author === currentUser?.username) && (
                      <button 
                        className="delete-btn"
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={deletingComment === comment.id}
                      >
                        {deletingComment === comment.id ? <FaSpinner className="spinner-small" /> : <FaTrash />}
                      </button>
                    )}
                  </div>
                  
                  {/* Reply form */}
                  {showReplyForm[comment.id] && (
                    <div className="reply-form-container">
                      <div className="reply-avatar">
                        <div className="avatar-placeholder small">
                          {currentUser?.username?.charAt(0) || 'U'}
                        </div>
                      </div>
                      <div className="reply-form">
                        <textarea
                          placeholder={`Trả lời ${comment.author}...`}
                          rows="2"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                        />
                        <div className="reply-actions">
                          <button 
                            className="cancel-reply"
                            onClick={() => toggleReplyForm(comment.id)}
                          >
                            Hủy
                          </button>
                          <button 
                            className="submit-reply"
                            onClick={() => handleSubmitReply(comment.id)}
                          >
                            <FaReply /> Gửi
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="replies-section">
                      <button 
                        className="toggle-replies-btn"
                        onClick={() => toggleReplies(comment.id)}
                      >
                        {visibleReplies[comment.id] ? (
                          <>Ẩn {comment.replies.length} phản hồi <FaAngleUp /></>
                        ) : (
                          <>Xem {comment.replies.length} phản hồi <FaAngleDown /></>
                        )}
                      </button>
                      
                      {visibleReplies[comment.id] && (
                        <div className="replies-list">
                          {comment.replies.map(reply => (
                            <div key={reply.id} className="reply-item">
                              <div className="reply-avatar">
                                <div className="avatar-placeholder small">
                                  {reply.author?.charAt(0).toUpperCase()}
                                </div>
                              </div>
                              <div className="reply-content">
                                <div className="reply-header">
                                  <div className="reply-author-wrapper">
                                    <span className="reply-author">{reply.author}</span>
                                    {reply.author === 'Admin' && (
                                      <span className="author-badge admin">Admin</span>
                                    )}
                                  </div>
                                  <span className="reply-date">{formatDate(reply.createdAt)}</span>
                                </div>
                                <p className="reply-text">{reply.content}</p>
                                <div className="reply-footer">
                                  <button 
                                    className={`like-btn ${likedComments[reply.id] ? 'active' : ''}`}
                                    onClick={() => handleLikeComment(reply.id)}
                                  >
                                    <FaRegThumbsUp />
                                    <span>{reply.likes > 0 && reply.likes}</span>
                                  </button>
                                  {(isAdmin || reply.author === currentUser?.username) && (
                                    <button 
                                      className="delete-btn"
                                      onClick={() => handleDeleteComment(reply.id, true, comment.id)}
                                      disabled={deletingComment === reply.id}
                                    >
                                      {deletingComment === reply.id ? <FaSpinner className="spinner-small" /> : <FaTrash />}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;