import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  import('./models/UserModel.js').then(async ({ default: User }) => {
    let admin = await User.findOne({ email: 'admin@medassist.com' });
    if (!admin) {
      admin = new User({
        name: 'Admin',
        email: 'admin@medassist.com',
        password: 'AdminPassword123456',
        role: 'admin',
        phone: '9999999999'
      });
      await admin.save();
      console.log('Admin created');
    } else {
      admin.password = 'AdminPassword123456';
      await admin.save();
      console.log('Admin password updated to AdminPassword123456!');
    }
    
    // Also reset receptionist and doctor2
    let rec = await User.findOne({ email: 'receptionist@medassist.com' });
    if (rec) {
      rec.password = 'AdminPassword123456';
      await rec.save();
    }
    let doc = await User.findOne({ email: 'doctor2@medassist.com' });
    if (doc) {
      doc.password = 'AdminPassword123456';
      await doc.save();
    }
    process.exit(0);
  });
}
run();
