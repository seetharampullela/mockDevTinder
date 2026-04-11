# Razor pay Integration

- Signup on Razor Pay and complete KYC
- Create UI for Premium Page
- Create an API for Create order
  - /payment/create
  - ref
    - Samples: https://github.com/razorpay/razorpay-node/blob/master/documents/order.md
    - Doc: https://razorpay.com/docs/payments/server-integration/nodejs/integration-steps/#integrate-with-razorpay-payment-gateway
- added the keys in the env file
- Initialized Razorpay in utils
- Created order on Razorpay
- created schem and model
- save the order in payments collection
- make API dynamic
- setup the webhook in razorpay Accounts & Settings
- payment verification
  - https://github.com/razorpay/razorpay-node/blob/master/documents/paymentVerfication.md
  - Payment Response verified through webhook Reference - https://razorpay.com/docs/webhooks/payments/
