// src/components/admin/BranchManagement.jsx
import React, { useState, useEffect } from 'react';
import { 
    FaPlus, 
    FaEdit, 
    FaTrash, 
    FaStore, 
    FaSpinner, 
    FaMapMarkerAlt,
    FaPhone,
    FaEnvelope,
    FaUser,
    FaClock,
    FaToggleOn,
    FaToggleOff,
    FaSearch,
    FaEye,
    FaTimes
} from 'react-icons/fa';
import axiosClient from '../../api/axiosClient';
import '../../styles/BranchManagement.css';

const BranchManagement = () => {
    const [branches, setBranches] = useState([]);
    const [filteredBranches, setFilteredBranches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [editingBranch, setEditingBranch] = useState(null);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        address: '',
        phone: '',
        email: '',
        manager: '',
        openingHours: '',
        latitude: '',
        longitude: '',
        isActive: true,
        displayOrder: 0,
        description: '',
        imageUrl: ''
    });

    useEffect(() => {
        fetchBranches();
    }, []);

    useEffect(() => {
        filterBranches();
    }, [searchTerm, branches]);

    const filterBranches = () => {
        if (!searchTerm.trim()) {
            setFilteredBranches(branches);
        } else {
            const filtered = branches.filter(branch =>
                branch.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                branch.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                branch.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                branch.manager?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredBranches(filtered);
        }
    };

    const fetchBranches = async () => {
        setLoading(true);
        try {
            console.log('📡 Fetching branches...');
            const response = await axiosClient.get('/admin/branches');
            setBranches(response.data || []);
            setFilteredBranches(response.data || []);
        } catch (error) {
            console.error('Error fetching branches:', error);
            if (error.response?.status === 401) {
                alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
                window.location.href = '/login';
            } else {
                alert('Lỗi khi tải danh sách chi nhánh');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAddBranch = () => {
        setEditingBranch(null);
        setFormData({
            code: '',
            name: '',
            address: '',
            phone: '',
            email: '',
            manager: '',
            openingHours: '',
            latitude: '',
            longitude: '',
            isActive: true,
            displayOrder: 0,
            description: '',
            imageUrl: ''
        });
        setShowModal(true);
    };

    const handleEditBranch = (branch) => {
        setEditingBranch(branch);
        setFormData({
            code: branch.code || '',
            name: branch.name || '',
            address: branch.address || '',
            phone: branch.phone || '',
            email: branch.email || '',
            manager: branch.manager || '',
            openingHours: branch.openingHours || '',
            latitude: branch.latitude || '',
            longitude: branch.longitude || '',
            isActive: branch.isActive !== false,
            displayOrder: branch.displayOrder || 0,
            description: branch.description || '',
            imageUrl: branch.imageUrl || ''
        });
        setShowModal(true);
    };

    const handleViewDetail = (branch) => {
        setSelectedBranch(branch);
        setShowDetailModal(true);
    };

    const handleDeleteBranch = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa chi nhánh này?')) {
            return;
        }

        try {
            console.log(`🗑️ Deleting branch ID: ${id}`);
            await axiosClient.delete(`/admin/branches/${id}`);
            await fetchBranches();
            alert('✅ Xóa chi nhánh thành công');
        } catch (error) {
            console.error('Error deleting branch:', error);
            alert(error.response?.data?.message || '❌ Xóa chi nhánh thất bại');
        }
    };

    const handleToggleStatus = async (branch) => {
        try {
            console.log(`🔄 Toggling branch status: ${branch.id}`);
            await axiosClient.patch(`/admin/branches/${branch.id}/toggle-status`);
            await fetchBranches();
            alert(`✅ Đã ${branch.isActive ? 'vô hiệu hóa' : 'kích hoạt'} chi nhánh thành công`);
        } catch (error) {
            console.error('Error toggling branch status:', error);
            alert('❌ Thao tác thất bại');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.code.trim()) {
            alert('⚠️ Vui lòng nhập mã chi nhánh');
            return;
        }
        if (!formData.name.trim()) {
            alert('⚠️ Vui lòng nhập tên chi nhánh');
            return;
        }
        if (!formData.address.trim()) {
            alert('⚠️ Vui lòng nhập địa chỉ');
            return;
        }
        
        setSaving(true);
        
        try {
            const branchData = {
                code: formData.code.trim().toUpperCase(),
                name: formData.name.trim(),
                address: formData.address.trim(),
                phone: formData.phone?.trim() || null,
                email: formData.email?.trim() || null,
                manager: formData.manager?.trim() || null,
                openingHours: formData.openingHours?.trim() || null,
                latitude: formData.latitude?.trim() || null,
                longitude: formData.longitude?.trim() || null,
                isActive: formData.isActive,
                displayOrder: parseInt(formData.displayOrder) || 0,
                description: formData.description?.trim() || null,
                imageUrl: formData.imageUrl?.trim() || null
            };

            console.log('📤 Sending branch data:', branchData);

            if (editingBranch) {
                console.log(`🔄 Updating branch ID: ${editingBranch.id}`);
                await axiosClient.put(`/admin/branches/${editingBranch.id}`, branchData);
                alert('✅ Cập nhật chi nhánh thành công');
            } else {
                console.log('🆕 Creating new branch');
                await axiosClient.post('/admin/branches', branchData);
                alert('✅ Thêm chi nhánh thành công');
            }

            setShowModal(false);
            setEditingBranch(null);
            await fetchBranches();
            
        } catch (error) {
            console.error('Error saving branch:', error);
            
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
                    alert('⚠️ Mã chi nhánh đã tồn tại');
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

    const formatDateTime = (dateTimeString) => {
        if (!dateTimeString) return 'N/A';
        try {
            const date = new Date(dateTimeString);
            return date.toLocaleString('vi-VN');
        } catch {
            return dateTimeString;
        }
    };

    return (
        <div className="branch-management">
            {/* Header */}
            <div className="page-header">
                <div className="header-left">
                    <h1>
                        <FaStore style={{ marginRight: '10px' }} />
                        Quản lý chi nhánh
                    </h1>
                    <div className="subtitle">
                        Tổng chi nhánh: <span className="count-badge">{branches.length}</span>
                        <span className="active-count">
                            Đang hoạt động: {branches.filter(b => b.isActive).length}
                        </span>
                    </div>
                </div>
                <button className="add-btn" onClick={handleAddBranch}>
                    <FaPlus /> Thêm chi nhánh
                </button>
            </div>

            {/* Search Filter */}
            <div className="filters">
                <div className="search-box">
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo mã, tên, địa chỉ, quản lý..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="loading">
                    <FaSpinner className="spinner" />
                    <p>Đang tải danh sách chi nhánh...</p>
                </div>
            )}

            {/* Empty State */}
            {!loading && filteredBranches.length === 0 && (
                <div className="no-data">
                    <FaStore className="no-data-icon" />
                    <p>Không tìm thấy chi nhánh nào</p>
                    <button className="add-first-btn" onClick={handleAddBranch}>
                        <FaPlus /> Thêm chi nhánh đầu tiên
                    </button>
                </div>
            )}

            {/* Branches Table */}
            {!loading && filteredBranches.length > 0 && (
                <div className="branches-table-container">
                    <table className="branches-table">
                        <thead>
                            <tr>
                                <th>Mã</th>
                                <th>Tên chi nhánh</th>
                                <th>Thông tin liên hệ</th>
                                <th>Quản lý / Giờ mở cửa</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBranches.map(branch => (
                                <tr key={branch.id} className={!branch.isActive ? 'inactive-row' : ''}>
                                    <td className="code-cell">
                                        <span className="branch-code-tag">{branch.code}</span>
                                    </td>
                                    <td className="name-cell">
                                        <div className="branch-name-title">{branch.name}</div>
                                        <div className="branch-address-text"><FaMapMarkerAlt /> {branch.address}</div>
                                        {branch.description && <div className="branch-desc-text">{branch.description}</div>}
                                    </td>
                                    <td className="contact-cell">
                                        {branch.phone && <div className="branch-phone-text"><FaPhone /> {branch.phone}</div>}
                                        {branch.email && <div className="branch-email-text"><FaEnvelope /> {branch.email}</div>}
                                    </td>
                                    <td className="manager-cell">
                                        {branch.manager && <div className="branch-manager-text"><FaUser /> {branch.manager}</div>}
                                        {branch.openingHours && <div className="branch-hours-text"><FaClock /> {branch.openingHours}</div>}
                                    </td>
                                    <td className="status-cell">
                                        <span className={`status-badge ${branch.isActive ? 'active' : 'inactive'}`}>
                                            {branch.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <div className="branch-actions-horizontal">
                                            <button 
                                                className="action-btn view-btn"
                                                onClick={() => handleViewDetail(branch)}
                                                title="Xem chi tiết"
                                            >
                                                <FaEye />
                                            </button>
                                            <button 
                                                className="action-btn edit-btn"
                                                onClick={() => handleEditBranch(branch)}
                                                title="Chỉnh sửa"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button 
                                                className="action-btn toggle-btn"
                                                onClick={() => handleToggleStatus(branch)}
                                                title={branch.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                                            >
                                                {branch.isActive ? <FaToggleOn /> : <FaToggleOff />}
                                            </button>
                                            <button 
                                                className="action-btn delete-btn"
                                                onClick={() => handleDeleteBranch(branch.id)}
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

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal modal-large">
                        <div className="modal-header">
                            <h2>{editingBranch ? 'Chỉnh sửa chi nhánh' : 'Thêm chi nhánh mới'}</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Mã chi nhánh <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                                        placeholder="VD: HN001, HCM001..."
                                        required
                                        disabled={saving}
                                    />
                                    <small className="form-hint">Mã duy nhất, viết hoa không dấu</small>
                                </div>
                                <div className="form-group">
                                    <label>Tên chi nhánh <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        placeholder="VD: Chi nhánh Hà Nội"
                                        required
                                        disabled={saving}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Địa chỉ <span className="required">*</span></label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                                    placeholder="Số nhà, đường, phường, quận, thành phố"
                                    required
                                    disabled={saving}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Số điện thoại</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        placeholder="VD: 02412345678"
                                        disabled={saving}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        placeholder="branch@figurestore.com"
                                        disabled={saving}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Quản lý chi nhánh</label>
                                    <input
                                        type="text"
                                        value={formData.manager}
                                        onChange={(e) => setFormData({...formData, manager: e.target.value})}
                                        placeholder="Họ tên quản lý"
                                        disabled={saving}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Giờ mở cửa</label>
                                    <input
                                        type="text"
                                        value={formData.openingHours}
                                        onChange={(e) => setFormData({...formData, openingHours: e.target.value})}
                                        placeholder="VD: 8:00 - 21:00, Thứ 2 - Chủ nhật"
                                        disabled={saving}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Latitude (Tọa độ)</label>
                                    <input
                                        type="text"
                                        value={formData.latitude}
                                        onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                                        placeholder="VD: 21.028511"
                                        disabled={saving}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Longitude (Kinh độ)</label>
                                    <input
                                        type="text"
                                        value={formData.longitude}
                                        onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                                        placeholder="VD: 105.804817"
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
                                    <label>Trạng thái</label>
                                    <select
                                        value={formData.isActive}
                                        onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
                                        disabled={saving}
                                    >
                                        <option value="true">Hoạt động</option>
                                        <option value="false">Vô hiệu hóa</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>URL Hình ảnh</label>
                                <input
                                    type="text"
                                    value={formData.imageUrl}
                                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                                    placeholder="https://example.com/branch-image.jpg"
                                    disabled={saving}
                                />
                                {formData.imageUrl && (
                                    <div className="image-preview">
                                        <img src={formData.imageUrl} alt="Branch preview" />
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Mô tả chi nhánh</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    rows="3"
                                    placeholder="Thông tin thêm về chi nhánh..."
                                    disabled={saving}
                                />
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
                                    ) : editingBranch ? (
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

            {/* Detail Modal */}
            {showDetailModal && selectedBranch && (
                <div className="modal-overlay">
                    <div className="modal modal-detail">
                        <div className="modal-header">
                            <h2>Chi tiết chi nhánh</h2>
                            <button className="close-btn" onClick={() => setShowDetailModal(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-section">
                                <div className="detail-header">
                                    <span className="code-badge large">{selectedBranch.code}</span>
                                    <span className={`status-badge ${selectedBranch.isActive ? 'active' : 'inactive'}`}>
                                        {selectedBranch.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
                                    </span>
                                </div>
                                <h3>{selectedBranch.name}</h3>
                                <div className="detail-info">
                                    <div className="info-row">
                                        <span className="info-label">Địa chỉ:</span>
                                        <span className="info-value">{selectedBranch.address}</span>
                                    </div>
                                    {selectedBranch.phone && (
                                        <div className="info-row">
                                            <span className="info-label">Điện thoại:</span>
                                            <span className="info-value">{selectedBranch.phone}</span>
                                        </div>
                                    )}
                                    {selectedBranch.email && (
                                        <div className="info-row">
                                            <span className="info-label">Email:</span>
                                            <span className="info-value">{selectedBranch.email}</span>
                                        </div>
                                    )}
                                    {selectedBranch.manager && (
                                        <div className="info-row">
                                            <span className="info-label">Quản lý:</span>
                                            <span className="info-value">{selectedBranch.manager}</span>
                                        </div>
                                    )}
                                    {selectedBranch.openingHours && (
                                        <div className="info-row">
                                            <span className="info-label">Giờ mở cửa:</span>
                                            <span className="info-value">{selectedBranch.openingHours}</span>
                                        </div>
                                    )}
                                    {selectedBranch.latitude && selectedBranch.longitude && (
                                        <div className="info-row">
                                            <span className="info-label">Tọa độ:</span>
                                            <span className="info-value">
                                                {selectedBranch.latitude}, {selectedBranch.longitude}
                                            </span>
                                        </div>
                                    )}
                                    {selectedBranch.description && (
                                        <div className="info-row">
                                            <span className="info-label">Mô tả:</span>
                                            <span className="info-value">{selectedBranch.description}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="detail-footer">
                                    <small>🆔 ID: {selectedBranch.id}</small>
                                    <small>📅 Tạo: {formatDateTime(selectedBranch.createdAt)}</small>
                                    <small>✏️ Cập nhật: {formatDateTime(selectedBranch.updatedAt)}</small>
                                </div>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button 
                                type="button" 
                                className="edit-btn-modal" 
                                onClick={() => {
                                    setShowDetailModal(false);
                                    handleEditBranch(selectedBranch);
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

export default BranchManagement;