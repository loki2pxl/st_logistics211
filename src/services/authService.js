// src/services/authService.js
// ============================================================================
// AUTHENTICATION SERVICE
// ============================================================================

import { supabase } from '../config/supabase';

/**
 * Login user
 */
export const login = async (username, password) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .eq('password', password)
    .single();

  if (error || !data) {
    throw new Error('Tên đăng nhập hoặc mật khẩu không đúng!');
  }

  // Update last login
  await supabase
    .from('users')
    .update({ last_login: new Date().toISOString() })
    .eq('id', data.id);

  return data;
};

/**
 * Save user session to localStorage
 */
export const saveSession = (userData) => {
  localStorage.setItem('logistics_user', JSON.stringify(userData));
};

/**
 * Get user session from localStorage
 */
export const getSession = () => {
  const savedUser = localStorage.getItem('logistics_user');
  return savedUser ? JSON.parse(savedUser) : null;
};

/**
 * Clear user session
 */
export const clearSession = () => {
  localStorage.removeItem('logistics_user');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getSession();
};

/**
 * Check if user is admin
 */
export const isAdmin = (user) => {
  return user && user.role === 'admin';
};