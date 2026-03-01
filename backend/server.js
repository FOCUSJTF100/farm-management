const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/livestock', require('./routes/livestock'));
app.use('/api/crops', require('./routes/crops'));
app.use('/api/finances', require('./routes/finances'));
app.use('/api/workers', require('./routes/workers'));

app.get('/', (req, res) => res.json({ message: 'Farm API running' }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () => console.log(`Server on port ${process.env.PORT}`));
  })
  .catch(err => { console.error('DB error:', err); process.exit(1); });
