// src/services/expenseService.js
import { supabase } from '../config/supabase';

/**
 * Get all expenses for a branch
 */
export const getExpenses = async (branch) => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('branch', branch)
    .order('date', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

/**
 * Get expenses by employee
 */
export const getExpensesByEmployee = async (employeeId) => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('paid_by_employee_id', employeeId)
    .order('date', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

/**
 * Create expense
 */
export const createExpense = async (expenseData) => {
  const { data, error } = await supabase
    .from('expenses')
    .insert([expenseData])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Update expense
 */
export const updateExpense = async (id, expenseData) => {
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
};

// ============================================================================
// DRIVER-SPECIFIC METHODS (for LaiXe portal)
// ============================================================================

/**
 * Get employee's fuel expenses
 */
export const getEmployeeExpenses = async (employeeId, days = 7) => {
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
};

/**
 * Create fuel expense (for drivers)
 */
export const createFuelExpense = async (expenseData) => {
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
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
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