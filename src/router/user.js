const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequestModel = require("../models/connectionRequest");
const User = require("../models/user");
const userRoute = express.Router();
const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills";
userRoute.get("/user/requests", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const data = await ConnectionRequestModel.find({
      toUserId: loggedInUser,
      status: "intrested",
    }).populate("fromUserId", [
      "firstName",
      "lastName",
      "gender",
      "about",
      "skills",
      "photoUrl",
    ]);
    res.send(data);
  } catch (error) {
    res.status(400).send("ERROR:" + error);
  }
});

userRoute.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequest = await ConnectionRequestModel.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate(
        "fromUserId",
        "firstName lastName gender about skills age photoUrl"
      )
      .populate(
        "toUserId",
        "firstName lastName gender about skills age photoUrl"
      );

    const data = connectionRequest.map((row) => {
      const isSender = row.fromUserId._id.equals(loggedInUser._id);

      return {
        connectionId: row._id, // 👈 this is the connection request ObjectId
        user: isSender ? row.toUserId : row.fromUserId,
        status: row.status,
        createdAt: row.createdAt,
      };
    });
    res.json({
      message: "Data fetched successfully!!",
      data,
    });
  } catch (error) {
    res.status(400).send("ERROR:" + message.error);
  }
});

userRoute.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;
    const connectionRequest = await ConnectionRequestModel.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId");

    const hideUserFrom = new Set();
    connectionRequest.forEach((req) => {
      hideUserFrom.add(req.fromUserId.toString());
      hideUserFrom.add(req.toUserId.toString());
    });

    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUserFrom) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    res.json({ data: users });
  } catch (error) {
    res.status(400).send("ERROR:" + error.message);
  }
});
module.exports = userRoute;
