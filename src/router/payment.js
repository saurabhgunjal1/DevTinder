const express = require("express");
const { userAuth } = require("../middlewares/auth");
const razorpayInstance = require("../utils/razorpay");
const paymentRoute = express.Router();
const Payment = require("../models/payment");
const membershipAmount = require("../utils/constants");
const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");
const User = require("../models/user");

paymentRoute.post("/payment/create", userAuth, async (req, res) => {
  try {
    const { membershipType } = req.body;
    const { firstName, lastName, emailId } = req.user;
    // validation (very important)
    if (!membershipAmount[membershipType]) {
      return res.status(400).json({
        success: false,
        message: "Invalid membership type",
      });
    }
    const order = await razorpayInstance.orders.create({
      amount: membershipAmount[membershipType] * 100,
      currency: "INR",
      receipt: "receipt#1",

      notes: {
        firstName: `${firstName}`,
        lastName: `${lastName}`,
        emailId: `${emailId}`,
        membershipType: membershipType,
      },
    });
    console.log(order);
    const payment = new Payment({
      userId: req.user._id,
      orderId: order.id,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      notes: order.notes,
    });

    const savedPayment = await payment.save();

    res.json({ ...savedPayment.toJSON(), keyId: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    return res.status(500).json({
      msg: error.message,
    });
  }
});

paymentRoute.post("/payment/webhook", async (req, res) => {
  try {
    console.log("Webhook Called");

    const webhookSignature = req.get("X-Razorpay-Signature");

    const isWebhookValid = validateWebhookSignature(
      req.body, // RAW body, not JSON.stringify
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECERT
    );

    if (!isWebhookValid) {
      console.log("Invalid Webhook Signature");
      return res.status(400).json({ msg: "Invalid webhook signature" });
    }

    console.log("Valid Webhook Signature");

    const event = JSON.parse(req.body.toString()).event;
    const payload = JSON.parse(req.body.toString()).payload;

    if (event === "payment.captured") {
      const paymentDetails = payload.payment.entity;

      const payment = await Payment.findOne({
        orderId: paymentDetails.order_id,
      });

      if (!payment) {
        return res.status(404).json({ msg: "Payment not found" });
      }

      payment.status = "captured";
      await payment.save();

      const user = await User.findById(payment.userId);
      user.isPremium = true;
      user.membershipType = payment.notes.membershipType;
      await user.save();

      console.log("Payment & User updated successfully");
    }

    return res.status(200).json({ msg: "Webhook processed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: err.message });
  }
});

module.exports = paymentRoute;
