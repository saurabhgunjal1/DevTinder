const { subDays, startOfDay, endOfDay } = require("date-fns");
const cron = require("node-cron");
const connectionRequestModel = require("../models/connectionRequest");
const sendEmail = require("./sendEmail");
cron.schedule("0 8  * * *", async () => {
  try {
    const yesterday = subDays(new Date(), 1);
    const yesterdaystart = startOfDay(yesterday);
    const Yesterdayend = endOfDay(yesterday);

    const pendingRequest = await connectionRequestModel
      .find({
        status: "intrested",
        createdAt: {
          $gte: yesterdaystart,
          $lte: Yesterdayend,
        },
      })
      .populate("fromUserId toUserId");

    const listOfEmails = [
      ...new Set(pendingRequest.map((req) => req.toUserId.emailId)),
    ];

    for (const email of listOfEmails) {
      try {
        const res = await sendEmail.run(
          "new friend request pending for " + email,
          "please login to devtinder.cyou and accept the requets"
        );
        console.log(res);
      } catch (error) {}
    }
  } catch (error) {}
});
