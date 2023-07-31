import { config } from './app/config';
config.load(process.env.NODE_ENV || 'dev');
import { bootstrap } from './bootstrap';

const PORT = 8060;
const HOST = '::';

export const app = bootstrap({ logger: true });
app.listen({ port: PORT, host: HOST }, (error, address: string) => {
  if (error) {
    console.error(error);
    process.exit(1);
  }
});
