const express = require("express");
const { registerUser, loginUser, logoutUser } = require("../controllers/userController");

const router = express.Router();


router.post("/registerUser", registerUser);
router.get("/loginUser", loginUser);
router.get("/logoutUser", logoutUser);

module.exports = router;