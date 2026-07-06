import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FaTachometerAlt, FaBox, FaTags, FaUsers, FaShoppingBag, 
  FaSignOutAlt, FaStore, FaBuilding, FaNewspaper, FaTag,
  FaFire, FaGift, FaHeart, FaExchangeAlt, FaQuestionCircle
} from 'react-icons/fa';
import '../../styles/AdminSidebar.css';

const AdminSidebar = () => {
    const navigate = useNavigate();

    const menuItems = [
        { path: '/admin', label: 'Dashboard', icon: <FaTachometerAlt /> },
        { path: '/admin/products', label: 'Sản phẩm', icon: <FaBox /> },
        { path: '/admin/categories', label: 'Danh mục', icon: <FaTags /> },
        { path: '/admin/branches', label: 'Chi nhánh', icon: <FaBuilding /> },
        { path: '/admin/posts', label: 'Bài viết', icon: <FaNewspaper /> },
        { path: '/admin/promotions', label: 'Khuyến mãi', icon: <FaTag /> },
        { path: '/admin/flash-sale', label: 'Flash Sale', icon: <FaFire /> }, // 👈 THÊM MỚI
        { path: '/admin/users', label: 'Người dùng', icon: <FaUsers /> },
        { path: '/admin/orders', label: 'Đơn hàng', icon: <FaShoppingBag /> },
    ];

    const handleBackToShop = () => {
        navigate('/');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="admin-sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <FaStore />
                    <h2>Figure Store</h2>
                </div>
                <p className="sidebar-subtitle">Admin Panel</p>
            </div>
            
            <nav className="sidebar-menu">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `sidebar-item ${isActive ? 'active' : ''}`
                        }
                    >
                        <span className="sidebar-icon">{item.icon}</span>
                        <span className="sidebar-label">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button className="sidebar-btn" onClick={handleBackToShop}>
                    <span className="sidebar-icon">🏠</span>
                    <span className="sidebar-label">Về cửa hàng</span>
                </button>
                <button className="sidebar-btn logout-btn" onClick={handleLogout}>
                    <FaSignOutAlt className="sidebar-icon" />
                    <span className="sidebar-label">Đăng xuất</span>
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;