const { mongoose } = require("mongoose");

async function connectDB() {
  await mongoose.connect(
    "mongodb+srv://NamasteDev:Saurabh321@namastenode.oh1dtze.mongodb.net/devTinder"
  );
}

module.exports = {
  connectDB,
};
