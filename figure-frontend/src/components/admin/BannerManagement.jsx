import React, { useState, useEffect } from 'react';
import { 
  FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaSpinner,
  FaImage, FaLink, FaSortNumericDown, FaEye, FaUpload
} from 'react-icons/fa';
import axiosClient, { getImageUrl } from '../../api/axiosClient';
import '../../styles/BannerManagement.css';

const BannerManagement = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    linkUrl: '',
    displayOrder: 0,
    isActive: true
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await axiosClient.get('/admin/banners');
      setBanners(response.data || response || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
      alert('Không thể tải danh sách banner');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setImageFile(null);
    setImagePreview('');
    setFormData({
      title: '',
      subtitle: '',
      imageUrl: '',
      linkUrl: '',
      displayOrder: 0,
      isActive: true
    });
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setImageFile(null);
    setImagePreview(item.imageUrl ? getImageUrl(item.imageUrl) : '');
    setFormData({
      title: item.title,
      subtitle: item.subtitle || '',
      imageUrl: item.imageUrl,
      linkUrl: item.linkUrl || '',
      displayOrder: item.displayOrder || 0,
      isActive: item.isActive ?? true
    });
    setShowModal(true);
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Bạn có chắc muốn xóa banner "${title}"?`)) {
      return;
    }
    
    try {
      await axiosClient.delete(`/admin/banners/${id}`);
      alert('✅ Xóa thành công');
      fetchBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
      alert('❌ Xóa thất bại');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, WEBP...)');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (file) => {
    const uploadData = new FormData();
    uploadData.append('file', file);
    
    try {
      setUploading(true);
      const token = localStorage.getItem('token');
      const response = await axiosClient.post('/upload', uploadData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data.url || response.data.filePath || response.data;
    } catch (error) {
      console.error('Error uploading banner image:', error);
      throw new Error('Không thể tải ảnh lên máy chủ');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Vui lòng nhập tiêu đề');
      return;
    }

    setSaving(true);
    
    try {
      let finalImageUrl = formData.imageUrl;

      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile);
      }

      if (!finalImageUrl) {
        alert('Vui lòng chọn hoặc tải ảnh lên cho banner');
        setSaving(false);
        return;
      }

      const data = {
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim(),
        imageUrl: finalImageUrl,
        linkUrl: formData.linkUrl.trim(),
        displayOrder: parseInt(formData.displayOrder) || 0,
        isActive: formData.isActive
      };
      
      if (editingItem) {
        await axiosClient.put(`/admin/banners/${editingItem.id}`, data);
        alert('✅ Cập nhật thành công');
      } else {
        await axiosClient.post('/admin/banners', data);
        alert('✅ Thêm thành công');
      }
      
      setShowModal(false);
      fetchBanners();
    } catch (error) {
      console.error('Error saving banner:', error);
      alert(error.response?.data?.error || error.message || '❌ Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  const filteredBanners = banners.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.subtitle && item.subtitle.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="banner-management">
      <div className="section-header-panel">
        <div className="header-info">
          <h2>Quản lý Banner Trang chủ</h2>
          <p>Tải lên và tùy chỉnh ảnh trình chiếu chính (Carousel/Slider) ở đầu trang chủ</p>
        </div>
        <button className="btn-add" onClick={handleAdd}>
          <FaPlus /> Thêm Banner Mới
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Tìm kiếm banner theo tiêu đề..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <FaSpinner className="spinner" />
          <p>Đang tải danh sách banner...</p>
        </div>
      ) : filteredBanners.length === 0 ? (
        <div className="empty-state">
          <FaImage className="empty-icon" />
          <h3>Không tìm thấy banner nào</h3>
          <p>{searchTerm ? 'Hãy thử tìm kiếm với từ khóa khác' : 'Bắt đầu bằng cách tạo banner đầu tiên cho trang chủ của bạn'}</p>
        </div>
      ) : (
        <div className="banners-table-container">
          <table className="banners-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Hình ảnh</th>
                <th>Thông tin Banner</th>
                <th>Đường dẫn click</th>
                <th>Thứ tự hiển thị</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredBanners.map(banner => (
                <tr key={banner.id}>
                  <td className="id-cell">#{banner.id}</td>
                  <td className="image-cell">
                    <div className="banner-preview-mini">
                      <img 
                        src={getImageUrl(banner.imageUrl)} 
                        alt={banner.title} 
                        onError={(e) => e.target.src = '/default-figure.jpg'}
                      />
                    </div>
                  </td>
                  <td className="info-cell">
                    <div className="banner-title-text">{banner.title}</div>
                    {banner.subtitle && <div className="banner-subtitle-text">{banner.subtitle}</div>}
                  </td>
                  <td className="link-cell">
                    {banner.linkUrl ? (
                      <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer" className="link-preview">
                        <FaLink /> {banner.linkUrl.length > 30 ? banner.linkUrl.slice(0, 30) + '...' : banner.linkUrl}
                      </a>
                    ) : (
                      <span className="no-link">Không có liên kết</span>
                    )}
                  </td>
                  <td className="order-cell">
                    <span className="order-badge">{banner.displayOrder}</span>
                  </td>
                  <td className="status-cell">
                    <span className={`status-badge ${banner.isActive ? 'active' : 'inactive'}`}>
                      {banner.isActive ? 'Đang hoạt động' : 'Tạm ẩn'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <div className="banner-actions-horizontal">
                      <button className="action-btn edit-btn" onClick={() => handleEdit(banner)} title="Chỉnh sửa">
                        <FaEdit />
                      </button>
                      <button className="action-btn delete-btn" onClick={() => handleDelete(banner.id, banner.title)} title="Xóa">
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

      {/* Form Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingItem ? 'Chỉnh sửa Banner' : 'Tạo Banner Mới'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)} disabled={saving || uploading}>
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tiêu đề chính *</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Nhập tiêu đề lớn trên banner (VD: KHO MÔ HÌNH CHÍNH HÃNG)"
                  required
                  disabled={saving || uploading}
                />
              </div>

              <div className="form-group">
                <label>Phụ đề / Mô tả ngắn</label>
                <textarea 
                  value={formData.subtitle}
                  onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                  placeholder="Nhập phụ đề ngắn hiển thị dưới tiêu đề chính"
                  rows="2"
                  disabled={saving || uploading}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Đường dẫn liên kết khi click</label>
                  <input 
                    type="text" 
                    value={formData.linkUrl}
                    onChange={(e) => setFormData({...formData, linkUrl: e.target.value})}
                    placeholder="VD: /figures hoặc đường dẫn sản phẩm"
                    disabled={saving || uploading}
                  />
                </div>

                <div className="form-group">
                  <label>Thứ tự sắp xếp</label>
                  <input 
                    type="number" 
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({...formData, displayOrder: e.target.value})}
                    placeholder="Số càng nhỏ xếp trước"
                    min="0"
                    disabled={saving || uploading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Hình ảnh Banner *</label>
                <div className="image-upload-wrapper">
                  <div className="image-upload-field">
                    <input 
                      type="text" 
                      value={formData.imageUrl}
                      onChange={(e) => {
                        setFormData({...formData, imageUrl: e.target.value});
                        setImagePreview(e.target.value);
                      }}
                      placeholder="Nhập trực tiếp URL ảnh hoặc tải ảnh lên ở bên dưới"
                      disabled={saving || uploading}
                    />
                  </div>
                  
                  <div className="image-uploader-dropzone">
                    {imagePreview ? (
                      <div className="preview-container">
                        <img src={imagePreview} alt="Preview" onError={(e) => e.target.src = '/default-figure.jpg'} />
                        <button type="button" className="remove-preview-btn" onClick={() => {
                          setImageFile(null);
                          setImagePreview('');
                          setFormData({...formData, imageUrl: ''});
                        }}>✕</button>
                      </div>
                    ) : (
                      <label className="upload-label">
                        <FaUpload className="upload-icon" />
                        <span>Chọn tệp ảnh để tải lên</span>
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={handleImageChange}
                          style={{ display: 'none' }}
                          disabled={saving || uploading}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label className="switch-label">
                  <input 
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    disabled={saving || uploading}
                  />
                  <span className="slider"></span>
                  <span className="label-text">Hiển thị Banner này trên trang chủ</span>
                </label>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => setShowModal(false)}
                  disabled={saving || uploading}
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit" 
                  className="btn-submit"
                  disabled={saving || uploading || !formData.title.trim()}
                >
                  {saving || uploading ? (
                    <>
                      <FaSpinner className="spinner" /> 
                      {uploading ? 'Đang tải ảnh...' : 'Đang lưu...'}
                    </>
                  ) : (
                    <>
                      <FaSave /> {editingItem ? 'Cập nhật' : 'Thêm mới'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerManagement;
