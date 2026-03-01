const router = require('express').Router();
const Crop = require('../models/Crop');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const q = {};
    if (req.query.type) q.type = req.query.type;
    if (req.query.status) q.status = req.query.status;
    if (req.query.search) q.$or = [{ name: { $regex: req.query.search, $options: 'i' } }, { fieldName: { $regex: req.query.search, $options: 'i' } }];
    res.json(await Crop.find(q).sort({ createdAt: -1 }));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/stats', async (req, res) => {
  try {
    const total = await Crop.countDocuments();
    const byStatus = await Crop.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    const acres = await Crop.aggregate([{ $group: { _id: null, total: { $sum: '$fieldSize' } } }]);
    res.json({ total, byStatus, totalAcres: acres[0]?.total || 0 });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', async (req, res) => {
  try { res.status(201).json(await new Crop(req.body).save()); }
  catch (e) { res.status(400).json({ message: e.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const item = await Crop.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Not found' });
    res.json(item);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    if (!await Crop.findByIdAndDelete(req.params.id)) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
