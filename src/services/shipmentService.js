// src/services/shipmentService.js
// ============================================================================
// SHIPMENT DATABASE SERVICE
// ============================================================================

import { supabase } from '../config/supabase';

/**
 * Get all shipments for a branch
 */
export const getShipments = async (branch) => {
  const { data, error } = await supabase
    .from('shipments')
    .select('*')
    .eq('branch', branch)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

/**
 * Get shipment by ID
 */
export const getShipmentById = async (id) => {
  const { data, error } = await supabase
    .from('shipments')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Create new shipment
 */
export const createShipment = async (shipmentData) => {
  const { data, error } = await supabase
    .from('shipments')
    .insert([shipmentData])
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Update shipment
 */
export const updateShipment = async (id, updates) => {
  const { data, error } = await supabase
    .from('shipments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Update shipment status
 */
export const updateShipmentStatus = async (id, status) => {
  return updateShipment(id, { status });
};

/**
 * Delete shipment
 */
export const deleteShipment = async (id) => {
  const { error } = await supabase
    .from('shipments')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};