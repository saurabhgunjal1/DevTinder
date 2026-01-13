const express = require("express");
const { connectDB } = require("./config/database");
const cookieParser = require("cookie-parser");
const JWT = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // Added PATCH and others
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const authRoute = require("./router/auth");
const profileRoute = require("./router/profile");
const requestRoute = require("./router/request");
const userRoute = require("./router/user");

app.use("/", authRoute);
app.use("/", profileRoute);
app.use("/", requestRoute);
app.use("/", userRoute);
connectDB()
  .then(() => {
    console.log("Database Connection established...");
    app.listen(5000, () => {
      console.log("Server is successfully listening on port 5000....");
    });
  })
  .catch((err) => {
    console.error("Database could not be connected");
  });
