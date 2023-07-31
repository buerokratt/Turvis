import { FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest, RouteHandler } from 'fastify';

import { httpAnalyzer } from '../modules/analyzer/analyzer.module';

const API_URL = '/ruuter-incoming';

const handleRequest: RouteHandler = async (
  { raw, method, headers, query, body }: FastifyRequest,
  reply: FastifyReply,
) => {
  const path = raw.url?.replace(API_URL, '') ?? '';
  const results = httpAnalyzer.analyze({ path, method, headers, query, body });
  if (results.status === 'failure') {
    reply.code(400).send(results);
  } else {
    reply.send(results);
  }
};

export const incoming = {
  instance: (instance: FastifyInstance, options: FastifyPluginOptions, done: () => void) => {
    instance.get('*', handleRequest);
    instance.post('*', handleRequest);
    done();
  },
  path: API_URL,
};
