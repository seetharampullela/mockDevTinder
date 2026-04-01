const cron = require("node-cron");
const ConnectionRequest = require("../model/connectionRequest");
const { subDays, startOfDay, endOfDay } = require("date-fns");
const sendEmail = require("../utils/sendEmail");

cron.schedule("0 8 * * *", async () => {
  try {
    const yesterday = subDays(new Date(), 1);
    const startYesterday = startOfDay(yesterday);
    const endYesterday = endOfDay(yesterday);

    const pendingRequests = await ConnectionRequest.find({
      status: "interested",
      createdAt: {
        $gte: startYesterday,
        $lt: endYesterday,
      },
    }).populate("fromUserId toUserId");
    const listOfEmails = new Set(
      pendingRequests.map((req) => req.toUserId.emailId),
    );
    for (const toEmailId of listOfEmails) {
      if (pendingRequests.length > 0) {
        const mailRes = await sendEmail.run(
          "There is a new request pending for " + toEmailId,
          "There are so many pending Requests. Please login to www.mydevportal.xyz and act on it",
        );
        console.log("🚀 ~ cronJob.js:28 ~ mailRes:", mailRes);
      }
    }
  } catch (err) {
    console.error("ERROR: ", err);
  }
});
