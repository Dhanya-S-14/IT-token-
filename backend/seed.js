const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const Employee = require('./models/Employee');
const config = require('./config');

const seed = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminExists = await Admin.findOne({ adminId: 'ADMIN001' });
    if (!adminExists) {
      await Admin.create({
        adminId: 'ADMIN001',
        name: 'Super Admin',
        email: 'admin@opspulse.com',
        password: 'admin123',
        role: 'superadmin'
      });
      console.log('Admin created: ADMIN001 / admin123');
    }

    const empExists = await Employee.findOne({ employeeId: 'EMP001' });
    if (!empExists) {
      await Employee.create({
        employeeId: 'EMP001',
        name: 'John Employee',
        email: 'john@company.com',
        password: 'emp123',
        department: 'IT',
        designation: 'Software Engineer',
        deploymentLocation: 'Main Office',
        joiningDate: new Date('2024-01-15')
      });
      console.log('Employee created: EMP001 / emp123');
    }

    console.log('Seed completed');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seed();
