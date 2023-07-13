import { IncomingMessage, Server, ServerResponse } from 'http';

import fastify, { FastifyInstance } from 'fastify';
import { incoming } from './api/incoming';
import { regex } from './api/regex';
import { responseOverride } from './app/middleware/responseOverride';

export const bootstrap = (options = {}) => {
  const application: FastifyInstance<Server, IncomingMessage, ServerResponse> = fastify(options);

  application.register(incoming.instance, { prefix: incoming.path });
  application.register(regex.instance, { prefix: regex.path });
  application.addHook('onSend', responseOverride);
  return application;
};
