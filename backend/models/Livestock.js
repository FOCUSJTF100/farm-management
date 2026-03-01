const mongoose = require('mongoose');

module.exports = mongoose.model('Livestock', new mongoose.Schema({
  name:          { type: String, required: true },
  type:          { type: String, required: true, enum: ['Cattle','Goat','Sheep','Pig','Poultry','Horse','Other'] },
  breed:         { type: String },
  gender:        { type: String, enum: ['Male','Female','Unknown'], default: 'Unknown' },
  age:           { type: Number },
  weight:        { type: Number },
  healthStatus:  { type: String, enum: ['Healthy','Sick','Under Treatment','Quarantined'], default: 'Healthy' },
  tagNumber:     { type: String },
  estimatedValue:{ type: Number },
  notes:         { type: String }
}, { timestamps: true }));
