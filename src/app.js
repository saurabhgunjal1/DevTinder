require("dotenv").config();
const express = require("express");
const { connectDB } = require("./config/database");
const cookieParser = require("cookie-parser");
const JWT = require("jsonwebtoken");
const cors = require("cors");
const http = require("http");
const app = express();
require("./utils/cronJob");
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
const paymentRoute = require("./router/payment");
const initializeSocket = require("./utils/socket");
const chatRoute = require("./router/chat");

app.use("/", authRoute);
app.use("/", profileRoute);
app.use("/", requestRoute);
app.use("/", userRoute);
app.use("/", paymentRoute);
app.use("/", chatRoute);

const server = http.createServer(app);
initializeSocket(server);

connectDB()
  .then(() => {
    console.log("Database Connection established...");

    server.listen(process.env.PORT, () => {
      console.log(
        `Server is successfully listening on port ${process.env.PORT}....`
      );
    });
  })
  .catch((err) => {
    console.error("Database could not be connected");
  });
