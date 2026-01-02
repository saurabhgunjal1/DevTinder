const express = require("express");

const app = express();

app.use("/hello", (req, res) => {
  res.send("hello from /hello");
});

app.use("/test", (req, res) => {
  res.send("Hello Testing Server");
});

app.use("/", (req, res) => {
  res.send("Hello  ");
});

app.listen(5000, () => {
  console.log("Server is successfully listening on port 5000....");
});
