const mongoose = require('mongoose');

const clientRequestSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    requestText: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 2000,
    },
    categoryTag: {
      type: String,
      default: null,
      lowercase: true,
      trim: true,
    },
    classification: {
      type: String,
      enum: ['in_scope', 'possible_extra', 'unclear'],
      required: true,
    },
    changeOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChangeOrder',
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

module.exports = mongoose.model('ClientRequest', clientRequestSchema);
