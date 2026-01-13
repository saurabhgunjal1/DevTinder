const { mongoose } = require("mongoose");

async function connectDB() {
  await mongoose.connect(
    "mongodb+srv://NamasteDev:saurabh123@namastenode.oh1dtze.mongodb.net/devTinder"
  );
}

module.exports = {
  connectDB,
};
