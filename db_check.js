const mongoose = require('mongoose');
const Project = require('./src/models/Project');
const User = require('./src/models/User');
require('dotenv').config();

const testDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({});
    console.log('--- USERS ---');
    users.forEach(u => console.log(`${u._id} - ${u.email} - ${u.name}`));

    const projects = await Project.find({});
    console.log('\n--- PROJECTS ---');
    projects.forEach(p => {
      console.log(`\nProject: ${p.name}`);
      console.log(`Status: ${p.status}`);
      console.log(`Members: ${JSON.stringify(p.members, null, 2)}`);
    });

    process.exit(0);
  } catch (err) {
    console.error('Test Failed:', err);
    process.exit(1);
  }
};

testDB();
