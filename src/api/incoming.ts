import { IncomingHttpHeaders } from 'http';

import { FastifyReply, FastifyRequest, RouteHandler, RouteOptions } from 'fastify';

import { analyze } from '../modules/analyzer/analyzer.module';

const getHandler: RouteHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const headers: IncomingHttpHeaders = request.headers;
  const queryParams = request.query;
  const pathParams = request.params;
  request.log.info('headers: %o', headers);
  request.log.info('query params: %o', queryParams);
  request.log.info('path params: %o', pathParams);
  analyze(headers, pathParams, undefined);
  reply.send({ code: 200, status: 'OK', content: { headers, pathParams, queryParams } });
};

const postHandler: RouteHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const headers: IncomingHttpHeaders = request.headers;
  const body = request.body;
  const pathParams = request.params;
  const queryParams = request.query;
  request.log.info('headers: %o', headers);
  request.log.info('query params: %o', queryParams);
  request.log.info('path params: %o', pathParams);
  request.log.info('body: %o', body);
  analyze(headers, undefined, body);
  reply.send({ code: 200, status: 'OK', content: { headers, pathParams, queryParams, body } });
};

const get: RouteOptions = {
  method: 'GET',
  url: '/ruuter-incoming*',
  schema: {
    querystring: {
      chat: { type: 'string' },
    },
  },
  handler: getHandler,
};

const post: RouteOptions = {
  method: 'POST',
  url: '/ruuter-incoming*',
  handler: postHandler,
};

export const incoming = {
  get,
  post,
};
