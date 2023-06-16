import fastify from 'fastify';

import { config } from '../../app/config';

export const analyze = (path: string, method: string, headers: any, queryParams: any, body?: any) => {};

function executeRules(rules: any) {
  return {};
}

export function showSomething() {
  console.log(config.get());
}
