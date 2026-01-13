app.get("/user", async (req, res) => {
  const userEmailId = req.query.emailId;

  try {
    const user = await User.find({ emailId: userEmailId });
    res.send(user);
  } catch (error) {
    res.status(400).send("Something went wrong!");
  }
});
