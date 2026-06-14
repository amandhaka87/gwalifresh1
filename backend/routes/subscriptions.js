const router = require('express').Router();
const Subscription = require('../models/Subscription');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

// GET /api/subscriptions — all subscriptions
router.get('/', protect, async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};
    if (status) filter.status = status;
    const subs = await Subscription.find(filter)
      .populate('customer', 'name phone address area')
      .sort({ createdAt: -1 });
    res.json(subs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/subscriptions — create subscription
router.post('/', protect, async (req, res) => {
  try {
    const sub = await Subscription.create(req.body);
    await sub.populate('customer', 'name phone address area');
    res.status(201).json(sub);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/subscriptions/:id/pause — pause subscription
router.put('/:id/pause', protect, async (req, res) => {
  try {
    const { pausedFrom, pausedTill } = req.body;
    const sub = await Subscription.findByIdAndUpdate(
      req.params.id,
      { status: 'paused', pausedFrom, pausedTill },
      { new: true }
    ).populate('customer', 'name phone');
    res.json(sub);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/subscriptions/:id/resume — resume subscription
router.put('/:id/resume', protect, async (req, res) => {
  try {
    const sub = await Subscription.findByIdAndUpdate(
      req.params.id,
      { status: 'active', pausedFrom: null, pausedTill: null },
      { new: true }
    ).populate('customer', 'name phone');
    res.json(sub);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/subscriptions/:id/cancel
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const sub = await Subscription.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled', endDate: new Date() },
      { new: true }
    ).populate('customer', 'name phone');
    res.json(sub);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/subscriptions/:id/generate-orders — generate today's orders from active subs
router.post('/generate-orders', protect, async (req, res) => {
  try {
    const today = new Date();
    const activeSubs = await Subscription.find({ status: 'active' })
      .populate('customer');

    let created = 0;
    for (const sub of activeSubs) {
      const totalAmount = sub.totalMonthlyAmount / 30;
      const orderItems = sub.items.map(i => ({
        product: i.product,
        quantity: i.quantity,
        unit: i.unit,
        price: i.pricePerMonth / 30
      }));
      await Order.create({
        customer: sub.customer._id,
        items: orderItems,
        totalAmount: Math.round(totalAmount),
        deliveryDate: today,
        isSubscription: true,
        status: 'pending'
      });
      created++;
    }
    res.json({ message: `✅ ${created} orders generated for today` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
