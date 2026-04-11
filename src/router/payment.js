const express = require("express");

const paymentRouter = express.Router();
const razorpayInstance = require("../utils/razorpay");
const { userAuth } = require("../middlewares/auth");

const Payment = require("../model/payment");
const User = require("../model/user");
const { membershipAmount } = require("../utils/constants");
const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");

paymentRouter.post("/payment/create", userAuth, async (req, res) => {
  try {
    const { membershipType } = req.body;
    console.log("req", req);
    const { _id, firstName, lastName, emailId } = req.user;
    console.log(
      "membershipAmount[membershipType]",
      membershipType,
      membershipAmount[membershipType],
    );
    const order = await razorpayInstance.orders.create({
      amount: membershipAmount[membershipType] * 100,
      currency: "INR",
      receipt: "receipt#1",
      notes: {
        firstName,
        lastName,
        emailId,
        membershipType,
      },
    });
    const payment = new Payment({
      userId: _id,
      amount: order.amount,
      currency: order.currency,
      notes: order.notes,
      status: order.status,
      orderId: order.id,
      receipt: order.receipt,
    });

    const savedPayment = await payment.save();

    console.log("savedPayment.toJSON()", savedPayment.toJSON());

    res.json({
      ...savedPayment.toJSON(),
      keyId: process.env.RAZOR_PAY_KEY_ID,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/* Payment verification through Webhook, here userAuth verification is not required as razorpay will trigger payment verification */
paymentRouter.post("/payment/webhook", async (req, res) => {
  try {
    const webhookSignature = req.header["x-razorpay-signature"];
    const isWebhookValid = await validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      process.env.RAZOR_PAY_WEB_HOOK_SECRET,
    );

    if (!isWebhookValid) {
      return res.status(400).json({ message: "Webhook is not valid" });
    }

    /* 
        Update the payment status
        Update the user status to Premium
      */
    const paymentDetails = req.body.payload.payment.entity;
    const payment = await Payment.findOne({ orderId: paymentDetails.order_id });
    payment.status = paymentDetails.status;
    await payment.save();

    const user = await User.findOne({ _id: payment.userId });
    user.isPremium = true;
    user.membershipType = payment.notes.membershipType;
    await user.save();

    // if (req.body.event == "payment.captured") {
    // }
    // if (req.body.event == "payment.failed") {
    // }

    res.status(200).json({ message: "Webhook received successfully." });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

module.exports = paymentRouter;
