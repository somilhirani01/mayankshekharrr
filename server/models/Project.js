const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    freelancerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    clientName: {
      type: String,
      required: true,
      trim: true,
    },
    hourlyRate: {
      type: Number,
      required: true,
      min: 0.01,
    },
    portalToken: {
      type: String,
      required: true,
      unique: true,
      minlength: 48,
    },
    status: {
      type: String,
      enum: ['active', 'paused'],
      default: 'active',
    },
    totalPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalHours: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

module.exports = mongoose.model('Project', projectSchema);
