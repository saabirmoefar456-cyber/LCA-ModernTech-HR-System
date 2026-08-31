const pool = require("../config/db");

async function getAll() {
  const [rows] = await pool.execute(`
    SELECT employees.*, departments.name AS department_name, departments.location AS department_location
    FROM employees
    INNER JOIN departments ON employees.department_id = departments.id
  `);
  return rows;
}

async function getById(id) {
  const [rows] = await pool.execute(
    `
    SELECT employees.*, departments.name AS department_name, departments.location AS department_location
    FROM employees
    INNER JOIN departments ON employees.department_id = departments.id
    WHERE employees.id = ?
  `,
    [id],
  );
  return rows[0];
}

async function create(data) {
  const {
    first_name,
    last_name,
    email,
    phone,
    job_title,
    department_id,
    employment_type,
    hire_date,
    salary,
    hours_per_week,
    status,
    address,
    emergency_contact,
  } = data;

  const [result] = await pool.execute(
    `INSERT INTO employees
      (first_name, last_name, email, phone, job_title, department_id, employment_type, hire_date, salary, hours_per_week, status, address, emergency_contact)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      first_name,
      last_name,
      email,
      phone,
      job_title,
      department_id,
      employment_type,
      hire_date,
      salary,
      hours_per_week,
      status,
      address,
      emergency_contact,
    ],
  );
  return result;
}

async function update(id, data) {
  const {
    first_name,
    last_name,
    email,
    phone,
    job_title,
    department_id,
    employment_type,
    hire_date,
    salary,
    hours_per_week,
    status,
    address,
    emergency_contact,
  } = data;

  const [result] = await pool.execute(
    `UPDATE employees SET
      first_name = ?, last_name = ?, email = ?, phone = ?, job_title = ?, department_id = ?,
      employment_type = ?, hire_date = ?, salary = ?, hours_per_week = ?, status = ?, address = ?, emergency_contact = ?
     WHERE id = ?`,
    [
      first_name,
      last_name,
      email,
      phone,
      job_title,
      department_id,
      employment_type,
      hire_date,
      salary,
      hours_per_week,
      status,
      address,
      emergency_contact,
      id,
    ],
  );
  return result;
}

async function remove(id) {
  const [result] = await pool.execute("DELETE FROM employees WHERE id = ?", [
    id,
  ]);
  return result;
}

module.exports = { getAll, getById, create, update, remove };
