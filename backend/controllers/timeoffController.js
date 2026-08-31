const timeoffModel = require("../models/timeoffModel");

async function getAllRequests(req, res) {
  try {
    const requests = await timeoffModel.getAll();
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createRequest(req, res) {
  try {
    const { employee_id, type, start_date, end_date, reason } = req.body;

    if (!employee_id || !start_date || !end_date || !reason) {
      return res
        .status(400)
        .json({
          error: "Employee, start date, end date, and reason are required",
        });
    }
    if (end_date < start_date) {
      return res
        .status(400)
        .json({ error: "End date cannot be before start date" });
    }

    const result = await timeoffModel.create(req.body);
    res
      .status(201)
      .json({
        id: result.insertId,
        employee_id,
        type,
        start_date,
        end_date,
        reason,
        status: "Pending",
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateRequestStatus(req, res) {
  try {
    const { status } = req.body;
    if (!["Approved", "Denied", "Pending"].includes(status)) {
      return res
        .status(400)
        .json({ error: "Status must be Approved, Denied, or Pending" });
    }

    const result = await timeoffModel.updateStatus(req.params.id, status);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Request not found" });
    }
    res.json({ message: "Status updated", id: req.params.id, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { getAllRequests, createRequest, updateRequestStatus };
