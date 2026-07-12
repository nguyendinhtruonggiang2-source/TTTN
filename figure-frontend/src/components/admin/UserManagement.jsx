import React, { useState, useEffect } from 'react';
import { FaSearch, FaToggleOn, FaToggleOff, FaCrown, FaUser, FaEdit, FaTrash } from 'react-icons/fa';
import axiosClient from '../../api/axiosClient';
import '../../styles/UserManagement.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedRoles, setSelectedRoles] = useState([]);

    const [showUserModal, setShowUserModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [userFormData, setUserFormData] = useState({
        username: '',
        email: '',
        password: '',
        name: '',
        phone: '',
        address: '',
        roles: ['ROLE_USER']
    });

    const handleOpenCreateModal = () => {
        setModalMode('create');
        setUserFormData({
            username: '',
            email: '',
            password: '',
            name: '',
            phone: '',
            address: '',
            roles: ['ROLE_USER']
        });
        setShowUserModal(true);
    };

    const handleOpenEditModal = (user) => {
        setModalMode('edit');
        setUserFormData({
            id: user.id,
            username: user.username || '',
            email: user.email || '',
            password: '', // Để trống khi sửa
            name: user.name || '',
            phone: user.phone || '',
            address: user.address || '',
            roles: user.roles ? [...user.roles] : ['ROLE_USER']
        });
        setShowUserModal(true);
    };

    const handleFormInputChange = (e) => {
        const { name, value } = e.target;
        setUserFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmitUser = async (e) => {
        e.preventDefault();
        
        if (userFormData.roles.length === 0) {
            alert('Vui lòng chọn ít nhất một vai trò!');
            return;
        }

        try {
            if (modalMode === 'create') {
                await axiosClient.post('/admin/users', userFormData);
                alert('Tạo người dùng thành công!');
            } else {
                await axiosClient.put(`/admin/users/${userFormData.id}`, userFormData);
                alert('Cập nhật người dùng thành công!');
            }
            setShowUserModal(false);
            fetchUsers();
        } catch (error) {
            console.error('Error submitting user:', error);
            alert(error.response?.data?.message || 'Thao tác thất bại!');
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.get('/admin/users');
            setUsers(response.data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredUsers = users.filter(user => {
        const searchLower = searchTerm.toLowerCase();
        return (
            user.username?.toLowerCase().includes(searchLower) ||
            user.email?.toLowerCase().includes(searchLower) ||
            user.name?.toLowerCase().includes(searchLower)
        );
    });

    const handleToggleStatus = async (user) => {
        if (!window.confirm(`Bạn có chắc muốn ${user.enabled ? 'vô hiệu hóa' : 'kích hoạt'} người dùng này?`)) {
            return;
        }

        try {
            await axiosClient.put(`/admin/users/${user.id}/toggle-status`);
            fetchUsers();
            alert(`Đã ${user.enabled ? 'vô hiệu hóa' : 'kích hoạt'} người dùng thành công`);
        } catch (error) {
            console.error('Error toggling user status:', error);
            alert('Thao tác thất bại');
        }
    };

    const handleOpenRoleModal = (user) => {
        setSelectedUser(user);
        setSelectedRoles([...user.roles]);
        setShowRoleModal(true);
    };

    const handleUpdateRoles = async () => {
        try {
            await axiosClient.put(`/admin/users/${selectedUser.id}/roles`, selectedRoles);
            setShowRoleModal(false);
            fetchUsers();
            alert('Cập nhật quyền thành công');
        } catch (error) {
            console.error('Error updating roles:', error);
            alert('Cập nhật quyền thất bại');
        }
    };

    const handleDeleteUser = async (user) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
            return;
        }

        if (user.username === 'admin') {
            alert('Không thể xóa tài khoản admin chính');
            return;
        }

        try {
            await axiosClient.delete(`/admin/users/${user.id}`);
            fetchUsers();
            alert('Xóa người dùng thành công');
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Xóa người dùng thất bại');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN');
    };

    const getRoleBadge = (role) => {
        switch(role) {
            case 'ROLE_ADMIN':
                return <span className="role-badge admin"><FaCrown /> Admin</span>;
            case 'ROLE_USER':
                return <span className="role-badge user"><FaUser /> User</span>;
            default:
                return <span className="role-badge">{role}</span>;
        }
    };

    return (
        <div className="user-management">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 style={{ margin: 0 }}>Quản lý người dùng</h1>
                <button 
                    className="add-user-btn" 
                    onClick={handleOpenCreateModal}
                    style={{
                        backgroundColor: '#ff4d4f',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '10px 18px',
                        fontWeight: '600',
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 2px 6px rgba(255, 77, 79, 0.2)'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#ff7875'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#ff4d4f'}
                >
                    + Thêm người dùng mới
                </button>
            </div>

            <div className="filters">
                <div className="search-box">
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Tìm kiếm người dùng..."
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>
            </div>

            {loading ? (
                <div className="loading">Đang tải...</div>
            ) : filteredUsers.length === 0 ? (
                <div className="no-data">
                    <p>Không tìm thấy người dùng nào</p>
                </div>
            ) : (
                <div className="users-table-container">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>Tài khoản</th>
                                <th>Email</th>
                                <th>Tên</th>
                                <th>Quyền</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id}>
                                    <td className="username-cell">
                                        <div className="user-avatar">
                                            {user.username?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="user-details">
                                            <div className="username">{user.username}</div>
                                            {user.username === 'admin' && (
                                                <div className="admin-tag">Chính</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="email-cell">{user.email}</td>
                                    <td className="name-cell">{user.name || 'Chưa cập nhật'}</td>
                                    <td className="roles-cell">
                                        <div className="roles-list">
                                            {user.roles?.includes('ROLE_ADMIN') ? (
                                                getRoleBadge('ROLE_ADMIN')
                                            ) : (
                                                getRoleBadge('ROLE_USER')
                                            )}
                                        </div>
                                        <button 
                                            className="edit-roles-btn"
                                            onClick={() => handleOpenRoleModal(user)}
                                        >
                                            <FaEdit />
                                        </button>
                                    </td>
                                    <td className="status-cell">
                                        <div className="status-container">
                                            <span className={`status-badge ${user.enabled ? 'active' : 'inactive'}`}>
                                                {user.enabled ? 'Hoạt động' : 'Vô hiệu hóa'}
                                            </span>
                                            <button 
                                                className="toggle-btn"
                                                onClick={() => handleToggleStatus(user)}
                                                title={user.enabled ? 'Vô hiệu hóa' : 'Kích hoạt'}
                                            >
                                                {user.enabled ? <FaToggleOn /> : <FaToggleOff />}
                                            </button>
                                        </div>
                                    </td>
                                    <td className="actions-cell">
                                        <div className="actions">
                                            <button 
                                                className="action-btn edit-btn"
                                                onClick={() => handleOpenEditModal(user)}
                                                title="Sửa thông tin"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button 
                                                className="action-btn delete-btn"
                                                onClick={() => handleDeleteUser(user)}
                                                disabled={user.username === 'admin'}
                                                title={user.username === 'admin' ? 'Không thể xóa admin' : 'Xóa người dùng'}
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

            {/* Modal chỉnh sửa quyền */}
            {showRoleModal && selectedUser && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h2>Chỉnh sửa quyền người dùng</h2>
                            <button className="close-btn" onClick={() => setShowRoleModal(false)}>
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="user-info-modal">
                                <div className="user-avatar large">
                                    {selectedUser.username?.charAt(0).toUpperCase()}
                                </div>
                                <div className="user-details-modal">
                                    <h3>{selectedUser.username}</h3>
                                    <p>{selectedUser.email}</p>
                                </div>
                            </div>
                            <div className="roles-selection">
                                <h4>Phân quyền:</h4>
                                <div className="role-options">
                                    <label className="role-option">
                                        <input
                                            type="radio"
                                            name="roleSelect"
                                            checked={selectedRoles.includes('ROLE_ADMIN')}
                                            onChange={() => setSelectedRoles(['ROLE_ADMIN'])}
                                        />
                                        <span className="role-badge admin"><FaCrown /> Quản trị viên</span>
                                    </label>
                                    <label className="role-option">
                                        <input
                                            type="radio"
                                            name="roleSelect"
                                            checked={selectedRoles.includes('ROLE_USER') && !selectedRoles.includes('ROLE_ADMIN')}
                                            onChange={() => setSelectedRoles(['ROLE_USER'])}
                                        />
                                        <span className="role-badge user"><FaUser /> Người dùng</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button 
                                type="button" 
                                className="cancel-btn" 
                                onClick={() => setShowRoleModal(false)}
                            >
                                Hủy
                            </button>
                            <button 
                                type="button" 
                                className="save-btn" 
                                onClick={handleUpdateRoles}
                            >
                                Cập nhật quyền
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal thêm/sửa người dùng */}
            {showUserModal && (
                <div className="modal-overlay">
                    <div className="modal" style={{ maxWidth: '500px' }}>
                        <div className="modal-header">
                            <h2>{modalMode === 'create' ? 'Thêm người dùng mới' : 'Chỉnh sửa thông tin'}</h2>
                            <button className="close-btn" onClick={() => setShowUserModal(false)}>
                                ×
                            </button>
                        </div>
                        <form onSubmit={handleSubmitUser}>
                            <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div className="form-group-modal" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    <label style={{ fontWeight: '600', fontSize: '14px', color: '#475569', textAlign: 'left' }}>Tên đăng nhập *</label>
                                    <input
                                        type="text"
                                        name="username"
                                        required
                                        disabled={modalMode === 'edit' && userFormData.username === 'admin'}
                                        value={userFormData.username}
                                        onChange={handleFormInputChange}
                                        style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                                    />
                                </div>
                                <div className="form-group-modal" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    <label style={{ fontWeight: '600', fontSize: '14px', color: '#475569', textAlign: 'left' }}>Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={userFormData.email}
                                        onChange={handleFormInputChange}
                                        style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                                    />
                                </div>
                                <div className="form-group-modal" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    <label style={{ fontWeight: '600', fontSize: '14px', color: '#475569', textAlign: 'left' }}>Mật khẩu {modalMode === 'create' ? '*' : '(Để trống nếu không đổi)'}</label>
                                    <input
                                        type="password"
                                        name="password"
                                        required={modalMode === 'create'}
                                        value={userFormData.password}
                                        placeholder={modalMode === 'create' ? "Nhập mật khẩu" : "Nhập mật khẩu mới"}
                                        onChange={handleFormInputChange}
                                        style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                                    />
                                </div>
                                <div className="form-group-modal" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    <label style={{ fontWeight: '600', fontSize: '14px', color: '#475569', textAlign: 'left' }}>Họ và tên</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={userFormData.name}
                                        onChange={handleFormInputChange}
                                        style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                                    />
                                </div>
                                <div className="form-group-modal" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    <label style={{ fontWeight: '600', fontSize: '14px', color: '#475569', textAlign: 'left' }}>Số điện thoại</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={userFormData.phone}
                                        onChange={handleFormInputChange}
                                        style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                                    />
                                </div>
                                <div className="form-group-modal" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    <label style={{ fontWeight: '600', fontSize: '14px', color: '#475569', textAlign: 'left' }}>Địa chỉ</label>
                                    <textarea
                                        name="address"
                                        value={userFormData.address}
                                        onChange={handleFormInputChange}
                                        rows="2"
                                        style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', fontFamily: 'inherit' }}
                                    />
                                </div>
                                <div className="form-group-modal" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    <label style={{ fontWeight: '600', fontSize: '14px', color: '#475569', textAlign: 'left' }}>Vai trò (Quyền)</label>
                                    <div style={{ display: 'flex', gap: '20px', marginTop: '5px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer' }}>
                                            <input
                                                type="radio"
                                                name="userRoles"
                                                checked={userFormData.roles.includes('ROLE_USER') && !userFormData.roles.includes('ROLE_ADMIN')}
                                                onChange={() => setUserFormData(prev => ({ ...prev, roles: ['ROLE_USER'] }))}
                                            />
                                            USER
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', cursor: 'pointer' }}>
                                            <input
                                                type="radio"
                                                name="userRoles"
                                                checked={userFormData.roles.includes('ROLE_ADMIN')}
                                                onChange={() => setUserFormData(prev => ({ ...prev, roles: ['ROLE_ADMIN'] }))}
                                            />
                                            ADMIN
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-actions" style={{ borderTop: '1px solid #e2e8f0', padding: '15px 20px' }}>
                                <button 
                                    type="button" 
                                    className="cancel-btn" 
                                    onClick={() => setShowUserModal(false)}
                                >
                                    Hủy
                                </button>
                                <button 
                                    type="submit" 
                                    className="save-btn"
                                >
                                    Lưu thay đổi
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;