// src/services/kpiService.js
// ============================================================================
// KPI DATABASE SERVICE WITH MOCK FALLBACK
// ============================================================================

import { supabase, isDatabaseEnabled } from '../config/supabase';
import * as mockService from '../data/dataService';

/**
 * Get all KPI records for a branch
 */
export const getKPI = async (branch) => {
  if (!isDatabaseEnabled()) {
    return mockService.getKPI(branch);
  }

  try {
    const { data, error } = await supabase
      .from('kpi')
      .select('*, employees(*)')
      .eq('branch', branch)
      .order('month', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn("Live DB getKPI failed, falling back to mock:", err.message);
    return mockService.getKPI(branch);
  }
};

/**
 * Get KPI by employee and month
 */
export const getKPIByEmployeeMonth = async (employeeId, month) => {
  if (!isDatabaseEnabled()) {
    return mockService.getKPIByEmployeeMonth(employeeId, month);
  }

  try {
    const { data, error } = await supabase
      .from('kpi')
      .select('*, employees(*)')
      .eq('employee_id', employeeId)
      .eq('month', month)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (err) {
    console.warn("Live DB getKPIByEmployeeMonth failed, falling back to mock:", err.message);
    return mockService.getKPIByEmployeeMonth(employeeId, month);
  }
};

/**
 * Create or update KPI
 */
export const upsertKPI = async (kpiData) => {
  if (!isDatabaseEnabled()) {
    return mockService.upsertKPI(kpiData);
  }

  try {
    const { data, error } = await supabase
      .from('kpi')
      .upsert([kpiData], { onConflict: 'employee_id,month' })
      .select('*, employees(*)')
      .single();
    
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("Live DB upsertKPI failed, falling back to mock:", err.message);
    return mockService.upsertKPI(kpiData);
  }
};

/**
 * Delete KPI record
 */
export const deleteKPI = async (id) => {
  if (!isDatabaseEnabled()) {
    throw new Error("Xóa KPI chưa hỗ trợ ở chế độ Demo.");
  }

  try {
    const { error } = await supabase
      .from('kpi')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn("Live DB deleteKPI failed:", err.message);
    throw err;
  }
};

/**
 * Calculate total salary
 */
export const calculateTotalSalary = (kpiRecord) => {
  const { base_salary = 0, bonus = 0, deductions = 0 } = kpiRecord;
  return base_salary + bonus - deductions;
};

const kpiService = {
  getKPI,
  getKPIByEmployeeMonth,
  upsertKPI,
  deleteKPI,
  calculateTotalSalary
};

export default kpiService;