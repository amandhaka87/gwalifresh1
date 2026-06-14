const router = require('express').Router();
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// GET /api/delivery/list?date=2025-06-14 — delivery list for a date
router.get('/list', protect, async (req, res) => {
  try {
    const date = req.query.date ? new Date(req.query.date) : new Date();
    const start = new Date(date); start.setHours(0, 0, 0, 0);
    const end   = new Date(date); end.setHours(23, 59, 59, 999);

    const orders = await Order.find({
      deliveryDate: { $gte: start, $lte: end },
      status: { $in: ['pending', 'out_for_delivery'] }
    }).populate('customer', 'name phone phone2 address area sector notes');

    // Group by area for easy delivery routing
    const grouped = {};
    orders.forEach(order => {
      const area = order.customer?.area || 'Other';
      if (!grouped[area]) grouped[area] = [];
      grouped[area].push(order);
    });

    res.json({
      date: date.toDateString(),
      totalOrders: orders.length,
      totalAmount: orders.reduce((sum, o) => sum + o.totalAmount, 0),
      grouped
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/delivery/:orderId/delivered — mark as delivered
router.put('/:orderId/delivered', protect, async (req, res) => {
  try {
    const { paymentMode, paymentDone } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status: 'delivered', paymentMode: paymentMode || 'cash', paymentDone: paymentDone ?? true },
      { new: true }
    ).populate('customer', 'name phone address area');
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/delivery/summary — today's summary stats
router.get('/summary', protect, async (req, res) => {
  try {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end   = new Date(); end.setHours(23, 59, 59, 999);

    const orders = await Order.find({ deliveryDate: { $gte: start, $lte: end } });
    const delivered  = orders.filter(o => o.status === 'delivered');
    const pending    = orders.filter(o => o.status === 'pending');
    const cancelled  = orders.filter(o => o.status === 'cancelled');
    const cashCollected = delivered.filter(o => o.paymentMode === 'cash' && o.paymentDone)
      .reduce((s, o) => s + o.totalAmount, 0);
    const upiCollected  = delivered.filter(o => o.paymentMode === 'upi' && o.paymentDone)
      .reduce((s, o) => s + o.totalAmount, 0);

    res.json({
      total: orders.length,
      delivered: delivered.length,
      pending: pending.length,
      cancelled: cancelled.length,
      totalRevenue: orders.reduce((s, o) => s + o.totalAmount, 0),
      cashCollected,
      upiCollected,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
