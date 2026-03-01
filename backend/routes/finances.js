const router = require('express').Router();
const Finance = require('../models/Finance');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const q = {};
    if (req.query.type) q.type = req.query.type;
    res.json(await Finance.find(q).sort({ date: -1 }));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/stats', async (req, res) => {
  try {
    const income = await Finance.aggregate([{ $match: { type: 'Income' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]);
    const expense = await Finance.aggregate([{ $match: { type: 'Expense' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]);
    const totalIncome = income[0]?.total || 0;
    const totalExpense = expense[0]?.total || 0;
    res.json({ totalIncome, totalExpense, netProfit: totalIncome - totalExpense });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', async (req, res) => {
  try { res.status(201).json(await new Finance(req.body).save()); }
  catch (e) { res.status(400).json({ message: e.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await Finance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    if (!await Finance.findByIdAndDelete(req.params.id)) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
