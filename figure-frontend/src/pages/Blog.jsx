// src/pages/Blog.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaCalendarAlt, FaUser, FaTag, FaEye, FaHeart, 
  FaComment, FaShare, FaSearch, FaArrowRight,
  FaNewspaper, FaFire, FaClock, FaBookOpen, FaSpinner
} from 'react-icons/fa';
import axiosClient from '../api/axiosClient';
import '../styles/Blog.css';

const Blog = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [hotPosts, setHotPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const postsPerPage = 6;

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

  // Lấy params từ URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get('category');
    const tag = params.get('tag');
    const keyword = params.get('keyword');
    
    if (category) setSelectedCategory(category);
    if (tag) setSelectedTag(tag);
    if (keyword) setSearchTerm(keyword);
  }, [location.search]);

  useEffect(() => {
    fetchPosts();
    fetchFeaturedPosts();
    fetchHotPosts();
    fetchCategoriesAndTags();
  }, [currentPage, selectedCategory, selectedTag, searchTerm]);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `/posts?page=${currentPage - 1}&size=${postsPerPage}`;
      
      if (selectedCategory !== 'all') {
        url = `/posts/category/${selectedCategory}?page=${currentPage - 1}&size=${postsPerPage}`;
      } else if (searchTerm) {
        url = `/posts/search?keyword=${encodeURIComponent(searchTerm)}&page=${currentPage - 1}&size=${postsPerPage}`;
      }
      
      console.log('📡 Fetching posts from:', url);
      const response = await axiosClient.get(url);
      
      if (response.data && response.data.content) {
        setPosts(response.data.content);
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements);
      } else if (Array.isArray(response.data)) {
        setPosts(response.data);
        setTotalPages(Math.ceil(response.data.length / postsPerPage));
        setTotalElements(response.data.length);
      } else {
        setPosts([]);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Không thể tải danh sách bài viết');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedPosts = async () => {
    try {
      const response = await axiosClient.get('/posts/featured');
      if (Array.isArray(response.data)) {
        setFeaturedPosts(response.data.slice(0, 2));
      }
    } catch (err) {
      console.error('Error fetching featured posts:', err);
    }
  };

  const fetchHotPosts = async () => {
    try {
      const response = await axiosClient.get('/posts/hot');
      if (Array.isArray(response.data)) {
        setHotPosts(response.data.slice(0, 4));
      }
    } catch (err) {
      console.error('Error fetching hot posts:', err);
    }
  };

  const fetchCategoriesAndTags = async () => {
    try {
      const response = await axiosClient.get('/posts?page=0&size=100');
      let allPosts = [];
      if (response.data && response.data.content) {
        allPosts = response.data.content;
      } else if (Array.isArray(response.data)) {
        allPosts = response.data;
      }
      
      const categoryMap = new Map();
      const tagSet = new Set();
      
      allPosts.forEach(post => {
        if (post.category) {
          const count = categoryMap.get(post.category) || 0;
          categoryMap.set(post.category, count + 1);
        }
        if (post.tags) {
          post.tags.forEach(tag => tagSet.add(tag));
        }
      });
      
      const categoryList = [
        { id: 'all', name: 'Tất cả', icon: <FaNewspaper />, count: allPosts.length },
        { id: 'news', name: 'Tin tức', icon: '📰', count: categoryMap.get('news') || 0 },
        { id: 'promotion', name: 'Khuyến mãi', icon: '🎉', count: categoryMap.get('promotion') || 0 },
        { id: 'review', name: 'Đánh giá', icon: '⭐', count: categoryMap.get('review') || 0 },
        { id: 'guide', name: 'Hướng dẫn', icon: '📖', count: categoryMap.get('guide') || 0 },
        { id: 'gift', name: 'Quà tặng', icon: '🎁', count: categoryMap.get('gift') || 0 }
      ];
      
      setCategories(categoryList);
      
      const tagList = [
        { id: 'all', name: 'Tất cả tags', count: allPosts.length },
        ...Array.from(tagSet).map(tag => ({ 
          id: tag, 
          name: tag, 
          count: allPosts.filter(p => p.tags?.includes(tag)).length 
        }))
      ];
      setTags(tagList);
      
    } catch (err) {
      console.error('Error fetching categories and tags:', err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  const handleReadMore = (postId) => {
    navigate(`/blog/${postId}`);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSelectedTag('all');
    setCurrentPage(1);
    navigate(`/blog${category !== 'all' ? `?category=${category}` : ''}`);
  };

  const handleTagChange = (tag) => {
    setSelectedTag(tag);
    setSelectedCategory('all');
    setCurrentPage(1);
    navigate(`/blog${tag !== 'all' ? `?tag=${tag}` : ''}`);
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      setSelectedCategory('all');
      setSelectedTag('all');
      setCurrentPage(1);
      navigate(`/blog?keyword=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedTag('all');
    setCurrentPage(1);
    navigate('/blog');
  };

  if (loading && posts.length === 0) {
    return (
      <div className="blog-container">
        <div className="loading-spinner">
          <FaSpinner className="spinner" />
          <p>Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-container">
      {/* Header */}
      <div className="blog-header">
        <h1>📝 Blog & Tin tức</h1>
        <p>Cập nhật những thông tin mới nhất về figure, sự kiện và khuyến mãi</p>
      </div>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <div className="featured-section">
          <h2>✨ Bài viết nổi bật</h2>
          <div className="featured-grid">
            {featuredPosts.map(post => (
              <div key={post.id} className="featured-card">
                <div className="featured-image">
                  <img 
                    src={getImageUrl(post.image)} 
                    alt={post.title}
                    onError={(e) => { e.target.src = '/default-blog.jpg'; }}
                  />
                  <div className="featured-category">{post.category}</div>
                </div>
                <div className="featured-content">
                  <h3>{post.title}</h3>
                  <p>{post.excerpt?.substring(0, 150)}...</p>
                  <div className="post-meta">
                    <span><FaCalendarAlt /> {formatDate(post.publishedAt || post.createdAt)}</span>
                    <span><FaUser /> {post.author || 'Admin'}</span>
                    <span><FaEye /> {post.views?.toLocaleString() || 0}</span>
                  </div>
                  <button className="read-more-btn" onClick={() => handleReadMore(post.id)}>
                    Đọc tiếp <FaArrowRight />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hot Posts */}
      {hotPosts.length > 0 && (
        <div className="hot-section">
          <h2>🔥 Bài viết hot</h2>
          <div className="hot-grid">
            {hotPosts.map(post => (
              <div key={post.id} className="hot-card" onClick={() => handleReadMore(post.id)}>
                <div className="hot-image">
                  <img 
                    src={getImageUrl(post.image)} 
                    alt={post.title}
                    onError={(e) => { e.target.src = '/default-blog.jpg'; }}
                  />
                  <div className="hot-badge">HOT</div>
                </div>
                <div className="hot-content">
                  <h4>{post.title}</h4>
                  <div className="post-stats">
                    <span><FaEye /> {post.views?.toLocaleString() || 0}</span>
                    <span><FaHeart /> {post.likes || 0}</span>
                    <span><FaComment /> {post.comments || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="blog-filters">
        <div className="search-box">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm bài viết..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>✕</button>
          )}
          <button className="search-submit" onClick={handleSearch}>Tìm</button>
        </div>

        <div className="filter-section">
          <div className="filter-group">
            <label>Danh mục:</label>
            <select value={selectedCategory} onChange={(e) => handleCategoryChange(e.target.value)}>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name} ({cat.count})</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Tags:</label>
            <select value={selectedTag} onChange={(e) => handleTagChange(e.target.value)}>
              {tags.map(tag => (
                <option key={tag.id} value={tag.id}>{tag.name} ({tag.count})</option>
              ))}
            </select>
          </div>

          {(searchTerm || selectedCategory !== 'all' || selectedTag !== 'all') && (
            <button className="clear-filters" onClick={clearFilters}>Xóa bộ lọc</button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="blog-results">
        <p>Tìm thấy <strong>{totalElements}</strong> bài viết</p>
      </div>

      {/* Blog Grid */}
      {error ? (
        <div className="error-message">
          <p>⚠️ {error}</p>
          <button onClick={fetchPosts}>Thử lại</button>
        </div>
      ) : posts.length === 0 ? (
        <div className="no-results">
          <FaBookOpen className="no-results-icon" />
          <h3>Không tìm thấy bài viết</h3>
          <p>Rất tiếc không tìm thấy bài viết nào phù hợp với tìm kiếm của bạn.</p>
          <button onClick={clearFilters}>Xóa bộ lọc</button>
        </div>
      ) : (
        <div className="blog-grid">
          {posts.map(post => (
            <article key={post.id} className="blog-card">
              <div className="blog-image">
                <img 
                  src={getImageUrl(post.image)} 
                  alt={post.title}
                  onError={(e) => { e.target.src = '/default-blog.jpg'; }}
                />
                <div className="blog-category">{post.category}</div>
                {post.hot && <div className="hot-tag">HOT</div>}
              </div>
              <div className="blog-content">
                <h3>{post.title}</h3>
                <div className="blog-meta">
                  <span><FaCalendarAlt /> {formatDate(post.publishedAt || post.createdAt)}</span>
                  <span><FaUser /> {post.author || 'Admin'}</span>
                  <span><FaEye /> {post.views?.toLocaleString() || 0}</span>
                </div>
                <p className="blog-excerpt">{post.excerpt?.substring(0, 120)}...</p>
                <div className="blog-tags">
                  {post.tags?.slice(0, 3).map(tag => (
                    <span key={tag} className="tag">#{tag}</span>
                  ))}
                </div>
                <div className="blog-actions">
                  <button className="read-more" onClick={() => handleReadMore(post.id)}>
                    Đọc tiếp <FaArrowRight />
                  </button>
                  <div className="post-stats">
                    <button className="like-btn"><FaHeart /> {post.likes || 0}</button>
                    <button className="comment-btn"><FaComment /> {post.comments || 0}</button>
                    <button className="share-btn"><FaShare /></button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="page-btn" 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            &laquo; Trước
          </button>
          
          {[...Array(Math.min(totalPages, 5))].map((_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            return (
              <button
                key={pageNum}
                className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button 
            className="page-btn" 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Sau &raquo;
          </button>
        </div>
      )}

      {/* Newsletter */}
      <div className="newsletter-section">
        <div className="newsletter-content">
          <h3>📧 Đăng ký nhận tin</h3>
          <p>Nhận thông báo về bài viết mới, khuyến mãi và sự kiện hấp dẫn</p>
          <div className="newsletter-form">
            <input type="email" placeholder="Email của bạn" />
            <button>Đăng ký</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;