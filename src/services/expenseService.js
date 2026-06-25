// src/services/expenseService.js
// ============================================================================
// EXPENSE SERVICE WITH MOCK FALLBACK
// ============================================================================

import { supabase, isDatabaseEnabled } from '../config/supabase';
import * as mockService from '../data/dataService';

/**
 * Get all expenses for a branch
 */
export const getExpenses = async (branch) => {
  if (!isDatabaseEnabled()) {
    return mockService.getExpenses(branch);
  }

  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('branch', branch)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn("Live DB getExpenses failed, falling back to mock:", err.message);
    return mockService.getExpenses(branch);
  }
};

/**
 * Get expenses by employee
 */
export const getExpensesByEmployee = async (employeeId) => {
  if (!isDatabaseEnabled()) {
    return mockService.getExpensesByEmployee(employeeId);
  }

  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('paid_by_employee_id', employeeId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn("Live DB getExpensesByEmployee failed, falling back to mock:", err.message);
    return mockService.getExpensesByEmployee(employeeId);
  }
};

/**
 * Create expense
 */
export const createExpense = async (expenseData) => {
  if (!isDatabaseEnabled()) {
    return mockService.addExpense(expenseData);
  }

  try {
    const { data, error } = await supabase
      .from('expenses')
      .insert([expenseData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("Live DB createExpense failed, falling back to mock:", err.message);
    return mockService.addExpense(expenseData);
  }
};

/**
 * Update expense
 */
export const updateExpense = async (id, expenseData) => {
  if (!isDatabaseEnabled()) {
    throw new Error("Cập nhật chi phí chưa hỗ trợ ở chế độ Demo.");
  }

  const { data, error } = await supabase
    .from('expenses')
    .update(expenseData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Delete expense
 */
export const deleteExpense = async (id) => {
  if (!isDatabaseEnabled()) {
    throw new Error("Xóa chi phí chưa hỗ trợ ở chế độ Demo.");
  }

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};

/**
 * Approve expense
 */
export const approveExpense = async (id, approvedBy) => {
  if (!isDatabaseEnabled() || typeof id === 'number') {
    return mockService.approveExpense(id, approvedBy);
  }

  try {
    const { data, error } = await supabase
      .from('expenses')
      .update({ 
        approved: true,
        approved_by: approvedBy,
        approved_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("Live DB approveExpense failed, falling back to mock:", err.message);
    return mockService.approveExpense(id, approvedBy);
  }
};

// ============================================================================
// DRIVER-SPECIFIC METHODS (for LaiXe portal)
// ============================================================================

/**
 * Get employee's fuel expenses
 */
export const getEmployeeExpenses = async (employeeId, days = 7) => {
  if (!isDatabaseEnabled()) {
    return mockService.getEmployeeExpenses(employeeId, days);
  }

  try {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('paid_by_employee_id', employeeId)
      .gte('date', fromDate.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn("Live DB getEmployeeExpenses failed, falling back to mock:", err.message);
    return mockService.getEmployeeExpenses(employeeId, days);
  }
};

/**
 * Create fuel expense (for drivers)
 */
export const createFuelExpense = async (expenseData) => {
  if (!isDatabaseEnabled()) {
    return mockService.addExpense({
      ...expenseData,
      type: 'fuel',
      approved: false
    });
  }

  try {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('expenses')
      .insert([
        {
          employee_id: expenseData.employee_id,
          paid_by: expenseData.paid_by,
          paid_by_employee_id: expenseData.employee_id,
          branch: expenseData.branch,
          date: today,
          type: 'fuel',
          amount: expenseData.amount,
          description: expenseData.description,
          invoice_urls: expenseData.invoice_urls || [],
          // Custom fields
          fuel_liters: expenseData.fuel_liters,
          vehicle_plate: expenseData.vehicle_plate,
          order_code: expenseData.order_code,
          approved: false
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("Live DB createFuelExpense failed, falling back to mock:", err.message);
    return mockService.addExpense({
      ...expenseData,
      type: 'fuel',
      approved: false
    });
  }
};

const expenseService = {
  getExpenses,
  getExpensesByEmployee,
  createExpense,
  updateExpense,
  deleteExpense,
  approveExpense,
  getEmployeeExpenses,
  createFuelExpense,
};

export default expenseService;