const environment = process.env.NODE_ENV || 'development';

import { config } from './app/config';
import { bootstrap } from './bootstrap';

// pass in the port with configuration
const PORT = 8060;
const HOST = '::';

const cfg = config.get();
const app = bootstrap({ logger: true });
app.decorate('config', cfg).listen({ port: PORT, host: HOST }, (error, address) => {
  if (error) {
    console.error(error);
    process.exit(1);
  }
});
