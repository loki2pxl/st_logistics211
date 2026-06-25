// src/services/coordinationService.js
// ============================================================================
// COORDINATION DATABASE SERVICE WITH MOCK FALLBACK
// ============================================================================

import { supabase, isDatabaseEnabled } from '../config/supabase';
import * as mockService from '../data/dataService';

/**
 * Get all coordinations for a branch
 */
export const getCoordinations = async (branch) => {
  if (!isDatabaseEnabled()) {
    return mockService.getCoordinations(branch);
  }

  try {
    const { data, error } = await supabase
      .from('coordinations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn("Live DB getCoordinations failed, falling back to mock:", err.message);
    return mockService.getCoordinations(branch);
  }
};

/**
 * Get coordination logs created by a coordinator
 */
export const getCoordinatorLogs = async (coordinatorId, days = 7) => {
  if (!isDatabaseEnabled()) {
    return mockService.getCoordinatorLogs(coordinatorId, days);
  }

  try {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const { data, error } = await supabase
      .from('coordinations')
      .select('*')
      .eq('coordinator_id', coordinatorId)
      .gte('date', fromDate.toISOString().split('T')[0])
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn("Live DB getCoordinatorLogs failed, falling back to mock:", err.message);
    return mockService.getCoordinatorLogs(coordinatorId, days);
  }
};

/**
 * Submit a new railway coordination entry
 */
export const submitCoordination = async (coordData) => {
  if (!isDatabaseEnabled()) {
    return mockService.addCoordination(coordData);
  }

  try {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('coordinations')
      .insert([
        {
          order_code: coordData.order_code,
          customer_name: coordData.customer_name,
          customer_phone: coordData.customer_phone,
          delivery_address: coordData.delivery_address,
          product_type: coordData.product_type,
          package_count: parseInt(coordData.package_count) || 0,
          container_no: coordData.container_no || null,
          wagon_no: coordData.wagon_no || null,
          train_no: coordData.train_no || null,
          driver_id: coordData.driver_id || null,
          driver_name: coordData.driver_name || null,
          vehicle_plate: coordData.vehicle_plate || null,
          cargo_weight: parseFloat(coordData.cargo_weight) || 0.00,
          fees_due: parseFloat(coordData.fees_due) || 0.00,
          coordinator_id: coordData.coordinator_id,
          coordinator_name: coordData.coordinator_name,
          date: today,
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("Live DB submitCoordination failed, falling back to mock:", err.message);
    return mockService.addCoordination(coordData);
  }
};

/**
 * Update coordination status
 */
export const updateStatus = async (id, status) => {
  if (!isDatabaseEnabled() || typeof id === 'number') {
    return mockService.updateCoordinationStatus(id, status);
  }

  try {
    const { data, error } = await supabase
      .from('coordinations')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("Live DB updateStatus failed, falling back to mock:", err.message);
    return mockService.updateCoordinationStatus(id, status);
  }
};

const coordinationService = {
  getCoordinations,
  getCoordinatorLogs,
  submitCoordination,
  updateStatus
};

export default coordinationService;
