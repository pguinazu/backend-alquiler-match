const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  landlord: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tenantRequirement: { type: mongoose.Schema.Types.ObjectId, ref: 'Requirement', required: true },
  landlordRequirement: { type: mongoose.Schema.Types.ObjectId, ref: 'Requirement', required: true },
  matchScore: { type: Number, required: true }, // 0-100 based on compatibility
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Match', matchSchema);