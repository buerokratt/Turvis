import { IncomingMessage, Server, ServerResponse } from 'http';

import fastify, { FastifyInstance } from 'fastify';

import { endpoint } from './api/endpoint';

export const bootstrap = (options = {}) => {
  const application: FastifyInstance<Server, IncomingMessage, ServerResponse> = fastify(options);

  application.route(endpoint);

  return application;
};
