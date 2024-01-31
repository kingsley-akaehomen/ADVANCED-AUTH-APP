const asyncHandler = require("express-async-handler");



//Register a user
//POST api/users/registerUser
const registerUser = asyncHandler(async(req, res) => {
    res.send("This is the register page");
});

module.exports = { registerUser }