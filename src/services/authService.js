// src/services/authService.js
// ============================================================================
// AUTHENTICATION SERVICE WITH MOCK FALLBACK
// ============================================================================

import { supabase, isDatabaseEnabled } from '../config/supabase';
import * as mockService from '../data/dataService';

/**
 * Login user
 */
export const login = async (usernameOrEmail, password) => {
  if (!isDatabaseEnabled()) {
    return mockService.login(usernameOrEmail, password);
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`username.eq."${usernameOrEmail}",email.eq."${usernameOrEmail}"`)
      .eq('password', password)
      .single();

    if (error || !data) {
      throw new Error('Tên đăng nhập hoặc mật khẩu không đúng!');
    }

    // Update last login
    try {
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.id);
    } catch (e) {
      console.warn("Could not update last login in live DB:", e);
    }

    return data;
  } catch (err) {
    console.warn("Live DB login failed, falling back to mock database:", err.message);
    return mockService.login(usernameOrEmail, password);
  }
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