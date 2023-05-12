import { IncomingHttpHeaders } from 'http';

import { FastifyReply, FastifyRequest, RouteHandler, RouteOptions } from 'fastify';

import { analyze } from '../modules/analyzer/analyzer.module';

const getHandler: RouteHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const headers: IncomingHttpHeaders = request.headers;
  const queryParams = request.query;
  analyze(headers, queryParams, null);
  reply.send({ code: 200, status: 'OK'});
};

const postHandler: RouteHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const headers: IncomingHttpHeaders = request.headers;
  const body = request.body;
  const queryParams = request.query;
  analyze(headers, queryParams, body);
  reply.send({ code: 200, status: 'OK'});
};

const get: RouteOptions = {
  method: 'GET',
  url: '/ruuter-incoming*',
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
