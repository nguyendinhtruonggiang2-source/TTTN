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
            <div className="page-header">
                <h1>Quản lý người dùng</h1>
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
                                            {user.roles?.map((role, index) => (
                                                <React.Fragment key={index}>
                                                    {getRoleBadge(role)}
                                                </React.Fragment>
                                            ))}
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
                                            type="checkbox"
                                            checked={selectedRoles.includes('ROLE_USER')}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedRoles([...selectedRoles, 'ROLE_USER']);
                                                } else {
                                                    setSelectedRoles(selectedRoles.filter(r => r !== 'ROLE_USER'));
                                                }
                                            }}
                                        />
                                        <span className="role-badge user"><FaUser /> Người dùng</span>
                                    </label>
                                    <label className="role-option">
                                        <input
                                            type="checkbox"
                                            checked={selectedRoles.includes('ROLE_ADMIN')}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedRoles([...selectedRoles, 'ROLE_ADMIN']);
                                                } else {
                                                    setSelectedRoles(selectedRoles.filter(r => r !== 'ROLE_ADMIN'));
                                                }
                                            }}
                                        />
                                        <span className="role-badge admin"><FaCrown /> Quản trị viên</span>
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
        </div>
    );
};

export default UserManagement;