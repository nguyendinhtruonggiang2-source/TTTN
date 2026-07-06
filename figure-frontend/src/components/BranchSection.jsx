// src/components/BranchSection.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaStore, FaMapMarkerAlt, FaPhone, FaArrowRight } from 'react-icons/fa';
import axiosClient from '../api/axiosClient';
import '../styles/BranchSection.css';

const BranchSection = () => {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        try {
            const response = await axiosClient.get('/branches/active');
            // Chỉ lấy tối đa 3 chi nhánh để hiển thị trên trang chủ
            setBranches(response.data?.slice(0, 3) || []);
        } catch (error) {
            console.error('Error fetching branches:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="branch-section">
                <div className="branch-section-header">
                    <h2>🏪 Hệ thống chi nhánh</h2>
                    <p>Đang tải...</p>
                </div>
            </div>
        );
    }

    if (branches.length === 0) {
        return null;
    }

    return (
        <div className="branch-section">
            <div className="branch-section-header">
                <div className="header-text">
                    <h2>🏪 Hệ thống chi nhánh</h2>
                    <p>Đến ngay chi nhánh gần bạn nhất để trải nghiệm sản phẩm</p>
                </div>
                <Link to="/branches" className="view-all-link">
                    Xem tất cả <FaArrowRight />
                </Link>
            </div>

            <div className="branch-grid">
                {branches.map((branch) => (
                    <div key={branch.id} className="branch-preview-card">
                        <div className="branch-preview-icon">
                            <FaStore />
                        </div>
                        <div className="branch-preview-info">
                            <h3>{branch.name}</h3>
                            <p className="branch-address">
                                <FaMapMarkerAlt /> {branch.address}
                            </p>
                            {branch.phone && (
                                <p className="branch-phone">
                                    <FaPhone /> {branch.phone}
                                </p>
                            )}
                            <Link to={`/branches/${branch.id}`} className="branch-detail-link">
                                Xem chi tiết
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BranchSection;