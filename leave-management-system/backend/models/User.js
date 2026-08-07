const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['employee', 'manager', 'admin'], default: 'employee' },
  department: { type: String, required: true },
  designation: { type: String, required: true },
  joiningDate: { type: Date, default: Date.now },
  leaveBalances: {
    sickLeave: { type: Number, default: 12 },
    casualLeave: { type: Number, default: 12 },
    paidLeave: { type: Number, default: 15 },
    unpaidLeave: { type: Number, default: 99 }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
