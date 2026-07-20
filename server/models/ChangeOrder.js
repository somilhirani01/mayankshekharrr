const mongoose = require('mongoose');

const changeOrderSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClientRequest',
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    estimatedHours: {
      type: Number,
      required: true,
      min: 0.01,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    isBlocking: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['draft', 'sent', 'approved', 'declined'],
      default: 'draft',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

module.exports = mongoose.model('ChangeOrder', changeOrderSchema);
