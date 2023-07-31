import { FastifyReply, FastifyRequest } from 'fastify';
import { config } from '../config';
import { isNumber } from '../../utils/typeUtils';

export function responseOverride(request: FastifyRequest, reply: FastifyReply, payload: any, done: () => void): void {
  const override = config.get().turvis.application.finalResponseCode.override;
  if (override !== undefined && override !== false && isNumber(override)) {
    reply.code(override as number);
  }
  done();
}
