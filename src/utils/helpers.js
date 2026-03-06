// src/utils/helpers.js
// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format date to Vietnamese format
 */
export const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('vi-VN');
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Vừa xong';
  if (diffMins < 60) return `${diffMins} phút trước`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} ngày trước`;
};

/**
 * Calculate hours between two times
 */
export const calculateHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return '-';
  
  const [inH, inM] = checkIn.split(':').map(Number);
  const [outH, outM] = checkOut.split(':').map(Number);
  
  const totalMins = (outH * 60 + outM) - (inH * 60 + inM);
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  
  return `${hours}h ${mins}m`;
};

/**
 * Get role label in Vietnamese
 */
export const getRoleLabel = (role) => {
  const labels = {
    'admin': 'Quản trị viên',
    'boc-xep': 'Nhân viên bốc xếp',
    'lai-xe': 'Lái xe',
    'van-phong': 'Nhân viên văn phòng',
    'khac': 'Nhân viên khác',
  };
  return labels[role] || role;
};

/**
 * Get status label in Vietnamese
 */
export const getStatusLabel = (status) => {
  const labels = {
    pending: 'Chờ xử lý',
    shipping: 'Đang vận chuyển',
    delivered: 'Đã giao',
    paid: 'Đã thanh toán',
    unpaid: 'Chưa thanh toán',
  };
  return labels[status] || status;
};

/**
 * Get group style (color)
 */
export const getGroupStyle = (group) => {
  const colors = {
    'boc-xep': '#8b5cf6',
    'lai-xe': '#3b82f6',
    'van-phong': '#10b981',
    'khac': '#f59e0b',
  };
  return {
    color: colors[group] || '#64748b',
    fontWeight: 600,
  };
};

/**
 * Get status badge style
 */
export const getStatusBadge = (status) => {
  const styles = {
    pending: { background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' },
    shipping: { background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' },
    delivered: { background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' },
  };
  
  return {
    ...styles[status],
    padding: '0.375rem 0.875rem',
    borderRadius: '2rem',
    fontSize: '0.8125rem',
    fontWeight: 700,
    display: 'inline-block',
  };
};

/**
 * Format currency (VND)
 */
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '-';
  return `₫${parseInt(amount).toLocaleString('vi-VN')}`;
};

/**
 * Format currency in millions
 */
export const formatCurrencyMillion = (amount) => {
  if (!amount && amount !== 0) return '₫0M';
  return `₫${(amount / 1000000).toFixed(1)}M`;
};