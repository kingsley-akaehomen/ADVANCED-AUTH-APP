const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
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

// Get User information
// api/users/getUser
const getUser = asyncHandler(async (req, res) => {
    //check if User exists
    const user = await User.findById(req.user._id).select("-password");
    if (user) {
        res.status(200).json({ message: "User info fetched successfully", user })
    } else {
        res.status(400);
        throw new Error("User not found")
    }
});

// PATCH Update user data
// api/users/updatetUser
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        const { name, email, bio, phone, photo, role, isVerified } = user;
        user.email = email
        user.name = req.body.name || name;
        user.bio = req.body.bio || bio;
        user.photo = req.body.photo || photo;
        user.phone = req.body.phone || phone;

        const updatedUser = await user.save();

        res.status(200).json({

            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            bio: updatedUser.bio,
            phone: updatedUser.phone,
            photo: updatedUser.photo,
            role: updatedUser.role,
            isVerified: updatedUser.isVerified
        })

    } else {
        res.status(404);
        throw new Error("User not found")
    }
});

// DElETE delete a user 
// api/users/:id
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404);
        throw new Error("User not found")
    }

    await user.deleteOne();

    res.status(200).json({ message: "User has been successfully deleted" })
})

// GET get all users 
// api/users/getUsers
const getUsers = asyncHandler(async (req, res) => {
    //check for users
    const users = await User.find().sort("-createdAt").select("-password");
    if (!users) {
        res.status(500);
        throw new Error("Something went wrong, try again")
    }
    res.status(200).json(users)
})

//Get login status
const getLoginStatus = asyncHandler(async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.json(false);
    }
    //verify token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (verified) {
        res.json(true);
    } else {
        res.json(false);
    }
});


//POST Upgrade a user
//api/users/upgradeUser
const upgradeUser = asyncHandler(async (req, res) => {
  const { role, id } = req.body;
  const user = await User.findById(id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.role = role
  await user.save();
  res.status(200).json({
    message: `user has been updated to ${role}`
  })
})

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getUser,
    updateUser,
    deleteUser,
    getUsers,
    getLoginStatus,
    upgradeUser
};