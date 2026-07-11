import React, { useState, useEffect, useRef } from 'react';
import { 
    FaPlus, FaEdit, FaTrash, FaEye, FaImage, FaSearch, FaSpinner, 
    FaStore, FaTimes, FaUpload
} from 'react-icons/fa';
import axiosClient, { getImageUrl } from '../../api/axiosClient';
import { useCategory } from '../../contexts/CategoryContext';
import '../../styles/ProductManagement.css';

const ProductManagement = () => {
    const { refreshCategories } = useCategory();
    
    // Product States
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [branches, setBranches] = useState([]); // Thêm state cho branches
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [seriesList, setSeriesList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    
    // Upload image states
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [uploading, setUploading] = useState(false);
    const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
    const [selectedCardRef, setSelectedCardRef] = useState(null);
    const modalRef = useRef(null);
    const cardRefs = useRef({});

    // Product Form Data - THÊM branchId, imagesList, videoUrl
    const [formData, setFormData] = useState({
        name: '',
        series: '',
        manufacturer: '',
        type: '',
        price: '',
        quantity: '',
        scale: '',
        releaseDate: '',
        description: '',
        image: '',
        imagesList: '',
        videoUrl: '',
        categoryId: '',
        branchId: ''
    });

    // Gallery upload states
    const [galleryFiles, setGalleryFiles] = useState([]);
    const [galleryPreviews, setGalleryPreviews] = useState([]);

    // Video upload states
    const [videoFile, setVideoFile] = useState(null);
    const [videoPreview, setVideoPreview] = useState('');

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchBranches(); // Thêm fetch branches
        fetchSeriesList();
    }, []);

    // Xử lý click outside để đóng modal
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target) && 
                !event.target.closest('.edit-btn') && !event.target.closest('.add-btn')) {
                setShowModal(false);
                setEditingProduct(null);
            }
        };

        if (showModal) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showModal]);

    // Cập nhật vị trí modal khi cuộn hoặc resize
    useEffect(() => {
        const updateModalPosition = () => {
            if (selectedCardRef && showModal) {
                const rect = selectedCardRef.getBoundingClientRect();
                const modalHeight = modalRef.current?.offsetHeight || 500;
                const viewportHeight = window.innerHeight;
                
                let top = rect.bottom + window.scrollY + 10;
                
                if (rect.bottom + modalHeight + 50 > viewportHeight) {
                    top = rect.top + window.scrollY - modalHeight - 10;
                }
                
                setModalPosition({
                    top: top,
                    left: rect.left + window.scrollX
                });
            }
        };

        if (showModal && selectedCardRef) {
            updateModalPosition();
            window.addEventListener('scroll', updateModalPosition);
            window.addEventListener('resize', updateModalPosition);
        }

        return () => {
            window.removeEventListener('scroll', updateModalPosition);
            window.removeEventListener('resize', updateModalPosition);
        };
    }, [showModal, selectedCardRef, formData]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            console.log('📡 Fetching products...');
            const response = await axiosClient.get('/admin/products');
            setProducts(response.data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
            if (error.response?.status === 401) {
                alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
                window.location.href = '/login';
            } else {
                alert('Lỗi khi tải danh sách sản phẩm');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            console.log('📡 Fetching categories...');
            const response = await axiosClient.get('/admin/categories');
            setCategories(response.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    // Thêm hàm fetch branches
    const fetchBranches = async () => {
        try {
            console.log('📡 Fetching branches...');
            const response = await axiosClient.get('/admin/branches');
            // Chỉ lấy chi nhánh đang hoạt động
            const activeBranches = (response.data || []).filter(b => b.isActive === true);
            setBranches(activeBranches);
        } catch (error) {
            console.error('Error fetching branches:', error);
        }
    };

    const fetchSeriesList = async () => {
        try {
            console.log('📡 Fetching series list...');
            const response = await axiosClient.get('/admin/series');
            setSeriesList(response.data || response || []);
        } catch (error) {
            console.error('Error fetching series list:', error);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleCategoryFilter = (e) => {
        setSelectedCategory(e.target.value);
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.series?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || product.category?.id == selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Upload ảnh lên server
    const uploadImage = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const response = await axiosClient.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data.url || response.data.filePath;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw new Error('Không thể upload ảnh');
        }
    };

    // Xử lý chọn ảnh sản phẩm từ máy tính
    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            alert('Vui lòng chọn file ảnh định dạng JPEG, PNG, GIF hoặc WEBP');
            return;
        }
        
        if (file.size > 10 * 1024 * 1024) {
            if (!window.confirm(`Ảnh có kích thước ${(file.size / 1024 / 1024).toFixed(2)}MB. Tiếp tục upload?`)) {
                return;
            }
        }
        
        setImageFile(file);
        
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    // Xóa ảnh sản phẩm
    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview('');
        setFormData(prev => ({ ...prev, image: '' }));
    };

    // Xử lý chọn ảnh bộ sưu tập
    const handleGallerySelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        const validFiles = files.filter(file => {
            if (!allowedTypes.includes(file.type)) {
                alert(`File ${file.name} không đúng định dạng ảnh`);
                return false;
            }
            return true;
        });

        setGalleryFiles(prev => [...prev, ...validFiles]);

        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setGalleryPreviews(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    // Xóa ảnh khỏi bộ sưu tập
    const handleRemoveGalleryItem = (index) => {
        const preview = galleryPreviews[index];
        if (preview.startsWith('data:')) {
            const dataUrlPreviews = galleryPreviews.filter(p => p.startsWith('data:'));
            const dataIndex = dataUrlPreviews.indexOf(preview);
            if (dataIndex !== -1) {
                setGalleryFiles(prev => prev.filter((_, idx) => idx !== dataIndex));
            }
        }
        setGalleryPreviews(prev => prev.filter((_, idx) => idx !== index));
    };

    // Xử lý chọn video từ máy tính
    const handleVideoSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
        if (!allowedTypes.includes(file.type)) {
            alert('Vui lòng chọn file video định dạng MP4, WebM, OGG hoặc MOV');
            return;
        }

        if (file.size > 50 * 1024 * 1024) {
            alert('Video không được vượt quá 50MB');
            return;
        }

        setVideoFile(file);
        
        // Tạo đường dẫn tạm blob để xem trước cục bộ
        const previewUrl = URL.createObjectURL(file);
        setVideoPreview(previewUrl);
    };

    // Xóa video đã chọn
    const handleRemoveVideo = () => {
        setVideoFile(null);
        setVideoPreview('');
        setFormData(prev => ({ ...prev, videoUrl: '' }));
    };

    const handleAddProduct = () => {
        setEditingProduct(null);
        setImageFile(null);
        setImagePreview('');
        setGalleryFiles([]);
        setGalleryPreviews([]);
        setVideoFile(null);
        setVideoPreview('');
        setSelectedCardRef(null);
        setFormData({
            name: '',
            series: '',
            manufacturer: '',
            type: '',
            price: '',
            quantity: '',
            scale: '',
            releaseDate: '',
            description: '',
            image: '',
            imagesList: '',
            videoUrl: '',
            categoryId: '',
            branchId: ''
        });
        setModalPosition({
            top: window.scrollY + 100,
            left: window.innerWidth / 2 - 300
        });
        setShowModal(true);
    };

    const handleEditProduct = (product, cardElement) => {
        setEditingProduct(product);
        setSelectedCardRef(cardElement);
        setImageFile(null);
        setImagePreview(product.image || '');
        
        const existingGallery = product.imagesList ? product.imagesList.split(',').filter(Boolean) : [];
        setGalleryPreviews(existingGallery);
        setGalleryFiles([]);
        
        setVideoFile(null);
        setVideoPreview(product.videoUrl || '');

        setFormData({
            name: product.name || '',
            series: product.series || '',
            manufacturer: product.manufacturer || '',
            type: product.type || '',
            price: product.price || '',
            quantity: product.quantity || '',
            scale: product.scale || '',
            releaseDate: product.releaseDate || '',
            description: product.description || '',
            image: product.image || '',
            imagesList: product.imagesList || '',
            videoUrl: product.videoUrl || '',
            categoryId: product.category?.id || '',
            branchId: product.branchId || ''
        });
        setShowModal(true);
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            return;
        }

        try {
            console.log(`🗑️ Deleting product ID: ${id}`);
            await axiosClient.delete(`/admin/products/${id}`);
            await fetchProducts();
            refreshCategories('delete_product', { id });
            alert('✅ Xóa sản phẩm thành công');
        } catch (error) {
            console.error('Error deleting product:', error);
            if (error.response?.status === 409) {
                alert('⚠️ Không thể xóa sản phẩm đang có trong đơn hàng');
            } else {
                alert(error.response?.data?.message || '❌ Xóa sản phẩm thất bại');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name.trim()) {
            alert('⚠️ Vui lòng nhập tên sản phẩm');
            return;
        }
        if (!formData.price || parseFloat(formData.price) <= 0) {
            alert('⚠️ Vui lòng nhập giá hợp lệ');
            return;
        }
        if (!formData.quantity || parseInt(formData.quantity) < 0) {
            alert('⚠️ Vui lòng nhập số lượng hợp lệ');
            return;
        }
        
        setSaving(true);
        
        try {
            // Upload main image
            let imageUrl = formData.image;
            if (imageFile) {
                setUploading(true);
                const uploadedUrl = await uploadImage(imageFile);
                if (uploadedUrl) {
                    imageUrl = uploadedUrl;
                }
            }

            // Upload gallery images in bulk
            setUploading(true);
            const uploadedGalleryUrls = [];
            for (const file of galleryFiles) {
                const url = await uploadImage(file);
                if (url) {
                    uploadedGalleryUrls.push(url);
                }
            }

            const existingUrls = galleryPreviews.filter(p => !p.startsWith('data:'));
            const finalGalleryList = [...existingUrls, ...uploadedGalleryUrls].join(',');

            // Upload video file
            let videoUrl = formData.videoUrl;
            if (videoFile) {
                setUploading(true);
                const uploadedUrl = await uploadImage(videoFile);
                if (uploadedUrl) {
                    videoUrl = uploadedUrl;
                }
            }

            const productData = {
                name: formData.name.trim(),
                series: formData.series?.trim() || null,
                manufacturer: formData.manufacturer?.trim() || null,
                type: formData.type?.trim() || null,
                price: parseFloat(formData.price),
                quantity: parseInt(formData.quantity),
                scale: formData.scale?.trim() || null,
                releaseDate: formData.releaseDate || null,
                description: formData.description?.trim() || null,
                image: imageUrl || null,
                imagesList: finalGalleryList || null,
                videoUrl: videoUrl || null,
                category: formData.categoryId ? { id: parseInt(formData.categoryId) } : null,
                branchId: formData.branchId || null
            };

            console.log('📤 Sending product data:', productData);

            if (editingProduct) {
                console.log(`🔄 Updating product ID: ${editingProduct.id}`);
                await axiosClient.put(`/admin/products/${editingProduct.id}`, productData);
                alert('✅ Cập nhật sản phẩm thành công');
            } else {
                console.log('🆕 Creating new product');
                await axiosClient.post('/admin/products', productData);
                alert('✅ Thêm sản phẩm thành công');
            }

            setShowModal(false);
            setEditingProduct(null);
            setSelectedCardRef(null);
            await fetchProducts();
            refreshCategories(editingProduct ? 'update_product' : 'create_product');
            
        } catch (error) {
            console.error('Error saving product:', error);
            
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
                    alert('⚠️ Tên sản phẩm đã tồn tại');
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
            setUploading(false);
        }
    };

    const formatCurrency = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price || 0);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN');
        } catch {
            return dateString;
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

    // Lấy tên chi nhánh theo ID
    const getBranchName = (branchId) => {
        const branch = branches.find(b => b.id == branchId);
        return branch ? branch.name : 'Chưa phân bổ';
    };

    return (
        <div className="product-management">
            <div className="page-header">
                <h1>Quản lý sản phẩm (Figure)</h1>
                <button className="add-btn" onClick={handleAddProduct}>
                    <FaPlus /> Thêm sản phẩm
                </button>
            </div>

            <div className="stats-container">
                <div className="stat-card">
                    <h3>Tổng sản phẩm</h3>
                    <p className="stat-number">{products.length}</p>
                </div>
                <div className="stat-card">
                    <h3>Sản phẩm có sẵn</h3>
                    <p className="stat-number">
                        {products.filter(p => p.quantity > 0).length}
                    </p>
                </div>
                <div className="stat-card">
                    <h3>Danh mục</h3>
                    <p className="stat-number">{categories.length}</p>
                </div>
                <div className="stat-card">
                    <h3>Chi nhánh</h3>
                    <p className="stat-number">{branches.length}</p>
                </div>
            </div>

            <div className="filters">
                <div className="search-box">
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm theo tên, series, nhà sản xuất..."
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </div>
                <select value={selectedCategory} onChange={handleCategoryFilter}>
                    <option value="">Tất cả danh mục</option>
                    {categories.map(category => (
                        <option key={category.id} value={category.id}>
                            {category.name} ({category.productCount || 0})
                        </option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="loading">
                    <FaSpinner className="spinner" />
                    <p>Đang tải sản phẩm...</p>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="no-data">
                    <FaImage className="no-data-icon" />
                    <p>Không tìm thấy sản phẩm nào</p>
                    <button className="add-first-btn" onClick={handleAddProduct}>
                        <FaPlus /> Thêm sản phẩm đầu tiên
                    </button>
                </div>
            ) : (
                <div className="products-table-container">
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th>Ảnh</th>
                                <th>Thông tin sản phẩm</th>
                                <th>Series / Danh mục</th>
                                <th>Chi nhánh</th>
                                <th>Giá bán</th>
                                <th>Tồn kho</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(product => (
                                <tr 
                                    key={product.id} 
                                    ref={el => cardRefs.current[product.id] = el}
                                >
                                    <td className="image-cell">
                                        <div className="product-image-mini">
                                            {product.image ? (
                                                <img 
                                                    src={getImageUrl(product.image)} 
                                                    alt={product.name}
                                                    onError={(e) => {
                                                        e.target.src = '/placeholder-image.jpg';
                                                        e.target.onerror = null;
                                                    }}
                                                />
                                            ) : (
                                                <FaImage className="placeholder-image" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="info-cell">
                                        <div className="product-name-main">{product.name}</div>
                                        <div className="product-meta-id">
                                            <span>ID: {product.id}</span>
                                            <span>Scale: {product.scale || 'N/A'}</span>
                                            <span>Loại: {product.type || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="series-cat-cell">
                                        <div className="product-series-tag">
                                            {product.series ? `📺 ${product.series}` : 'Chưa có series'}
                                        </div>
                                        <div className="product-category-tag">
                                            📁 {product.category?.name || 'Chưa phân loại'}
                                        </div>
                                    </td>
                                    <td className="branch-cell">
                                        <div className="product-branch-tag">
                                            <FaStore /> {getBranchName(product.branchId)}
                                        </div>
                                    </td>
                                    <td className="price-cell">
                                        <div className="product-price-value">{formatCurrency(product.price)}</div>
                                        {product.manufacturer && (
                                            <div className="product-manufacturer-tag">NSX: {product.manufacturer}</div>
                                        )}
                                    </td>
                                    <td className="stock-cell">
                                        <span className={`stock-status-badge ${product.quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                            {product.quantity > 0 ? `Còn ${product.quantity}` : 'Hết hàng'}
                                        </span>
                                    </td>
                                    <td className="actions-cell">
                                        <div className="product-actions-horizontal">
                                            <button 
                                                className="action-btn view-btn" 
                                                title="Xem chi tiết"
                                                onClick={() => window.location.href = `/product/${product.id}`}
                                            >
                                                <FaEye />
                                            </button>
                                            <button 
                                                className="action-btn edit-btn" 
                                                onClick={() => handleEditProduct(product, cardRefs.current[product.id])}
                                                title="Chỉnh sửa"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button 
                                                className="action-btn delete-btn" 
                                                onClick={() => handleDeleteProduct(product.id)}
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

            {/* Modal thêm/sửa sản phẩm */}
            {showModal && (
                <div 
                    className="modal-overlay"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 2000
                    }}
                >
                    <div className="modal modal-large" ref={modalRef}>
                        <div className="modal-header">
                            <h2>{editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
                            <button className="close-btn" onClick={() => {
                                setShowModal(false);
                                setEditingProduct(null);
                                setSelectedCardRef(null);
                            }}>
                                <FaTimes />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Tên sản phẩm <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        placeholder="Nhập tên sản phẩm"
                                        required
                                        disabled={saving}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Chi nhánh <span className="required">*</span></label>
                                    <select
                                        value={formData.branchId}
                                        onChange={(e) => setFormData({...formData, branchId: e.target.value})}
                                        required
                                        disabled={saving}
                                    >
                                        <option value="">Chọn chi nhánh</option>
                                        {branches.map(branch => (
                                            <option key={branch.id} value={branch.id}>
                                                {branch.name} ({branch.code})
                                            </option>
                                        ))}
                                    </select>
                                    <small className="form-hint">Chọn chi nhánh phân phối sản phẩm này</small>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Series</label>
                                    <select
                                        value={formData.series}
                                        onChange={(e) => setFormData({...formData, series: e.target.value})}
                                        disabled={saving}
                                    >
                                        <option value="">Chọn Series</option>
                                        {seriesList.map(series => (
                                            <option key={series.id} value={series.name}>
                                                {series.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Nhà sản xuất</label>
                                    <input
                                        type="text"
                                        value={formData.manufacturer}
                                        onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                                        placeholder="VD: Good Smile, Bandai..."
                                        disabled={saving}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Loại</label>
                                    <input
                                        type="text"
                                        value={formData.type}
                                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                                        placeholder="VD: Action Figure, PVC Figure, Nendoroid..."
                                        disabled={saving}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Scale</label>
                                    <input
                                        type="text"
                                        value={formData.scale}
                                        onChange={(e) => setFormData({...formData, scale: e.target.value})}
                                        placeholder="VD: 1/7, 1/8, Non-scale..."
                                        disabled={saving}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Giá (VND) <span className="required">*</span></label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                                        min="0"
                                        step="1000"
                                        placeholder="VD: 500000"
                                        required
                                        disabled={saving}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Số lượng <span className="required">*</span></label>
                                    <input
                                        type="number"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                                        min="0"
                                        placeholder="VD: 100"
                                        required
                                        disabled={saving}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Ngày phát hành</label>
                                    <input
                                        type="date"
                                        value={formData.releaseDate}
                                        onChange={(e) => setFormData({...formData, releaseDate: e.target.value})}
                                        disabled={saving}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Danh mục</label>
                                    <select
                                        value={formData.categoryId}
                                        onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                                        disabled={saving}
                                    >
                                        <option value="">Chọn danh mục</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Hình ảnh sản phẩm</label>
                                <div 
                                    className="image-upload-area"
                                    onClick={() => document.getElementById('product-image-file').click()}
                                >
                                    <input 
                                        type="file" 
                                        id="product-image-file" 
                                        style={{ display: 'none' }} 
                                        onChange={handleImageSelect}
                                        accept="image/*"
                                        disabled={saving || uploading}
                                    />
                                    {imagePreview ? (
                                        <div className="preview-container" onClick={(e) => e.stopPropagation()}>
                                            <img src={imagePreview.startsWith('data:') ? imagePreview : getImageUrl(imagePreview)} alt="Preview" />
                                            <button 
                                                type="button" 
                                                className="remove-img-btn" 
                                                onClick={handleRemoveImage}
                                                disabled={saving || uploading}
                                            >
                                                <FaTimes />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="upload-placeholder">
                                            <FaUpload />
                                            <span>Chọn ảnh từ máy tính hoặc kéo thả vào đây</span>
                                            <small>Hỗ trợ: JPEG, PNG, GIF, WEBP</small>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Bộ sưu tập ảnh sản phẩm (Ảnh hàng loạt)</label>
                                <div className="gallery-upload-wrapper">
                                    <div className="gallery-previews-grid">
                                        {galleryPreviews.map((preview, index) => (
                                            <div key={index} className="gallery-preview-item">
                                                <img src={preview.startsWith('data:') ? preview : getImageUrl(preview)} alt={`Preview ${index}`} />
                                                <button 
                                                    type="button" 
                                                    className="remove-gallery-item-btn" 
                                                    onClick={() => handleRemoveGalleryItem(index)}
                                                    disabled={saving || uploading}
                                                >
                                                    <FaTimes />
                                                </button>
                                            </div>
                                        ))}
                                        <div 
                                            className="gallery-add-placeholder"
                                            onClick={() => document.getElementById('product-gallery-files').click()}
                                        >
                                            <FaPlus />
                                            <span>Thêm ảnh</span>
                                            <input 
                                                type="file" 
                                                id="product-gallery-files" 
                                                style={{ display: 'none' }} 
                                                onChange={handleGallerySelect}
                                                accept="image/*"
                                                multiple
                                                disabled={saving || uploading}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Video giới thiệu sản phẩm (Từ thiết bị)</label>
                                <div 
                                    className="image-upload-area video-upload-area"
                                    onClick={() => document.getElementById('product-video-file').click()}
                                    style={{
                                        border: '1px dashed #cbd5e1',
                                        borderRadius: '12px',
                                        padding: '20px',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        background: '#f8fafc',
                                        position: 'relative'
                                    }}
                                >
                                    <input 
                                        type="file" 
                                        id="product-video-file" 
                                        style={{ display: 'none' }} 
                                        onChange={handleVideoSelect}
                                        accept="video/*"
                                        disabled={saving || uploading}
                                    />
                                    {videoPreview ? (
                                        <div className="preview-container video-preview-container" onClick={(e) => e.stopPropagation()}>
                                            <video 
                                                src={videoPreview.startsWith('blob:') ? videoPreview : getImageUrl(videoPreview)} 
                                                controls 
                                                style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                            />
                                            <button 
                                                type="button" 
                                                className="remove-img-btn" 
                                                onClick={handleRemoveVideo}
                                                disabled={saving || uploading}
                                                style={{
                                                    position: 'absolute',
                                                    top: '-10px',
                                                    right: '-10px',
                                                    background: '#ef4444',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    width: '24px',
                                                    height: '24px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <FaTimes />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="upload-placeholder" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                                            <FaUpload style={{ fontSize: '24px' }} />
                                            <span>Chọn video từ máy tính (.mp4, .webm...)</span>
                                            <small style={{ fontSize: '11px', color: '#94a3b8' }}>Dung lượng tối đa: 50MB</small>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Mô tả</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    rows="4"
                                    placeholder="Nhập mô tả chi tiết về sản phẩm..."
                                    disabled={saving}
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={() => {
                                    setShowModal(false);
                                    setEditingProduct(null);
                                    setSelectedCardRef(null);
                                }} disabled={saving}>
                                    Hủy
                                </button>
                                <button type="submit" className="save-btn" disabled={saving}>
                                    {saving ? (
                                        <>
                                            <FaSpinner className="spinner" />
                                            Đang lưu...
                                        </>
                                    ) : editingProduct ? (
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
        </div>
    );
};

export default ProductManagement;