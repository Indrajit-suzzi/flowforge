import mongoose from 'mongoose';

const formSchema = new mongoose.Schema({
  tenantId: { type: String, required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true },
  description: { type: String, default: '' },
  fields: [{
    name: { type: String, required: true },
    type: { type: String, enum: ['text', 'textarea', 'email', 'number', 'select', 'checkbox', 'radio', 'file'], required: true },
    label: { type: String, required: true },
    placeholder: { type: String, default: '' },
    required: { type: Boolean, default: false },
    options: [{ type: String }],
    order: { type: Number, default: 0 }
  }],
  submitButtonText: { type: String, default: 'Submit' },
  successMessage: { type: String, default: 'Thank you for your submission!' },
  notificationEmail: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  submissionCount: { type: Number, default: 0 }
}, { timestamps: true });

formSchema.index({ tenantId: 1, slug: 1 }, { unique: true });

const Form = mongoose.models.Form || mongoose.model('Form', formSchema);
export default Form;
