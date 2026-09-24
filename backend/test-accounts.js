import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
mongoose.connect(process.env.MONGO_URI);
import User from "./models/UserModel.js";
async function run() {
  const users = await User.find({}, 'name email role password');
  console.log(users);
  process.exit();
}
run();
