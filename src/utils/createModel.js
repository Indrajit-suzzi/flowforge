import mongoose from "mongoose";

const models = {};

const createModel = (name, schemaDefinition) => {
  if (models[name]) return models[name];

  const schema = new mongoose.Schema(schemaDefinition, { timestamps: true });
  models[name] = mongoose.model(name, schema);

  return models[name];
};

export default createModel;
