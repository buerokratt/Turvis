import { FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest, RouteHandler } from 'fastify';

import { analyze } from '../modules/analyzer/analyzer.module';

const API_URL = '/ruuter-incoming';

const handleRequest: RouteHandler = async (
  { raw, method, headers, query, body }: FastifyRequest,
  reply: FastifyReply,
) => {
  const path = raw.url?.replace(API_URL, '') ?? '';
  analyze(path, method, headers, query, body);
  reply.send({ code: 200, status: 'OK' });
};

export const incoming = {
  instance: (instance: FastifyInstance, options: FastifyPluginOptions, done: () => void) => {
    instance.get('*', handleRequest);
    instance.post('*', handleRequest);
    done();
  },
  path: API_URL,
};
