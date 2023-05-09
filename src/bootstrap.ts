import { IncomingMessage, Server, ServerResponse } from 'http';

import fastify, { FastifyInstance } from 'fastify';

import  { incoming } from './api/incoming';

export const bootstrap = (options = {}) => {
  const application: FastifyInstance<Server, IncomingMessage, ServerResponse> = fastify(options);

  application.route(incoming.get);
  application.route(incoming.post);

  return application;
};
