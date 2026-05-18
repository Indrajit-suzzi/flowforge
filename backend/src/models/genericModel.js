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
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft'
      },
      publishedAt: {
        type: Date
      }
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