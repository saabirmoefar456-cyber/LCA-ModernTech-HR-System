const pool = require("../config/db");

async function getAll() {
  const [rows] = await pool.execute("SELECT * FROM departments");
  return rows;
}

module.exports = { getAll };
