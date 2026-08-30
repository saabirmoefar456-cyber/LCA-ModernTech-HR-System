const express = require("express");
const router = express.Router();
const timeoffController = require("../controllers/timeoffController");
const verifyToken = require("../middleware/auth");

router.use(verifyToken);

router.get("/", timeoffController.getAllRequests);
router.post("/", timeoffController.createRequest);
router.put("/:id", timeoffController.updateRequestStatus);

module.exports = router;
