// src/services/shipmentService.js
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
export const updateShipment = async (id, shipmentData) => {
  const { data, error } = await supabase
    .from('shipments')
    .update(shipmentData)
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
  const { data, error } = await supabase
    .from('shipments')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
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

// ============================================================================
// DRIVER-SPECIFIC METHODS (for LaiXe portal)
// ============================================================================

/**
 * Get shipments assigned to a driver
 */
export const getDriverShipments = async (driverId, days = 7) => {
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);

  const { data, error } = await supabase
    .from('shipments')
    .select('*')
    .eq('driver_id', driverId)
    .gte('date', fromDate.toISOString().split('T')[0])
    .order('date', { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * Create/update driver trip
 */
export const createDriverTrip = async (tripData) => {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('shipments')
    .upsert([
      {
        order_code: tripData.order_code,
        driver_id: tripData.driver_id,
        driver_name: tripData.driver_name,
        branch: tripData.branch,
        date: today,
        vehicle_plate: tripData.vehicle_plate,
        from_location: tripData.from_location,
        to_location: tripData.to_location,
        distance_km: tripData.distance_km,
        status: tripData.delivery_status,
        notes: tripData.notes,
        customer: tripData.customer || 'N/A', // Required field
        work_days: 1,
        price: 0,
        vehicle: 'truck',
        payment_status: 'unpaid',
      }
    ], {
      onConflict: 'order_code'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

const shipmentService = {
  getShipments,
  getShipmentById,
  createShipment,
  updateShipment,
  updateShipmentStatus,
  deleteShipment,
  getDriverShipments,
  createDriverTrip,
};

export default shipmentService;