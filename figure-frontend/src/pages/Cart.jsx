// src/pages/Cart.jsx
import React, { useState, useEffect } from 'react';
import { 
  Container, Grid, Card, CardContent, Typography, 
  Box, Button, IconButton, TextField, Divider,
  Alert, Snackbar, CircularProgress, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Add as AddIcon, 
  Remove as RemoveIcon,
  ShoppingCart as CartIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  ShoppingBag as ShoppingBagIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../styles/cart.css";

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [cartSummary, setCartSummary] = useState({
    totalItems: 0,
    subtotal: 0,
    shipping: 0,
    total: 0
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    itemId: null,
    action: ''
  });

  // API base URL
  const API_URL = 'http://localhost:8080/api';

  // Lấy token từ localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Lấy user từ localStorage
  const getUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  };

  // Lấy giỏ hàng từ API
  const fetchCart = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      if (!token) {
        setSnackbar({
          open: true,
          message: 'Vui lòng đăng nhập để xem giỏ hàng',
          severity: 'warning'
        });
        navigate('/login');
        return;
      }

      console.log('Fetching cart with token:', token ? 'Token exists' : 'No token');

      const response = await axios.get(`${API_URL}/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Cart API response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        const validItems = response.data.filter(item => item && item.figure);
        console.log('Valid cart items:', validItems.length);
        setCartItems(validItems);
        calculateCartSummary(validItems);
      } else if (response.data?.success === false) {
        setSnackbar({
          open: true,
          message: response.data.message || 'Không thể tải giỏ hàng',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Lỗi khi lấy giỏ hàng:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 401) {
        setSnackbar({
          open: true,
          message: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.',
          severity: 'error'
        });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        setSnackbar({
          open: true,
          message: 'Không thể tải giỏ hàng. Vui lòng thử lại.',
          severity: 'error'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật số lượng sản phẩm
  const updateQuantity = async (figureId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(figureId);
      return;
    }

    try {
      setUpdating(prev => ({ ...prev, [figureId]: true }));
      const token = getAuthToken();

      console.log('Updating quantity:', { figureId, newQuantity });

      const response = await axios.put(
        `${API_URL}/cart/update?figureId=${figureId}&quantity=${newQuantity}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Update quantity response:', response.data);

      if (response.data) {
        // Cập nhật local state
        setCartItems(prevItems => {
          const updatedItems = prevItems.map(item => {
            if (item.figure && item.figure.id === figureId) {
              return { ...item, quantity: newQuantity };
            }
            return item;
          }).filter(item => item.figure);
          
          calculateCartSummary(updatedItems);
          return updatedItems;
        });

        setSnackbar({
          open: true,
          message: 'Đã cập nhật số lượng',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật số lượng:', error);
      console.error('Error details:', error.response?.data);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Không thể cập nhật số lượng',
        severity: 'error'
      });
      fetchCart();
    } finally {
      setUpdating(prev => ({ ...prev, [figureId]: false }));
    }
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const handleRemoveItem = async (figureId) => {
    try {
      setUpdating(prev => ({ ...prev, [figureId]: true }));
      const token = getAuthToken();

      console.log('Removing item:', figureId);

      const response = await axios.delete(`${API_URL}/cart/remove/${figureId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Remove item response:', response.data);

      // Cập nhật local state
      setCartItems(prevItems => {
        const updatedItems = prevItems.filter(item => 
          item.figure && item.figure.id !== figureId
        );
        calculateCartSummary(updatedItems);
        return updatedItems;
      });

      setSnackbar({
        open: true,
        message: 'Đã xóa sản phẩm khỏi giỏ hàng',
        severity: 'success'
      });
    } catch (error) {
      console.error('Lỗi khi xóa sản phẩm:', error);
      console.error('Error details:', error.response?.data);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Không thể xóa sản phẩm',
        severity: 'error'
      });
    } finally {
      setUpdating(prev => ({ ...prev, [figureId]: false }));
      setConfirmDialog({ open: false, itemId: null, action: '' });
    }
  };

  // Xóa toàn bộ giỏ hàng
  const handleClearCart = async () => {
    try {
      const token = getAuthToken();

      console.log('Clearing cart');

      const response = await axios.delete(`${API_URL}/cart/clear`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Clear cart response:', response.data);

      setCartItems([]);
      setCartSummary({
        totalItems: 0,
        subtotal: 0,
        shipping: 0,
        total: 0
      });

      setSnackbar({
        open: true,
        message: 'Đã xóa toàn bộ giỏ hàng',
        severity: 'success'
      });
    } catch (error) {
      console.error('Lỗi khi xóa giỏ hàng:', error);
      console.error('Error details:', error.response?.data);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || 'Không thể xóa giỏ hàng',
        severity: 'error'
      });
    } finally {
      setConfirmDialog({ open: false, itemId: null, action: '' });
    }
  };

  // Tính tổng giỏ hàng
  const calculateCartSummary = (items) => {
    const validItems = items.filter(item => item.figure && item.figure.price);
    
    const subtotal = validItems.reduce((sum, item) => {
      const price = item.figure.price || 0;
      const quantity = item.quantity || 0;
      return sum + (price * quantity);
    }, 0);

    const totalItems = validItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const shipping = subtotal > 1000000 ? 0 : 30000;
    const total = subtotal + shipping;

    console.log('Cart summary calculated:', { totalItems, subtotal, shipping, total });

    setCartSummary({
      totalItems,
      subtotal,
      shipping,
      total
    });
  };

  // Chuyển đến trang thanh toán
  const handleCheckout = async () => {
    try {
      const token = getAuthToken();
      const user = getUser();
      
      if (!token || !user) {
        setSnackbar({
          open: true,
          message: 'Vui lòng đăng nhập để thanh toán',
          severity: 'warning'
        });
        navigate('/login');
        return;
      }

      if (cartItems.length === 0) {
        setSnackbar({
          open: true,
          message: 'Giỏ hàng trống. Vui lòng thêm sản phẩm vào giỏ hàng.',
          severity: 'warning'
        });
        return;
      }

      console.log('Validating cart for checkout');

      const validationResponse = await axios.get(`${API_URL}/cart/validate`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Validation response:', validationResponse.data);

      if (validationResponse.data?.valid) {
        navigate('/checkout');
      } else {
        setSnackbar({
          open: true,
          message: validationResponse.data?.message || 'Giỏ hàng không hợp lệ để thanh toán',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Lỗi khi kiểm tra giỏ hàng:', error);
      console.error('Error details:', error.response?.data);
      setSnackbar({
        open: true,
        message: 'Không thể kiểm tra giỏ hàng. Vui lòng thử lại.',
        severity: 'error'
      });
    }
  };

  // Định dạng tiền VND
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Mở dialog xác nhận
  const openConfirmDialog = (action, itemId = null) => {
    setConfirmDialog({
      open: true,
      action,
      itemId
    });
  };

  // Đóng dialog
  const closeConfirmDialog = () => {
    setConfirmDialog({ open: false, itemId: null, action: '' });
  };

  // Xử lý xác nhận từ dialog
  const handleConfirmAction = () => {
    const { action, itemId } = confirmDialog;
    
    if (action === 'remove' && itemId) {
      handleRemoveItem(itemId);
    } else if (action === 'clear') {
      handleClearCart();
    }
  };

  // Mua thêm sản phẩm - CHỈNH SỬA: Chuyển đến trang figures
  const handleContinueShopping = () => {
    navigate('/figures');
  };

  // Hiển thị hình ảnh mặc định
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/default-figure.jpg';
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    if (imageUrl.startsWith('/uploads/')) {
      return `http://localhost:8080${imageUrl}`;
    }
    if (imageUrl.startsWith('uploads/')) {
      return `http://localhost:8080/${imageUrl}`;
    }
    if (imageUrl.startsWith('/')) {
      return imageUrl;
    }
    return '/default-figure.jpg';
  };

  // Load giỏ hàng khi component mount
  useEffect(() => {
    fetchCart();
  }, []);

  // Hiển thị loading
  if (loading) {
    return (
      <Container maxWidth="lg" className="cart-container" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Đang tải giỏ hàng...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" className="cart-container" sx={{ py: 4 }}>
      {/* Tiêu đề */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleContinueShopping}
          sx={{ mb: 2 }}
          variant="outlined"
        >
          Tiếp tục mua sắm
        </Button>
        
        <Typography variant="h4" component="h1" className="cart-title" sx={{ 
          fontWeight: 'bold', 
          display: 'flex', 
          alignItems: 'center',
          gap: 1 
        }}>
          <CartIcon fontSize="large" />
          Giỏ Hàng Của Bạn
        </Typography>
        
        <Typography variant="subtitle1" color="text.secondary">
          {cartItems.length} sản phẩm trong giỏ hàng
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Danh sách sản phẩm */}
        <Grid size={{ xs: 12, md: 8 }}>
          {cartItems.length === 0 ? (
            <Paper className="empty-cart" sx={{ p: 4, textAlign: 'center' }}>
              <ShoppingBagIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Giỏ hàng trống
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Bạn chưa có sản phẩm nào trong giỏ hàng
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={handleContinueShopping}
                startIcon={<AddIcon />}
                sx={{ mt: 2 }}
              >
                Mua sắm ngay
              </Button>
            </Paper>
          ) : (
            <>
              {/* Nút xóa toàn bộ */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => openConfirmDialog('clear')}
                  className="clear-cart-button"
                >
                  Xóa tất cả
                </Button>
              </Box>

              {/* Bảng sản phẩm */}
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow className="table-header">
                      <TableCell><Typography fontWeight="bold">Sản phẩm</Typography></TableCell>
                      <TableCell align="center"><Typography fontWeight="bold">Đơn giá</Typography></TableCell>
                      <TableCell align="center"><Typography fontWeight="bold">Số lượng</Typography></TableCell>
                      <TableCell align="center"><Typography fontWeight="bold">Thành tiền</Typography></TableCell>
                      <TableCell align="center"><Typography fontWeight="bold">Thao tác</Typography></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cartItems.map((item) => (
                      <TableRow key={item.id || item.figure?.id} className="table-row">
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }} className="cart-item-row">
                            <img
                              src={getImageUrl(item.figure?.imageUrl)}
                              alt={item.figure?.name || 'Sản phẩm'}
                              className="cart-item-image"
                              onError={(e) => {
                                e.target.src = '/default-figure.jpg';
                              }}
                            />
                            <Box>
                              <Typography variant="subtitle1" fontWeight="medium">
                                {item.figure?.name || 'Không có tên'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {item.figure?.category || 'Không có danh mục'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Còn lại: {item.figure?.quantity || 0} sản phẩm
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body1" fontWeight="medium">
                            {formatCurrency(item.figure?.price || 0)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="quantity-controls">
                            <IconButton 
                              size="small"
                              onClick={() => updateQuantity(item.figure.id, item.quantity - 1)}
                              disabled={updating[item.figure.id] || item.quantity <= 1}
                              color="primary"
                            >
                              <RemoveIcon />
                            </IconButton>
                            
                            <TextField
                              size="small"
                              value={item.quantity}
                              type="number"
                              inputProps={{ 
                                min: 1,
                                max: item.figure?.quantity || 99,
                                className: 'quantity-input'
                              }}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                if (!isNaN(value) && value >= 1 && value <= (item.figure?.quantity || 99)) {
                                  updateQuantity(item.figure.id, value);
                                }
                              }}
                              sx={{ 
                                width: 60,
                                mx: 1,
                                '& .MuiInputBase-input': { textAlign: 'center' }
                              }}
                              disabled={updating[item.figure.id]}
                            />
                            
                            <IconButton 
                              size="small"
                              onClick={() => updateQuantity(item.figure.id, item.quantity + 1)}
                              disabled={updating[item.figure.id] || item.quantity >= (item.figure?.quantity || 99)}
                              color="primary"
                            >
                              <AddIcon />
                            </IconButton>
                          </Box>
                          {updating[item.figure.id] && (
                            <CircularProgress size={20} sx={{ mt: 1 }} />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="h6" color="primary" fontWeight="bold">
                            {formatCurrency((item.figure?.price || 0) * (item.quantity || 0))}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            color="error"
                            onClick={() => openConfirmDialog('remove', item.figure.id)}
                            disabled={updating[item.figure.id]}
                          >
                            {updating[item.figure.id] ? <CircularProgress size={24} /> : <DeleteIcon />}
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </Grid>

        {/* Tóm tắt đơn hàng */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card className="cart-summary-card">
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ 
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <CheckCircleIcon color="primary" />
                Tóm Tắt Đơn Hàng
              </Typography>

              <Box sx={{ my: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Số lượng sản phẩm:</Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {cartSummary.totalItems}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Tạm tính:</Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {formatCurrency(cartSummary.subtotal)}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">Phí vận chuyển:</Typography>
                  <Typography variant="body1" color={cartSummary.shipping === 0 ? 'success.main' : 'inherit'}>
                    {cartSummary.shipping === 0 ? 'Miễn phí' : formatCurrency(cartSummary.shipping)}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Tổng cộng:</Typography>
                  <Typography variant="h5" color="primary" fontWeight="bold">
                    {formatCurrency(cartSummary.total)}
                  </Typography>
                </Box>

                {cartSummary.subtotal > 1000000 && cartSummary.subtotal > 0 && (
                  <Alert severity="success" sx={{ mt: 2 }} className="free-shipping-alert">
                    🎉 Bạn được miễn phí vận chuyển!
                  </Alert>
                )}

                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    onClick={handleCheckout}
                    disabled={cartItems.length === 0}
                    startIcon={<ShoppingBagIcon />}
                    sx={{ py: 1.5 }}
                    className="checkout-button"
                  >
                    TIẾN HÀNH THANH TOÁN
                  </Button>
                  
                  <Typography variant="caption" display="block" textAlign="center" sx={{ mt: 1, color: 'text.secondary' }}>
                    Bạn có thể xem lại đơn hàng trước khi thanh toán
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Lưu ý */}
          <Paper sx={{ p: 2, mt: 2, bgcolor: 'info.light' }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              📝 Lưu ý:
            </Typography>
            <Typography variant="caption" component="div">
              • Miễn phí vận chuyển cho đơn hàng trên 1,000,000₫
              <br />
              • Kiểm tra kỹ thông tin sản phẩm trước khi thanh toán
              <br />
              • Giỏ hàng sẽ được lưu tự động
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog xác nhận */}
      <Dialog open={confirmDialog.open} onClose={closeConfirmDialog} className="confirm-dialog">
        <DialogTitle className="confirm-dialog-title">
          <Box display="flex" alignItems="center" gap={1}>
            <WarningIcon color="warning" />
            Xác nhận
          </Box>
        </DialogTitle>
        <DialogContent>
          {confirmDialog.action === 'clear' ? (
            <Typography>Bạn có chắc chắn muốn xóa toàn bộ giỏ hàng?</Typography>
          ) : (
            <Typography>Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDialog} variant="outlined">Hủy</Button>
          <Button 
            onClick={handleConfirmAction} 
            color="error" 
            variant="contained"
            startIcon={<DeleteIcon />}
          >
            Xác nhận xóa
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar thông báo */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Cart;