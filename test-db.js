
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;
console.log("Testing Connection to:", uri ? uri.replace(/:([^:@]+)@/, ':***@') : "UNDEFINED");

if (!uri) {
  console.error("MONGODB_URI is missing in .env.local");
  process.exit(1);
}

// Emulate the options we use in the app
const opts = {
  bufferCommands: false,
  family: 4, // Checking if this helps or hurts
  serverSelectionTimeoutMS: 5000 // Fail fast
};

console.log("Connecting...");

mongoose.connect(uri, opts)
  .then(() => {
    console.log("✅ SUCCESS: Connected to MongoDB!");
    console.log("Database Name:", mongoose.connection.name);
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ CONNECTION FAILED");
    console.error("Error Name:", err.name);
    console.error("Error Code:", err.code);
    console.error("Error Message:", err.message);

    if (err.message.includes('bad auth')) {
      console.log("👉 HINT: Username/Password is wrong.");
    } else if (err.message.includes('ENOTFOUND')) {
      console.log("👉 HINT: DNS Issue. Still blocked or wrong hostname.");
    } else if (err.message.includes('ETIMEOUT') || err.message.includes('buffering timed out')) {
      console.log("👉 HINT: Network Firewall or IP Whitelist issue.");
    }

    process.exit(1);
  });
