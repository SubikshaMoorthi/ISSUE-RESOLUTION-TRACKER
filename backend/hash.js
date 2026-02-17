const bcrypt = require('bcryptjs');

const password = '1234'; // Change this to your desired admin password
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
    console.log("Your Hash Value:");
    console.log(hash);
});