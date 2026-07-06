// src/pages/BranchDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaStore, FaMapMarkerAlt, FaPhone, FaEnvelope, FaUser, FaClock, FaArrowLeft, FaSpinner, FaExternalLinkAlt } from 'react-icons/fa';
import axiosClient from '../api/axiosClient';
import '../styles/BranchDetail.css';

const BranchDetail = () => {
    const { id } = useParams();
    const [branch, setBranch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchBranchDetail();
    }, [id]);

    const fetchBranchDetail = async () => {
        try {
            setLoading(true);
            const response = await axiosClient.get(`/branches/${id}`);
            setBranch(response.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching branch detail:', error);
            setError('Không thể tải thông tin chi nhánh');
        } finally {
            setLoading(false);
        }
    };

    const formatPhone = (phone) => {
        if (!phone) return 'Chưa cập nhật';
        return phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
    };

    // Hàm tạo URL Google Maps
    const getGoogleMapsUrl = () => {
        if (branch?.latitude && branch?.longitude) {
            return `https://www.google.com/maps?q=${branch.latitude},${branch.longitude}`;
        }
        if (branch?.address) {
            return `https://www.google.com/maps?q=${encodeURIComponent(branch.address)}`;
        }
        return '#';
    };

    // Hàm tạo iframe Google Maps embed
    const getMapEmbedUrl = () => {
        if (branch?.latitude && branch?.longitude) {
            return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1000!2d${branch.longitude}!3d${branch.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${branch.latitude},${branch.longitude}!5e0!3m2!1svi!2s!4v1`;
        }
        return null;
    };

    if (loading) {
        return (
            <div className="branch-detail-container">
                <div className="loading-spinner">
                    <FaSpinner className="spinner" />
                    <p>Đang tải thông tin chi nhánh...</p>
                </div>
            </div>
        );
    }

    if (error || !branch) {
        return (
            <div className="branch-detail-container">
                <div className="error-message">
                    <h3>⚠️ {error || 'Không tìm thấy chi nhánh'}</h3>
                    <Link to="/branches" className="back-link">Quay lại danh sách</Link>
                </div>
            </div>
        );
    }

    const mapEmbedUrl = getMapEmbedUrl();
    const hasCoordinates = branch.latitude && branch.longitude;

    return (
        <div className="branch-detail-container">
            <Link to="/branches" className="back-button">
                <FaArrowLeft /> Quay lại danh sách
            </Link>

            <div className="branch-detail-card">
                <div className="branch-detail-header">
                    <div className="branch-detail-icon">
                        <FaStore />
                    </div>
                    <div className="branch-detail-title">
                        <h1>{branch.name}</h1>
                        <span className="branch-code-badge">{branch.code}</span>
                    </div>
                </div>

                <div className="branch-detail-body">
                    <div className="detail-section">
                        <h3>📍 Thông tin liên hệ</h3>
                        <div className="detail-info-row">
                            <FaMapMarkerAlt className="detail-icon" />
                            <div>
                                <strong>Địa chỉ:</strong>
                                <p>{branch.address}</p>
                            </div>
                        </div>

                        {branch.phone && (
                            <div className="detail-info-row">
                                <FaPhone className="detail-icon" />
                                <div>
                                    <strong>Điện thoại:</strong>
                                    <a href={`tel:${branch.phone}`}>{formatPhone(branch.phone)}</a>
                                </div>
                            </div>
                        )}

                        {branch.email && (
                            <div className="detail-info-row">
                                <FaEnvelope className="detail-icon" />
                                <div>
                                    <strong>Email:</strong>
                                    <a href={`mailto:${branch.email}`}>{branch.email}</a>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="detail-section">
                        <h3>👨‍💼 Thông tin quản lý</h3>
                        {branch.manager && (
                            <div className="detail-info-row">
                                <FaUser className="detail-icon" />
                                <div>
                                    <strong>Quản lý chi nhánh:</strong>
                                    <p>{branch.manager}</p>
                                </div>
                            </div>
                        )}

                        {branch.openingHours && (
                            <div className="detail-info-row">
                                <FaClock className="detail-icon" />
                                <div>
                                    <strong>Giờ mở cửa:</strong>
                                    <p>{branch.openingHours}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {branch.description && (
                        <div className="detail-section">
                            <h3>📝 Mô tả</h3>
                            <p className="branch-description">{branch.description}</p>
                        </div>
                    )}

                    {/* Phần bản đồ - HIỂN THỊ TRỰC TIẾP */}
                    <div className="detail-section map-section">
                        <h3>🗺️ Bản đồ chỉ đường</h3>
                        
                        {hasCoordinates ? (
                            <>
                                {/* Embedded Google Maps */}
                                <div className="map-container">
                                    <iframe
                                        title={`Bản đồ ${branch.name}`}
                                        src={mapEmbedUrl}
                                        width="100%"
                                        height="400"
                                        style={{ border: 0 }}
                                        allowFullScreen
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                    />
                                </div>
                                
                                {/* Nút mở trong Google Maps */}
                                <div className="map-actions">
                                    <a 
                                        href={getGoogleMapsUrl()}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="open-map-btn"
                                    >
                                        <FaExternalLinkAlt /> Mở trong Google Maps
                                    </a>
                                </div>
                            </>
                        ) : branch.address ? (
                            <>
                                {/* Fallback khi không có tọa độ - hiển thị link đến Google Maps với địa chỉ */}
                                <div className="map-placeholder">
                                    <FaMapMarkerAlt className="map-placeholder-icon" />
                                    <p>Chưa có tọa độ chính xác</p>
                                    <a 
                                        href={getGoogleMapsUrl()}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="open-map-btn"
                                    >
                                        <FaExternalLinkAlt /> Xem chỉ đường trên Google Maps
                                    </a>
                                </div>
                            </>
                        ) : (
                            <div className="map-placeholder">
                                <FaMapMarkerAlt className="map-placeholder-icon" />
                                <p>Chưa có thông tin bản đồ</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BranchDetail;