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

//Login a user
//POST api/users/loginUser
const loginUser = asyncHandler(async (req, res) => {
    //Input validation
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400);
        throw new Error("Please all fields are required")
    }

    //Check if user exist
    const user = await User.findOne({ email });
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    //Check for the correct password
    const passwordIsCorrect = await bcrypt.compare(password, user.password);
    console.log(" hashed cpmparison code reach here");

    if (!passwordIsCorrect) {
        res.status(400);
        throw new Error("Invalid email or password");
    }

    //Trigger 2FA for unknown userAgent

    //Generate token
    const token = generateToken(user._id);

    if (user && passwordIsCorrect) {
        //Send HTTP-only cookie
        res.cookie("token", token, {
            path: "/",
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 86400), // 1 day
            // sameSite: "none",
            // secure: true
        });

        const { _id, name, email, password, bio, phone, photo, role, isVerified } = user;
        res.status(200).json({
            message: "Logged in successfully",
            _id,
            name,
            email,
            bio,
            phone,
            photo,
            role,
            isVerified,
            token
        })

    } else {
        res.status(500);
        throw new Error("Something went wrong, Please try again");
    }
});

//Logout User
//api/users/logoutUser GET
const logoutUser = asyncHandler(async (req, res) => {
    res.cookie("token", "", {
        path: "/",
        httpOnly: true,
        expires: new Date(0),
        // secure: true,
        // sameSite: none
    })

    res.status(200).json({ message: "Logged out successfully" });
});

module.exports = { registerUser, loginUser, logoutUser }