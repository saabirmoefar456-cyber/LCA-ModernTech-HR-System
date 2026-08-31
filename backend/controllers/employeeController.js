const employeeModel = require("../models/employeeModel");

async function getAllEmployees(req, res) {
  try {
    const employees = await employeeModel.getAll();
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getEmployeeById(req, res) {
  try {
    const employee = await employeeModel.getById(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function validateEmployee(data) {
  const errors = [];
  if (!data.first_name) errors.push("First name is required");
  if (!data.last_name) errors.push("Last name is required");
  if (!data.email) errors.push("Email is required");
  if (!data.job_title) errors.push("Job title is required");
  if (!data.department_id) errors.push("Department is required");
  if (!data.salary) errors.push("Salary is required");
  if (!data.hire_date) errors.push("Hire date is required");
  return errors;
}

async function createEmployee(req, res) {
  try {
    const errors = validateEmployee(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(", ") });
    }

    const result = await employeeModel.create(req.body);
    const newEmployee = await employeeModel.getById(result.insertId);
    res.status(201).json(newEmployee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateEmployee(req, res) {
  try {
    const errors = validateEmployee(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(", ") });
    }

    const result = await employeeModel.update(req.params.id, req.body);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }
    const updatedEmployee = await employeeModel.getById(req.params.id);
    res.json(updatedEmployee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteEmployee(req, res) {
  try {
    const result = await employeeModel.remove(req.params.id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.json({ message: "Employee deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
