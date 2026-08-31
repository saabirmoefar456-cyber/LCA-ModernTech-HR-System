const pool = require("../config/db");

async function findByEmail(email) {
  const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [
    email,
  ]);
  return rows[0];
}

async function createUser(email, passwordHash, role) {
  const [result] = await pool.execute(
    "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)",
    [email, passwordHash, role],
  );
  return result;
}

module.exports = { findByEmail, createUser };
