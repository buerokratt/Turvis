import { IncomingHttpHeaders } from 'http';

import { FastifyReply, FastifyRequest, RouteHandler, RouteOptions } from 'fastify';

import { analyze } from '../modules/analyzer/analyzer.module';

const endpointHandler: RouteHandler = async (request: FastifyRequest, response: FastifyReply) => {
  const headers: IncomingHttpHeaders = request.headers;
  const queryParams: any = request.params;
  const body: any = request.body;

  console.log('raw:', request.raw);
  console.log('raw headers:', request.raw.headers);
  console.log('raw url', request.raw.url);

  analyze(headers, queryParams, body);

  response.send({ code: 200, status: 'OK' });
};

export const endpoint: RouteOptions = {
  method: 'GET',
  url: '/*',
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
  handler: endpointHandler,
};
