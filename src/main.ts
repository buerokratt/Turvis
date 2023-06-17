import { config } from './app/config';
import { bootstrap } from './bootstrap';

const environment = process.env.NODE_ENV || 'dev';

const cfg = config.get(environment);

const PORT = 8060;
const HOST = '::';

export const app = bootstrap({ logger: true });
app.decorate('config', cfg).listen({ port: PORT, host: HOST }, (error, address) => {
  if (error) {
    console.error(error);
    process.exit(1);
  }
});
