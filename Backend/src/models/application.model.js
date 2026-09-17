const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'user', index: true },
  company: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true },
  status: { type: String, enum: ['Saved', 'Applied', 'Interview', 'Offer', 'Rejected', 'Withdrawn'], default: 'Saved' },
  deadline: { type: Date },
  notes: { type: String, trim: true, maxlength: 5000 },
  interviewReport: { type: mongoose.Schema.Types.ObjectId, ref: 'InterviewReport' }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
