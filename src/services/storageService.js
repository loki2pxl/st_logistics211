// src/services/storageService.js
// ============================================================================
// FILE STORAGE SERVICE
// ============================================================================

import { supabase } from '../config/supabase';

/**
 * Upload file to Supabase Storage
 */
export const uploadFile = async (file, bucket = 'invoices', folder = '') => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = folder ? `${folder}/${fileName}` : fileName;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (error) {
    console.error('Upload error:', error);
    throw error;
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return urlData.publicUrl;
};

/**
 * Upload multiple files
 */
export const uploadMultipleFiles = async (files, bucket = 'invoices', folder = '') => {
  const uploadPromises = Array.from(files).map(file => 
    uploadFile(file, bucket, folder)
  );
  
  return Promise.all(uploadPromises);
};

/**
 * Delete file from storage
 */
export const deleteFile = async (filePath, bucket = 'invoices') => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath]);

  if (error) {
    console.error('Delete error:', error);
    throw error;
  }

  return true;
};

/**
 * Get file URL
 */
export const getFileUrl = (filePath, bucket = 'invoices') => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return data.publicUrl;
};