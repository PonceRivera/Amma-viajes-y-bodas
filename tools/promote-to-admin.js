
require('dotenv/config');
const mongoose = require('mongoose');

// Polyfill for standalone use
if (typeof Promise === 'undefined') {
    global.Promise = require('promise');
}

const args = process.argv.slice(2);
const email = args[0];

if (!email) {
    console.error('Usage: node tools/promote-to-admin.js <email>');
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

async function promote() {
    const mongoUri = process.env['MONGODB_URI'];
    if (!mongoUri) {
        console.error('MONGODB_URI not found in .env');
        process.exit(1);
    }

    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoUri);

        console.log(`Searching for user in MongoDB: ${email}`);
        let user = await User.findOne({ email });

        if (user) {
            user.role = 'admin';
            await user.save();
            console.log(`SUCCESS: User ${email} is now an ADMIN in MongoDB.`);
        } else {
            console.log('User not found in MongoDB. Checking local database.json...');
            const fs = require('fs');
            const path = require('path');
            const dbPath = path.join(process.cwd(), 'database.json');

            if (fs.existsSync(dbPath)) {
                const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
                const localUser = data.users.find(u => u.email === email);

                if (localUser) {
                    localUser.role = 'admin';
                    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
                    console.log(`SUCCESS: User ${email} is now an ADMIN in local database.json.`);
                } else {
                    console.error('User not found in local database either!');
                    process.exit(1);
                }
            } else {
                console.error('User not found and no local database.json exists.');
                process.exit(1);
            }
        }

        console.log('You can now log in and access the /admin panel.');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

promote();
