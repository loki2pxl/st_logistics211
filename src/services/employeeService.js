// src/services/employeeService.js
import { supabase } from '../config/supabase';

/**
 * Get all employees for a branch
 */
export const getEmployees = async (branch) => {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('branch', branch);
  
  if (error) throw error;
  return data || [];
};

/**
 * Get employee by ID
 */
export const getEmployeeById = async (id) => {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Create new employee
 */
export const createEmployee = async (employeeData) => {
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
};

/**
 * Submit work report
 */
export const submitWorkReport = async (reportData) => {
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