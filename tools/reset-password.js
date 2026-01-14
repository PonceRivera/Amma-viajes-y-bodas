
require('dotenv/config');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Polyfill for standalone use
if (typeof Promise === 'undefined') {
    global.Promise = require('promise');
}

const args = process.argv.slice(2);
const email = args[0];
const newPassword = args[1];

if (!email || !newPassword) {
    console.error('Usage: node tools/reset-password.js <email> <newPassword>');
    process.exit(1);
}

// User Schema (simplified)
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String },
    name: { type: String },
    role: { type: String, default: 'user' },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

async function resetPassword() {
    console.log(`Resetting password for: ${email}`);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const mongoUri = process.env['MONGODB_URI'];
    let userFound = false;

    // 1. Try MongoDB
    if (mongoUri) {
        try {
            console.log('Connecting to MongoDB...');
            await mongoose.connect(mongoUri);

            console.log(`Searching for user in MongoDB: ${email}`);
            let user = await User.findOne({ email });

            if (user) {
                user.password = hashedPassword;
                await user.save();
                console.log(`SUCCESS: Password updated for ${email} in MongoDB.`);
                userFound = true;
            } else {
                console.log('User not found in MongoDB.');
            }
        } catch (err) {
            console.error('MongoDB Error:', err.message);
        } finally {
            if (mongoose.connection.readyState !== 0) {
                await mongoose.disconnect();
            }
        }
    }

    // 2. Try Local Database (Safe Mode)
    console.log('Checking local database.json...');
    const fs = require('fs');
    const path = require('path');
    const dbPath = path.join(process.cwd(), 'database.json');

    if (fs.existsSync(dbPath)) {
        try {
            const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
            const localUser = data.users.find(u => u.email === email);

            if (localUser) {
                localUser.password = hashedPassword;
                fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
                console.log(`SUCCESS: Password updated for ${email} in local database.json.`);
                userFound = true;
            }
        } catch (err) {
            console.error('Local DB Error:', err.message);
        }
    }

    if (!userFound) {
        console.error('ERROR: User not found in either MongoDB or local database.');
        console.error('Please make sure the email is correct and registered.');
        process.exit(1);
    } else {
        console.log('Done! You can now log in with your new password.');
    }
}

resetPassword();
