// src/services/shipmentService.js
// ============================================================================
// SHIPMENT SERVICE WITH MOCK FALLBACK
// ============================================================================

import { supabase, isDatabaseEnabled } from '../config/supabase';
import * as mockService from '../data/dataService';

/**
 * Get all shipments for a branch
 */
export const getShipments = async (branch) => {
  if (!isDatabaseEnabled()) {
    return mockService.getShipments(branch);
  }

  try {
    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .eq('branch', branch)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn("Live DB getShipments failed, falling back to mock:", err.message);
    return mockService.getShipments(branch);
  }
};

/**
 * Get shipment by ID
 */
export const getShipmentById = async (id) => {
  if (!isDatabaseEnabled()) {
    const list = await mockService.getShipments();
    return list.find(s => s.id === id) || null;
  }

  try {
    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("Live DB getShipmentById failed, falling back to mock:", err.message);
    const list = await mockService.getShipments();
    return list.find(s => s.id === id) || null;
  }
};

/**
 * Create new shipment
 */
export const createShipment = async (shipmentData) => {
  if (!isDatabaseEnabled()) {
    return mockService.addShipment(shipmentData);
  }

  try {
    const { data, error } = await supabase
      .from('shipments')
      .insert([shipmentData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("Live DB createShipment failed, falling back to mock:", err.message);
    return mockService.addShipment(shipmentData);
  }
};

/**
 * Update shipment
 */
export const updateShipment = async (id, shipmentData) => {
  if (!isDatabaseEnabled()) {
    throw new Error("Cập nhật đơn hàng chưa hỗ trợ ở chế độ Demo.");
  }

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
  if (!isDatabaseEnabled() || typeof id === 'number') {
    const list = await mockService.getShipments();
    const index = list.findIndex(s => s.id === id);
    if (index > -1) {
      list[index].status = status;
      localStorage.setItem("st_logistics_shipments", JSON.stringify(list));
      return list[index];
    }
    throw new Error("Shipment not found");
  }

  try {
    const { data, error } = await supabase
      .from('shipments')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("Live DB updateShipmentStatus failed, falling back to mock:", err.message);
    const list = await mockService.getShipments();
    const index = list.findIndex(s => s.id === id);
    if (index > -1) {
      list[index].status = status;
      localStorage.setItem("st_logistics_shipments", JSON.stringify(list));
      return list[index];
    }
    throw new Error("Shipment not found");
  }
};

/**
 * Delete shipment
 */
export const deleteShipment = async (id) => {
  if (!isDatabaseEnabled()) {
    throw new Error("Xóa đơn hàng chưa hỗ trợ ở chế độ Demo.");
  }

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
  if (!isDatabaseEnabled()) {
    return mockService.getDriverShipments(driverId, days);
  }

  try {
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
  } catch (err) {
    console.warn("Live DB getDriverShipments failed, falling back to mock:", err.message);
    return mockService.getDriverShipments(driverId, days);
  }
};

/**
 * Create/update driver trip
 */
export const createDriverTrip = async (tripData) => {
  if (!isDatabaseEnabled()) {
    return mockService.addShipment({
      order_code: tripData.order_code,
      driver_id: tripData.driver_id,
      driver_name: tripData.driver_name,
      branch: tripData.branch,
      vehicle_plate: tripData.vehicle_plate,
      from_location: tripData.from_location,
      to_location: tripData.to_location,
      distance_km: parseFloat(tripData.distance_km) || 0,
      status: tripData.delivery_status || 'shipping',
      notes: tripData.notes,
      customer: tripData.customer || 'Khách hàng lẻ',
      total_price: tripData.total_price || 0,
      price: tripData.price || 0
    });
  }

  try {
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
          customer: tripData.customer || 'Khách hàng lẻ',
          work_days: 1,
          price: tripData.price || 0,
          total_price: tripData.total_price || tripData.price || 0,
          oil_charge: tripData.oil_charge || 0,
          toll_gate_fee: tripData.toll_gate_fee || 0,
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
  } catch (err) {
    console.warn("Live DB createDriverTrip failed, falling back to mock:", err.message);
    return mockService.addShipment({
      order_code: tripData.order_code,
      driver_id: tripData.driver_id,
      driver_name: tripData.driver_name,
      branch: tripData.branch,
      vehicle_plate: tripData.vehicle_plate,
      from_location: tripData.from_location,
      to_location: tripData.to_location,
      distance_km: parseFloat(tripData.distance_km) || 0,
      status: tripData.delivery_status || 'shipping',
      notes: tripData.notes,
      customer: tripData.customer || 'Khách hàng lẻ',
      total_price: tripData.total_price || 0,
      price: tripData.price || 0
    });
  }
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