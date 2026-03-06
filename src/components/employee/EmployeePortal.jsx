import React, { useState, useEffect, useCallback } from "react";
// Switch to mock service
import * as mockService from "../../data/dataService";

export function EmployeePortal({ user, onLogout }) {
  const [attendance, setAttendance] = useState([]);
  const [expenses, setExpenses] = useState([]);

  const loadMyData = useCallback(async () => {
    // Fetch all mock data
    const allAttendance = await mockService.getAttendance();
    const allExpenses = await mockService.getExpenses();

    // Filter to only show data belonging to the logged-in user
    setAttendance(allAttendance.filter(a => a.employee_id === user.employee_id) || []);
    setExpenses(allExpenses.filter(e => e.employee_id === user.employee_id) || []);
  }, [user.employee_id]);

  useEffect(() => {
    loadMyData();
  }, [loadMyData]); // Correct dependency array

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