import { bootstrap } from './bootstrap';

// pass in the port with configuration
const PORT = 8060;
const HOST = '::';

const app = bootstrap({ logger: true });
app.listen({ port: PORT, host: HOST }, (error, address) => {
  if (error) {
    console.error(error);
    process.exit(1);
  }
});
