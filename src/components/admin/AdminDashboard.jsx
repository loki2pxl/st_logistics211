import React, { useState, useEffect, useCallback } from "react";
// Import the mock service instead of supabase to run on fake data
import * as mockService from "../../data/dataService";

export function AdminDashboard({ user, onLogout }) {
  const [attendance, setAttendance] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const branch = user.branch || "hanoi";

  // Wrap loadData in useCallback to fix the ESLint dependency error
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Using mockService to pull from mockData.js instead of Supabase
      const attendanceData = await mockService.getAttendance();
      const shipmentData = await mockService.getShipments();
      const expenseData = await mockService.getExpenses();
      const employeeData = await mockService.getEmployees();

      // Filter by branch locally for the mock experience
      setAttendance(attendanceData.filter(a => a.branch === branch) || []);
      setShipments(shipmentData.filter(s => s.branch === branch) || []);
      setExpenses(expenseData.filter(e => e.branch === branch) || []);
      setEmployees(employeeData.filter(emp => emp.branch === branch) || []);
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  }, [branch]); // branch is the dependency for data loading

  useEffect(() => {
    loadData();
  }, [loadData]); // Now ESLint is satisfied

  if (loading) return <div>Loading admin dashboard (Mock Mode)...</div>;

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <button onClick={onLogout}>Logout</button>
      <p>Branch: {branch}</p>
      <p>Employees: {employees.length}</p>
      <p>Attendance records: {attendance.length}</p>
      <p>Shipments: {shipments.length}</p>
      <p>Expenses: {expenses.length}</p>
    </div>
  );
}