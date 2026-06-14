const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  name:    { type: String, required: true, trim: true },
  phone:   { type: String, required: true, unique: true, trim: true },
  phone2:  { type: String, trim: true },
  address: { type: String, required: true },
  area:    { type: String, required: true }, // e.g. DLF Phase 2
  sector:  { type: String },
  notes:   { type: String }, // delivery instructions
  active:  { type: Boolean, default: true },
  joinedAt:{ type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Customer', CustomerSchema);
