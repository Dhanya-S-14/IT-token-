const mongoose = require('mongoose');
const Employee = require('./models/Employee');
const Admin = require('./models/Admin');
const config = require('./config');
(async () => {
  await mongoose.connect(config.MONGODB_URI);
  // remove my test junk
  await Employee.deleteMany({ email: /test\.com$|new@test\.com/ });
  await Employee.deleteMany({ employeeId: /EMP9XY/ });
  await Employee.deleteOne({ employeeId: 'EMP002' });
  const emps = await Employee.find().select('employeeId name email department status isActive');
  console.log('--- EMPLOYEES ---');
  emps.forEach(e => console.log(`${e.employeeId} | ${e.name} | ${e.email} | ${e.department} | status=${e.status} active=${e.isActive}`));
  const admins = await Admin.find().select('adminId name role isActive');
  console.log('--- ADMINS ---');
  admins.forEach(a => console.log(`${a.adminId} | ${a.name} | ${a.role} | active=${a.isActive}`));
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
