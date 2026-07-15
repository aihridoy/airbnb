const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim();
});

const MONGODB_URI = process.env.MONGODB_CONNECTION_STRING;

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    location: { type: String, required: true },
    image: { type: String, required: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
}, { timestamps: true });

const User = mongoose.models.users || mongoose.model('users', userSchema);

const demoUsers = [
    {
        name: 'Admin User',
        email: 'admin@gmail.com',
        password: 'admin123',
        location: 'New York, USA',
        role: 'admin',
    },
    {
        name: 'Demo User',
        email: 'abul@gmail.com',
        password: 'abul123',
        location: 'London, UK',
        role: 'user',
    },
];

async function seedUsers() {
    try {
        if (!MONGODB_URI) {
            throw new Error('MONGODB_CONNECTION_STRING environment variable is not set');
        }

        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        for (const userData of demoUsers) {
            const hashedPassword = await bcrypt.hash(userData.password, 10);

            const existingUser = await User.findOne({ email: userData.email });

            if (existingUser) {
                // Update with properly hashed password
                await User.updateOne(
                    { email: userData.email },
                    { $set: { password: hashedPassword, role: userData.role } }
                );
                console.log(`Updated user: ${userData.email} (${userData.role})`);
            } else {
                await User.create({
                    ...userData,
                    password: hashedPassword,
                });
                console.log(`Created user: ${userData.email} (${userData.role})`);
            }
        }

        console.log('\nSeed completed!');
        console.log('Demo Admin: admin@gmail.com / admin123');
        console.log('Demo User: abul@gmail.com / abul123');
    } catch (error) {
        console.error('Seed error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

seedUsers();
