// src/services/expenseService.js
// ============================================================================
// EXPENSE DATABASE SERVICE
// ============================================================================

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
export const getExpensesByEmployee = async (employeeName) => {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('paid_by', employeeName)
    .order('date', { ascending: false })
    .limit(10);
  
  if (error) throw error;
  return data || [];
};

/**
 * Create new expense
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
export const updateExpense = async (id, updates) => {
  const { data, error } = await supabase
    .from('expenses')
    .update(updates)
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
  return updateExpense(id, {
    approved: true,
    approved_by: approvedBy,
    approved_at: new Date().toISOString(),
  });
};