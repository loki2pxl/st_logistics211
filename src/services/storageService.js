// src/services/storageService.js
import { supabase } from '../config/supabase';

/**
 * Upload a single file to Supabase Storage
 */
export const uploadFile = async (file, bucket = 'invoices') => {
  if (!file) return null;

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = fileName;

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
export const uploadMultipleFiles = async (files, bucket = 'invoices') => {
  if (!files || files.length === 0) return [];

  const uploadPromises = files.map(file => uploadFile(file, bucket));
  const results = await Promise.allSettled(uploadPromises);

  return results
    .filter(result => result.status === 'fulfilled')
    .map(result => result.value);
};

/**
 * Delete a file from storage
 */
export const deleteFile = async (filePath, bucket = 'invoices') => {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath]);

  if (error) throw error;
  return true;
};

/**
 * Get public URL of a file
 */
export const getFileUrl = async (filePath, bucket = 'invoices') => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return data.publicUrl;
};

const storageService = {
  uploadFile,
  uploadMultipleFiles,
  deleteFile,
  getFileUrl,
};

export default storageService;