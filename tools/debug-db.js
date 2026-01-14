
require('dotenv/config');
const mongoose = require('mongoose');

// Polyfill
if (typeof Promise === 'undefined') {
    global.Promise = require('promise');
}

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String },
    name: { type: String },
    role: { type: String, default: 'user' },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

async function listUsers() {
    const mongoUri = process.env['MONGODB_URI'];
    if (!mongoUri) {
        console.error('ERROR: No MONGODB_URI found in .env');
        process.exit(1);
    }

    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoUri);

        console.log('Fetching all users...');
        const users = await User.find({});

        console.log('--- USERS IN MONGODB ---');
        if (users.length === 0) {
            console.log('(No users found)');
        } else {
            users.forEach(u => {
                console.log(`- Email: "${u.email}" | Role: ${u.role} | ID: ${u._id}`);
            });
        }
        console.log('------------------------');

    } catch (err) {
        console.error('Error fetching users:', err.message);
    } finally {
        await mongoose.disconnect();
    }
}

listUsers();
