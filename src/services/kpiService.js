// src/services/kpiService.js
// ============================================================================
// KPI DATABASE SERVICE
// ============================================================================

import { supabase } from '../config/supabase';

/**
 * Get all KPI records for a branch
 */
export const getKPI = async (branch) => {
  const { data, error } = await supabase
    .from('kpi')
    .select('*, employees(*)')
    .eq('branch', branch)
    .order('month', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

/**
 * Get KPI by employee and month
 */
export const getKPIByEmployeeMonth = async (employeeId, month) => {
  const { data, error } = await supabase
    .from('kpi')
    .select('*, employees(*)')
    .eq('employee_id', employeeId)
    .eq('month', month)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

/**
 * Create or update KPI
 */
export const upsertKPI = async (kpiData) => {
  const { data, error } = await supabase
    .from('kpi')
    .upsert([kpiData], { onConflict: 'employee_id,month' })
    .select('*, employees(*)')
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Delete KPI record
 */
export const deleteKPI = async (id) => {
  const { error } = await supabase
    .from('kpi')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};

/**
 * Calculate total salary
 */
export const calculateTotalSalary = (kpiRecord) => {
  const { base_salary = 0, bonus = 0, deductions = 0 } = kpiRecord;
  return base_salary + bonus - deductions;
};