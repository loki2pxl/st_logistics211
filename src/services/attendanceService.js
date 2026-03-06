// src/services/attendanceService.js
// ============================================================================
// ATTENDANCE DATABASE SERVICE
// ============================================================================

import { supabase } from '../config/supabase';

/**
 * Get attendance records for a branch
 */
export const getAttendance = async (branch) => {
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('branch', branch)
    .order('date', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

/**
 * Get attendance for a specific employee
 */
export const getAttendanceByEmployee = async (employeeId) => {
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('employee_id', employeeId)
    .order('date', { ascending: false })
    .limit(10);
  
  if (error) throw error;
  return data || [];
};

/**
 * Add attendance record (check-in)
 */
export const addAttendance = async (attendanceData) => {
  const { data, error } = await supabase
    .from('attendance')
    .insert([attendanceData])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Update attendance (check-out)
 */
export const updateAttendance = async (id, updates) => {
  const { data, error } = await supabase
    .from('attendance')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Delete attendance record
 */
export const deleteAttendance = async (id) => {
  const { error } = await supabase
    .from('attendance')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};

/**
 * Get today's attendance for employee
 */
export const getTodayAttendance = async (employeeId) => {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('employee_id', employeeId)
    .eq('date', today)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error; // Ignore "not found" error
  return data;
};