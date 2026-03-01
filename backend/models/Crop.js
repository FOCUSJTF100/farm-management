const mongoose = require('mongoose');

module.exports = mongoose.model('Crop', new mongoose.Schema({
  name:                { type: String, required: true },
  type:                { type: String, required: true, enum: ['Grain','Vegetable','Fruit','Legume','Tuber','Cash Crop','Other'] },
  fieldName:           { type: String, required: true },
  fieldSize:           { type: Number, required: true },
  plantingDate:        { type: Date, required: true },
  expectedHarvestDate: { type: Date },
  status:              { type: String, enum: ['Planted','Growing','Harvested','Failed'], default: 'Planted' },
  yieldAmount:         { type: Number },
  irrigationType:      { type: String, enum: ['Rain-fed','Drip','Sprinkler','Flood','None'], default: 'Rain-fed' },
  notes:               { type: String }
}, { timestamps: true }));
