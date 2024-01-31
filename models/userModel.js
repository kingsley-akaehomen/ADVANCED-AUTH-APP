const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const userSchema = mongoose.Schema({

    name: {
        type: String,
        required: [true, "Please add a name"]
    },

    
    email: {
        type: String,
        required: [true, "Please add an email"],
        unique: true,
        trim: true,
        match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, "Please enter a valid email"]
    },


    password: {
        type: String,
        required: [true, "Please add a password"],
        minLength: [6, "Password must be up to 6 characters"]
    },

    photo: {
        type: String,
        required: [true, "Please add a photo"],
        default: "https://i.ibb.co/4pDNDk1/avatar.png"
    },

    phone: {
        type: String,
        required: true,
        default: "234"
    },

    bio : {
        type: String,
        default: "Bio"
    },

    role: {
        type: String,
        required: true,
        default: "subscriber",
        enum: ["subscriber", "admin", "suspended"]
    },

    isVerified: {
        type: Boolean,
        default: false
    },

    userAgent : {
        type: Array,
        required: true,
        default: []
    }

   
},
    {
        timestamps: true,
        minimize: false
    }

);

const User = mongoose.model("User", userSchema);
module.exports = User;