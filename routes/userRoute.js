const express = require("express");
const {
    registerUser,
    loginUser,
    logoutUser,
    getUser,
    updateUser,
    deleteUser
} = require("../controllers/userController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");

const router = express.Router();


router.post("/registerUser", registerUser);
router.post("/loginUser", loginUser);
router.get("/logoutUser", logoutUser);
router.get("/getUser", protect, getUser);
router.patch("/updateUser", protect, updateUser);

router.delete("/:id", protect, adminOnly, deleteUser);

module.exports = router;