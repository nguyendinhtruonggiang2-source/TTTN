// src/pages/ProductReviews.jsx
import React, { useEffect, useState } from 'react';
import { FaCalendar, FaCheckCircle, FaRegStar, FaRegThumbsUp, FaSpinner, FaStar, FaThumbsUp, FaUser } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import '../styles/ProductReviews.css';

const ProductReviews = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0, ratingDistribution: {} });
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [userReview, setUserReview] = useState(null);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, content: '', images: [] });
  const [submitting, setSubmitting] = useState(false);
  const [likedReviews, setLikedReviews] = useState({});
  
  const isAuthenticated = !!localStorage.getItem('token');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchReviews();
    fetchStats();
    if (isAuthenticated) {
      fetchUserReview();
    }
  }, [id, filterRating, currentPage]);

  const fetchReviews = async () => {
    try {
      const url = filterRating > 0 
        ? `/reviews/figure/${id}?page=${currentPage}&size=10&rating=${filterRating}`
        : `/reviews/figure/${id}?page=${currentPage}&size=10`;
      const response = await axiosClient.get(url);
      setReviews(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axiosClient.get(`/reviews/figure/${id}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUserReview = async () => {
    try {
      const response = await axiosClient.get(`/reviews/figure/${id}/user`);
      if (response.data) {
        setUserReview(response.data);
      }
    } catch (error) {
      console.error('Error fetching user review:', error);
    }
  };

  const handleLikeReview = async (reviewId) => {
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để thích đánh giá');
      navigate('/login');
      return;
    }
    
    try {
      await axiosClient.post(`/reviews/${reviewId}/like`);
      setLikedReviews(prev => ({ ...prev, [reviewId]: true }));
      setReviews(prev => prev.map(r => 
        r.id === reviewId ? { ...r, likes: (r.likes || 0) + 1 } : r
      ));
    } catch (error) {
      console.error('Error liking review:', error);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.content.trim()) {
      alert('Vui lòng nhập nội dung đánh giá');
      return;
    }
    
    setSubmitting(true);
    try {
      const reviewData = {
        figureId: parseInt(id),
        rating: reviewForm.rating,
        content: reviewForm.content,
        images: reviewForm.images
      };
      
      await axiosClient.post('/reviews', reviewData);
      alert('✅ Đã gửi đánh giá thành công!');
      setShowWriteReview(false);
      setReviewForm({ rating: 5, content: '', images: [] });
      fetchReviews();
      fetchStats();
      fetchUserReview();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error.response?.data?.error || '❌ Gửi đánh giá thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          className={`star-btn ${i <= rating ? 'active' : ''}`}
          onClick={() => interactive && onRatingChange && onRatingChange(i)}
          disabled={!interactive}
        >
          {i <= rating ? <FaStar /> : <FaRegStar />}
        </button>
      );
    }
    return stars;
  };

  const getRatingPercentage = (count) => {
    if (stats.totalReviews === 0) return 0;
    return (count / stats.totalReviews) * 100;
  };

  if (loading) {
    return (
      <div className="reviews-loading">
        <FaSpinner className="spinner" />
        <p>Đang tải đánh giá...</p>
      </div>
    );
  }

  return (
    <div className="product-reviews-container">
      <div className="reviews-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Quay lại
        </button>
        <h1>Đánh giá sản phẩm</h1>
      </div>

      {/* Rating Summary */}
      <div className="rating-summary">
        <div className="summary-left">
          <div className="average-rating">{stats.averageRating?.toFixed(1) || 0}</div>
          <div className="stars-display">{renderStars(Math.floor(stats.averageRating || 0))}</div>
          <div className="total-reviews">{stats.totalReviews} đánh giá</div>
        </div>
        <div className="summary-right">
          {[5,4,3,2,1].map(rating => (
            <div key={rating} className="rating-bar-row">
              <span className="rating-label">{rating} sao</span>
              <div className="rating-bar">
                <div 
                  className="rating-bar-fill" 
                  style={{ width: `${getRatingPercentage(stats.ratingDistribution?.[rating] || 0)}%` }}
                />
              </div>
              <span className="rating-count">{stats.ratingDistribution?.[rating] || 0}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Write Review */}
      <div className="reviews-toolbar">
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filterRating === 0 ? 'active' : ''}`}
            onClick={() => setFilterRating(0)}
          >
            Tất cả
          </button>
          {[5,4,3,2,1].map(rating => (
            <button 
              key={rating}
              className={`filter-btn ${filterRating === rating ? 'active' : ''}`}
              onClick={() => setFilterRating(rating)}
            >
              {rating} sao
            </button>
          ))}
        </div>
        {isAuthenticated && !userReview && (
          <button className="write-review-btn" onClick={() => setShowWriteReview(true)}>
            ✍️ Viết đánh giá
          </button>
        )}
        {userReview && (
          <div className="user-reviewed-badge">
            <FaCheckCircle /> Bạn đã đánh giá sản phẩm này
          </div>
        )}
      </div>

      {/* Write Review Form */}
      {showWriteReview && (
        <div className="write-review-form">
          <h3>Viết đánh giá của bạn</h3>
          <form onSubmit={handleSubmitReview}>
            <div className="form-rating">
              <label>Đánh giá của bạn:</label>
              <div className="rating-input">
                {renderStars(reviewForm.rating, true, (rating) => setReviewForm({...reviewForm, rating}))}
              </div>
            </div>
            <div className="form-content">
              <textarea
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                rows="5"
                value={reviewForm.content}
                onChange={(e) => setReviewForm({...reviewForm, content: e.target.value})}
              />
            </div>
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={() => setShowWriteReview(false)}>Hủy</button>
              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? <FaSpinner className="spinner" /> : 'Gửi đánh giá'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="reviews-list">
        {reviews.length === 0 ? (
          <div className="no-reviews">
            <p>Chưa có đánh giá nào cho sản phẩm này.</p>
            <p>Hãy là người đầu tiên đánh giá!</p>
          </div>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  <div className="reviewer-avatar">
                    {review.userAvatar ? <img src={review.userAvatar} alt="" /> : <FaUser />}
                  </div>
                  <div className="reviewer-details">
                    <span className="reviewer-name">{review.username}</span>
                    <div className="review-rating">{renderStars(review.rating)}</div>
                  </div>
                </div>
                <div className="review-date">
                  <FaCalendar /> {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                </div>
              </div>
              <div className="review-content">
                <p>{review.content}</p>
              </div>
              {review.images && review.images.length > 0 && (
                <div className="review-images">
                  {review.images.map((img, idx) => (
                    <img key={idx} src={img} alt={`Review ${idx + 1}`} />
                  ))}
                </div>
              )}
              <div className="review-footer">
                <button 
                  className={`like-btn ${likedReviews[review.id] ? 'liked' : ''}`}
                  onClick={() => handleLikeReview(review.id)}
                >
                  {likedReviews[review.id] ? <FaThumbsUp /> : <FaRegThumbsUp />}
                  <span>Hữu ích ({review.likes || 0})</span>
                </button>
                {review.isVerifiedPurchase && (
                  <span className="verified-badge">
                    <FaCheckCircle /> Đã mua hàng
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={currentPage === 0} onClick={() => setCurrentPage(prev => prev - 1)}>‹ Trước</button>
          {[...Array(totalPages)].map((_, i) => (
            <button key={i} className={currentPage === i ? 'active' : ''} onClick={() => setCurrentPage(i)}>
              {i + 1}
            </button>
          ))}
          <button disabled={currentPage === totalPages - 1} onClick={() => setCurrentPage(prev => prev + 1)}>Sau ›</button>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;