const mongoose = require('mongoose');

const SubItemSchema = new mongoose.Schema({
  product:  { type: String, enum: ['milk', 'curd', 'paneer', 'lassi', 'buffalo_ghee', 'cow_ghee'] },
  quantity: { type: Number },
  unit:     { type: String },
  pricePerMonth: { type: Number },
}, { _id: false });

const SubscriptionSchema = new mongoose.Schema({
  customer:   { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  items:      [SubItemSchema],
  totalMonthlyAmount: { type: Number, required: true },
  startDate:  { type: Date, required: true },
  endDate:    { type: Date },
  status:     { type: String, enum: ['active', 'paused', 'cancelled', 'expired'], default: 'active' },
  freeDays:   { type: Number, default: 0 }, // for new subscriber 3 free days
  pausedFrom: { type: Date },
  pausedTill: { type: Date },
  notes:      { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Subscription', SubscriptionSchema);
