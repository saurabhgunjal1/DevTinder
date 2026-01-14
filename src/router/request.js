const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const sendEmail = require("../utils/sendEmail");
const requestRoute = express.Router();

requestRoute.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;
      const allowedStatus = ["ignored", "intrested"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({
          message: "Invalid status type:" + status,
        });
      }

      const userexist = await User.findById(toUserId);

      if (!userexist) {
        return res.status(404).json({
          message: "User not found!",
        });
      }
      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });

      if (existingConnectionRequest) {
        return res.status(400).send({
          message: "Connection Request Already Exists!",
        });
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();

      const emailRes = await sendEmail.run(
        "New Connection Request",
        "Someone is interested in your profile",
        "gunjalsaurabh0@gmail.com"
      );

      res.json({
        message: "Connection request sent successfully",
        data,
      });
    } catch (error) {
      res.status(400).send("ERROR:" + error.message);
    }
  }
);

requestRoute.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { status, requestId } = req.params;

      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({
          message: "Invalid status!",
        });
      }

      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "intrested",
      });
      if (!connectionRequest) {
        return res.status(403).json({
          message: "Invalid Request!",
        });
      }

      connectionRequest.status = status;

      const data = await connectionRequest.save();
      res.json({
        message: "Connection Request" + status,
        data,
      });
    } catch (error) {
      res.status(400).send("ERROR:" + error.message);
    }
  }
);

requestRoute.delete("/request/remove/:id", userAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const deleteConnection = await ConnectionRequest.findByIdAndDelete(id);
    if (!deleteConnection) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({ message: "Deleted successfully", deleteConnection });
  } catch (error) {
    res.status(400).send("ERROR:" + error.message);
  }
});

module.exports = requestRoute;
