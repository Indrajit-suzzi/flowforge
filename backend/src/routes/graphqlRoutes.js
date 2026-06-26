import { createHandler } from 'graphql-http';
import { renderPlaygroundPage } from 'graphql-playground-html';
import { schema } from '../graphql/schema.js';
import { resolvers } from '../graphql/resolvers.js';

const handler = createHandler({
  schema,
  rootValue: resolvers,
  context: async (req) => ({ req: req.raw }),
  formatError: (err) => ({
    message: err.message,
    locations: err.locations,
    path: err.path,
  }),
});

export const graphqlHandler = async (req, res) => {
  if (process.env.NODE_ENV !== 'production' && req.method === 'GET' && req.headers.accept?.includes('text/html')) {
    res.setHeader('Content-Type', 'text/html');
    return res.end(renderPlaygroundPage({
      endpoint: '/api/v1/graphql',
      title: 'FlowForge GraphQL Playground',
    }));
  }
  await handler(req, res);
};
