const Application = require('../models/application.model');
const InterviewReport = require('../models/interviewReport.model');

async function createApplication(req, res) {
  const { company, role, status, deadline, notes, interviewReport } = req.body;
  if (!company?.trim() || !role?.trim()) return res.status(400).json({ message: 'Company and role are required.' });

  if (interviewReport) {
    const report = await InterviewReport.findOne({ _id: interviewReport, user: req.user.id });
    if (!report) return res.status(404).json({ message: 'Interview report not found.' });
  }

  const application = await Application.create({
    user: req.user.id, company: company.trim(), role: role.trim(), status, deadline, notes, interviewReport
  });
  res.status(201).json({ message: 'Application saved successfully.', application });
}

async function getApplications(req, res) {
  const applications = await Application.find({ user: req.user.id })
    .populate('interviewReport', 'title matchScore createdAt')
    .sort({ deadline: 1, createdAt: -1 });
  res.json({ applications });
}

async function getApplication(req, res) {
  const application = await Application.findOne({ _id: req.params.id, user: req.user.id })
    .populate('interviewReport', 'title matchScore createdAt');
  if (!application) return res.status(404).json({ message: 'Application not found.' });
  res.json({ application });
}

async function updateApplication(req, res) {
  const allowed = ['company', 'role', 'status', 'deadline', 'notes', 'interviewReport'];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));

  if (updates.interviewReport) {
    const report = await InterviewReport.findOne({ _id: updates.interviewReport, user: req.user.id });
    if (!report) return res.status(404).json({ message: 'Interview report not found.' });
  }

  const application = await Application.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id }, updates, { new: true, runValidators: true }
  ).populate('interviewReport', 'title matchScore createdAt');
  if (!application) return res.status(404).json({ message: 'Application not found.' });
  res.json({ message: 'Application updated successfully.', application });
}

async function deleteApplication(req, res) {
  const deleted = await Application.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!deleted) return res.status(404).json({ message: 'Application not found.' });
  res.json({ message: 'Application deleted successfully.' });
}

module.exports = { createApplication, getApplications, getApplication, updateApplication, deleteApplication };
