// src/services/attendanceService.js
// ============================================================================
// ATTENDANCE SERVICE WITH MOCK FALLBACK
// ============================================================================

import { supabase, isDatabaseEnabled } from '../config/supabase';
import * as mockService from '../data/dataService';

/**
 * Get today's attendance for an employee
 */
export const getTodayAttendance = async (employeeId) => {
  if (!isDatabaseEnabled()) {
    return mockService.getTodayAttendance(employeeId);
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('date', today)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (err) {
    console.warn("Live DB attendance check failed, falling back to mock:", err.message);
    return mockService.getTodayAttendance(employeeId);
  }
};

/**
 * Check in an employee
 */
export const checkIn = async (employeeId, employeeName, group, branch) => {
  if (!isDatabaseEnabled()) {
    return mockService.addAttendance({ employee_id: employeeId, employee_name: employeeName, group, branch, check_in: new Date().toTimeString().slice(0, 5) });
  }

  try {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const currentDate = now.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('attendance')
      .insert([{
        employee_id: employeeId,
        employee_name: employeeName,
        group: group,
        branch: branch,
        date: currentDate,
        check_in: currentTime,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("Live DB check-in failed, falling back to mock:", err.message);
    return mockService.addAttendance({ employee_id: employeeId, employee_name: employeeName, group, branch, check_in: new Date().toTimeString().slice(0, 5) });
  }
};

/**
 * Check out an employee
 */
export const checkOut = async (attendanceId) => {
  if (!isDatabaseEnabled() || typeof attendanceId === 'number') {
    // Mock records use numeric IDs
    return mockService.updateAttendanceCheckout(attendanceId, new Date().toTimeString().slice(0, 5));
  }

  try {
    const currentTime = new Date().toTimeString().slice(0, 5);

    const { data, error } = await supabase
      .from('attendance')
      .update({ check_out: currentTime })
      .eq('id', attendanceId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("Live DB check-out failed, falling back to mock:", err.message);
    return mockService.updateAttendanceCheckout(attendanceId, new Date().toTimeString().slice(0, 5));
  }
};

/**
 * Get employee attendance history
 */
export const getEmployeeHistory = async (employeeId, days = 7) => {
  if (!isDatabaseEnabled()) {
    return mockService.getEmployeeHistory(employeeId, days);
  }

  try {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', employeeId)
      .gte('date', fromDate.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn("Live DB history check failed, falling back to mock:", err.message);
    return mockService.getEmployeeHistory(employeeId, days);
  }
};

/**
 * Get all attendance for a branch
 */
export const getAttendanceByBranch = async (branch, date) => {
  if (!isDatabaseEnabled()) {
    return mockService.getAttendance(branch, date);
  }

  try {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('branch', branch)
      .eq('date', date)
      .order('check_in', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn("Live DB branch attendance failed, falling back to mock:", err.message);
    return mockService.getAttendance(branch, date);
  }
};

const attendanceService = {
  getTodayAttendance,
  checkIn,
  checkOut,
  getEmployeeHistory,
  getAttendanceByBranch,
};

export default attendanceService;