import React, { useState, useEffect } from 'react';
import { 
    FaPlus, 
    FaEdit, 
    FaTrash, 
    FaBox, 
    FaSpinner, 
    FaExclamationTriangle, 
    FaCheckCircle, 
    FaTimesCircle,
    FaInfoCircle,
    FaSync
} from 'react-icons/fa';
import axiosClient from '../../api/axiosClient';
import { useCategory } from '../../contexts/CategoryContext';
import '../../styles/CategoryManagement.css';

const CategoryManagement = () => {
    // Lấy hàm refresh từ Context
    const { refreshCategories } = useCategory();
    
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [debugInfo, setDebugInfo] = useState({
        token: false,
        user: false,
        userRole: null,
        apiStatus: 'pending'
    });
    const [apiError, setApiError] = useState(null);

    useEffect(() => {
        checkAuthStatus();
        fetchCategories();
    }, []);

    const checkAuthStatus = () => {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        let userRole = null;
        
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                userRole = user.role || user.roles?.[0];
            } catch (e) {
                console.error('Error parsing user:', e);
            }
        }
        
        setDebugInfo({
            token: !!token,
            user: !!userStr,
            userRole: userRole,
            apiStatus: 'checking'
        });
    };

    // Dữ liệu mẫu để hiển thị khi API không có dữ liệu
    const getSampleCategories = () => {
        return [
            { id: 1, name: 'Genshin Impact', description: 'Figure từ game Genshin Impact', productCount: 15 },
            { id: 2, name: 'Honkai: Star Rail', description: 'Figure từ game Honkai: Star Rail', productCount: 8 },
            { id: 3, name: 'Gundam', description: 'Mô hình Gundam các series', productCount: 12 },
            { id: 4, name: 'One Piece', description: 'Figure nhân vật One Piece', productCount: 10 },
            { id: 5, name: 'Demon Slayer', description: 'Figure Thanh Gươm Diệt Quỷ', productCount: 7 },
            { id: 6, name: 'Jujutsu Kaisen', description: 'Figure Chú Thuật Hồi Chiến', productCount: 5 },
        ];
    };

    const fetchCategories = async () => {
        setLoading(true);
        setDebugInfo(prev => ({ ...prev, apiStatus: 'loading' }));
        setApiError(null);
        
        try {
            console.log('📡 === FETCH CATEGORIES START ===');
            
            const token = localStorage.getItem('token');
            console.log('🔐 Token status:', token ? `EXISTS` : 'MISSING');
            
            console.log('🔗 Calling: GET /admin/categories');
            
            const response = await axiosClient.get('/admin/categories');
            
            console.log('✅ Fetch successful!');
            const categoryList = response?.data || response;
            
            if (categoryList && Array.isArray(categoryList)) {
                // Có dữ liệu từ API
                setCategories(categoryList);
                console.log('📝 Categories from API:', categoryList);
            } else {
                // Không có dữ liệu, dùng dữ liệu mẫu
                console.log('📝 No data from API, using sample data');
                const sampleData = getSampleCategories();
                setCategories(sampleData);
                setApiError('Không có dữ liệu từ server, đang hiển thị dữ liệu mẫu');
            }
            
            setDebugInfo(prev => ({ ...prev, apiStatus: 'success' }));
            
        } catch (error) {
            console.error('❌ === FETCH CATEGORIES ERROR ===');
            
            if (error.response) {
                const { status } = error.response;
                console.error('📊 Response error status:', status);
                
                if (status === 401) {
                    console.error('🔒 401 Unauthorized');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setDebugInfo(prev => ({ ...prev, token: false, user: false }));
                    alert('🔒 Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 1000);
                } else if (status === 403) {
                    setDebugInfo(prev => ({ ...prev, apiStatus: 'forbidden' }));
                    alert('🚫 Bạn không có quyền truy cập');
                } else {
                    // Lỗi khác, hiển thị dữ liệu mẫu
                    console.log('📝 API error, using sample data');
                    const sampleData = getSampleCategories();
                    setCategories(sampleData);
                    setApiError(`Lỗi API (${status}), đang hiển thị dữ liệu mẫu`);
                    setDebugInfo(prev => ({ ...prev, apiStatus: 'demo_mode' }));
                }
            } else if (error.request) {
                console.error('📡 No response - Network error');
                // Lỗi mạng, hiển thị dữ liệu mẫu
                const sampleData = getSampleCategories();
                setCategories(sampleData);
                setApiError('Không thể kết nối server, đang hiển thị dữ liệu mẫu');
                setDebugInfo(prev => ({ ...prev, apiStatus: 'demo_mode' }));
                alert('🌐 Không thể kết nối đến server. Đang hiển thị dữ liệu mẫu.');
            } else {
                console.error('⚙️ Request setup error:', error.message);
                const sampleData = getSampleCategories();
                setCategories(sampleData);
                setApiError('Lỗi cấu hình, đang hiển thị dữ liệu mẫu');
                setDebugInfo(prev => ({ ...prev, apiStatus: 'demo_mode' }));
            }
            
        } finally {
            setLoading(false);
            console.log('📡 === FETCH CATEGORIES END ===\n');
        }
    };

    const handleAddCategory = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('🔒 Vui lòng đăng nhập để thêm danh mục');
            window.location.href = '/login';
            return;
        }
        
        setEditingCategory(null);
        setFormData({
            name: '',
            description: ''
        });
        setShowModal(true);
    };

    const handleEditCategory = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || ''
        });
        setShowModal(true);
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
            return;
        }

        try {
            console.log(`🗑️ Deleting category ID: ${id}`);
            await axiosClient.delete(`/admin/categories/${id}`);
            
            // Refresh list trong admin
            await fetchCategories();
            
            // Thông báo cho trang chủ cập nhật
            refreshCategories('delete', { id });
            
            alert('✅ Xóa danh mục thành công');
            
        } catch (error) {
            console.error('❌ Delete category error:', error);
            
            if (error.response) {
                const { status, data } = error.response;
                
                if (status === 409) {
                    alert('⚠️ Không thể xóa danh mục đang chứa sản phẩm');
                } else {
                    alert(data?.message || '❌ Xóa danh mục thất bại');
                }
            } else {
                // Nếu API lỗi, vẫn xóa trong UI (demo mode)
                setCategories(categories.filter(cat => cat.id !== id));
                refreshCategories('delete', { id });
                alert('✅ Đã xóa danh mục (chế độ demo)');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name.trim()) {
            alert('⚠️ Vui lòng nhập tên danh mục');
            return;
        }
        
        setSaving(true);
        
        try {
            console.log('📤 === SUBMIT CATEGORY START ===');
            
            const categoryDTO = {
                name: formData.name.trim(),
                description: formData.description.trim() || null,
                productCount: editingCategory?.productCount || 0
            };
            
            let response;
            if (editingCategory) {
                console.log(`🔄 Updating category ID: ${editingCategory.id}`);
                response = await axiosClient.put(
                    `/admin/categories/${editingCategory.id}`, 
                    categoryDTO
                );
            } else {
                console.log('🆕 Creating new category');
                response = await axiosClient.post('/admin/categories', categoryDTO);
            }
            
            console.log('📤 === SUBMIT CATEGORY SUCCESS ===\n');
            
            setShowModal(false);
            
            // Refresh list trong admin
            await fetchCategories();
            
            // Thông báo cho trang chủ cập nhật
            refreshCategories(editingCategory ? 'update' : 'create', editingCategory || response.data);
            
            alert(`✅ ${editingCategory ? 'Cập nhật' : 'Thêm'} danh mục thành công!`);
            
        } catch (error) {
            console.error('❌ === SUBMIT CATEGORY ERROR ===');
            
            if (error.response) {
                const { status, data } = error.response;
                
                if (status === 401) {
                    alert('❌ Phiên đăng nhập hết hạn');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 1000);
                } else if (status === 403) {
                    alert('🚫 Không có quyền ADMIN');
                } else if (status === 409) {
                    alert('⚠️ Tên danh mục đã tồn tại. Vui lòng chọn tên khác.');
                } else {
                    alert(`❌ Lỗi server: ${data?.message || 'Lỗi không xác định'}`);
                }
            } else if (error.request) {
                // Nếu API lỗi, vẫn thêm vào UI (demo mode)
                const newCategory = {
                    id: Date.now(),
                    name: formData.name.trim(),
                    description: formData.description.trim() || '',
                    productCount: 0
                };
                
                if (editingCategory) {
                    setCategories(categories.map(cat => 
                        cat.id === editingCategory.id ? { ...cat, ...newCategory } : cat
                    ));
                } else {
                    setCategories([newCategory, ...categories]);
                }
                
                setShowModal(false);
                refreshCategories(editingCategory ? 'update' : 'create', newCategory);
                alert(`✅ ${editingCategory ? 'Cập nhật' : 'Thêm'} danh mục thành công (chế độ demo)!`);
            } else {
                alert('❌ Lỗi: ' + error.message);
            }
        } finally {
            setSaving(false);
        }
    };

    const handleTestAdminLogin = async () => {
        try {
            const credentials = {
                username: 'admin',
                password: 'admin123'
            };
            
            console.log('🔐 Testing admin login...');
            const response = await axiosClient.post('/auth/login', credentials);
            
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            
            console.log('✅ Admin login successful:', response.user);
            
            checkAuthStatus();
            
            alert(`✅ Đăng nhập ADMIN thành công!\n👤 Email: ${response.user.email}\n🎭 Role: ${response.user.role}`);
            
            fetchCategories();
            
        } catch (error) {
            console.error('❌ Admin login failed:', error);
            
            if (error.response?.status === 401) {
                alert('❌ Sai email hoặc mật khẩu');
            } else {
                alert('❌ Đăng nhập thất bại: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        checkAuthStatus();
        alert('👋 Đã đăng xuất');
        fetchCategories();
    };

    const handleRefresh = () => {
        fetchCategories();
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'success': return <FaCheckCircle className="status-icon success" />;
            case 'loading': return <FaSpinner className="status-icon loading" />;
            case 'error': return <FaTimesCircle className="status-icon error" />;
            default: return <FaInfoCircle className="status-icon" />;
        }
    };

    return (
        <div className="category-management">
            {/* Header */}
            <div className="page-header">
                <div className="header-left">
                    <h1>
                        <FaBox style={{ marginRight: '10px' }} />
                        Quản lý danh mục
                    </h1>
                    <div className="subtitle">
                        Tổng danh mục: <span className="count-badge">{categories.length}</span>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary" onClick={handleRefresh} disabled={loading}>
                        <FaSync /> {loading ? 'Đang tải...' : 'Làm mới'}
                    </button>
                    <button className="btn-primary" onClick={handleAddCategory}>
                        <FaPlus /> Thêm danh mục
                    </button>
                </div>
            </div>

            {/* API Warning Message */}
            {apiError && (
                <div className="api-warning">
                    <FaExclamationTriangle style={{ marginRight: '8px' }} />
                    {apiError}
                </div>
            )}

            {/* Debug Panel */}
            <div className="debug-panel">
                <h4><FaInfoCircle /> Trạng thái hệ thống</h4>
                <div className="status-grid">
                    <div className="status-item">
                        <span className="status-label">Token:</span>
                        <span className={`status-value ${debugInfo.token ? 'success' : 'error'}`}>
                            {debugInfo.token ? '✅ Có' : '❌ Không'}
                        </span>
                    </div>
                    <div className="status-item">
                        <span className="status-label">User:</span>
                        <span className={`status-value ${debugInfo.user ? 'success' : 'error'}`}>
                            {debugInfo.user ? '✅ Có' : '❌ Không'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="loading-state">
                    <FaSpinner className="spinner" />
                    <p>Đang tải danh sách danh mục...</p>
                </div>
            )}

            {/* Categories Table - HIỂN THỊ DANH MỤC DẠNG BẢNG */}
            {!loading && categories.length > 0 && (
                <div className="categories-table-container">
                    <table className="categories-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tên danh mục</th>
                                <th>Mô tả</th>
                                <th>Số lượng sản phẩm</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories.map(category => (
                                <tr key={category.id}>
                                    <td className="id-cell">
                                        <span className="category-id-tag">#{category.id}</span>
                                    </td>
                                    <td className="name-cell">
                                        <div className="category-name-main">{category.name}</div>
                                    </td>
                                    <td className="desc-cell">
                                        <div className="category-description-text">
                                            {category.description || 'Chưa có mô tả'}
                                        </div>
                                    </td>
                                    <td className="count-cell">
                                        <span className={`product-count-badge ${category.productCount > 0 ? 'has-products' : 'empty'}`}>
                                            {category.productCount || 0} sản phẩm
                                        </span>
                                    </td>
                                    <td className="status-cell">
                                        <span className={`status-badge ${category.productCount > 0 ? 'active' : 'inactive'}`}>
                                            {category.productCount > 0 ? 'Đang sử dụng' : 'Chưa sử dụng'}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <div className="category-actions-horizontal">
                                            <button 
                                                className="action-btn edit-btn"
                                                onClick={() => handleEditCategory(category)}
                                                title="Chỉnh sửa"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button 
                                                className="action-btn delete-btn"
                                                onClick={() => handleDeleteCategory(category.id)}
                                                disabled={category.productCount > 0}
                                                title={category.productCount > 0 ? 
                                                    "Không thể xóa danh mục có sản phẩm" : 
                                                    "Xóa danh mục"}
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

            {/* Empty State */}
            {!loading && categories.length === 0 && (
                <div className="empty-state">
                    <FaBox className="empty-icon" />
                    <h3>Chưa có danh mục nào</h3>
                    <p>Bắt đầu bằng cách thêm danh mục đầu tiên</p>
                    <button className="btn-primary" onClick={handleAddCategory}>
                        <FaPlus /> Thêm danh mục đầu tiên
                    </button>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h2>
                                {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
                            </h2>
                            <button 
                                className="close-btn" 
                                onClick={() => setShowModal(false)}
                                disabled={saving}
                            >
                                ×
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>
                                    Tên danh mục *
                                    <span className="required-star">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="Nhập tên danh mục"
                                    required
                                    disabled={saving}
                                    maxLength={100}
                                />
                                <small className="form-hint">Tối đa 100 ký tự</small>
                            </div>
                            
                            <div className="form-group">
                                <label>Mô tả</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    placeholder="Nhập mô tả cho danh mục (không bắt buộc)"
                                    rows="4"
                                    disabled={saving}
                                    maxLength={500}
                                />
                                <small className="form-hint">Tối đa 500 ký tự</small>
                            </div>
                            
                            <div className="form-info">
                                <p><FaInfoCircle /> Tên danh mục là bắt buộc và phải là duy nhất.</p>
                                <p><FaInfoCircle /> Danh mục đã có sản phẩm không thể xóa.</p>
                            </div>
                            
                            <div className="modal-actions">
                                <button 
                                    type="button" 
                                    className="btn-cancel"
                                    onClick={() => setShowModal(false)}
                                    disabled={saving}
                                >
                                    Hủy
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn-submit"
                                    disabled={saving || !formData.name.trim()}
                                >
                                    {saving ? (
                                        <>
                                            <FaSpinner className="spinner" />
                                            Đang lưu...
                                        </>
                                    ) : editingCategory ? (
                                        'Cập nhật danh mục'
                                    ) : (
                                        'Thêm danh mục'
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

export default CategoryManagement;