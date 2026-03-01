const router = require('express').Router();
const Worker = require('../models/Worker');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const q = {};
    if (req.query.role) q.role = req.query.role;
    if (req.query.status) q.status = req.query.status;
    if (req.query.search) q.$or = [{ firstName: { $regex: req.query.search, $options: 'i' } }, { lastName: { $regex: req.query.search, $options: 'i' } }];
    res.json(await Worker.find(q).sort({ createdAt: -1 }));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/stats', async (req, res) => {
  try {
    const total = await Worker.countDocuments();
    const active = await Worker.countDocuments({ status: 'Active' });
    const byRole = await Worker.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]);
    const payroll = await Worker.aggregate([{ $match: { status: 'Active', salaryPeriod: 'Monthly' } }, { $group: { _id: null, total: { $sum: '$salary' } } }]);
    res.json({ total, active, byRole, monthlyPayroll: payroll[0]?.total || 0 });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', async (req, res) => {
  try { res.status(201).json(await new Worker(req.body).save()); }
  catch (e) { res.status(400).json({ message: e.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await Worker.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    if (!await Worker.findByIdAndDelete(req.params.id)) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
