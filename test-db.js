const mongoose = require('mongoose');
const uri = "mongodb+srv://rushirakhe2027_db_user:DATABASE2027@e-comm.yp1shdi.mongodb.net/taskmatrix?retryWrites=true&w=majority&appName=E-comm";

console.log("Testing MongoDB Connection...");

mongoose.connect(uri)
    .then(() => {
        console.log("SUCCESS: Connection worked locally!");
        process.exit(0);
    })
    .catch((err) => {
        console.error("FAILURE: Connection failed locally.");
        console.error(err.message);
        process.exit(1);
    });
