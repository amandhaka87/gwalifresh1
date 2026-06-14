const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  product:  {
    type: String,
    enum: ['milk', 'curd', 'paneer', 'lassi', 'buffalo_ghee', 'cow_ghee'],
    required: true
  },
  quantity: { type: Number, required: true },
  unit:     { type: String }, // litre, 500g, 250g, kg
  price:    { type: Number, required: true },
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  customer:    { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  items:       [OrderItemSchema],
  totalAmount: { type: Number, required: true },
  deliveryDate:{ type: Date, required: true },
  status: {
    type: String,
    enum: ['pending', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentMode: { type: String, enum: ['cash', 'upi', 'pending'], default: 'pending' },
  paymentDone: { type: Boolean, default: false },
  notes:       { type: String },
  isSubscription: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
