import mongoose from 'mongoose';

const formSubmissionSchema = new mongoose.Schema({
  tenantId: { type: String, required: true },
  formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
  formSlug: { type: String, required: true },
  data: { type: Map, of: String },
  ipAddress: { type: String },
  userAgent: { type: String }
}, { timestamps: true });

formSubmissionSchema.index({ tenantId: 1, formId: 1, createdAt: -1 });

export default mongoose.model('FormSubmission', formSubmissionSchema);
