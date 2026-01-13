const mongoose = require("mongoose");
const { Schema } = mongoose;

const connectionRequestSchema = new Schema(
  {
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: "User",
    },
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: "User",
    },
    status: {
      type: String,
      require: true,

      enum: {
        values: ["ignored", "accepted", "rejected", "intrested"],
        message: "{VALUE} is incorrect status type!",
      },
    },
  },
  {
    timestamps: true,
  }
);

connectionRequestSchema.pre("save", function (next) {
  const connectionRequest = this;
  if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
    throw new Error("Cannot send connection request to yourself!");
  }
  next;
});

const connectionRequestModel = new mongoose.model(
  "connectionRequest",
  connectionRequestSchema
);

module.exports = connectionRequestModel;
