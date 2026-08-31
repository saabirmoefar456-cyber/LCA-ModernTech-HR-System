const express = require("express");
const router = express.Router();
const departmentController = require("../controllers/departmentController");
const verifyToken = require("../middleware/auth");

router.use(verifyToken);
router.get("/", departmentController.getAllDepartments);

module.exports = router;
