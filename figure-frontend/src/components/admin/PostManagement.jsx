// src/components/admin/PostManagement.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaPlus, FaEdit, FaTrash, FaEye, FaImage, FaSearch, FaSpinner,
  FaTags, FaCalendarAlt, FaUser, FaFire, FaStar, FaUpload, FaTimes,
  FaUserCircle
} from 'react-icons/fa';
import axiosClient, { getImageUrl } from '../../api/axiosClient';
import '../../styles/PostManagement.css';

const PostManagement = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  
  // Ảnh bài viết
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  // Ảnh avatar tác giả
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    image: '',
    category: '',
    author: '',
    authorAvatar: '',
    tags: '',
    featured: false,
    hot: false
  });

  const categories = [
    { id: 'all', name: 'Tất cả' },
    { id: 'news', name: 'Tin tức' },
    { id: 'promotion', name: 'Khuyến mãi' },
    { id: 'review', name: 'Đánh giá' },
    { id: 'guide', name: 'Hướng dẫn' },
    { id: 'gift', name: 'Quà tặng' }
  ];

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [searchTerm, selectedCategory, posts]);

  const filterPosts = () => {
    let filtered = [...posts];
    
    if (searchTerm.trim()) {
      filtered = filtered.filter(post =>
        post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.author?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }
    
    setFilteredPosts(filtered);
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      console.log('📡 Fetching posts...');
      const response = await axiosClient.get('/admin/posts');
      setPosts(response.data || []);
      setFilteredPosts(response.data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      if (error.response?.status === 401) {
        alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        window.location.href = '/login';
      } else {
        alert('Lỗi khi tải danh sách bài viết');
      }
    } finally {
      setLoading(false);
    }
  };

  // Upload ảnh lên server
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await axiosClient.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.url || response.data.filePath;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Không thể upload ảnh');
    }
  };

  // Xử lý chọn ảnh bài viết - Không giới hạn kích thước
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Vui lòng chọn file ảnh định dạng JPEG, PNG, GIF hoặc WEBP');
      return;
    }
    
    // 👉 KHÔNG GIỚI HẠN KÍCH THƯỚC
    // Chỉ cảnh báo nếu file quá lớn nhưng vẫn cho phép upload
    if (file.size > 10 * 1024 * 1024) {
      if (!window.confirm(`Ảnh có kích thước ${(file.size / 1024 / 1024).toFixed(2)}MB. Tiếp tục upload?`)) {
        return;
      }
    }
    
    setImageFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Xử lý chọn ảnh avatar tác giả - Không giới hạn kích thước
  const handleAvatarSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Vui lòng chọn file ảnh định dạng JPEG, PNG, GIF hoặc WEBP');
      return;
    }
    
    // 👉 KHÔNG GIỚI HẠN KÍCH THƯỚC
    if (file.size > 5 * 1024 * 1024) {
      if (!window.confirm(`Ảnh avatar có kích thước ${(file.size / 1024 / 1024).toFixed(2)}MB. Tiếp tục upload?`)) {
        return;
      }
    }
    
    setAvatarFile(file);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Xóa ảnh bài viết
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, image: '' }));
  };

  // Xóa ảnh avatar
  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview('');
    setFormData(prev => ({ ...prev, authorAvatar: '' }));
  };

  const handleAddPost = () => {
    setEditingPost(null);
    setImageFile(null);
    setImagePreview('');
    setAvatarFile(null);
    setAvatarPreview('');
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      image: '',
      category: '',
      author: '',
      authorAvatar: '',
      tags: '',
      featured: false,
      hot: false
    });
    setShowModal(true);
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setImageFile(null);
    setImagePreview(post.image || '');
    setAvatarFile(null);
    setAvatarPreview(post.authorAvatar || '');
    setFormData({
      title: post.title || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      image: post.image || '',
      category: post.category || '',
      author: post.author || '',
      authorAvatar: post.authorAvatar || '',
      tags: post.tags?.join(', ') || '',
      featured: post.featured || false,
      hot: post.hot || false
    });
    setShowModal(true);
  };

  const handleViewDetail = (post) => {
    setSelectedPost(post);
    setShowDetailModal(true);
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      return;
    }

    try {
      console.log(`🗑️ Deleting post ID: ${id}`);
      await axiosClient.delete(`/admin/posts/${id}`);
      await fetchPosts();
      alert('✅ Xóa bài viết thành công');
    } catch (error) {
      console.error('Error deleting post:', error);
      alert(error.response?.data?.message || '❌ Xóa bài viết thất bại');
    }
  };

  const handleToggleFeatured = async (post) => {
    try {
      await axiosClient.patch(`/admin/posts/${post.id}/toggle-featured`);
      await fetchPosts();
      alert(`✅ Đã ${post.featured ? 'bỏ ghim' : 'ghim'} bài viết`);
    } catch (error) {
      console.error('Error toggling featured:', error);
      alert('❌ Thao tác thất bại');
    }
  };

  const handleToggleHot = async (post) => {
    try {
      await axiosClient.patch(`/admin/posts/${post.id}/toggle-hot`);
      await fetchPosts();
      alert(`✅ Đã ${post.hot ? 'bỏ đánh dấu' : 'đánh dấu'} bài viết hot`);
    } catch (error) {
      console.error('Error toggling hot:', error);
      alert('❌ Thao tác thất bại');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('⚠️ Vui lòng nhập tiêu đề bài viết');
      return;
    }
    if (!formData.category) {
      alert('⚠️ Vui lòng chọn danh mục');
      return;
    }
    
    setSaving(true);
    
    try {
      let imageUrl = formData.image;
      let avatarUrl = formData.authorAvatar;
      
      // Upload ảnh bài viết nếu có
      if (imageFile) {
        setUploading(true);
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }
      
      // Upload ảnh avatar nếu có
      if (avatarFile) {
        setUploading(true);
        const uploadedUrl = await uploadImage(avatarFile);
        if (uploadedUrl) {
          avatarUrl = uploadedUrl;
        }
      }
      
      const postData = {
        title: formData.title.trim(),
        excerpt: formData.excerpt?.trim() || formData.content?.substring(0, 150) || '',
        content: formData.content?.trim() || '',
        image: imageUrl || null,
        category: formData.category,
        author: formData.author?.trim() || 'Admin',
        authorAvatar: avatarUrl || null,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
        featured: formData.featured,
        hot: formData.hot
      };

      console.log('📤 Sending post data:', postData);

      if (editingPost) {
        await axiosClient.put(`/admin/posts/${editingPost.id}`, postData);
        alert('✅ Cập nhật bài viết thành công');
      } else {
        await axiosClient.post('/admin/posts', postData);
        alert('✅ Thêm bài viết thành công');
      }

      setShowModal(false);
      setEditingPost(null);
      setImageFile(null);
      setImagePreview('');
      setAvatarFile(null);
      setAvatarPreview('');
      await fetchPosts();
      
    } catch (error) {
      console.error('Error saving post:', error);
      
      if (error.response) {
        const { status, data } = error.response;
        if (status === 400) {
          alert(`❌ Lỗi dữ liệu: ${data.message || 'Dữ liệu không hợp lệ'}`);
        } else if (status === 401) {
          alert('❌ Phiên đăng nhập hết hạn');
          window.location.href = '/login';
        } else if (status === 403) {
          alert('🚫 Không có quyền thực hiện thao tác này');
        } else {
          alert(`❌ Lỗi server: ${data.message || 'Lỗi không xác định'}`);
        }
      } else if (error.request) {
        alert('🌐 Không thể kết nối đến server');
      } else {
        alert('❌ Lỗi: ' + error.message);
      }
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  const getCategoryName = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId);
    return cat ? cat.name : categoryId;
  };

  const getCategoryBadge = (category) => {
    const colors = {
      news: '#2563eb',
      promotion: '#ef4444',
      review: '#f59e0b',
      guide: '#10b981',
      gift: '#8b5cf6'
    };
    return colors[category] || '#64748b';
  };

  const isUploading = uploading || saving;

  return (
    <div className="post-management">
      <div className="page-header">
        <div className="header-left">
          <h1>
            <FaTags style={{ marginRight: '10px' }} />
            Quản lý bài viết
          </h1>
          <div className="subtitle">
            Tổng bài viết: <span className="count-badge">{posts.length}</span>
          </div>
        </div>
        <button className="add-btn" onClick={handleAddPost}>
          <FaPlus /> Viết bài mới
        </button>
      </div>

      <div className="filters">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề, nội dung, tác giả..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="all">Tất cả danh mục</option>
          <option value="news">Tin tức</option>
          <option value="promotion">Khuyến mãi</option>
          <option value="review">Đánh giá</option>
          <option value="guide">Hướng dẫn</option>
          <option value="gift">Quà tặng</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">
          <FaSpinner className="spinner" />
          <p>Đang tải bài viết...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="no-data">
          <FaTags className="no-data-icon" />
          <p>Không tìm thấy bài viết nào</p>
          <button className="add-first-btn" onClick={handleAddPost}>
            <FaPlus /> Viết bài viết đầu tiên
          </button>
        </div>
      ) : (
        <div className="posts-table-container">
          <table className="posts-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Hình ảnh</th>
                <th>Tiêu đề</th>
                <th>Danh mục</th>
                <th>Tác giả</th>
                <th>Ngày đăng</th>
                <th>Lượt xem</th>
                <th>Nổi bật</th>
                <th>Hot</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map(post => (
                <tr key={post.id}>
                  <td>{post.id}</td>
                  <td className="image-cell">
                    {post.image ? (
                      <img src={getImageUrl(post.image)} alt={post.title} className="post-thumb" />
                    ) : (
                      <FaImage className="placeholder-thumb" />
                    )}
                  </td>
                  <td className="title-cell">
                    <div className="post-title">{post.title}</div>
                    <div className="post-excerpt">{post.excerpt?.substring(0, 80)}...</div>
                  </td>
                  <td>
                    <span 
                      className="category-badge" 
                      style={{ backgroundColor: getCategoryBadge(post.category) }}
                    >
                      {getCategoryName(post.category)}
                    </span>
                  </td>
                  <td>
                    <div className="author-info">
                      {post.authorAvatar ? (
                        <img src={getImageUrl(post.authorAvatar)} alt={post.author} className="author-avatar" />
                      ) : (
                        <FaUserCircle className="author-avatar-placeholder" />
                      )}
                      <span>{post.author || 'Admin'}</span>
                    </div>
                  </td>
                  <td>{formatDate(post.publishedAt)}</td>
                  <td className="views-cell">{post.views?.toLocaleString() || 0}</td>
                  <td>
                    <button 
                      className={`featured-btn ${post.featured ? 'active' : ''}`}
                      onClick={() => handleToggleFeatured(post)}
                      title={post.featured ? 'Bỏ ghim' : 'Ghim bài viết'}
                    >
                      <FaStar />
                    </button>
                  </td>
                  <td>
                    <button 
                      className={`hot-btn ${post.hot ? 'active' : ''}`}
                      onClick={() => handleToggleHot(post)}
                      title={post.hot ? 'Bỏ đánh dấu hot' : 'Đánh dấu hot'}
                    >
                      <FaFire />
                    </button>
                  </td>
                  <td className="actions-cell">
                    <div className="actions">
                      <button 
                        className="action-btn view-btn" 
                        onClick={() => handleViewDetail(post)}
                        title="Xem chi tiết"
                      >
                        <FaEye />
                      </button>
                      <button 
                        className="action-btn edit-btn" 
                        onClick={() => handleEditPost(post)}
                        title="Chỉnh sửa"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="action-btn delete-btn" 
                        onClick={() => handleDeletePost(post.id)}
                        title="Xóa"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal thêm/sửa bài viết */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <div className="modal-header">
              <h2>{editingPost ? 'Chỉnh sửa bài viết' : 'Viết bài mới'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tiêu đề <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Nhập tiêu đề bài viết"
                  required
                  disabled={isUploading}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Danh mục <span className="required">*</span></label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                    disabled={isUploading}
                  >
                    <option value="">Chọn danh mục</option>
                    <option value="news">Tin tức</option>
                    <option value="promotion">Khuyến mãi</option>
                    <option value="review">Đánh giá</option>
                    <option value="guide">Hướng dẫn</option>
                    <option value="gift">Quà tặng</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Tác giả</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({...formData, author: e.target.value})}
                    placeholder="Tên tác giả"
                    disabled={isUploading}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tags (phân cách bằng dấu phẩy)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    placeholder="Genshin Impact, Figure, Review"
                    disabled={isUploading}
                  />
                </div>
              </div>

              {/* Upload ảnh bài viết - Không giới hạn MB */}
              <div className="form-group">
                <label>Hình ảnh bài viết</label>
                <div className="image-upload-area">
                  {imagePreview ? (
                    <div className="image-preview-container">
                      <img src={imagePreview.startsWith('data:') ? imagePreview : getImageUrl(imagePreview)} alt="Preview" className="image-preview" />
                      <button 
                        type="button" 
                        className="remove-image-btn"
                        onClick={handleRemoveImage}
                        disabled={isUploading}
                      >
                        <FaTimes /> Xóa ảnh
                      </button>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <FaUpload className="upload-icon" />
                      <p>Kéo thả ảnh vào đây hoặc click để chọn</p>
                      <input
                        type="file"
                        id="imageUpload"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={handleImageSelect}
                        disabled={isUploading}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="imageUpload" className="upload-btn">
                        <FaUpload /> Chọn ảnh từ máy tính
                      </label>
                      <p className="upload-hint">Hỗ trợ JPG, PNG, GIF, WEBP (không giới hạn dung lượng)</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload ảnh avatar tác giả - Không giới hạn MB */}
              <div className="form-group">
                <label>Avatar tác giả</label>
                <div className="avatar-upload-area">
                  {avatarPreview ? (
                    <div className="avatar-preview-container">
                      <img src={avatarPreview.startsWith('data:') ? avatarPreview : getImageUrl(avatarPreview)} alt="Avatar" className="avatar-preview" />
                      <button 
                        type="button" 
                        className="remove-avatar-btn"
                        onClick={handleRemoveAvatar}
                        disabled={isUploading}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    <div className="upload-placeholder small">
                      <FaUserCircle className="upload-icon" />
                      <p>Chọn ảnh đại diện cho tác giả</p>
                      <input
                        type="file"
                        id="avatarUpload"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        onChange={handleAvatarSelect}
                        disabled={isUploading}
                        style={{ display: 'none' }}
                      />
                      <label htmlFor="avatarUpload" className="upload-btn small">
                        <FaUpload /> Chọn avatar
                      </label>
                      <p className="upload-hint">Hỗ trợ JPG, PNG (không giới hạn dung lượng)</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Tóm tắt</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                  rows="3"
                  placeholder="Tóm tắt nội dung bài viết..."
                  disabled={isUploading}
                />
              </div>

              <div className="form-group">
                <label>Nội dung</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  rows="10"
                  placeholder="Nhập nội dung bài viết chi tiết..."
                  disabled={isUploading}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                      disabled={isUploading}
                    />
                    <FaStar /> Ghim bài viết (hiển thị ở đầu trang)
                  </label>
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.hot}
                      onChange={(e) => setFormData({...formData, hot: e.target.checked})}
                      disabled={isUploading}
                    />
                    <FaFire /> Đánh dấu bài viết Hot
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)} disabled={isUploading}>
                  Hủy
                </button>
                <button type="submit" className="save-btn" disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <FaSpinner className="spinner" />
                      Đang xử lý...
                    </>
                  ) : editingPost ? (
                    'Cập nhật'
                  ) : (
                    'Đăng bài'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal chi tiết bài viết */}
      {showDetailModal && selectedPost && (
        <div className="modal-overlay">
          <div className="modal modal-detail">
            <div className="modal-header">
              <h2>Chi tiết bài viết</h2>
              <button className="close-btn" onClick={() => setShowDetailModal(false)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <div className="detail-image">
                  {selectedPost.image ? (
                    <img src={getImageUrl(selectedPost.image)} alt={selectedPost.title} />
                  ) : (
                    <FaImage className="detail-placeholder" />
                  )}
                </div>
                <h3>{selectedPost.title}</h3>
                <div className="detail-meta">
                  <span><FaCalendarAlt /> {formatDate(selectedPost.publishedAt)}</span>
                  <span>
                    {selectedPost.authorAvatar ? (
                      <img src={getImageUrl(selectedPost.authorAvatar)} alt={selectedPost.author} className="detail-avatar" />
                    ) : (
                      <FaUserCircle />
                    )}
                    {selectedPost.author || 'Admin'}
                  </span>
                  <span><FaEye /> {selectedPost.views?.toLocaleString()} lượt xem</span>
                </div>
                <div className="detail-category">
                  <span 
                    className="category-badge" 
                    style={{ backgroundColor: getCategoryBadge(selectedPost.category) }}
                  >
                    {getCategoryName(selectedPost.category)}
                  </span>
                  {selectedPost.tags?.length > 0 && (
                    <div className="detail-tags">
                      {selectedPost.tags.map(tag => (
                        <span key={tag} className="tag">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="detail-excerpt">
                  <strong>Tóm tắt:</strong>
                  <p>{selectedPost.excerpt}</p>
                </div>
                <div className="detail-content">
                  <strong>Nội dung:</strong>
                  <div className="content-text">{selectedPost.content}</div>
                </div>
                <div className="detail-stats">
                  <div className="stat">
                    <FaStar /> {selectedPost.featured ? 'Bài viết ghim' : 'Không ghim'}
                  </div>
                  <div className="stat">
                    <FaFire /> {selectedPost.hot ? 'Bài viết hot' : 'Không hot'}
                  </div>
                  <div className="stat">
                    💬 {selectedPost.comments || 0} bình luận
                  </div>
                  <div className="stat">
                    ❤️ {selectedPost.likes || 0} lượt thích
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                type="button" 
                className="edit-btn-modal" 
                onClick={() => {
                  setShowDetailModal(false);
                  handleEditPost(selectedPost);
                }}
              >
                <FaEdit /> Chỉnh sửa
              </button>
              <button 
                type="button" 
                className="close-modal-btn" 
                onClick={() => setShowDetailModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostManagement;