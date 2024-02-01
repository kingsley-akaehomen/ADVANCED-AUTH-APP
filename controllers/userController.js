const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const parser = require("ua-parser-js");
const { generateToken } = require("../util/index.js");

//Register a user
//POST api/users/registerUser
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    //Input fields validation
    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please fill in all required fileds")
    };

    //Password length validation
    if (password.length < 6) {
        res.status(400);
        throw new Error("Password must be up tp 6 characters.")
    };

    //check if user alreasy exist
    const userExists = await User.findOne({ email }).exec();
    if (userExists) {
        res.status(400);
        throw new Error("Email has already been registered")
    };

    //Get the user-agent
    const ua = parser(req.headers["user-agent"]);
    const userAgent = [ua.ua]

    //Create a new User
    const user = await User.create({
        name,
        email,
        password,
        userAgent
    });

    //generate token for the user
    const token = generateToken(user._id);

    //Send HTTP-only cookie
    res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400), // 1 day
        // sameSite: "none",
        // secure: true
    });

    if (user) {
        const { _id, name, email, password, bio, phone, photo, role, isVerified } = user;
        res.status(201).json({
            _id,
            name,
            email,
            password,
            bio, 
            phone,
            photo,
            role,
            isVerified,
            token
        })
    } else {
        res.status(400);
        throw new Error("Invalid user data")
    }
});

module.exports = { registerUser }