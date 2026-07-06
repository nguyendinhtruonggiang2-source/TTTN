// src/components/admin/DashboardStats.jsx
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LineElement,
    LinearScale,
    PointElement,
    Title,
    Tooltip
} from 'chart.js';
import React, { useEffect, useState } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
    FaBox,
    FaChartLine,
    FaCheckCircle,
    FaDollarSign,
    FaFire,
    FaShoppingBag,
    FaSpinner,
    FaStar,
    FaUsers
} from 'react-icons/fa';
import axiosClient from '../../api/axiosClient';
import '../../styles/DashboardStats.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const DashboardStats = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    thisMonthRevenue: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    monthlyRevenue: [],
    topProducts: [],
    recentReviews: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    fetchDashboardStats();
  }, [selectedPeriod]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get(`/admin/dashboard/stats?period=${selectedPeriod}`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Dữ liệu mẫu khi API chưa có
      setStats({
        totalOrders: 156,
        totalUsers: 89,
        totalProducts: 45,
        totalRevenue: 125000000,
        todayRevenue: 8500000,
        thisMonthRevenue: 45000000,
        pendingOrders: 12,
        processingOrders: 8,
        shippedOrders: 15,
        deliveredOrders: 98,
        cancelledOrders: 23,
        monthlyRevenue: [
          { month: 'Tháng 1', revenue: 12000000, orderCount: 15 },
          { month: 'Tháng 2', revenue: 15000000, orderCount: 18 },
          { month: 'Tháng 3', revenue: 18000000, orderCount: 22 },
          { month: 'Tháng 4', revenue: 22000000, orderCount: 25 },
          { month: 'Tháng 5', revenue: 25000000, orderCount: 28 },
          { month: 'Tháng 6', revenue: 30000000, orderCount: 32 }
        ],
        topProducts: [
          { id: 1, name: 'Genshin Impact Raiden Shogun', image: null, soldCount: 150, revenue: 7500000 },
          { id: 2, name: 'Gundam RX-78-2', image: null, soldCount: 120, revenue: 6000000 },
          { id: 3, name: 'Honkai Star Rail Kafka', image: null, soldCount: 100, revenue: 5000000 }
        ],
        recentReviews: [
          { id: 1, username: 'nguyenvana', productName: 'Genshin Impact Raiden Shogun', rating: 5, content: 'Sản phẩm rất đẹp!', createdAt: new Date().toISOString() },
          { id: 2, username: 'tranthib', productName: 'Gundam RX-78-2', rating: 5, content: 'Chất lượng tuyệt vời', createdAt: new Date().toISOString() }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const revenueChartData = {
    labels: stats.monthlyRevenue?.map(item => item.month) || [],
    datasets: [
      {
        label: 'Doanh thu',
        data: stats.monthlyRevenue?.map(item => item.revenue) || [],
        borderColor: '#ee4d2d',
        backgroundColor: 'rgba(238, 77, 45, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ]
  };

  const ordersChartData = {
    labels: stats.monthlyRevenue?.map(item => item.month) || [],
    datasets: [
      {
        label: 'Số đơn hàng',
        data: stats.monthlyRevenue?.map(item => item.orderCount) || [],
        backgroundColor: '#2563eb',
        borderRadius: 8,
      }
    ]
  };

  const orderStatusData = {
    labels: ['Chờ xác nhận', 'Đang xử lý', 'Đang giao', 'Đã giao', 'Đã hủy'],
    datasets: [
      {
        data: [
          stats.pendingOrders,
          stats.processingOrders,
          stats.shippedOrders,
          stats.deliveredOrders,
          stats.cancelledOrders
        ],
        backgroundColor: ['#ff9800', '#2196f3', '#9c27b0', '#4caf50', '#f44336'],
        borderWidth: 0,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.dataset.label === 'Doanh thu') {
              label += formatCurrency(context.raw);
            } else {
              label += context.raw.toLocaleString();
            }
            return label;
          }
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      }
    }
  };

  const StatCard = ({ title, value, icon, color, subValue }) => (
    <div className="stat-card">
      <div className="stat-card-icon" style={{ backgroundColor: color }}>
        {icon}
      </div>
      <div className="stat-card-info">
        <div className="stat-card-title">{title}</div>
        <div className="stat-card-value">{value}</div>
        {subValue && <div className="stat-card-sub">{subValue}</div>}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="dashboard-loading">
        <FaSpinner className="spinner" />
        <p>Đang tải dữ liệu thống kê...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-stats">
      <div className="dashboard-header">
        <h1>
          <FaChartLine /> Tổng quan
        </h1>
        <div className="period-selector">
          <button 
            className={selectedPeriod === 'week' ? 'active' : ''}
            onClick={() => setSelectedPeriod('week')}
          >
            Tuần này
          </button>
          <button 
            className={selectedPeriod === 'month' ? 'active' : ''}
            onClick={() => setSelectedPeriod('month')}
          >
            Tháng này
          </button>
          <button 
            className={selectedPeriod === 'year' ? 'active' : ''}
            onClick={() => setSelectedPeriod('year')}
          >
            Năm nay
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard 
          title="Doanh thu" 
          value={formatCurrency(stats.totalRevenue)} 
          icon={<FaDollarSign />} 
          color="#ee4d2d"
          subValue={`Hôm nay: ${formatCurrency(stats.todayRevenue)}`}
        />
        <StatCard 
          title="Đơn hàng" 
          value={formatNumber(stats.totalOrders)} 
          icon={<FaShoppingBag />} 
          color="#2563eb"
          subValue={`Tháng này: ${formatNumber(stats.thisMonthOrders || stats.totalOrders)}`}
        />
        <StatCard 
          title="Người dùng" 
          value={formatNumber(stats.totalUsers)} 
          icon={<FaUsers />} 
          color="#10b981"
        />
        <StatCard 
          title="Sản phẩm" 
          value={formatNumber(stats.totalProducts)} 
          icon={<FaBox />} 
          color="#8b5cf6"
        />
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <div className="chart-header">
            <h3>Biểu đồ doanh thu</h3>
            <FaChartLine />
          </div>
          <div className="chart-container">
            <Line data={revenueChartData} options={chartOptions} />
          </div>
        </div>
        <div className="chart-card">
          <div className="chart-header">
            <h3>Biểu đồ đơn hàng</h3>
            <FaShoppingBag />
          </div>
          <div className="chart-container">
            <Bar data={ordersChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="stats-row">
        <div className="chart-card half">
          <div className="chart-header">
            <h3>Trạng thái đơn hàng</h3>
            <FaCheckCircle />
          </div>
          <div className="pie-chart-container">
            <Pie data={orderStatusData} options={pieOptions} />
          </div>
          <div className="status-summary">
            <div className="status-item">
              <span className="status-dot pending"></span>
              <span>Chờ xác nhận: {stats.pendingOrders}</span>
            </div>
            <div className="status-item">
              <span className="status-dot processing"></span>
              <span>Đang xử lý: {stats.processingOrders}</span>
            </div>
            <div className="status-item">
              <span className="status-dot shipped"></span>
              <span>Đang giao: {stats.shippedOrders}</span>
            </div>
            <div className="status-item">
              <span className="status-dot delivered"></span>
              <span>Đã giao: {stats.deliveredOrders}</span>
            </div>
            <div className="status-item">
              <span className="status-dot cancelled"></span>
              <span>Đã hủy: {stats.cancelledOrders}</span>
            </div>
          </div>
        </div>

        <div className="chart-card half">
          <div className="chart-header">
            <h3>Sản phẩm bán chạy</h3>
            <FaFire />
          </div>
          <div className="top-products-list">
            {stats.topProducts?.length > 0 ? (
              stats.topProducts.map((product, index) => (
                <div key={product.id} className="top-product-item">
                  <div className="top-product-rank">#{index + 1}</div>
                  <div className="top-product-image">
                    <img src={product.image || '/default-figure.jpg'} alt={product.name} />
                  </div>
                  <div className="top-product-info">
                    <div className="top-product-name">{product.name}</div>
                    <div className="top-product-stats">
                      <span>Đã bán: {product.soldCount}</span>
                      <span>Doanh thu: {formatCurrency(product.revenue)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">Chưa có dữ liệu</div>
            )}
          </div>
        </div>
      </div>

      <div className="chart-card full">
        <div className="chart-header">
          <h3>Đánh giá gần đây</h3>
          <FaStar />
        </div>
        <div className="reviews-list">
          {stats.recentReviews?.length > 0 ? (
            <table className="reviews-table">
              <thead>
                <tr>
                  <th>Người dùng</th>
                  <th>Sản phẩm</th>
                  <th>Đánh giá</th>
                  <th>Nội dung</th>
                  <th>Ngày</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentReviews.map(review => (
                  <tr key={review.id}>
                    <td>{review.username}</td>
                    <td>{review.productName}</td>
                    <td>
                      <div className="review-stars">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < review.rating ? 'star filled' : 'star'}>★</span>
                        ))}
                      </div>
                    </td>
                    <td className="review-content">{review.content?.substring(0, 50)}...</td>
                    <td>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-data">Chưa có đánh giá nào</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;