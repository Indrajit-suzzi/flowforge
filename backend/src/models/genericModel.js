import mongoose from "mongoose";
import bcrypt from 'bcryptjs';

const modelCache = {};

const getModel = (name, schemaDefinition) => {
  if (modelCache[name]) {
    return modelCache[name];
  }

  if (mongoose.models[name]) {
    modelCache[name] = mongoose.models[name];
    return modelCache[name];
  }

  const schema = new mongoose.Schema(
    {
      ...schemaDefinition,
      tenantId: {
        type: String,
        required: true,
      },
      status: {
        type: String,
        enum: ['draft', 'published', 'scheduled'],
        default: 'draft'
      },
      publishedAt: {
        type: Date
      },
      scheduledPublishAt: {
        type: Date
      },
      scheduledUnpublishAt: {
        type: Date
      },
      locale: {
        type: String,
        default: 'en'
      },
      translations: [{
        locale: { type: String, required: true },
        fields: { type: Map, of: mongoose.Schema.Types.Mixed }
      }],
      isDeleted: { type: Boolean, default: false },
      deletedAt: { type: Date },
      accessPassword: { type: String },
      notes: { type: String },
      tags: [{ type: String }],
      workflowStage: { type: String }
    },
    {
      timestamps: true,
    }
  );

  schema.pre('save', async function (next) {
    if (this.isModified('accessPassword') && this.accessPassword && !this.accessPassword.startsWith('$2a$') && !this.accessPassword.startsWith('$2b$')) {
      this.accessPassword = await bcrypt.hash(this.accessPassword, 10);
    }
    next();
  });

  schema.pre('findOneAndUpdate', async function (next) {
    const update = this.getUpdate();
    const password = update.accessPassword || update.$set?.accessPassword;
    if (password && typeof password === 'string' && !password.startsWith('$2a$') && !password.startsWith('$2b$')) {
      const hashed = await bcrypt.hash(password, 10);
      if (update.accessPassword) {
        update.accessPassword = hashed;
      } else {
        update.$set.accessPassword = hashed;
      }
    }
    next();
  });

  schema.index({ tenantId: 1, isDeleted: 1, createdAt: -1 });
  schema.index({ tenantId: 1, status: 1, publishedAt: -1 });
  schema.index({ tenantId: 1, scheduledPublishAt: 1 }, { sparse: true });
  schema.index({ tenantId: 1, scheduledUnpublishAt: 1 }, { sparse: true });
  schema.index({ tenantId: 1, tags: 1 });
  schema.index({ tenantId: 1, locale: 1 });
  schema.index({ tenantId: 1, workflowStage: 1 });
  schema.index({ slug: 1, tenantId: 1 }, { unique: true, sparse: true });

  const model = mongoose.model(name, schema);

  modelCache[name] = model;

  return model;
};

export const clearModelCache = (name) => {
  delete modelCache[name];
  delete mongoose.models[name];
  delete mongoose.modelSchemas[name];
};

export default getModel;