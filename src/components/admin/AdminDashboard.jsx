import React, { useState, useEffect } from "react";
import { supabase } from "../../config/supabase";

export function AdminDashboard({ user, onLogout }) {
  const [attendance, setAttendance] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const branch = user.branch || "hanoi";

  useEffect(() => {
    loadData();
  }, [branch]);

  const loadData = async () => {
    try {
      setLoading(true);

      const { data: attendanceData } = await supabase
        .from("attendance")
        .select("*")
        .eq("branch", branch);

      const { data: shipmentData } = await supabase
        .from("shipments")
        .select("*")
        .eq("branch", branch);

      const { data: expenseData } = await supabase
        .from("expenses")
        .select("*")
        .eq("branch", branch);

      const { data: employeeData } = await supabase
        .from("employees")
        .select("*")
        .eq("branch", branch);

      setAttendance(attendanceData || []);
      setShipments(shipmentData || []);
      setExpenses(expenseData || []);
      setEmployees(employeeData || []);
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading admin dashboard...</div>;

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