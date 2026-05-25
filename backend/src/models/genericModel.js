import mongoose from "mongoose";

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


  const model = mongoose.model(name, schema);

  modelCache[name] = model;

  return model;
};

export default getModel;