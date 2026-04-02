const cron = require("node-cron");
const ConnectionRequest = require("../model/connectionRequest");
const { subDays, startOfDay, endOfDay } = require("date-fns");
const sendEmail = require("../utils/sendEmail");

/* Scheduled this job to run at 8AM every morningff */
cron.schedule("0 8 * * *", async () => {
  try {
    const yesterday = subDays(new Date(), 0);
    const startYesterday = startOfDay(yesterday);
    const endYesterday = endOfDay(yesterday);

    const pendingRequests = await ConnectionRequest.find({
      status: "interested",
      createdAt: {
        $gte: startYesterday,
        $lt: endYesterday,
      },
    }).populate("fromUserId toUserId");
    const listOfEmails = [
      ...new Set(pendingRequests.map((req) => req.toUserId.emailId)),
    ];
    /* 
      Instead of for-loop use bee-queue node module for this.
      If there are so-many mails to be sent we cannot send like this as this would take a lot of time. 
      Either we can let aws handle this one or we can queue this process throught js function.
      1. npm i bullmq
      2. npm i beeque
    */
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
