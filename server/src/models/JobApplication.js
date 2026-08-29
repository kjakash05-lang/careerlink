const mongoose = require('mongoose');

const JobApplicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resume: {
      url: { type: String, required: true },
      fileName: { type: String },
      fileSize: { type: Number },
    },
    coverNote: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected'],
      default: 'Applied',
    },
    statusHistory: [
      {
        status: {
          type: String,
          enum: ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected'],
        },
        date: { type: Date, default: Date.now },
        notes: { type: String },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    recruiterNotes: {
      type: String,
      default: '',
    },
    interviewSchedule: {
      date: { type: Date },
      meetingLink: { type: String },
      instructions: { type: String },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Prevent applicant from applying twice to the same job
JobApplicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
JobApplicationSchema.index({ job: 1, status: 1 });
JobApplicationSchema.index({ applicant: 1, createdAt: -1 });

module.exports = mongoose.model('JobApplication', JobApplicationSchema);
