// src/pages/BranchList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaStore, FaMapMarkerAlt, FaPhone, FaEnvelope, FaUser, FaClock, FaSpinner, FaSearch, FaTimes, FaExternalLinkAlt } from 'react-icons/fa';
import axiosClient from '../api/axiosClient';
import '../styles/BranchList.css';

const BranchList = () => {
    const [branches, setBranches] = useState([]);
    const [filteredBranches, setFilteredBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [mapCenter, setMapCenter] = useState({ lat: 21.028511, lng: 105.804817 }); // Mặc định Hà Nội

    useEffect(() => {
        fetchBranches();
    }, []);

    useEffect(() => {
        filterBranches();
    }, [searchTerm, selectedCity, branches]);

    useEffect(() => {
        if (filteredBranches.length > 0) {
            // Tìm chi nhánh có tọa độ để làm trung tâm bản đồ
            const branchWithCoords = filteredBranches.find(b => b.latitude && b.longitude);
            if (branchWithCoords) {
                setMapCenter({
                    lat: parseFloat(branchWithCoords.latitude),
                    lng: parseFloat(branchWithCoords.longitude)
                });
            }
        }
    }, [filteredBranches]);

    const fetchBranches = async () => {
        try {
            setLoading(true);
            console.log('📡 Fetching active branches...');
            const response = await axiosClient.get('/branches/active');
            setBranches(response.data || []);
            setFilteredBranches(response.data || []);
            setError(null);
        } catch (error) {
            console.error('Error fetching branches:', error);
            setError('Không thể tải danh sách chi nhánh. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const filterBranches = () => {
        let filtered = [...branches];
        
        if (searchTerm.trim()) {
            filtered = filtered.filter(branch =>
                branch.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                branch.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                branch.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                branch.manager?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        if (selectedCity) {
            filtered = filtered.filter(branch =>
                branch.address?.toLowerCase().includes(selectedCity.toLowerCase())
            );
        }
        
        setFilteredBranches(filtered);
    };

    const formatPhone = (phone) => {
        if (!phone) return 'Chưa cập nhật';
        return phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
    };

    const getUniqueCities = () => {
        const cities = branches.map(branch => {
            const address = branch.address || '';
            const parts = address.split(',');
            return parts[parts.length - 1]?.trim() || '';
        }).filter(city => city);
        return [...new Set(cities)];
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCity('');
    };

    // Tạo URL Google Maps Embed với nhiều điểm đánh dấu
    const getMapEmbedUrl = () => {
        const branchesWithCoords = filteredBranches.filter(b => b.latitude && b.longitude);
        if (branchesWithCoords.length === 0) return null;
        
        // Tạo URL với nhiều điểm
        const markers = branchesWithCoords.map(b => 
            `${b.latitude},${b.longitude}`
        ).join('&markers=');
        
        return `https://www.google.com/maps/embed/v1/view?key=YOUR_API_KEY&center=${mapCenter.lat},${mapCenter.lng}&zoom=12`;
    };

    // Tạo URL Google Maps với tất cả chi nhánh
    const getDirectionsUrl = () => {
        const branchesWithCoords = filteredBranches.filter(b => b.latitude && b.longitude);
        if (branchesWithCoords.length === 0) return '#';
        
        const destinations = branchesWithCoords.map(b => 
            `${b.latitude},${b.longitude}`
        ).join('|');
        
        return `https://www.google.com/maps/dir//${destinations}`;
    };

    if (loading) {
        return (
            <div className="branch-list-container">
                <div className="loading-spinner">
                    <FaSpinner className="spinner" />
                    <p>Đang tải danh sách chi nhánh...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="branch-list-container">
                <div className="error-message">
                    <h3>⚠️ {error}</h3>
                    <button onClick={fetchBranches} className="retry-btn">Thử lại</button>
                </div>
            </div>
        );
    }

    return (
        <div className="branch-list-container">
            <div className="branch-header">
                <h1>🏪 Hệ thống chi nhánh</h1>
                <p>Chúng tôi có mặt tại các địa điểm sau</p>
            </div>

            {/* Search and Filter Section */}
            <div className="filter-section">
                <div className="search-box">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên, mã, địa chỉ, quản lý..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button className="clear-btn" onClick={() => setSearchTerm('')}>
                            <FaTimes />
                        </button>
                    )}
                </div>
                
                <select 
                    className="city-filter"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                >
                    <option value="">Tất cả thành phố</option>
                    {getUniqueCities().map(city => (
                        <option key={city} value={city}>{city}</option>
                    ))}
                </select>
                
                {(searchTerm || selectedCity) && (
                    <button className="clear-filters-btn" onClick={clearFilters}>
                        Xóa bộ lọc
                    </button>
                )}
            </div>

            {/* Result Count */}
            <div className="result-count">
                Tìm thấy <strong>{filteredBranches.length}</strong> chi nhánh
            </div>

            {/* Map Section - HIỂN THỊ BẢN ĐỒ TRỰC TIẾP */}
            <div className="map-section">
                <h2>📍 Bản đồ chi nhánh</h2>
                <div className="map-container">
                    {filteredBranches.filter(b => b.latitude && b.longitude).length > 0 ? (
                        <>
                            {/* Static Map Image from Google Maps Static API */}
                            <div className="static-map">
                                <img 
                                    src={`https://maps.googleapis.com/maps/api/staticmap?center=${mapCenter.lat},${mapCenter.lng}&zoom=12&size=800x400&markers=${filteredBranches.filter(b => b.latitude && b.longitude).map(b => `color:red|label:${b.code}|${b.latitude},${b.longitude}`).join('&markers=')}&key=YOUR_API_KEY`}
                                    alt="Bản đồ chi nhánh"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'block';
                                    }}
                                />
                                <div className="static-map-fallback" style={{ display: 'none' }}>
                                    <div className="branch-locations-map">
                                        <h4>Các chi nhánh trên bản đồ:</h4>
                                        {filteredBranches.filter(b => b.latitude && b.longitude).map(branch => (
                                            <div key={branch.id} className="map-branch-item">
                                                <FaMapMarkerAlt className="map-marker-icon" />
                                                <div>
                                                    <strong>{branch.name}</strong>
                                                    <a 
                                                        href={`https://www.google.com/maps?q=${branch.latitude},${branch.longitude}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        Xem trên Google Maps <FaExternalLinkAlt />
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="map-actions">
                                <a 
                                    href={getDirectionsUrl()}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="map-action-btn"
                                >
                                    <FaExternalLinkAlt /> Xem tất cả trên Google Maps
                                </a>
                            </div>
                        </>
                    ) : (
                        <div className="map-placeholder">
                            <FaMapMarkerAlt className="map-placeholder-icon" />
                            <p>Đang cập nhật vị trí các chi nhánh trên bản đồ</p>
                        </div>
                    )}
                </div>
            </div>

            {filteredBranches.length === 0 ? (
                <div className="empty-state">
                    <FaStore className="empty-icon" />
                    <h3>Không tìm thấy chi nhánh</h3>
                    <p>Không có chi nhánh nào phù hợp với tìm kiếm của bạn.</p>
                    <button onClick={clearFilters} className="clear-filters-btn">Xóa bộ lọc</button>
                </div>
            ) : (
                <div className="branches-container">
                    {filteredBranches.map((branch, index) => (
                        <Link 
                            to={`/branches/${branch.id}`}
                            key={branch.id} 
                            className="branch-card"
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            <div className="branch-card-header">
                                <div className="branch-icon">
                                    <FaStore />
                                </div>
                                <div className="branch-title">
                                    <h3>{branch.name}</h3>
                                    <span className="branch-code">{branch.code}</span>
                                </div>
                            </div>

                            <div className="branch-card-body">
                                <div className="branch-info-item">
                                    <FaMapMarkerAlt className="info-icon" />
                                    <div className="info-content">
                                        <strong>Địa chỉ:</strong>
                                        <p>{branch.address}</p>
                                    </div>
                                </div>

                                {branch.phone && (
                                    <div className="branch-info-item">
                                        <FaPhone className="info-icon" />
                                        <div className="info-content">
                                            <strong>Điện thoại:</strong>
                                            <a href={`tel:${branch.phone}`} onClick={(e) => e.stopPropagation()}>
                                                {formatPhone(branch.phone)}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {branch.email && (
                                    <div className="branch-info-item">
                                        <FaEnvelope className="info-icon" />
                                        <div className="info-content">
                                            <strong>Email:</strong>
                                            <a href={`mailto:${branch.email}`} onClick={(e) => e.stopPropagation()}>
                                                {branch.email}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {branch.manager && (
                                    <div className="branch-info-item">
                                        <FaUser className="info-icon" />
                                        <div className="info-content">
                                            <strong>Quản lý:</strong>
                                            <p>{branch.manager}</p>
                                        </div>
                                    </div>
                                )}

                                {branch.openingHours && (
                                    <div className="branch-info-item">
                                        <FaClock className="info-icon" />
                                        <div className="info-content">
                                            <strong>Giờ mở cửa:</strong>
                                            <p>{branch.openingHours}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {branch.description && (
                                <div className="branch-card-footer">
                                    <p>{branch.description}</p>
                                </div>
                            )}

                            <div className="branch-card-actions">
                                <span className="view-detail-link">Xem chi tiết →</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BranchList;