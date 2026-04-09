const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User Schema
 * 
 * Represents a user account with authentication
 * - email: Unique email address for login
 * - passwordHash: Bcrypted password (never stored in plain text)
 * - name: User's display name
 * - createdAt: Account creation timestamp
 * - lastLogin: Last successful login timestamp
 * - isActive: Account status
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: '',
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // Don't include by default in queries
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true } // Auto-add updatedAt field
);

/**
 * Pre-save middleware
 * - Hash password before saving (if modified)
 */
userSchema.pre('save', async function () {
  // Only hash if password has been modified
  if (!this.isModified('passwordHash')) {
    return;
  }

  // Generate salt and hash
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

/**
 * Instance method: Compare password
 * Used during login to verify password
 * @param {string} candidatePassword - Password to verify
 * @returns {Promise<boolean>} - True if passwords match
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.passwordHash);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

/**
 * Instance method: Get public data
 * Returns user data suitable for sending to client
 * @returns {Object} - Safe user data
 */
userSchema.methods.toPublic = function () {
  const user = this.toObject();
  delete user.passwordHash; // Remove sensitive data
  return user;
};

/**
 * Static method: Find by email
 * @param {string} email - Email to search for
 * @returns {Promise<Object>} - User document or null
 */
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

/**
 * Indexes for better query performance
 */
userSchema.index({ createdAt: -1 });
userSchema.index({ isActive: 1 });

module.exports = mongoose.model('User', userSchema);
