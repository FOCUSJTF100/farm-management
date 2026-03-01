const router = require('express').Router();
const Livestock = require('../models/Livestock');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const q = {};
    if (req.query.type) q.type = req.query.type;
    if (req.query.healthStatus) q.healthStatus = req.query.healthStatus;
    if (req.query.search) q.name = { $regex: req.query.search, $options: 'i' };
    res.json(await Livestock.find(q).sort({ createdAt: -1 }));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/stats', async (req, res) => {
  try {
    const total = await Livestock.countDocuments();
    const byType = await Livestock.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]);
    const byHealth = await Livestock.aggregate([{ $group: { _id: '$healthStatus', count: { $sum: 1 } } }]);
    res.json({ total, byType, byHealth });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', async (req, res) => {
  try { res.status(201).json(await new Livestock(req.body).save()); }
  catch (e) { res.status(400).json({ message: e.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await Livestock.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    if (!await Livestock.findByIdAndDelete(req.params.id)) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
