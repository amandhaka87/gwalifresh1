const router = require('express').Router();
const Customer = require('../models/Customer');
const { protect } = require('../middleware/auth');

// GET /api/customers — get all customers
router.get('/', protect, async (req, res) => {
  try {
    const { area, active, search } = req.query;
    let filter = {};
    if (area) filter.area = new RegExp(area, 'i');
    if (active !== undefined) filter.active = active === 'true';
    if (search) filter.$or = [
      { name: new RegExp(search, 'i') },
      { phone: new RegExp(search, 'i') },
      { address: new RegExp(search, 'i') }
    ];
    const customers = await Customer.find(filter).sort({ createdAt: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/customers/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/customers — add new customer
router.post('/', protect, async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json(customer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/customers/:id — update customer
router.put('/:id', protect, async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(customer);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/customers/:id — deactivate customer
router.delete('/:id', protect, async (req, res) => {
  try {
    await Customer.findByIdAndUpdate(req.params.id, { active: false });
    res.json({ message: 'Customer deactivated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
