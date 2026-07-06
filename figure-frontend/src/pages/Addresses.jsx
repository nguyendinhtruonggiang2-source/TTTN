import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaPlus, FaEdit, FaTrash, FaMapMarkerAlt, FaPhone, 
  FaUser, FaHome, FaBuilding, FaTimes,
  FaSpinner, FaStar, FaRegStar
} from 'react-icons/fa';
import axiosClient from '../api/axiosClient';
import '../styles/Addresses.css';

// Dữ liệu tỉnh/thành phố Việt Nam
const provinces = [
  { id: 1, name: 'Hà Nội' },
  { id: 2, name: 'Hồ Chí Minh' },
  { id: 3, name: 'Đà Nẵng' },
  { id: 4, name: 'Hải Phòng' },
  { id: 5, name: 'Cần Thơ' },
  { id: 6, name: 'An Giang' },
  { id: 7, name: 'Bà Rịa - Vũng Tàu' },
  { id: 8, name: 'Bắc Giang' },
  { id: 9, name: 'Bắc Kạn' },
  { id: 10, name: 'Bạc Liêu' },
  { id: 11, name: 'Bắc Ninh' },
  { id: 12, name: 'Bến Tre' },
  { id: 13, name: 'Bình Định' },
  { id: 14, name: 'Bình Dương' },
  { id: 15, name: 'Bình Phước' },
  { id: 16, name: 'Bình Thuận' },
  { id: 17, name: 'Cà Mau' },
  { id: 18, name: 'Cao Bằng' },
  { id: 19, name: 'Đắk Lắk' },
  { id: 20, name: 'Đắk Nông' },
  { id: 21, name: 'Điện Biên' },
  { id: 22, name: 'Đồng Nai' },
  { id: 23, name: 'Đồng Tháp' },
  { id: 24, name: 'Gia Lai' },
  { id: 25, name: 'Hà Giang' },
  { id: 26, name: 'Hà Nam' },
  { id: 27, name: 'Hà Tĩnh' },
  { id: 28, name: 'Hải Dương' },
  { id: 29, name: 'Hậu Giang' },
  { id: 30, name: 'Hòa Bình' },
  { id: 31, name: 'Hưng Yên' },
  { id: 32, name: 'Khánh Hòa' },
  { id: 33, name: 'Kiên Giang' },
  { id: 34, name: 'Kon Tum' },
  { id: 35, name: 'Lai Châu' },
  { id: 36, name: 'Lâm Đồng' },
  { id: 37, name: 'Lạng Sơn' },
  { id: 38, name: 'Lào Cai' },
  { id: 39, name: 'Long An' },
  { id: 40, name: 'Nam Định' },
  { id: 41, name: 'Nghệ An' },
  { id: 42, name: 'Ninh Bình' },
  { id: 43, name: 'Ninh Thuận' },
  { id: 44, name: 'Phú Thọ' },
  { id: 45, name: 'Phú Yên' },
  { id: 46, name: 'Quảng Bình' },
  { id: 47, name: 'Quảng Nam' },
  { id: 48, name: 'Quảng Ngãi' },
  { id: 49, name: 'Quảng Ninh' },
  { id: 50, name: 'Quảng Trị' },
  { id: 51, name: 'Sóc Trăng' },
  { id: 52, name: 'Sơn La' },
  { id: 53, name: 'Tây Ninh' },
  { id: 54, name: 'Thái Bình' },
  { id: 55, name: 'Thái Nguyên' },
  { id: 56, name: 'Thanh Hóa' },
  { id: 57, name: 'Thừa Thiên Huế' },
  { id: 58, name: 'Tiền Giang' },
  { id: 59, name: 'Trà Vinh' },
  { id: 60, name: 'Tuyên Quang' },
  { id: 61, name: 'Vĩnh Long' },
  { id: 62, name: 'Vĩnh Phúc' },
  { id: 63, name: 'Yên Bái' }
];

// Dữ liệu quận/huyện theo tỉnh
const districts = {
  'Hà Nội': [
    'Ba Đình', 'Hoàn Kiếm', 'Hai Bà Trưng', 'Đống Đa', 'Tây Hồ',
    'Cầu Giấy', 'Thanh Xuân', 'Hoàng Mai', 'Long Biên', 'Bắc Từ Liêm',
    'Nam Từ Liêm', 'Hà Đông', 'Sơn Tây', 'Ba Vì', 'Chương Mỹ',
    'Đan Phượng', 'Đông Anh', 'Gia Lâm', 'Hoài Đức', 'Mê Linh',
    'Mỹ Đức', 'Phú Xuyên', 'Phúc Thọ', 'Quốc Oai', 'Sóc Sơn',
    'Thạch Thất', 'Thanh Oai', 'Thanh Trì', 'Thường Tín', 'Ứng Hòa'
  ],
  'Hồ Chí Minh': [
    'Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6',
    'Quận 7', 'Quận 8', 'Quận 9', 'Quận 10', 'Quận 11', 'Quận 12',
    'Bình Tân', 'Bình Thạnh', 'Gò Vấp', 'Phú Nhuận', 'Tân Bình',
    'Tân Phú', 'Thủ Đức', 'Cần Giờ', 'Củ Chi', 'Hóc Môn', 'Nhà Bè',
    'Bình Chánh'
  ],
  'Đà Nẵng': [
    'Hải Châu', 'Thanh Khê', 'Sơn Trà', 'Ngũ Hành Sơn', 'Liên Chiểu',
    'Cẩm Lệ', 'Hòa Vang', 'Hoàng Sa'
  ],
  'Hải Phòng': [
    'Hồng Bàng', 'Ngô Quyền', 'Lê Chân', 'Hải An', 'Kiến An',
    'Đồ Sơn', 'Dương Kinh', 'Thủy Nguyên', 'An Dương', 'An Lão',
    'Kiến Thụy', 'Tiên Lãng', 'Vĩnh Bảo', 'Cát Hải', 'Bạch Long Vĩ'
  ],
  'Cần Thơ': [
    'Ninh Kiều', 'Bình Thủy', 'Cái Răng', 'Ô Môn', 'Thốt Nốt',
    'Vĩnh Thạnh', 'Cờ Đỏ', 'Phong Điền', 'Thới Lai'
  ]
};

// Dữ liệu phường/xã theo quận/huyện
const wards = {
  'Ba Đình': ['Phúc Xá', 'Trúc Bạch', 'Vĩnh Phúc', 'Cống Vị', 'Liễu Giai', 'Nguyễn Trung Trực', 'Quán Thánh', 'Thành Công'],
  'Hoàn Kiếm': ['Hàng Bạc', 'Hàng Buồm', 'Hàng Gai', 'Hàng Trống', 'Lý Thái Tổ', 'Hàng Đào', 'Hàng Mã', 'Đồng Xuân'],
  'Hai Bà Trưng': ['Nguyễn Du', 'Bùi Thị Xuân', 'Ngô Thì Nhậm', 'Thanh Nhàn', 'Trương Định', 'Phạm Đình Hổ', 'Đống Mác'],
  'Quận 1': ['Bến Nghé', 'Bến Thành', 'Cầu Kho', 'Cầu Ông Lãnh', 'Cô Giang', 'Đa Kao', 'Nguyễn Cư Trinh', 'Nguyễn Thái Bình', 'Phạm Ngũ Lão', 'Tân Định'],
  'Quận 3': ['Võ Thị Sáu', 'Nguyễn Thượng Hiền', 'Phường 5', 'Phường 6', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12'],
  'Hải Châu': ['Hải Châu 1', 'Hải Châu 2', 'Hòa Thuận Tây', 'Hòa Thuận Đông', 'Nam Dương', 'Bình Hiên', 'Bình Thuận', 'Thạch Thang', 'Thanh Bình', 'Thuận Phước'],
  'Ninh Kiều': ['An Bình', 'An Hòa', 'An Khánh', 'An Nghiệp', 'An Phú', 'Cái Khế', 'Hưng Lợi', 'Tân An', 'Thới Bình', 'Xuân Khánh']
};

const Addresses = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [saving, setSaving] = useState(false);
  const [searchProvince, setSearchProvince] = useState('');
  const [searchDistrict, setSearchDistrict] = useState('');
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  const [showWardDropdown, setShowWardDropdown] = useState(false);
  const [filteredProvinces, setFilteredProvinces] = useState([]);
  const [filteredDistricts, setFilteredDistricts] = useState([]);
  const [filteredWards, setFilteredWards] = useState([]);
  
  const provinceRef = useRef(null);
  const districtRef = useRef(null);
  const wardRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    ward: '',
    district: '',
    city: '',
    isDefault: false,
    addressType: 'home'
  });

  // Click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (provinceRef.current && !provinceRef.current.contains(event.target)) {
        setShowProvinceDropdown(false);
      }
      if (districtRef.current && !districtRef.current.contains(event.target)) {
        setShowDistrictDropdown(false);
      }
      if (wardRef.current && !wardRef.current.contains(event.target)) {
        setShowWardDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, []);

  useEffect(() => {
    if (searchProvince) {
      const filtered = provinces.filter(p => 
        p.name.toLowerCase().includes(searchProvince.toLowerCase())
      );
      setFilteredProvinces(filtered);
    } else {
      setFilteredProvinces(provinces);
    }
  }, [searchProvince]);

  useEffect(() => {
    if (formData.city && searchDistrict) {
      const cityDistricts = districts[formData.city] || [];
      const filtered = cityDistricts.filter(d => 
        d.toLowerCase().includes(searchDistrict.toLowerCase())
      );
      setFilteredDistricts(filtered);
    } else if (formData.city) {
      setFilteredDistricts(districts[formData.city] || []);
    } else {
      setFilteredDistricts([]);
    }
  }, [formData.city, searchDistrict]);

  useEffect(() => {
    if (formData.district && searchDistrict) {
      const districtWards = wards[formData.district] || [];
      const filtered = districtWards.filter(w => 
        w.toLowerCase().includes(searchDistrict.toLowerCase())
      );
      setFilteredWards(filtered);
    } else if (formData.district) {
      setFilteredWards(wards[formData.district] || []);
    } else {
      setFilteredWards([]);
    }
  }, [formData.district, searchDistrict]);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      const response = await axiosClient.get('/user/addresses');
      setAddresses(response.data || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        alert('Không thể tải danh sách địa chỉ. Vui lòng thử lại sau.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setFormData({
      fullName: '',
      phone: '',
      address: '',
      ward: '',
      district: '',
      city: '',
      isDefault: addresses.length === 0,
      addressType: 'home'
    });
    setSearchProvince('');
    setSearchDistrict('');
    setShowProvinceDropdown(false);
    setShowDistrictDropdown(false);
    setShowWardDropdown(false);
    setShowModal(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setFormData({
      fullName: address.fullName || '',
      phone: address.phone || '',
      address: address.address || '',
      ward: address.ward || '',
      district: address.district || '',
      city: address.city || '',
      isDefault: address.isDefault || false,
      addressType: address.addressType || 'home'
    });
    setSearchProvince(address.city || '');
    setSearchDistrict(address.district || '');
    setShowModal(true);
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
      return;
    }

    try {
      await axiosClient.delete(`/user/addresses/${id}`);
      await fetchAddresses();
      alert('✅ Xóa địa chỉ thành công');
    } catch (error) {
      console.error('Error deleting address:', error);
      alert(error.response?.data?.message || '❌ Xóa địa chỉ thất bại');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await axiosClient.patch(`/user/addresses/${id}/default`);
      await fetchAddresses();
      alert('✅ Đã đặt làm địa chỉ mặc định');
    } catch (error) {
      console.error('Error setting default address:', error);
      alert('❌ Đặt địa chỉ mặc định thất bại');
    }
  };

  const selectProvince = (province) => {
    setFormData({...formData, city: province.name, district: '', ward: ''});
    setSearchProvince(province.name);
    setShowProvinceDropdown(false);
    setSearchDistrict('');
  };

  const selectDistrict = (district) => {
    setFormData({...formData, district: district, ward: ''});
    setSearchDistrict(district);
    setShowDistrictDropdown(false);
  };

  const selectWard = (ward) => {
    setFormData({...formData, ward: ward});
    setSearchDistrict(ward);
    setShowWardDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fullName.trim()) {
      alert('⚠️ Vui lòng nhập họ tên');
      return;
    }
    if (!formData.phone.trim()) {
      alert('⚠️ Vui lòng nhập số điện thoại');
      return;
    }
    if (!formData.address.trim()) {
      alert('⚠️ Vui lòng nhập địa chỉ');
      return;
    }
    if (!formData.city) {
      alert('⚠️ Vui lòng chọn tỉnh/thành phố');
      return;
    }
    
    setSaving(true);
    
    try {
      // Đảm bảo dữ liệu đúng format
      const addressData = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        ward: formData.ward || null,
        district: formData.district || null,
        city: formData.city,
        isDefault: formData.isDefault,
        addressType: formData.addressType
      };

      console.log('📤 Sending address data:', addressData);

      if (editingAddress) {
        await axiosClient.put(`/user/addresses/${editingAddress.id}`, addressData);
        alert('✅ Cập nhật địa chỉ thành công');
      } else {
        await axiosClient.post('/user/addresses', addressData);
        alert('✅ Thêm địa chỉ thành công');
      }

      setShowModal(false);
      await fetchAddresses();
      
    } catch (error) {
      console.error('❌ Error saving address:', error);
      
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 400) {
          if (data.message) {
            alert(`❌ ${data.message}`);
          } else {
            alert('❌ Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.');
          }
        } else if (status === 401) {
          alert('❌ Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
          navigate('/login');
        } else if (status === 403) {
          alert('🚫 Bạn không có quyền thực hiện thao tác này');
        } else {
          alert(`❌ Lỗi server: ${data?.message || 'Vui lòng thử lại sau'}`);
        }
      } else if (error.request) {
        alert('🌐 Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      } else {
        alert('❌ Lỗi: ' + error.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const getAddressTypeIcon = (type) => {
    switch(type) {
      case 'home': return <FaHome />;
      case 'office': return <FaBuilding />;
      default: return <FaMapMarkerAlt />;
    }
  };

  const getAddressTypeName = (type) => {
    switch(type) {
      case 'home': return 'Nhà riêng';
      case 'office': return 'Văn phòng';
      default: return 'Khác';
    }
  };

  const getFullAddress = (address) => {
    const parts = [address.address, address.ward, address.district, address.city].filter(p => p);
    return parts.join(', ');
  };

  if (loading) {
    return (
      <div className="addresses-container">
        <div className="loading-spinner">
          <FaSpinner className="spinner" />
          <p>Đang tải địa chỉ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="addresses-container">
      <div className="addresses-header">
        <h1>📍 Sổ địa chỉ</h1>
        <p>Quản lý địa chỉ giao hàng của bạn</p>
        <button className="add-address-btn" onClick={handleAddAddress}>
          <FaPlus /> Thêm địa chỉ mới
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="empty-addresses">
          <FaMapMarkerAlt className="empty-icon" />
          <h3>Chưa có địa chỉ nào</h3>
          <p>Thêm địa chỉ giao hàng để tiện lợi hơn khi mua sắm</p>
          <button onClick={handleAddAddress} className="add-first-btn">
            <FaPlus /> Thêm địa chỉ đầu tiên
          </button>
        </div>
      ) : (
        <div className="addresses-grid">
          {addresses.map(address => (
            <div key={address.id} className={`address-card ${address.isDefault ? 'default' : ''}`}>
              {address.isDefault && (
                <div className="default-badge">
                  <FaStar /> Mặc định
                </div>
              )}
              <div className="address-card-header">
                <div className="address-type">
                  {getAddressTypeIcon(address.addressType)}
                  <span>{getAddressTypeName(address.addressType)}</span>
                </div>
                <div className="address-actions">
                  <button 
                    className="action-btn edit-btn"
                    onClick={() => handleEditAddress(address)}
                    title="Chỉnh sửa"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => handleDeleteAddress(address.id)}
                    title="Xóa"
                    disabled={address.isDefault}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              <div className="address-card-body">
                <p className="address-name">
                  <FaUser /> {address.fullName}
                </p>
                <p className="address-phone">
                  <FaPhone /> {address.phone}
                </p>
                <p className="address-full">
                  <FaMapMarkerAlt /> {getFullAddress(address)}
                </p>
              </div>
              {!address.isDefault && (
                <button 
                  className="set-default-btn"
                  onClick={() => handleSetDefault(address.id)}
                >
                  <FaRegStar /> Đặt làm mặc định
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal thêm/sửa địa chỉ */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}</h2>
              <button className="close-modal" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Họ tên <span className="required">*</span></label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    placeholder="Nhập họ tên"
                    required
                    disabled={saving}
                  />
                </div>
                <div className="form-group">
                  <label>Số điện thoại <span className="required">*</span></label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="Nhập số điện thoại"
                    required
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Địa chỉ cụ thể <span className="required">*</span></label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Số nhà, tên đường, thôn/xóm"
                  required
                  disabled={saving}
                />
              </div>

              <div className="form-group" ref={provinceRef}>
                <label>Tỉnh/Thành phố <span className="required">*</span></label>
                <div className="search-dropdown">
                  <input
                    type="text"
                    value={searchProvince}
                    onChange={(e) => {
                      setSearchProvince(e.target.value);
                      setShowProvinceDropdown(true);
                    }}
                    onFocus={() => setShowProvinceDropdown(true)}
                    placeholder="Tìm kiếm tỉnh/thành phố..."
                    disabled={saving}
                  />
                  {showProvinceDropdown && filteredProvinces.length > 0 && (
                    <div className="dropdown-list">
                      {filteredProvinces.map(province => (
                        <div
                          key={province.id}
                          className="dropdown-item"
                          onClick={() => selectProvince(province)}
                        >
                          <FaMapMarkerAlt /> {province.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" ref={districtRef}>
                  <label>Quận/Huyện</label>
                  <div className="search-dropdown">
                    <input
                      type="text"
                      value={searchDistrict}
                      onChange={(e) => {
                        setSearchDistrict(e.target.value);
                        setShowDistrictDropdown(true);
                      }}
                      onFocus={() => setShowDistrictDropdown(true)}
                      placeholder="Chọn quận/huyện"
                      disabled={!formData.city || saving}
                    />
                    {showDistrictDropdown && filteredDistricts.length > 0 && (
                      <div className="dropdown-list">
                        {filteredDistricts.map(district => (
                          <div
                            key={district}
                            className="dropdown-item"
                            onClick={() => selectDistrict(district)}
                          >
                            <FaBuilding /> {district}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="form-group" ref={wardRef}>
                  <label>Phường/Xã</label>
                  <div className="search-dropdown">
                    <input
                      type="text"
                      value={formData.ward}
                      onChange={(e) => {
                        setFormData({...formData, ward: e.target.value});
                        setShowWardDropdown(true);
                      }}
                      onFocus={() => setShowWardDropdown(true)}
                      placeholder="Chọn phường/xã"
                      disabled={!formData.district || saving}
                    />
                    {showWardDropdown && filteredWards.length > 0 && (
                      <div className="dropdown-list">
                        {filteredWards.map(ward => (
                          <div
                            key={ward}
                            className="dropdown-item"
                            onClick={() => selectWard(ward)}
                          >
                            <FaMapMarkerAlt /> {ward}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Loại địa chỉ</label>
                  <select
                    value={formData.addressType}
                    onChange={(e) => setFormData({...formData, addressType: e.target.value})}
                    disabled={saving}
                  >
                    <option value="home">🏠 Nhà riêng</option>
                    <option value="office">🏢 Văn phòng</option>
                    <option value="other">📍 Khác</option>
                  </select>
                </div>
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                      disabled={saving}
                    />
                    <span>Đặt làm địa chỉ mặc định</span>
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
                  ) : (
                    editingAddress ? 'Cập nhật' : 'Thêm mới'
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

export default Addresses;