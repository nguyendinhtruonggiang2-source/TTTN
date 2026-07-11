// src/components/admin/PromotionManagement.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaPlus, FaEdit, FaTrash, FaEye, FaSearch, FaSpinner,
  FaTag, FaFire, FaGift, FaTicketAlt, FaPercent, FaToggleOn, FaToggleOff,
  FaCalendarAlt, FaClock, FaDollarSign, FaBox, FaTimes
} from 'react-icons/fa';
import axiosClient, { getImageUrl } from '../../api/axiosClient';
import '../../styles/PromotionManagement.css';

const PromotionManagement = () => {
  const [promotions, setPromotions] = useState([]);
  const [filteredPromotions, setFilteredPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount: '',
    code: '',
    image: '',
    type: 'sale',
    isFlashSale: false,
    isVoucher: true,
    condition: '',
    products: '',
    startDate: '',
    endDate: '',
    endTime: '',
    isActive: true,
    displayOrder: 0,
    usageLimit: '',
    minOrderAmount: '',
    maxDiscountAmount: ''
  });

  const types = [
    { id: 'all', name: 'Tất cả', icon: <FaTag /> },
    { id: 'sale', name: 'Giảm giá', icon: <FaPercent /> },
    { id: 'freeship', name: 'FreeShip', icon: <FaGift /> },
    { id: 'voucher', name: 'Voucher', icon: <FaTicketAlt /> }
  ];

  useEffect(() => {
    fetchPromotions();
  }, []);

  useEffect(() => {
    filterPromotions();
  }, [searchTerm, selectedType, promotions]);

  const filterPromotions = () => {
    let filtered = [...promotions];
    
    if (searchTerm.trim()) {
      filtered = filtered.filter(promo =>
        promo.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        promo.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        promo.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedType && selectedType !== 'all') {
      filtered = filtered.filter(promo => promo.type === selectedType);
    }
    
    setFilteredPromotions(filtered);
  };

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      console.log('📡 Fetching promotions...');
      const response = await axiosClient.get('/admin/promotions');
      setPromotions(response.data || []);
      setFilteredPromotions(response.data || []);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      if (error.response?.status === 401) {
        alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        window.location.href = '/login';
      } else {
        alert('Lỗi khi tải danh sách khuyến mãi');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Vui lòng chọn file ảnh định dạng JPEG, PNG, GIF hoặc WEBP');
      return;
    }

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    
    setUploadingImage(true);
    try {
      console.log('📡 Uploading promotion image...');
      const response = await axiosClient.post('/upload', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const url = response.data.url || response.data.filePath;
      if (url) {
        setFormData(prev => ({ ...prev, image: url }));
        alert('✅ Tải ảnh lên thành công!');
      } else {
        alert('❌ Không nhận được đường dẫn ảnh từ server');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('❌ Tải ảnh lên thất bại');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddPromotion = () => {
    setEditingPromotion(null);
    setFormData({
      title: '',
      description: '',
      discount: '',
      code: '',
      image: '',
      type: 'sale',
      isFlashSale: false,
      isVoucher: true,
      condition: '',
      products: '',
      startDate: '',
      endDate: '',
      endTime: '',
      isActive: true,
      displayOrder: 0,
      usageLimit: '',
      minOrderAmount: '',
      maxDiscountAmount: ''
    });
    setShowModal(true);
  };

  const handleEditPromotion = (promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      title: promotion.title || '',
      description: promotion.description || '',
      discount: promotion.discount || '',
      code: promotion.code || '',
      image: promotion.image || '',
      type: promotion.type || 'sale',
      isFlashSale: promotion.isFlashSale || false,
      isVoucher: promotion.isVoucher !== undefined ? promotion.isVoucher : true,
      condition: promotion.condition || '',
      products: promotion.products?.join(', ') || '',
      startDate: promotion.startDate?.substring(0, 16) || '',
      endDate: promotion.endDate?.substring(0, 16) || '',
      endTime: promotion.endTime?.substring(0, 16) || '',
      isActive: promotion.isActive !== false,
      displayOrder: promotion.displayOrder || 0,
      usageLimit: promotion.usageLimit || '',
      minOrderAmount: promotion.minOrderAmount || '',
      maxDiscountAmount: promotion.maxDiscountAmount || ''
    });
    setShowModal(true);
  };

  const handleViewDetail = (promotion) => {
    setSelectedPromotion(promotion);
    setShowDetailModal(true);
  };

  const handleDeletePromotion = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa chương trình khuyến mãi này?')) {
      return;
    }

    try {
      console.log(`🗑️ Deleting promotion ID: ${id}`);
      await axiosClient.delete(`/admin/promotions/${id}`);
      await fetchPromotions();
      alert('✅ Xóa khuyến mãi thành công');
    } catch (error) {
      console.error('Error deleting promotion:', error);
      alert(error.response?.data?.message || '❌ Xóa khuyến mãi thất bại');
    }
  };

  const handleToggleStatus = async (promotion) => {
    try {
      await axiosClient.patch(`/admin/promotions/${promotion.id}/toggle-status`);
      await fetchPromotions();
      alert(`✅ Đã ${promotion.isActive ? 'vô hiệu hóa' : 'kích hoạt'} khuyến mãi`);
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('❌ Thao tác thất bại');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('⚠️ Vui lòng nhập tiêu đề');
      return;
    }
    if (!formData.code.trim()) {
      alert('⚠️ Vui lòng nhập mã khuyến mãi');
      return;
    }
    if (!formData.startDate || !formData.endDate) {
      alert('⚠️ Vui lòng chọn thời gian bắt đầu và kết thúc');
      return;
    }
    
    setSaving(true);
    
    try {
      const promotionData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || '',
        discount: parseInt(formData.discount) || 0,
        code: formData.code.trim().toUpperCase(),
        image: formData.image?.trim() || null,
        type: formData.type,
        isFlashSale: formData.isFlashSale,
        isVoucher: formData.isVoucher,
        condition: formData.condition?.trim() || null,
        products: formData.products ? formData.products.split(',').map(p => p.trim()) : [],
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        endTime: formData.endTime ? new Date(formData.endTime).toISOString() : null,
        isActive: formData.isActive,
        displayOrder: parseInt(formData.displayOrder) || 0,
        usageLimit: parseInt(formData.usageLimit) || 0,
        minOrderAmount: parseFloat(formData.minOrderAmount) || 0,
        maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null
      };

      console.log('📤 Sending promotion data:', promotionData);

      if (editingPromotion) {
        await axiosClient.put(`/admin/promotions/${editingPromotion.id}`, promotionData);
        alert('✅ Cập nhật khuyến mãi thành công');
      } else {
        await axiosClient.post('/admin/promotions', promotionData);
        alert('✅ Thêm khuyến mãi thành công');
      }

      setShowModal(false);
      setEditingPromotion(null);
      await fetchPromotions();
      
    } catch (error) {
      console.error('Error saving promotion:', error);
      
      if (error.response) {
        const { status, data } = error.response;
        if (status === 400) {
          alert(`❌ Lỗi dữ liệu: ${data.message || 'Dữ liệu không hợp lệ'}`);
        } else if (status === 401) {
          alert('❌ Phiên đăng nhập hết hạn');
          window.location.href = '/login';
        } else if (status === 403) {
          alert('🚫 Không có quyền thực hiện thao tác này');
        } else if (status === 409) {
          alert('⚠️ Mã khuyến mãi đã tồn tại');
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

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('vi-VN');
    } catch {
      return dateString;
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'flashsale': return <FaFire className="type-icon flash" />;
      case 'freeship': return <FaGift className="type-icon freeship" />;
      case 'voucher': return <FaTicketAlt className="type-icon voucher" />;
      default: return <FaPercent className="type-icon sale" />;
    }
  };

  const getTypeName = (type) => {
    switch(type) {
      case 'flashsale': return 'Flash Sale';
      case 'freeship': return 'FreeShip';
      case 'voucher': return 'Voucher';
      default: return 'Giảm giá';
    }
  };

  return (
    <div className="promotion-management">
      <div className="page-header">
        <div className="header-left">
          <h1>
            <FaTag style={{ marginRight: '10px' }} />
            Quản lý khuyến mãi
          </h1>
          <div className="subtitle">
            Tổng khuyến mãi: <span className="count-badge">{promotions.length}</span>
            <span className="active-count">
              Đang hoạt động: {promotions.filter(p => p.isActive).length}
            </span>
          </div>
        </div>
        <button className="add-btn" onClick={handleAddPromotion}>
          <FaPlus /> Thêm khuyến mãi
        </button>
      </div>

      <div className="filters">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề, mã code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="type-filters">
          {types.map(type => (
            <button
              key={type.id}
              className={`type-filter-btn ${selectedType === type.id ? 'active' : ''}`}
              onClick={() => setSelectedType(type.id)}
            >
              {type.icon} {type.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <FaSpinner className="spinner" />
          <p>Đang tải khuyến mãi...</p>
        </div>
      ) : filteredPromotions.length === 0 ? (
        <div className="no-data">
          <FaTag className="no-data-icon" />
          <p>Không tìm thấy chương trình khuyến mãi nào</p>
          <button className="add-first-btn" onClick={handleAddPromotion}>
            <FaPlus /> Thêm khuyến mãi đầu tiên
          </button>
        </div>
      ) : (
        <div className="promotions-table-container">
          <table className="promotions-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tiêu đề</th>
                <th>Mã</th>
                <th>Loại</th>
                <th>Giảm giá</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredPromotions.map(promo => (
                <tr key={promo.id}>
                  <td>{promo.id}</td>
                  <td className="title-cell">
                    <div className="promo-title">{promo.title}</div>
                    <div className="promo-desc">{promo.description?.substring(0, 50)}...</div>
                  </td>
                  <td>
                    <span className="code-badge">{promo.code}</span>
                  </td>
                  <td>
                    <span className={`type-badge ${promo.type}`}>
                      {getTypeIcon(promo.type)} {getTypeName(promo.type)}
                    </span>
                  </td>
                  <td className="discount-cell">
                    {promo.discount > 0 ? `${promo.discount}%` : '-'}
                  </td>
                  <td className="date-cell">
                    <div>{formatDate(promo.startDate)} - {formatDate(promo.endDate)}</div>
                    {promo.isFlashSale && promo.endTime && (
                      <div className="end-time"><FaClock /> {formatDateTime(promo.endTime)}</div>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${promo.isActive ? 'active' : 'inactive'}`}>
                      {promo.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <div className="actions">
                      <button 
                        className="action-btn view-btn" 
                        onClick={() => handleViewDetail(promo)}
                        title="Xem chi tiết"
                      >
                        <FaEye />
                      </button>
                      <button 
                        className="action-btn edit-btn" 
                        onClick={() => handleEditPromotion(promo)}
                        title="Chỉnh sửa"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className={`action-btn toggle-btn ${promo.isActive ? 'active' : 'inactive'}`}
                        onClick={() => handleToggleStatus(promo)}
                        title={promo.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                      >
                        {promo.isActive ? <FaToggleOn /> : <FaToggleOff />}
                      </button>
                      <button 
                        className="action-btn delete-btn" 
                        onClick={() => handleDeletePromotion(promo.id)}
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

      {/* Modal thêm/sửa khuyến mãi */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <div className="modal-header">
              <h2>{editingPromotion ? 'Chỉnh sửa khuyến mãi' : 'Thêm khuyến mãi mới'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Tiêu đề <span className="required">*</span></label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="VD: Siêu sale tháng 3"
                    required
                    disabled={saving}
                  />
                </div>
                <div className="form-group">
                  <label>Mã code <span className="required">*</span></label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    placeholder="VD: SALE50"
                    required
                    disabled={saving}
                  />
                  <small className="form-hint">Mã duy nhất, viết hoa không dấu</small>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Loại khuyến mãi</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    disabled={saving}
                  >
                    <option value="sale">Giảm giá</option>
                    <option value="freeship">Miễn phí vận chuyển</option>
                    <option value="voucher">Voucher</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Phần trăm giảm (%)</label>
                  <input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData({...formData, discount: e.target.value})}
                    min="0"
                    max="100"
                    placeholder="VD: 30"
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Ngày bắt đầu <span className="required">*</span></label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    required
                    disabled={saving}
                  />
                </div>
                <div className="form-group">
                  <label>Ngày kết thúc <span className="required">*</span></label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    required
                    disabled={saving}
                  />
                </div>
              </div>

              {formData.type === 'flashsale' && (
                <div className="form-group">
                  <label>Thời gian kết thúc Flash Sale</label>
                  <input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    disabled={saving}
                  />
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Điều kiện áp dụng</label>
                  <input
                    type="text"
                    value={formData.condition}
                    onChange={(e) => setFormData({...formData, condition: e.target.value})}
                    placeholder="VD: Áp dụng cho đơn hàng từ 500,000đ"
                    disabled={saving}
                  />
                </div>
                <div className="form-group">
                  <label>Đơn hàng tối thiểu (VNĐ)</label>
                  <input
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({...formData, minOrderAmount: e.target.value})}
                    min="0"
                    step="1000"
                    placeholder="VD: 500000"
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Số lần sử dụng tối đa</label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                    min="0"
                    placeholder="0 = không giới hạn"
                    disabled={saving}
                  />
                </div>
                <div className="form-group">
                  <label>Giảm tối đa (VNĐ)</label>
                  <input
                    type="number"
                    value={formData.maxDiscountAmount}
                    onChange={(e) => setFormData({...formData, maxDiscountAmount: e.target.value})}
                    min="0"
                    step="1000"
                    placeholder="VD: 100000"
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Thứ tự hiển thị</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({...formData, displayOrder: e.target.value})}
                    min="0"
                    placeholder="Số càng nhỏ càng hiển thị đầu"
                    disabled={saving}
                  />
                </div>
                <div className="form-group">
                  <label>Sản phẩm áp dụng</label>
                  <input
                    type="text"
                    value={formData.products}
                    onChange={(e) => setFormData({...formData, products: e.target.value})}
                    placeholder="Genshin Impact, One Piece, Gundam (phân cách bằng dấu phẩy)"
                    disabled={saving}
                  />
                  <small className="form-hint">Để trống nếu áp dụng cho tất cả sản phẩm</small>
                </div>
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  placeholder="Mô tả chi tiết về chương trình khuyến mãi..."
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label>Hình ảnh khuyến mãi</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    placeholder="Đường dẫn ảnh hoặc chọn file tải lên..."
                    disabled={saving || uploadingImage}
                    style={{ flex: 1 }}
                  />
                  <input
                    type="file"
                    id="promo-image-file"
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                    accept="image/*"
                    disabled={saving || uploadingImage}
                  />
                  <button
                    type="button"
                    className="action-btn edit-btn"
                    onClick={() => document.getElementById('promo-image-file').click()}
                    disabled={saving || uploadingImage}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '10px 15px', height: '42px', borderRadius: '8px' }}
                  >
                    {uploadingImage ? <FaSpinner className="spinner" /> : <FaPlus />}
                    Tải ảnh lên
                  </button>
                </div>
                {formData.image && (
                  <div className="image-preview" style={{ marginTop: '10px', position: 'relative', display: 'inline-block' }}>
                    <img src={getImageUrl(formData.image)} alt="Preview" style={{ maxWidth: '200px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, image: ''})}
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '11px',
                        lineHeight: 1
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isFlashSale}
                      onChange={(e) => setFormData({...formData, isFlashSale: e.target.checked})}
                      disabled={saving}
                    />
                    <FaFire /> Flash Sale
                  </label>
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isVoucher}
                      onChange={(e) => setFormData({...formData, isVoucher: e.target.checked})}
                      disabled={saving}
                    />
                    <FaTicketAlt /> Là Voucher
                  </label>
                </div>
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      disabled={saving}
                    />
                    Kích hoạt
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)} disabled={saving}>
                  Hủy
                </button>
                <button type="submit" className="save-btn" disabled={saving}>
                  {saving ? (
                    <>
                      <FaSpinner className="spinner" />
                      Đang lưu...
                    </>
                  ) : editingPromotion ? (
                    'Cập nhật'
                  ) : (
                    'Thêm mới'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal chi tiết khuyến mãi */}
      {showDetailModal && selectedPromotion && (
        <div className="modal-overlay">
          <div className="modal modal-detail">
            <div className="modal-header">
              <h2>Chi tiết khuyến mãi</h2>
              <button className="close-btn" onClick={() => setShowDetailModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <div className="detail-header">
                  <span className="code-badge">{selectedPromotion.code}</span>
                  <span className={`status-badge ${selectedPromotion.isActive ? 'active' : 'inactive'}`}>
                    {selectedPromotion.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
                  </span>
                </div>
                <h3>{selectedPromotion.title}</h3>
                <p className="detail-description">{selectedPromotion.description}</p>
                
                <div className="detail-info">
                  <div className="info-row">
                    <span className="info-label">Loại:</span>
                    <span className="info-value">
                      {getTypeIcon(selectedPromotion.type)} {getTypeName(selectedPromotion.type)}
                    </span>
                  </div>
                  {selectedPromotion.discount > 0 && (
                    <div className="info-row">
                      <span className="info-label">Giảm giá:</span>
                      <span className="info-value">{selectedPromotion.discount}%</span>
                    </div>
                  )}
                  <div className="info-row">
                    <span className="info-label">Thời gian:</span>
                    <span className="info-value">
                      {formatDateTime(selectedPromotion.startDate)} - {formatDateTime(selectedPromotion.endDate)}
                    </span>
                  </div>
                  {selectedPromotion.endTime && (
                    <div className="info-row">
                      <span className="info-label">Kết thúc Flash Sale:</span>
                      <span className="info-value">{formatDateTime(selectedPromotion.endTime)}</span>
                    </div>
                  )}
                  {selectedPromotion.condition && (
                    <div className="info-row">
                      <span className="info-label">Điều kiện:</span>
                      <span className="info-value">{selectedPromotion.condition}</span>
                    </div>
                  )}
                  {selectedPromotion.minOrderAmount > 0 && (
                    <div className="info-row">
                      <span className="info-label">Đơn hàng tối thiểu:</span>
                      <span className="info-value">
                        {selectedPromotion.minOrderAmount.toLocaleString()}đ
                      </span>
                    </div>
                  )}
                  {selectedPromotion.maxDiscountAmount > 0 && (
                    <div className="info-row">
                      <span className="info-label">Giảm tối đa:</span>
                      <span className="info-value">
                        {selectedPromotion.maxDiscountAmount.toLocaleString()}đ
                      </span>
                    </div>
                  )}
                  {selectedPromotion.usageLimit > 0 && (
                    <div className="info-row">
                      <span className="info-label">Lượt sử dụng:</span>
                      <span className="info-value">
                        {selectedPromotion.usedCount || 0} / {selectedPromotion.usageLimit}
                      </span>
                    </div>
                  )}
                  {selectedPromotion.products?.length > 0 && (
                    <div className="info-row">
                      <span className="info-label">Sản phẩm áp dụng:</span>
                      <span className="info-value">
                        {selectedPromotion.products.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                type="button" 
                className="edit-btn-modal" 
                onClick={() => {
                  setShowDetailModal(false);
                  handleEditPromotion(selectedPromotion);
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

export default PromotionManagement;