import axios from 'axios';

// Get API URL from environment or use default
const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  // KHÔNG dùng withCredentials: true vì gây lỗi với CORS và JWT
});

// Helper function để kiểm tra token hợp lệ
const isValidToken = (token) => {
  if (!token || typeof token !== 'string') return false;
  
  // JWT token phải có 3 phần cách nhau bởi dấu chấm
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  
  // Kiểm tra các phần có decode được không
  try {
    // Phần payload (phần thứ 2) phải decode được
    const payload = JSON.parse(atob(parts[1]));
    return payload && typeof payload === 'object' && 'sub' in payload;
  } catch {
    return false;
  }
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    console.log('🔑 Token check in interceptor:', {
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      tokenPreview: token ? (token.length > 50 ? token.substring(0, 50) + '...' : token) : 'none',
      tokenParts: token ? token.split('.').length : 0,
      url: config.url,
      method: config.method
    });
    
    // QUAN TRỌNG: Chỉ thêm token nếu hợp lệ
    if (token && isValidToken(token)) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Added valid token to request');
    } else {
      console.log('ℹ️ No valid token found, request will be unauthenticated');
      
      // Xóa token không hợp lệ khỏi localStorage
      if (token && !isValidToken(token)) {
        console.warn('⚠️ Invalid token format found, removing from localStorage');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      
      // Đảm bảo không có Authorization header
      delete config.headers.Authorization;
    }
    
    // Log request for debugging (chỉ trong development)
    if (import.meta.env?.MODE === 'development') {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, {
        baseURL: config.baseURL,
        headers: config.headers,
        params: config.params
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log response for debugging (chỉ trong development)
    if (import.meta.env?.MODE === 'development') {
      console.log(`✅ ${response.status} ${response.config.url}:`, {
        dataType: Array.isArray(response.data) ? 'array' : typeof response.data,
        dataLength: Array.isArray(response.data) ? response.data.length : 'N/A',
        sample: Array.isArray(response.data) && response.data.length > 0 
                ? response.data[0] 
                : response.data
      });
    }
    
    return response;
  },
  (error) => {
    // Log error for debugging
    const errorInfo = {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      tokenInRequest: error.config?.headers?.Authorization ? 'Yes' : 'No'
    };
    
    console.error('❌ API Error:', errorInfo);
    
    // Log chi tiết response data nếu có
    if (error.response?.data) {
      console.error('❌ Error details:', error.response.data);
    }
    
    // Xử lý các lỗi cụ thể
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          console.warn('⚠️ 401 Unauthorized - Token expired or invalid');
          // Xóa token và user info
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Chỉ redirect nếu không ở trang auth
          const currentPath = window.location.pathname;
          const isAuthPage = currentPath.includes('/login') || 
                             currentPath.includes('/register') || 
                             currentPath.includes('/auth');
          
          if (!isAuthPage && data?.message !== 'Invalid username or password') {
            // Thêm delay để tránh redirect ngay lập tức
            setTimeout(() => {
              window.location.href = '/login?session_expired=true';
            }, 1000);
          }
          break;
          
        case 403:
          console.error('🚫 403 Forbidden - Access denied');
          break;
          
        case 404:
          console.error('🔍 404 Not Found');
          break;
          
        case 500:
          console.error('🔥 500 Internal Server Error');
          // Log chi tiết lỗi server
          if (data) {
            console.error('🔥 Server error details:', {
              message: data.message,
              error: data.error,
              timestamp: data.timestamp
            });
          }
          break;
          
        default:
          console.error(`HTTP Error ${status}`);
      }
    } else if (error.request) {
      // No response received
      console.error('📡 No response received - Network error or server down');
      
      // Check if offline
      if (!navigator.onLine) {
        console.error('📴 You are offline');
      }
    } else {
      // Request setup error
      console.error('⚙️ Request setup error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Export
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/default-figure.jpg';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:image')) {
    return imagePath;
  }
  if (imagePath.startsWith('/uploads/')) {
    return `http://localhost:8080${imagePath}`;
  }
  if (imagePath.startsWith('uploads/')) {
    return `http://localhost:8080/${imagePath}`;
  }
  return imagePath;
};

export const axiosClient = api;
export default api;