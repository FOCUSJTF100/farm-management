const mongoose = require('mongoose');

module.exports = mongoose.model('Finance', new mongoose.Schema({
  type:          { type: String, required: true, enum: ['Income','Expense'] },
  category:      { type: String, required: true },
  amount:        { type: Number, required: true },
  description:   { type: String },
  date:          { type: Date, required: true, default: Date.now },
  paymentMethod: { type: String, enum: ['Cash','Bank Transfer','Mobile Money','Cheque','Other'], default: 'Cash' },
  reference:     { type: String }
}, { timestamps: true }));
