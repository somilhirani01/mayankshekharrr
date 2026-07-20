const mongoose = require('mongoose');

const scopeItemSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    categoryTag: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    estimatedHours: {
      type: Number,
      required: true,
      min: 0.01,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

module.exports = mongoose.model('ScopeItem', scopeItemSchema);
