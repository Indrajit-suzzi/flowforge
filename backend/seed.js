import mongoose from 'mongoose';
import User from './src/models/user.js';
import dotenv from 'dotenv';
import { getRolePermissions } from './src/middlewares/roleMiddleware.js';

dotenv.config();

const dummyUsers = [
  {
    username: 'admin_user',
    email: 'admin@flowforge.com',
    password: 'admin123',
    role: 'admin',
    isActive: true
  },
  {
    username: 'sub_admin',
    email: 'subadmin@flowforge.com',
    password: 'subadmin123',
    role: 'subadmin',
    isActive: true
  },
  {
    username: 'john_doe',
    email: 'john@example.com',
    password: 'john123',
    role: 'user',
    isActive: true
  },
  {
    username: 'jane_smith',
    email: 'jane@example.com',
    password: 'jane123',
    role: 'user',
    isActive: true
  },
  {
    username: 'disabled_user',
    email: 'disabled@example.com',
    password: 'disabled123',
    role: 'user',
    isActive: false
  }
];

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/flowforge');
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    console.log('Cleared existing users');

    const bcrypt = (await import('bcryptjs')).default;

    for (const userData of dummyUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const permissions = getRolePermissions(userData.role);
      
      await User.create({
        ...userData,
        password: hashedPassword,
        permissions
      });
      
      console.log(`Created ${userData.role}: ${userData.email}`);
    }

    console.log('\n✅ Seed completed successfully!');
    console.log('\nLogin credentials:');
    console.log('Admin:     admin@flowforge.com / admin123');
    console.log('SubAdmin:  subadmin@flowforge.com / subadmin123');
    console.log('User:      john@example.com / john123');
    console.log('User:      jane@example.com / jane123');
    console.log('Disabled:  disabled@example.com / disabled123');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seedUsers();
