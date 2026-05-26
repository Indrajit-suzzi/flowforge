import Joi from 'joi';

export const registerSchema = Joi.object({
  username: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(128).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const createContentTypeSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  slug: Joi.string().min(1).max(100).pattern(/^[a-z0-9-]+$/).required(),
  fields: Joi.array().items(Joi.object({
    name: Joi.string().min(1).required(),
    type: Joi.string().valid('String', 'Number', 'Date', 'Boolean', 'RichText', 'Reference').required(),
    required: Joi.boolean(),
    localizable: Joi.boolean(),
    refContentType: Joi.string().when('type', { is: 'Reference', then: Joi.required(), otherwise: Joi.optional() }),
    minLength: Joi.number().integer().min(0),
    maxLength: Joi.number().integer().min(0),
    min: Joi.any(),
    max: Joi.any(),
    defaultValue: Joi.any(),
  })).min(1).required(),
  locales: Joi.array().items(Joi.string().min(2)),
  cacheTTL: Joi.number().integer().min(0).max(86400),
  workflowEnabled: Joi.boolean(),
  workflowStages: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    color: Joi.string().pattern(/^#[0-9a-fA-F]{6}$/),
  })),
});

export const updateContentTypeSchema = Joi.object({
  name: Joi.string().min(1).max(100),
  slug: Joi.string().min(1).max(100).pattern(/^[a-z0-9-]+$/),
  fields: Joi.array().items(Joi.object({
    name: Joi.string().min(1).required(),
    type: Joi.string().valid('String', 'Number', 'Date', 'Boolean', 'RichText', 'Reference').required(),
    required: Joi.boolean(),
    localizable: Joi.boolean(),
    refContentType: Joi.string().when('type', { is: 'Reference', then: Joi.required(), otherwise: Joi.optional() }),
    minLength: Joi.number().integer().min(0),
    maxLength: Joi.number().integer().min(0),
    min: Joi.any(),
    max: Joi.any(),
    defaultValue: Joi.any(),
  })).min(1),
  locales: Joi.array().items(Joi.string().min(2)),
  cacheTTL: Joi.number().integer().min(0).max(86400),
  workflowEnabled: Joi.boolean(),
  workflowStages: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    color: Joi.string().pattern(/^#[0-9a-fA-F]{6}$/),
  })),
}).min(1);

export const createRoleSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  slug: Joi.string().min(1).max(100).pattern(/^[a-z0-9-]+$/).required(),
  description: Joi.string().max(500),
  permissions: Joi.object({
    contentTypes: Joi.boolean(),
    contentEntries: Joi.boolean(),
    apiKeys: Joi.boolean(),
    analytics: Joi.boolean(),
    auditLogs: Joi.boolean(),
    webhooks: Joi.boolean(),
    mediaLibrary: Joi.boolean(),
    userManagement: Joi.boolean(),
    systemSettings: Joi.boolean(),
    roles: Joi.boolean(),
    branding: Joi.boolean(),
  }),
});

export const createWebhookSchema = Joi.object({
  name: Joi.string().min(1).max(200).required(),
  url: Joi.string().uri().required(),
  events: Joi.array().items(Joi.string()).min(1).required(),
  secret: Joi.string().min(16).max(256).required(),
  contentType: Joi.string().allow(''),
  isActive: Joi.boolean(),
  maxRetries: Joi.number().integer().min(0).max(10),
  retryDelayMs: Joi.number().integer().min(1000).max(3600000),
  conditions: Joi.array().items(Joi.object({
    field: Joi.string().required(),
    operator: Joi.string().valid('equals', 'not_equals', 'contains', 'exists', 'not_exists').required(),
    value: Joi.any(),
  })),
});

export const updateWebhookSchema = Joi.object({
  name: Joi.string().min(1).max(200),
  url: Joi.string().uri(),
  events: Joi.array().items(Joi.string()).min(1),
  secret: Joi.string().min(16).max(256),
  contentType: Joi.string().allow(''),
  isActive: Joi.boolean(),
  maxRetries: Joi.number().integer().min(0).max(10),
  retryDelayMs: Joi.number().integer().min(1000).max(3600000),
  conditions: Joi.array().items(Joi.object({
    field: Joi.string().required(),
    operator: Joi.string().valid('equals', 'not_equals', 'contains', 'exists', 'not_exists').required(),
    value: Joi.any(),
  })),
}).min(1);