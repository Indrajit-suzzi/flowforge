import { buildSchema } from 'graphql';

export const schema = buildSchema(`
  type Query {
    contentTypes: [ContentType!]!
    contentType(slug: String!): ContentType
    entries(contentTypeSlug: String!, status: String, locale: String, search: String): [Entry!]!
    entry(contentTypeSlug: String!, id: ID!, locale: String): Entry
    apiKeys: [ApiKey!]!
    me: User
    users: [User!]!
    media: [Media!]!
    docs: Docs!
  }

  type Mutation {
    createEntry(contentTypeSlug: String!, data: JSON!): Entry!
    updateEntry(contentTypeSlug: String!, id: ID!, data: JSON!): Entry!
    deleteEntry(contentTypeSlug: String!, id: ID!): DeleteResult!
    publishEntry(contentTypeSlug: String!, id: ID!): Entry!
    unpublishEntry(contentTypeSlug: String!, id: ID!): Entry!
    createApiKey(name: String!): ApiKeyCreateResult!
    revokeApiKey(id: ID!): DeleteResult!
    createContentType(name: String!, slug: String!, fields: [FieldInput!]!, locales: [String!]): ContentType!
    deleteContentType(id: ID!): DeleteResult!
  }

  scalar JSON

  type ContentType {
    _id: ID!
    tenantId: String!
    name: String!
    slug: String!
    fields: [Field!]!
    locales: [String!]
    createdAt: String!
    updatedAt: String!
  }

  type Field {
    name: String!
    type: String!
    required: Boolean!
    localizable: Boolean!
    refContentType: String
  }

  input FieldInput {
    name: String!
    type: String!
    required: Boolean
    localizable: Boolean
    refContentType: String
  }

  type Entry {
    _id: ID!
    tenantId: String
    status: String
    locale: String
    publishedAt: String
    scheduledPublishAt: String
    scheduledUnpublishAt: String
    createdAt: String
    updatedAt: String
    translations: JSON
  }

  type ApiKey {
    _id: ID!
    name: String!
    keyPreview: String!
    isActive: Boolean!
    createdAt: String!
  }

  type ApiKeyCreateResult {
    _id: ID!
    name: String!
    key: String!
    isActive: Boolean!
    createdAt: String!
  }

  type User {
    _id: ID!
    username: String!
    email: String!
    role: String!
    isActive: Boolean!
    createdAt: String!
  }

  type Media {
    _id: ID!
    originalName: String!
    url: String!
    type: String!
    size: Float!
    createdAt: String!
  }

  type DeleteResult {
    message: String!
  }

  type Docs {
    baseUrl: String!
    contentTypes: [ContentType!]!
  }
`);
