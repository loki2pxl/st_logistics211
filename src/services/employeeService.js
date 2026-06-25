// src/services/employeeService.js
// ============================================================================
// EMPLOYEE SERVICE WITH MOCK FALLBACK
// ============================================================================

import { supabase, isDatabaseEnabled } from '../config/supabase';
import * as mockService from '../data/dataService';

/**
 * Get all employees for a branch
 */
export const getEmployees = async (branch) => {
  if (!isDatabaseEnabled()) {
    return mockService.getEmployees(branch);
  }

  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('branch', branch);
    
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn("Live DB getEmployees failed, falling back to mock:", err.message);
    return mockService.getEmployees(branch);
  }
};

/**
 * Get employee by ID
 */
export const getEmployeeById = async (id) => {
  if (!isDatabaseEnabled()) {
    const list = await mockService.getEmployees();
    return list.find(emp => emp.id === id || emp.employee_id === id) || null;
  }

  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("Live DB getEmployeeById failed, falling back to mock:", err.message);
    const list = await mockService.getEmployees();
    return list.find(emp => emp.id === id || emp.employee_id === id) || null;
  }
};

/**
 * Create new employee
 */
export const createEmployee = async (employeeData) => {
  if (!isDatabaseEnabled()) {
    throw new Error("Tạo nhân viên mới chưa hỗ trợ ở chế độ Demo.");
  }

  const { data, error } = await supabase
    .from('employees')
    .insert([employeeData])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Update employee
 */
export const updateEmployee = async (id, employeeData) => {
  if (!isDatabaseEnabled()) {
    throw new Error("Cập nhật nhân viên chưa hỗ trợ ở chế độ Demo.");
  }

  const { data, error } = await supabase
    .from('employees')
    .update(employeeData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Delete employee
 */
export const deleteEmployee = async (id) => {
  if (!isDatabaseEnabled()) {
    throw new Error("Xóa nhân viên chưa hỗ trợ ở chế độ Demo.");
  }

  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};

// ============================================================================
// WORK REPORTS (for BocXep portal)
// ============================================================================

/**
 * Get work reports for an employee
 */
export const getWorkReports = async (employeeId, days = 7) => {
  if (!isDatabaseEnabled()) {
    return mockService.getWorkReports(employeeId, days);
  }

  try {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const { data, error } = await supabase
      .from('work_reports')
      .select('*')
      .eq('employee_id', employeeId)
      .gte('date', fromDate.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn("Live DB getWorkReports failed, falling back to mock:", err.message);
    return mockService.getWorkReports(employeeId, days);
  }
};

/**
 * Submit work report
 */
export const submitWorkReport = async (reportData) => {
  if (!isDatabaseEnabled()) {
    return mockService.addWorkReport(reportData);
  }

  try {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('work_reports')
      .upsert([
        {
          employee_id: reportData.employee_id,
          employee_name: reportData.employee_name,
          branch: reportData.branch,
          date: today,
          container_count: parseInt(reportData.container_count) || 0,
          total_weight: parseFloat(reportData.total_weight) || 0,
          cargo_type: reportData.cargo_type || null,
          work_area: reportData.work_area || null,
          notes: reportData.notes || null,
        }
      ], {
        onConflict: 'employee_id,date'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("Live DB submitWorkReport failed, falling back to mock:", err.message);
    return mockService.addWorkReport(reportData);
  }
};

const employeeService = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getWorkReports,
  submitWorkReport,
};

export default employeeService;