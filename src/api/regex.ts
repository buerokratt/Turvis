import { IncomingHttpHeaders } from 'http';

import { FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest } from 'fastify';

import { PatternInfo } from '../modules/regex/lookup';
import { expressions } from '../modules/regex/regex.module';
import { logger } from '../app/logger';
import { config } from '../app/config';
import { ExecutionResult } from 'src/modules/regex/execute';

export const REGEX_API_URL = config.get().turvis.DSL.regex.endpoint;

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

    if (result.error || result.result === false) {
      logger.debug('unable to match ' + body + '. against pattern: ' + pattern.pattern.toString());
      result.result = false;
      reply.code(400).send(result);
    }
    reply.code(200).send({ content: body, result: result.result });
  } catch (error) {
    logger.debug("Failed to execute regex against '" + body + '": ' + (error as any).message);
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
