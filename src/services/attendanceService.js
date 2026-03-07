// src/services/attendanceService.js
import { supabase } from '../config/supabase';

/**
 * Get today's attendance for an employee
 */
export const getTodayAttendance = async (employeeId) => {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('employee_id', employeeId)
    .eq('date', today)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

/**
 * Check in an employee
 */
export const checkIn = async (employeeId, employeeName, group, branch) => {
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
};

/**
 * Check out an employee
 */
export const checkOut = async (attendanceId) => {
  const currentTime = new Date().toTimeString().slice(0, 5);

  const { data, error } = await supabase
    .from('attendance')
    .update({ check_out: currentTime })
    .eq('id', attendanceId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Get employee attendance history
 */
export const getEmployeeHistory = async (employeeId, days = 7) => {
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
};

/**
 * Get all attendance for a branch
 */
export const getAttendanceByBranch = async (branch, date) => {
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('branch', branch)
    .eq('date', date)
    .order('check_in', { ascending: true });

  if (error) throw error;
  return data || [];
};

const attendanceService = {
  getTodayAttendance,
  checkIn,
  checkOut,
  getEmployeeHistory,
  getAttendanceByBranch,
};

export default attendanceService;