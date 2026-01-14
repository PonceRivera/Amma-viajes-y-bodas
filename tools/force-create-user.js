
require('dotenv/config');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Polyfill
if (typeof Promise === 'undefined') {
    global.Promise = require('promise');
}

const EMAIL = 'cristoferponcerivera@gmail.com';
const PASSWORD = '8662621212xdR';

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String },
    name: { type: String },
    role: { type: String, default: 'user' },
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

async function forceCreate() {
    const mongoUri = process.env['MONGODB_URI'];
    if (!mongoUri) {
        console.error('ERROR: No MONGODB_URI found in .env');
        process.exit(1);
    }

    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoUri);

        console.log(`Hashing password...`);
        const hashedPassword = await bcrypt.hash(PASSWORD, 10);

        console.log(`Upserting user: ${EMAIL}...`);

        // upsert: true means create if not found, update if found
        const user = await User.findOneAndUpdate(
            { email: EMAIL },
            {
                email: EMAIL,
                password: hashedPassword,
                role: 'admin',
                name: 'Cristofer Admin' // Default name
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        console.log('--- SUCCESS ---');
        console.log(`User created/updated: ${user.email}`);
        console.log(`Role: ${user.role}`);
        console.log(`ID: ${user._id}`);
        console.log('----------------');
        console.log('You should now be able to log in on Vercel/Production.');

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

forceCreate();
