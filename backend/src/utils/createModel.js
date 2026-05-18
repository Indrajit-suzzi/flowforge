import mongoose from "mongoose";

const models = {};

const createModel = (name, schemaDefinition) => {
  if (models[name]) return models[name];

  const schema = new mongoose.Schema({
    ...schemaDefinition,
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    publishedAt: { type: Date }
  }, { timestamps: true });
  
  models[name] = mongoose.model(name, schema);

  return models[name];
};

export default createModel;