const pool = require("../config/db");

async function getAll() {
  const [rows] = await pool.execute(`
    SELECT time_off_requests.*, employees.first_name, employees.last_name, departments.name AS department_name
    FROM time_off_requests
    INNER JOIN employees ON time_off_requests.employee_id = employees.id
    INNER JOIN departments ON employees.department_id = departments.id
    ORDER BY time_off_requests.created_at DESC
  `);
  return rows;
}

async function create(data) {
  const { employee_id, type, start_date, end_date, reason } = data;
  const [result] = await pool.execute(
    `INSERT INTO time_off_requests (employee_id, type, start_date, end_date, reason, status)
     VALUES (?, ?, ?, ?, ?, 'Pending')`,
    [employee_id, type, start_date, end_date, reason],
  );
  return result;
}

async function updateStatus(id, status) {
  const [result] = await pool.execute(
    "UPDATE time_off_requests SET status = ? WHERE id = ?",
    [status, id],
  );
  return result;
}

module.exports = { getAll, create, updateStatus };
