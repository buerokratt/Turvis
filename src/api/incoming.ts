import { IncomingHttpHeaders } from 'http';

import { FastifyReply, FastifyRequest, RouteHandler, RouteOptions } from 'fastify';

import { analyze } from '../modules/analyzer/analyzer.module';

const getHandler: RouteHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const headers: IncomingHttpHeaders = request.headers;
  const queryParams = request.params;
  request.log.info('raw:', request.raw);
  request.log.info('raw headers:', request.raw.headers);
  request.log.info('params:', request.params);

  analyze(headers, queryParams, undefined);

  reply.send({ code: 200, status: 'OK' });
};

const postHandler: RouteHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const headers: IncomingHttpHeaders = request.headers;
  const body = request.body;
  request.log.info('raw:', request.raw);
  request.log.info('raw headers:', request.raw.headers);
  request.log.info('params:', request.params);
  analyze(headers, undefined, body);
  reply.send({ code: 200, status: 'OK' });
};

const get: RouteOptions = {
  method: 'GET',
  url: '/ruuter-incoming',
  schema: {
    querystring: {},
    response: {
      200: {
        type: 'object',
        properties: {
          code: { type: 'number' },
          status: { type: 'string' },
        },
      },
    },
  },
  handler: getHandler,
};

const post: RouteOptions = {
  method: 'POST',
  url: '/ruuter-incoming',
  schema: {
    querystring: {},
    response: {
      200: {
        type: 'object',
        properties: {
          code: { type: 'number' },
          status: { type: 'string' },
        },
      },
    },
  },
  handler: postHandler,
};

export const incoming = {
  get,
  post,
};
