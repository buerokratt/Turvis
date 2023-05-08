import fastify from 'fastify';

// pass in the port with configuration
const PORT = 8060;
const HOST = '::';

const app = fastify({ logger: true });

app.get('/', async (_, response) => {
  response.send({ message: 'ok' });
});

app.listen({ port: PORT, host: HOST }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`Turvis is listening requests at ${address}`);
});
