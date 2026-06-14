const router = require('express').Router();
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// GET /api/orders — all orders (filter by date, status)
router.get('/', protect, async (req, res) => {
  try {
    const { date, status, customer } = req.query;
    let filter = {};
    if (status) filter.status = status;
    if (customer) filter.customer = customer;
    if (date) {
      const start = new Date(date); start.setHours(0, 0, 0, 0);
      const end   = new Date(date); end.setHours(23, 59, 59, 999);
      filter.deliveryDate = { $gte: start, $lte: end };
    }
    const orders = await Order.find(filter)
      .populate('customer', 'name phone address area')
      .sort({ deliveryDate: 1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/orders/today — today's delivery list
router.get('/today', protect, async (req, res) => {
  try {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end   = new Date(); end.setHours(23, 59, 59, 999);
    const orders = await Order.find({
      deliveryDate: { $gte: start, $lte: end },
      status: { $ne: 'cancelled' }
    }).populate('customer', 'name phone address area notes');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/orders — create new order
router.post('/', protect, async (req, res) => {
  try {
    const order = await Order.create(req.body);
    await order.populate('customer', 'name phone address area');
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/orders/:id/status — update status
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status, paymentDone, paymentMode } = req.body;
    const update = {};
    if (status) update.status = status;
    if (paymentDone !== undefined) update.paymentDone = paymentDone;
    if (paymentMode) update.paymentMode = paymentMode;
    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('customer', 'name phone address area');
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/orders/:id — cancel order
router.delete('/:id', protect, async (req, res) => {
  try {
    await Order.findByIdAndUpdate(req.params.id, { status: 'cancelled' });
    res.json({ message: 'Order cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
