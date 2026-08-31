const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

// Register a new user (HR staff account)
async function register(req, res) {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "An account with this email already exists" });
    }

    // Hash the password before storing it — never store plain text
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await userModel.createUser(
      email,
      passwordHash,
      role || "hr_staff",
    );

    res
      .status(201)
      .json({ id: result.insertId, email, role: role || "hr_staff" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Log in an existing user
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Compare the submitted password against the stored hash
    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Create a JWT token containing the user's id, email, and role
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" },
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { register, login };
