const mongoose = require('mongoose');

module.exports = mongoose.model('Worker', new mongoose.Schema({
  firstName:      { type: String, required: true },
  lastName:       { type: String, required: true },
  phone:          { type: String },
  email:          { type: String },
  role:           { type: String, required: true, enum: ['Farm Manager','Field Worker','Livestock Keeper','Driver','Security','Other'] },
  employmentType: { type: String, enum: ['Full-time','Part-time','Seasonal','Contract'], default: 'Full-time' },
  salary:         { type: Number },
  salaryPeriod:   { type: String, enum: ['Daily','Weekly','Monthly'], default: 'Monthly' },
  startDate:      { type: Date, default: Date.now },
  status:         { type: String, enum: ['Active','Inactive','On Leave'], default: 'Active' },
  nationalId:     { type: String },
  address:        { type: String },
  notes:          { type: String }
}, { timestamps: true }));
