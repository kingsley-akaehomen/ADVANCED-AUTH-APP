const dotenv = require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const userRoute = require("./routes/userRoute");
const errorHandler = require("./middlewares/errorMiddleware");

const app = express();

//Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors({
    origin: ["http://localhost:3000"],
    credentials: true
}))

//Routes
app.use("/api/users",  userRoute);

//home route
app.get("/api", (req, res) => {
    res.send("This is the home route")
})

//Error middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5050

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Database is successfully connected");
        app.listen(PORT, () => {
            console.log(`App is listening on port 🚀 ${PORT}`)
        })
    })
    .catch((err) => console.log(err))