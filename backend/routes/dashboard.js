const router = require('express').Router();
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const Subscription = require('../models/Subscription');
const { protect } = require('../middleware/auth');

// GET /api/dashboard — main dashboard stats
router.get('/', protect, async (req, res) => {
  try {
    const now = new Date();
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end   = new Date(); end.setHours(23, 59, 59, 999);

    // This month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalCustomers,
      activeCustomers,
      todayOrders,
      monthOrders,
      activeSubscriptions,
      todayRevenue,
      monthRevenue
    ] = await Promise.all([
      Customer.countDocuments(),
      Customer.countDocuments({ active: true }),
      Order.countDocuments({ deliveryDate: { $gte: start, $lte: end }, status: { $ne: 'cancelled' } }),
      Order.countDocuments({ deliveryDate: { $gte: monthStart }, status: { $ne: 'cancelled' } }),
      Subscription.countDocuments({ status: 'active' }),
      Order.aggregate([
        { $match: { deliveryDate: { $gte: start, $lte: end }, status: 'delivered' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Order.aggregate([
        { $match: { deliveryDate: { $gte: monthStart }, status: 'delivered' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
    ]);

    res.json({
      customers: { total: totalCustomers, active: activeCustomers },
      orders: { today: todayOrders, thisMonth: monthOrders },
      subscriptions: { active: activeSubscriptions },
      revenue: {
        today: todayRevenue[0]?.total || 0,
        thisMonth: monthRevenue[0]?.total || 0
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
