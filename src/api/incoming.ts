import { FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest, RouteHandler, ValidationResult } from 'fastify';

import { httpAnalyzer } from '../modules/analyzer/analyzer.module';
import { config } from '../app/config';

const API_URL = '/ruuter-incoming';

const handleRequest: RouteHandler = async (
  { raw, method, headers, query, body }: FastifyRequest,
  reply: FastifyReply,
) => {
  const path = raw.url?.replace(API_URL, '') ?? '';
  const results = httpAnalyzer.analyze({ path, method, headers, query, body });

  const response = config.get().turvis.DSL.http.output === false ? {
    status: results.status
  } :
    results;

  if (results.status === 'failure') {
    reply.code(400).send(response);
  } else {
    reply.send(response);
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
