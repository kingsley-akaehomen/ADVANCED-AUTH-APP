const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const protect = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            res.status(401);
            throw new Error("Not authorized, please log in");
        }

        //verify token
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        //Get user Id from token
        const user = await User.findById(verified.id).select("-password");

        if (!user) {
            res.status(404);
            throw new Error("User not found")
        }
        if (user.role === "suspended") {
            res.status(400);
            throw new Error("User suspended, please contact support")
        }

        req.user = user;
        next();

    } catch (error) {
        res.status(401);
        throw new Error("Not authorized, please log in");
    }
});

const adminOnly = asyncHandler(async (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next()
    } else {
        res.status(403);
        throw new Error("Not authorized as you are not an admin");
    }
});

const authorOnly = asyncHandler(async (req, res, next) => {
    if (req.user.role === "author" || req.user.role === "admin") {
        next()
    } else {
        res.status(403);
        throw new Error("Not authorized as author");
    }
});

const verifiedOnly = asyncHandler(async (req, res, next) => {
    if (req.user && req.user.isVerified) {
        next()
    } else {
        res.status(403);
        throw new Error("Not authorized, account not verified");
    }
});

module.exports = { protect, adminOnly, authorOnly, verifiedOnly }