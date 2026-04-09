const mongoose = require('mongoose');

/**
 * Resume Schema
 * 
 * Represents a resume document
 * - userId: Reference to the user who created this resume
 * - title: Resume title/name
 * - templateId: Which template was used
 * - data: Resume content and structured data
 * - pdfUrl: URL to generated PDF
 * - isPublic: Whether resume is publicly accessible
 * - viewCount: Number of times resume was viewed
 * - createdAt: Creation timestamp
 * - updatedAt: Last modification timestamp
 */
const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true, // Index for faster user-based queries
    },
    title: {
      type: String,
      default: 'Untitled Resume',
      trim: true,
      minlength: 1,
      maxlength: 200,
    },
    templateId: {
      type: String,
      default: 'modern-minimal',
      enum: [
        'modern-minimal',
        'professional-classic',
        'creative-bold',
        'tech-focused',
        'executive-minimal',
        'gradient-accent',
        'academic-formal',
        'sidebar-compact',
        'minimalist-clean',
        'colorful-vibrant',
        'infographic-style',
        'two-page-style',
      ],
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
      // Resume content structure:
      // {
      //   fullName: String,
      //   email: String,
      //   phone: String,
      //   location: String,
      //   title: String,
      //   summary: String,
      //   experience: Array,
      //   education: Array,
      //   skills: Array,
      //   certifications: Array,
      //   projects: Array,
      //   languages: Array,
      //   ...other custom fields
      // }
    },
    pdfUrl: {
      type: String,
      default: null,
    },
    isPublic: {
      type: Boolean,
      default: false,
      index: true, // Index for public resume queries
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastViewedAt: {
      type: Date,
      default: null,
    },
    tags: {
      type: [String],
      default: [],
      lowercase: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true, // Index for sorting by creation date
    },
    updatedAt: {
      type: Date,
      default: Date.now,
      index: true, // Index for sorting by update date
    },
  },
  {
    timestamps: true, // Auto-update updatedAt
    toJSON: { virtuals: true }, // Include virtuals in JSON
    toObject: { virtuals: true },
  }
);

/**
 * Pre-save middleware
 * - Update the updatedAt timestamp
 */
resumeSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

/**
 * Virtual: Age of resume
 * Returns how long ago the resume was created
 */
resumeSchema.virtual('ageInDays').get(function () {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diff = now - created;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
});

/**
 * Instance method: Increment view count
 * Called when someone views the resume
 */
resumeSchema.methods.recordView = async function () {
  this.viewCount += 1;
  this.lastViewedAt = new Date();
  return this.save();
};

/**
 * Instance method: Get display data
 * Returns safe data for API responses
 */
resumeSchema.methods.toDisplay = function () {
  return {
    id: this._id,
    title: this.title,
    templateId: this.templateId,
    isPublic: this.isPublic,
    viewCount: this.viewCount,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    ageInDays: this.ageInDays,
    tags: this.tags,
  };
};

/**
 * Instance method: Get full resume with data
 * Used when retrieving complete resume
 */
resumeSchema.methods.toFull = function () {
  return {
    id: this._id,
    userId: this.userId,
    title: this.title,
    templateId: this.templateId,
    data: this.data,
    pdfUrl: this.pdfUrl,
    isPublic: this.isPublic,
    viewCount: this.viewCount,
    lastViewedAt: this.lastViewedAt,
    tags: this.tags,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

/**
 * Static method: Find by user and title
 * @param {string} userId - User ObjectId
 * @param {string} title - Resume title
 * @returns {Promise<Object>} - Resume document or null
 */
resumeSchema.statics.findByUserAndTitle = function (userId, title) {
  return this.findOne({
    userId: mongoose.Types.ObjectId(userId),
    title: title,
  });
};

/**
 * Static method: Find all public resumes
 * @returns {Promise<Array>} - Array of public resumes
 */
resumeSchema.statics.findPublic = function () {
  return this.find({ isPublic: true }).sort({ createdAt: -1 });
};

/**
 * Indexes for performance optimization
 */
resumeSchema.index({ userId: 1, createdAt: -1 }); // User's resumes sorted by date
resumeSchema.index({ userId: 1, isPublic: 1 }); // User's public resumes
resumeSchema.index({ isPublic: 1, createdAt: -1 }); // All public resumes
resumeSchema.index({ tags: 1 }); // Search by tags
resumeSchema.index({ templateId: 1 }); // Find resumes using specific template

module.exports = mongoose.model('Resume', resumeSchema);
