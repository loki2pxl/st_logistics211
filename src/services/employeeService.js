// src/services/employeeService.js
// ============================================================================
// EMPLOYEE DATABASE SERVICE
// ============================================================================

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