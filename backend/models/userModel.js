const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, unique: true, sparse: true }, // Sparse allows multiple null values
    phone: { type: String, unique: true, sparse: true },
    password: { type: String }, // For officials
    role: {
      type: String,
      required: true,
      enum: ['citizen', 'official'],
      default: 'citizen',
    },
    points: {
      type: Number,
      default: 0,
    },
    otp: { type: String },
    otpExpires: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Password hashing middleware for officials
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords for official login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;