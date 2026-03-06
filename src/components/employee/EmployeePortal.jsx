import React, { useState, useEffect } from "react";
import { supabase } from "../../config/supabase";

export function EmployeePortal({ user, onLogout }) {
  const [attendance, setAttendance] = useState([]);
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    loadMyData();
  }, []);

  const loadMyData = async () => {
    const { data: attendanceData } = await supabase
      .from("attendance")
      .select("*")
      .eq("employee_id", user.id);

    const { data: expenseData } = await supabase
      .from("expenses")
      .select("*")
      .eq("employee_id", user.id);

    setAttendance(attendanceData || []);
    setExpenses(expenseData || []);
  };

  return (
    <div>
      <h1>Employee Portal</h1>
      <button onClick={onLogout}>Logout</button>

      <p>Welcome {user.name}</p>

      <p>Your attendance records: {attendance.length}</p>
      <p>Your expenses: {expenses.length}</p>
    </div>
  );
}