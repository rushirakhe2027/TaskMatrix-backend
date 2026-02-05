const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const testDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({});
    users.forEach(u => {
      console.log(`User: ${u.name} (${u.email})`);
      console.log(`  Total Rev: ${u.totalRevenue}`);
      console.log(`  Received: ${u.receivedRevenue}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('Test Failed:', err);
    process.exit(1);
  }
};

testDB();
