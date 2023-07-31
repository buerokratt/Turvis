import { IncomingHttpHeaders } from 'http';

import { FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest } from 'fastify';

import { ExecutionResult } from '../modules/regex/execute';
import { PatternInfo } from '../modules/regex/lookup';
import { expressions } from '../modules/regex/regex.module';

export const REGEX_API_URL = '/regex';

const regexHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const { body }: { headers: IncomingHttpHeaders; body: any } = request;
  const filePath = (request as any).params['*'];
  const params: Map<string, string> = request.query as any;

  try {
    let passedParams: any = params;
    if (params && passedParams['params']) {
      passedParams = passedParams['params'];
    }
    const pattern: PatternInfo = expressions.lookup(filePath, passedParams);
    const result: ExecutionResult = expressions.execute(body, pattern);

    if (result.error) {
      throw new Error(result.error);
    }
    reply.code(200).send({ content: body, result: result.result });
  } catch (error) {
    reply.code(400).send((error as any).message);
  }
};

export const regex = {
  instance: (instance: FastifyInstance, options: FastifyPluginOptions, done: () => void) => {
    instance.post('*', regexHandler);
    done();
  },
  path: REGEX_API_URL,
};
