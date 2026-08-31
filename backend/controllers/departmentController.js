const departmentModel = require("../models/departmentModel");

async function getAllDepartments(req, res) {
  try {
    const departments = await departmentModel.getAll();
    res.json(departments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getAllDepartments };
