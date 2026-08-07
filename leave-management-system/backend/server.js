const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/leaves', require('./routes/leaveRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));

app.get('/', (req, res) => {
  res.send('Leave Management System API is running...');
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/leave_management';

const seedData = async () => {
  try {
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      console.log('Seeding admin and test users...');
      const salt = await bcrypt.genSalt(10);
      const adminPassword = await bcrypt.hash('admin123', salt);
      const employeePassword = await bcrypt.hash('employee123', salt);

      await User.create([
        {
          name: 'System Admin',
          email: 'admin@company.com',
          password: adminPassword,
          role: 'admin',
          department: 'IT',
          designation: 'Administrator',
          leaveBalances: { sickLeave: 12, casualLeave: 12, paidLeave: 15, unpaidLeave: 99 }
        },
        {
          name: 'John Doe',
          email: 'john@company.com',
          password: employeePassword,
          role: 'employee',
          department: 'Engineering',
          designation: 'Software Engineer',
          leaveBalances: { sickLeave: 10, casualLeave: 12, paidLeave: 14, unpaidLeave: 99 }
        },
        {
          name: 'Jane Smith',
          email: 'jane@company.com',
          password: employeePassword,
          role: 'employee',
          department: 'Human Resources',
          designation: 'HR Specialist',
          leaveBalances: { sickLeave: 12, casualLeave: 8, paidLeave: 15, unpaidLeave: 99 }
        }
      ]);
      console.log('Users seeded successfully! Credentials:\nAdmin: admin@company.com / admin123\nEmployee: john@company.com / employee123\nEmployee: jane@company.com / employee123');
    }
  } catch (err) {
    console.error('Error seeding data:', err);
  }
};

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected successfully.');
    await seedData();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message);
    console.log('Running server in local fallback mode so frontend remains partially runnable...');
    
    // We run the server anyway to prevent port binding issues or immediate crashes
    app.listen(PORT, () => {
      console.log(`Server running in MongoDB offline mode on port ${PORT}. Configure MONGODB_URI in backend/.env to persist.`);
    });
  });
