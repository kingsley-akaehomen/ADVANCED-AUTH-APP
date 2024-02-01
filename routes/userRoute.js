const express = require("express");
const {
    registerUser,
    loginUser,
    logoutUser,
    getUser,
    updateUser,
    deleteUser,
    getUsers,
    getLoginStatus,
    upgradeUser
} = require("../controllers/userController");
const { protect, adminOnly, authorOnly } = require("../middlewares/authMiddleware");

const router = express.Router();


router.post("/registerUser", registerUser);
router.post("/loginUser", loginUser);
router.get("/logoutUser", logoutUser);
router.get("/getUser", protect, getUser);
router.patch("/updateUser", protect, updateUser);

router.delete("/:id", protect, adminOnly, deleteUser);
router.get("/getUsers", protect, authorOnly, getUsers);
router.get("/getLoginStatus", getLoginStatus );
router.post("/upgradeUser", protect, adminOnly, upgradeUser);

module.exports = router;