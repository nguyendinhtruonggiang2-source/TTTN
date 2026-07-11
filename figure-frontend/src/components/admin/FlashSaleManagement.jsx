// src/components/admin/FlashSaleManagement.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaSpinner,
  FaFire, FaClock, FaDollarSign, FaPercent, FaBox, FaCalendar
} from 'react-icons/fa';
import axiosClient, { getImageUrl } from '../../api/axiosClient';
import '../../styles/FlashSaleManagement.css';

const FlashSaleManagement = () => {
  const [flashSales, setFlashSales] = useState([]);
  const [figures, setFigures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    figureId: '',
    figureName: '',
    salePrice: '',
    discountPercent: '',
    quantityLimit: '',
    startTime: '',
    endTime: ''
  });

  useEffect(() => {
    fetchFlashSales();
    fetchFigures();
  }, []);

  const fetchFlashSales = async () => {
    try {
      const response = await axiosClient.get('/admin/flash-sale');
      setFlashSales(response.data || []);
    } catch (error) {
      console.error('Error fetching flash sales:', error);
      alert('Không thể tải danh sách flash sale');
    } finally {
      setLoading(false);
    }
  };

  const fetchFigures = async () => {
    try {
      const response = await axiosClient.get('/figures');
      setFigures(response.data || []);
    } catch (error) {
      console.error('Error fetching figures:', error);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      figureId: '',
      figureName: '',
      salePrice: '',
      discountPercent: '',
      quantityLimit: '',
      startTime: '',
      endTime: ''
    });
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      figureId: item.figure.id,
      figureName: item.figure.name,
      salePrice: item.salePrice,
      discountPercent: item.discountPercent,
      quantityLimit: item.quantityLimit,
      startTime: item.startTime.slice(0, 16),
      endTime: item.endTime.slice(0, 16)
    });
    setShowModal(true);
  };

  const handleDelete = async (id, figureName) => {
    if (!window.confirm(`Bạn có chắc muốn xóa flash sale của "${figureName}"?`)) {
      return;
    }
    
    try {
      await axiosClient.delete(`/admin/flash-sale/${id}`);
      alert('✅ Xóa thành công');
      fetchFlashSales();
    } catch (error) {
      console.error('Error deleting flash sale:', error);
      alert('❌ Xóa thất bại');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.figureId || !formData.salePrice || !formData.discountPercent || 
        !formData.quantityLimit || !formData.startTime || !formData.endTime) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }
    
    setSaving(true);
    
    try {
      const data = {
        figureId: parseInt(formData.figureId),
        salePrice: parseFloat(formData.salePrice),
        discountPercent: parseInt(formData.discountPercent),
        quantityLimit: parseInt(formData.quantityLimit),
        startTime: formData.startTime,
        endTime: formData.endTime
      };
      
      if (editingItem) {
        await axiosClient.put(`/admin/flash-sale/${editingItem.id}`, data);
        alert('✅ Cập nhật thành công');
      } else {
        await axiosClient.post('/admin/flash-sale', data);
        alert('✅ Thêm thành công');
      }
      
      setShowModal(false);
      fetchFlashSales();
    } catch (error) {
      console.error('Error saving flash sale:', error);
      alert(error.response?.data?.error || '❌ Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleFigureSelect = (figureId) => {
    const selectedFigure = figures.find(f => f.id === parseInt(figureId));
    if (selectedFigure) {
      setFormData(prev => ({
        ...prev,
        figureId: figureId,
        figureName: selectedFigure.name,
        salePrice: selectedFigure.price * 0.7,
        discountPercent: 30
      }));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('vi-VN');
    } catch {
      return dateString;
    }
  };

  const getStatus = (startTime, endTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (now < start) return { text: 'Sắp diễn ra', class: 'status-upcoming' };
    if (now > end) return { text: 'Đã kết thúc', class: 'status-ended' };
    return { text: 'Đang diễn ra', class: 'status-active' };
  };

  const filteredFlashSales = flashSales.filter(item =>
    item.figure.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.figure.series?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flash-sale-management">
        <div className="loading">
          <FaSpinner className="spinner" />
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flash-sale-management">
      <div className="page-header">
        <h1>
          <FaFire /> Quản lý Flash Sale
        </h1>
        <button className="add-btn" onClick={handleAdd}>
          <FaPlus /> Thêm flash sale
        </button>
      </div>

      <div className="filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên sản phẩm, series..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flash-sale-table-container">
        <table className="flash-sale-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Sản phẩm</th>
              <th>Giá gốc</th>
              <th>Giá sale</th>
              <th>Giảm giá</th>
              <th>Số lượng</th>
              <th>Đã bán</th>
              <th>Thời gian</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredFlashSales.map(item => {
              const status = getStatus(item.startTime, item.endTime);
              return (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>
                    <div className="product-cell">
                      <img className="product-img" src={getImageUrl(item.figure.image)} alt={item.figure.name} />
                      <div>
                        <div className="product-name">{item.figure.name}</div>
                        <div className="product-series">{item.figure.series}</div>
                      </div>
                    </div>
                  </td>
                  <td>{item.figure.originalPrice?.toLocaleString()}₫</td>
                  <td className="sale-price">{item.salePrice.toLocaleString()}₫</td>
                  <td className="discount">-{item.discountPercent}%</td>
                  <td>{item.quantityLimit}</td>
                  <td>{item.soldQuantity}</td>
                  <td>
                    <div className="time-info">
                      <div>📅 {formatDate(item.startTime)}</div>
                      <div>➡ {formatDate(item.endTime)}</div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${status.class}`}>
                      {status.text}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button className="edit-btn" onClick={() => handleEdit(item)}>
                        <FaEdit />
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(item.id, item.figure.name)}>
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal thêm/sửa */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingItem ? 'Chỉnh sửa flash sale' : 'Thêm flash sale mới'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Sản phẩm</label>
                <select
                  value={formData.figureId}
                  onChange={(e) => handleFigureSelect(e.target.value)}
                  required
                  disabled={!!editingItem}
                >
                  <option value="">Chọn sản phẩm</option>
                  {figures.map(figure => (
                    <option key={figure.id} value={figure.id}>
                      {figure.name} - {figure.series || 'No series'}
                    </option>
                  ))}
                </select>
              </div>

              {formData.figureName && (
                <div className="selected-product">
                  <strong>Sản phẩm đã chọn:</strong> {formData.figureName}
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label><FaDollarSign /> Giá sale</label>
                  <input
                    type="number"
                    value={formData.salePrice}
                    onChange={(e) => setFormData({...formData, salePrice: e.target.value})}
                    required
                    min="0"
                    step="1000"
                  />
                </div>
                <div className="form-group">
                  <label><FaPercent /> Phần trăm giảm</label>
                  <input
                    type="number"
                    value={formData.discountPercent}
                    onChange={(e) => setFormData({...formData, discountPercent: e.target.value})}
                    required
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="form-group">
                <label><FaBox /> Số lượng giới hạn</label>
                <input
                  type="number"
                  value={formData.quantityLimit}
                  onChange={(e) => setFormData({...formData, quantityLimit: e.target.value})}
                  required
                  min="1"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label><FaCalendar /> Bắt đầu</label>
                  <input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label><FaCalendar /> Kết thúc</label>
                  <input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                  Hủy
                </button>
                <button type="submit" className="save-btn" disabled={saving}>
                  {saving ? <FaSpinner className="spinner" /> : <FaSave />}
                  {saving ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashSaleManagement;